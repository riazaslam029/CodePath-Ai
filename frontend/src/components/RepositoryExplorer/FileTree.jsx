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
  FileText
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
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 14 + 10}px` }}
          className="flex items-center space-x-1.5 py-1.5 px-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 text-xs font-mono transition-colors group select-none"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-sky-400/90" />
          ) : (
            <Folder className="w-4 h-4 text-sky-500/80" />
          )}
          <span className="font-medium text-slate-200">{item.name}</span>
        </div>

        {isOpen && (
          <div>
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
      style={{ paddingLeft: `${level * 14 + 18}px` }}
      className={`flex items-center justify-between py-1.5 px-2 text-xs font-mono cursor-pointer transition-all select-none border-l-2 ${
        isSelected
          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold shadow-inner'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
      }`}
    >
      <div className="flex items-center space-x-2 truncate">
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
        <span className="truncate">{node.label}</span>
      </div>
      <Badge type={node.type} className="text-[9px] py-0 px-1 opacity-80" />
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
    <div className="h-full flex flex-col bg-[#0b101d] border-r border-slate-800/80 select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Files & Modules
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {nodes.length}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-[#080c14] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70"
          />
        </div>
      </div>

      {/* Hierarchical Tree Body */}
      <div className="flex-1 overflow-y-auto py-2">
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
          <div className="p-4 text-center text-xs text-slate-500">
            No matching files found.
          </div>
        )}
      </div>
    </div>
  );
}
