import type { WebSocketServer, WebSocket } from 'ws';

export interface ServerChallengeQuestion {
  id: string;
  subject: 'biology' | 'chemistry' | 'physics';
  topicCode: string;
  topicTitle?: string;
  syllabusRef?: string;
  tier?: 'Core' | 'Extended';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PlayerQuestionOutcome {
  uid: string;
  name: string;
  optionIndex: number | null;
  isCorrect: boolean;
  pointsEarned: number;
  basePoints: number;
  speedBonus: number;
  elapsedMs: number;
  timedOut: boolean;
  submittedAt: number;
}

export interface ChallengeRoundSummary {
  questionIndex: number;
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicCode: string;
  outcomes: Record<string, PlayerQuestionOutcome>;
  cumulativeScores: Record<string, number>;
}

export type ChallengeLivePhase = 'waiting' | 'countdown' | 'question' | 'reveal' | 'completed' | 'cancelled';

interface AttachedChallengeSocket extends WebSocket {
  uid?: string;
  challengeId?: string;
  isAlivePing?: boolean;
}

interface LiveChallengeRoom {
  challengeId: string;
  classId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  tier: 'Core' | 'Extended';
  topics: string[];
  questions: ServerChallengeQuestion[];
  phase: ChallengeLivePhase;
  currentQuestionIndex: number;
  questionDurationMs: number;
  revealDurationMs: number;
  countdownEndsAt: number | null;
  questionStartedAt: number | null;
  questionEndsAt: number | null;
  revealEndsAt: number | null;
  scores: Record<string, number>;
  connectedUids: Set<string>;
  readyNextUids: Set<string>;
  answersByQuestion: Record<number, Record<string, PlayerQuestionOutcome>>;
  roundHistory: ChallengeRoundSummary[];
  winnerId: string | null;
  forfeitedBy: string | null;
  phaseTimer: ReturnType<typeof setTimeout> | null;
  cleanupTimer: ReturnType<typeof setTimeout> | null;
  sockets: Set<AttachedChallengeSocket>;
}

const QUESTION_DURATION_MS = 20000;
const COUNTDOWN_DURATION_MS = 3000;
const REVEAL_DURATION_MS = 4500;
const ROOM_IDLE_CLEANUP_MS = 5 * 60 * 1000;

const rooms = new Map<string, LiveChallengeRoom>();

function clearRoomTimers(room: LiveChallengeRoom) {
  if (room.phaseTimer) {
    clearTimeout(room.phaseTimer);
    room.phaseTimer = null;
  }
  if (room.cleanupTimer) {
    clearTimeout(room.cleanupTimer);
    room.cleanupTimer = null;
  }
}

function scheduleRoomCleanup(room: LiveChallengeRoom) {
  if (room.cleanupTimer) {
    clearTimeout(room.cleanupTimer);
  }
  room.cleanupTimer = setTimeout(() => {
    clearRoomTimers(room);
    rooms.delete(room.challengeId);
  }, ROOM_IDLE_CLEANUP_MS);
}

function buildClientState(room: LiveChallengeRoom, viewerUid?: string) {
  const idx = room.currentQuestionIndex;
  const activeQ = room.questions[idx] || null;
  const currentAnswers = room.answersByQuestion[idx] || {};
  const answeredUids = Object.keys(currentAnswers);

  const sanitizedActiveQuestion = activeQ
    ? {
        id: activeQ.id,
        subject: activeQ.subject,
        topicCode: activeQ.topicCode,
        topicTitle: activeQ.topicTitle,
        syllabusRef: activeQ.syllabusRef,
        tier: activeQ.tier,
        question: activeQ.question,
        options: activeQ.options,
        ...(room.phase === 'reveal' || room.phase === 'completed'
          ? {
              correctIndex: activeQ.correctIndex,
              explanation: activeQ.explanation
            }
          : {})
      }
    : null;

  // During 'question' phase, only expose the viewer's own locked-in choice (never the opponent's choice or correctIndex!)
  const mySubmission = viewerUid && currentAnswers[viewerUid]
    ? {
        optionIndex: currentAnswers[viewerUid].optionIndex,
        isCorrect: currentAnswers[viewerUid].isCorrect,
        pointsEarned: currentAnswers[viewerUid].pointsEarned,
        basePoints: currentAnswers[viewerUid].basePoints,
        speedBonus: currentAnswers[viewerUid].speedBonus,
        elapsedMs: currentAnswers[viewerUid].elapsedMs
      }
    : null;

  const revealOutcomes =
    room.phase === 'reveal' || room.phase === 'completed'
      ? currentAnswers
      : undefined;

  return {
    type: 'challenge_state',
    serverNow: Date.now(),
    challengeId: room.challengeId,
    classId: room.classId,
    challengerId: room.challengerId,
    challengerName: room.challengerName,
    challengedId: room.challengedId,
    challengedName: room.challengedName,
    tier: room.tier,
    topics: room.topics,
    totalQuestions: room.questions.length,
    phase: room.phase,
    currentQuestionIndex: room.currentQuestionIndex,
    questionDurationMs: room.questionDurationMs,
    revealDurationMs: room.revealDurationMs,
    countdownEndsAt: room.countdownEndsAt,
    questionStartedAt: room.questionStartedAt,
    questionEndsAt: room.questionEndsAt,
    revealEndsAt: room.revealEndsAt,
    scores: {
      [room.challengerId]: room.scores[room.challengerId] || 0,
      [room.challengedId]: room.scores[room.challengedId] || 0
    },
    connectedUids: Array.from(room.connectedUids),
    answeredUids,
    readyNextUids: Array.from(room.readyNextUids),
    currentQuestion: sanitizedActiveQuestion,
    mySubmission,
    revealOutcomes,
    roundHistory: room.roundHistory,
    winnerId: room.winnerId,
    forfeitedBy: room.forfeitedBy
  };
}

function broadcastRoomState(room: LiveChallengeRoom) {
  for (const sock of room.sockets) {
    if (sock.readyState === 1 /* WebSocket.OPEN */) {
      try {
        sock.send(JSON.stringify(buildClientState(room, sock.uid)));
      } catch {}
    }
  }
}

function beginCountdown(room: LiveChallengeRoom) {
  if (room.phase !== 'waiting') return;
  clearRoomTimers(room);
  room.phase = 'countdown';
  room.countdownEndsAt = Date.now() + COUNTDOWN_DURATION_MS;
  broadcastRoomState(room);

  room.phaseTimer = setTimeout(() => {
    startQuestion(room, 0);
  }, COUNTDOWN_DURATION_MS);
}

function startQuestion(room: LiveChallengeRoom, idx: number) {
  if (idx < 0 || idx >= room.questions.length) {
    completeMatch(room);
    return;
  }
  clearRoomTimers(room);
  room.phase = 'question';
  room.currentQuestionIndex = idx;
  room.countdownEndsAt = null;
  room.revealEndsAt = null;
  room.questionStartedAt = Date.now();
  room.questionEndsAt = room.questionStartedAt + room.questionDurationMs;
  room.readyNextUids.clear();
  if (!room.answersByQuestion[idx]) {
    room.answersByQuestion[idx] = {};
  }

  broadcastRoomState(room);

  room.phaseTimer = setTimeout(() => {
    finalizeQuestionReveal(room, idx);
  }, room.questionDurationMs);
}

function finalizeQuestionReveal(room: LiveChallengeRoom, idx: number) {
  if (room.phase !== 'question' || room.currentQuestionIndex !== idx) return;
  clearRoomTimers(room);

  const q = room.questions[idx];
  const answers = room.answersByQuestion[idx] || (room.answersByQuestion[idx] = {});
  const participants = [
    { uid: room.challengerId, name: room.challengerName },
    { uid: room.challengedId, name: room.challengedName }
  ];

  for (const p of participants) {
    if (!answers[p.uid]) {
      answers[p.uid] = {
        uid: p.uid,
        name: p.name,
        optionIndex: null,
        isCorrect: false,
        pointsEarned: 0,
        basePoints: 0,
        speedBonus: 0,
        elapsedMs: room.questionDurationMs,
        timedOut: true,
        submittedAt: Date.now()
      };
    }
  }

  const cumulativeSnapshot: Record<string, number> = {
    [room.challengerId]: room.scores[room.challengerId] || 0,
    [room.challengedId]: room.scores[room.challengedId] || 0
  };

  const existingSummaryIdx = room.roundHistory.findIndex(r => r.questionIndex === idx);
  const summary: ChallengeRoundSummary = {
    questionIndex: idx,
    questionId: q.id,
    questionText: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    topicCode: q.topicCode,
    outcomes: { ...answers },
    cumulativeScores: cumulativeSnapshot
  };
  if (existingSummaryIdx >= 0) {
    room.roundHistory[existingSummaryIdx] = summary;
  } else {
    room.roundHistory.push(summary);
  }

  room.phase = 'reveal';
  room.revealEndsAt = Date.now() + room.revealDurationMs;
  room.readyNextUids.clear();
  broadcastRoomState(room);

  room.phaseTimer = setTimeout(() => {
    advanceAfterReveal(room);
  }, room.revealDurationMs);
}

function advanceAfterReveal(room: LiveChallengeRoom) {
  if (room.phase !== 'reveal') return;
  clearRoomTimers(room);
  const nextIdx = room.currentQuestionIndex + 1;
  if (nextIdx < room.questions.length) {
    startQuestion(room, nextIdx);
  } else {
    completeMatch(room);
  }
}

function completeMatch(room: LiveChallengeRoom) {
  clearRoomTimers(room);
  room.phase = 'completed';
  room.questionEndsAt = null;
  room.revealEndsAt = null;
  room.countdownEndsAt = null;

  const s1 = room.scores[room.challengerId] || 0;
  const s2 = room.scores[room.challengedId] || 0;
  if (!room.winnerId) {
    if (s1 > s2) room.winnerId = room.challengerId;
    else if (s2 > s1) room.winnerId = room.challengedId;
    else room.winnerId = 'draw';
  }

  broadcastRoomState(room);
  scheduleRoomCleanup(room);
}

export function attachChallengeWebSocketHandlers(wss: WebSocketServer) {
  const heartbeatInterval = setInterval(() => {
    for (const room of rooms.values()) {
      for (const client of room.sockets) {
        if (client.isAlivePing === false) {
          room.sockets.delete(client);
          try {
            client.terminate();
          } catch {}
          continue;
        }
        client.isAlivePing = false;
        try {
          client.ping();
        } catch {}
      }
    }
  }, 20000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    for (const room of rooms.values()) {
      clearRoomTimers(room);
    }
    rooms.clear();
  });

