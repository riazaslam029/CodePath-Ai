import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-md rounded-xl border border-[#232d42] bg-[#0c1017] p-5 shadow-2xl font-mono">
        <div className="flex items-center justify-between mb-4 border-b border-[#1a2232] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#182030] text-[#f1f5f9] border border-[#232d42]">
              <GithubIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">
                Connect GitHub Repository
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Public Python, JS, or TypeScript repo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#1a2336] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#94a3b8] mb-1.5">
              Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/fastapi/fastapi"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#121824] border border-[#1a2336] rounded-md text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                onUseDemo();
                onClose();
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Use Bundled Demo</span>
            </button>

            <button
              type="submit"
              disabled={!url.trim()}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Analyze Repo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
