import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from './firebaseAuth';
import { generateAIQuiz, generateClientFallbackQuiz } from './quizService';
import { ChallengeStatus, ExamTier, QuizChallenge, QuizQuestion } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function toSafeId(raw: string, fallback = 'id'): string {
  const cleaned = String(raw || fallback)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  return cleaned || fallback;
}

function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function sanitizeQuestionsForChallenge(questions: QuizQuestion[], count: number): QuizQuestion[] {
  return questions.slice(0, count).map((q, idx) => ({
    id: String(q.id || `chl-q-${idx + 1}`).slice(0, 80),
    subject:
      q.subject === 'biology' || q.subject === 'chemistry' || q.subject === 'physics'
        ? q.subject
        : 'biology',
    topicCode: String(q.topicCode || 'B1').slice(0, 16),
    topicTitle: q.topicTitle ? String(q.topicTitle).slice(0, 120) : '',
    question: String(q.question || '').slice(0, 800),
    options: Array.isArray(q.options) && q.options.length === 4
      ? q.options.map((opt) => String(opt).slice(0, 300))
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
    explanation: String(q.explanation || 'Review the Cambridge 0653 syllabus notes for this concept.').slice(0, 800),
    syllabusRef: String(q.syllabusRef || q.topicCode || '0653').slice(0, 32),
    tier: q.tier === 'Core' ? 'Core' : 'Extended'
  }));
}

