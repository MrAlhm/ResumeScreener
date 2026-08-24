import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { api } from '../services/api';

const SAMPLE_RESUME = `Aarav Sharma
Lead Machine Learning Engineer | Bengaluru, India
aarav.sharma@example.com | +91 98765 43210

Summary:
Senior ML Engineer with 5.0 years of experience designing, training, and deploying deep learning systems in PyTorch and TensorFlow. Built real-time inference APIs in FastAPI and managed containerized AWS pipelines.

Technical Skills:
Python, SQL, PyTorch, TensorFlow, Scikit-learn, FastAPI, Docker, Kubernetes, AWS, PostgreSQL, Git, MLOps

Experience:
Lead Machine Learning Engineer — NexusAI Technologies (2022 - Present)
- Architected transformer-based recommendation models serving 10M+ daily inference queries.
- Built low-latency REST APIs in FastAPI with Redis caching and PostgreSQL feature store.

Education:
B.Tech & M.Tech in Computer Science — IIT Bombay (2017 - 2022)`;

const SAMPLE_JD = `Machine Learning Engineer
NexusAI Technologies | Bengaluru, India
Experience Required: 2+ years
Compensation: ₹24 - ₹38 LPA

Responsibilities:
- Build and fine-tune PyTorch deep learning models for production inference.
- Serve APIs via FastAPI with Docker containers.

Mandatory Requirements:
- 2+ years ML experience, Python, SQL, PyTorch, Scikit-learn.
Preferred: Docker, AWS, MLOps.`;

export const MatchLabPage: React.FC = () => {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [jobText, setJobText] = useState(SAMPLE_JD);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.liveSimulate(resumeText, jobText);
      setResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e2433]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">Interactive Match Lab</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30 flex items-center gap-1">
              <FlaskConical className="h-3 w-3" /> LIVE SIMULATOR
            </span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Test any candidate resume text against any job criteria with instant semantic evaluation and sub-score decomposition.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-5 py-2.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Zap className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Evaluating Fit...' : 'Run Instant Simulation'}</span>
        </button>
      </div>

      {/* Editor Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Candidate Resume */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">
              Candidate Resume Text
            </label>
            <button
              onClick={() => setResumeText(SAMPLE_RESUME)}
              className="text-[11px] text-[#64748b] hover:text-[#00f2c3] font-mono"
            >
              Reset Sample
            </button>
          </div>
          <textarea
            rows={12}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full p-3 text-xs font-mono text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3] leading-relaxed"
            placeholder="Paste any resume text here..."
          />
        </div>

        {/* Right: Job Description */}
        <div className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">
              Target Job Criteria
            </label>
            <button
              onClick={() => setJobText(SAMPLE_JD)}
              className="text-[11px] text-[#64748b] hover:text-[#00f2c3] font-mono"
            >
              Reset Sample
            </button>
          </div>
          <textarea
            rows={12}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className="w-full p-3 text-xs font-mono text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3] leading-relaxed"
            placeholder="Paste target job requirements here..."
          />
        </div>
      </div>

      {/* Simulation Results Card */}
      {result && (
        <div className="bg-[#121520] p-6 rounded-2xl border border-[#242b3d] shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00f2c3] uppercase">
                SIMULATION RESULT
              </span>
              <h3 className="text-lg font-extrabold text-[#f8fafc]">
                Candidate: {result.candidate_name || 'Evaluated Profile'}
              </h3>
              <p className="text-xs text-[#94a3b8] italic">"{result.justification}"</p>
            </div>

            <ScoreGauge score={result.overall_score} size="md" showLabel={true} />
          </div>

          {/* Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                ✓ Matched Skills ({result.matched_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(result.matched_skills || []).map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-2">
              <p className="font-mono font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                × Missing Requirements ({result.missing_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(result.missing_skills && result.missing_skills.length > 0 ? result.missing_skills : ['None']).map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Category Scores */}
          {result.category_scores && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">TECH</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.technical_skills}/35</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">EXP</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.experience}/20</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">RESP</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.responsibilities}/15</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">PROJ</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.projects}/10</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">EDU</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.education}/5</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">PREF</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.preferred_skills}/10</p>
              </div>
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                <p className="text-[10px] font-mono text-[#64748b]">SOFT</p>
                <p className="font-bold text-[#f8fafc] font-mono mt-1">{result.category_scores.soft_skills}/5</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
