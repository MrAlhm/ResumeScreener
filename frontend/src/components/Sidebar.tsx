import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Briefcase,
  Users,
  GitCompare,
  History,
  FlaskConical,
  Settings,
  HelpCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export type NavTab = 'dashboard' | 'upload' | 'job' | 'results' | 'candidates' | 'compare' | 'history' | 'lab';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  candidateCount: number;
  resultsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  candidateCount,
  resultsCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'upload' as NavTab,
      label: 'Screen Candidates',
      icon: UploadCloud,
      badge: candidateCount > 0 ? candidateCount : null
    },
    {
      id: 'job' as NavTab,
      label: 'Job Descriptions',
      icon: Briefcase,
      badge: null
    },
    {
      id: 'results' as NavTab,
      label: 'Candidates',
      icon: Users,
      badge: resultsCount > 0 ? resultsCount : null
    },
    {
      id: 'compare' as NavTab,
      label: 'Compare',
      icon: GitCompare,
      badge: null
    },
    {
      id: 'lab' as NavTab,
      label: 'Match Lab',
      icon: FlaskConical,
      badge: 'PRO'
    },
    {
      id: 'history' as NavTab,
      label: 'Screening History',
      icon: History,
      badge: null
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between rounded-2xl bg-[#0d0f17] border border-[#1e2433] p-4 text-[#94a3b8] shadow-2xl">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="px-2 py-1">
          <BrandLogo size="md" showText={true} />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'results' && activeTab === 'candidates');

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#181d2a] text-[#f8fafc] border-l-2 border-[#00f2c3] shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#131622]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#00f2c3]' : 'text-[#64748b] group-hover:text-[#94a3b8]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === 'PRO'
                        ? 'bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30'
                        : isActive
                        ? 'bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30'
                        : 'bg-[#1e2433] text-[#94a3b8]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Settings & Responsible AI */}
      <div className="space-y-3 pt-6 border-t border-[#1e2433]">
        <div className="space-y-1">
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#64748b] hover:text-[#f8fafc] hover:bg-[#131622] transition-colors"
          >
            <Settings className="h-4 w-4 text-[#64748b]" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#64748b] hover:text-[#f8fafc] hover:bg-[#131622] transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-[#64748b]" />
            <span>Help &amp; API Docs</span>
          </button>
        </div>

        {/* Responsible AI Transparency Note */}
        <div className="p-3 rounded-xl bg-[#121520] border border-[#1e2433] text-[10px] text-[#64748b] leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-[#94a3b8] font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00f2c3]" />
            <span>Explainable AI</span>
          </div>
          <p>
            AI screening assists recruiter review and should not be used as the sole basis for hiring decisions.
          </p>
        </div>
      </div>
    </aside>
  );
};
