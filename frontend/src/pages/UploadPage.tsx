import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ArrowRight,
  Eye,
  FileCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { ParsedProfileModal } from '../components/ParsedProfileModal';
import { CandidateDetail } from '../types';

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'PENDING' | 'UPLOADING' | 'EXTRACTING' | 'UNDERSTANDING' | 'MATCHING' | 'RANKING' | 'SUCCESS' | 'FAILED';
  error?: string;
  result?: any;
}

interface UploadPageProps {
  onProceedToScreening: () => void;
  onRefreshStats: () => void;
}

const PIPELINE_STEPS = [
  { id: 'UPLOADING', label: 'UPLOADING', hint: 'Reading resume files...' },
  { id: 'EXTRACTING', label: 'EXTRACTING', hint: 'PyMuPDF text extraction...' },
  { id: 'UNDERSTANDING', label: 'UNDERSTANDING', hint: 'Structuring skills & experience...' },
  { id: 'MATCHING', label: 'MATCHING', hint: 'Semantic job criteria alignment...' },
  { id: 'RANKING', label: 'RANKING', hint: 'Building candidate leaderboard...' }
];

export const UploadPage: React.FC<UploadPageProps> = ({
  onProceedToScreening,
  onRefreshStats
}) => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      status: 'PENDING'
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const processUploadQueue = async () => {
    const pendingItems = queue.filter((item) => item.status === 'PENDING');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    setCurrentStepIndex(0);

    // Animate subtle pipeline steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const filesToUpload = pendingItems.map((item) => item.file);
      const results = await api.uploadResumes(filesToUpload);

      clearInterval(stepInterval);
      setCurrentStepIndex(PIPELINE_STEPS.length - 1);

      setQueue((prev) =>
        prev.map((item) => {
          const res = results.find((r) => r.filename === item.name);
          if (res) {
            if (res.status === 'SUCCESS') {
              return { ...item, status: 'SUCCESS', result: res };
            } else {
              return { ...item, status: 'FAILED', error: res.error || 'Extraction failed' };
            }
          }
          return item;
        })
      );

      onRefreshStats();
    } catch (err: any) {
      clearInterval(stepInterval);
      setQueue((prev) =>
        prev.map((item) =>
          item.status !== 'SUCCESS'
            ? { ...item, status: 'FAILED', error: err.message || 'Upload error' }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const inspectProfile = async (candidateId: number) => {
    try {
      const cand = await api.getCandidate(candidateId);
      setSelectedCandidate(cand);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const successCount = queue.filter((q) => q.status === 'SUCCESS').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#1e2433]">
        <h2 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">Candidate Resume Ingestion</h2>
        <p className="text-xs text-[#94a3b8]">
          Upload multiple resumes in PDF or TXT format for automated multi-stage parsing, heuristic extraction, and real-time semantic screening.
        </p>
      </div>

      {/* Large Precision Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFilesAdded(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragOver
            ? 'border-[#00f2c3] bg-[#00f2c3]/5 scale-[1.005]'
            : 'border-[#242b3d] bg-[#0d0f17] hover:border-[#38435e]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={(e) => handleFilesAdded(e.target.files)}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#181d2a] border border-[#242b3d] text-[#00f2c3] flex items-center justify-center">
            <UploadCloud className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <p className="text-lg font-bold text-[#f8fafc]">
              Drop resumes here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#00f2c3] hover:underline font-bold"
              >
                Choose files
              </button>
            </p>
            <p className="text-xs text-[#94a3b8]">
              Upload multiple resumes and let Unthinkable identify the strongest candidates.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-[#64748b] pt-1">
            <span>SUPPORTED: PDF, TXT</span>
            <span>•</span>
            <span>MAX 10MB PER FILE</span>
          </div>
        </div>
      </div>

      {/* Elegant Progress Timeline when processing */}
      {isProcessing && (
        <div className="bg-[#121520] p-6 rounded-2xl border border-[#242b3d] shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-[#00f2c3] uppercase flex items-center gap-2">
              <Zap className="h-4 w-4 animate-pulse" />
              <span>AI INGESTION PIPELINE</span>
            </span>
            <span className="text-xs font-mono text-[#94a3b8]">
              {PIPELINE_STEPS[currentStepIndex].hint}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#00f2c3]/10 border-[#00f2c3] text-[#00f2c3]'
                      : isDone
                      ? 'bg-[#181d2a] border-[#242b3d] text-[#94a3b8]'
                      : 'bg-[#0d0f17] border-[#1e2433] text-[#64748b]'
                  }`}
                >
                  <p className="text-[10px] font-mono font-bold tracking-wider">{step.label}</p>
                  <p className="text-[9px] mt-1 truncate">
                    {isCurrent ? 'Processing...' : isDone ? 'Completed' : 'Pending'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Queue Table */}
      {queue.length > 0 && (
        <div className="bg-[#121520] rounded-2xl border border-[#1e2433] overflow-hidden space-y-4 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433]">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f8fafc]">
                Upload Queue ({queue.length} files)
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {successCount} parsed successfully • {queue.filter((q) => q.status === 'FAILED').length} errors
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={processUploadQueue}
                disabled={isProcessing || queue.filter((q) => q.status === 'PENDING').length === 0}
                className="px-4 py-2 bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Process Queue</span>
                  </>
                )}
              </button>

              {successCount > 0 && (
                <button
                  onClick={onProceedToScreening}
                  className="px-4 py-2 bg-[#181d2a] hover:bg-[#1f2536] text-[#f8fafc] border border-[#242b3d] hover:border-[#00f2c3]/40 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>View Leaderboard ({successCount})</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#00f2c3]" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#1e2433]">
            {queue.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-[#0d0f17] border border-[#1e2433] flex items-center justify-center text-[#94a3b8] flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#f8fafc] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#64748b] font-mono">
                      {(item.size / 1024).toFixed(1)} KB • {item.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'PENDING' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181d2a] text-[#94a3b8] border border-[#242b3d]">
                      READY TO EXTRACT
                    </span>
                  )}
                  {item.status === 'SUCCESS' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2c3]/15 text-[#00f2c3] border border-[#00f2c3]/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> PARSED
                      </span>
                      {item.result?.candidate_id && (
                        <button
                          onClick={() => inspectProfile(item.result.candidate_id)}
                          className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#181d2a] rounded-lg transition-colors"
                          title="Inspect Extracted Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                  {item.status === 'FAILED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> FAILED
                    </span>
                  )}

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-[#64748b] hover:text-rose-400 rounded-lg hover:bg-[#181d2a] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <ParsedProfileModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
