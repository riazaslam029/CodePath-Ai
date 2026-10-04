import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Search, Sparkles, X } from 'lucide-react';

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
    <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
      {/* Left Toolbar: Search & Category Filters */}
      <div className="flex items-center space-x-2 bg-[#0c1017]/95 backdrop-blur-md p-1 rounded-lg border border-[#1e2738] shadow-xl pointer-events-auto">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-40 pl-8 pr-2.5 py-1 bg-[#121824] text-xs text-[#f1f5f9] placeholder-[#64748b] rounded-md border border-[#1a2336] focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="h-3.5 w-[1px] bg-[#1e2738]" />

        <div className="flex items-center space-x-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-2 py-0.5 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {activeTraceCount > 0 && (
          <>
            <div className="h-3.5 w-[1px] bg-[#1e2738]" />
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/40 text-[11px] font-mono text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Trace ({activeTraceCount})</span>
              <button
                onClick={onClearTrace}
                className="hover:text-white p-0.5 ml-1 rounded transition-colors"
                title="Clear Trace"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Toolbar: Canvas Controls */}
      <div className="flex items-center space-x-1 bg-[#0c1017]/95 backdrop-blur-md p-1 rounded-lg border border-[#1e2738] shadow-xl pointer-events-auto">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="h-3.5 w-[1px] bg-[#1e2738]" />
        <button
          onClick={onFitView}
          title="Fit Canvas"
          className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetLayout}
          title="Reset View"
          className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
