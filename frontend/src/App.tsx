import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { JobDescriptionPage } from './pages/JobDescriptionPage';
import { ScreeningResultsPage } from './pages/ScreeningResultsPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CompareCandidatesPage } from './pages/CompareCandidatesPage';
import { MatchLabPage } from './pages/MatchLabPage';
import { ATSCheckerPage } from './pages/ATSCheckerPage';
import { ScreeningHistoryPage } from './pages/ScreeningHistoryPage';
import { CommandPalette } from './components/CommandPalette';
import { api } from './services/api';
import { DashboardStats, JobDescription, ScreeningSession } from './types';
import { Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [activeJob, setActiveJob] = useState<JobDescription | null>(null);
  const [session, setSession] = useState<ScreeningSession | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isScreeningLoading, setIsScreeningLoading] = useState(false);

  // Pro Features State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);

  const loadRealtimeData = async () => {
    try {
      const [statsData, jobsData, sessionsData] = await Promise.all([
        api.getDashboardStats(),
        api.getJobs(),
        api.getScreeningSessions()
      ]);
      setStats(statsData);
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setActiveJob((prev) => prev || jobsData[0]);
      }
      if (sessionsData.length > 0) {
        const latestSession = await api.getScreeningSession(sessionsData[0].id);
        setSession(latestSession);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Failed to load real-time data:', err);
    }
  };

  useEffect(() => {
    loadRealtimeData();
  }, []);

  const handleClearData = async () => {
    setIsActionLoading(true);
    try {
      await api.clearData();
      setStats(null);
      setJobs([]);
      setActiveJob(null);
      setSession(null);
      setSelectedCandidateId(null);
      setCompareIds([]);
      await loadRealtimeData();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Clear failed:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoadSamples = async () => {
    setIsActionLoading(true);
    try {
      await api.loadSampleData();
      await loadRealtimeData();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Sample loading failed:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartScreening = async () => {
    if (!activeJob) {
      setActiveTab('job');
      return;
    }
    setIsScreeningLoading(true);
    try {
      const newSession = await api.runScreening(activeJob.id);
      setSession(newSession);
      const updatedStats = await api.getDashboardStats();
      setStats(updatedStats);
      setActiveTab('results');
    } catch (err: any) {
      alert(err.message || 'Screening failed. Please make sure resumes are uploaded.');
      console.error('Screening failed:', err);
    } finally {
      setIsScreeningLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId: number) => {
    setSelectedCandidateId(candidateId);
    setActiveTab('candidates');
  };

  const handleCompareCandidates = (candidateIds: number[]) => {
    setCompareIds(candidateIds);
    setActiveTab('compare');
  };

  const handleOpenHistoricalSession = async (sessionId: number) => {
    try {
      const sess = await api.getScreeningSession(sessionId);
      setSession(sess);
      setActiveTab('results');
    } catch (err) {
      console.error(err);
    }
  };

  const activeCandidateMatch = session?.results.find(
    (r) => r.candidate_id === (selectedCandidateId || 1)
  );

  const candidateNames = session?.results.map((r) => ({
    id: r.candidate_id,
    name: r.candidate_name,
    title: r.candidate_title || 'Candidate',
    score: r.overall_score
  })) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] font-sans text-[#f8fafc] selection:bg-[#00f2c3] selection:text-[#08090d]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        demoMode={stats?.demo_mode ?? true}
        onClearData={handleClearData}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isBlindMode={isBlindMode}
        onToggleBlindMode={() => setIsBlindMode(!isBlindMode)}
        isActionLoading={isActionLoading}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onToggleBlindMode={() => setIsBlindMode(!isBlindMode)}
        isBlindMode={isBlindMode}
        onClearWorkspace={handleClearData}
        candidateNames={candidateNames}
        onSelectCandidate={(id) => {
          handleSelectCandidate(id);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto my-6 px-4 sm:px-6 lg:px-8 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'candidates' && !selectedCandidateId && session?.results?.length) {
              setSelectedCandidateId(session.results[0].candidate_id);
            }
            setActiveTab(tab);
          }}
          candidateCount={stats?.total_candidates ?? 0}
          resultsCount={session?.results.length ?? 0}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {isScreeningLoading ? (
            <div className="bg-[#121520] rounded-2xl p-16 border border-[#1e2433] shadow-2xl text-center space-y-4 my-8">
              <div className="h-10 w-10 border-2 border-[#00f2c3] border-t-transparent rounded-full animate-spin mx-auto text-[#00f2c3]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#f8fafc]">Evaluating Candidates with Unthinkable AI</h3>
                <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
                  Executing semantic matching against '{activeJob?.title}', calculating multi-factor scores, detecting critical gaps, and citing verified evidence...
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  onNavigate={setActiveTab}
                  onStartScreening={handleStartScreening}
                  onLoadSamples={handleLoadSamples}
                />
              )}

              {activeTab === 'upload' && (
                <UploadPage
                  onProceedToScreening={handleStartScreening}
                  onRefreshStats={loadRealtimeData}
                />
              )}

              {activeTab === 'ats' && (
                <ATSCheckerPage />
              )}

              {activeTab === 'job' && (
                <JobDescriptionPage
                  jobs={jobs}
                  activeJob={activeJob}
                  onSelectJob={setActiveJob}
                  onJobCreated={(job) => {
                    setJobs([job, ...jobs]);
                    setActiveJob(job);
                  }}
                  onProceedToScreening={handleStartScreening}
                />
              )}

              {activeTab === 'results' && (
                <ScreeningResultsPage
                  session={session}
                  onSelectCandidate={handleSelectCandidate}
                  onCompareCandidates={handleCompareCandidates}
                  onRefreshSession={async () => {
                    if (session) {
                      const updated = await api.getScreeningSession(session.id);
                      setSession(updated);
                    }
                  }}
                  onNavigateToUpload={() => setActiveTab('upload')}
                  onNavigateToJob={() => setActiveTab('job')}
                  isBlindMode={isBlindMode}
                />
              )}

              {activeTab === 'candidates' && (
                <CandidateDetailPage
                  candidateId={selectedCandidateId || session?.results[0]?.candidate_id || 1}
                  matchResult={activeCandidateMatch}
                  activeJob={activeJob}
                  onBack={() => setActiveTab('results')}
                  onRefreshDecision={async () => {
                    if (session) {
                      const updated = await api.getScreeningSession(session.id);
                      setSession(updated);
                    }
                  }}
                  isBlindMode={isBlindMode}
                />
              )}

              {activeTab === 'compare' && (
                <CompareCandidatesPage
                  session={session}
                  initialCandidateIds={compareIds}
                  onSelectCandidate={handleSelectCandidate}
                  onBack={() => setActiveTab('results')}
                />
              )}

              {activeTab === 'lab' && (
                <MatchLabPage />
              )}

              {activeTab === 'history' && (
                <ScreeningHistoryPage
                  onOpenSession={handleOpenHistoricalSession}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
