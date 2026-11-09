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
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            <span>Interactive Syllabus Notebook</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Map your personal study notes directly to official Cambridge 0653 syllabus outcomes (B1–B16, C1–C12, P1–P5).
          </p>
        </div>

        <button
          onClick={handleExportNotes}
          className="text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center gap-2 shadow-xs transition shrink-0 cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>Export All Notes (.MD)</span>
        </button>
      </div>

      {/* Main Grid: Left Syllabus Topics, Right Notebook & Specification Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topic Selector */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide px-1">
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
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF3F5] border-2 border-black text-slate-900 shadow-2xs font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-[#FDFBF7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-[#FDFBF7] text-slate-700 border border-slate-300'
                    }`}>
                      {item.code}
                    </span>
                    <span className="text-xs sm:text-sm font-medium line-clamp-1">{item.title}</span>
                  </div>

                  {hasNotes && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold">
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
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
              {/* Topic Title & Badges */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#EBF3F5] text-slate-800 border border-slate-300 uppercase">
                      {activeItem.code} • {activeItem.subject}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Cambridge IGCSE 0653</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-1.5">{activeItem.title}</h2>
                </div>

                <button
                  onClick={() => onAskAITutor(`Generate 3 key revision summary cards with mark scheme points for topic ${activeItem.code} (${activeItem.title}).`, activeItem.code)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-black font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  <span>AI Study Guide</span>
                </button>
              </div>

              {/* Core Objectives */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Core Learning Objectives (Grades C to G)
                </h3>
                <ul className="space-y-1.5 pl-4 text-sm text-slate-700 list-disc marker:text-emerald-600">
                  {activeItem.coreObjectives.map((obj, i) => (
                    <li key={i} className="leading-relaxed">{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Supplement Objectives if present */}
              {activeItem.supplementObjectives && activeItem.supplementObjectives.length > 0 && (
                <div className="space-y-2 bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    Supplement / Extended Objectives (Grades A* to C)
                  </h3>
                  <ul className="space-y-1.5 pl-4 text-sm text-slate-800 list-disc marker:text-amber-600">
                    {activeItem.supplementObjectives.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Essential Keywords */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-600" />
                  Essential Cambridge 0653 Vocabulary
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.essentialKeywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#FDFBF7] text-slate-800 border border-slate-300 font-bold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common Misconceptions if any */}
              {activeItem.commonMisconceptions && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    Common Examiner Pitfalls to Avoid
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-800 list-disc pl-4">
                    {activeItem.commonMisconceptions.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Personal Notes Editor */}
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    My Personal Revision Notes & Summaries
                  </label>
                  <span className="text-xs text-slate-500">Auto-saved locally</span>
                </div>
                <textarea
                  rows={6}
                  value={currentNote}
                  onChange={e => handleNoteChange(e.target.value)}
                  placeholder={`Write your revision notes, formula mnemonics, or flashcard cues for [${activeItem.code}] ${activeItem.title} here...`}
                  className="w-full bg-[#FDFBF7] border-2 border-black rounded-xl p-3.5 text-base text-slate-800 placeholder-slate-500 focus:outline-none focus:bg-white transition leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
