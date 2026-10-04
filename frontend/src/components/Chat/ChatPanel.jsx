import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Terminal, CheckCircle2 } from 'lucide-react';
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
        'CodePath Repository Intelligence ready.\n\nAsk how features flow through this codebase, or select a suggested query below to generate a live dependency trace.',
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

      // Automatically trace feature if flow is returned
      if (response.flow && response.flow.length > 0 && onTraceFeature) {
        onTraceFeature(response.flow);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `We encountered an issue querying the codebase: ${err.message || 'Unknown error'}.`,
          flow: [],
          traceSteps: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f17] border-l border-[#1a2232] font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#1a2232] flex items-center justify-between bg-[#0e121a]">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#f1f5f9] font-mono tracking-tight">
              Code Intelligence
            </h3>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Repository Indexed &middot; AST Active</span>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div
            className="text-[10px] px-2 py-0.5 rounded bg-[#131823] text-[#94a3b8] font-mono border border-[#1e2738] truncate max-w-[120px]"
            title={selectedFile.label}
          >
            {selectedFile.label}
          </div>
        )}
      </div>

      {/* Suggested Prompt Tags */}
      <div className="p-2 border-b border-[#1a2232] bg-[#0c1017] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSubmit(q)}
            disabled={isLoading}
            className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-[#131823] hover:bg-[#1a2232] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#1e2738] transition-colors whitespace-nowrap cursor-pointer font-mono"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className="text-xs font-sans">
              {isUser ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg px-3 py-2 bg-indigo-600 text-white font-mono text-xs">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#0e131d] border border-[#1a2336] text-[#cbd5e1] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#161d2a] text-[10px] font-mono text-[#64748b]">
                    <div className="flex items-center space-x-1">
                      <Terminal className="w-3 h-3 text-indigo-400" />
                      <span>CodePath Assistant</span>
                    </div>
                    {msg.flow?.length > 0 && (
                      <span className="text-emerald-400 font-semibold">100% AST MATCH</span>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.content}
                  </div>

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
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="p-3 rounded-lg bg-[#0e131d] border border-[#1a2336] flex items-center space-x-2 text-xs font-mono text-[#94a3b8]">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Analyzing repository AST & tracing execution chain...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[#1a2232] bg-[#0c1017]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about authentication, payment routes, db..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-1.5 bg-[#121824] border border-[#1a2336] rounded-md text-xs text-[#f1f5f9] placeholder-[#64748b] font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
