import React from 'react';

const TYPE_STYLES = {
  component: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
  api: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  service: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
  auth: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  model: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  database: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  config: 'bg-slate-900 text-slate-300 border-slate-700/60',
  util: 'bg-zinc-900 text-zinc-300 border-zinc-700/60',
  test: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60'
};

export default function Badge({ type = 'util', children, className = '' }) {
  const styleClass = TYPE_STYLES[type.toLowerCase()] || TYPE_STYLES.util;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide border uppercase ${styleClass} ${className}`}
    >
      {children || type}
    </span>
  );
}
