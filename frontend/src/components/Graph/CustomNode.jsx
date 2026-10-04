import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode, Globe, Cpu, ShieldCheck, Database, Layers, Wrench, FileText } from 'lucide-react';
import Badge from '../UI/Badge';

const TYPE_ICONS = {
  component: Layers,
  api: Globe,
  service: Cpu,
  auth: ShieldCheck,
  model: FileCode,
  database: Database,
  config: Wrench,
  util: FileText
};

const BORDER_ACCENTS = {
  component: 'border-cyan-500/60 shadow-cyan-950/30',
  api: 'border-emerald-500/60 shadow-emerald-950/30',
  service: 'border-indigo-500/60 shadow-indigo-950/30',
  auth: 'border-purple-500/60 shadow-purple-950/30',
  model: 'border-amber-500/60 shadow-amber-950/30',
  database: 'border-rose-500/60 shadow-rose-950/30',
  config: 'border-slate-600/60 shadow-slate-950/30',
  util: 'border-zinc-600/60 shadow-zinc-950/30'
};

const TOP_BAR_COLORS = {
  component: 'bg-cyan-500',
  api: 'bg-emerald-500',
  service: 'bg-indigo-500',
  auth: 'bg-purple-500',
  model: 'bg-amber-500',
  database: 'bg-rose-500',
  config: 'bg-slate-500',
  util: 'bg-zinc-500'
};

function CustomNode({ data, selected }) {
  const nodeType = data.type || 'util';
  const Icon = TYPE_ICONS[nodeType.toLowerCase()] || FileCode;
  const isTraced = !!data.traceStep;
  const traceStep = data.traceStep;

  const borderClass = isTraced
    ? 'border-indigo-400 ring-2 ring-indigo-500/80 shadow-lg shadow-indigo-500/30 animate-pulse'
    : selected
    ? 'border-sky-400 ring-2 ring-sky-500/60 shadow-lg shadow-sky-500/20'
    : BORDER_ACCENTS[nodeType.toLowerCase()] || 'border-slate-800 hover:border-slate-700';

  return (
    <div
      className={`relative min-w-[210px] max-w-[270px] rounded-xl bg-[#0d1424] border transition-all duration-200 cursor-pointer overflow-hidden ${borderClass}`}
    >
      {/* Top category bar */}
      <div className={`h-1 w-full ${TOP_BAR_COLORS[nodeType.toLowerCase()] || 'bg-slate-700'}`} />

      {/* Trace step pill if active in AI trace */}
      {isTraced && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md animate-bounce">
          <span>Step {traceStep}</span>
        </div>
      )}

      {/* Target Handle (Incoming) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />

      <div className="p-3">
        {/* Header with Type & Language */}
        <div className="flex items-center justify-between mb-1.5">
          <Badge type={nodeType}>{nodeType}</Badge>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {data.language || 'Code'}
          </span>
        </div>

        {/* File Name & Icon */}
        <div className="flex items-center space-x-2 my-1">
          <div className="p-1 rounded bg-slate-900/80 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-100 truncate font-mono">
            {data.label}
          </span>
        </div>

        {/* Role subtitle */}
        <p className="text-[11px] text-slate-400 line-clamp-1 mb-2 font-sans">
          {data.role || 'Source module'}
        </p>

        {/* Metrics Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{data.lines || 0} lines</span>
          {data.functions?.length > 0 && (
            <span>{data.functions.length} fn</span>
          )}
        </div>
      </div>

      {/* Source Handle (Outgoing) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />
    </div>
  );
}

export default memo(CustomNode);
