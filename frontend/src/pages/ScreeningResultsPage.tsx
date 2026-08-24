import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  GitCompare,
  Sparkles,
  ChevronRight,
  UploadCloud,
  Briefcase,
  Sliders,
  RotateCcw,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileText,
  Download,
  ShieldCheck,
  MessageSquare,
  Mail,
  CheckSquare
} from 'lucide-react';
import { MatchResult, ScreeningSession } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { api } from '../services/api';
import { InterviewKitModal } from '../components/InterviewKitModal';
import { OutreachModal } from '../components/OutreachModal';

interface ScreeningResultsPageProps {
  session: ScreeningSession | null;
  onSelectCandidate: (candidateId: number) => void;
  onCompareCandidates: (candidateIds: number[]) => void;
  onRefreshSession: () => void;
  onNavigateToUpload?: () => void;
  onNavigateToJob?: () => void;
  isBlindMode?: boolean;
}

interface CustomWeights {
  tech: number;
  exp: number;
  resp: number;
  proj: number;
  edu: number;
  pref: number;
  soft: number;
  expThreshold: number;
}

const DEFAULT_WEIGHTS: CustomWeights = {
  tech: 35,
  exp: 20,
  resp: 15,
  proj: 10,
  edu: 5,
  pref: 10,
  soft: 5,
  expThreshold: 2.0
};

