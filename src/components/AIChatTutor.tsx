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
    <div className="max-w-4xl mx-auto space-y-5 text-left">
      {/* Header with Title and Mode Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold">
              <Bot className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Cambridge 0653 AI Science Tutor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Full AI Active
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Grounded in the official 2025–2027 CAIE syllabus, mark schemes and examiner reports
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Tier Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#FDFBF7] p-1 rounded-xl border border-black text-xs font-semibold">
            <span className="px-2 text-slate-600 text-[11px]">Tier:</span>
            <button
              onClick={() => setActiveTier('Core')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTier === 'Core'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Core (C–G)
            </button>
            <button
              onClick={() => setActiveTier('Extended')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTier === 'Extended'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Extended (A*–C)
            </button>
          </div>

          <button
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-black font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mr-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            Focus Subject:
          </span>
          {(['All', 'Biology', 'Chemistry', 'Physics', 'Practical'] as SubjectFilter[]).map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                selectedSubject === subj
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-[#FDFBF7] text-slate-700 border border-slate-300 hover:border-black hover:text-black'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Prompt Templates */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-600 font-semibold mr-1">Templates:</span>
          <button
            onClick={() => applyTemplate('explain')}
            className="px-2 py-0.5 rounded text-[11px] bg-[#FDFBF7] border border-black text-slate-800 hover:bg-slate-100 font-semibold transition"
          >
            Explain
          </button>
          <button
            onClick={() => applyTemplate('model')}
            className="px-2 py-0.5 rounded text-[11px] bg-[#FDFBF7] border border-black text-slate-800 hover:bg-slate-100 font-semibold transition"
          >
            Model Answer
          </button>
          <button
            onClick={() => applyTemplate('calc')}
            className="px-2 py-0.5 rounded text-[11px] bg-[#FDFBF7] border border-black text-slate-800 hover:bg-slate-100 font-semibold transition"
          >
            Calculation
          </button>
          <button
            onClick={() => applyTemplate('pitfalls')}
            className="px-2 py-0.5 rounded text-[11px] bg-[#FDFBF7] border border-black text-slate-800 hover:bg-slate-100 font-semibold transition"
          >
            Examiner Traps
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          Suggested {selectedSubject === 'All' ? 'Cambridge 0653' : selectedSubject} Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {subjectPrompts[selectedSubject].map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 hover:border-black border border-slate-300 text-slate-800 font-medium transition shadow-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[520px] max-h-[700px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  isUser 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#EBF3F5] text-slate-900 border border-teal-200 rounded-tr-none font-medium'
                    : 'bg-[#FDFBF7] border border-[#E2E8F0] text-slate-900 rounded-tl-none'
                }`}>
                  {/* Rich Formatted Message Body */}
                  <div className="space-y-2">
                    {renderFormattedText(msg.content)}
                  </div>

                  <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
                    isUser ? 'border-teal-200/80 text-slate-600 font-medium' : 'border-slate-200 text-slate-600 font-medium'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[9px] border border-emerald-300 font-bold">
                          0653 AI Tutor
                        </span>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-80 hover:opacity-100 transition flex items-center gap-1 text-[10px] text-slate-600 hover:text-black font-semibold"
                        title="Copy to clipboard"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span className="text-emerald-700 font-bold">Copied</span>
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
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-2xl rounded-tl-none p-4 text-xs text-slate-800 flex items-center gap-2.5 shadow-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Consulting Cambridge 0653 syllabus and mark schemes...</p>
                  <p className="text-[11px] text-slate-600 font-medium">Verifying syllabus requirements for {activeTier} tier</p>
                </div>
              </div>
            </div>
          )}

          {lastQueryFailed && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-medium">Offline syllabus archive provided for your query. Click retry to query live AI again.</span>
              </div>
              <button
                onClick={() => handleSend(lastQueryFailed)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 transition"
              >
                Retry Live AI
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E2E8F0]">
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
              placeholder="Ask any 0653 question (e.g. explain electrolysis of aqueous NaCl, calculate acceleration when F=12N)..."
              className="flex-1 bg-[#FDFBF7] border-2 border-black rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition shrink-0 font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Cambridge 0653 Core and Extended syllabus coverage</span>
            <span className="font-semibold text-[11px] text-emerald-700">● Live AI Tutor Connected</span>
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
        <h3 key={idx} className="text-sm sm:text-base font-bold text-emerald-800 mt-2 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{trimmed.replace('### ', '')}</span>
        </h3>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-base font-bold text-slate-900 mt-2 mb-1">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    // Exam Tips & Mark Scheme Notes
    if (trimmed.toLowerCase().includes('exam tip:') || trimmed.toLowerCase().includes('examiner tip:')) {
      return (
        <div key={idx} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs my-1.5 flex items-start gap-2 font-medium">
          <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>{formatBoldText(trimmed)}</div>
        </div>
      );
    }

    // Bullet items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
          <div className="flex-1 text-slate-800">{formatBoldText(content)}</div>
        </div>
      );
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="font-bold text-slate-900 shrink-0 text-xs">{numMatch[1]}.</span>
          <div className="flex-1 text-slate-800">{formatBoldText(numMatch[2])}</div>
        </div>
      );
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={idx} className="border-[#E2E8F0] my-2" />;
    }

    // Regular line with bold formatting
    return (
      <div key={idx} className="leading-relaxed text-slate-800">
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
        <strong key={index} className="font-bold text-slate-900 tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-[#FDFBF7] text-slate-900 font-mono text-[11px] border border-slate-300 font-bold">
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

  if (q.includes('mole') || q.includes('stoichiometry') || q.includes('c3') || q.includes('formula mass')) {
    return `### Stoichiometry & Cambridge 0653 Syllabus Clarification (C3)\n\n• **CRITICAL SYLLABUS BOUNDARY:** In Cambridge IGCSE Combined Science (0653), **candidates DO NOT need to calculate moles from mass (n = m / Mr) or calculate concentration from moles (c = n / V)**, and molar gas volumes (24 dm³) are NOT on the syllabus!\n• **What 0653 Chemistry C3 ACTUALLY requires:**\n  1. **Chemical Formulae:** State formulae of elements and simple compounds; interpret subscripts, brackets (e.g. Ca(OH)₂), and coefficients.\n  2. **Balancing Equations:** Construct word equations and balance simple symbol equations using integer coefficients and state symbols: (s), (l), (g), (aq).\n  3. **Law of Conservation of Mass:** Total mass of reactants equals total mass of products in a closed system (no atoms created or destroyed).\n  4. **Relative Formula Mass (Mr):** Calculate Mr by summing relative atomic masses (Ar).\n  5. **Supplement Tier (Extended):** Deduce ionic formulae from ion charges (e.g. Al³⁺ and O²⁻ ➔ Al₂O₃), and construct balanced ionic equations (omitting spectator ions).\n\n*Examiner Tip:* If you see questions about calculating moles in past papers from 0620 (separate Chemistry) or 0654 (Co-ordinated Sciences), remember they do not apply to your 0653 Combined Science exam!`;
  }

  if (q.includes('resistance') || q.includes('ohm') || q.includes('p4')) {
    return `### Electrical Circuits & Resistance (Cambridge 0653 P4)\n\n• **Ohm's Law:** \`R = V / I\` (Resistance = Potential Difference ÷ Current)\n• **Series Circuits:** \`R_total = R₁ + R₂\`, current is identical at all points.\n• **Parallel Circuits:** \`1/R_total = 1/R₁ + 1/R₂\` (combined resistance is less than the smallest individual resistor).\n• **Power Equations:** \`P = V × I = I² × R\` (Watts)\n• **Energy:** \`E = P × t = V × I × t\` (Joules)`;
  }

  return `### Cambridge IGCSE 0653 Science Tutor Response\n\nRegarding your question on **"${query}"** in ${subject === 'All' ? 'Combined Science' : subject} (${tier} Tier):\n\n1. **Core Principles:** Focus on clear scientific terminology and definitions approved by Cambridge Assessment.\n2. **Calculations & Formulas:** Always state the formula first, substitute values with proper units, and calculate the final result.\n3. **Exam Technique:** Command words are crucial: **State** requires a concise fact; **Describe** outlines what happens; **Explain** provides the underlying scientific reason or mechanism.\n\nPlease ask any specific follow-up question, or request a 3-mark model answer with mark scheme criteria!`;
}
