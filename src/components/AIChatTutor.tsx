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
  BookOpen
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';

interface AIChatTutorProps {
  user: UserProfile;
  initialTopicQuery?: string;
}

export const AIChatTutor: React.FC<AIChatTutorProps> = ({ user, initialTopicQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user.name}! I am your dedicated Cambridge IGCSE Combined Science (0653) AI Tutor.\n\nI can explain any concept across Biology (B1–B16), Chemistry (C1–C12), or Physics (P1–P5), provide model answers using official Cambridge mark schemes, break down chemical equations, and guide you through exam calculations. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTopicQuery) {
      setInput(initialTopicQuery);
    }
  }, [initialTopicQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    "What is the difference between active transport and diffusion?",
    "How do I predict products at the anode and cathode during electrolysis?",
    "Explain how to calculate combined resistance for 2 resistors in parallel.",
    "How do I distinguish between Ca²⁺ and Zn²⁺ in qualitative analysis?",
    "Give me a 3-mark model answer explaining why enzymes denature at high temperatures."
  ];

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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          tier: user.tier,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm sorry, I couldn't process your science question right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `In Cambridge 0653 Science, remember that Core tests fundamental principles while Extended tests quantitative calculations and Supplement mechanisms. Please verify your internet connection or try asking again.`,
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
        content: `Chat cleared. Ask me any Cambridge 0653 syllabus question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <span>Cambridge 0653 AI Science Tutor</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded in the official 2025–2027 Cambridge syllabus, mark schemes, and command word standards.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Suggested Cambridge 0653 Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[500px] max-h-[680px]">
        {/* Messages Stream */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
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

                <div className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm space-y-1.5 shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  <div className={`text-[10px] ${isUser ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>AI Tutor is consulting the 0653 syllabus specification...</span>
              </div>
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
              placeholder={`Ask any science question (e.g. "How does the blast furnace extract iron?", "Why is acceleration zero at terminal velocity?")...`}
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
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            AI answers are aligned with Cambridge IGCSE 0653 Core and Extended criteria.
          </div>
        </div>
      </div>
    </div>
  );
};