export const ScreeningResultsPage: React.FC<ScreeningResultsPageProps> = ({
  session,
  onSelectCandidate,
  onCompareCandidates,
  onRefreshSession,
  onNavigateToUpload,
  onNavigateToJob,
  isBlindMode = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [filterRecommendation, setFilterRecommendation] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'experience'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Modals state
  const [kitModalCandidate, setKitModalCandidate] = useState<any>(null);
  const [outreachCandidate, setOutreachCandidate] = useState<any>(null);

  // Dynamic Parameter Tuner State
  const [isTunerOpen, setIsTunerOpen] = useState(false);
  const [weights, setWeights] = useState<CustomWeights>(DEFAULT_WEIGHTS);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null);

  const rawResults = session?.results || [];

  // Dynamic real-time scoring calculation
  const dynamicallyScoredResults = useMemo(() => {
    const totalWeight = weights.tech + weights.exp + weights.resp + weights.proj + weights.edu + weights.pref + weights.soft;
    const normFactor = totalWeight > 0 ? 100.0 / totalWeight : 1.0;

    return rawResults.map((cand) => {
      const origScores = cand.category_scores || {
        technical_skills: 30,
        experience: 18,
        responsibilities: 14,
        projects: 9,
        education: 5,
        preferred_skills: 8,
        soft_skills: 4,
        penalty_deduction: 0
      };

      const rawTechPct = (origScores.technical_skills / (origScores.technical_skills_max || 35)) * 100;
      const rawRespPct = (origScores.responsibilities / (origScores.responsibilities_max || 15)) * 100;
      const rawProjPct = (origScores.projects / (origScores.projects_max || 10)) * 100;
      const rawEduPct = (origScores.education / (origScores.education_max || 5)) * 100;
      const rawPrefPct = (origScores.preferred_skills / (origScores.preferred_skills_max || 10)) * 100;
      const rawSoftPct = (origScores.soft_skills / (origScores.soft_skills_max || 5)) * 100;

      const candExp = cand.candidate_experience_years || 0;
      let rawExpPct = 50;
      let expPenalty = 0;

      if (candExp >= weights.expThreshold) {
        rawExpPct = Math.min(100, 80 + (candExp - weights.expThreshold) * 5);
      } else if (candExp >= weights.expThreshold * 0.6) {
        rawExpPct = 65;
      } else {
        rawExpPct = Math.max(15, (candExp / Math.max(1, weights.expThreshold)) * 50);
        expPenalty = 12.0;
      }

      const newTechScore = (rawTechPct / 100) * (weights.tech * normFactor);
      const newExpScore = (rawExpPct / 100) * (weights.exp * normFactor);
      const newRespScore = (rawRespPct / 100) * (weights.resp * normFactor);
      const newProjScore = (rawProjPct / 100) * (weights.proj * normFactor);
      const newEduScore = (rawEduPct / 100) * (weights.edu * normFactor);
      const newPrefScore = (rawPrefPct / 100) * (weights.pref * normFactor);
      const newSoftScore = (rawSoftPct / 100) * (weights.soft * normFactor);

      const baseScore = newTechScore + newExpScore + newRespScore + newProjScore + newEduScore + newPrefScore + newSoftScore;
      const finalPenalty = (origScores.penalty_deduction || 0) > 0 ? (origScores.penalty_deduction || 0) : expPenalty;
      const dynamicOverall = Math.max(0, Math.min(100, Math.round((baseScore - finalPenalty) * 10) / 10));

      let dynamicTier = 'POOR MATCH';
      if (dynamicOverall >= 90) dynamicTier = 'EXCELLENT MATCH';
      else if (dynamicOverall >= 75) dynamicTier = 'STRONG MATCH';
      else if (dynamicOverall >= 60) dynamicTier = 'MODERATE MATCH';
      else if (dynamicOverall >= 40) dynamicTier = 'WEAK MATCH';

      return {
        ...cand,
        overall_score: dynamicOverall,
        recommendation: dynamicTier,
        category_scores: {
          ...origScores,
          technical_skills: Math.round(newTechScore * 10) / 10,
          technical_skills_max: Math.round(weights.tech * normFactor * 10) / 10,
          experience: Math.round(newExpScore * 10) / 10,
          experience_max: Math.round(weights.exp * normFactor * 10) / 10,
          responsibilities: Math.round(newRespScore * 10) / 10,
          responsibilities_max: Math.round(weights.resp * normFactor * 10) / 10,
          projects: Math.round(newProjScore * 10) / 10,
          projects_max: Math.round(weights.proj * normFactor * 10) / 10,
          education: Math.round(newEduScore * 10) / 10,
          education_max: Math.round(weights.edu * normFactor * 10) / 10,
          preferred_skills: Math.round(newPrefScore * 10) / 10,
          preferred_skills_max: Math.round(weights.pref * normFactor * 10) / 10,
          soft_skills: Math.round(newSoftScore * 10) / 10,
          soft_skills_max: Math.round(weights.soft * normFactor * 10) / 10,
          penalty_deduction: finalPenalty
        }
      };
    });
  }, [rawResults, weights]);

  // Distinct skills for chip filters
  const distinctSkills = useMemo(() => {
    const set = new Set<string>();
    rawResults.forEach((r) => r.matched_skills.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 8);
  }, [rawResults]);

  // Filtering & Sorting
  const filteredResults = useMemo(() => {
    return dynamicallyScoredResults
      .filter((res) => {
        const displayName = isBlindMode ? `Candidate #${res.candidate_id}` : res.candidate_name;
        const matchesQuery =
          displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          res.matched_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (res.candidate_title && res.candidate_title.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSkillFilter =
          !selectedSkillFilter || res.matched_skills.includes(selectedSkillFilter);

        const matchesScore = res.overall_score >= minScore;
        const matchesRec =
          filterRecommendation === 'ALL' || res.recommendation === filterRecommendation;

        return matchesQuery && matchesSkillFilter && matchesScore && matchesRec;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'score') {
          diff = a.overall_score - b.overall_score;
        } else if (sortBy === 'name') {
          diff = a.candidate_name.localeCompare(b.candidate_name);
        } else if (sortBy === 'experience') {
          diff = a.candidate_experience_years - b.candidate_experience_years;
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [dynamicallyScoredResults, searchQuery, selectedSkillFilter, minScore, filterRecommendation, sortBy, sortOrder, isBlindMode]);

  const toggleSelect = (candidateId: number) => {
    setSelectedIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResults.map((r) => r.candidate_id));
    }
  };

  const handleDecisionChange = async (candidateId: number, decision: any) => {
    setUpdatingId(candidateId);
    try {
      await api.setRecruiterDecision(candidateId, decision, undefined, session?.job_id || 1);
      onRefreshSession();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBatchDecision = async (decision: any) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((cid) =>
          api.setRecruiterDecision(cid, decision, undefined, session?.job_id || 1)
        )
      );
      onRefreshSession();
      setSelectedIds([]);
    } catch (err) {
      console.error('Batch decision failed:', err);
    }
  };

  const openInterviewKit = async (cand: any) => {
    try {
      const data = await api.generateInterviewKit(cand.candidate_id);
      setKitModalCandidate({
        name: isBlindMode ? `Candidate #${cand.candidate_id}` : cand.candidate_name,
        title: cand.candidate_title || 'Engineer',
        questions: data.questions
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompareClick = () => {
    if (selectedIds.length >= 2) {
      onCompareCandidates(selectedIds);
    }
  };

  if (!session || rawResults.length === 0) {
    return (
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-12 text-center space-y-4 max-w-xl mx-auto my-12 shadow-xl">
        <Award className="h-10 w-10 text-[#64748b] mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#f8fafc]">No screening results yet.</h3>
          <p className="text-xs text-[#94a3b8]">
            Upload candidate resumes and set a target Job Description to trigger real-time AI semantic screening.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onNavigateToUpload && (
            <button
              onClick={onNavigateToUpload}
              className="px-4 py-2 bg-[#00f2c3] text-[#08090d] font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Upload Resumes
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Role Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121520] p-6 rounded-2xl border border-[#1e2433] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-[#f8fafc]">{session.job_title}</h2>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181d2a] text-[#00f2c3] border border-[#00f2c3]/30">
              {rawResults.length} CANDIDATES SCREENED
            </span>
            {isBlindMode && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> BLIND EVALUATION
              </span>
            )}
          </div>
          <p className="text-xs text-[#94a3b8]">
            {session.company} • Min Exp Threshold: <span className="font-mono text-[#00f2c3] font-bold">{weights.expThreshold}+ yrs</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Export */}
          <a
            href={api.getExportCsvUrl(session.id)}
            download
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#181d2a] hover:bg-[#242b3d] text-[#f8fafc] border border-[#242b3d] transition-all flex items-center gap-1.5 shadow-sm"
            title="Download CSV report of screening leaderboard"
          >
            <Download className="h-3.5 w-3.5 text-[#00f2c3]" />
            <span>Export CSV</span>
          </a>

          {/* Parameter Tuner Toggle */}
          <button
            onClick={() => setIsTunerOpen(!isTunerOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isTunerOpen
                ? 'bg-[#00f2c3]/15 text-[#00f2c3] border-[#00f2c3]/40'
                : 'bg-[#181d2a] text-[#94a3b8] hover:text-[#f8fafc] border-[#242b3d]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Tuner</span>
            {isTunerOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {selectedIds.length >= 2 && (
            <button
              onClick={handleCompareClick}
              className="px-4 py-2 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <GitCompare className="h-4 w-4" />
              <span>Compare ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Operations Bar (When items are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0f131f] p-3.5 px-5 rounded-2xl border border-[#00f2c3]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono font-bold text-[#00f2c3]">{selectedIds.length} candidate(s) selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[#94a3b8] hover:text-[#f8fafc] text-[11px] underline"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#64748b]">Batch Action:</span>
            <button
              onClick={() => handleBatchDecision('SHORTLISTED')}
              className="px-3 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80 text-xs font-bold rounded-lg transition-colors"
            >
              ✓ Shortlist All
            </button>
            <button
              onClick={() => handleBatchDecision('REVIEW')}
              className="px-3 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/80 text-xs font-bold rounded-lg transition-colors"
            >
              ⏱ Review All
            </button>
            <button
              onClick={() => handleBatchDecision('REJECTED')}
              className="px-3 py-1 bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80 text-xs font-bold rounded-lg transition-colors"
            >
              ✗ Reject All
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Tuner Drawer */}
      {isTunerOpen && (
        <div className="bg-[#0d0f17] p-6 rounded-2xl border border-[#242b3d] shadow-xl space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2433]">
            <span className="text-xs font-mono font-bold tracking-widest text-[#00f2c3] uppercase flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span>DYNAMIC RE-RANKING PARAMETERS</span>
            </span>
            <button
              onClick={() => setWeights(DEFAULT_WEIGHTS)}
              className="inline-flex items-center gap-1 text-[11px] text-[#64748b] hover:text-[#00f2c3] font-semibold"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#121520] p-3 rounded-xl border border-[#1e2433] space-y-1.5">
              <div className="flex justify-between font-bold text-[#94a3b8]">
                <span>Technical Skills:</span>
                <span className="text-[#00f2c3] font-mono">{weights.tech}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={weights.tech}
                onChange={(e) => setWeights({ ...weights, tech: parseInt(e.target.value) })}
                className="w-full accent-[#00f2c3]"
              />
            </div>

            <div className="bg-[#121520] p-3 rounded-xl border border-[#1e2433] space-y-1.5">
              <div className="flex justify-between font-bold text-[#94a3b8]">
                <span>Experience Weight:</span>
                <span className="text-[#00f2c3] font-mono">{weights.exp}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={weights.exp}
                onChange={(e) => setWeights({ ...weights, exp: parseInt(e.target.value) })}
                className="w-full accent-[#00f2c3]"
              />
            </div>

            <div className="bg-[#121520] p-3 rounded-xl border border-[#1e2433] space-y-1.5">
              <div className="flex justify-between font-bold text-[#94a3b8]">
                <span>Min Experience Threshold:</span>
                <span className="text-emerald-400 font-mono">{weights.expThreshold} yrs</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={weights.expThreshold}
                onChange={(e) => setWeights({ ...weights, expThreshold: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="bg-[#121520] p-3 rounded-xl border border-[#1e2433] space-y-1.5">
              <div className="flex justify-between font-bold text-[#94a3b8]">
                <span>Responsibilities:</span>
                <span className="text-[#00f2c3] font-mono">{weights.resp}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={weights.resp}
                onChange={(e) => setWeights({ ...weights, resp: parseInt(e.target.value) })}
                className="w-full accent-[#00f2c3]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="bg-[#121520] p-4 rounded-2xl border border-[#1e2433] space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBlindMode ? "Search candidate ID or skill..." : "Search candidate or skill..."}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
            />
          </div>

          {/* Filters & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
            {/* Recommendation Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b] font-bold">Tier:</span>
              <select
                value={filterRecommendation}
                onChange={(e) => setFilterRecommendation(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#242b3d] bg-[#0d0f17] text-xs font-semibold text-[#f8fafc] focus:outline-none focus:border-[#00f2c3]"
              >
                <option value="ALL">All Tiers</option>
                <option value="EXCELLENT MATCH">Excellent (90-100)</option>
                <option value="STRONG MATCH">Strong (75-89)</option>
                <option value="MODERATE MATCH">Moderate (60-74)</option>
                <option value="WEAK MATCH">Weak (40-59)</option>
                <option value="POOR MATCH">Poor (0-39)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b] font-bold">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-') as ['score' | 'name' | 'experience', 'asc' | 'desc'];
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#242b3d] bg-[#0d0f17] text-xs font-semibold text-[#f8fafc] focus:outline-none focus:border-[#00f2c3]"
              >
                <option value="score-desc">Match Score (High → Low)</option>
                <option value="score-asc">Match Score (Low → High)</option>
                <option value="experience-desc">Experience (High → Low)</option>
                <option value="name-asc">Candidate Name (A → Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skill Filter Chips */}
        {distinctSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#1e2433] text-xs">
            <span className="text-[#64748b] font-bold text-[11px]">Skill Tag:</span>
            {distinctSkills.map((skill) => {
              const isActive = selectedSkillFilter === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkillFilter(isActive ? null : skill)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all border ${
                    isActive
                      ? 'bg-[#00f2c3] text-[#08090d] border-[#00f2c3]'
                      : 'bg-[#0d0f17] text-[#94a3b8] hover:text-[#f8fafc] border-[#242b3d]'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
            {selectedSkillFilter && (
              <button
                onClick={() => setSelectedSkillFilter(null)}
                className="text-[11px] font-bold text-rose-400 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* INTELLIGENT CANDIDATE ROWS */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="bg-[#121520] p-10 rounded-2xl border border-[#1e2433] text-center text-[#94a3b8] text-xs">
            No candidates match the selected filter criteria.
          </div>
        ) : (
          filteredResults.map((cand, idx) => {
            const isSelected = selectedIds.includes(cand.candidate_id);
            const rankStr = String(idx + 1).padStart(2, '0');
            const candidateDisplayName = isBlindMode
              ? `Candidate #${String(cand.candidate_id).padStart(2, '0')}`
              : cand.candidate_name;

            return (
              <div
                key={cand.candidate_id}
                className={`bg-[#121520] p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#00f2c3] bg-[#151926]'
                    : 'border-[#1e2433] hover:border-[#2c354a] hover:bg-[#151926]'
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg`}
              >
                {/* Left: Rank, Select & Profile Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(cand.candidate_id)}
                    className="h-4 w-4 rounded border-[#242b3d] bg-[#0d0f17] text-[#00f2c3] focus:ring-[#00f2c3] cursor-pointer"
                  />

                  {/* Rank Typography */}
                  <span className="font-mono text-base font-extrabold text-[#64748b]">
                    {rankStr}
                  </span>

                  {/* Candidate Identity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onSelectCandidate(cand.candidate_id)}
                        className="font-bold text-sm text-[#f8fafc] hover:text-[#00f2c3] transition-colors text-left"
                      >
                        {candidateDisplayName}
                      </button>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#0d0f17] text-[#94a3b8] border border-[#1e2433]">
                        {cand.candidate_title || 'Candidate'}
                      </span>
                    </div>

                    {/* Matched Skill Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#94a3b8]">
                      <span className="text-[11px] font-medium text-[#64748b]">
                        {cand.candidate_experience_years.toFixed(1)} years exp •
                      </span>
                      {cand.matched_skills.slice(0, 4).map((s, sIdx) => (
                        <span key={sIdx} className="text-[#00f2c3] text-[11px] font-mono">
                          {s}{sIdx < Math.min(3, cand.matched_skills.length - 1) ? ' ·' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center / Right: Score Gauge, Decision & Quick Action Icons */}
                <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                  {/* Circular Score Gauge */}
                  <ScoreGauge score={cand.overall_score} size="sm" showLabel={true} />

                  {/* Quick Action Tools */}
                  <div className="flex items-center gap-1 bg-[#0d0f17] p-1 rounded-xl border border-[#1e2433]">
                    <button
                      onClick={() => openInterviewKit(cand)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#00f2c3] rounded-lg transition-colors"
                      title="Generate Tailored Interview Kit"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setOutreachCandidate(cand)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#00f2c3] rounded-lg transition-colors"
                      title="Draft Outreach Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Recruiter Decision Selector */}
                  <select
                    value={cand.recruiter_decision || 'UNDECIDED'}
                    disabled={updatingId === cand.candidate_id}
                    onChange={(e) => handleDecisionChange(cand.candidate_id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                      cand.recruiter_decision === 'SHORTLISTED'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80'
                        : cand.recruiter_decision === 'REJECTED'
                        ? 'bg-rose-950/50 text-rose-300 border-rose-800/80'
                        : cand.recruiter_decision === 'REVIEW'
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/80'
                        : 'bg-[#0d0f17] text-[#94a3b8] border-[#242b3d]'
                    }`}
                  >
                    <option value="SHORTLISTED">✓ Shortlist</option>
                    <option value="REVIEW">⏱ Review</option>
                    <option value="REJECTED">✗ Reject</option>
                    <option value="UNDECIDED">— Undecided</option>
                  </select>

                  {/* View Candidate Button */}
                  <button
                    onClick={() => onSelectCandidate(cand.candidate_id)}
                    className="px-3.5 py-1.5 bg-[#181d2a] hover:bg-[#00f2c3] hover:text-[#08090d] text-[#f8fafc] text-xs font-bold rounded-xl border border-[#242b3d] hover:border-[#00f2c3] transition-all flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {kitModalCandidate && (
        <InterviewKitModal
          isOpen={!!kitModalCandidate}
          onClose={() => setKitModalCandidate(null)}
          candidateName={kitModalCandidate.name}
          candidateTitle={kitModalCandidate.title}
          questions={kitModalCandidate.questions}
        />
      )}

      {outreachCandidate && (
        <OutreachModal
          isOpen={!!outreachCandidate}
          onClose={() => setOutreachCandidate(null)}
          candidateId={outreachCandidate.candidate_id}
          candidateName={isBlindMode ? `Candidate #${outreachCandidate.candidate_id}` : outreachCandidate.candidate_name}
          jobTitle={session.job_title}
          company={session.company}
        />
      )}
    </div>
  );
};
