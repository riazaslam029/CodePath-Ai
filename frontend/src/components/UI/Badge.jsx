import React from 'react';

const TYPE_COLORS = {
  component: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80',
  api: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
  service: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/80',
  auth: 'bg-purple-950/80 text-purple-400 border-purple-800/80',
  model: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
  database: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
  config: 'bg-slate-800/80 text-slate-400 border-slate-700/80',
  util: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80',
  test: 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80'
};

export default function Badge({ type = 'util', children, className = '' }) {
  const colorClass = TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.util;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClass} ${className}`}>
      {children || type}
    </span>
  );
}
