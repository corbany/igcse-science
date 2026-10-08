import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  RefreshCw, 
  Lightbulb,
  BookOpen,
  Copy,
  Check,
  Award,
  Zap,
  HelpCircle,
  FileText,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, UserProfile, ExamTier } from '../types';

interface AIChatTutorProps {
  user: UserProfile;
  initialTopicQuery?: string;
}

type SubjectFilter = 'All' | 'Biology' | 'Chemistry' | 'Physics' | 'Practical';

export const AIChatTutor: React.FC<AIChatTutorProps> = ({ user, initialTopicQuery }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('All');
  const [activeTier, setActiveTier] = useState<ExamTier>(user.tier || 'Extended');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user.name}! I am your dedicated Cambridge IGCSE Combined Science (0653) AI Tutor.\n\nI have full syllabus knowledge across Biology (B1–B16), Chemistry (C1–C12), and Physics (P1–P5). I can:\n• Explain complex concepts and particle mechanisms\n• Write model 3-mark and 4-mark answers using official mark schemes\n• Provide balanced chemical equations and electrolysis rules\n• Guide you step-by-step through Physics calculations with correct SI units\n• Help you master Paper 6 qualitative analysis and experimental variables\n\nWhat topic or question are you working on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastQueryFailed, setLastQueryFailed] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTopicQuery) {
      setInput(initialTopicQuery);
      // Auto-detect subject from initial query if possible
      const q = initialTopicQuery.toUpperCase();
      if (q.includes('B') && /\bB\d+/.test(q)) setSelectedSubject('Biology');
      else if (q.includes('C') && /\bC\d+/.test(q)) setSelectedSubject('Chemistry');
      else if (q.includes('P') && /\bP\d+/.test(q)) setSelectedSubject('Physics');
    }
  }, [initialTopicQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const subjectPrompts: Record<SubjectFilter, string[]> = {
    All: [
      "What is the difference between active transport and diffusion?",
      "How do I predict products at the anode and cathode in electrolysis?",
      "Explain how to calculate combined resistance for 2 resistors in parallel.",
      "How do I distinguish between Ca²⁺ and Zn²⁺ in qualitative analysis?",
      "Give me a 3-mark model answer for why enzymes denature at high temperatures."
    ],
    Biology: [
      "Explain how the lock-and-key hypothesis describes enzyme action (B5).",
      "Give the balanced chemical equation for photosynthesis and explain limiting factors (B6).",
      "Why do root hair cells need lots of mitochondria for active transport (B3)?",
      "What are the adaptations of alveoli for gas exchange (B11)?",
      "Compare the structure of arteries, veins, and capillaries (B9)."
    ],
    Chemistry: [
      "Explain the products of electrolysis of concentrated aqueous NaCl (C4).",
      "What are the 3 reactions inside the blast furnace to extract iron (C9)?",
      "How do I test for carbonate, sulfate, and halide ions (C12)?",
      "Explain why reactivity increases down Group 1 but decreases down Group 7 (C8).",
      "Distinguish between exothermic and endothermic reactions with energy profile diagrams (C5)."
    ],
    Physics: [
      "How do I calculate kinetic energy and gravitational potential energy (P1)?",
      "Explain Ohm's Law and calculate resistance in series vs parallel (P4).",
      "State the wave equation v = fλ and order the electromagnetic spectrum (P3).",
      "Explain thermal conduction in terms of particle vibrations and free electrons (P2).",
      "How do I calculate acceleration and distance from a speed-time graph (P1)?"
    ],
    Practical: [
      "What are the flame test colours for Li⁺, Na⁺, K⁺, Cu²⁺, and Ca²⁺?",
      "How do I test for water using anhydrous cobalt(II) chloride and copper(II) sulfate?",
      "How do I distinguish between pure water and a salt solution?",
      "How do I identify independent, dependent, and controlled variables in an experiment?",
      "What is the test for hydrogen, oxygen, carbon dioxide, chlorine, and ammonia gases?"
    ]
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLastQueryFailed(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          tier: activeTier,
          topic: selectedSubject !== 'All' ? `Cambridge 0653 ${selectedSubject}` : 'Cambridge IGCSE 0653 Combined Science',
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      
      const replyContent = data.reply || (data.analysis ? JSON.stringify(data.analysis) : null);
      if (replyContent) {
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('No reply received from server');
      }
    } catch (err) {
      console.warn('Chat fetch encountered error, using local syllabus engine:', err);
      setLastQueryFailed(query);

      // Provide a smart local syllabus answer rather than a static failure
      const fallbackReply = getLocalSyllabusAnswer(query, selectedSubject, activeTier);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat cleared. Ask me any Cambridge 0653 syllabus question across Biology, Chemistry, or Physics!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLastQueryFailed(null);
  };

  // Helper for quick question templates
  const applyTemplate = (templateType: 'explain' | 'model' | 'calc' | 'pitfalls') => {
    let prefix = '';
    if (templateType === 'explain') prefix = 'Explain the Cambridge 0653 concept of: ';
    else if (templateType === 'model') prefix = 'Provide a 3-mark model answer and mark scheme points for: ';
    else if (templateType === 'calc') prefix = 'Show step-by-step calculation working with formulas and SI units for: ';
    else if (templateType === 'pitfalls') prefix = 'What are common examiner traps and misconceptions students make in: ';

    setInput(prefix);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header with Title and Mode Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Cambridge 0653 AI Science Tutor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Full AI Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounded in the official 2025–2027 CAIE syllabus, mark schemes & examiner reports
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Tier Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <span className="px-2 text-slate-400 text-[11px]">Tier:</span>
            <button
              onClick={() => setActiveTier('Core')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTier === 'Core'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Core (C–G)
            </button>
            <button
              onClick={() => setActiveTier('Extended')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTier === 'Extended'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Extended (A*–C)
            </button>
          </div>

          <button
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-medium flex items-center gap-1.5 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Focus Subject:
          </span>
          {(['All', 'Biology', 'Chemistry', 'Physics', 'Practical'] as SubjectFilter[]).map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                selectedSubject === subj
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Prompt Templates */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-500 font-medium mr-1">Templates:</span>
          <button
            onClick={() => applyTemplate('explain')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Explain
          </button>
          <button
            onClick={() => applyTemplate('model')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 transition"
          >
            Model Answer
          </button>
          <button
            onClick={() => applyTemplate('calc')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 transition"
          >
            Calculation
          </button>
          <button
            onClick={() => applyTemplate('pitfalls')}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-300 transition"
          >
            Examiner Traps
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Suggested {selectedSubject === 'All' ? 'Cambridge 0653' : selectedSubject} Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {subjectPrompts[selectedSubject].map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:border-slate-600 border border-slate-700/80 text-slate-200 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[520px] max-h-[700px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tl-none'
                }`}>
                  {/* Rich Formatted Message Body */}
                  <div className="space-y-2">
                    {renderFormattedText(msg.content)}
                  </div>

                  <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
                    isUser ? 'border-emerald-500/40 text-emerald-200' : 'border-slate-700/60 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 font-mono text-[9px] border border-indigo-800/40">
                          0653 AI Tutor
                        </span>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-60 hover:opacity-100 transition flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Consulting Cambridge 0653 Syllabus & Mark Scheme Database...</p>
                  <p className="text-[11px] text-slate-400">Verifying syllabus requirements for {activeTier} tier</p>
                </div>
              </div>
            </div>
          )}

          {lastQueryFailed && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Offline syllabus archive provided for your query. Click retry to query live AI again.</span>
              </div>
              <button
                onClick={() => handleSend(lastQueryFailed)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 transition"
              >
                Retry Live AI
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask any 0653 question (e.g. "Explain electrolysis of aqueous NaCl", "What are the 4 food tests?", "Calculate acceleration when F=12N, m=3kg")...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cambridge 0653 Core & Extended Syllabus Coverage</span>
            <span className="font-mono text-[10px] text-emerald-400">● Live AI Tutor Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rich Science text & markdown renderer
function renderFormattedText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} className="h-1.5" />;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm sm:text-base font-bold text-emerald-300 mt-2 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{trimmed.replace('### ', '')}</span>
        </h3>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-base font-bold text-white mt-2 mb-1">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    // Exam Tips & Mark Scheme Notes
    if (trimmed.toLowerCase().includes('exam tip:') || trimmed.toLowerCase().includes('examiner tip:')) {
      return (
        <div key={idx} className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs my-1.5 flex items-start gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>{formatBoldText(trimmed)}</div>
        </div>
      );
    }

    // Bullet items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <div className="flex-1">{formatBoldText(content)}</div>
        </div>
      );
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="font-bold text-indigo-400 shrink-0 text-xs">{numMatch[1]}.</span>
          <div className="flex-1">{formatBoldText(numMatch[2])}</div>
        </div>
      );
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={idx} className="border-slate-700/60 my-2" />;
    }

    // Regular line with bold formatting
    return (
      <div key={idx} className="leading-relaxed">
        {formatBoldText(trimmed)}
      </div>
    );
  });
}

// Formats **bold** text and `inline code / formulas`
function formatBoldText(str: string) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono text-[11px] border border-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Comprehensive offline syllabus response provider
function getLocalSyllabusAnswer(query: string, subject: SubjectFilter, tier: ExamTier): string {
  const q = query.toLowerCase();

  if (q.includes('active transport') || q.includes('diffusion') || q.includes('osmosis')) {
    return `### Movement In & Out of Cells (Cambridge 0653 B3)\n\n• **Active Transport (${tier} Tier):** Movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (against a concentration gradient) using energy from respiration and carrier proteins.\n  * *Biological Examples:* Root hair cells taking up mineral ions; epithelial cells in villi absorbing glucose.\n  * *Exam Tip:* Always link active transport to cells having abundant **mitochondria** to produce ATP via aerobic respiration.\n• **Diffusion:** Net movement of particles from a region of higher concentration to lower concentration down a concentration gradient (passive).\n• **Osmosis:** Net movement of water molecules from higher water potential to lower water potential through a partially permeable membrane.`;
  }

  if (q.includes('photosynthesis') || q.includes('b6')) {
    return `### Photosynthesis (Cambridge 0653 B6)\n\n• **Word Equation:** Carbon dioxide + Water ➔ Glucose + Oxygen *(requires light and chlorophyll)*\n• **Balanced Chemical Equation (${tier} Tier):** \`6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂\`\n• **Limiting Factors:** Light intensity, Carbon dioxide concentration, Temperature.\n• **Leaf Adaptations:** Palisade mesophyll packed with chloroplasts for maximum light absorption; spongy mesophyll with air spaces for gas diffusion; xylem for water transport; stomata with guard cells for gas exchange.`;
  }

  if (q.includes('enzyme') || q.includes('denatur') || q.includes('b5')) {
    return `### Enzymes (Cambridge 0653 B5)\n\n• **Definition:** Biological catalysts that increase the rate of chemical reactions without being changed. Proteins with a specific 3D active site.\n• **Lock & Key Hypothesis:** Complementary fit between enzyme active site and substrate forming an enzyme-substrate complex.\n• **Denaturation:** At high temperatures (>40°C) or extreme pH, active site changes shape permanently so substrate no longer fits.\n• **Examiner Tip:** Never write that enzymes "die" or "are killed"; write that the active site **denatures**.`;
  }

  if (q.includes('electrolysis') || q.includes('c4')) {
    return `### Electrolysis (Cambridge 0653 C4)\n\n• **Definition:** Breakdown of an ionic compound, molten or aqueous, by the passage of electricity.\n• **Anode (+):** Non-metals produced (or O₂ if no halide present in aqueous solution).\n• **Cathode (-):** Metals or Hydrogen produced (H₂ produced if metal is more reactive than hydrogen).\n• **Molten PbBr₂:** Lead at cathode (grey liquid), Bromine at anode (brown vapor).\n• **Aqueous NaCl:** Hydrogen at cathode, Chlorine at anode, NaOH remaining in solution.`;
  }

  if (q.includes('resistance') || q.includes('ohm') || q.includes('p4')) {
    return `### Electrical Circuits & Resistance (Cambridge 0653 P4)\n\n• **Ohm's Law:** \`R = V / I\` (Resistance = Potential Difference ÷ Current)\n• **Series Circuits:** \`R_total = R₁ + R₂\`, current is identical at all points.\n• **Parallel Circuits:** \`1/R_total = 1/R₁ + 1/R₂\` (combined resistance is less than the smallest individual resistor).\n• **Power Equations:** \`P = V × I = I² × R\` (Watts)\n• **Energy:** \`E = P × t = V × I × t\` (Joules)`;
  }

  return `### Cambridge IGCSE 0653 Science Tutor Response\n\nRegarding your question on **"${query}"** in ${subject === 'All' ? 'Combined Science' : subject} (${tier} Tier):\n\n1. **Core Principles:** Focus on clear scientific terminology and definitions approved by Cambridge Assessment.\n2. **Calculations & Formulas:** Always state the formula first, substitute values with proper units, and calculate the final result.\n3. **Exam Technique:** Command words are crucial: **State** requires a concise fact; **Describe** outlines what happens; **Explain** provides the underlying scientific reason or mechanism.\n\nPlease ask any specific follow-up question, or request a 3-mark model answer with mark scheme criteria!`;
}
