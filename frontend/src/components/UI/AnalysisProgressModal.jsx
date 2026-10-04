import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Terminal } from 'lucide-react';

const STEPS = [
  'Connected to GitHub API',
  'Reading project structure & tree',
  'Parsing AST source files (Python, JS, TS)',
  'Building dependency graph & bridging APIs',
  'Preparing AI context & vector index',
  'Repository analysis complete.'
];

export default function AnalysisProgressModal({ isOpen, targetRepo, isComplete, onFinish }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isComplete) {
      setCurrentStepIdx(STEPS.length - 1);
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onFinish]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-md rounded-xl border border-[#232d42] bg-[#0c1017] p-5 shadow-2xl font-mono">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2.5 mb-4 border-b border-[#1a2232] pb-3">
          <div className="p-1.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">
              Analyzing Repository
            </h3>
            <p className="text-[11px] text-[#64748b] truncate max-w-xs mt-0.5">
              {targetRepo || 'Bundled Demo Repository'}
            </p>
          </div>
        </div>

        {/* Step Checklist */}
        <div className="space-y-2 mb-5">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx || (isComplete && idx === STEPS.length - 1);
            const isCurrent = idx === currentStepIdx && !isComplete;

            return (
              <div
                key={step}
                className={`flex items-center space-x-2.5 text-xs px-2.5 py-1.5 rounded transition-colors ${
                  isCurrent
                    ? 'bg-[#151c2a] text-indigo-300 border border-[#232d42]'
                    : isDone
                    ? 'text-[#94a3b8]'
                    : 'text-[#475569] opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                  ) : (
                    <span className="text-[#475569]">○</span>
                  )}
                </div>
                <span className="truncate text-[11px]">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-[#151c2a] rounded-full h-1 overflow-hidden border border-[#1e2738]">
          <div
            className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, ((currentStepIdx + 1) / STEPS.length) * 100)}%`
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-[#64748b]">
          <span>AST Code Analysis Engine</span>
          <span>{Math.round(((currentStepIdx + 1) / STEPS.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
