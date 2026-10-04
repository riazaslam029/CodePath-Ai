import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AnalysisProgressModal from './components/UI/AnalysisProgressModal';
import RepoInputModal from './components/UI/RepoInputModal';
import CommandPalette from './components/UI/CommandPalette';
import { analyzeRepository, getDemoRepository } from './services/api';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [graphData, setGraphData] = useState(null);
  const [repoUrl, setRepoUrl] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Modal and operation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [targetRepoName, setTargetRepoName] = useState('');
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Expose command palette opener globally
  useEffect(() => {
    window.__openCommandPalette = () => setIsCommandPaletteOpen(true);
    return () => {
      delete window.__openCommandPalette;
    };
  }, []);

  // Preload demo repository
  useEffect(() => {
    getDemoRepository()
      .then((data) => {
        setGraphData(data);
        setIsDemo(true);
      })
      .catch((err) => {
        console.warn('Initial demo fetch failed:', err);
      });
  }, []);

  const handleLaunchDemo = useCallback(async () => {
    setTargetRepoName('Bundled Demo Codebase');
    setIsProgressModalOpen(true);
    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    setErrorMessage(null);

    try {
      const data = await getDemoRepository();
      setGraphData(data);
      setRepoUrl(null);
      setIsDemo(true);
      setIsAnalysisComplete(true);
    } catch (err) {
      setErrorMessage(err.message || 'Could not load demo repository');
      setIsProgressModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleAnalyzeRepo = useCallback(async (url) => {
    setTargetRepoName(url);
    setIsProgressModalOpen(true);
    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    setErrorMessage(null);

    try {
      const data = await analyzeRepository(url, false);
      setGraphData(data);
      setRepoUrl(url);
      setIsDemo(false);
      setIsAnalysisComplete(true);
    } catch (err) {
      setErrorMessage(
        err.message ||
          'We could not analyze this repository. Make sure it is public and contains supported Python or JS/TS source files.'
      );
      setIsProgressModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleFinishAnalysis = () => {
    setIsProgressModalOpen(false);
    setView('dashboard');
  };

  const handleResetGraph = () => {
    setView('dashboard');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090b10] text-[#f8fafc] font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={view}
        onNavigate={setView}
        activeRepo={graphData}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
        onLoadDemo={handleLaunchDemo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isAnalyzing={isAnalyzing}
      />

      {/* Engineered Error Banner */}
      {errorMessage && (
        <div className="bg-[#181016] border-b border-rose-900/60 px-4 py-2 flex items-center justify-between text-xs text-rose-300 font-mono z-40">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLaunchDemo()}
              className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 hover:bg-rose-900 text-rose-200 transition-colors"
            >
              Try Demo Instead
            </button>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-0.5 hover:bg-rose-900/60 rounded text-rose-400 hover:text-rose-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {view === 'landing' ? (
          <Landing
            onAnalyzeRepo={handleAnalyzeRepo}
            onLaunchDemo={handleLaunchDemo}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <Dashboard
            graphData={graphData}
            repoUrl={repoUrl}
            isDemo={isDemo}
            onResetToDemo={handleLaunchDemo}
          />
        )}
      </main>

      {/* Terminal Analysis Progress Modal */}
      <AnalysisProgressModal
        isOpen={isProgressModalOpen}
        targetRepo={targetRepoName}
        isComplete={isAnalysisComplete}
        onFinish={handleFinishAnalysis}
      />

      {/* Connect Repo Modal */}
      <RepoInputModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onAnalyze={handleAnalyzeRepo}
        onUseDemo={handleLaunchDemo}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={graphData?.nodes || []}
        onSelectNode={(node) => {
          setView('dashboard');
        }}
        onTraceFlow={(flow) => {
          setView('dashboard');
        }}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
        onLoadDemo={handleLaunchDemo}
        onResetGraph={handleResetGraph}
      />
    </div>
  );
}
