import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowLeft,
  Trash2,
  Plus,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { MatchResult, ScreeningSession } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';

interface CompareCandidatesPageProps {
  session: ScreeningSession | null;
  initialCandidateIds?: number[];
  onSelectCandidate: (id: number) => void;
  onBack: () => void;
}

export const CompareCandidatesPage: React.FC<CompareCandidatesPageProps> = ({
  session,
  initialCandidateIds = [],
  onSelectCandidate,
  onBack
}) => {
  const allResults = session?.results || [];
  
  const [selectedIds, setSelectedIds] = useState<number[]>(
    initialCandidateIds.length >= 2
      ? initialCandidateIds.slice(0, 4)
      : allResults.slice(0, 3).map((r) => r.candidate_id)
  );

  const selectedCandidates = allResults.filter((r) => selectedIds.includes(r.candidate_id));

  const addCandidate = (id: number) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeCandidate = (id: number) => {
    setSelectedIds(selectedIds.filter((cid) => cid !== id));
  };

  if (selectedCandidates.length === 0) {
    return (
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <GitCompare className="h-10 w-10 text-[#64748b] mx-auto" />
        <h3 className="text-base font-bold text-[#f8fafc]">No candidates selected for comparison</h3>
        <p className="text-xs text-[#94a3b8]">Select 2 to 4 candidates from the screening leaderboard to evaluate them side-by-side.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#00f2c3] text-[#08090d] font-bold text-xs rounded-xl shadow-sm"
        >
          Return to Leaderboard
        </button>
      </div>
    );
  }

  const radarData = [
    {
      subject: 'Tech Skills',
      fullMark: 35,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.technical_skills || 0 }), {})
    },
    {
      subject: 'Experience',
      fullMark: 20,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.experience || 0 }), {})
    },
    {
      subject: 'Responsibilities',
      fullMark: 15,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.responsibilities || 0 }), {})
    },
    {
      subject: 'Projects',
      fullMark: 10,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.projects || 0 }), {})
    },
    {
      subject: 'Education',
      fullMark: 5,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.education || 0 }), {})
    },
    {
      subject: 'Preferred',
      fullMark: 10,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.preferred_skills || 0 }), {})
    },
    {
      subject: 'Soft Skills',
      fullMark: 5,
      ...selectedCandidates.reduce((acc, c) => ({ ...acc, [c.candidate_name]: c.category_scores?.soft_skills || 0 }), {})
    }
  ];

  const colors = ['#00f2c3', '#38bdf8', '#f59e0b', '#a855f7'];
  const bestFitCandidate = [...selectedCandidates].sort((a, b) => b.overall_score - a.overall_score)[0];
  const maxOverall = Math.max(...selectedCandidates.map((c) => c.overall_score), 0);
  const maxTech = Math.max(...selectedCandidates.map((c) => c.category_scores?.technical_skills || 0), 0);
  const maxExp = Math.max(...selectedCandidates.map((c) => c.category_scores?.experience || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header & Add Candidate Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#94a3b8] hover:text-[#f8fafc] bg-[#121520] border border-[#1e2433] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Leaderboard</span>
          </button>
          <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-[#00f2c3]" />
            <span>Multi-Candidate Dimension Matrix</span>
          </h2>
        </div>

        {selectedCandidates.length < 4 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748b]">Add Candidate:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addCandidate(parseInt(e.target.value));
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs px-3 py-2 rounded-xl border border-[#242b3d] bg-[#0d0f17] font-semibold text-[#f8fafc] focus:outline-none focus:border-[#00f2c3]"
            >
              <option value="" disabled>Select candidate to add...</option>
              {allResults
                .filter((r) => !selectedIds.includes(r.candidate_id))
                .map((r) => (
                  <option key={r.candidate_id} value={r.candidate_id}>
                    {r.candidate_name} ({r.overall_score}%)
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Best Overall Fit Spotlight */}
      {bestFitCandidate && (
        <div className="p-4 rounded-2xl bg-[#0f131f] border border-[#00f2c3]/40 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00f2c3] uppercase flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              <span>BEST OVERALL FIT</span>
            </span>
            <h3 className="text-lg font-extrabold text-[#f8fafc]">{bestFitCandidate.candidate_name}</h3>
            <p className="text-xs text-[#94a3b8]">
              {bestFitCandidate.candidate_title} • Leading overall technical alignment across requirements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-[#00f2c3]">{bestFitCandidate.overall_score}%</span>
          </div>
        </div>
      )}

      {/* Competency Radar Overlay */}
      {selectedCandidates.length >= 2 && (
        <div className="bg-[#121520] p-6 rounded-2xl border border-[#1e2433] shadow-xl space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
            Competency Radar Overlay
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e2433" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#242b3d" />
                {selectedCandidates.map((c, idx) => (
                  <Radar
                    key={c.candidate_id}
                    name={c.candidate_name}
                    dataKey={c.candidate_name}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '10px', fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0f17', borderColor: '#1e2433', borderRadius: '12px', color: '#f8fafc' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="bg-[#121520] rounded-2xl border border-[#1e2433] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0d0f17] border-b border-[#1e2433]">
                <th className="py-4 px-5 w-48 text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b]">
                  EVALUATION DIMENSION
                </th>
                {selectedCandidates.map((c) => (
                  <th key={c.candidate_id} className="py-4 px-5 min-w-[240px] align-top">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => onSelectCandidate(c.candidate_id)}
                          className="font-bold text-sm text-[#f8fafc] hover:text-[#00f2c3] transition-colors text-left"
                        >
                          {c.candidate_name}
                        </button>
                        <p className="text-[11px] text-[#94a3b8]">{c.candidate_title || 'Candidate'}</p>
                      </div>
                      {selectedCandidates.length > 2 && (
                        <button
                          onClick={() => removeCandidate(c.candidate_id)}
                          className="p-1 text-[#64748b] hover:text-rose-400 rounded-lg transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {/* Overall Score */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Overall Match Score</td>
                {selectedCandidates.map((c) => {
                  const isTop = c.overall_score === maxOverall;
                  return (
                    <td key={c.candidate_id} className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <ScoreGauge score={c.overall_score} size="sm" showLabel={true} />
                        {isTop && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30">
                            ★ BEST
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Technical Skills */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Technical Skills (35%)</td>
                {selectedCandidates.map((c) => {
                  const isTop = (c.category_scores?.technical_skills || 0) === maxTech;
                  return (
                    <td key={c.candidate_id} className="py-3.5 px-5 font-mono text-[#f8fafc]">
                      <span className="font-bold">{c.category_scores?.technical_skills ?? 0}</span> / 35.0
                      {isTop && <span className="ml-2 text-[10px] text-[#00f2c3] font-bold">✓ Highest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Experience */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Experience (20%)</td>
                {selectedCandidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-5 font-mono text-[#f8fafc]">
                    <span className="font-bold">{c.candidate_experience_years.toFixed(1)} Yrs</span> ({c.category_scores?.experience ?? 0}/20.0)
                  </td>
                ))}
              </tr>

              {/* Matched Skills */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Core Matches</td>
                {selectedCandidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {c.matched_skills.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono font-bold rounded">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Missing Skills */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Missing Requirements</td>
                {selectedCandidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {c.missing_skills.length > 0 ? (
                        c.missing_skills.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-800/60 text-[10px] font-mono font-bold rounded">
                            × {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold font-mono">None</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Hiring Decision */}
              <tr className="hover:bg-[#151926]/50">
                <td className="py-3.5 px-5 font-bold text-[#f8fafc] bg-[#0d0f17]/50">Recruiter Decision</td>
                {selectedCandidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                      c.recruiter_decision === 'SHORTLISTED'
                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/80'
                        : c.recruiter_decision === 'REJECTED'
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-800/80'
                        : c.recruiter_decision === 'REVIEW'
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-800/80'
                        : 'bg-[#0d0f17] text-[#94a3b8] border border-[#242b3d]'
                    }`}>
                      {c.recruiter_decision || 'UNDECIDED'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
