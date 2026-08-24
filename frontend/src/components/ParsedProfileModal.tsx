import React, { useState } from 'react';
import { X, Code2, FileText, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { CandidateDetail } from '../types';

interface ParsedProfileModalProps {
  candidate: CandidateDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParsedProfileModal: React.FC<ParsedProfileModalProps> = ({
  candidate,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'json'>('structured');

  if (!isOpen || !candidate) return null;

  const sr = candidate.structured_resume;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121520] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#1e2433] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e2433] flex items-center justify-between bg-[#0d0f17] rounded-t-2xl">
          <div>
            <h3 className="text-base font-extrabold text-[#f8fafc]">{candidate.name}</h3>
            <p className="text-xs text-[#94a3b8] font-medium">{candidate.current_title || 'Candidate Profile'} • {candidate.total_experience_years.toFixed(1)} years verified experience</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#181d2a] p-1 rounded-xl text-xs font-semibold border border-[#242b3d]">
              <button
                onClick={() => setActiveTab('structured')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'structured' ? 'bg-[#0d0f17] text-[#00f2c3] shadow-sm' : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                Structured Profile
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'json' ? 'bg-[#0d0f17] text-[#00f2c3] shadow-sm' : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                Raw JSON
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'structured' ? (
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0d0f17] rounded-xl border border-[#1e2433] text-xs">
                {candidate.email && (
                  <div className="flex items-center gap-2 text-[#e2e8f0]">
                    <Mail className="h-3.5 w-3.5 text-[#00f2c3] flex-shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-[#e2e8f0]">
                    <Phone className="h-3.5 w-3.5 text-[#00f2c3] flex-shrink-0" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-[#e2e8f0]">
                    <MapPin className="h-3.5 w-3.5 text-[#00f2c3] flex-shrink-0" />
                    <span>{candidate.location}</span>
                  </div>
                )}
              </div>

              {/* Categorized Skills */}
              {sr?.skills && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] mb-3">Extracted Skills by Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(sr.skills).map(([category, skills]) => {
                      if (!Array.isArray(skills) || skills.length === 0) return null;
                      return (
                        <div key={category} className="p-3.5 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                          <p className="text-xs font-bold text-[#f8fafc] capitalize mb-2 font-mono">
                            {category.replace('_', ' ')}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((s: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-[#181d2a] text-[#00f2c3] border border-[#00f2c3]/30 text-xs rounded font-mono font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Work History */}
              {sr?.experience && sr.experience.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] mb-3">Verified Experience History</h4>
                  <div className="space-y-3">
                    {sr.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-[#0d0f17] rounded-xl border border-[#1e2433]">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-[#f8fafc]">{exp.job_title}</p>
                            <p className="text-[11px] font-medium text-[#00f2c3]">{exp.company}</p>
                          </div>
                          <span className="text-[11px] text-[#64748b] font-mono">
                            {exp.start_date} – {exp.end_date || 'Present'}
                          </span>
                        </div>
                        {exp.description && <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{exp.description}</p>}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.technologies.map((t, tIdx) => (
                              <span key={tIdx} className="px-1.5 py-0.5 bg-[#181d2a] text-[#94a3b8] rounded text-[10px] font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {sr?.education && sr.education.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] mb-3">Academic Degrees</h4>
                  <div className="space-y-2">
                    {sr.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-[#0d0f17] rounded-xl border border-[#1e2433] flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-[#f8fafc]">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                          <p className="text-[#94a3b8]">{edu.institution}</p>
                        </div>
                        {edu.end_year && <span className="text-[#64748b] font-mono font-bold">{edu.end_year}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <pre className="p-4 bg-[#090a0f] text-[#00f2c3] font-mono text-xs rounded-xl overflow-x-auto border border-[#1e2433] leading-relaxed">
              {JSON.stringify(sr || candidate, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1e2433] bg-[#0d0f17] rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#181d2a] hover:bg-[#242b3d] text-[#f8fafc] text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
