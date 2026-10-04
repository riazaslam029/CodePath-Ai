import React from 'react';
import { Route, ArrowDown, Sparkles, Eye, Check } from 'lucide-react';
import Badge from '../UI/Badge';

export default function FeatureTraceCard({
  flow = [],
  traceSteps = [],
  onTraceClick,
  isCurrentlyTraced = false,
  onSelectStepFile
}) {
  if (!flow || flow.length === 0) return null;

  return (
    <div className="my-2.5 p-3 rounded-lg bg-[#0e131d] border border-[#1e2738] shadow-lg text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1a2232] pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Route className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-[#f1f5f9] uppercase tracking-wider font-mono">
              Feature Execution Path
            </h4>
            <span className="text-[10px] text-[#64748b] font-mono">
              {flow.length} files &middot; {Math.max(1, flow.length - 1)} transitions &middot; High Confidence
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onTraceClick}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
            isCurrentlyTraced
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
          }`}
        >
          {isCurrentlyTraced ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Trace Active</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Trace Path</span>
            </>
          )}
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-1">
        {flow.map((filePath, index) => {
          const stepInfo = traceSteps?.find((s) => s.file === filePath) || {
            step: index + 1,
            label: filePath.split('/').pop(),
            role: 'Component',
            description: ''
          };

          const isLast = index === flow.length - 1;

          return (
            <div key={`${filePath}-${index}`} className="group">
              <div
                onClick={() => onSelectStepFile && onSelectStepFile(filePath)}
                className="flex items-center justify-between p-1.5 rounded-md bg-[#121824] border border-[#1a2336] hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-4 h-4 rounded bg-[#1a2336] text-indigo-300 text-[10px] font-mono flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-[#f1f5f9] font-mono truncate mr-2">
                      {stepInfo.label || filePath.split('/').pop()}
                    </span>
                    {stepInfo.role && (
                      <span className="text-[10px] text-[#94a3b8] font-mono">
                        ({stepInfo.role})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-indigo-300 font-mono">Inspect</span>
                </div>
              </div>

              {!isLast && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-2.5 h-2.5 text-[#64748b]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
