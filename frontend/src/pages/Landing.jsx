import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Route,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Terminal,
  CheckCircle2,
  Play,
  FileCode,
  Globe,
  CornerDownRight,
  GitBranch
} from 'lucide-react';
import GithubIcon from '../components/UI/GithubIcon';
import Badge from '../components/UI/Badge';

export default function Landing({
  onAnalyzeRepo,
  onLaunchDemo,
  isAnalyzing
}) {
  const [repoInput, setRepoInput] = useState('');
  const [previewActiveStep, setPreviewActiveStep] = useState(2); // interactive hero graph step

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onAnalyzeRepo(repoInput.trim());
    }
  };

  const HERO_NODES = [
    { id: 'login', name: 'Login.jsx', tier: 'component', role: 'React UI Form', step: 1 },
    { id: 'client', name: 'apiClient.js', tier: 'api', role: 'Client HTTP Layer', step: 2 },
    { id: 'route', name: 'auth_routes.py', tier: 'api', role: 'FastAPI Endpoint', step: 3 },
    { id: 'service', name: 'auth_service.py', tier: 'service', role: 'Credential Verification', step: 4 },
    { id: 'model', name: 'user.py', tier: 'model', role: 'ORM Domain Entity', step: 5 },
    { id: 'db', name: 'db.py', tier: 'database', role: 'Session Manager', step: 6 }
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-[#f8fafc] overflow-y-auto font-sans selection:bg-indigo-500/30">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#232d42 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 max-w-4xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#131823] border border-[#1e2738] text-[11px] font-mono text-[#94a3b8] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>CodePath AI &middot; AST Codebase Intelligence Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f8fafc] mb-4 leading-tight">
          Understand Any Codebase. <br />
          <span className="text-indigo-400">Visually.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto mb-8 font-normal leading-relaxed">
          CodePath AI turns unfamiliar repositories into interactive dependency maps you can explore, question, and trace in real time.
        </p>

        {/* Input Bar */}
        <div className="max-w-lg mx-auto mb-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-1 rounded-lg bg-[#0e121a] border border-[#232d42] shadow-xl"
          >
            <div className="relative flex-1 flex items-center">
              <GithubIcon className="w-4 h-4 text-[#64748b] absolute left-3" />
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="w-full pl-9 pr-2 py-2 bg-transparent text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!repoInput.trim() || isAnalyzing}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Analyze Repo
            </button>
          </form>
        </div>

        {/* Secondary Action */}
        <div className="flex items-center justify-center space-x-2 text-xs text-[#64748b] font-mono">
          <span>Or explore without API limits:</span>
          <button
            onClick={onLaunchDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Try Bundled Demo</span>
          </button>
        </div>

        {/* Miniature Interactive Hero Graph Preview */}
        <div className="mt-12 text-left rounded-xl border border-[#1e2738] bg-[#0c1017] shadow-2xl overflow-hidden font-mono">
          <div className="px-4 py-2.5 bg-[#101520] border-b border-[#1a2232] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[#94a3b8]">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>demo-cloud-app &middot; Interactive Authentication Flow</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-[#64748b]">Click step to simulate:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPreviewActiveStep(s)}
                    className={`w-5 h-5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      previewActiveStep >= s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#182030] text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-[#090b10]">
            {HERO_NODES.map((node) => {
              const isTraced = node.step <= previewActiveStep;
              const isCurrent = node.step === previewActiveStep;

              return (
                <div
                  key={node.id}
                  onClick={() => setPreviewActiveStep(node.step)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#151c2a] border-indigo-400 ring-1 ring-indigo-400/80 shadow-lg shadow-indigo-950/50'
                      : isTraced
                      ? 'bg-[#111622] border-indigo-500/50 text-[#f8fafc]'
                      : 'bg-[#0c0f16] border-[#182030] opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge type={node.tier} className="text-[8px] py-0 px-1">
                      {node.tier}
                    </Badge>
                    <span className="text-[9px] text-[#64748b]">Step {node.step}</span>
                  </div>
                  <div className="text-xs font-bold text-[#f1f5f9] truncate">
                    {node.name}
                  </div>
                  <div className="text-[9px] text-[#94a3b8] truncate mt-0.5">
                    {node.role}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-[#0d121c] border-t border-[#1a2232] flex items-center justify-between text-[11px] text-[#64748b]">
            <div className="flex items-center space-x-1.5 text-indigo-300">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Simulated execution path: {HERO_NODES.slice(0, previewActiveStep).map((n) => n.name).join(' ➔ ')}
              </span>
            </div>
            <button
              onClick={onLaunchDemo}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Open Full Interactive Graph ➔
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-4 max-w-4xl mx-auto border-t border-[#1a2232]">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc] mb-2 font-mono">
            How CodePath AI Works
          </h2>
          <p className="text-xs text-[#94a3b8] font-mono">
            Deterministic AST parsing paired with directed dependency traversal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
          {[
            {
              step: '01',
              title: 'Ingestion & Filter',
              desc: 'Retrieves public Git trees. Filters build outputs, node_modules, and binaries.'
            },
            {
              step: '02',
              title: 'AST Code Extraction',
              desc: 'Parses Python AST and JS/TS imports, exports, functions, classes, and HTTP calls.'
            },
            {
              step: '03',
              title: 'Graph Adjacency',
              desc: 'Bridges frontend network calls to backend route handlers into a Dagre layout map.'
            },
            {
              step: '04',
              title: 'AI Feature Tracing',
              desc: 'Asks repo questions and lights up sequential feature execution paths in real time.'
            }
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-lg bg-[#0e121a] border border-[#1e2738]">
              <span className="text-[11px] text-indigo-400 font-bold">{item.step}</span>
              <h3 className="text-xs font-semibold text-[#f1f5f9] mt-1.5 mb-1">{item.title}</h3>
              <p className="text-[11px] text-[#64748b] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-14 px-4 max-w-4xl mx-auto border-t border-[#1a2232]">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc] mb-2 font-mono">
            Engineered Capabilities
          </h2>
          <p className="text-xs text-[#94a3b8] font-mono">
            Built for developers joining unfamiliar codebases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-[#0e121a] border border-[#1e2738]">
            <div className="p-2 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 w-fit mb-3">
              <Route className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#f1f5f9] mb-1 font-mono uppercase tracking-wider">
              Visual Feature Tracing
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Trace any feature from frontend component through network client and router to business services and database queries.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0e121a] border border-[#1e2738]">
            <div className="p-2 rounded bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 w-fit mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#f1f5f9] mb-1 font-mono uppercase tracking-wider">
              Targeted Context Retrieval
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Rather than blindly sending thousands of files to an LLM, CodePath traverses graph chains to retrieve exact code context.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0e121a] border border-[#1e2738]">
            <div className="p-2 rounded bg-amber-600/10 border border-amber-500/20 text-amber-400 w-fit mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#f1f5f9] mb-1 font-mono uppercase tracking-wider">
              Blast Radius Analysis
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Click any file before refactoring to uncover direct callers, downstream affected routes, and potential system breakage risk.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Architecture Strip */}
      <section className="py-10 px-4 max-w-4xl mx-auto border-t border-[#1a2232] text-center font-mono">
        <span className="text-[10px] uppercase tracking-wider text-[#64748b] block mb-4">
          Tech Stack Specifications
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#94a3b8]">
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">FastAPI (Python 3.13)</span>
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">Python AST Parser</span>
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">React Flow Canvas</span>
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">Dagre Layout</span>
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">Google Gemini</span>
          <span className="px-2.5 py-1 rounded bg-[#0e121a] border border-[#1e2738]">Tailwind CSS 4</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 max-w-2xl mx-auto text-center border-t border-[#1a2232]">
        <h2 className="text-lg font-bold text-[#f8fafc] mb-2 font-mono">Ready to test the code graph?</h2>
        <p className="text-xs text-[#94a3b8] mb-5 font-mono">Instant local development or live GitHub analysis.</p>
        <button
          onClick={onLaunchDemo}
          disabled={isAnalyzing}
          className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-lg transition-colors cursor-pointer"
        >
          Launch Interactive Dashboard
        </button>
      </section>
    </div>
  );
}
