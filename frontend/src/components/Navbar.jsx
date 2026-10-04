import React from 'react';
import {
  GitBranch,
  Play,
  Terminal,
  Search,
  Code
} from 'lucide-react';
import GithubIcon from './UI/GithubIcon';

export default function Navbar({
  currentView,
  onNavigate,
  activeRepo,
  onOpenAnalyzeModal,
  onLoadDemo,
  onOpenCommandPalette,
  isAnalyzing
}) {
  return (
    <header className="h-12 border-b border-[#1a2232] bg-[#090b10]/95 backdrop-blur-md px-3.5 flex items-center justify-between select-none z-30 font-sans">
      {/* Brand & Repo Info */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2 text-left group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-[#161c28] border border-[#232d42] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <Code className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-xs font-bold tracking-tight text-[#f8fafc]">
              CodePath<span className="text-indigo-400">.AI</span>
            </span>
          </div>
        </button>

        {activeRepo && currentView === 'dashboard' && (
          <div className="hidden sm:flex items-center space-x-1.5 pl-3 border-l border-[#1a2232] font-mono">
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0f1420] border border-[#1e2738] text-[11px] text-[#94a3b8]">
              <GitBranch className="w-3 h-3 text-[#64748b]" />
              <span className="font-medium text-[#f1f5f9] truncate max-w-[160px]">
                {activeRepo.repo_name}
              </span>
              <span className="text-[10px] text-[#64748b]">
                ({activeRepo.total_files} files)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Middle Command Trigger Button */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-3 py-1 rounded-md bg-[#0f1420] hover:bg-[#151c2a] border border-[#1e2738] text-xs font-mono text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3 h-3" />
            <span>Search or command...</span>
          </div>
          <kbd className="px-1.5 py-0.2 rounded bg-[#161d2b] border border-[#232d42] text-[10px] text-[#94a3b8]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 font-mono">
        <button
          onClick={() => onNavigate(currentView === 'dashboard' ? 'landing' : 'dashboard')}
          className="text-xs text-[#94a3b8] hover:text-[#f8fafc] px-2.5 py-1 rounded hover:bg-[#131824] transition-colors cursor-pointer"
        >
          {currentView === 'dashboard' ? 'Overview' : 'Dashboard'}
        </button>

        <button
          onClick={onLoadDemo}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#131824] hover:bg-[#182030] border border-[#1e2738] text-xs text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
        >
          <Play className="w-3 h-3 text-indigo-400 fill-current" />
          <span>Demo</span>
        </button>

        <button
          onClick={onOpenAnalyzeModal}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Analyze</span>
        </button>
      </div>
    </header>
  );
}
