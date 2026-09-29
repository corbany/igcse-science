import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Save, 
  FileDown, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Search,
  Check,
  Tag,
  FileText
} from 'lucide-react';
import { ScienceSubject, SyllabusItem } from '../types';
import { syllabusItems } from '../data/syllabusData';

interface SyllabusNotebookProps {
  selectedSubject: ScienceSubject | 'all';
  searchQuery: string;
  savedNotes: Record<string, string>;
  onUpdateNote: (topicCode: string, noteContent: string) => void;
  onAskAITutor: (query: string, topicCode: string) => void;
}

export const SyllabusNotebook: React.FC<SyllabusNotebookProps> = ({
  selectedSubject,
  searchQuery,
  savedNotes,
  onUpdateNote,
  onAskAITutor
}) => {
  const [activeCode, setActiveCode] = useState<string>('B2');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return syllabusItems.filter(item => {
      const matchSubject = selectedSubject === 'all' || item.subject === selectedSubject;
      if (!matchSubject) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchObjectives = item.coreObjectives.some(o => o.toLowerCase().includes(q)) ||
        item.supplementObjectives?.some(s => s.toLowerCase().includes(q));
      const matchKeywords = item.essentialKeywords.some(k => k.toLowerCase().includes(q));
      return matchTitle || matchCode || matchObjectives || matchKeywords;
    });
  }, [selectedSubject, searchQuery]);

  const activeItem = useMemo(() => {
    return syllabusItems.find(i => i.code === activeCode) || filteredItems[0] || syllabusItems[0];
  }, [activeCode, filteredItems]);

  const currentNote = savedNotes[activeItem?.code || ''] || '';

  const handleNoteChange = (text: string) => {
    if (!activeItem) return;
    onUpdateNote(activeItem.code, text);
  };

  const handleExportNotes = () => {
    const lines = [
      `# Cambridge IGCSE Combined Science 0653 - Student Revision Notebook`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      `\n=======================================================\n`
    ];

    syllabusItems.forEach(item => {
      const note = savedNotes[item.code];
      lines.push(`## [${item.code}] ${item.title} (${item.subject.toUpperCase()})`);
      lines.push(`### Essential Keywords: ${item.essentialKeywords.join(', ')}`);
      lines.push(`### Core Objectives:`);
      item.coreObjectives.forEach(o => lines.push(`- ${o}`));
      if (item.supplementObjectives) {
        lines.push(`### Supplement (Extended) Objectives:`);
        item.supplementObjectives.forEach(s => lines.push(`- ${s}`));
      }
      lines.push(`\n### Student Revision Notes:`);
      lines.push(note || '*No personal notes written yet.*');
      lines.push(`\n-------------------------------------------------------\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IGCSE-0653-Revision-Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Interactive Syllabus Notebook</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Map your personal study notes directly to official Cambridge 0653 syllabus outcomes (B1–B16, C1–C12, P1–P5).
          </p>
        </div>

        <button
          onClick={handleExportNotes}
          className="text-xs px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <FileDown className="w-4 h-4" />
          <span>Export All Notes (.MD)</span>
        </button>
      </div>

      {/* Main Grid: Left Syllabus Topics, Right Notebook & Specification Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topic Selector */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Syllabus Specification
          </h2>

          <div className="space-y-1.5">
            {filteredItems.map(item => {
              const isSelected = item.code === activeItem?.code;
              const hasNotes = Boolean(savedNotes[item.code]?.trim());

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCode(item.code)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40 text-white'
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
                      {item.code}
                    </span>
                    <span className="text-sm font-medium line-clamp-1">{item.title}</span>
                  </div>

                  {hasNotes && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Note
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details & Notebook Editor */}
        <div className="lg:col-span-8 space-y-5">
          {activeItem && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-md">
              {/* Topic Title & Badges */}
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {activeItem.code} • {activeItem.subject}
                    </span>
                    <span className="text-xs text-slate-400">Cambridge IGCSE 0653</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5">{activeItem.title}</h2>
                </div>

                <button
                  onClick={() => onAskAITutor(`Generate 3 key revision summary cards with mark scheme points for topic ${activeItem.code} (${activeItem.title}).`, activeItem.code)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Study Guide</span>
                </button>
              </div>

              {/* Core Objectives */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Core Learning Objectives (Grades C to G)
                </h3>
                <ul className="space-y-1.5 pl-4 text-xs sm:text-sm text-slate-300 list-disc marker:text-emerald-400">
                  {activeItem.coreObjectives.map((obj, i) => (
                    <li key={i} className="leading-relaxed">{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Supplement Objectives if present */}
              {activeItem.supplementObjectives && activeItem.supplementObjectives.length > 0 && (
                <div className="space-y-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Supplement / Extended Objectives (Grades A* to C)
                  </h3>
                  <ul className="space-y-1.5 pl-4 text-xs sm:text-sm text-slate-200 list-disc marker:text-amber-400">
                    {activeItem.supplementObjectives.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Essential Keywords */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Essential Cambridge 0653 Vocabulary
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.essentialKeywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common Misconceptions if any */}
              {activeItem.commonMisconceptions && (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    Common Examiner Pitfalls to Avoid
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-200 list-disc pl-4">
                    {activeItem.commonMisconceptions.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Personal Notes Editor */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    My Personal Revision Notes & Summaries
                  </label>
                  <span className="text-[11px] text-slate-500">Auto-saved locally</span>
                </div>
                <textarea
                  rows={6}
                  value={currentNote}
                  onChange={e => handleNoteChange(e.target.value)}
                  placeholder={`Write your revision notes, formula mnemonics, or flashcard cues for [${activeItem.code}] ${activeItem.title} here...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
