import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, RotateCcw, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { ChatMessage } from '../components/ChatMessage';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { chatApi } from '../services/api';

const INITIAL_GREETING = {
  id: 'init-msg',
  role: 'assistant',
  content: "Namaste! 🙏 Welcome to the **Maharaja Agrasen Institute of Technology (MAIT)** AI Assistant.\n\nI am here to help you with official college information regarding **admissions, semester examination datesheets, fee payment, academic regulations, library facilities, and campus departments**.\n\nHow can I help you today?",
  source: 'MAIT_VERIFIED',
  source_citation: 'MAIT Administrative Information Center',
  timestamp: new Date().toISOString(),
};

export const StudentChatPage = () => {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend = inputQuery) => {
    const text = queryToSend.trim();
    if (!text || loading) return;

    setError(null);
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Prepare history payload (last 6 messages)
    const historyPayload = messages
      .filter((m) => m.id !== 'init-msg')
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage({
        query: text,
        history: historyPayload,
      });

      const data = response.data;
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        source: data.source,
        query_log_id: data.query_log_id,
        matched_entry_id: data.matched_entry_id,
        source_title: data.source_title,
        source_citation: data.source_citation,
        source_url: data.source_url,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Unable to connect to MAIT Assistant service. Please verify the backend is running and try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_GREETING,
        timestamp: new Date().toISOString(),
      },
    ]);
    setError(null);
    setInputQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      {/* Main Chat Layout */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        
        {/* Institutional Banner */}
        <div className="mb-4 bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mait-crimson-50 text-mait-crimson-700 rounded-lg shrink-0 hidden sm:block">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-mait-navy-900">
                Verified MAIT Information First. General AI Second.
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Official institutional answers carry the <span className="font-semibold text-emerald-700">✓ MAIT Verified</span> badge.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-mait-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-sm overflow-y-auto min-h-[450px] max-h-[68vh] flex flex-col">
          <div className="flex-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && <LoadingIndicator />}

            {error && (
              <div className="my-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="font-semibold underline hover:text-red-900 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions in empty/initial states */}
          {messages.length <= 2 && !loading && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <SuggestedQuestions
                onSelectQuestion={(q) => handleSend(q)}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center shadow-sm rounded-2xl bg-white border border-slate-300 focus-within:border-mait-navy-600 focus-within:ring-2 focus-within:ring-mait-navy-100 transition-all overflow-hidden"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask anything about MAIT (e.g. 'When are the exams?', 'Fee payment')..."
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <div className="pr-3 flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-2.5 rounded-xl bg-mait-navy-800 text-white hover:bg-mait-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Maharaja Agrasen Institute of Technology • AI Assistant v1.0</span>
            <span>Press Enter to send</span>
          </div>
        </div>

      </main>
    </div>
  );
};
