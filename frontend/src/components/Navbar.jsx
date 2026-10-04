import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  Play,
  Layers,
  ArrowRight,
  ExternalLink,
  Code
} from 'lucide-react';
import GithubIcon from './UI/GithubIcon';

export default function Navbar({
  currentView,
  onNavigate,
  activeRepo,
  onOpenAnalyzeModal,
  onLoadDemo,
  isAnalyzing
}) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#090d18]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-indigo-950/50">
            <div className="w-full h-full bg-[#090d18] rounded-[11px] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                CodePath<span className="text-indigo-400">.AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Understand any codebase. Visually.
            </p>
          </div>
        </button>

        {activeRepo && currentView === 'dashboard' && (
          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                {activeRepo.repo_owner}/{activeRepo.repo_name}
              </span>
              <span className="text-[10px] text-slate-500">
                ({activeRepo.total_files} files)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => onNavigate(currentView === 'dashboard' ? 'landing' : 'dashboard')}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          {currentView === 'dashboard' ? 'Overview' : 'Dashboard'}
        </button>

        <button
          onClick={onLoadDemo}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-xs font-mono text-slate-200 transition-all cursor-pointer shadow-sm hover:border-indigo-500/50"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Try Demo</span>
        </button>

        <button
          onClick={onOpenAnalyzeModal}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-md shadow-indigo-950/60 transition-all cursor-pointer hover:scale-102 active:scale-98"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Analyze Repo</span>
        </button>
      </div>
    </header>
  );
}
