import {
  ApiResponse,
  DashboardStats,
  JobDescription,
  ScreeningSession,
  CandidateDetail,
  MatchResult
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  const json: ApiResponse<T> = await response.json();
  if (!json.success && json.error) {
    throw new Error(json.error.message || 'API request failed');
  }
  return json.data;
}

export const api = {
  // Analytics
  getDashboardStats: () => fetchJson<DashboardStats>('/analytics/dashboard'),

  // Jobs
  getJobs: () => fetchJson<JobDescription[]>('/jobs'),
  getJob: (id: number) => fetchJson<JobDescription>(`/jobs/${id}`),
  createJob: (payload: {
    title: string;
    company: string;
    experience_required: number;
    location?: string;
    salary_range?: string;
    raw_text: string;
  }) => fetchJson<JobDescription>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  reanalyzeJob: (id: number) => fetchJson<JobDescription>(`/jobs/${id}/analyze`, {
    method: 'POST'
  }),

  // Resumes
  getResumes: () => fetchJson<any[]>('/resumes'),
  getResume: (id: number) => fetchJson<any>(`/resumes/${id}`),
  uploadResumes: async (files: File[]): Promise<any[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData
    });

    const json: ApiResponse<any[]> = await response.json();
    if (!json.success && json.error) {
      throw new Error(json.error.message || 'Failed to upload files');
    }
    return json.data;
  },

  // Candidates
  getCandidates: () => fetchJson<any[]>('/candidates'),
  getCandidate: (id: number) => fetchJson<CandidateDetail>(`/candidates/${id}`),
  setRecruiterDecision: (
    candidateId: number,
    decision: 'SHORTLISTED' | 'REJECTED' | 'REVIEW' | 'UNDECIDED',
    notes?: string,
    jobId: number = 1
  ) => fetchJson<any>(`/candidates/${candidateId}/decision?job_id=${jobId}`, {
    method: 'POST',
    body: JSON.stringify({ decision, notes })
  }),
  generateInterviewKit: (candidateId: number) => fetchJson<any>(`/candidates/${candidateId}/interview-kit`, {
    method: 'POST'
  }),
  generateOutreach: (candidateId: number, payload: { template_type: string; job_title?: string; company?: string }) =>
    fetchJson<any>(`/candidates/${candidateId}/outreach`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Screening
  runScreening: (jobId: number, candidateIds?: number[]) => fetchJson<ScreeningSession>('/screening/run', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, candidate_ids: candidateIds })
  }),
  getScreeningSessions: () => fetchJson<any[]>('/screening/sessions'),
  getScreeningSession: (id: number) => fetchJson<ScreeningSession>(`/screening/sessions/${id}`),
  liveSimulate: (resumeText: string, jobText: string) => fetchJson<any>('/screening/live-simulate', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, job_text: jobText })
  }),
  getExportCsvUrl: (sessionId: number) => `${API_BASE}/screening/sessions/${sessionId}/export-csv`,

  // Data Management
  clearData: () => fetchJson<any>('/data/clear', { method: 'POST' }),
  loadSampleData: () => fetchJson<any>('/data/load-samples', { method: 'POST' })
};
