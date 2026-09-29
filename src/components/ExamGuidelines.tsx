import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookCheck, 
  HelpCircle, 
  FileCheck, 
  Search, 
  Sparkles, 
  FlaskConical, 
  Info,
  Scale
} from 'lucide-react';
import { examTierDetails, commandWordsGlossary, qualitativeAnalysisNotes } from '../data/examGuidelinesData';

export const ExamGuidelines: React.FC = () => {
  const [commandSearch, setCommandSearch] = useState<string>('');
  const [qualitativeFilter, setQualitativeFilter] = useState<'all' | 'cation' | 'anion' | 'gas' | 'flame'>('all');

  const filteredCommandWords = commandWordsGlossary.filter(cw => 
    cw.word.toLowerCase().includes(commandSearch.toLowerCase()) ||
    cw.meaning.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const filteredQualitative = qualitativeAnalysisNotes.filter(item => 
    qualitativeFilter === 'all' || item.type === qualitativeFilter
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>Cambridge IGCSE 0653 Examination Guidelines</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete guide to Core vs Extended assessment tiers, paper structures, command words, and qualitative analysis tests.
        </p>
      </div>

      {/* Core vs Extended Comparison Bento */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <span>Core vs. Extended Content & Examination Comparison</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examTierDetails.tiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl border p-6 space-y-4 ${
                tier.name.includes('Extended')
                  ? 'bg-amber-950/10 border-amber-500/30'
                  : 'bg-blue-950/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${tier.name.includes('Extended') ? 'text-amber-300' : 'text-blue-300'}`}>
                  {tier.name}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  tier.name.includes('Extended')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  {tier.gradeRange}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tier.targetCandidates}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Required Papers:
                </h4>
                {tier.papers.map((p, pIdx) => (
                  <div key={pIdx} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{p.name}</span>
                      <span className="text-emerald-400">{p.weighting}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{p.duration}</span>
                      <span>{p.marks} marks</span>
                    </div>
                    <p className="text-xs text-slate-300 pt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Objectives Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-emerald-400" />
          <span>Assessment Objectives (AO) Weightings</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {examTierDetails.assessmentObjectives.map(ao => (
            <div key={ao.code} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400 text-sm">{ao.code}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {ao.weighting}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm">{ao.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ao.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Cambridge Command Words */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Official Cambridge Command Words Glossary</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Knowing what each command word demands is critical for scoring maximum marks on Paper 3 & 4.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={commandSearch}
              onChange={e => setCommandSearch(e.target.value)}
              placeholder="Search command word..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCommandWords.map(cw => (
            <div key={cw.word} className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl space-y-1.5 hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-300">{cw.word}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono">Command</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{cw.meaning}</p>
              <p className="text-[11px] text-slate-400 italic">e.g. "{cw.example}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes for use in Qualitative Analysis Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-400" />
              <span>Notes for use in Qualitative Analysis (C12.4)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identical to the reference sheet provided at the back of official Cambridge 0653 Paper 5 & 6 exams.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg text-xs">
            {(['all', 'anion', 'cation', 'gas', 'flame'] as const).map(type => (
              <button
                key={type}
                onClick={() => setQualitativeFilter(type)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                  qualitativeFilter === type
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-200 border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 border-b border-slate-800">Ion / Gas / Specimen</th>
                <th className="p-3 border-b border-slate-800">Test Procedure</th>
                <th className="p-3 border-b border-slate-800">Expected Result</th>
                <th className="p-3 border-b border-slate-800 hidden md:table-cell">Key Equation / Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {filteredQualitative.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-emerald-300 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="p-3 text-slate-300">{item.testProcedure}</td>
                  <td className="p-3 text-amber-300 font-medium">{item.expectedResult}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 hidden md:table-cell">
                    {item.chemicalEquationOrDetails || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
