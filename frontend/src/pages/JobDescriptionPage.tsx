import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Code2,
  FileCheck2,
  MapPin,
  IndianRupee
} from 'lucide-react';
import { api } from '../services/api';
import { JobDescription } from '../types';

interface JobDescriptionPageProps {
  jobs: JobDescription[];
  activeJob: JobDescription | null;
  onSelectJob: (job: JobDescription) => void;
  onJobCreated: (job: JobDescription) => void;
  onProceedToScreening: () => void;
}

const TEMPLATES = [
  {
    title: 'Machine Learning Engineer (LLMs & PyTorch)',
    company: 'NexusAI Labs India',
    experience_required: 2.0,
    location: 'Bengaluru, Karnataka (Indiranagar / Hybrid)',
    salary_range: '₹24 - ₹38 LPA',
    raw_text: `Machine Learning Engineer (LLMs & PyTorch)
Company: NexusAI Labs India
Location: Bengaluru, Karnataka (Indiranagar / Hybrid)
Experience: 2+ years of production ML experience
Compensation: ₹24 - ₹38 LPA + Equity

Responsibilities:
- Design, train, fine-tune, and deploy deep learning architectures using PyTorch and HuggingFace Transformers.
- Build high-throughput low-latency REST APIs in FastAPI to serve model inference in production.
- Work with Bangalore data engineering squads to optimize SQL pipelines, feature stores, and vector databases.

Required Qualifications (Mandatory):
- 2+ years of hands-on experience in Machine Learning or Data Science in product companies.
- Strong proficiency in Python and SQL.
- Deep expertise in PyTorch or TensorFlow, Scikit-learn, and Deep Learning algorithms.
- B.Tech / M.Tech in CS, AI, or quantitative discipline from a recognized institute.

Preferred Qualifications (Nice-to-Have):
- Hands-on experience with Docker, Kubernetes, and AWS/GCP cloud deployments.
- Exposure to MLOps pipelines (MLflow, Kubeflow, Ray) and LLM inference optimization.`
  },
  {
    title: 'Senior Full Stack Engineer (React + Python)',
    company: 'CloudScale India Tech',
    experience_required: 3.0,
    location: 'Gurugram, NCR (Cyber City / Hybrid)',
    salary_range: '₹22 - ₹34 LPA',
    raw_text: `Senior Full Stack Engineer (React + Python)
Company: CloudScale India Tech
Location: Gurugram, NCR (Cyber City / Hybrid)
Experience: 3+ years
Compensation: ₹22 - ₹34 LPA

Responsibilities:
- Build high-scale web platforms using React 18, TypeScript, and Tailwind CSS.
- Architect backend microservices in FastAPI / Python with PostgreSQL and Redis.
- Manage CI/CD pipelines, Docker containers, and AWS cloud infrastructure.

Required Qualifications:
- B.Tech / B.E. / MCA in Computer Science.
- 3+ years experience with React, TypeScript, Python, PostgreSQL, and REST APIs.
Preferred: Docker, AWS, Tailwind CSS, Redis caching, microservices.`
  },
  {
    title: 'Lead Data Engineer (Spark & Snowflake)',
    company: 'StreamMetrics India',
    experience_required: 2.5,
    location: 'Hyderabad, Telangana (Hitec City)',
    salary_range: '₹20 - ₹32 LPA',
    raw_text: `Lead Data Engineer (Spark & Snowflake)
Company: StreamMetrics India
Location: Hyderabad, Telangana (Hitec City)
Experience Required: 2.5+ years
Compensation: ₹20 - ₹32 LPA

Responsibilities:
- Build resilient batch and real-time streaming data pipelines with Python, PySpark, and Kafka.
- Design dimensional data models in PostgreSQL, Snowflake, and BigQuery.

Required Skills:
- B.Tech / B.E. in CS / IT.
- Python, SQL, Apache Spark, Kafka, PostgreSQL, Data Warehousing, Git.
Preferred: Airflow, dbt, Snowflake, AWS, Docker.`
  }
];

