import React from 'react';
import { ShieldAlert, X, Layers, Globe, ArrowRight } from 'lucide-react';

export default function ImpactAnalysisModal({ isOpen, onClose, impactData, fileName }) {
  if (!isOpen || !impactData) return null;

  const score = impactData.impact_score || 'LOW';
  const scoreStyles = {
    HIGH: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    LOW: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-lg rounded-xl border border-[#232d42] bg-[#0c1017] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 border-b border-[#1a2232] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#f1f5f9] font-mono">Blast Radius Analysis</h3>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border ${scoreStyles[score]}`}>
                  {score} RISK
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] font-mono mt-0.5 truncate max-w-sm">
                Target: <span className="text-indigo-300">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#1a2336] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary note */}
        <div className="p-2.5 rounded-lg bg-[#111722] border border-[#1a2336] mb-4 text-xs text-[#cbd5e1] font-mono">
          {impactData.summary}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 font-mono">
          <div className="p-2.5 rounded-lg bg-[#0e131d] border border-[#1a2336]">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">Callers</span>
            <div className="text-lg font-bold text-[#f1f5f9] mt-0.5">
              {impactData.dependents?.length || 0}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0e131d] border border-[#1a2336]">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">Routes</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {impactData.affected_routes?.length || 0}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0e131d] border border-[#1a2336]">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">UI Parts</span>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">
              {impactData.affected_components?.length || 0}
            </div>
          </div>
        </div>

        {/* Direct Callers & Downstream Files */}
        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Direct Caller Files ({impactData.dependents?.length || 0})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {impactData.dependents?.length > 0 ? (
                impactData.dependents.map((dep) => (
                  <div key={dep} className="px-2 py-1 rounded bg-[#111722] border border-[#1a2336] text-xs font-mono text-[#cbd5e1] flex items-center justify-between">
                    <span className="truncate">{dep}</span>
                    <span className="text-[9px] text-amber-400/90 font-mono ml-2">Direct</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#64748b] font-mono italic">No direct incoming callers.</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Transitive Downstream Impact ({impactData.potentially_affected_files?.length || 0})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {impactData.potentially_affected_files?.length > 0 ? (
                impactData.potentially_affected_files.map((file) => (
                  <div key={file} className="px-2 py-1 rounded bg-[#111722] border border-[#1a2336] text-xs font-mono text-[#cbd5e1]">
                    {file}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#64748b] font-mono italic">No transitive dependents affected.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#1a2232]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-mono text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
