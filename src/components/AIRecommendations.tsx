import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-teal-700" />
            <span>AI Personalised Learning Recommendations</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Intelligent diagnostic recommendations pinpointing syllabus gaps, examiner pitfalls, and immediate revision actions.
          </p>
        </div>

        <button
          onClick={fetchAIRecommendations}
          disabled={loading}
          className="text-xs px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-xs transition shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Diagnostics Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-1.5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Current Profile Tier
          </span>
          <div className="text-lg font-bold text-slate-900">{user.tier} Curriculum</div>
          <p className="text-xs text-slate-600">
            {user.tier === 'Extended' ? 'Targeting Grades A* to C (Core + Supplement)' : 'Targeting Grades C to G (Core Content)'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-1.5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            Quiz Mastery Logs
          </span>
          <div className="text-lg font-bold text-slate-900">
            {Object.keys(progress.quizScores).length > 0 ? `${Object.keys(progress.quizScores).length} Subjects Evaluated` : 'Diagnostic Active'}
          </div>
          <p className="text-xs text-slate-600">Continuous tracking of strengths and weaknesses</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-1.5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-sky-600" />
            High Priority Alerts
          </span>
          <div className="text-lg font-bold text-sky-900">
            {recommendations.filter(r => r.priority === 'high').length} Action Items
          </div>
          <p className="text-xs text-slate-600">Critical topics with high mark weighting</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Targeted Remedial Pathway
        </h2>

        {recommendations.map(rec => {
          const isHigh = rec.priority === 'high';
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs transition space-y-4 ${
                isHigh ? 'border-amber-300 bg-[#FDFBF7]' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase font-mono ${
                    isHigh
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-sky-50 text-sky-800 border-sky-300'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    [{rec.topicCode}] {rec.topicTitle}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenTopicSlides(rec.actionLink || rec.topicCode || 'B2')}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-black font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Launch Topic Slides</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>

              {/* Diagnostic Reason */}
              <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">Diagnostic Finding:</span>
                <p className="leading-relaxed">{rec.reason}</p>
              </div>

              {/* Prescribed Action */}
              <div className="bg-[#EBF3F5] p-3.5 rounded-xl border border-teal-200 text-xs text-slate-800 space-y-1">
                <span className="font-bold text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  Recommended Action Step:
                </span>
                <p className="leading-relaxed text-slate-800 font-medium">{rec.suggestedAction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
