import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  ArrowRight,
  Route,
  Zap,
  ShieldCheck,
  Layers,
  Cpu,
  Database,
  Code2,
  Terminal,
  CheckCircle2,
  Play
} from 'lucide-react';
import GithubIcon from '../components/UI/GithubIcon';

export default function Landing({
  onAnalyzeRepo,
  onLaunchDemo,
  isAnalyzing
}) {
  const [repoInput, setRepoInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onAnalyzeRepo(repoInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 overflow-y-auto font-sans selection:bg-indigo-500/30">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-indigo-900/20 via-sky-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-8 shadow-inner animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Hackathon MVP — Next-Gen Code Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Understand Any Codebase. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Visually.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          CodePath AI turns unfamiliar repositories into interactive maps you can explore, question, and understand in seconds.
        </p>

        {/* Input & CTA Form */}
        <div className="max-w-xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 shadow-2xl shadow-indigo-950/40"
          >
            <div className="relative flex-1 w-full flex items-center">
              <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!repoInput.trim() || isAnalyzing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-medium shadow-md transition-all whitespace-nowrap cursor-pointer hover:scale-102"
            >
              Analyze Repository
            </button>
          </form>
        </div>

        {/* Secondary CTA: Try Demo */}
        <div className="flex items-center justify-center space-x-3 text-xs text-slate-400 font-mono">
          <span>Or explore the live sample project:</span>
          <button
            onClick={onLaunchDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Try Demo Codebase</span>
          </button>
        </div>

        {/* Interactive Visual Preview Card */}
        <div className="mt-14 p-2 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/40 border border-slate-800 shadow-2xl">
          <div className="rounded-xl bg-[#0b101e] border border-slate-800/80 p-5 overflow-hidden text-left relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">
                  Interactive Dependency Graph & Trace Preview
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Live Trace Active
              </span>
            </div>

            {/* Visual Trace Flow Mock */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-4 text-center font-mono">
              <div className="p-3 rounded-xl bg-[#0e1627] border border-cyan-500/50 shadow-md shadow-cyan-950/20">
                <span className="text-[9px] text-cyan-400 uppercase font-bold block">1. Frontend UI</span>
                <span className="text-xs font-bold text-slate-200">Login.jsx</span>
              </div>
              <div className="flex items-center justify-center text-indigo-400 font-bold text-sm">➔</div>
              <div className="p-3 rounded-xl bg-[#0e1627] border border-emerald-500/50 shadow-md shadow-emerald-950/20">
                <span className="text-[9px] text-emerald-400 uppercase font-bold block">2. API Route</span>
                <span className="text-xs font-bold text-slate-200">auth_routes.py</span>
              </div>
              <div className="flex items-center justify-center text-indigo-400 font-bold text-sm">➔</div>
              <div className="p-3 rounded-xl bg-[#0e1627] border border-rose-500/50 shadow-md shadow-rose-950/20">
                <span className="text-[9px] text-rose-400 uppercase font-bold block">3. DB Engine</span>
                <span className="text-xs font-bold text-slate-200">db.py</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How CodePath AI Works</h2>
          <p className="text-sm text-slate-400">From raw GitHub URL to interactive architectural comprehension</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Ingest Repository',
              desc: 'Connect any public GitHub repository or test with the bundled full-stack demo app.'
            },
            {
              step: '02',
              title: 'AST Code Analysis',
              desc: 'Extract imports, components, API client calls, functions, classes, and roles using real Python AST and JS parsing.'
            },
            {
              step: '03',
              title: 'Interactive Graph',
              desc: 'Generate a hierarchical React Flow dependency map with zoom, filtering, and node metrics.'
            },
            {
              step: '04',
              title: 'Ask & Trace Flow',
              desc: 'Ask questions like "How does auth work?" and see step-by-step nodes highlighted directly in the graph.'
            }
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-[#0e1627]/60 border border-slate-800">
              <span className="text-xs font-mono font-bold text-indigo-400">{item.step}</span>
              <h3 className="text-sm font-semibold text-slate-100 mt-2 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Key Capabilities</h2>
          <p className="text-sm text-slate-400">Everything needed to onboard to a complex codebase in minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 w-fit mb-4">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Visual Feature Tracing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trace features end-to-end: UI component ➔ API Client ➔ Route ➔ Business Service ➔ Database, with glowing animated edges and numerical step badges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800">
            <div className="p-2.5 rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-400 w-fit mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Contextual AI Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real retrieval pipeline that searches symbols, follows dependency chains, and extracts exact code snippets before asking the LLM.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800">
            <div className="p-2.5 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 w-fit mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Blast Radius & Impact Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any file to simulate code edits and uncover direct callers, downstream affected routes, and overall system blast radius risk.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-12 px-4 max-w-5xl mx-auto border-t border-slate-800/80 text-center">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-6">
          Built with Modern Engineering Stack
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">FastAPI</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">Python AST</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">React Flow</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">Dagre Hierarchical Layout</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">Gemini LLM</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">Tailwind CSS</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">Vite</span>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center border-t border-slate-800/80">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to explore a codebase?</h2>
        <p className="text-xs text-slate-400 mb-6">Start exploring immediately with our bundled full-stack demo repository.</p>
        <button
          onClick={onLaunchDemo}
          disabled={isAnalyzing}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-xl shadow-indigo-950/60 transition-all cursor-pointer hover:scale-105"
        >
          Launch Interactive Demo Now
        </button>
      </section>
    </div>
  );
}
