import React, { useState } from 'react';
import CodeGraph from '../components/Graph/CodeGraph';
import FileTree from '../components/RepositoryExplorer/FileTree';
import ChatPanel from '../components/Chat/ChatPanel';
import InspectorPanel from '../components/FileInspector/InspectorPanel';
import { Bot, FileCode, Layers, GitCommit, CheckCircle2, RotateCcw } from 'lucide-react';

export default function Dashboard({
  graphData,
  repoUrl,
  isDemo,
  onResetToDemo
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [tracedFiles, setTracedFiles] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('chat'); // 'chat' | 'inspector'

  const handleSelectNode = (nodeData) => {
    setSelectedNode(nodeData);
    setActiveRightTab('inspector');
  };

  const handleSelectFileFromTree = (nodeData) => {
    setSelectedNode(nodeData);
    setActiveRightTab('inspector');
  };

  const handleSelectNodeById = (nodeId) => {
    const found = graphData?.nodes?.find((n) => n.id === nodeId);
    if (found) {
      setSelectedNode(found);
      setActiveRightTab('inspector');
    }
  };

  const handleTraceFeature = (flowFiles) => {
    setTracedFiles(flowFiles || []);
  };

  const handleClearTrace = () => {
    setTracedFiles([]);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#080c14]">
      {/* 3-Column Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Repository Explorer (260px) */}
        <div className="w-64 flex-shrink-0 h-full border-r border-slate-800/80">
          <FileTree
            nodes={graphData?.nodes || []}
            selectedNodeId={selectedNode?.id}
            onSelectFile={handleSelectFileFromTree}
            repoName={graphData?.repo_name}
          />
        </div>

        {/* Center: Dependency Graph (Flex-1) */}
        <div className="flex-1 h-full relative">
          <CodeGraph
            graphData={graphData}
            selectedNodeId={selectedNode?.id}
            onSelectNode={handleSelectNode}
            tracedFiles={tracedFiles}
            onClearTrace={handleClearTrace}
          />
        </div>

        {/* Right: AI Assistant & Inspector (380px) */}
        <div className="w-96 flex-shrink-0 h-full flex flex-col bg-[#0b101d] border-l border-slate-800/80">
          {/* Tab Switcher Header */}
          <div className="h-10 border-b border-slate-800/80 flex items-center px-3 bg-[#080c14]/80">
            <button
              onClick={() => setActiveRightTab('chat')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeRightTab === 'chat'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-mono rounded-lg transition-colors ml-1 cursor-pointer ${
                activeRightTab === 'inspector'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>File Inspector {selectedNode ? `(${selectedNode.label})` : ''}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'chat' ? (
              <ChatPanel
                repoUrl={repoUrl}
                isDemo={isDemo}
                selectedFile={selectedNode}
                onTraceFeature={handleTraceFeature}
                activeTracedFiles={tracedFiles}
                onSelectStepFile={handleSelectNodeById}
              />
            ) : (
              <InspectorPanel
                fileNode={selectedNode}
                onClose={() => setSelectedNode(null)}
                onSelectNodeById={handleSelectNodeById}
                allEdges={graphData?.edges || []}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 border-t border-slate-800/80 bg-[#070b13] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1" />
            <span>Ready</span>
          </span>

          <span className="text-slate-500">|</span>

          <span>
            Repository: <strong className="text-slate-200">{graphData?.repo_name || 'demo-app'}</strong>
          </span>

          <span className="text-slate-500">|</span>

          <span>
            {graphData?.nodes?.length || 0} files &middot; {graphData?.edges?.length || 0} connections
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {tracedFiles.length > 0 ? (
            <div className="flex items-center space-x-2">
              <span className="text-indigo-400 font-semibold">
                Trace active: {tracedFiles.length} nodes highlighted
              </span>
              <button
                onClick={handleClearTrace}
                className="text-slate-500 hover:text-slate-300 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="text-slate-500">
              {selectedNode ? `Selected: ${selectedNode.path}` : 'Click any node to inspect'}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
