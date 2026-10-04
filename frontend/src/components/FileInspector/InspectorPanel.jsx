import React, { useState } from 'react';
import {
  FileCode,
  Layers,
  ArrowRight,
  ShieldAlert,
  Code2,
  Box,
  Copy,
  Check,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Badge from '../UI/Badge';
import ImpactAnalysisModal from './ImpactAnalysisModal';
import { analyzeImpact } from '../../services/api';

export default function InspectorPanel({
  fileNode,
  onClose,
  onSelectNodeById,
  allEdges = []
}) {
  const [copied, setCopied] = useState(false);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);

  if (!fileNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#0b101d] border-l border-slate-800/80">
        <Box className="w-10 h-10 mb-3 text-slate-700" />
        <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
          No File Selected
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Click any file node in the interactive graph or repository tree to inspect its architectural role.
        </p>
      </div>
    );
  }

  // Calculate dependencies (target of edges where source is this file)
  const directDependencies = allEdges
    .filter((e) => e.source === fileNode.id)
    .map((e) => e.target);

  // Calculate dependents (source of edges where target is this file)
  const directDependents = allEdges
    .filter((e) => e.target === fileNode.id)
    .map((e) => e.source);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fileNode.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunImpactAnalysis = async () => {
    setIsImpactLoading(true);
    try {
      const data = await analyzeImpact(fileNode.id);
      setImpactData(data);
      setIsImpactModalOpen(true);
    } catch (err) {
      alert(`Impact analysis error: ${err.message}`);
    } finally {
      setIsImpactLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b101d] border-l border-slate-800/80 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 sticky top-0 bg-[#0b101d]/95 backdrop-blur-md z-10">
        <div className="flex items-start justify-between">
          <div className="truncate mr-2">
            <div className="flex items-center space-x-2 mb-1">
              <Badge type={fileNode.type}>{fileNode.type}</Badge>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {fileNode.language}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono truncate" title={fileNode.label}>
              {fileNode.label}
            </h3>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-400 font-mono truncate">
              <span className="truncate max-w-[200px]" title={fileNode.path}>{fileNode.path}</span>
              <button
                onClick={handleCopyPath}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                title="Copy relative path"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Impact Analysis Action Button */}
        <div className="mt-3.5">
          <button
            onClick={handleRunImpactAnalysis}
            disabled={isImpactLoading}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {isImpactLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Analyze Impact & Blast Radius</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Architectural Role */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-1">
            Architectural Role
          </span>
          <p className="text-xs font-medium text-slate-200">
            {fileNode.role || 'Source module in application layer.'}
          </p>
          {fileNode.summary && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {fileNode.summary}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Lines of Code</span>
            <span className="text-slate-200 font-semibold">{fileNode.lines || 0}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">File Size</span>
            <span className="text-slate-200 font-semibold">
              {Math.round((fileNode.size || 0) / 1024 * 10) / 10} KB
            </span>
          </div>
        </div>

        {/* Functions & Classes */}
        {(fileNode.functions?.length > 0 || fileNode.classes?.length > 0) && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-2">
              Symbols & Declarations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {fileNode.classes?.map((cls) => (
                <span
                  key={cls}
                  className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 text-[11px] font-mono"
                >
                  class {cls}
                </span>
              ))}
              {fileNode.functions?.map((fn) => (
                <span
                  key={fn}
                  className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 text-[11px] font-mono"
                >
                  {fn}()
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies (Outbound) */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-1.5">
            Dependencies ({directDependencies.length})
          </span>
          {directDependencies.length > 0 ? (
            <div className="space-y-1">
              {directDependencies.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onSelectNodeById && onSelectNodeById(dep)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 text-xs font-mono text-slate-300 hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  <span className="truncate">{dep.split('/').pop()}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 ml-1" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">No internal repository dependencies.</span>
          )}
        </div>

        {/* Dependents (Inbound Callers) */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-1.5">
            Dependents / Callers ({directDependents.length})
          </span>
          {directDependents.length > 0 ? (
            <div className="space-y-1">
              {directDependents.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onSelectNodeById && onSelectNodeById(dep)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 text-xs font-mono text-slate-300 hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  <span className="truncate">{dep.split('/').pop()}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 ml-1" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">No incoming callers detected.</span>
          )}
        </div>

        {/* Code Preview */}
        {fileNode.code_preview && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-1.5">
              Source Code Preview
            </span>
            <div className="p-3 rounded-xl bg-[#070b13] border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
              <pre className="whitespace-pre">{fileNode.code_preview}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Blast Radius Modal */}
      <ImpactAnalysisModal
        isOpen={isImpactModalOpen}
        onClose={() => setIsImpactModalOpen(false)}
        impactData={impactData}
        fileName={fileNode.label}
      />
    </div>
  );
}
