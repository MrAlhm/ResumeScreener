import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, Send, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
  candidateName: string;
  jobTitle?: string;
  company?: string;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  jobTitle = 'Machine Learning Engineer',
  company = 'NexusAI Technologies'
}) => {
  const [templateType, setTemplateType] = useState<string>('interview_invite');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOutreach = async (type: string) => {
    setLoading(true);
    try {
      const data = await api.generateOutreach(candidateId, {
        template_type: type,
        job_title: jobTitle,
        company: company
      });
      setSubject(data.subject);
      setBody(data.body);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOutreach(templateType);
    }
  }, [isOpen, candidateId, templateType]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121520] rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col border border-[#242b3d] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e2433] bg-[#0d0f17] flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00f2c3]/15 border border-[#00f2c3]/30 flex items-center justify-center text-[#00f2c3]">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#f8fafc]">
                AI Candidate Outreach: {candidateName}
              </h3>
              <p className="text-xs text-[#94a3b8]">Draft personalized communications with 1-click tailored hooks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Template Selector Tabs */}
          <div className="flex bg-[#0d0f17] p-1 rounded-xl border border-[#1e2433] gap-1 font-semibold">
            <button
              onClick={() => setTemplateType('interview_invite')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                templateType === 'interview_invite'
                  ? 'bg-[#181d2a] text-[#00f2c3] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              Interview Invitation
            </button>
            <button
              onClick={() => setTemplateType('in_review')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                templateType === 'in_review'
                  ? 'bg-[#181d2a] text-[#00f2c3] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              In-Review Update
            </button>
            <button
              onClick={() => setTemplateType('gentle_rejection')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                templateType === 'gentle_rejection'
                  ? 'bg-[#181d2a] text-[#00f2c3] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              Constructive Feedback
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#94a3b8] space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#00f2c3]" />
              <p className="font-mono">Drafting personalized outreach message...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#64748b] uppercase mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#64748b] uppercase mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 text-xs font-sans text-[#f8fafc] bg-[#0d0f17] rounded-xl border border-[#242b3d] focus:outline-none focus:border-[#00f2c3] leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1e2433] bg-[#0d0f17] flex items-center justify-between rounded-b-2xl">
          <span className="text-[11px] text-[#64748b]">Includes candidate-specific project references</span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              disabled={loading}
              className="px-4 py-2 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