  wss.on('connection', (rawWs: WebSocket) => {
    const ws = rawWs as AttachedChallengeSocket;
    ws.isAlivePing = true;

    ws.on('pong', () => {
      ws.isAlivePing = true;
    });

    ws.on('message', (rawBuf) => {
      let msg: any;
      try {
        msg = JSON.parse(rawBuf.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg.type !== 'string') return;

      switch (msg.type) {
        case 'join_challenge': {
          const challengeId = typeof msg.challengeId === 'string' ? msg.challengeId.trim() : '';
          const uid = typeof msg.uid === 'string' ? msg.uid.trim() : '';
          if (!challengeId || !uid) return;

          let room = rooms.get(challengeId);
          if (!room) {
            const challengerId = typeof msg.challengerId === 'string' ? msg.challengerId.trim() : '';
            const challengedId = typeof msg.challengedId === 'string' ? msg.challengedId.trim() : '';
            const questions = Array.isArray(msg.questions) ? msg.questions : [];
            if (!challengerId || !challengedId || questions.length === 0) {
              ws.send(JSON.stringify({ type: 'challenge_error', message: 'Missing match configuration or questions.' }));
              return;
            }
            if (uid !== challengerId && uid !== challengedId) {
              ws.send(JSON.stringify({ type: 'challenge_error', message: 'Not a participant in this challenge.' }));
              return;
            }

            room = {
              challengeId,
              classId: typeof msg.classId === 'string' ? msg.classId : '',
              challengerId,
              challengerName: typeof msg.challengerName === 'string' ? msg.challengerName : 'Challenger',
              challengedId,
              challengedName: typeof msg.challengedName === 'string' ? msg.challengedName : 'Opponent',
              tier: msg.tier === 'Core' ? 'Core' : 'Extended',
              topics: Array.isArray(msg.topics) ? msg.topics.slice(0, 33).map(String) : [],
              questions: questions.slice(0, 30).map((q: any, idx: number) => ({
                id: String(q.id || `q-${idx + 1}`),
                subject: (q.subject === 'biology' || q.subject === 'chemistry' || q.subject === 'physics') ? q.subject : 'biology',
                topicCode: String(q.topicCode || 'B1'),
                topicTitle: q.topicTitle ? String(q.topicTitle) : undefined,
                syllabusRef: q.syllabusRef ? String(q.syllabusRef) : undefined,
                tier: q.tier === 'Core' ? 'Core' : 'Extended',
                question: String(q.question || ''),
                options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ['A', 'B', 'C', 'D'],
                correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
                explanation: String(q.explanation || '')
              })),
              phase: 'waiting',
              currentQuestionIndex: 0,
              questionDurationMs: QUESTION_DURATION_MS,
              revealDurationMs: REVEAL_DURATION_MS,
              countdownEndsAt: null,
              questionStartedAt: null,
              questionEndsAt: null,
              revealEndsAt: null,
              scores: {
                [challengerId]: 0,
                [challengedId]: 0
              },
              connectedUids: new Set<string>(),
              readyNextUids: new Set<string>(),
              answersByQuestion: {},
              roundHistory: [],
              winnerId: null,
              forfeitedBy: null,
              phaseTimer: null,
              cleanupTimer: null,
              sockets: new Set<AttachedChallengeSocket>()
            };
            rooms.set(challengeId, room);
          } else if (uid !== room.challengerId && uid !== room.challengedId) {
            ws.send(JSON.stringify({ type: 'challenge_error', message: 'Not a participant in this challenge.' }));
            return;
          }

          ws.uid = uid;
          ws.challengeId = challengeId;
          room.sockets.add(ws);
          room.connectedUids.add(uid);
          if (room.cleanupTimer) {
            clearTimeout(room.cleanupTimer);
            room.cleanupTimer = null;
          }

          if (
            room.phase === 'waiting' &&
            room.connectedUids.has(room.challengerId) &&
            room.connectedUids.has(room.challengedId)
          ) {
            beginCountdown(room);
          } else {
            broadcastRoomState(room);
          }
          break;
        }

        case 'submit_answer': {
          const challengeId = ws.challengeId || (typeof msg.challengeId === 'string' ? msg.challengeId : '');
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          const room = challengeId ? rooms.get(challengeId) : undefined;
          if (!room || !uid || (uid !== room.challengerId && uid !== room.challengedId)) return;
          if (room.phase !== 'question') return;

          const questionIndex = Number(msg.questionIndex);
          if (questionIndex !== room.currentQuestionIndex) return;

          const optionIndex = Number(msg.optionIndex);
          if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) return;

          const answers = room.answersByQuestion[questionIndex] || (room.answersByQuestion[questionIndex] = {});
          if (answers[uid]) return; // Already submitted for this question

          const q = room.questions[questionIndex];
          if (!q) return;

          const now = Date.now();
          const startedAt = room.questionStartedAt || now;
          const elapsedMs = Math.max(50, Math.min(room.questionDurationMs, now - startedAt));
          const isCorrect = optionIndex === q.correctIndex;

          // Score formula: 100 base points for correct answer + up to 100 speed bonus points
          let basePoints = 0;
          let speedBonus = 0;
          if (isCorrect) {
            basePoints = 100;
            const remainingRatio = Math.max(0, Math.min(1, (room.questionDurationMs - elapsedMs) / room.questionDurationMs));
            speedBonus = Math.round(100 * remainingRatio);
          }
          const pointsEarned = basePoints + speedBonus;

          const playerName = uid === room.challengerId ? room.challengerName : room.challengedName;
          answers[uid] = {
            uid,
            name: playerName,
            optionIndex,
            isCorrect,
            pointsEarned,
            basePoints,
            speedBonus,
            elapsedMs,
            timedOut: false,
            submittedAt: now
          };

          room.scores[uid] = (room.scores[uid] || 0) + pointsEarned;

          const bothAnswered = Boolean(answers[room.challengerId] && answers[room.challengedId]);
          if (bothAnswered) {
            finalizeQuestionReveal(room, questionIndex);
          } else {
            broadcastRoomState(room);
          }
          break;
        }

        case 'ready_next': {
          const challengeId = ws.challengeId || (typeof msg.challengeId === 'string' ? msg.challengeId : '');
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          const room = challengeId ? rooms.get(challengeId) : undefined;
          if (!room || !uid || (uid !== room.challengerId && uid !== room.challengedId)) return;
          if (room.phase !== 'reveal') return;
          if (Number(msg.questionIndex) !== room.currentQuestionIndex) return;

          room.readyNextUids.add(uid);
          if (room.readyNextUids.has(room.challengerId) && room.readyNextUids.has(room.challengedId)) {
            advanceAfterReveal(room);
          } else {
            broadcastRoomState(room);
          }
          break;
        }

        case 'forfeit_challenge': {
          const challengeId = ws.challengeId || (typeof msg.challengeId === 'string' ? msg.challengeId : '');
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          const room = challengeId ? rooms.get(challengeId) : undefined;
          if (!room || !uid || (uid !== room.challengerId && uid !== room.challengedId)) return;
          if (room.phase === 'completed' || room.phase === 'cancelled') return;

          clearRoomTimers(room);
          room.forfeitedBy = uid;
          if (room.phase === 'waiting') {
            room.phase = 'cancelled';
            broadcastRoomState(room);
            scheduleRoomCleanup(room);
          } else {
            room.winnerId = uid === room.challengerId ? room.challengedId : room.challengerId;
            completeMatch(room);
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      if (ws.challengeId) {
        const room = rooms.get(ws.challengeId);
        if (room) {
          room.sockets.delete(ws);
          if (ws.uid) {
            // Only remove uid from connectedUids if they have no other open socket in the room
            const stillHasSocket = Array.from(room.sockets).some(s => s.uid === ws.uid);
            if (!stillHasSocket) {
              room.connectedUids.delete(ws.uid);
              broadcastRoomState(room);
            }
          }
          if (room.sockets.size === 0 && (room.phase === 'waiting' || room.phase === 'completed' || room.phase === 'cancelled')) {
            scheduleRoomCleanup(room);
          }
        }
      }
    });
  });

  console.log('1v1 Live Quiz Challenge WebSocket Relay attached at /ws/challenge');
}
