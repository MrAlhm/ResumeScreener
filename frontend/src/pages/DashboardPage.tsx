import React from 'react';
import {
  Users,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
  Award,
  ArrowRight,
  Briefcase,
  UploadCloud,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  FolderOpen,
  MapPin,
  Bot
} from 'lucide-react';
import { DashboardStats } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  stats: DashboardStats | null;
  onNavigate: (tab: NavTab) => void;
  onStartScreening: () => void;
  onLoadSamples?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  onNavigate,
  onStartScreening,
  onLoadSamples
}) => {
  const totalCandidates = stats?.total_candidates ?? 0;
  const screenedCount = stats?.processed_candidates ?? 0;
  const shortlistedCount = stats?.shortlisted_candidates ?? 0;
  const avgMatch = stats?.average_match_score ? `${stats.average_match_score}%` : '—';
  const hasCandidates = totalCandidates > 0;
  const hasJob = !!stats?.current_job;

  const jobTitle = stats?.current_job?.title || 'Machine Learning Engineer';
  const company = stats?.current_job?.company || 'NexusAI Technologies';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e2433]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">Hiring Intelligence Overview</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30">
              LIVE PIPELINE
            </span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Real-time pipeline metrics, automated semantic matching, and explainable candidate fit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] shadow-sm transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Resumes</span>
          </button>
          <button
            onClick={() => onNavigate('job')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#121520] hover:bg-[#181d2a] text-[#f8fafc] border border-[#1e2433] transition-colors"
          >
            <Briefcase className="h-4 w-4 text-[#94a3b8]" />
            <span>Job Criteria</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics with Large Numerical Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL CANDIDATES */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] uppercase">
            TOTAL CANDIDATES
          </p>
          <p className="text-4xl font-extrabold font-mono text-[#f8fafc] tracking-tight">
            {totalCandidates}
          </p>
          <p className="text-[11px] text-[#94a3b8] flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f2c3]" /> Active pipeline profiles
          </p>
        </div>

        {/* SCREENED */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] uppercase">
            SCREENED
          </p>
          <p className="text-4xl font-extrabold font-mono text-[#f8fafc] tracking-tight">
            {screenedCount}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Extracted &amp; structured
          </p>
        </div>

        {/* SHORTLISTED */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] uppercase">
            SHORTLISTED
          </p>
          <p className="text-4xl font-extrabold font-mono text-[#f8fafc] tracking-tight">
            {shortlistedCount}
          </p>
          <p className="text-[11px] text-[#00f2c3] flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f2c3]" /> Recruiter approved
          </p>
        </div>

        {/* AVG MATCH */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] uppercase">
            AVG MATCH
          </p>
          <p className="text-4xl font-extrabold font-mono text-[#f8fafc] tracking-tight">
            {avgMatch}
          </p>
          <p className="text-[11px] text-[#38bdf8] flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" /> Across active role
          </p>
        </div>
      </div>

      {/* AI INSIGHT SECTION */}
      <div className="bg-[#0f131f] rounded-2xl border border-[#242b3d] p-6 shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#00f2c3]/15 border border-[#00f2c3]/30 flex items-center justify-center text-[#00f2c3]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#00f2c3] uppercase">
            AI INSIGHT
          </h3>
        </div>

        <p className="text-sm text-[#e2e8f0] font-medium leading-relaxed max-w-3xl">
          {hasCandidates
            ? `"${stats?.shortlisted_candidates || 2} candidates meet the current screening threshold. The strongest candidates demonstrate deep Python, SQL, and production ML experience. Docker, Kubernetes, and Cloud deployments are the most common differentiation points."`
            : `"Workspace is initialized in real-time mode. Upload resumes or load candidate profiles to trigger semantic matching and generate deep pipeline insights against '${jobTitle}'."`}
        </p>
      </div>

      {/* Main Grid: Active Screening & Quick Actions / Empty State */}
      {!hasCandidates ? (
        <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-10 text-center space-y-5 max-w-2xl mx-auto">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#181d2a] border border-[#242b3d] text-[#00f2c3] flex items-center justify-center">
            <UploadCloud className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#f8fafc]">No candidates yet.</h3>
            <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
              Upload your first set of resumes to begin screening with Unthinkable's semantic matching engine.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Resumes</span>
            </button>
            {onLoadSamples && (
              <button
                onClick={onLoadSamples}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181d2a] hover:bg-[#1f2536] text-[#f8fafc] rounded-xl text-xs font-semibold border border-[#242b3d] transition-colors"
              >
                <FolderOpen className="h-4 w-4 text-[#94a3b8]" />
                <span>Load Demo Dataset (5 Candidates)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Screening Card (2 cols) */}
          <div className="lg:col-span-2 bg-[#121520] rounded-2xl border border-[#1e2433] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#00f2c3]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#94a3b8]">
                  Active Screening
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181d2a] text-[#94a3b8] border border-[#242b3d]">
                PRIMARY TARGET
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d0f17] border border-[#1e2433]">
              <div className="space-y-1.5">
                <h4 className="text-lg font-extrabold text-[#f8fafc]">{jobTitle}</h4>
                <p className="text-xs text-[#94a3b8] font-medium">{company} • 2+ years required</p>
                <div className="flex items-center gap-4 text-xs font-mono text-[#00f2c3] pt-1">
                  <span>{screenedCount} candidates</span>
                  <span>•</span>
                  <span>{avgMatch} average match</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('results')}
                  className="px-4 py-2.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <span>View Results</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Candidate Spotlight */}
            {stats?.strongest_candidate && (
              <div className="p-4 rounded-xl bg-[#151926] border border-[#242b3d] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-[#f8fafc]">{stats.strongest_candidate.name}</span>
                    <span className="text-[10px] font-mono text-[#64748b] bg-[#0d0f17] px-2 py-0.5 rounded border border-[#1e2433]">
                      #1 RANKED
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {stats.strongest_candidate.current_title} • {stats.strongest_candidate.experience_years} years verified experience
                  </p>
                </div>
                <ScoreGauge score={stats.strongest_candidate.score} size="sm" showLabel={false} />
              </div>
            )}
          </div>

          {/* Quick Actions & System Info Card */}
          <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#94a3b8] pb-2 border-b border-[#1e2433]">
                Screening Protocol
              </h3>
              <ul className="text-xs text-[#94a3b8] space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00f2c3] flex-shrink-0 mt-0.5" />
                  <span>PyMuPDF multi-page text extraction and sanitization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00f2c3] flex-shrink-0 mt-0.5" />
                  <span>Semantic synonym mapping &amp; project evidence extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00f2c3] flex-shrink-0 mt-0.5" />
                  <span>7-factor weighted scoring with mandatory requirement penalties</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartScreening}
              className="w-full py-2.5 bg-[#181d2a] hover:bg-[#1f2536] text-[#f8fafc] border border-[#242b3d] hover:border-[#00f2c3]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Run Automated Screening</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#00f2c3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
