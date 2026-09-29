import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Lightbulb, 
  TrendingUp,
  RefreshCw,
  Award
} from 'lucide-react';
import { AIRecommendation, StudentProgress, UserProfile } from '../types';

interface AIRecommendationsProps {
  user: UserProfile;
  progress: StudentProgress;
  onOpenTopicSlides: (topicCode: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  user,
  progress,
  onOpenTopicSlides
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'rec-1',
      topicCode: 'C4',
      topicTitle: 'Electrolysis & Half Equations',
      priority: 'high',
      reason: 'Low quiz confidence and common exam pitfall: students frequently confuse discharge rules for aqueous solutions at the cathode vs anode.',
      suggestedAction: 'Review C4 slide deck on aqueous NaCl electrolysis. Memorise: if metal is more reactive than hydrogen, H+ discharges at the cathode producing H2 gas.',
      actionLink: 'C4'
    },
    {
      id: 'rec-2',
      topicCode: 'B5',
      topicTitle: 'Enzymes & Active Site Denaturation',
      priority: 'high',
      reason: 'Frequent mark loss on Paper 4: students often write "enzymes die" instead of "active site is denatured and changes shape permanently".',
      suggestedAction: 'Review B5 lesson slides and complete the 3-mark model answer drill on temperature effects on kinetic energy and denaturation.',
      actionLink: 'B5'
    },
    {
      id: 'rec-3',
      topicCode: 'P4',
      topicTitle: 'Electricity & Parallel Resistor Calculations',
      priority: 'medium',
      reason: 'Quantitative calculation skill required for AO2 (30% weighting). Solving 1/R = 1/R1 + 1/R2 requires algebra care.',
      suggestedAction: 'Practice 4 circuit problem questions from the past papers vault and verify units (Amps, Volts, Ohms).',
      actionLink: 'P4'
    },
    {
      id: 'rec-4',
      topicCode: 'C12',
      topicTitle: 'Qualitative Analysis Tests (Cation Precipitates)',
      priority: 'medium',
      reason: 'Crucial for scoring on Paper 6 (Alternative to Practical - 20% weighting).',
      suggestedAction: 'Study the qualitative analysis table in Exam Guidelines. Test yourself on distinguishing Zn2+ vs Ca2+ using excess NaOH vs excess NH3.',
      actionLink: 'C12'
    }
  ]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      const weakTopics = Object.entries(progress.topicConfidence)
        .filter(([_, rating]) => rating <= 2)
        .map(([code]) => code);

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: user.tier,
          weakTopics: weakTopics.length > 0 ? weakTopics : ['C4', 'B5', 'P4'],
          quizScores: progress.quizScores
        })
      });
      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error('Failed to fetch recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Personalized Learning Recommendations</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Intelligent diagnostic recommendations pinpointing syllabus gaps, examiner pitfalls, and immediate revision actions.
          </p>
        </div>

        <button
          onClick={fetchAIRecommendations}
          disabled={loading}
          className="text-xs px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Diagnostics Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Current Profile Tier
          </span>
          <div className="text-lg font-bold text-white">{user.tier} Curriculum</div>
          <p className="text-xs text-slate-400">
            {user.tier === 'Extended' ? 'Targeting Grades A* to C (Core + Supplement)' : 'Targeting Grades C to G (Core Content)'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Quiz Mastery Logs
          </span>
          <div className="text-lg font-bold text-white">
            {Object.keys(progress.quizScores).length > 0 ? `${Object.keys(progress.quizScores).length} Subjects Evaluated` : 'Diagnostic Active'}
          </div>
          <p className="text-xs text-slate-400">Continuous tracking of strengths and weaknesses</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
            High Priority Alerts
          </span>
          <div className="text-lg font-bold text-indigo-300">
            {recommendations.filter(r => r.priority === 'high').length} Action Items
          </div>
          <p className="text-xs text-slate-400">Critical topics with high mark weighting</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Targeted Remedial Pathway
        </h2>

        {recommendations.map(rec => {
          const isHigh = rec.priority === 'high';
          return (
            <div
              key={rec.id}
              className={`bg-slate-900 rounded-2xl p-6 border transition space-y-3.5 shadow-sm ${
                isHigh ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                    isHigh
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <h3 className="font-bold text-base text-white">
                    [{rec.topicCode}] {rec.topicTitle}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenTopicSlides(rec.actionLink || rec.topicCode || 'B2')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-medium flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Launch Topic Slides</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>

              {/* Diagnostic Reason */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-400 block">Diagnostic Finding:</span>
                <p className="leading-relaxed">{rec.reason}</p>
              </div>

              {/* Prescribed Action */}
              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recommended Action Step:
                </span>
                <p className="leading-relaxed text-slate-200">{rec.suggestedAction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
