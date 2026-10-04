import React, { useState } from 'react';
import {
  FileCode,
  ArrowRight,
  ShieldAlert,
  Code2,
  Copy,
  Check,
  X,
  ExternalLink,
  Loader2,
  Route
} from 'lucide-react';
import Badge from '../UI/Badge';
import ImpactAnalysisModal from './ImpactAnalysisModal';
import { analyzeImpact } from '../../services/api';

export default function InspectorPanel({
  fileNode,
  onClose,
  onSelectNodeById,
  allEdges = [],
  onTraceFileFlow
}) {
  const [copied, setCopied] = useState(false);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);

  if (!fileNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#64748b] bg-[#0b0f17] border-l border-[#1a2232] font-sans">
        <FileCode className="w-8 h-8 mb-2 text-[#334155]" />
        <h4 className="text-xs font-semibold text-[#94a3b8] font-mono uppercase tracking-wider">
          No File Selected
        </h4>
        <p className="text-[11px] text-[#64748b] mt-1 max-w-xs font-mono">
          Click any node in the graph or file tree to inspect its architectural role.
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
    <div className="h-full flex flex-col bg-[#0b0f17] border-l border-[#1a2232] overflow-y-auto font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#1a2232] bg-[#0e121a] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div className="truncate mr-2">
            <div className="flex items-center space-x-1.5 mb-1">
              <Badge type={fileNode.type} className="text-[9px] py-0 px-1">{fileNode.type}</Badge>
              <span className="text-[10px] font-mono text-[#64748b] uppercase">
                {fileNode.language}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#f1f5f9] font-mono truncate" title={fileNode.label}>
              {fileNode.label}
            </h3>
            <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-[#64748b] font-mono truncate">
              <span className="truncate max-w-[200px]" title={fileNode.path}>{fileNode.path}</span>
              <button
                onClick={handleCopyPath}
                className="text-[#64748b] hover:text-[#cbd5e1] p-0.5 rounded transition-colors"
                title="Copy relative path"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#1a2336] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Action: Impact Analysis */}
        <div className="mt-2.5">
          <button
            onClick={handleRunImpactAnalysis}
            disabled={isImpactLoading}
            className="w-full py-1.5 px-2.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            {isImpactLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Analyze Blast Radius</span>
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Role & Summary */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#64748b] block mb-1">
            Architectural Role
          </span>
          <p className="text-xs font-medium text-[#f1f5f9]">
            {fileNode.role || 'Source module in application layer.'}
          </p>
          {fileNode.summary && (
            <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
              {fileNode.summary}
            </p>
          )}
        </div>

        {/* Technical Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-[#0e131d] border border-[#1a2336]">
            <span className="text-[10px] text-[#64748b] block">Lines of Code</span>
            <span className="text-[#f1f5f9] font-semibold">{fileNode.lines || 0}</span>
          </div>
          <div className="p-2 rounded bg-[#0e131d] border border-[#1a2336]">
            <span className="text-[10px] text-[#64748b] block">File Size</span>
            <span className="text-[#f1f5f9] font-semibold">
              {Math.round((fileNode.size || 0) / 1024 * 10) / 10} KB
            </span>
          </div>
        </div>

        {/* Functions & Classes */}
        {(fileNode.functions?.length > 0 || fileNode.classes?.length > 0) && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#64748b] block mb-1.5">
              Extracted Symbols
            </span>
            <div className="flex flex-wrap gap-1">
              {fileNode.classes?.map((cls) => (
                <span
                  key={cls}
                  className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[10px] font-mono"
                >
                  class {cls}
                </span>
              ))}
              {fileNode.functions?.map((fn) => (
                <span
                  key={fn}
                  className="px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-[10px] font-mono"
                >
                  {fn}()
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Outbound Dependencies */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#64748b] block mb-1">
            Depends On ({directDependencies.length})
          </span>
          {directDependencies.length > 0 ? (
            <div className="space-y-1">
              {directDependencies.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onSelectNodeById && onSelectNodeById(dep)}
                  className="flex items-center justify-between p-1.5 rounded bg-[#0e131d] border border-[#1a2336] hover:border-indigo-500/40 text-xs font-mono text-[#cbd5e1] hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  <span className="truncate">{dep.split('/').pop()}</span>
                  <ExternalLink className="w-3 h-3 text-[#64748b] flex-shrink-0 ml-1" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-[#64748b] font-mono italic">No internal repository dependencies.</span>
          )}
        </div>

        {/* Inbound Callers (Dependents) */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#64748b] block mb-1">
            Used By ({directDependents.length})
          </span>
          {directDependents.length > 0 ? (
            <div className="space-y-1">
              {directDependents.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onSelectNodeById && onSelectNodeById(dep)}
                  className="flex items-center justify-between p-1.5 rounded bg-[#0e131d] border border-[#1a2336] hover:border-indigo-500/40 text-xs font-mono text-[#cbd5e1] hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  <span className="truncate">{dep.split('/').pop()}</span>
                  <ExternalLink className="w-3 h-3 text-[#64748b] flex-shrink-0 ml-1" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-[#64748b] font-mono italic">No incoming callers detected.</span>
          )}
        </div>

        {/* Source Code Preview */}
        {fileNode.code_preview && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#64748b] block mb-1">
              Source Code Preview
            </span>
            <div className="p-2.5 rounded-lg bg-[#070a10] border border-[#1a2336] text-[11px] font-mono text-[#cbd5e1] overflow-x-auto max-h-52">
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
