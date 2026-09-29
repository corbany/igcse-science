import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award, 
  Flame,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { StudentProgress, UserProfile, TrafficLightStatus } from '../types';
import { syllabusItems } from '../data/syllabusData';
import { allSubtopicsData } from '../data/subtopicSlidesData';

interface ProgressTrackerProps {
  progress: StudentProgress;
  user: UserProfile;
  onUpdateConfidence: (topicCode: string, rating: number) => void;
  onNavigateToTopic: (topicCode: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  user,
  onUpdateConfidence,
  onNavigateToTopic
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'biology' | 'chemistry' | 'physics'>('all');
  const [trafficFilter, setTrafficFilter] = useState<'all' | 'red' | 'orange' | 'green'>('all');

  const trafficLights = progress.trafficLights || {};
  const quizScores = progress.subtopicQuizScores || {};

  // Compute Traffic Light statistics across all subtopics
  const stats = useMemo(() => {
    let total = allSubtopicsData.length;
    let green = 0;
    let orange = 0;
    let red = 0;
    let unranked = 0;

    const subjectStats = {
      biology: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 },
      chemistry: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 },
      physics: { total: 0, green: 0, orange: 0, red: 0, unranked: 0 }
    };

    allSubtopicsData.forEach(sub => {
      const status = trafficLights[sub.subtopicCode];
      subjectStats[sub.subject].total++;

      if (status === 'green') {
        green++;
        subjectStats[sub.subject].green++;
      } else if (status === 'orange') {
        orange++;
        subjectStats[sub.subject].orange++;
      } else if (status === 'red') {
        red++;
        subjectStats[sub.subject].red++;
      } else {
        unranked++;
        subjectStats[sub.subject].unranked++;
      }
    });

    const masteryPct = total > 0 ? Math.round((green / total) * 100) : 0;

    return { total, green, orange, red, unranked, masteryPct, subjectStats };
  }, [trafficLights]);

  // Filtered subtopics based on subject tab and traffic light status
  const displayedSubtopics = useMemo(() => {
    return allSubtopicsData.filter(sub => {
      if (activeCategory !== 'all' && sub.subject !== activeCategory) return false;
      const status = trafficLights[sub.subtopicCode];
      if (trafficFilter === 'green' && status !== 'green') return false;
      if (trafficFilter === 'orange' && status !== 'orange') return false;
      if (trafficFilter === 'red' && status !== 'red') return false;
      return true;
    });
  }, [activeCategory, trafficFilter, trafficLights]);

  const filteredSyllabusItems = syllabusItems.filter(item => 
    activeCategory === 'all' || item.subject === activeCategory
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome & Milestone Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {user.tier} Tier Candidate
              </span>
              {user.examDate && (
                <span className="text-xs text-slate-400 font-medium">
                  Target Exam: {user.examDate}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user.name}'s Curriculum Mastery & Traffic Light Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Track your traffic light rankings across all {stats.total} subtopics in Biology, Chemistry, and Physics. 
              Earn <span className="text-emerald-400 font-bold">Green status</span> by scoring ≥80% on each subtopic's 10-Question Knowledge Check.
            </p>
          </div>

          {/* Traffic Light Mastery Circular Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-500"
                  strokeDasharray={`${stats.masteryPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-bold text-white font-mono">{stats.masteryPct}%</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Green Mastery Rate</div>
              <div className="text-sm font-bold text-white mt-0.5">{stats.green} of {stats.total} subtopics</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.green} verified green badges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Light Summary Cards (Green, Orange, Red, Unranked) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {/* GREEN CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'green' ? 'all' : 'green')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'green'
                ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-950/50 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Green Status
              </span>
              <span className="font-mono text-base">{stats.green}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mastered (Quiz ≥ 80%)
            </p>
          </div>

          {/* ORANGE CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'orange' ? 'all' : 'orange')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'orange'
                ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500'
                : 'bg-slate-950/50 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Orange Status
              </span>
              <span className="font-mono text-base">{stats.orange}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Needs some more revision
            </p>
          </div>

          {/* RED CARD */}
          <div 
            onClick={() => setTrafficFilter(trafficFilter === 'red' ? 'all' : 'red')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              trafficFilter === 'red'
                ? 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500'
                : 'bg-slate-950/50 border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Red Status
              </span>
              <span className="font-mono text-base">{stats.red}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Needs a lot more revision
            </p>
          </div>

          {/* UNRANKED CARD */}
          <div 
            onClick={() => setTrafficFilter('all')}
            className="p-3.5 rounded-xl border bg-slate-950/50 border-slate-800 text-slate-300"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-500"></span>
                Unranked
              </span>
              <span className="font-mono text-base text-white">{stats.unranked}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Click slides to rank
            </p>
          </div>
        </div>

        {/* Subject Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {/* Biology */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Biology (B1–B16)</span>
              <span>{stats.subjectStats.biology.green} / {stats.subjectStats.biology.total} Green</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${(stats.subjectStats.biology.green / Math.max(1, stats.subjectStats.biology.total)) * 100}%` }}
              />
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${(stats.subjectStats.biology.orange / Math.max(1, stats.subjectStats.biology.total)) * 100}%` }}
              />
              <div 
                className="bg-rose-500 h-full" 
                style={{ width: `${(stats.subjectStats.biology.red / Math.max(1, stats.subjectStats.biology.total)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>🟢 {stats.subjectStats.biology.green}</span>
              <span>🟠 {stats.subjectStats.biology.orange}</span>
              <span>🔴 {stats.subjectStats.biology.red}</span>
            </div>
          </div>

          {/* Chemistry */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-sky-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Chemistry (C1–C12)</span>
              <span>{stats.subjectStats.chemistry.green} / {stats.subjectStats.chemistry.total} Green</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${(stats.subjectStats.chemistry.green / Math.max(1, stats.subjectStats.chemistry.total)) * 100}%` }}
              />
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${(stats.subjectStats.chemistry.orange / Math.max(1, stats.subjectStats.chemistry.total)) * 100}%` }}
              />
              <div 
                className="bg-rose-500 h-full" 
                style={{ width: `${(stats.subjectStats.chemistry.red / Math.max(1, stats.subjectStats.chemistry.total)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>🟢 {stats.subjectStats.chemistry.green}</span>
              <span>🟠 {stats.subjectStats.chemistry.orange}</span>
              <span>🔴 {stats.subjectStats.chemistry.red}</span>
            </div>
          </div>

          {/* Physics */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Physics (P1–P5)</span>
              <span>{stats.subjectStats.physics.green} / {stats.subjectStats.physics.total} Green</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${(stats.subjectStats.physics.green / Math.max(1, stats.subjectStats.physics.total)) * 100}%` }}
              />
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${(stats.subjectStats.physics.orange / Math.max(1, stats.subjectStats.physics.total)) * 100}%` }}
              />
              <div 
                className="bg-rose-500 h-full" 
                style={{ width: `${(stats.subjectStats.physics.red / Math.max(1, stats.subjectStats.physics.total)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>🟢 {stats.subjectStats.physics.green}</span>
              <span>🟠 {stats.subjectStats.physics.orange}</span>
              <span>🔴 {stats.subjectStats.physics.red}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED SUBTOPIC TRAFFIC LIGHT MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Subtopic Traffic Light Directory & Revision Priority</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any subtopic to jump directly to its lesson slides and take the 10-question quiz.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
            {(['all', 'biology', 'chemistry', 'physics'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                  activeCategory === cat ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subtopics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedSubtopics.map(sub => {
            const currentLight = trafficLights[sub.subtopicCode];
            const quizResult = quizScores[sub.subtopicCode];

            return (
              <div 
                key={sub.subtopicCode}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      [{sub.subtopicCode}]
                    </span>
                    <span className="text-xs capitalize text-slate-400 font-medium">
                      {sub.subject}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                      {sub.tier}
                    </span>

                    {/* Traffic Light Badge */}
                    {currentLight === 'green' && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Green (Mastered)
                      </span>
                    )}
                    {currentLight === 'orange' && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Orange (Revise)
                      </span>
                    )}
                    {currentLight === 'red' && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Red (High Priority)
                      </span>
                    )}
                    {!currentLight && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full text-slate-500 border border-dashed border-slate-700">
                        Unranked
                      </span>
                    )}

                    {/* Quiz score badge if available */}
                    {quizResult && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        Quiz: {quizResult.score}/10 ({quizResult.percentage}%)
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{sub.title}</h3>
                </div>

                <button
                  onClick={() => onNavigateToTopic(sub.subtopicCode)}
                  title="Open lesson slides and quiz for this subtopic"
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition shrink-0 flex items-center gap-1 text-xs font-medium"
                >
                  <span className="hidden sm:inline">Slides</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOPIC CONFIDENCE MATRIX (Syllabus Units) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>Syllabus Unit Confidence Ratings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Star ratings automatically feed into your AI Revision Schedule and Recommendations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSyllabusItems.map(item => {
            const currentRating = progress.topicConfidence[item.code] || 3;

            return (
              <div 
                key={item.code}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {item.code}
                      </span>
                      <span className="text-xs capitalize text-slate-400 font-medium">
                        {item.subject}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
                  </div>

                  <button
                    onClick={() => onNavigateToTopic(item.code)}
                    title="Open lesson slides for this topic"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">Confidence Level:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(starVal => (
                      <button
                        key={starVal}
                        onClick={() => onUpdateConfidence(item.code, starVal)}
                        className={`p-1 transition ${
                          starVal <= currentRating
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
