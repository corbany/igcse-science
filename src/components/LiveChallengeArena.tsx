import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Crown,
  Flag,
  HelpCircle,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
import { QuizChallenge, UserProfile } from '../types';
import {
  ChallengeRealtimeClient,
  LiveChallengeStateMessage,
  cancelQuizChallenge,
  finalizeQuizChallengeResult,
  markChallengeInProgress
} from '../services/challengeService';

interface LiveChallengeArenaProps {
  challenge: QuizChallenge;
  user: UserProfile;
  onExit: () => void;
  onMatchCompleted?: (summary: {
    challengeId: string;
    myScore: number;
    opponentScore: number;
    correctCount: number;
    totalQuestions: number;
    won: boolean;
    isDraw: boolean;
  }) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const LiveChallengeArena: React.FC<LiveChallengeArenaProps> = ({
  challenge,
  user,
  onExit,
  onMatchCompleted
}) => {
  const clientRef = useRef<ChallengeRealtimeClient | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<LiveChallengeStateMessage | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [confirmForfeit, setConfirmForfeit] = useState(false);

  const markedInProgressRef = useRef(false);
  const finalizedRef = useRef(false);

  const isChallenger = user.id === challenge.challengerId;
  const opponentId = isChallenger ? challenge.challengedId : challenge.challengerId;
  const opponentName = isChallenger ? challenge.challengedName : challenge.challengerName;

  // Connect to server-authoritative /ws/challenge room
  useEffect(() => {
    const client = new ChallengeRealtimeClient();
    clientRef.current = client;

    client.connect(
      () => ({
        challengeId: challenge.id,
        uid: user.id,
        name: user.name,
        classId: challenge.classId,
        challengerId: challenge.challengerId,
        challengerName: challenge.challengerName,
        challengedId: challenge.challengedId,
        challengedName: challenge.challengedName,
        tier: challenge.tier,
        topics: challenge.topics,
        questions: challenge.questions
      }),
      {
        onConnectionChange: (connected) => setWsConnected(connected),
        onState: (state, offset) => {
          setWsError(null);
          setClockOffsetMs(offset);
          setLiveState(state);
        },
        onError: (msg) => setWsError(msg)
      }
    );

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [challenge.id, user.id]);

  // Smooth local clock tick for live server-synced timer bars
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Sync Firestore status to 'in_progress' once live match begins
  useEffect(() => {
    if (!liveState || markedInProgressRef.current) return;
    if (liveState.phase === 'countdown' || liveState.phase === 'question') {
      markedInProgressRef.current = true;
      markChallengeInProgress(challenge.id);
    }
  }, [liveState?.phase, challenge.id]);

  // Persist final scores & emit reward callback once match completes
  useEffect(() => {
    if (!liveState || liveState.phase !== 'completed' || finalizedRef.current) return;
    finalizedRef.current = true;

    const cScore = liveState.scores[challenge.challengerId] || 0;
    const dScore = liveState.scores[challenge.challengedId] || 0;
    const winnerId = liveState.winnerId || (cScore > dScore ? challenge.challengerId : dScore > cScore ? challenge.challengedId : 'draw');

    finalizeQuizChallengeResult({
      challengeId: challenge.id,
      challengerScore: cScore,
      challengedScore: dScore,
      winnerId
    }).catch(() => {});

    const myScore = liveState.scores[user.id] || 0;
    const opponentScore = liveState.scores[opponentId] || 0;
    const myCorrectCount = liveState.roundHistory.filter(
      (r) => r.outcomes?.[user.id]?.isCorrect
    ).length;

    onMatchCompleted?.({
      challengeId: challenge.id,
      myScore,
      opponentScore,
      correctCount: myCorrectCount,
      totalQuestions: liveState.totalQuestions,
      won: winnerId === user.id,
      isDraw: winnerId === 'draw'
    });
  }, [liveState?.phase, challenge.id]);

  const syncedNow = nowMs + clockOffsetMs;

  const countdownRemainingSec = useMemo(() => {
    if (!liveState?.countdownEndsAt) return 3;
    return Math.max(1, Math.ceil((liveState.countdownEndsAt - syncedNow) / 1000));
  }, [liveState?.countdownEndsAt, syncedNow]);

  const questionRemainingMs = useMemo(() => {
    if (!liveState?.questionEndsAt) return 20000;
    return Math.max(0, liveState.questionEndsAt - syncedNow);
  }, [liveState?.questionEndsAt, syncedNow]);

  const revealRemainingSec = useMemo(() => {
    if (!liveState?.revealEndsAt) return 4;
    return Math.max(0, Math.ceil((liveState.revealEndsAt - syncedNow) / 1000));
  }, [liveState?.revealEndsAt, syncedNow]);

  const handleSelectOption = (idx: number) => {
    if (!liveState || liveState.phase !== 'question' || liveState.mySubmission) return;
    clientRef.current?.submitAnswer(challenge.id, liveState.currentQuestionIndex, idx);
  };

  const handleReadyNext = () => {
    if (!liveState || liveState.phase !== 'reveal') return;
    clientRef.current?.sendReadyNext(challenge.id, liveState.currentQuestionIndex);
  };

  const handleCancelOrForfeit = async () => {
    if (liveState?.phase === 'waiting' && isChallenger) {
      clientRef.current?.forfeit(challenge.id);
      await cancelQuizChallenge(challenge.id).catch(() => {});
      onExit();
      return;
    }
    clientRef.current?.forfeit(challenge.id);
    setConfirmForfeit(false);
    if (!liveState || liveState.phase === 'waiting' || liveState.phase === 'cancelled') {
      onExit();
    }
  };

  const phase = liveState?.phase || 'waiting';
  const challengerConnected = liveState?.connectedUids.includes(challenge.challengerId) ?? false;
  const challengedConnected = liveState?.connectedUids.includes(challenge.challengedId) ?? false;
  const challengerScore = liveState?.scores[challenge.challengerId] || 0;
  const challengedScore = liveState?.scores[challenge.challengedId] || 0;
  const answeredSet = new Set(liveState?.answeredUids || []);
  const readySet = new Set(liveState?.readyNextUids || []);

  const questionProgressPct = liveState?.questionDurationMs
    ? Math.max(0, Math.min(100, (questionRemainingMs / liveState.questionDurationMs) * 100))
    : 100;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12 text-slate-800">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={
            phase === 'completed' || phase === 'cancelled'
              ? onExit
              : () => setConfirmForfeit(true)
          }
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-black text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{phase === 'completed' || phase === 'cancelled' ? 'Back to Leaderboard' : 'Leave Match'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="font-mono font-bold text-slate-800">
            1v1 Live Challenge
          </span>
          <span>·</span>
          <span>Topics: <strong className="text-slate-900 font-mono">{challenge.topics.join(', ')}</strong></span>
          <span>·</span>
          <span>{challenge.tier} Tier</span>
          <span>·</span>
          <span className={`font-bold ${wsConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {wsConnected ? 'Live Sync Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {wsError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
          {wsError}
        </div>
      )}

      {/* Forfeit Confirmation Banner */}
      {confirmForfeit && phase !== 'completed' && phase !== 'cancelled' && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-800 space-y-0.5">
            <p className="font-bold text-slate-900">
              {phase === 'waiting' ? 'Leave waiting room?' : 'Forfeit active live challenge?'}
            </p>
            <p className="text-slate-600">
              {phase === 'waiting'
                ? 'Leaving now will cancel this match setup before questions begin.'
                : `Leaving mid-match awards the victory to ${opponentName}.`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmForfeit(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer whitespace-nowrap"
            >
              Stay in Match
            </button>
            <button
              onClick={handleCancelOrForfeit}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              {phase === 'waiting' ? 'Leave' : 'Forfeit Match'}
            </button>
          </div>
        </div>
      )}

      {/* LIVE TWO-PLAYER SCOREBOARD HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Player 1: Challenger */}
          <div className={`p-3.5 rounded-xl border ${isChallenger ? 'bg-amber-50/70 border-amber-300' : 'bg-[#FDFBF7] border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center font-black text-sm text-amber-900 shrink-0">
                  {challenge.challengerName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {challenge.challengerName} {isChallenger ? '(You)' : ''}
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    {phase === 'question'
                      ? answeredSet.has(challenge.challengerId)
                        ? 'Answer locked in'
                        : 'Answering...'
                      : phase === 'reveal'
                        ? readySet.has(challenge.challengerId)
                          ? 'Ready for next'
                          : 'Viewing round score'
                        : challengerConnected
                          ? 'In room'
                          : 'Joining...'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg sm:text-xl font-mono tabular-nums font-black text-emerald-800 block leading-none">
                  {challengerScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500">pts</span>
              </div>
            </div>
          </div>

          {/* Center Match Progress & Timer */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 py-1">
            {phase === 'question' && liveState ? (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="font-mono tabular-nums">
                    Question {liveState.currentQuestionIndex + 1} / {liveState.totalQuestions}
                  </span>
                  <span>·</span>
                  <span className={`font-mono tabular-nums flex items-center gap-1 ${questionRemainingMs <= 5000 ? 'text-rose-700' : 'text-teal-800'}`}>
                    <Timer className="w-3.5 h-3.5" />
                    {(questionRemainingMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="w-full max-w-[220px] h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${questionRemainingMs <= 5000 ? 'bg-rose-600' : 'bg-emerald-600'}`}
                    style={{ width: `${questionProgressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  100 base + up to +100 speed bonus
                </p>
              </>
            ) : phase === 'reveal' && liveState ? (
              <>
                <span className="text-xs font-bold text-teal-800">
                  Round {liveState.currentQuestionIndex + 1} / {liveState.totalQuestions} Results
                </span>
                <p className="text-[11px] font-mono tabular-nums font-bold text-slate-700">
                  {liveState.currentQuestionIndex + 1 < liveState.totalQuestions
                    ? `Next question in ${revealRemainingSec}s`
                    : `Final summary in ${revealRemainingSec}s`}
                </p>
              </>
            ) : phase === 'countdown' ? (
              <span className="text-sm font-black text-emerald-800 font-mono tabular-nums">
                Starting in {countdownRemainingSec}...
              </span>
            ) : phase === 'completed' ? (
              <span className="text-sm font-black text-slate-900">
                Match Complete · {challenge.questionCount} Questions
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-700">
                Waiting for both students · {challenge.questionCount} Questions
              </span>
            )}
          </div>

          {/* Player 2: Challenged */}
          <div className={`p-3.5 rounded-xl border ${!isChallenger ? 'bg-amber-50/70 border-amber-300' : 'bg-[#FDFBF7] border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center font-black text-sm text-teal-900 shrink-0">
                  {challenge.challengedName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {challenge.challengedName} {!isChallenger ? '(You)' : ''}
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    {phase === 'question'
                      ? answeredSet.has(challenge.challengedId)
                        ? 'Answer locked in'
                        : 'Answering...'
                      : phase === 'reveal'
                        ? readySet.has(challenge.challengedId)
                          ? 'Ready for next'
                          : 'Viewing round score'
                        : challengedConnected
                          ? 'In room'
                          : 'Joining...'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg sm:text-xl font-mono tabular-nums font-black text-emerald-800 block leading-none">
                  {challengedScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 1: WAITING FOR BOTH STUDENTS TO ENTER LIVE ROOM */}
      {phase === 'waiting' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3F5] border border-slate-300 text-teal-800 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 text-center">
              Synchronizing Live Quiz Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 text-center">
              Waiting for both <strong>{challenge.challengerName}</strong> and <strong>{challenge.challengedName}</strong> to connect so Question 1 starts at the exact same instant.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-xs">
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">{challenge.challengerName}</span>
              <span className={`font-bold ${challengerConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {challengerConnected ? 'Ready in room' : 'Connecting...'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">{challenge.challengedName}</span>
              <span className={`font-bold ${challengedConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {challengedConnected ? 'Ready in room' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: SYNCHRONIZED 3-2-1 COUNTDOWN */}
      {phase === 'countdown' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider text-center">
            Both Students Connected
          </p>
          <div className="text-5xl sm:text-6xl font-black font-mono tabular-nums text-slate-900 text-center">
            {countdownRemainingSec}
          </div>
          <p className="text-sm font-medium text-slate-600 max-w-md mx-auto text-center">
            Answer each multiple-choice question accurately and quickly. Faster correct answers earn up to <strong>200 points</strong> per question.
          </p>
        </div>
      )}

      {/* PHASE 3: SIMULTANEOUS LIVE QUESTION */}
      {phase === 'question' && liveState?.currentQuestion && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-900">
              Topic {liveState.currentQuestion.topicCode}
              {liveState.currentQuestion.syllabusRef ? ` · ${liveState.currentQuestion.syllabusRef}` : ''}
              {liveState.currentQuestion.topicTitle ? ` · ${liveState.currentQuestion.topicTitle}` : ''}
            </span>
            <span className="font-mono font-bold text-slate-700">
              {liveState.currentQuestion.tier || challenge.tier}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {liveState.currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {liveState.currentQuestion.options.map((opt, idx) => {
              const isSelected = liveState.mySubmission?.optionIndex === idx;
              const locked = Boolean(liveState.mySubmission);
              return (
                <button
                  key={idx}
                  disabled={locked}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-[#DCE8EE] border-black text-slate-950 font-bold'
                      : locked
                        ? 'bg-[#FDFBF7] border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-[#FDFBF7] hover:bg-[#EBF3F5] border-slate-300 hover:border-black text-slate-900 cursor-pointer'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                    isSelected ? 'bg-slate-900 text-white border-black' : 'bg-white text-slate-800 border-slate-300'
                  }`}>
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {liveState.mySubmission ? (
            <div className="p-4 rounded-xl bg-[#EBF3F5] border border-teal-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-teal-800 shrink-0" />
                <span>
                  Answer ({OPTION_LETTERS[liveState.mySubmission.optionIndex ?? 0]}) locked in after {(liveState.mySubmission.elapsedMs / 1000).toFixed(1)}s.
                </span>
              </div>
              <span className="font-medium text-teal-900">
                Waiting for {opponentName} to answer so both scores reveal together...
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Select your answer above — points depend on accuracy and speed.</span>
              <span className="font-bold text-slate-800">
                {answeredSet.has(opponentId)
                  ? `${opponentName} has already locked in an answer!`
                  : `${opponentName} is still answering...`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: LIVE PER-QUESTION SCOREBOARD REVEAL BEFORE ADVANCING TOGETHER */}
      {phase === 'reveal' && liveState?.currentQuestion && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
          {/* Live Per-Question Points Comparison */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span>Question {liveState.currentQuestionIndex + 1} Live Points Breakdown</span>
              </h3>
              <span className="text-xs font-mono tabular-nums font-bold text-teal-800">
                {liveState.currentQuestionIndex + 1 < liveState.totalQuestions
                  ? `Moving on together in ${revealRemainingSec}s`
                  : `Showing final results in ${revealRemainingSec}s`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {[
                { id: challenge.challengerId, name: challenge.challengerName, total: challengerScore },
                { id: challenge.challengedId, name: challenge.challengedName, total: challengedScore }
              ].map((player) => {
                const outcome = liveState.revealOutcomes?.[player.id];
                const isSelf = player.id === user.id;
                const earned = outcome?.pointsEarned || 0;
                const isRight = Boolean(outcome?.isCorrect);
                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl border-2 space-y-2 ${
                      isRight
                        ? 'bg-emerald-50/70 border-emerald-500'
                        : 'bg-[#FDFBF7] border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {player.name} {isSelf ? '(You)' : ''}
                      </span>
                      <span className={`font-mono tabular-nums text-base font-black ${isRight ? 'text-emerald-800' : 'text-slate-600'}`}>
                        +{earned} pts
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                      <span className="flex items-center gap-1.5 font-bold">
                        {isRight ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>
                          {outcome?.timedOut
                            ? 'Timed out'
                            : isRight
                              ? `Correct (${((outcome?.elapsedMs || 0) / 1000).toFixed(1)}s)`
                              : `Incorrect (${OPTION_LETTERS[outcome?.optionIndex ?? 0] || '—'})`}
                        </span>
                      </span>

                      <span className="font-mono tabular-nums text-[11px] text-slate-600">
                        {isRight
                          ? `${outcome?.basePoints} base + ${outcome?.speedBonus} speed`
                          : '0 base + 0 speed'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">Total Match Score</span>
                      <span className="font-mono tabular-nums font-black text-slate-900">{player.total} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct Answer & Explanation */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900">{liveState.currentQuestion.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {liveState.currentQuestion.options.map((opt, idx) => {
                const isCorrectOpt = idx === liveState.currentQuestion?.correctIndex;
                const cPicked = liveState.revealOutcomes?.[challenge.challengerId]?.optionIndex === idx;
                const dPicked = liveState.revealOutcomes?.[challenge.challengedId]?.optionIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                      isCorrectOpt
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-[#FDFBF7] border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold shrink-0">{OPTION_LETTERS[idx]}.</span>
                      <span>{opt}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-[10px] font-bold">
                      {cPicked && <span className="text-amber-800">{challenge.challengerName.split(' ')[0]}</span>}
                      {dPicked && <span className="text-teal-800">{challenge.challengedName.split(' ')[0]}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {liveState.currentQuestion.explanation && (
              <div className="p-3.5 rounded-xl bg-[#EBF3F5] border border-slate-300 text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-slate-900">Syllabus Explanation: </strong>
                  <span>{liveState.currentQuestion.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Advance Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-600 font-medium">
              {readySet.has(user.id)
                ? `Waiting for ${opponentName} or timer (${revealRemainingSec}s) so you both move on together...`
                : `Both students advance together to the next question (${revealRemainingSec}s).`}
            </p>
            <button
              onClick={handleReadyNext}
              disabled={readySet.has(user.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                readySet.has(user.id)
                  ? 'bg-slate-200 text-slate-600 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {readySet.has(user.id)
                ? 'Ready — Waiting for Opponent'
                : liveState.currentQuestionIndex + 1 < liveState.totalQuestions
                  ? 'Ready for Next Question'
                  : 'View Final Results'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 5: MATCH COMPLETED SUMMARY */}
      {phase === 'completed' && liveState && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-black text-amber-800 mx-auto flex items-center justify-center">
              {liveState.winnerId === 'draw' ? <Sparkles className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                {liveState.winnerId === 'draw'
                  ? 'Tie Match!'
                  : liveState.winnerId === user.id
                    ? 'You Won the 1v1 Challenge!'
                    : `${opponentName} Won the 1v1 Challenge`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 text-center">
                {liveState.forfeitedBy
                  ? `${liveState.forfeitedBy === user.id ? 'You' : opponentName} left the match early.`
                  : `Completed ${liveState.totalQuestions} live questions across ${challenge.topics.join(', ')} (${challenge.tier} Tier).`}
              </p>
            </div>

            {/* Final Head-to-Head Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              {[
                { id: challenge.challengerId, name: challenge.challengerName, score: challengerScore },
                { id: challenge.challengedId, name: challenge.challengedName, score: challengedScore }
              ].map((player) => {
                const isWinner = liveState.winnerId === player.id;
                const playerRounds = liveState.roundHistory
                  .map((r) => r.outcomes?.[player.id])
                  .filter(Boolean);
                const correctCount = playerRounds.filter((o) => o.isCorrect).length;
                const answeredRounds = playerRounds.filter((o) => !o.timedOut);
                const avgSpeedSec = answeredRounds.length > 0
                  ? (answeredRounds.reduce((acc, o) => acc + o.elapsedMs, 0) / answeredRounds.length / 1000).toFixed(1)
                  : '—';

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl border-2 space-y-2 ${
                      isWinner ? 'bg-amber-50 border-black' : 'bg-[#FDFBF7] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {player.name} {player.id === user.id ? '(You)' : ''}
                      </span>
                      {isWinner && (
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> Winner
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums text-emerald-800">
                      {player.score} pts
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                      <span>Accuracy: <strong className="text-slate-900 font-mono tabular-nums">{correctCount}/{liveState.totalQuestions}</strong></span>
                      <span>Avg Speed: <strong className="text-slate-900 font-mono tabular-nums">{avgSpeedSec}s</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold border-2 border-black cursor-pointer transition"
            >
              Return to Class Leaderboard
            </button>
          </div>

          {/* Question-by-Question Score History */}
          {liveState.roundHistory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <span>Round-by-Round Points Log</span>
              </h3>
              <div className="space-y-2.5">
                {liveState.roundHistory.map((round) => {
                  const p1 = round.outcomes?.[challenge.challengerId];
                  const p2 = round.outcomes?.[challenge.challengedId];
                  return (
                    <div
                      key={round.questionIndex}
                      className="p-3.5 rounded-xl bg-[#FDFBF7] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">
                          Q{round.questionIndex + 1} ({round.topicCode}): {round.questionText}
                        </p>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          Answer: {round.options[round.correctIndex]}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 font-mono tabular-nums">
                        <span className={p1?.isCorrect ? 'font-bold text-emerald-800' : 'text-slate-500'}>
                          {challenge.challengerName.split(' ')[0]}: +{p1?.pointsEarned || 0}
                        </span>
                        <span className={p2?.isCorrect ? 'font-bold text-emerald-800' : 'text-slate-500'}>
                          {challenge.challengedName.split(' ')[0]}: +{p2?.pointsEarned || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 6: CANCELLED */}
      {phase === 'cancelled' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <Flag className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 text-center">Challenge Cancelled</h2>
          <p className="text-xs text-slate-600 text-center">
            This challenge was cancelled before the live quiz began.
          </p>
          <button
            onClick={onExit}
            className="px-5 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-black text-slate-900 text-xs font-bold cursor-pointer"
          >
            Return to Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};