export const JobDescriptionPage: React.FC<JobDescriptionPageProps> = ({
  jobs,
  activeJob,
  onSelectJob,
  onJobCreated,
  onProceedToScreening
}) => {
  const [formData, setFormData] = useState({
    title: activeJob?.title || TEMPLATES[0].title,
    company: activeJob?.company || TEMPLATES[0].company,
    experience_required: activeJob?.experience_required || 2.0,
    location: activeJob?.location || TEMPLATES[0].location,
    salary_range: activeJob?.salary_range || TEMPLATES[0].salary_range,
    raw_text: activeJob?.raw_text || TEMPLATES[0].raw_text
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedJob, setAnalyzedJob] = useState<JobDescription | null>(activeJob);

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setFormData({
      title: template.title,
      company: template.company,
      experience_required: template.experience_required,
      location: template.location,
      salary_range: template.salary_range,
      raw_text: template.raw_text
    });
  };

  const handleAnalyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const created = await api.createJob(formData);
      setAnalyzedJob(created);
      onJobCreated(created);
      onSelectJob(created);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sj = analyzedJob?.structured_json;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e2433]">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">Define the role.</h2>
          <p className="text-xs text-[#94a3b8]">
            Specify the role parameters and job description. Unthinkable parses mandatory criteria, preferred skills, and experience thresholds.
          </p>
        </div>

        {analyzedJob && (
          <button
            onClick={onProceedToScreening}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] shadow-sm transition-all"
          >
            <span>Screen Candidates for this Role</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Preset Role Templates */}
      <div className="space-y-2">
        <p className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] uppercase">Preset Role Templates</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="p-4 text-left rounded-xl bg-[#121520] border border-[#1e2433] hover:border-[#00f2c3]/50 hover:bg-[#151926] transition-all group shadow-sm space-y-1"
            >
              <p className="text-xs font-bold text-[#f8fafc] group-hover:text-[#00f2c3] transition-colors">{tpl.title}</p>
              <p className="text-[11px] text-[#94a3b8]">{tpl.company} • <span className="text-[#00f2c3] font-mono">{tpl.salary_range}</span></p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form and Structured Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form (7 cols) */}
        <form onSubmit={handleAnalyzeJob} className="lg:col-span-7 bg-[#121520] p-6 rounded-2xl border border-[#1e2433] shadow-xl space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc] pb-2 border-b border-[#1e2433] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#00f2c3]" />
            <span>Role Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
                placeholder="e.g. Machine Learning Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] mb-1">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
                placeholder="e.g. NexusAI Labs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] mb-1">Min Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.experience_required}
                onChange={(e) => setFormData({ ...formData, experience_required: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
                placeholder="Bengaluru / Remote"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
                placeholder="₹24 - ₹38 LPA"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc] mb-1.5 pt-2">
              What are you looking for?
            </h4>
            <textarea
              required
              rows={11}
              value={formData.raw_text}
              onChange={(e) => setFormData({ ...formData, raw_text: e.target.value })}
              className="w-full p-3 text-xs font-mono text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3] leading-relaxed"
              placeholder="Paste complete job description text here..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Role...' : 'Analyze Role'}</span>
            </button>
          </div>
        </form>

        {/* Structured Extraction Preview (5 cols) */}
        <div className="lg:col-span-5 bg-[#121520] text-[#f8fafc] p-6 rounded-2xl border border-[#1e2433] shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[#00f2c3]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
                  Extracted Requirements
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181d2a] text-[#00f2c3] border border-[#242b3d]">
                v1.0 SCHEMA
              </span>
            </div>

            {/* Mandatory vs Preferred Skills */}
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00f2c3] mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Required Skills (Mandatory)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(sj?.required_skills || ['Python', 'SQL', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Deep Learning']).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-[#181d2a] text-[#00f2c3] border border-[#00f2c3]/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" /> Preferred Skills (Nice-to-Have)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(sj?.preferred_skills || ['Docker', 'AWS', 'Kubernetes', 'MLOps']).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-[#181d2a] text-[#94a3b8] border border-[#242b3d]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education & Experience */}
              <div className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-1">
                <p className="text-[11px] font-mono font-bold text-[#f8fafc]">Experience &amp; Degree Threshold</p>
                <p className="text-xs text-[#94a3b8]">
                  Min {sj?.experience_required || formData.experience_required}+ years • B.Tech / M.Tech in CS/IT or quantitative field
                </p>
              </div>

              {/* Deal Breakers */}
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/50 space-y-1">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Mandatory Constraint Penalties
                </p>
                <p className="text-[11px] text-amber-200/80">
                  Missing mandatory frameworks or experience &lt; {sj?.experience_required || formData.experience_required} yrs incurs automatic penalty deduction.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e2433]">
            <button
              onClick={onProceedToScreening}
              className="w-full py-2.5 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Save &amp; Screen Role</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
