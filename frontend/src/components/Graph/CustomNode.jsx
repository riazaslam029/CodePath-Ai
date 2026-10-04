import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Layers,
  Globe,
  Cpu,
  ShieldCheck,
  FileCode,
  Database,
  Wrench,
  FileText
} from 'lucide-react';
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

const ACCENT_INDICATORS = {
  component: 'bg-sky-400',
  api: 'bg-emerald-400',
  service: 'bg-indigo-400',
  auth: 'bg-purple-400',
  model: 'bg-amber-400',
  database: 'bg-rose-400',
  config: 'bg-slate-400',
  util: 'bg-zinc-400'
};

function CustomNode({ data, selected }) {
  const nodeType = data.type || 'util';
  const Icon = TYPE_ICONS[nodeType.toLowerCase()] || FileCode;
  const isTraced = !!data.traceStep;
  const isSubdued = !!data.isSubdued;
  const traceStep = data.traceStep;

  // Determine card border & shadow styling
  let containerStyle = 'bg-[#0f1420] border-[#1f283d] text-[#f8fafc]';
  if (isTraced) {
    containerStyle =
      'bg-[#121929] border-indigo-400 ring-1 ring-indigo-400 shadow-xl shadow-indigo-950/60 node-traced';
  } else if (selected) {
    containerStyle =
      'bg-[#121929] border-sky-400 ring-1 ring-sky-400 shadow-lg shadow-sky-950/40';
  } else if (isSubdued) {
    containerStyle = 'bg-[#0a0d14] border-[#141b29] node-subdued text-[#64748b]';
  }

  return (
    <div
      className={`relative min-w-[210px] max-w-[250px] rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden ${containerStyle}`}
    >
      {/* Top subtle category line */}
      <div
        className={`h-[2px] w-full ${ACCENT_INDICATORS[nodeType.toLowerCase()] || 'bg-slate-600'} ${
          isSubdued ? 'opacity-30' : 'opacity-100'
        }`}
      />

      {/* Numerical step badge if part of AI feature trace */}
      {isTraced && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[10px] font-mono font-bold text-white shadow-md">
          <span>Step {traceStep}</span>
        </div>
      )}

      {/* Inbound Handle (Target) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[#818cf8] !border !border-[#090b10] !rounded-full"
      />

      <div className="p-2.5">
        {/* Tier & Language Strip */}
        <div className="flex items-center justify-between mb-1">
          <Badge type={nodeType} className="py-0 px-1 text-[9px]">
            {nodeType}
          </Badge>
          <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
            {data.language || 'Code'}
          </span>
        </div>

        {/* Filename & Icon */}
        <div className="flex items-center space-x-2 my-1.5">
          <div
            className={`p-1 rounded ${
              isTraced
                ? 'bg-indigo-950 text-indigo-300'
                : 'bg-[#182030] text-[#94a3b8]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[#f1f5f9] truncate font-mono">
            {data.label}
          </span>
        </div>

        {/* Architectural Role (Scannable one-line) */}
        <p className="text-[10px] text-[#94a3b8] line-clamp-1 mb-2">
          {data.role || 'Source module'}
        </p>

        {/* Metrics Footer */}
        <div className="pt-1.5 border-t border-[#1a2336] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
          <span>{data.lines || 0} loc</span>
          {data.functions?.length > 0 && (
            <span>{data.functions.length} fn</span>
          )}
        </div>
      </div>

      {/* Outbound Handle (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#818cf8] !border !border-[#090b10] !rounded-full"
      />
    </div>
  );
}

export default memo(CustomNode);
