import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Search, Filter } from 'lucide-react';

export default function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeTraceCount = 0,
  onClearTrace
}) {
  const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'component', label: 'UI' },
    { id: 'api', label: 'API' },
    { id: 'service', label: 'Service' },
    { id: 'model', label: 'Model' },
    { id: 'database', label: 'DB' }
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Left: Search & Category Filters */}
      <div className="flex items-center space-x-2 bg-[#0d1424]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5" />
          <input
            type="text"
            placeholder="Search nodes in graph..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 pl-8 pr-3 py-1 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {activeTraceCount > 0 && (
          <>
            <div className="h-4 w-[1px] bg-slate-800" />
            <button
              onClick={onClearTrace}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 transition-colors flex items-center space-x-1"
            >
              <span>Traced ({activeTraceCount})</span>
              <span className="text-[10px] text-slate-400">×</span>
            </button>
          </>
        )}
      </div>

      {/* Right: Zoom & Navigation Buttons */}
      <div className="flex items-center space-x-1 bg-[#0d1424]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-slate-800" />
        <button
          onClick={onFitView}
          title="Fit Graph"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onResetLayout}
          title="Reset Layout"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
