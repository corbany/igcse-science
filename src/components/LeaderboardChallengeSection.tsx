import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Crown,
  Play,
  RefreshCw,
  Send,
  Swords,
  Trophy,
  Users,
  X,
  Zap
} from 'lucide-react';
import {
  ExamTier,
  LeaderboardEntry,
  QuizChallenge,
  ScienceSubject,
  UserProfile
} from '../types';
import { ALL_SYLLABUS_TOPICS } from '../services/quizService';
import {
  acceptQuizChallenge,
  cancelQuizChallenge,
  createQuizChallenge,
  declineQuizChallenge
} from '../services/challengeService';

interface LeaderboardChallengeSectionProps {
  user: UserProfile;
  classId: string;
  className?: string;
  classmates: LeaderboardEntry[];
  challenges: QuizChallenge[];
  preselectedOpponentId?: string | null;
  onEnterMatch: (challenge: QuizChallenge) => void;
}

const QUIZ_LENGTH_OPTIONS = [5, 10, 15, 20];

export const LeaderboardChallengeSection: React.FC<LeaderboardChallengeSectionProps> = ({
  user,
  classId,
  className = '',
  classmates,
  challenges,
  preselectedOpponentId = null,
  onEnterMatch
}) => {
  const eligibleOpponents = useMemo(
    () => classmates.filter((c) => !c.isCurrentUser && c.studentId !== user.id),
    [classmates, user.id]
  );

  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['B1', 'B2', 'C1', 'C2', 'P1']);
  const [subjectTab, setSubjectTab] = useState<'all' | ScienceSubject>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [tier, setTier] = useState<ExamTier>(user.tier === 'Core' ? 'Core' : 'Extended');
  const [creating, setCreating] = useState(false);
  const [busyChallengeId, setBusyChallengeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (preselectedOpponentId && eligibleOpponents.some((o) => o.studentId === preselectedOpponentId)) {
      setSelectedOpponentId(preselectedOpponentId);
    } else if (!selectedOpponentId && eligibleOpponents.length > 0) {
      setSelectedOpponentId(eligibleOpponents[0].studentId);
    }
  }, [preselectedOpponentId, eligibleOpponents]);

  const visibleTopics = useMemo(() => {
    if (subjectTab === 'all') return ALL_SYLLABUS_TOPICS;
    return ALL_SYLLABUS_TOPICS.filter((t) => t.subject === subjectTab);
  }, [subjectTab]);

  const incomingPending = useMemo(
    () => challenges.filter((c) => c.status === 'pending' && c.challengedId === user.id),
    [challenges, user.id]
  );

  const outgoingPending = useMemo(
    () => challenges.filter((c) => c.status === 'pending' && c.challengerId === user.id),
    [challenges, user.id]
  );

  const activeMatches = useMemo(
    () => challenges.filter((c) => c.status === 'accepted' || c.status === 'in_progress'),
    [challenges]
  );

  const recentHistory = useMemo(
    () =>
      challenges
        .filter((c) => c.status === 'completed' || c.status === 'declined' || c.status === 'cancelled')
        .slice(0, 6),
    [challenges]
  );

  const toggleTopic = (code: string) => {
    setSelectedTopics((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectVisibleTopics = () => {
    const visibleCodes = visibleTopics.map((t) => t.code);
    setSelectedTopics((prev) => Array.from(new Set([...prev, ...visibleCodes])));
  };

  const handleClearTopics = () => {
    if (subjectTab === 'all') {
      setSelectedTopics([]);
    } else {
      const visibleSet = new Set(visibleTopics.map((t) => t.code));
      setSelectedTopics((prev) => prev.filter((c) => !visibleSet.has(c)));
    }
  };

  const handleCreateChallenge = async () => {
    const opponent = eligibleOpponents.find((o) => o.studentId === selectedOpponentId);
    if (!opponent) {
      setFeedback({ type: 'error', text: 'Select a classmate to challenge first.' });
      return;
    }
    if (selectedTopics.length === 0) {
      setFeedback({ type: 'error', text: 'Choose at least one syllabus topic for the live quiz.' });
      return;
    }

    setCreating(true);
    setFeedback(null);
    try {
      await createQuizChallenge({
        classId,
        challengerId: user.id,
        challengerName: user.name,
        challengedId: opponent.studentId,
        challengedName: opponent.name,
        topics: selectedTopics,
        questionCount,
        tier
      });
      setFeedback({
        type: 'success',
        text: `Challenge sent to ${opponent.name} (${questionCount} questions). As soon as they accept, you will both enter the live quiz together.`
      });
    } catch (err: any) {
      console.error('Failed to create challenge:', err);
      setFeedback({
        type: 'error',
        text: 'Could not send challenge right now. Please check your connection and try again.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAccept = async (challenge: QuizChallenge) => {
    setBusyChallengeId(challenge.id);
    setFeedback(null);
    try {
      await acceptQuizChallenge(challenge.id);
      onEnterMatch({ ...challenge, status: 'accepted' });
    } catch (err) {
      console.error('Failed to accept challenge:', err);
      setFeedback({ type: 'error', text: 'Unable to accept challenge. Please try again.' });
    } finally {
      setBusyChallengeId(null);
    }
  };

  const handleDecline = async (challengeId: string) => {
    setBusyChallengeId(challengeId);
    try {
      await declineQuizChallenge(challengeId);
    } catch (err) {
      console.error('Failed to decline challenge:', err);
    } finally {
      setBusyChallengeId(null);
    }
  };

  const handleCancel = async (challengeId: string) => {
    setBusyChallengeId(challengeId);
    try {
      await cancelQuizChallenge(challengeId);
    } catch (err) {
      console.error('Failed to cancel challenge:', err);
    } finally {
      setBusyChallengeId(null);
    }
  };

  return (
    <section
      id="leaderboard-challenge-section"
      className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              1v1 Live Quiz Challenges
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Challenge a classmate in {className || 'your class'}, pick the topics and quiz length, and race live question-by-question with speed bonus scoring.
            </p>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-600 shrink-0">
          <strong className="text-slate-900 font-mono tabular-nums">100–200 pts</strong> per correct answer
        </div>
      </div>

      {/* Active / Accepted Matches Ready to Enter */}
      {activeMatches.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-700" />
            <span>Live Challenge Ready</span>
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {activeMatches.map((c) => {
              const opponent = c.challengerId === user.id ? c.challengedName : c.challengerName;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 text-xs">
                    <p className="text-sm font-bold text-slate-900">
                      Live Match vs {opponent}
                    </p>
                    <p className="text-slate-700 font-medium">
                      Topics: <strong className="font-mono text-slate-900">{c.topics.join(', ')}</strong> · {c.questionCount} Questions · {c.tier} Tier
                    </p>
                  </div>
                  <button
                    onClick={() => onEnterMatch(c)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Enter Live Quiz</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incoming Pending Challenges */}
      {incomingPending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Incoming Challenges ({incomingPending.length})</span>
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {incomingPending.map((c) => {
              const isBusy = busyChallengeId === c.id;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-amber-50 border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <p className="text-sm font-bold text-slate-900">
                      {c.challengerName} challenged you to a live quiz!
                    </p>
                    <p className="text-slate-700 font-medium">
                      Topics: <strong className="font-mono text-slate-900">{c.topics.join(', ')}</strong> ·{' '}
                      <strong className="font-mono tabular-nums text-slate-900">{c.questionCount} Questions</strong> ·{' '}
                      <span>{c.tier} Tier</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={isBusy}
                      onClick={() => handleDecline(c.id)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => handleAccept(c)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Accept & Start Live Quiz</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outgoing Pending Challenges */}
      {outgoingPending.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Waiting for Classmate Response ({outgoingPending.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outgoingPending.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#FDFBF7] border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-bold text-slate-900 truncate">
                    Waiting on {c.challengedName}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    {c.questionCount} Qs · {c.tier} · {c.topics.join(', ')}
                  </p>
                </div>
                <button
                  disabled={busyChallengeId === c.id}
                  onClick={() => handleCancel(c.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-300 text-rose-700 font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Builder */}
      {eligibleOpponents.length === 0 ? (
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-500 shrink-0" />
          <span>
            Once another classmate enrolls in <strong>{className || 'your class'}</strong>, you can challenge them directly to a live head-to-head quiz here.
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Opponent Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                1. Choose Classmate
              </label>
              <select
                value={selectedOpponentId}
                onChange={(e) => setSelectedOpponentId(e.target.value)}
                className="w-full text-xs font-bold"
              >
                {eligibleOpponents.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.name} (Rank #{student.rank} · {student.totalQuizScore || 0} pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Length Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                2. Quiz Length
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {QUIZ_LENGTH_OPTIONS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setQuestionCount(len)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer border whitespace-nowrap ${
                      questionCount === len
                        ? 'bg-slate-900 text-white border-black'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {len} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                3. Syllabus Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Core', 'Extended'] as ExamTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                      tier === t
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Picker */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-800">4. Select Quiz Topics</span>
                <span className="font-mono tabular-nums text-slate-600">
                  ({selectedTopics.length} selected)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(['all', 'biology', 'chemistry', 'physics'] as const).map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSubjectTab(subj)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize cursor-pointer border whitespace-nowrap ${
                      subjectTab === subj
                        ? 'bg-slate-900 text-white border-black'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSelectVisibleTopics}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-teal-800 font-bold cursor-pointer whitespace-nowrap"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearTopics}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold cursor-pointer whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {visibleTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.code);
                return (
                  <button
                    key={topic.code}
                    type="button"
                    onClick={() => toggleTopic(topic.code)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? 'bg-[#DCE8EE] border-black text-slate-950 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold text-slate-900 shrink-0 pt-0.5">
                      {topic.code}
                    </span>
                    <span className="text-[11px] leading-snug line-clamp-2">
                      {topic.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-600 font-medium">
              Both students answer each question at the same time and see live score updates after every round.
            </p>
            <button
              type="button"
              disabled={creating || selectedTopics.length === 0 || !selectedOpponentId}
              onClick={handleCreateChallenge}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer border-2 border-black ${
                creating || selectedTopics.length === 0 || !selectedOpponentId
                  ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
                  : 'bg-amber-300 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing Live Questions...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send 1v1 Challenge</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Head-to-Head History */}
      {recentHistory.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Your Recent 1v1 Matches</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {recentHistory.map((c) => {
              const iAmChallenger = c.challengerId === user.id;
              const myScore = iAmChallenger ? c.challengerScore : c.challengedScore;
              const oppScore = iAmChallenger ? c.challengedScore : c.challengerScore;
              const oppName = iAmChallenger ? c.challengedName : c.challengerName;
              const iWon = c.status === 'completed' && c.winnerId === user.id;
              const isDraw = c.status === 'completed' && c.winnerId === 'draw';

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FDFBF7] border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {iWon && <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      <span className="truncate">vs {oppName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      {c.questionCount} Qs · {c.tier} · {c.topics.slice(0, 4).join(', ')}
                      {c.topics.length > 4 ? ` +${c.topics.length - 4}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {c.status === 'completed' ? (
                      <>
                        <span className="font-mono tabular-nums font-bold text-slate-900 block">
                          {myScore} – {oppScore} pts
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            iWon ? 'text-emerald-700' : isDraw ? 'text-amber-700' : 'text-slate-600'
                          }`}
                        >
                          {iWon ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 capitalize">
                        {c.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
