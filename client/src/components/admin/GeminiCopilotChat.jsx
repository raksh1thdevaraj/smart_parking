import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, User, Loader2 } from 'lucide-react';

export function GeminiCopilotChat({ isOpen, onClose, telemetry }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am SmartPark Copilot, powered by Google Gemini. I have direct access to your Arduino UNO telemetry stream (${telemetry.availableSlots}/4 slots available, ${telemetry.deniedCount} denied entries). How can I assist you with facility operations today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText })
      });
      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'No response received from Copilot.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Telemetry analysis: Currently ${telemetry.availableSlots} bays are vacant and ${telemetry.occupiedSlots} are occupied. ${telemetry.deniedCount} vehicles have been turned away.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What is our current turn-away rate?',
    'Why is Sensor 1 triggering without exits?',
    'How many additional slots are needed?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>SmartPark Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Natural Language Telemetry Query</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFCFF]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
              {m.time} {m.source && `• ${m.source}`}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-mono p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting Gemini AI...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 overflow-x-auto flex gap-1.5 no-scrollbar">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInputQuery(q)}
            className="text-[10px] font-mono whitespace-nowrap px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition shrink-0 shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Copilot about telemetry, rates, gate..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono transition"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-40 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
