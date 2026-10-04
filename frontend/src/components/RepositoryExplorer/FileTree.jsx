import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Globe,
  Database,
  Cpu,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';
import Badge from '../UI/Badge';

const TYPE_ICONS = {
  component: Layers,
  api: Globe,
  service: Cpu,
  auth: ShieldCheck,
  database: Database,
  model: FileCode,
  util: FileText
};

function buildFileTree(nodes) {
  const root = { name: 'root', isDirectory: true, children: {} };

  nodes.forEach((node) => {
    const parts = node.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.children[part] = {
          name: part,
          isDirectory: false,
          nodeData: node
        };
      } else {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            isDirectory: true,
            children: {}
          };
        }
        current = current.children[part];
      }
    }
  });

  return root;
}

function TreeNode({ item, level = 0, selectedNodeId, onSelectFile }) {
  const [isOpen, setIsOpen] = useState(true);

  if (item.isDirectory) {
    const sortedChildren = Object.values(item.children).sort((a, b) => {
      if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
      return a.isDirectory ? -1 : 1;
    });

    return (
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          className="flex items-center space-x-1.5 py-1 px-2 hover:bg-[#131926] cursor-pointer text-[#94a3b8] hover:text-[#f1f5f9] text-xs font-mono transition-colors group select-none rounded"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#94a3b8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#94a3b8]" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-sky-400/90" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-sky-500/80" />
          )}
          <span className="font-medium text-[#cbd5e1]">{item.name}</span>
        </div>

        {isOpen && (
          <div className="relative ml-2 pl-1 border-l border-[#1a2336]/60">
            {sortedChildren.map((child) => (
              <TreeNode
                key={child.name}
                item={child}
                level={level + 1}
                selectedNodeId={selectedNodeId}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const node = item.nodeData;
  const isSelected = selectedNodeId === node.id;
  const Icon = TYPE_ICONS[node.type?.toLowerCase()] || FileCode;

  return (
    <div
      onClick={() => onSelectFile(node)}
      style={{ paddingLeft: `${level * 12 + 12}px` }}
      className={`flex items-center justify-between py-1 px-2 text-xs font-mono cursor-pointer transition-colors select-none rounded mx-1 ${
        isSelected
          ? 'bg-indigo-600/20 text-indigo-200 font-medium border border-indigo-500/40'
          : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#131926] border border-transparent'
      }`}
    >
      <div className="flex items-center space-x-2 truncate">
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-[#64748b]'}`} />
        <span className="truncate">{node.label}</span>
      </div>
      <Badge type={node.type} className="text-[9px] py-0 px-1 opacity-75" />
    </div>
  );
}

export default function FileTree({
  nodes = [],
  selectedNodeId,
  onSelectFile,
  repoName = 'Repository'
}) {
  const [search, setSearch] = useState('');

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.filter(
      (n) => n.path.toLowerCase().includes(q) || n.label.toLowerCase().includes(q)
    );
  }, [nodes, search]);

  const tree = useMemo(() => buildFileTree(filteredNodes), [filteredNodes]);

  return (
    <div className="h-full flex flex-col bg-[#0b0f17] border-r border-[#1a2232] select-none font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#1a2232]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider font-mono">
            Files & Modules
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#131823] text-[#94a3b8] font-mono border border-[#1e2738]">
            {nodes.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-[#0e131d] border border-[#1e2738] rounded-md text-xs text-[#f1f5f9] placeholder-[#64748b] font-mono focus:outline-none focus:border-indigo-500/70"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-[#64748b] hover:text-[#cbd5e1]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tree Body */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {Object.values(tree.children).length > 0 ? (
          Object.values(tree.children).map((rootItem) => (
            <TreeNode
              key={rootItem.name}
              item={rootItem}
              level={0}
              selectedNodeId={selectedNodeId}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <div className="p-6 text-center text-xs text-[#64748b] font-mono">
            No matching files found.
          </div>
        )}
      </div>
    </div>
  );
}
