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
  Award,
  GraduationCap
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
      <div className="space-y-6">
        <div className="px-2 py-1">
          <BrandLogo size="md" showText={true} />
        </div>

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

      <div className="space-y-3 pt-4 border-t border-[#1e2433]">
        <div className="p-3 rounded-xl bg-[#121520] border border-[#1e2433] text-[10px] text-[#64748b] leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#00f2c3] font-mono font-bold uppercase tracking-wider text-[9px]">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Developer Credit</span>
          </div>
          <p className="font-bold text-[#f8fafc] text-[11px] leading-tight">
            Kurapati SriHarsha Vardhan
          </p>
          <p className="font-mono text-[10px] text-[#94a3b8]">
            23BCE8747 • VIT-AP University
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#090a0f] border border-[#161a26] text-[9px] text-[#64748b] leading-relaxed flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00f2c3] flex-shrink-0" />
          <span>Explainable AI Talent Engine</span>
        </div>
      </div>
    </aside>
  );
};
