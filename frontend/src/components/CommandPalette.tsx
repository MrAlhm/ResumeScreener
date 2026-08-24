import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  UploadCloud,
  Briefcase,
  Users,
  GitCompare,
  History,
  ShieldCheck,
  Download,
  Trash2,
  Zap,
  FlaskConical,
  FileCheck,
  X
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onToggleBlindMode: () => void;
  isBlindMode: boolean;
  onClearWorkspace: () => void;
  candidateNames: { id: number; name: string; title?: string; score?: number }[];
  onSelectCandidate: (id: number) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleBlindMode,
  isBlindMode,
  onClearWorkspace,
  candidateNames,
  onSelectCandidate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'upload' as NavTab, label: 'Screen Candidates (Upload)', icon: UploadCloud, category: 'Navigation' },
    { id: 'ats' as NavTab, label: 'ATS Score Checker', icon: FileCheck, category: 'Tools' },
    { id: 'job' as NavTab, label: 'Job Descriptions Studio', icon: Briefcase, category: 'Navigation' },
    { id: 'results' as NavTab, label: 'Candidates Leaderboard', icon: Users, category: 'Navigation' },
    { id: 'compare' as NavTab, label: 'Candidate Comparison Matrix', icon: GitCompare, category: 'Navigation' },
    { id: 'lab' as NavTab, label: 'Interactive Match Lab (Sandbox)', icon: FlaskConical, category: 'Navigation' },
    { id: 'history' as NavTab, label: 'Screening Audit History', icon: History, category: 'Navigation' }
  ];

  const filteredNav = quickNav.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCandidates = candidateNames.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.title && c.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-[#121520] rounded-2xl shadow-2xl max-w-xl w-full border border-[#242b3d] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-[#1e2433] bg-[#0d0f17]">
          <Search className="h-4 w-4 text-[#64748b] mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, candidate name, or search action... (ESC to exit)"
            className="w-full text-xs font-medium text-[#f8fafc] bg-transparent focus:outline-none placeholder-[#64748b]"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#64748b] bg-[#181d2a] border border-[#242b3d] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] px-3 py-1">
              Actions
            </p>
            <button
              onClick={() => {
                onToggleBlindMode();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#181d2a] text-[#f8fafc] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#00f2c3]" />
                <span>Toggle Blind Screening Mode</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isBlindMode ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-[#181d2a] text-[#64748b]'
              }`}>
                {isBlindMode ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                onClearWorkspace();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-950/40 text-rose-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
              <span>Clear Workspace Database</span>
            </button>
          </div>

          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] px-3 py-1">
                Navigation
              </p>
              {filteredNav.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNavigate(n.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#181d2a] text-[#f8fafc] transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-[#64748b] group-hover:text-[#00f2c3]" />
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Candidate Direct Search */}
          {filteredCandidates.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] px-3 py-1">
                Candidates ({filteredCandidates.length})
              </p>
              {filteredCandidates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCandidate(c.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#181d2a] text-[#f8fafc] transition-colors group"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#f8fafc] group-hover:text-[#00f2c3]">{c.name}</p>
                    <p className="text-[10px] text-[#64748b]">{c.title || 'Candidate'}</p>
                  </div>
                  {c.score !== undefined && (
                    <span className="font-mono font-bold text-[#00f2c3] text-xs">
                      {c.score}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1e2433] bg-[#0d0f17] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Use ⌘K / Ctrl+K anytime</span>
          <span>Unthinkable Pro</span>
        </div>
      </div>
    </div>
  );
};
