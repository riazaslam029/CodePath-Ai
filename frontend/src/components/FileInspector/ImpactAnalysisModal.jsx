import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, X, GitPullRequest, ArrowRight, Layers, Globe } from 'lucide-react';
import Badge from '../UI/Badge';

export default function ImpactAnalysisModal({ isOpen, onClose, impactData, fileName }) {
  if (!isOpen || !impactData) return null;

  const score = impactData.impact_score || 'LOW';
  const scoreColors = {
    HIGH: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    LOW: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">Blast Radius & Impact Analysis</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${scoreColors[score]}`}>
                  {score} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                Simulated changes to: <span className="text-indigo-300">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary statement */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-5 text-xs text-slate-300">
          {impactData.summary}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-[#101726] border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Direct Dependents</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1">
              {impactData.dependents?.length || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#101726] border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Affected Routes</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {impactData.affected_routes?.length || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#101726] border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Affected UI Parts</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              {impactData.affected_components?.length || 0}
            </div>
          </div>
        </div>

        {/* Direct Callers List */}
        <div className="space-y-3 mb-5">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Direct Caller Files ({impactData.dependents?.length || 0})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {impactData.dependents?.length > 0 ? (
                impactData.dependents.map((dep) => (
                  <div key={dep} className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>{dep}</span>
                    <span className="text-[10px] text-amber-400/80">Direct Call</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No incoming direct callers.</div>
              )}
            </div>
          </div>

          {/* Potentially Affected Downstream Files */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Transitive Downstream Files ({impactData.potentially_affected_files?.length || 0})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {impactData.potentially_affected_files?.length > 0 ? (
                impactData.potentially_affected_files.map((file) => (
                  <div key={file} className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300">
                    {file}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No transitive dependents affected.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-mono text-white font-medium transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