export async function createQuizChallenge(params: {
  classId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  topics: string[];
  questionCount: number;
  tier: ExamTier;
}): Promise<QuizChallenge> {
  const safeCount = Math.max(3, Math.min(20, Math.round(params.questionCount || 10)));
  const cleanTopics = Array.from(new Set(params.topics.map((t) => String(t).trim()).filter(Boolean))).slice(0, 33);
  const effectiveTopics = cleanTopics.length > 0 ? cleanTopics : ['B1', 'C1', 'P1'];
  const effectiveTier: ExamTier = params.tier === 'Core' ? 'Core' : 'Extended';

  let generatedQuestions: QuizQuestion[] = [];
  try {
    const res = await generateAIQuiz({
      topics: effectiveTopics,
      numQuestions: safeCount,
      tier: effectiveTier,
      attemptNumber: Math.floor(Math.random() * 1000) + 1
    });
    generatedQuestions = res.questions || [];
  } catch {
    generatedQuestions = [];
  }

  if (generatedQuestions.length < safeCount) {
    const fallback = generateClientFallbackQuiz(effectiveTopics, safeCount * 2, effectiveTier);
    const seen = new Set(generatedQuestions.map((q) => q.question.trim().toLowerCase()));
    for (const fq of fallback) {
      const key = fq.question.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        generatedQuestions.push(fq);
      }
      if (generatedQuestions.length >= safeCount) break;
    }
  }

  const sanitizedQuestions = sanitizeQuestionsForChallenge(generatedQuestions, safeCount);
  if (sanitizedQuestions.length === 0) {
    throw new Error('Could not generate questions for the selected topics.');
  }

  const challengeId = toSafeId(`chl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const challengerId = toSafeId(params.challengerId);
  const challengedId = toSafeId(params.challengedId);
  const classId = toSafeId(params.classId || 'class');
  const challengerName = String(params.challengerName || 'Challenger').trim().slice(0, 100) || 'Challenger';
  const challengedName = String(params.challengedName || 'Classmate').trim().slice(0, 100) || 'Classmate';

  const docPath = `challenges/${challengeId}`;
  const docPayload = {
    id: challengeId,
    classId,
    challengerId,
    challengerName,
    challengedId,
    challengedName,
    participantIds: [challengerId, challengedId] as [string, string],
    topics: effectiveTopics,
    questionCount: sanitizedQuestions.length,
    tier: effectiveTier,
    status: 'pending' as ChallengeStatus,
    questions: sanitizedQuestions,
    challengerScore: 0,
    challengedScore: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, 'challenges', challengeId), docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }

  const nowIso = new Date().toISOString();
  return {
    ...docPayload,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

export async function acceptQuizChallenge(challengeId: string): Promise<void> {
  const safeId = toSafeId(challengeId);
  const docPath = `challenges/${safeId}`;
  try {
    await updateDoc(doc(db, 'challenges', safeId), {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function declineQuizChallenge(challengeId: string): Promise<void> {
  const safeId = toSafeId(challengeId);
  const docPath = `challenges/${safeId}`;
  try {
    await updateDoc(doc(db, 'challenges', safeId), {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function cancelQuizChallenge(challengeId: string): Promise<void> {
  const safeId = toSafeId(challengeId);
  const docPath = `challenges/${safeId}`;
  try {
    await updateDoc(doc(db, 'challenges', safeId), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function markChallengeInProgress(challengeId: string): Promise<void> {
  const safeId = toSafeId(challengeId);
  const docPath = `challenges/${safeId}`;
  try {
    await updateDoc(doc(db, 'challenges', safeId), {
      status: 'in_progress',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    // Ignore if already completed/in_progress or permission locked on terminal state
    console.warn(`markChallengeInProgress notice for ${docPath}:`, error);
  }
}

export async function finalizeQuizChallengeResult(params: {
  challengeId: string;
  challengerScore: number;
  challengedScore: number;
  winnerId: string;
}): Promise<void> {
  const safeId = toSafeId(params.challengeId);
  const docPath = `challenges/${safeId}`;
  try {
    await updateDoc(doc(db, 'challenges', safeId), {
      status: 'completed',
      challengerScore: Math.max(0, Math.min(10000, Math.round(params.challengerScore || 0))),
      challengedScore: Math.max(0, Math.min(10000, Math.round(params.challengedScore || 0))),
      winnerId: String(params.winnerId || 'draw').slice(0, 128),
      completedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    // Terminal state lock rejects duplicate writes from the second client, which is expected
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.toLowerCase().includes('permission') && !msg.toLowerCase().includes('insufficient')) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }
}

export function subscribeToUserChallenges(
  userId: string,
  onUpdate: (challenges: QuizChallenge[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const cleanUid = toSafeId(userId, '');
  if (!cleanUid) {
    onUpdate([]);
    return () => {};
  }

  const colPath = 'challenges';
  const q = query(collection(db, colPath), where('participantIds', 'array-contains', cleanUid));

  return onSnapshot(
    q,
    (snap) => {
      const list: QuizChallenge[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d) return;
        list.push({
          id: docSnap.id,
          classId: String(d.classId || ''),
          challengerId: String(d.challengerId || ''),
          challengerName: String(d.challengerName || 'Challenger'),
          challengedId: String(d.challengedId || ''),
          challengedName: String(d.challengedName || 'Classmate'),
          participantIds: Array.isArray(d.participantIds) && d.participantIds.length === 2
            ? [String(d.participantIds[0]), String(d.participantIds[1])]
            : [String(d.challengerId || ''), String(d.challengedId || '')],
          topics: Array.isArray(d.topics) ? d.topics.map(String) : [],
          questionCount: Number(d.questionCount || 10),
          tier: d.tier === 'Core' ? 'Core' : 'Extended',
          status: (d.status || 'pending') as ChallengeStatus,
          questions: Array.isArray(d.questions) ? (d.questions as QuizQuestion[]) : [],
          challengerScore: Number(d.challengerScore || 0),
          challengedScore: Number(d.challengedScore || 0),
          winnerId: d.winnerId ? String(d.winnerId) : undefined,
          createdAt: toIsoString(d.createdAt),
          updatedAt: toIsoString(d.updatedAt),
          acceptedAt: d.acceptedAt ? String(d.acceptedAt) : undefined,
          completedAt: d.completedAt ? String(d.completedAt) : undefined
        });
      });
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, colPath);
      }
    }
  );
}

// -------------------------------------------------------------
// LIVE WEBSOCKET CHALLENGE CLIENT (/ws/challenge)
// -------------------------------------------------------------

export interface LiveChallengePlayerOutcome {
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

export interface LiveChallengeRoundSummary {
  questionIndex: number;
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicCode: string;
  outcomes: Record<string, LiveChallengePlayerOutcome>;
  cumulativeScores: Record<string, number>;
}

export interface LiveChallengeQuestionPayload {
  id: string;
  subject: 'biology' | 'chemistry' | 'physics';
  topicCode: string;
  topicTitle?: string;
  syllabusRef?: string;
  tier?: 'Core' | 'Extended';
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface LiveChallengeStateMessage {
  type: 'challenge_state';
  serverNow: number;
  challengeId: string;
  classId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  tier: ExamTier;
  topics: string[];
  totalQuestions: number;
  phase: 'waiting' | 'countdown' | 'question' | 'reveal' | 'completed' | 'cancelled';
  currentQuestionIndex: number;
  questionDurationMs: number;
  revealDurationMs: number;
  countdownEndsAt: number | null;
  questionStartedAt: number | null;
  questionEndsAt: number | null;
  revealEndsAt: number | null;
  scores: Record<string, number>;
  connectedUids: string[];
  answeredUids: string[];
  readyNextUids: string[];
  currentQuestion: LiveChallengeQuestionPayload | null;
  mySubmission: {
    optionIndex: number | null;
    isCorrect: boolean;
    pointsEarned: number;
    basePoints: number;
    speedBonus: number;
    elapsedMs: number;
  } | null;
  revealOutcomes?: Record<string, LiveChallengePlayerOutcome>;
  roundHistory: LiveChallengeRoundSummary[];
  winnerId: string | null;
  forfeitedBy: string | null;
}

export interface ChallengeRealtimeHandlers {
  onConnectionChange?: (connected: boolean) => void;
  onState?: (state: LiveChallengeStateMessage, clockOffsetMs: number) => void;
  onError?: (message: string) => void;
}

export class ChallengeRealtimeClient {
  private ws: WebSocket | null = null;
  private handlers: ChallengeRealtimeHandlers = {};
  private joinPayloadGetter: (() => Record<string, any>) | null = null;
  private closedByCaller = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  public isConnected = false;

  public connect(
    joinPayloadGetter: () => Record<string, any>,
    handlers: ChallengeRealtimeHandlers
  ) {
    this.closedByCaller = false;
    this.joinPayloadGetter = joinPayloadGetter;
    this.handlers = handlers;
    this.openSocket();
  }

  private openSocket() {
    if (this.closedByCaller || typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/challenge`;

    try {
      const sock = new WebSocket(url);
      this.ws = sock;

      sock.onopen = () => {
        if (this.closedByCaller) {
          sock.close();
          return;
        }
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.handlers.onConnectionChange?.(true);
        if (this.joinPayloadGetter) {
          this.sendRaw({ type: 'join_challenge', ...this.joinPayloadGetter() });
        }
      };

      sock.onmessage = (evt) => {
        let msg: any;
        try {
          msg = JSON.parse(evt.data);
        } catch {
          return;
        }
        if (!msg || typeof msg.type !== 'string') return;
        if (msg.type === 'challenge_state') {
          const offset = typeof msg.serverNow === 'number' ? msg.serverNow - Date.now() : 0;
          this.handlers.onState?.(msg as LiveChallengeStateMessage, offset);
        } else if (msg.type === 'challenge_error') {
          this.handlers.onError?.(String(msg.message || 'Live challenge connection error'));
        }
      };

      sock.onclose = () => {
        const wasConnected = this.isConnected;
        this.isConnected = false;
        this.ws = null;
        if (wasConnected) {
          this.handlers.onConnectionChange?.(false);
        }
        if (!this.closedByCaller) {
          const delay = Math.min(3500, 600 * Math.pow(1.4, this.reconnectAttempts));
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.openSocket();
          }, delay);
        }
      };

      sock.onerror = () => {
        // Handled cleanly via onclose reconnect
      };
    } catch {
      this.isConnected = false;
    }
  }

  public sendRaw(payload: Record<string, any>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  public submitAnswer(challengeId: string, questionIndex: number, optionIndex: number): boolean {
    return this.sendRaw({ type: 'submit_answer', challengeId, questionIndex, optionIndex });
  }

  public sendReadyNext(challengeId: string, questionIndex: number): boolean {
    return this.sendRaw({ type: 'ready_next', challengeId, questionIndex });
  }

  public forfeit(challengeId: string): boolean {
    return this.sendRaw({ type: 'forfeit_challenge', challengeId });
  }

  public disconnect() {
    this.closedByCaller = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isConnected = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }
}
