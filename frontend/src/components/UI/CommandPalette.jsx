import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Route,
  Play,
  RotateCcw,
  FileCode,
  ShieldCheck,
  Bot,
  Terminal,
  CornerDownLeft,
  X
} from 'lucide-react';
import Badge from './Badge';

export default function CommandPalette({
  isOpen,
  onClose,
  nodes = [],
  onSelectNode,
  onTraceFlow,
  onOpenAnalyzeModal,
  onLoadDemo,
  onResetGraph
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else if (window.__openCommandPalette) window.__openCommandPalette();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static commands list
  const staticActions = [
    {
      id: 'trace-auth',
      category: 'Quick Trace',
      icon: Route,
      title: 'Trace Authentication Flow',
      subtitle: 'Login.jsx ➔ apiClient.js ➔ auth_routes ➔ auth_service ➔ user ➔ db',
      action: () => {
        onTraceFlow([
          'frontend/src/components/Login.jsx',
          'frontend/src/api/apiClient.js',
          'backend/routes/auth_routes.py',
          'backend/services/auth_service.py',
          'backend/models/user.py',
          'backend/database/db.py'
        ]);
        onClose();
      }
    },
    {
      id: 'trace-payment',
      category: 'Quick Trace',
      icon: Route,
      title: 'Trace Payment Flow',
      subtitle: 'CheckoutModal.jsx ➔ apiClient.js ➔ payment_routes ➔ payment_service ➔ db',
      action: () => {
        onTraceFlow([
          'frontend/src/components/CheckoutModal.jsx',
          'frontend/src/api/apiClient.js',
          'backend/routes/payment_routes.py',
          'backend/services/payment_service.py',
          'backend/database/db.py'
        ]);
        onClose();
      }
    },
    {
      id: 'analyze-repo',
      category: 'Repository',
      icon: Terminal,
      title: 'Analyze GitHub Repository',
      subtitle: 'Connect a public GitHub repo URL',
      action: () => {
        onClose();
        onOpenAnalyzeModal();
      }
    },
    {
      id: 'switch-demo',
      category: 'Repository',
      icon: Play,
      title: 'Load Demo Codebase',
      subtitle: 'Switch to bundled full-stack demo repository',
      action: () => {
        onClose();
        onLoadDemo();
      }
    },
    {
      id: 'reset-graph',
      category: 'Graph',
      icon: RotateCcw,
      title: 'Reset Graph View',
      subtitle: 'Clear active trace and refit viewport',
      action: () => {
        onClose();
        onResetGraph();
      }
    }
  ];

  // File match commands
  const filteredFiles = query.trim()
    ? nodes
        .filter((n) =>
          n.label.toLowerCase().includes(query.toLowerCase()) ||
          n.path.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map((n) => ({
          id: `file-${n.id}`,
          category: 'Files',
          icon: FileCode,
          title: n.label,
          subtitle: n.path,
          node: n,
          action: () => {
            onSelectNode(n);
            onClose();
          }
        }))
    : [];

  const filteredActions = query.trim()
    ? staticActions.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : staticActions;

  const allItems = [...filteredActions, ...filteredFiles];

  // Keyboard navigation
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-[#232d42] bg-[#0e121a] shadow-2xl shadow-black/80 overflow-hidden font-sans"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1a2232] bg-[#111622]">
          <Search className="w-4 h-4 text-[#64748b] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search files, or trace..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#1c2436] border border-[#2e3850] text-[10px] font-mono text-[#94a3b8]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length > 0 ? (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-mono select-none ${
                    isSelected
                      ? 'bg-[#181f2d] text-[#f8fafc] border border-[#344260]'
                      : 'text-[#94a3b8] hover:bg-[#131823] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-indigo-600/30 text-indigo-300' : 'bg-[#181f2d] text-[#64748b]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate text-left">
                      <div className="font-medium text-[#f1f5f9] truncate">{item.title}</div>
                      <div className="text-[10px] text-[#64748b] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {item.node ? (
                      <Badge type={item.node.type} className="text-[9px] py-0 px-1 opacity-80" />
                    ) : (
                      <span className="text-[10px] text-[#64748b] uppercase tracking-wider">{item.category}</span>
                    )}
                    {isSelected && <CornerDownLeft className="w-3 h-3 text-indigo-400" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[#64748b] font-mono">
              No matching commands or files found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3.5 py-2 border-t border-[#1a2232] bg-[#0b0e15] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>CodePath Command Palette</span>
        </div>
      </div>
    </div>
  );
}
