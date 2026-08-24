import {
  ApiResponse,
  DashboardStats,
  JobDescription,
  ScreeningSession,
  CandidateDetail,
  MatchResult
} from '../types';

// Dynamic API base URL resolution:
// 1. If VITE_API_BASE_URL is set, use it.
// 2. If running on Render (e.g. *.onrender.com), use the live backend directly.
// 3. Otherwise default to relative '/api' (proxied via Vite / Nginx).
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') && !host.includes('unthinkable-backend')) {
      return 'https://unthinkable-backend.onrender.com/api';
    }
  }
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}/api`;
  }
  return '/api';
}

const API_BASE = getApiBaseUrl();

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const targetUrl = `${API_BASE}${url}`;
    const response = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = `HTTP error ${response.status}`;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson?.error?.message) parsedMessage = errJson.error.message;
        else if (errJson?.message) parsedMessage = errJson.message;
      } catch {
        // Non-JSON response
      }
      throw new Error(parsedMessage);
    }

    const json: ApiResponse<T> = await response.json();
    if (!json.success && json.error) {
      throw new Error(json.error.message || 'API request failed');
    }
    return json.data as T;
  } catch (err: any) {
    console.warn(`API call failed on [${url}]:`, err?.message);
    throw err;
  }
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

    if (!response.ok) {
      const errorText = await response.text();
      let msg = `Upload failed with status ${response.status}`;
      try {
        const err = JSON.parse(errorText);
        if (err?.error?.message) msg = err.error.message;
      } catch {}
      throw new Error(msg);
    }

    const json: ApiResponse<any[]> = await response.json();
    if (!json.success && json.error) {
      throw new Error(json.error.message || 'Failed to upload files');
    }
    return json.data as any[];
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

  // ATS Score Checker
  checkAtsScore: (payload: { resume_text: string; job_text: string; target_role?: string }) =>
    fetchJson<any>('/screening/ats-check', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Data Management
  clearData: () => fetchJson<any>('/data/clear', { method: 'POST' }),
  loadSampleData: () => fetchJson<any>('/data/load-samples', { method: 'POST' })
};
