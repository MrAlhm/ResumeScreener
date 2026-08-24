import React from 'react';
import { Search, Trash2, ShieldCheck, GraduationCap } from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  demoMode: boolean;
  onClearData: () => void;
  onOpenCommandPalette: () => void;
  isBlindMode: boolean;
  onToggleBlindMode: () => void;
  isActionLoading?: boolean;
}

const PAGE_META: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time candidate pipeline overview & AI insights'
  },
  upload: {
    title: 'Screen Candidates',
    subtitle: 'Bulk resume upload & automated multi-stage parsing pipeline'
  },
  job: {
    title: 'Job Descriptions',
    subtitle: 'Define role requirements, mandatory criteria & compensation'
  },
  results: {
    title: 'Candidate Leaderboard',
    subtitle: 'Explainable semantic matching, rankings & recruiter decisions'
  },
  candidates: {
    title: 'Candidate Intelligence Report',
    subtitle: 'Deep qualification breakdown, cited evidence & AI confidence'
  },
  compare: {
    title: 'Candidate Comparison',
    subtitle: 'Side-by-side competency radar & dimension comparison matrix'
  },
  lab: {
    title: 'Interactive Match Lab',
    subtitle: 'Real-time resume vs. job description live matching sandbox'
  },
  history: {
    title: 'Screening Audit History',
    subtitle: 'Historical screening sessions and evaluation records'
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  demoMode,
  onClearData,
  onOpenCommandPalette,
  isBlindMode,
  onToggleBlindMode,
  isActionLoading
}) => {
  const currentMeta = PAGE_META[activeTab] || PAGE_META.dashboard;

  return (
    <header className="bg-[#0d0f17]/95 backdrop-blur-md border-b border-[#1e2433] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="space-y-0.5">
            <h1 className="text-sm sm:text-base font-extrabold text-[#f8fafc] tracking-tight flex items-center gap-2">
              <span>{currentMeta.title}</span>
            </h1>
            <p className="text-[11px] text-[#64748b] font-medium hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#121520] hover:bg-[#181d2a] border border-[#1e2433] hover:border-[#2c354a] text-xs text-[#64748b] transition-all w-60 justify-between group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#64748b] group-hover:text-[#00f2c3] transition-colors" />
              <span className="text-[11px]">Quick search...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-[#0d0f17] border border-[#242b3d] px-1.5 py-0.5 rounded text-[#94a3b8]">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleBlindMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                isBlindMode
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800 shadow-sm'
                  : 'bg-[#121520] text-[#94a3b8] hover:text-[#f8fafc] border-[#1e2433]'
              }`}
              title="Toggle Blind Screening Shield to eliminate unconscious hiring bias"
            >
              <ShieldCheck className={`h-3.5 w-3.5 ${isBlindMode ? 'text-emerald-400' : 'text-[#64748b]'}`} />
              <span className="hidden sm:inline">{isBlindMode ? 'Blind Mode: ON' : 'Blind Mode'}</span>
            </button>

            <button
              onClick={onClearData}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f8fafc] bg-[#121520] hover:bg-[#181d2a] border border-[#1e2433] hover:border-[#2c354a] rounded-xl transition-all disabled:opacity-50"
              title="Reset all workspace candidate and job data"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#64748b]" />
              <span className="hidden xl:inline">Reset</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-[#1e2433]">
              <div className="h-8 w-8 rounded-xl bg-[#181d2a] border border-[#242b3d] flex items-center justify-center text-[#00f2c3] font-mono font-bold text-xs">
                HV
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#f8fafc] leading-tight">SriHarsha Vardhan</p>
                <p className="text-[10px] text-[#64748b] font-mono">VIT-AP (23BCE8747)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
