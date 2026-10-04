import React, { useState } from 'react';
import { X, Play, Sparkles } from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function RepoInputModal({
  isOpen,
  onClose,
  onAnalyze,
  onUseDemo
}) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Analyze GitHub Repository
              </h3>
              <p className="text-xs text-slate-400">
                Enter any public GitHub repository URL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/fastapi/fastapi"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onUseDemo();
                onClose();
              }}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Use Bundled Demo Instead</span>
            </button>

            <button
              type="submit"
              disabled={!url.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-mono font-medium text-white transition-colors cursor-pointer"
            >
              Start Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
