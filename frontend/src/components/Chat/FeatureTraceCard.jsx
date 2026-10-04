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
    <div className="my-3 p-3.5 rounded-xl bg-[#0e1627] border border-indigo-500/30 shadow-lg shadow-indigo-950/20 text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider font-mono">
              Feature Execution Path
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {flow.length} connected system modules
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onTraceClick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 shadow-md ${
            isCurrentlyTraced
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50 hover:scale-105 active:scale-95'
          }`}
        >
          {isCurrentlyTraced ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Path Active</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Trace This Feature</span>
            </>
          )}
        </button>
      </div>

      {/* Sequential Flow Steps */}
      <div className="space-y-1.5">
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
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 font-mono truncate">
                      {stepInfo.label || filePath.split('/').pop()}
                    </div>
                    {stepInfo.role && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {stepInfo.role}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] text-indigo-300 font-mono">Inspect</span>
                </div>
              </div>

              {!isLast && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-3 h-3 text-indigo-400/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
