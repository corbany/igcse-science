import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookCheck, 
  HelpCircle, 
  Search, 
  FlaskConical, 
  Info,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  examTierDetails, 
  commandWordsGlossary, 
  qualitativeAnalysisNotes,
  syllabusClarifications 
} from '../data/examGuidelinesData';

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
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-teal-700" />
            <span>Cambridge IGCSE 0653 Examination Guidelines</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete guide to Core vs Extended assessment tiers, paper structures, command words, and qualitative analysis tests.
          </p>
        </div>
      </div>

      {/* Core vs Extended Comparison Bento */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-600" />
          <span>Core vs. Extended Content & Examination Comparison</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examTierDetails.tiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl border p-6 space-y-4 shadow-xs ${
                tier.name.includes('Extended')
                  ? 'bg-white border-amber-300'
                  : 'bg-white border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className={`text-lg font-bold ${tier.name.includes('Extended') ? 'text-amber-900' : 'text-sky-900'}`}>
                  {tier.name}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  tier.name.includes('Extended')
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-sky-50 text-sky-800 border-sky-300'
                }`}>
                  {tier.gradeRange}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {tier.targetCandidates}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Papers:
                </h4>
                {tier.papers.map((p, pIdx) => (
                  <div key={pIdx} className="bg-[#FDFBF7] border border-slate-200 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{p.name}</span>
                      <span className="text-emerald-700">{p.weighting}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{p.duration}</span>
                      <span>{p.marks} marks</span>
                    </div>
                    <p className="text-xs text-slate-700 pt-1 font-medium">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Objectives Breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-emerald-600" />
          <span>Assessment Objectives (AO) Weightings</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {examTierDetails.assessmentObjectives.map(ao => (
            <div key={ao.code} className="bg-[#FDFBF7] border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800 text-sm">{ao.code}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {ao.weighting}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ao.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{ao.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Cambridge 0653 Key Syllabus Boundaries & Exclusions */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Cambridge 0653 Key Syllabus Boundaries & Exclusions</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Understanding what is <strong className="text-emerald-700 font-bold">in</strong> and <strong className="text-rose-700 font-bold">out</strong> of the Cambridge IGCSE Combined Science 0653 syllabus ensures you focus on high-scoring topics without revising unnecessary content from separate sciences.
          </p>
        </div>

        <div className="space-y-4">
          {syllabusClarifications.map((item, idx) => (
            <div key={idx} className="bg-[#FDFBF7] border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EBF3F5] text-teal-800 border border-teal-300">
                    {item.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.topic}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  {item.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required Content */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>Tested in 0653 Syllabus</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.includedContent.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold leading-none mt-1">•</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded Content */}
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-700" />
                    <span>Excluded from 0653 Syllabus (DO NOT REVISE)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.excludedContent.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-700 font-bold leading-none mt-1">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Examiner Tip Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="font-bold text-amber-950">Examiner Advice: </strong>
                  {item.examinerTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Cambridge Command Words */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-700" />
              <span>Official Cambridge Command Words Glossary</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Knowing what each command word demands is critical for scoring maximum marks on Paper 3 & 4.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={commandSearch}
              onChange={e => setCommandSearch(e.target.value)}
              placeholder="Search command word..."
              className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCommandWords.map(cw => (
            <div key={cw.word} className="bg-[#FDFBF7] border border-slate-200 p-4 rounded-xl space-y-1.5 hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{cw.word}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Command</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{cw.meaning}</p>
              <p className="text-[11px] text-slate-500 font-medium">e.g. "{cw.example}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes for use in Qualitative Analysis Sheet */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-700" />
              <span>Notes for use in Qualitative Analysis (C12.4)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Identical to the reference sheet provided at the back of official Cambridge 0653 Paper 5 & 6 exams.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FDFBF7] border border-slate-300 p-1 rounded-xl text-xs">
            {(['all', 'anion', 'cation', 'gas', 'flame'] as const).map(type => (
              <button
                key={type}
                onClick={() => setQualitativeFilter(type)}
                className={`px-3 py-1 rounded-lg capitalize font-bold transition cursor-pointer ${
                  qualitativeFilter === type
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-800 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#FDFBF7] text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Ion / Gas / Specimen</th>
                <th className="p-3">Test Procedure</th>
                <th className="p-3">Expected Result</th>
                <th className="p-3 hidden md:table-cell">Key Equation / Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredQualitative.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{item.testProcedure}</td>
                  <td className="p-3 text-amber-800 font-bold">{item.expectedResult}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 font-medium hidden md:table-cell">
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
