import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, MessageSquare, Printer, Award, HelpCircle } from 'lucide-react';

interface QuestionItem {
  category: string;
  question: string;
  look_for: string;
  red_flags: string;
}

interface InterviewKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateTitle: string;
  questions: QuestionItem[];
}

export const InterviewKitModal: React.FC<InterviewKitModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  candidateTitle,
  questions
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    const text = questions
      .map(
        (q, idx) =>
          `[${q.category}]\nQ${idx + 1}: ${q.question}\n✓ Look For: ${q.look_for}\n✗ Red Flags: ${q.red_flags}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(
      `--- INTERVIEW KIT: ${candidateName} (${candidateTitle}) ---\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121520] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#242b3d] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e2433] bg-[#0d0f17] flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00f2c3]/15 border border-[#00f2c3]/30 flex items-center justify-center text-[#00f2c3]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#f8fafc]">
                Tailored Interview Kit: {candidateName}
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Role: {candidateTitle} • Customized technical questions &amp; evaluation rubrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#181d2a] hover:bg-[#242b3d] text-[#00f2c3] border border-[#00f2c3]/30 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Kit'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-lg transition-colors"
              title="Print Kit"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 bg-[#0d0f17] rounded-xl border border-[#1e2433] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#00f2c3] bg-[#181d2a] px-2 py-0.5 rounded border border-[#00f2c3]/30">
                  {q.category}
                </span>
                <span className="font-mono text-[#64748b] text-[10px]">Question #{idx + 1}</span>
              </div>

              <p className="text-sm font-bold text-[#f8fafc] leading-relaxed">
                "{q.question}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e2433] text-[11px]">
                <div className="space-y-0.5 text-emerald-300">
                  <p className="font-bold flex items-center gap-1">
                    <span>✓ Look For:</span>
                  </p>
                  <p className="text-[#94a3b8]">{q.look_for}</p>
                </div>
                <div className="space-y-0.5 text-rose-300">
                  <p className="font-bold flex items-center gap-1">
                    <span>✗ Red Flags:</span>
                  </p>
                  <p className="text-[#94a3b8]">{q.red_flags}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e2433] bg-[#0d0f17] flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#181d2a] hover:bg-[#242b3d] text-[#f8fafc] text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
