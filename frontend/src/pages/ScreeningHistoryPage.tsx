import React, { useState, useEffect } from 'react';
import {
  History,
  Briefcase,
  Users,
  Award,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface ScreeningHistoryPageProps {
  onOpenSession: (sessionId: number) => void;
}

export const ScreeningHistoryPage: React.FC<ScreeningHistoryPageProps> = ({
  onOpenSession
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getScreeningSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2433]">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-[#00f2c3]" />
            <span>Screening Audit Log</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">
            Historical archive of all role evaluation sessions, candidate ranking snapshots, and score distributions.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-xl transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#94a3b8]">
          <div className="h-8 w-8 border-2 border-[#00f2c3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Loading historical screening sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#121520] p-12 rounded-2xl border border-[#1e2433] text-center space-y-3 max-w-xl mx-auto shadow-xl">
          <History className="h-10 w-10 text-[#64748b] mx-auto" />
          <p className="text-sm font-bold text-[#f8fafc]">No screening sessions recorded yet.</p>
          <p className="text-xs text-[#94a3b8]">Run candidate screening on any job description to record historical session logs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="bg-[#121520] p-5 rounded-2xl border border-[#1e2433] shadow-xl hover:border-[#2c354a] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#f8fafc] group-hover:text-[#00f2c3] transition-colors">
                    {sess.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181d2a] text-[#00f2c3] border border-[#00f2c3]/30">
                    {sess.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1 text-[#f8fafc] font-semibold">
                    <Briefcase className="h-3.5 w-3.5 text-[#00f2c3]" /> {sess.job_title} ({sess.company})
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="h-3.5 w-3.5 text-[#64748b]" /> {sess.total_candidates} candidates
                  </span>
                  {sess.created_at && (
                    <span className="flex items-center gap-1 text-[#64748b] font-mono">
                      <Clock className="h-3.5 w-3.5" /> {new Date(sess.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {sess.top_candidate_name && (
                  <p className="text-xs text-[#94a3b8] pt-0.5">
                    Top Ranked: <span className="font-bold text-[#f8fafc]">{sess.top_candidate_name}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <p className="text-[10px] font-mono uppercase text-[#64748b]">Avg Match</p>
                  <p className="text-xl font-extrabold text-[#00f2c3] font-mono">{sess.average_score}%</p>
                </div>

                <button
                  onClick={() => onOpenSession(sess.id)}
                  className="px-4 py-2 bg-[#181d2a] hover:bg-[#00f2c3] hover:text-[#08090d] text-[#f8fafc] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-[#242b3d]"
                >
                  <span>Inspect Run</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
