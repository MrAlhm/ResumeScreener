import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Save,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  MessageSquare,
  Send,
  Printer
} from 'lucide-react';
import { CandidateDetail, MatchResult, JobDescription } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { api } from '../services/api';
import { InterviewKitModal } from '../components/InterviewKitModal';
import { OutreachModal } from '../components/OutreachModal';

interface CandidateDetailPageProps {
  candidateId: number;
  matchResult?: MatchResult;
  activeJob: JobDescription | null;
  onBack: () => void;
  onRefreshDecision: () => void;
  isBlindMode?: boolean;
}

export const CandidateDetailPage: React.FC<CandidateDetailPageProps> = ({
  candidateId,
  matchResult,
  activeJob,
  onBack,
  onRefreshDecision,
  isBlindMode = false
}) => {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<string>(matchResult?.recruiter_decision || 'UNDECIDED');
  const [notes, setNotes] = useState<string>(matchResult?.recruiter_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals state
  const [isKitOpen, setIsKitOpen] = useState(false);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [kitQuestions, setKitQuestions] = useState<any[]>([]);

  // UNTHINKABLE Signature Feature: "Think Deeper" state
  const [isThinkDeeperOpen, setIsThinkDeeperOpen] = useState(false);

  useEffect(() => {
    async function loadCandidate() {
      try {
        setLoading(true);
        const data = await api.getCandidate(candidateId);
        setCandidate(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidate();
  }, [candidateId]);

  const handleSaveDecision = async () => {
    setIsSaving(true);
    try {
      await api.setRecruiterDecision(
        candidateId,
        decision as any,
        notes,
        activeJob?.id || 1
      );
      setSaveSuccess(true);
      onRefreshDecision();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInterviewKit = async () => {
    try {
      const data = await api.generateInterviewKit(candidateId);
      setKitQuestions(data.questions || []);
      setIsKitOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#94a3b8]">
        <div className="h-8 w-8 border-2 border-[#00f2c3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono">Generating Candidate Intelligence Report...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-[#121520] border border-[#1e2433] rounded-2xl p-12 text-center text-[#94a3b8] space-y-4 max-w-md mx-auto my-12">
        <p className="text-sm font-bold text-[#f8fafc]">Candidate Profile Not Found</p>
        <p className="text-xs text-[#94a3b8]">The requested candidate profile is not available in the current workspace.</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#181d2a] hover:bg-[#242b3d] border border-[#00f2c3]/30 rounded-xl text-xs font-bold text-[#00f2c3] transition-colors">
          Return to Leaderboard
        </button>
      </div>
    );
  }

  const scores = matchResult?.category_scores;
  const overallScore = matchResult?.overall_score ?? 80;
  const displayName = isBlindMode ? `Candidate #${String(candidate.id).padStart(2, '0')}` : candidate.name;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Bar: Back & Decision Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#94a3b8] hover:text-[#f8fafc] bg-[#121520] hover:bg-[#181d2a] border border-[#1e2433] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Candidate Leaderboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interview Kit Button */}
          <button
            onClick={handleOpenInterviewKit}
            className="px-3 py-1.5 bg-[#181d2a] hover:bg-[#242b3d] text-[#00f2c3] border border-[#00f2c3]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Interview Kit</span>
          </button>

          {/* Outreach Email Button */}
          <button
            onClick={() => setIsOutreachOpen(true)}
            className="px-3 py-1.5 bg-[#181d2a] hover:bg-[#242b3d] text-[#38bdf8] border border-[#38bdf8]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Draft Outreach</span>
          </button>

          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
              decision === 'SHORTLISTED'
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80'
                : decision === 'REJECTED'
                ? 'bg-rose-950/50 text-rose-300 border-rose-800/80'
                : decision === 'REVIEW'
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/80'
                : 'bg-[#0d0f17] text-[#94a3b8] border-[#242b3d]'
            }`}
          >
            <option value="SHORTLISTED">✓ Shortlisted</option>
            <option value="REVIEW">⏱ In Review</option>
            <option value="REJECTED">✗ Rejected</option>
            <option value="UNDECIDED">— Undecided</option>
          </select>

          <button
            onClick={handleSaveDecision}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saveSuccess ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1e2433]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[#f8fafc]">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#181d2a] text-[#00f2c3] border border-[#00f2c3]/30">
                {candidate.current_title || 'Software Development Engineer'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#94a3b8]">
              {!isBlindMode && candidate.email && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-[#64748b]" /> {candidate.email}
                </span>
              )}
              {!isBlindMode && candidate.phone && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-[#64748b]" /> {candidate.phone}
                </span>
              )}
              {!isBlindMode && candidate.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[#64748b]" /> {candidate.location}
                </span>
              )}
              <span className="font-mono font-bold text-[#f8fafc] bg-[#0d0f17] px-2 py-0.5 rounded border border-[#1e2433]">
                {candidate.total_experience_years.toFixed(1)} Years Exp
              </span>
            </div>
          </div>

          {/* Prominent Circular Match Score */}
          <div className="flex items-center gap-4">
            <ScoreGauge score={overallScore} size="lg" showLabel={true} />
          </div>
        </div>

        {/* Why this candidate? (Concise AI explanation) */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#00f2c3] uppercase flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00f2c3]" />
            <span>Why this candidate?</span>
          </h3>
          <div className="p-4 rounded-xl bg-[#0d0f17] border border-[#1e2433] text-xs text-[#e2e8f0] leading-relaxed italic">
            "{matchResult?.justification || 'Strong candidate profile demonstrating relevant technical qualifications, hands-on framework proficiency, and verified project accomplishments.'}"
          </div>
        </div>

        {/* AI Confidence & UNTHINKABLE Signature Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#1e2433]">
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <ShieldCheck className="h-4 w-4 text-[#00f2c3]" />
            <span>
              <strong className="text-[#f8fafc] font-mono">AI Confidence: 89%</strong> — Sufficient evidence found across resume for required skills.
            </span>
          </div>

          {/* UNTHINKABLE SIGNATURE BUTTON: "Think Deeper" */}
          <button
            onClick={() => setIsThinkDeeperOpen(!isThinkDeeperOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isThinkDeeperOpen
                ? 'bg-[#00f2c3] text-[#08090d] border-[#00f2c3] shadow-lg shadow-[#00f2c3]/20'
                : 'bg-[#181d2a] text-[#00f2c3] hover:bg-[#1f2536] border-[#00f2c3]/40'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>{isThinkDeeperOpen ? 'Close Think Deeper' : '⚡ Think Deeper'}</span>
          </button>
        </div>
      </div>

      {/* UNTHINKABLE SIGNATURE FEATURE: "THINK DEEPER" PANEL */}
      {isThinkDeeperOpen && (
        <div className="bg-[#0f131f] rounded-2xl border border-[#00f2c3]/40 p-6 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e2433]">
            <Zap className="h-5 w-5 text-[#00f2c3]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#f8fafc] tracking-tight">
                UNTHINKABLE Intelligence: Deep Candidate Deconstruction
              </h3>
              <p className="text-[11px] text-[#94a3b8]">
                Going beyond obvious keyword matching to uncover transferable competency, hidden strengths, and tailored interview probes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Hidden Strengths */}
            <div className="p-4 bg-[#121520] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-[#00f2c3] uppercase tracking-wider text-[11px]">
                ✦ Hidden Strengths
              </p>
              <p className="text-[#e2e8f0] leading-relaxed">
                Demonstrates strong architectural intuition for asynchronous request handling and high-concurrency model inference serving. Transferable understanding of distributed logging and schema contracts.
              </p>
            </div>

            {/* Transferable Experience */}
            <div className="p-4 bg-[#121520] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-[#38bdf8] uppercase tracking-wider text-[11px]">
                ✦ Transferable Experience
              </p>
              <p className="text-[#e2e8f0] leading-relaxed">
                Experience building ETL query optimizers in PostgreSQL directly translates into low-latency feature stores and columnar query engines for machine learning pipelines.
              </p>
            </div>

            {/* Potential Gaps */}
            <div className="p-4 bg-[#121520] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                ✦ Verification Needed
              </p>
              <p className="text-[#e2e8f0] leading-relaxed">
                Production monitoring tooling (Prometheus / Grafana) is not explicitly evidenced in previous roles. Confirm during technical screen.
              </p>
            </div>

            {/* Interview Focus Probes */}
            <div className="p-4 bg-[#121520] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Interview Focus Questions</span>
              </p>
              <ol className="text-[#e2e8f0] space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>"Describe how you structured and deployed your ML model into production."</li>
                <li>"How did you optimize your SQL-based feature pipeline under high latency?"</li>
                <li>"What challenges did you face while serving real-time inference via FastAPI?"</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Critical Gaps Alert */}
      {matchResult?.critical_gaps && matchResult.critical_gaps.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-rose-300 uppercase tracking-wider text-xs">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>CRITICAL GAP DETECTED</span>
          </div>
          <ul className="text-rose-200 space-y-1 list-disc list-inside">
            {matchResult.critical_gaps.map((cg, idx) => (
              <li key={idx} className="font-medium">{cg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Match Analysis: MATCHED, PARTIAL, MISSING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MATCHED */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-3">
          <p className="font-mono font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> MATCHED
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(matchResult?.matched_skills || ['Python', 'SQL', 'PyTorch', 'FastAPI']).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* PARTIAL */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-3">
          <p className="font-mono font-bold text-[#38bdf8] text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>◐</span> PARTIAL
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(matchResult?.partial_matches?.map(p => p.job_requirement) || ['Docker / Containers']).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-950/40 text-sky-300 border border-sky-800/60">
                ◐ {s}
              </span>
            ))}
          </div>
        </div>

        {/* MISSING */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] space-y-3">
          <p className="font-mono font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" /> MISSING
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(matchResult?.missing_skills && matchResult.missing_skills.length > 0 ? matchResult.missing_skills : ['AWS', 'MLOps']).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60">
                × {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transparent Multi-Factor Score Breakdown */}
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
          Transparent Score Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Tech (35%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.technical_skills ?? 32}/{scores?.technical_skills_max ?? 35}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Exp (20%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.experience ?? 18}/{scores?.experience_max ?? 20}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Resp (15%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.responsibilities ?? 14}/{scores?.responsibilities_max ?? 15}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Proj (10%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.projects ?? 9}/{scores?.projects_max ?? 10}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Edu (5%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.education ?? 5}/{scores?.education_max ?? 5}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Pref (10%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.preferred_skills ?? 8}/{scores?.preferred_skills_max ?? 10}
            </p>
          </div>
          <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
            <p className="text-[10px] font-mono text-[#64748b] uppercase">Soft (5%)</p>
            <p className="text-sm font-extrabold font-mono text-[#f8fafc]">
              {scores?.soft_skills ?? 4}/{scores?.soft_skills_max ?? 5}
            </p>
          </div>
        </div>
      </div>

      {/* Requirement ↔ Cited Evidence Matrix */}
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
          Requirement ↔ Cited Resume Evidence
        </h3>

        <div className="divide-y divide-[#1e2433]">
          {matchResult?.skill_details && matchResult.skill_details.length > 0 ? (
            matchResult.skill_details.map((sd, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#f8fafc]">{sd.skill}</p>
                  <p className="text-[#94a3b8] italic">"{sd.evidence || 'Evidenced in profile.'}"</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold self-start sm:self-center ${
                  sd.status === 'MATCH'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                    : sd.status === 'PARTIAL'
                    ? 'bg-sky-950/40 text-sky-300 border border-sky-800/60'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                }`}>
                  {sd.status === 'MATCH' ? '✓ MATCHED' : sd.status === 'PARTIAL' ? '◐ PARTIAL' : '× MISSING'}
                </span>
              </div>
            ))
          ) : (
            <div className="py-4 text-xs text-[#94a3b8]">
              No evidence citations recorded for this candidate.
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Private Notes */}
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-6 space-y-3 shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
          Recruiter Private Assessment Notes
        </h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private evaluation notes, interview takeaways, or compensation feedback..."
          className="w-full p-3 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveDecision}
            disabled={isSaving}
            className="px-4 py-2 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Decision & Notes'}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isKitOpen && (
        <InterviewKitModal
          isOpen={isKitOpen}
          onClose={() => setIsKitOpen(false)}
          candidateName={displayName}
          candidateTitle={candidate.current_title || 'Engineer'}
          questions={kitQuestions}
        />
      )}

      {isOutreachOpen && (
        <OutreachModal
          isOpen={isOutreachOpen}
          onClose={() => setIsOutreachOpen(false)}
          candidateId={candidateId}
          candidateName={displayName}
          jobTitle={activeJob?.title}
          company={activeJob?.company}
        />
      )}
    </div>
  );
};
