import React, { useState } from 'react';
import {
  FileCheck,
  UploadCloud,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { api } from '../services/api';

const SAMPLE_RESUME = `RAHUL VERMA
Senior Backend & Machine Learning Engineer | Bengaluru, India
rahul.verma@example.com | +91 98765 43210 | linkedin.com/in/rahulverma | github.com/rahulverma

SUMMARY
High-performance backend & AI engineer with 4+ years of experience designing scalable microservices in Python and deploying deep learning inference pipelines with PyTorch, FastAPI, Docker, and PostgreSQL. Reduced API latency by 45% using Redis caching and asynchronous workers.

SKILLS
• Languages: Python, SQL, TypeScript, Bash
• Frameworks & Tools: FastAPI, PyTorch, Scikit-learn, Docker, Kubernetes, Git
• Databases & Cloud: PostgreSQL, Redis, AWS (S3, EC2, Lambda)

EXPERIENCE
Senior Backend Engineer — ZeptoLabs (2022 – Present)
• Built low-latency REST APIs in FastAPI processing 12,000+ requests per minute with 99.9% uptime.
• Deployed fine-tuned PyTorch vision models on AWS GPU instances with Docker containerization.
• Automated database migrations and queries in PostgreSQL, optimizing query latency by 35%.

EDUCATION
B.Tech in Computer Science & Engineering — VIT-AP University (2018 – 2022) | GPA: 8.9/10`;

const SAMPLE_JD = `Role: Senior Backend & AI Engineer
Company: Razorpay
Experience: 3+ years

Required Skills:
• Python, FastAPI, PyTorch, SQL, PostgreSQL, Docker, AWS
• Strong understanding of microservices architecture and high-throughput API design

Preferred Skills:
• Kubernetes, Redis, MLOps, CI/CD pipelines
• Bachelor's degree in Computer Science or related engineering field.`;

export const ATSCheckerPage: React.FC = () => {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [jobText, setJobText] = useState(SAMPLE_JD);
  const [targetRole, setTargetRole] = useState('Senior Backend & AI Engineer');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);

    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      setResumeText(text);
    } else {
      // For PDF or others, extract via backend upload or set text placeholder
      try {
        const uploaded = await api.uploadResumes([file]);
        if (uploaded.length > 0 && uploaded[0].structured_profile) {
          const prof = uploaded[0].structured_profile;
          setResumeText(
            `Name: ${prof.candidate?.name || 'Candidate'}\n` +
            `Email: ${prof.candidate?.email || ''}\n` +
            `Skills: ${(prof.skills?.programming_languages || []).concat(prof.skills?.frameworks || []).join(', ')}\n` +
            `Experience: ${prof.total_experience_years || 2} years\n` +
            `Summary: ${prof.candidate?.summary || ''}`
          );
        }
      } catch (err: any) {
        console.warn('PDF direct extraction fallback:', err.message);
      }
    }
  };

  const handleRunAtsAudit = async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsAuditing(true);
    try {
      const result = await api.checkAtsScore({
        resume_text: resumeText,
        job_text: jobText,
        target_role: targetRole
      });
      setAuditResult(result);
    } catch (err: any) {
      alert(err.message || 'ATS Check failed.');
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const copyTips = () => {
    if (!auditResult?.actionable_tips) return;
    navigator.clipboard.writeText(auditResult.actionable_tips.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e2433]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">ATS Resume Compatibility Checker</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30">
              PRO TOOL
            </span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Audit your resume/CV against any target job description for ATS parseability, keyword density, and bot pass rates.
          </p>
        </div>

        <button
          onClick={handleRunAtsAudit}
          disabled={isAuditing || !resumeText || !jobText}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] shadow-sm transition-all disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <div className="h-4 w-4 border-2 border-[#08090d] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing ATS Rules...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 fill-current" />
              <span>Run Deep ATS Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Two-Column Editor: Resume vs Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Resume/CV Input */}
        <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#00f2c3]" />
              <h3 className="text-xs font-mono font-bold text-[#f8fafc] uppercase tracking-wider">
                1. Candidate Resume / CV
              </h3>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-[#181d2a] hover:bg-[#22293a] text-[#94a3b8] hover:text-[#f8fafc] text-[11px] font-semibold rounded-lg border border-[#242b3d] transition-colors">
              <UploadCloud className="h-3.5 w-3.5 text-[#00f2c3]" />
              <span>{uploadFileName || 'Upload PDF/TXT'}</span>
              <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw resume or CV text here..."
            className="w-full h-80 bg-[#08090d] border border-[#1e2433] focus:border-[#00f2c3] rounded-xl p-3.5 text-xs text-[#f8fafc] font-mono leading-relaxed resize-none outline-none focus:ring-1 focus:ring-[#00f2c3]"
          />

          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
            <span>Supports standard ATS sections</span>
          </div>
        </div>

        {/* Right: Job Description Input */}
        <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#38bdf8]" />
              <h3 className="text-xs font-mono font-bold text-[#f8fafc] uppercase tracking-wider">
                2. Target Job Description
              </h3>
            </div>

            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role Title"
              className="bg-[#08090d] border border-[#1e2433] px-2.5 py-1 text-[11px] font-mono text-[#f8fafc] rounded-lg outline-none w-48 text-right"
            />
          </div>

          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste target Job Description requirements here..."
            className="w-full h-80 bg-[#08090d] border border-[#1e2433] focus:border-[#38bdf8] rounded-xl p-3.5 text-xs text-[#f8fafc] font-mono leading-relaxed resize-none outline-none focus:ring-1 focus:ring-[#38bdf8]"
          />

          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>{jobText.split(/\s+/).filter(Boolean).length} words</span>
            <span>Analyzes required &amp; preferred criteria</span>
          </div>
        </div>
      </div>

      {/* Audit Results Section */}
      {auditResult && (
        <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
          {/* Top Score Summary Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1e2433]">
            <div className="flex items-center gap-6">
              <ScoreGauge score={auditResult.ats_score} size="lg" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#f8fafc]">
                    ATS Compatibility: {auditResult.ats_score}%
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30">
                    GRADE: {auditResult.grade}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8]">
                  Targeted against: <span className="text-[#f8fafc] font-semibold">{auditResult.target_role}</span>
                </p>
                <p className="text-[11px] text-[#64748b]">
                  Keyword Alignment: {auditResult.keyword_match_rate}% • Formatting Audit: {auditResult.formatting_score}/100
                </p>
              </div>
            </div>

            <button
              onClick={copyTips}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#181d2a] hover:bg-[#242b3d] text-[#00f2c3] border border-[#00f2c3]/30 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Tips!' : 'Copy Improvement Checklist'}</span>
            </button>
          </div>

          {/* 3-Column Detail Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Sections Audit */}
            <div className="bg-[#0d0f17] rounded-xl border border-[#1e2433] p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00f2c3]" />
                <span>Section Structure Audit</span>
              </h4>

              <div className="space-y-2 pt-1">
                {Object.entries(auditResult.sections_audit || {}).map(([key, item]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-[#121520] border border-[#1c2230] text-xs">
                    <span className="text-[#e2e8f0] text-[11px]">{item.label}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'PASS'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                          : item.status === 'WARN'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-800'
                          : 'bg-rose-950/50 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Matched Keywords */}
            <div className="bg-[#0d0f17] rounded-xl border border-[#1e2433] p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Matched Keywords ({auditResult.matched_keywords?.length || 0})</span>
              </h4>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {auditResult.matched_keywords?.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60"
                  >
                    ✓ {kw}
                  </span>
                ))}
                {(!auditResult.matched_keywords || auditResult.matched_keywords.length === 0) && (
                  <p className="text-xs text-[#64748b]">No exact keywords matched.</p>
                )}
              </div>
            </div>

            {/* 3. Missing Keywords */}
            <div className="bg-[#0d0f17] rounded-xl border border-[#1e2433] p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Missing Critical Keywords ({auditResult.missing_keywords?.length || 0})</span>
              </h4>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {auditResult.missing_keywords?.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/60"
                  >
                    × {kw}
                  </span>
                ))}
                {(!auditResult.missing_keywords || auditResult.missing_keywords.length === 0) && (
                  <p className="text-xs text-emerald-400 font-semibold">Zero critical keyword gaps!</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Tips */}
          <div className="p-5 rounded-xl bg-[#0d0f17] border border-[#242b3d] space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#00f2c3] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00f2c3]" />
              <span>Actionable ATS Optimization Recommendations</span>
            </h4>

            <ul className="space-y-2 text-xs text-[#e2e8f0]">
              {auditResult.actionable_tips?.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <ArrowRight className="h-3.5 w-3.5 text-[#00f2c3] flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
