import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import FeatureTraceCard from './FeatureTraceCard';
import { askQuestion } from '../../services/api';

const SAMPLE_QUESTIONS = [
  'How does authentication work?',
  'Where is the database initialized?',
  'What happens when a user registers?',
  'Which files handle payments?',
  'Explain this architecture.'
];

export default function ChatPanel({
  repoUrl,
  isDemo,
  selectedFile,
  onTraceFeature,
  activeTracedFiles = [],
  onSelectStepFile
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Welcome to **CodePath AI**! I have analyzed this codebase and built its interactive dependency graph.\n\nAsk any question about how features flow through the repository, or click one of the suggested prompts below to see a visual trace.',
      flow: [],
      traceSteps: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (queryText) => {
    const text = (queryText || inputValue).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user', content: text }
    ];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askQuestion(text, repoUrl, isDemo, selectedFile?.id);
      
      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        flow: response.flow || [],
        traceSteps: response.trace_steps || [],
        confidence: response.confidence
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically trace feature if flow is present
      if (response.flow && response.flow.length > 0 && onTraceFeature) {
        onTraceFeature(response.flow);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${err.message || 'Error communicating with AI engine.'}`,
          flow: [],
          traceSteps: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b101d] border-l border-slate-800/80">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 font-mono">
              AI Codebase Explorer
            </h3>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Repository indexed</span>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono truncate max-w-[130px]" title={selectedFile.label}>
            Context: {selectedFile.label}
          </div>
        )}
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="p-2 border-b border-slate-800/60 bg-[#090d18] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-1" />
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSubmit(q)}
            disabled={isLoading}
            className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-[#101726] border border-slate-800/80 text-slate-200 rounded-tl-sm shadow-md'
                }`}
              >
                {/* Content rendering */}
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Feature Trace Card if available */}
                {msg.flow && msg.flow.length > 0 && (
                  <FeatureTraceCard
                    flow={msg.flow}
                    traceSteps={msg.traceSteps}
                    onTraceClick={() => onTraceFeature && onTraceFeature(msg.flow)}
                    isCurrentlyTraced={
                      activeTracedFiles.length > 0 &&
                      msg.flow.every((f) => activeTracedFiles.includes(f))
                    }
                    onSelectStepFile={onSelectStepFile}
                  />
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2.5 text-xs text-slate-400 pl-1">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-2.5 rounded-xl bg-[#101726] border border-slate-800/80 font-mono text-[11px] text-indigo-300 flex items-center space-x-2">
              <span>Retrieving repository context & tracing flow...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080c14]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about authentication, payment flow, database..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 bg-[#0e1627] border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
