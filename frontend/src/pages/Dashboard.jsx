import React, { useState } from 'react';
import CodeGraph from '../components/Graph/CodeGraph';
import FileTree from '../components/RepositoryExplorer/FileTree';
import ChatPanel from '../components/Chat/ChatPanel';
import InspectorPanel from '../components/FileInspector/InspectorPanel';
import { Bot, FileCode, Route, Sparkles, X } from 'lucide-react';

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
    <div className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-[#090b10] font-sans">
      {/* 3-Column IDE Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Repository Explorer (250px) */}
        <div className="w-60 flex-shrink-0 h-full border-r border-[#1a2232]">
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

        {/* Right: AI Assistant & Inspector (360px) */}
        <div className="w-[360px] flex-shrink-0 h-full flex flex-col bg-[#0b0f17] border-l border-[#1a2232]">
          {/* Tabs */}
          <div className="h-9 border-b border-[#1a2232] flex items-center px-2.5 bg-[#0e121a]">
            <button
              onClick={() => setActiveRightTab('chat')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeRightTab === 'chat'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ml-1 cursor-pointer ${
                activeRightTab === 'inspector'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Inspector {selectedNode ? `(${selectedNode.label})` : ''}</span>
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
                onTraceFileFlow={handleTraceFeature}
              />
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <footer className="h-6 border-t border-[#1a2232] bg-[#080a0f] px-3 flex items-center justify-between text-[10px] font-mono text-[#64748b] select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ready</span>
          </span>

          <span className="text-[#232d42]">|</span>

          <span>
            Repo: <strong className="text-[#cbd5e1]">{graphData?.repo_name || 'demo-app'}</strong>
          </span>

          <span className="text-[#232d42]">|</span>

          <span>
            {graphData?.nodes?.length || 0} files &middot; {graphData?.edges?.length || 0} edges
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {tracedFiles.length > 0 ? (
            <div className="flex items-center space-x-2 text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>
                Active Execution Path ({tracedFiles.length} files)
              </span>
              <button
                onClick={handleClearTrace}
                className="text-[#94a3b8] hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="text-[#64748b]">
              {selectedNode ? `Node: ${selectedNode.path}` : 'Press Ctrl+K for commands'}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
