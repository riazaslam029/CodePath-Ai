import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Terminal, Sparkles } from 'lucide-react';

const STEPS = [
  'Connecting to repository...',
  'Fetching project structure...',
  'Parsing source files...',
  'Building dependency graph...',
  'Preparing AI context...',
  'Analysis complete.'
];

export default function AnalysisProgressModal({ isOpen, targetRepo, isComplete, onFinish }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    // Progress through steps visually while backend analysis executes
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 650);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isComplete) {
      setCurrentStepIdx(STEPS.length - 1);
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onFinish]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-2xl shadow-indigo-950/40">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Analyzing Codebase</h3>
            <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
              {targetRepo || 'Bundled Demo Repository'}
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 mb-6">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx || (isComplete && idx === STEPS.length - 1);
            const isCurrent = idx === currentStepIdx && !isComplete;
            const isUpcoming = idx > currentStepIdx;

            return (
              <div
                key={step}
                className={`flex items-center space-x-3 text-sm px-3 py-2 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300'
                    : isDone
                    ? 'text-slate-300 bg-slate-900/40'
                    : 'text-slate-600 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in-50" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="font-mono text-xs tracking-wide">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 h-full transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, ((currentStepIdx + 1) / STEPS.length) * 100)}%`
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>AST Engine Active</span>
          </span>
          <span>{Math.round(((currentStepIdx + 1) / STEPS.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
