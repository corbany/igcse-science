import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  FileDown, 
  ArrowRight,
  BookOpen,
  Check
} from 'lucide-react';
import { RevisionScheduleItem, UserProfile } from '../types';

interface RevisionScheduleProps {
  user: UserProfile;
  weakTopics: string[];
  onOpenLesson: (topicCode: string) => void;
}

export const RevisionSchedule: React.FC<RevisionScheduleProps> = ({
  user,
  weakTopics,
  onOpenLesson
}) => {
  const [examDate, setExamDate] = useState<string>(user.examDate || '2026-05-15');
  const [dailyHours, setDailyHours] = useState<number>(1.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const [scheduleItems, setScheduleItems] = useState<RevisionScheduleItem[]>([
    {
      id: 'sch-1',
      day: 'Monday',
      date: 'Day 1',
      subject: 'biology',
      topicCode: 'B5',
      topicTitle: 'Enzymes & Active Sites',
      tasks: [
        'Review B5 lesson slides: lock and key hypothesis',
        'Memorise effect of temperature and pH denaturation curves',
        'Complete 10-minute active recall flashcards'
      ],
      estimatedMinutes: 45,
      completed: false
    },
    {
      id: 'sch-2',
      day: 'Tuesday',
      date: 'Day 2',
      subject: 'chemistry',
      topicCode: 'C4',
      topicTitle: 'Electrolysis & Ionic Half-Equations',
      tasks: [
        'Practice molten vs aqueous electrolyte discharge rules at cathode/anode',
        'Write 4 half-equations for H+, OH-, Cl-, and Cu2+',
        'Test yourself on qualitative test for chlorine gas'
      ],
      estimatedMinutes: 50,
      completed: false
    },
    {
      id: 'sch-3',
      day: 'Wednesday',
      date: 'Day 3',
      subject: 'physics',
      topicCode: 'P1',
      topicTitle: 'Motion, Velocity-Time Graphs & Density',
      tasks: [
        'Calculate acceleration from gradient of speed-time graphs',
        'Calculate distance travelled using area under graph',
        'Practice 3 density displacement beaker calculation questions'
      ],
      estimatedMinutes: 45,
      completed: false
    },
    {
      id: 'sch-4',
      day: 'Thursday',
      date: 'Day 4',
      subject: 'biology',
      topicCode: 'B9',
      topicTitle: 'Transport in Animals & Double Circulation',
      tasks: [
        'Label heart chambers, valves, and pulmonary/systemic vessels',
        'Explain why left ventricle wall is thicker than right ventricle wall',
        'Compare blood pressure in arteries, veins, and capillaries'
      ],
      estimatedMinutes: 45,
      completed: false
    },
    {
      id: 'sch-5',
      day: 'Friday',
      date: 'Day 5',
      subject: 'chemistry',
      topicCode: 'C9',
      topicTitle: 'Metals, Reactivity Series & Blast Furnace Extraction',
      tasks: [
        'Review reactivity series order (K, Na, Ca, Mg, Al, C, Zn, Fe, H, Cu)',
        'Memorise 3 reactions in the blast furnace for extraction of iron',
        'Explain role of limestone (calcium carbonate) in slag formation'
      ],
      estimatedMinutes: 50,
      completed: false
    },
    {
      id: 'sch-6',
      day: 'Saturday',
      date: 'Day 6 (Exam Simulation)',
      subject: 'physics',
      topicCode: 'P4',
      topicTitle: 'Electricity Circuits & Parallel Resistance',
      tasks: [
        'Solve 15-minute mock section from Specimen Paper 4',
        'Calculate total resistance in parallel (1/R = 1/R1 + 1/R2)',
        'Check self against Cambridge mark scheme criteria'
      ],
      estimatedMinutes: 60,
      completed: false
    },
    {
      id: 'sch-7',
      day: 'Sunday',
      date: 'Day 7',
      subject: 'mixed',
      topicCode: 'B4/C12/P2',
      topicTitle: 'Weekly Synthesis, Error Log & Flashcard Review',
      tasks: [
        'Review error notebook and re-attempt missed quiz questions',
        'Qualitative analysis test drills (flame tests and cation precipitates)',
        'Plan upcoming week based on mastery confidence ratings'
      ],
      estimatedMinutes: 45,
      completed: false
    }
  ]);

  const handleGenerateAI = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate,
          dailyHours,
          tier: user.tier,
          weakTopics: weakTopics.length > 0 ? weakTopics : ['C4 Electrolysis', 'B5 Enzymes', 'P4 Electricity']
        })
      });
      const data = await res.json();
      if (data.schedule && Array.isArray(data.schedule)) {
        setScheduleItems(data.schedule);
      }
    } catch (e) {
      console.error('Failed to generate AI schedule:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskDone = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleExportSchedule = () => {
    const lines = [
      `# Cambridge IGCSE Combined Science 0653 - Adaptive Revision Timetable`,
      `Target Exam Date: ${examDate} | Daily Target: ${dailyHours} hours | Tier: ${user.tier}`,
      `\n=======================================================\n`
    ];

    scheduleItems.forEach((item, idx) => {
      lines.push(`## ${item.day || 'Day ' + (idx + 1)} - [${item.topicCode || 'Science'}] ${item.topicTitle || 'Review'} (${item.estimatedMinutes || 45} mins)`);
      if (item.tasks && item.tasks.length > 0) {
        item.tasks.forEach((t: string) => lines.push(`- [ ] ${t}`));
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IGCSE-0653-Revision-Timetable.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <span>AI-Driven Adaptive Revision Timetable</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalized weekly study calendar dynamically calibrated to your weak topics, exam tier, and available daily hours.
          </p>
        </div>

        <button
          onClick={handleExportSchedule}
          className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-2 transition shrink-0"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Plan (.MD)</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Daily Study Target
            </label>
            <select
              value={dailyHours}
              onChange={e => setDailyHours(parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={0.75}>45 mins / day</option>
              <option value={1.0}>1.0 hour / day</option>
              <option value={1.5}>1.5 hours / day</option>
              <option value={2.0}>2.0 hours / day</option>
              <option value={3.0}>3.0 hours / day (Intensive)</option>
            </select>
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recalibrating Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Adaptive Schedule</span>
              </>
            )}
          </button>
        </div>

        {weakTopics.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-300">Priority Weak Topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.map((wt, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {wt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timetable Cards */}
      <div className="space-y-3.5">
        {scheduleItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {item.day}
                </span>
                <span className="font-bold text-sm text-white">
                  [{item.topicCode}] {item.topicTitle}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {item.estimatedMinutes} mins
                </span>
                <button
                  onClick={() => onOpenLesson(item.topicCode || 'B2')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Lesson Deck</span>
                </button>
              </div>
            </div>

            {/* Task Checklist */}
            <div className="space-y-2">
              {(item.tasks || []).map((task: string, tIdx: number) => {
                const taskId = `${item.id || idx}-t-${tIdx}`;
                const isDone = completedTasks[taskId];

                return (
                  <div
                    key={tIdx}
                    onClick={() => toggleTaskDone(taskId)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through'
                        : 'bg-slate-800/40 border-slate-800 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'
                    }`}>
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="leading-relaxed">{task}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
