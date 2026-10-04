import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AnalysisProgressModal from './components/UI/AnalysisProgressModal';
import RepoInputModal from './components/UI/RepoInputModal';
import { analyzeRepository, getDemoRepository } from './services/api';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [graphData, setGraphData] = useState(null);
  const [repoUrl, setRepoUrl] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [targetRepoName, setTargetRepoName] = useState('');
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load demo repository in background so it is instantly ready
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

  const handleLaunchDemo = async () => {
    setTargetRepoName('Bundled Cloud App Demo');
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
  };

  const handleAnalyzeRepo = async (url) => {
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
        err.message || 'We couldn\'t analyze this repository. Make sure it is public and contains supported source files.'
      );
      setIsProgressModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinishAnalysis = () => {
    setIsProgressModalOpen(false);
    setView('dashboard');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={view}
        onNavigate={setView}
        activeRepo={graphData}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
        onLoadDemo={handleLaunchDemo}
        isAnalyzing={isAnalyzing}
      />

      {/* Error banner if an operation failed */}
      {errorMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200 z-40">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-900 rounded text-rose-400 hover:text-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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

      {/* Analysis Progress Overlay */}
      <AnalysisProgressModal
        isOpen={isProgressModalOpen}
        targetRepo={targetRepoName}
        isComplete={isAnalysisComplete}
        onFinish={handleFinishAnalysis}
      />

      {/* Analyze Repo Input Modal */}
      <RepoInputModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onAnalyze={handleAnalyzeRepo}
        onUseDemo={handleLaunchDemo}
      />
    </div>
  );
}
