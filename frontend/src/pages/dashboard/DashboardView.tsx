import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { DashboardData, RecommendedJob, OpenSourceIssue } from '../../types.ts';
import { 
  FileText, 
  Code2, 
  Briefcase, 
  Clock, 
  GitPullRequest, 
  BarChart3, 
  User,
  Calendar,
  Layers, 
  Trophy, 
  ArrowRight, 
  Target,
  PenTool,
  UserCheck
} from 'lucide-react';

import { CodingInterviewModal } from '../../components/coding/CodingInterviewModal.tsx';
import { JobsExplorerModal } from '../../components/job/JobsExplorerModal.tsx';

import { ScorecardDetailsModal } from '../../components/interview/ScorecardDetailsModal.tsx';
import { PracticeRoadmapModal } from '../../components/interview/PracticeRoadmapModal.tsx';
import { OpenSourceModal } from '../../components/github/OpenSourceModal.tsx';
import { CodingScorecardModal } from '../../components/coding/CodingScorecardModal.tsx';
import { CodingAssessmentRecord } from '../../types.ts';
import { Coins } from 'lucide-react';

interface DashboardViewProps {
  onOpenMockTest: () => void;
  onNavigateToProfile: () => void;
  onOpenCreditModal?: () => void;
  onNavigateToInterview?: () => void;
  onNavigateToCoding?: () => void;
}

// Crisp Vector Logos for Companies and Repositories
const MicrosoftLogo = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" rx="1" />
    <rect x="12" y="1" width="9" height="9" fill="#7FBA00" rx="1" />
    <rect x="1" y="12" width="9" height="9" fill="#00A4EF" rx="1" />
    <rect x="12" y="12" width="9" height="9" fill="#FFB900" rx="1" />
  </svg>
);

const AmazonLogo = () => (
  <div 
    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-dark text-white fw-bold"
    style={{ width: '24px', height: '24px', fontSize: '0.82rem', fontFamily: 'system-ui' }}
  >
    a
  </div>
);

const GoogleLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="flex-shrink-0">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.26A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.26 5.42l4.02-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const ReactLogo = () => (
  <svg width="22" height="22" viewBox="-11.5 -10.23174 23 20.46348" className="flex-shrink-0">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

const NodeLogo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" className="flex-shrink-0">
    <path fill="#22C55E" d="M16 2L3 9.5v15L16 32l13-7.5v-15L16 2zm0 4.1l9.5 5.5v11L16 28.1 6.5 22.6v-11L16 6.1z" />
    <path fill="#16A34A" d="M16 8l7 4v8l-7 4-7-4v-8l7-4z" />
  </svg>
);

const TensorFlowLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="flex-shrink-0">
    <path fill="#F97316" d="M12 2L3 7v10l4.5 2.5V12L12 9.5l4.5 2.5v7.5L21 17V7L12 2z" />
    <path fill="#EA580C" d="M12 9.5v12.5l4.5-2.5V12L12 9.5z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenMockTest, 
  onNavigateToProfile,
  onOpenCreditModal,
  onNavigateToInterview,
  onNavigateToCoding
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [isCodingScorecardOpen, setIsCodingScorecardOpen] = useState(false);
  const [selectedCodingAssessment, setSelectedCodingAssessment] = useState<CodingAssessmentRecord | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isOpenSourceModalOpen, setIsOpenSourceModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.dashboard.get();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh when candidate completes an interview and switches back
    const handleFocus = () => {
      api.dashboard.get().then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      }).catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleApplyJob = async (jobId: string) => {
    try {
      const res = await api.dashboard.applyJob(jobId);
      if (res.success && data) {
        setData({
          ...data,
          recommendedJobs: data.recommendedJobs.map((j) =>
            j.id === jobId ? { ...j, applied: res.applied } : j
          ),
        });
      }
    } catch (err) {
      console.error('Apply job error:', err);
    }
  };

  const displayName = user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Candidate';

  if (loading && !data) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading dashboard metrics...</span>
        </div>
        <p className="text-secondary fw-medium small">Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="alert alert-danger mx-auto max-w-md shadow-xs rounded-3">
          <p className="mb-2 fw-semibold">Failed to fetch dashboard metrics</p>
          <p className="small mb-3">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-sm btn-primary rounded-pill px-3">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { interviewReadiness, recentInterview, weakAreas, recommendedJobs, recommendedIssues, recentActivities } = data;

  // SVG Circular Gauge calculations for Interview Readiness
  const readinessScore = 78;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  // Skills overview items from uploaded screenshot
  const skillsList = [
    { name: 'JavaScript', percentage: 85 },
    { name: 'React.js', percentage: 82 },
    { name: 'Node.js', percentage: 76 },
    { name: 'MongoDB', percentage: 70 },
    { name: 'DSA', percentage: 60 },
    { name: 'System Design', percentage: 55 },
    { name: 'Communication', percentage: 68 },
  ];

  // Weak areas list from uploaded screenshot
  const defaultWeakAreas = [
    { id: '1', title: 'Dynamic Programming' },
    { id: '2', title: 'System Design' },
    { id: '3', title: 'Database Concepts' },
    { id: '4', title: 'Communication Skills' },
    { id: '5', title: 'Behavioral Questions' },
  ];

  const displayWeakAreas = weakAreas && weakAreas.length >= 5
    ? weakAreas.slice(0, 5).map((w, idx) => ({ id: String(idx + 1), title: w.topic }))
    : defaultWeakAreas;

  return (
    <div className="p-3 p-md-4 max-w-7xl mx-auto" style={{ backgroundColor: '#F8FAFC' }}>
      {/* 1. TOP GREETING & STATUS WIDGETS ROW */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        {/* Left Greeting */}
        <div>
          <h1 className="h3 fw-bold tracking-tight mb-1 d-flex align-items-center gap-2" style={{ color: '#0F172A', fontSize: '1.75rem' }}>
            Good morning, {displayName}! <span>👋</span>
          </h1>
          <p className="small mb-0" style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Keep going! You're one step closer to your dream job.
          </p>
        </div>

        {/* Right Status / Motivational Cards */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Quote Card */}
          <div 
            className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 border"
            style={{
              backgroundColor: '#EFF6FF',
              borderColor: '#DBEAFE',
              color: '#1E40AF',
              fontSize: '0.82rem'
            }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 0.8, color: '#3B82F6', fontWeight: 'bold' }}>“</span>
            <span className="fw-medium">
              Consistent practice today builds your success tomorrow.
            </span>
            <span style={{ fontSize: '1.2rem', lineHeight: 0.8, color: '#3B82F6', fontWeight: 'bold' }}>”</span>
          </div>

          {/* Date Card */}
          <div 
            className="px-3 py-2 rounded-3 text-end border bg-white"
            style={{
              borderColor: '#E2E8F0',
              minWidth: '140px'
            }}
          >
            <div className="fw-bold" style={{ color: '#0F172A', fontSize: '0.84rem' }}>
              Tue, 2 Sep 2025
            </div>
            <div style={{ color: '#64748B', fontSize: '0.72rem' }}>
              Let's make progress!
            </div>
          </div>
        </div>
      </div>

      {/* CREDIT WALLET & QUICK REFILL BANNER */}
      <div 
        className="card border-0 rounded-3 p-3 px-md-4 mb-4 shadow-xs d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
        style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderLeft: '4px solid #F59E0B'
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0"
            style={{ width: '42px', height: '42px', backgroundColor: '#FDE68A', color: '#D97706' }}
          >
            <Coins size={22} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                AI Credit Balance: {data.credits ?? user?.credits ?? 100} Credits
              </h6>
              <span className="badge rounded-pill bg-amber-200 text-amber-900 small" style={{ fontSize: '0.7rem' }}>
                {Math.floor((data.credits ?? user?.credits ?? 100) / 50)} Sessions Available
              </span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>
              Each comprehensive 5-question AI Technical Interview costs 50 credits.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {onOpenCreditModal && (
            <button
              onClick={onOpenCreditModal}
              className="btn btn-sm btn-dark rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
              style={{ fontSize: '0.82rem' }}
            >
              <Coins size={14} className="text-amber-400" />
              <span>Refill Credits</span>
            </button>
          )}
          <button
            onClick={() => {
              if (onNavigateToInterview) {
                onNavigateToInterview();
              } else {
                onOpenMockTest();
              }
            }}
            className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
            style={{ fontSize: '0.82rem' }}
          >
            <span>Launch AI Interview</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. TOP ROW METRICS GRID (4 Columns: Readiness, Technical, HR, Practice Stats) */}
      <div className="row g-3 mb-4">
        {/* CARD 1: Interview Readiness */}
        <div className="col-12 col-md-6 col-xl-3">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
              >
                <User size={15} />
              </div>
              <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                Interview Readiness
              </h6>
            </div>

            {/* Circular Gauge */}
            <div className="d-flex flex-column align-items-center justify-content-center my-3">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '115px', height: '115px' }}>
                <svg width="115" height="115" className="rotate-neg-90">
                  <circle
                    cx="57.5"
                    cy="57.5"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="57.5"
                    cy="57.5"
                    r={radius}
                    stroke="#2563EB"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <div className="fw-bold lh-1" style={{ fontSize: '1.85rem', color: '#0F172A' }}>
                    {data.interviewReadiness?.overallScore ?? 78}
                  </div>
                  <div className="text-secondary small mt-0.5" style={{ fontSize: '0.72rem' }}>
                    / 100
                  </div>
                </div>
              </div>

              {/* Status Below Ring */}
              <div className="text-center mt-1">
                <div className="fw-bold" style={{ color: '#D97706', fontSize: '0.82rem' }}>
                  {data.interviewReadiness?.status || 'Almost Ready'}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.74rem' }}>
                  {data.interviewReadiness?.description || 'Keep practicing to reach 90+'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Latest Technical Interview Score */}
        <div className="col-12 col-md-6 col-xl-3">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <Code2 size={16} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                  Technical Interview
                </h6>
              </div>
              <span className="badge rounded-pill fw-semibold px-2 py-0.5" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem', border: '1px solid #BFDBFE' }}>
                Technical
              </span>
            </div>

            {/* Score Content */}
            <div className="d-flex flex-column align-items-center justify-content-center my-auto py-2 text-center">
              <div className="d-flex align-items-center gap-2 mb-1">
                <BarChart3 size={24} style={{ color: '#2563EB' }} />
                <span className="fw-bold" style={{ fontSize: '2.1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {data.latestTechnicalInterview ? `${data.latestTechnicalInterview.score}%` : (data.recentInterview?.mode !== 'HR' && data.recentInterview?.score ? `${data.recentInterview.score}%` : '85%')}
                </span>
              </div>
              <div className="fw-semibold text-truncate max-w-xs" style={{ color: '#0F172A', fontSize: '0.85rem' }}>
                {data.latestTechnicalInterview?.role || data.recentInterview?.role || 'Full Stack Engineer'}
              </div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                Completed: {data.latestTechnicalInterview?.date || data.recentInterview?.date || 'Recent'}
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => {
                setSelectedInterview(data.latestTechnicalInterview || data.recentInterview);
                setIsScorecardModalOpen(true);
              }}
              className="btn btn-sm w-100 text-white fw-semibold rounded-2 py-2"
              style={{
                backgroundColor: '#2563EB',
                fontSize: '0.82rem',
                border: 'none'
              }}
            >
              View Technical Scorecard
            </button>
          </div>
        </div>

        {/* CARD 3: Latest HR Interview Score */}
        <div className="col-12 col-md-6 col-xl-3">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                >
                  <UserCheck size={16} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                  HR Interview
                </h6>
              </div>
              <span className="badge rounded-pill fw-semibold px-2 py-0.5" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', fontSize: '0.7rem', border: '1px solid #DDD6FE' }}>
                Behavioral
              </span>
            </div>

            {/* Score Content */}
            <div className="d-flex flex-column align-items-center justify-content-center my-auto py-2 text-center">
              <div className="d-flex align-items-center gap-2 mb-1">
                <BarChart3 size={24} style={{ color: '#7C3AED' }} />
                <span className="fw-bold" style={{ fontSize: '2.1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {data.latestHrInterview ? `${data.latestHrInterview.score}%` : (data.recentInterview?.mode === 'HR' && data.recentInterview?.score ? `${data.recentInterview.score}%` : (data.stats.interviewsTaken > 1 ? '88%' : '--%'))}
                </span>
              </div>
              <div className="fw-semibold text-truncate max-w-xs" style={{ color: '#0F172A', fontSize: '0.85rem' }}>
                {data.latestHrInterview?.role || (data.latestHrInterview ? 'HR Behavioral Interview' : 'Ready for HR Assessment')}
              </div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                {data.latestHrInterview ? `Completed: ${data.latestHrInterview.date}` : '5 progressive HR questions'}
              </div>
            </div>

            {/* View Details or Start HR Button */}
            {data.latestHrInterview ? (
              <button
                onClick={() => {
                  setSelectedInterview(data.latestHrInterview);
                  setIsScorecardModalOpen(true);
                }}
                className="btn btn-sm w-100 text-white fw-semibold rounded-2 py-2"
                style={{
                  backgroundColor: '#7C3AED',
                  fontSize: '0.82rem',
                  border: 'none'
                }}
              >
                View HR Scorecard
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onNavigateToInterview) onNavigateToInterview();
                  else onOpenMockTest();
                }}
                className="btn btn-sm w-100 fw-semibold rounded-2 py-2 border"
                style={{
                  backgroundColor: '#FAF5FF',
                  color: '#7C3AED',
                  borderColor: '#DDD6FE',
                  fontSize: '0.82rem'
                }}
              >
                Take HR Interview
              </button>
            )}
          </div>
        </div>

        {/* CARD 4: 2 Stat Metric Cards & Quick Launcher */}
        <div className="col-12 col-md-6 col-xl-3 d-flex flex-column gap-2.5">
          {/* Stat 1: Interviews Taken */}
          <div 
            className="card p-2.5 px-3 bg-white rounded-3 flex-fill d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.75rem' }}>
                Total Interviews
              </span>
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
              >
                <Calendar size={13} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 my-0.5">
              <span className="fw-bold" style={{ fontSize: '1.45rem', color: '#0F172A' }}>
                {data.stats.interviewsTaken}
              </span>
              <span className="small fw-medium" style={{ color: '#10B981', fontSize: '0.7rem' }}>
                {data.stats.interviewsDelta}
              </span>
            </div>
          </div>

          {/* Stat 2: Practice Time */}
          <div 
            className="card p-2.5 px-3 bg-white rounded-3 flex-fill d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.75rem' }}>
                Practice Time
              </span>
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px', backgroundColor: '#F3E8FF', color: '#9333EA' }}
              >
                <Clock size={13} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 my-0.5">
              <span className="fw-bold" style={{ fontSize: '1.45rem', color: '#0F172A' }}>
                {data.stats.practiceTimeHours} hrs
              </span>
              <span className="small fw-medium" style={{ color: '#10B981', fontSize: '0.7rem' }}>
                {data.stats.practiceTimeDelta}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 RECENT INTERVIEW PERFORMANCE & HISTORY */}
      <div className="card bg-white border rounded-3 p-3.5 mb-4 shadow-2xs">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark fs-6">
                Recent Interview History &amp; Performance
              </h6>
              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                Technical &amp; HR
              </span>
            </div>
            <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.8rem' }}>
              Track completed interview sessions, performance scores out of 100, and access detailed question evaluations.
            </p>
          </div>
          <button
            onClick={() => {
              if (onNavigateToInterview) onNavigateToInterview();
              else onOpenMockTest();
            }}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1.5 flex-shrink-0"
            style={{ fontSize: '0.78rem' }}
          >
            <span>Take Another Interview</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {data.recentInterviewHistory && data.recentInterviewHistory.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
              <thead className="table-light">
                <tr>
                  <th scope="col" className="fw-semibold text-secondary py-2">Interview Type</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Target Role</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Score</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Completion Date</th>
                  <th scope="col" className="fw-semibold text-secondary text-end py-2">Detailed Results</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInterviewHistory.map((inv: any, idx: number) => {
                  const isHr = inv.mode === 'HR' || inv.title?.includes('HR');
                  const score100 = inv.score || Math.round((inv.rawScore || 0) * 10) || 80;
                  return (
                    <tr key={inv.id || idx}>
                      <td className="py-2.5">
                        <span 
                          className="badge rounded-pill fw-semibold px-2.5 py-1"
                          style={{
                            backgroundColor: isHr ? '#F3E8FF' : '#EFF6FF',
                            color: isHr ? '#7C3AED' : '#2563EB',
                            border: `1px solid ${isHr ? '#DDD6FE' : '#BFDBFE'}`,
                            fontSize: '0.74rem'
                          }}
                        >
                          {isHr ? 'HR & Behavioral' : 'Technical'}
                        </span>
                      </td>
                      <td className="py-2.5 fw-semibold text-dark">
                        {inv.role || inv.title?.replace(/\s*\((Technical|HR)\).*/i, '') || 'Full Stack Engineer'}
                      </td>
                      <td className="py-2.5">
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: '140px' }}>
                          <span 
                            className={`fw-bold ${
                              score100 >= 80 ? 'text-success' : score100 >= 65 ? 'text-primary' : 'text-warning'
                            }`}
                          >
                            {score100}%
                          </span>
                          <div className="progress flex-grow-1" style={{ height: '5px' }}>
                            <div 
                              className={`progress-bar ${
                                score100 >= 80 ? 'bg-success' : score100 >= 65 ? 'bg-primary' : 'bg-warning'
                              }`} 
                              style={{ width: `${score100}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-secondary small">
                        {inv.date || 'Recent'}
                      </td>
                      <td className="py-2.5 text-end">
                        <button
                          onClick={() => {
                            setSelectedInterview(inv);
                            setIsScorecardModalOpen(true);
                          }}
                          className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 text-primary fw-medium"
                          style={{ fontSize: '0.76rem' }}
                        >
                          View Scorecard
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-3 bg-light-subtle">
            <Target size={28} className="text-secondary opacity-50 mb-2" />
            <p className="fw-semibold text-dark mb-1 small">No Interview Sessions Completed Yet</p>
            <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
              Launch your first 5-question Technical or HR interview to get detailed AI feedback, metrics, and scorecards!
            </p>
            <button
              onClick={() => {
                if (onNavigateToInterview) onNavigateToInterview();
                else onOpenMockTest();
              }}
              className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold"
              style={{ fontSize: '0.8rem' }}
            >
              Start First Interview
            </button>
          </div>
        )}
      </div>

      {/* 2.6 4-TIER CODING ASSESSMENT PERFORMANCE & HISTORY */}
      <div className="card bg-white border rounded-3 p-3.5 mb-4 shadow-2xs">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark fs-6">
                4-Tier Coding Assessment Performance (100 Marks)
              </h6>
              <span className="badge rounded-pill border px-2 py-0.5" style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0' }}>
                Algorithmic &amp; DSA
              </span>
            </div>
            <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.8rem' }}>
              Rigorous test-case evaluations across Easy (10m), Medium (20m), Medium-Hard (30m), and Star Challenge (40m).
            </p>
          </div>
          <button
            onClick={() => {
              if (onNavigateToCoding) onNavigateToCoding();
            }}
            className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1.5 flex-shrink-0"
            style={{ fontSize: '0.78rem' }}
          >
            <Code2 size={13} />
            <span>Launch Coding Assessment</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4 Summary Metric Pills */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="p-2.5 rounded-2 border bg-light-subtle text-center">
              <span className="text-secondary small d-block" style={{ fontSize: '0.73rem' }}>Latest Score</span>
              <span className="fw-bold text-dark fs-6">
                {data.codingMetrics?.latestScore !== null && data.codingMetrics?.latestScore !== undefined
                  ? `${data.codingMetrics.latestScore} / 100`
                  : '-- / 100'}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2.5 rounded-2 border bg-light-subtle text-center">
              <span className="text-secondary small d-block" style={{ fontSize: '0.73rem' }}>Highest Score</span>
              <span className="fw-bold text-success fs-6">
                {data.codingMetrics?.highestScore !== null && data.codingMetrics?.highestScore !== undefined
                  ? `${data.codingMetrics.highestScore} / 100`
                  : '-- / 100'}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2.5 rounded-2 border bg-light-subtle text-center">
              <span className="text-secondary small d-block" style={{ fontSize: '0.73rem' }}>Average Score</span>
              <span className="fw-bold text-primary fs-6">
                {data.codingMetrics?.averageScore !== null && data.codingMetrics?.averageScore !== undefined
                  ? `${data.codingMetrics.averageScore} / 100`
                  : '-- / 100'}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2.5 rounded-2 border bg-light-subtle text-center">
              <span className="text-secondary small d-block" style={{ fontSize: '0.73rem' }}>Assessments Completed</span>
              <span className="fw-bold text-dark fs-6">
                {data.codingMetrics?.totalAssessments || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty-Wise Performance Breakdown & Identified Weak Areas */}
        {data.codingMetrics && data.codingMetrics.totalAssessments > 0 && data.codingMetrics.difficultyPerformance && (
          <div className="p-3 mb-3 rounded-2 border bg-light-subtle">
            <div className="d-flex justify-content-between align-items-center mb-2.5">
              <span className="fw-semibold text-dark small" style={{ fontSize: '0.8rem' }}>
                Difficulty-Wise Performance Breakdown (Averages)
              </span>
              <span className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                Calculated across {data.codingMetrics.totalAssessments} assessment{data.codingMetrics.totalAssessments > 1 ? 's' : ''}
              </span>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6 col-md-3">
                <div className="p-2 rounded border bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.73rem' }}>
                    <span className="text-secondary">Easy (10m)</span>
                    <span className="fw-bold text-success">{data.codingMetrics.difficultyPerformance.easyAvg} / 10</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${Math.min(100, (data.codingMetrics.difficultyPerformance.easyAvg / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded border bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.73rem' }}>
                    <span className="text-secondary">Medium (20m)</span>
                    <span className="fw-bold text-primary">{data.codingMetrics.difficultyPerformance.mediumAvg} / 20</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${Math.min(100, (data.codingMetrics.difficultyPerformance.mediumAvg / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded border bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.73rem' }}>
                    <span className="text-secondary">Med-Hard (30m)</span>
                    <span className="fw-bold text-warning">{data.codingMetrics.difficultyPerformance.mediumHardAvg} / 30</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${Math.min(100, (data.codingMetrics.difficultyPerformance.mediumHardAvg / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded border bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.73rem' }}>
                    <span className="text-secondary">Star Challenge (40m)</span>
                    <span className="fw-bold" style={{ color: '#7C3AED' }}>{data.codingMetrics.difficultyPerformance.starChallengeAvg} / 40</span>
                  </div>
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar"
                      style={{ backgroundColor: '#7C3AED', width: `${Math.min(100, (data.codingMetrics.difficultyPerformance.starChallengeAvg / 40) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {data.codingMetrics.history[0]?.weakAreas && data.codingMetrics.history[0].weakAreas.length > 0 && (
              <div className="d-flex flex-wrap align-items-center gap-1.5 pt-1" style={{ fontSize: '0.76rem' }}>
                <span className="fw-semibold text-danger">Identified Weak Areas:</span>
                {data.codingMetrics.history[0].weakAreas.map((area, aIdx) => (
                  <span key={aIdx} className="badge bg-danger-subtle text-danger border border-danger-subtle">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Table or Clean Empty State */}
        {data.codingMetrics?.history && data.codingMetrics.history.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
              <thead className="table-light">
                <tr>
                  <th scope="col" className="fw-semibold text-secondary py-2">Assessment</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Tier Breakdown</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Score</th>
                  <th scope="col" className="fw-semibold text-secondary py-2">Completion Date</th>
                  <th scope="col" className="fw-semibold text-secondary text-end py-2">Scorecard</th>
                </tr>
              </thead>
              <tbody>
                {data.codingMetrics.history.map((rec, idx) => {
                  const score100 = rec.score ?? rec.totalScore ?? 0;
                  return (
                    <tr key={rec.id || idx}>
                      <td className="py-2.5 fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <Code2 size={15} className="text-success" />
                          <span>{rec.title || '4-Tier Coding Assessment'}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="d-flex align-items-center gap-1.5 flex-wrap" style={{ fontSize: '0.72rem' }}>
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            Easy: {rec.easyScore}/10
                          </span>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            Med: {rec.mediumScore}/20
                          </span>
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                            Med-Hard: {rec.mediumHardScore}/30
                          </span>
                          <span className="badge border" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', borderColor: '#DDD6FE' }}>
                            Star: {rec.starChallengeScore}/40
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: '140px' }}>
                          <span
                            className={`fw-bold ${
                              score100 >= 80 ? 'text-success' : score100 >= 60 ? 'text-primary' : 'text-warning'
                            }`}
                          >
                            {score100}/100
                          </span>
                          <div className="progress flex-grow-1" style={{ height: '5px' }}>
                            <div
                              className={`progress-bar ${
                                score100 >= 80 ? 'bg-success' : score100 >= 60 ? 'bg-primary' : 'bg-warning'
                              }`}
                              style={{ width: `${score100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-secondary small">
                        {rec.date || 'Recent'}
                      </td>
                      <td className="py-2.5 text-end">
                        <button
                          onClick={() => {
                            setSelectedCodingAssessment(rec);
                            setIsCodingScorecardOpen(true);
                          }}
                          className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 text-success fw-medium"
                          style={{ fontSize: '0.76rem' }}
                        >
                          View Scorecard
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-3 bg-light-subtle">
            <Code2 size={30} className="text-secondary opacity-50 mb-2" />
            <p className="fw-semibold text-dark mb-1 small">No Coding Assessments Completed Yet</p>
            <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
              Solve 4 progressive questions across Easy, Medium, Medium-Hard, and Star Challenge tiers with authoritative test-case scoring.
            </p>
            <button
              onClick={() => {
                if (onNavigateToCoding) onNavigateToCoding();
              }}
              className="btn btn-sm btn-success rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.8rem' }}
            >
              <Code2 size={14} />
              <span>Take 4-Tier Assessment (100 Marks)</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MIDDLE ROW (3 Columns) */}
      <div className="row g-3 mb-4">
        {/* COLUMN 1: Skill Overview */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <BarChart3 size={17} style={{ color: '#2563EB' }} />
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                  Skill Overview
                </h6>
              </div>
              <button
                onClick={onNavigateToProfile}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ color: '#2563EB', fontSize: '0.78rem' }}
              >
                View All
              </button>
            </div>

            {/* Skill Bars List */}
            <div className="d-flex flex-column gap-3 my-auto py-1">
              {skillsList.map((skill) => (
                <div key={skill.name} className="d-flex align-items-center justify-content-between gap-2">
                  <span className="fw-medium text-truncate" style={{ width: '105px', fontSize: '0.82rem', color: '#1E293B' }}>
                    {skill.name}
                  </span>
                  <div className="progress flex-grow-1" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      style={{ 
                        width: `${skill.percentage}%`,
                        backgroundColor: '#2563EB'
                      }} 
                    />
                  </div>
                  <span className="fw-semibold text-end text-secondary" style={{ width: '36px', fontSize: '0.78rem' }}>
                    {skill.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Weak Areas */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '22px', height: '22px', backgroundColor: '#FEE2E2', color: '#EF4444' }}
                >
                  <PenTool size={12} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                  Weak Areas
                </h6>
              </div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                Focus on these areas to improve
              </div>
            </div>

            {/* Numbered List */}
            <div className="d-flex flex-column gap-2.5 my-auto py-1">
              {displayWeakAreas.map((area, idx) => (
                <div 
                  key={area.id} 
                  className="d-flex align-items-center gap-2.5 p-2 rounded-2"
                  style={{ backgroundColor: '#FAF5F5' }}
                >
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#FEE2E2',
                      color: '#EF4444',
                      fontSize: '0.78rem'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="fw-medium text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                    {area.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Button */}
            <div className="pt-3">
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="btn btn-sm w-100 fw-semibold rounded-pill d-flex align-items-center justify-content-center gap-1.5"
                style={{
                  backgroundColor: '#FFF1F2',
                  color: '#E11D48',
                  border: '1px solid #FFE4E6',
                  fontSize: '0.8rem',
                  padding: '7px 14px'
                }}
              >
                <span>Get Personalized Study Plan</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Recommended Jobs */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '24px', height: '24px', backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  <Briefcase size={14} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                  Recommended Jobs
                </h6>
              </div>
              <button
                onClick={() => setIsJobsModalOpen(true)}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ color: '#2563EB', fontSize: '0.78rem' }}
              >
                View All
              </button>
            </div>

            {/* Jobs List */}
            <div className="d-flex flex-column gap-2.5 my-auto py-1">
              {/* Job 1: Microsoft */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <MicrosoftLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      Frontend Developer
                    </div>
                    <div className="text-secondary small mb-1.5" style={{ fontSize: '0.72rem' }}>
                      Microsoft &bull; Bengaluru, India
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['React', 'JavaScript', 'TypeScript'].map((skill) => (
                        <span 
                          key={skill} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.66rem', fontWeight: 500 }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '58px' }}>
                  <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                    92% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                  </span>
                  <button
                    onClick={() => setIsJobsModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Job
                  </button>
                </div>
              </div>

              {/* Job 2: Amazon */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <AmazonLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      Full Stack Developer
                    </div>
                    <div className="text-secondary small mb-1.5" style={{ fontSize: '0.72rem' }}>
                      Amazon &bull; Bengaluru, India
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['Node.js', 'React', 'AWS'].map((skill) => (
                        <span 
                          key={skill} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.66rem', fontWeight: 500 }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '58px' }}>
                  <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                    88% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                  </span>
                  <button
                    onClick={() => setIsJobsModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Job
                  </button>
                </div>
              </div>

              {/* Job 3: Google */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <GoogleLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      Software Engineer
                    </div>
                    <div className="text-secondary small mb-1.5" style={{ fontSize: '0.72rem' }}>
                      Google &bull; Hyderabad, India
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['Python', 'System Design', 'Backend'].map((skill) => (
                        <span 
                          key={skill} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.66rem', fontWeight: 500 }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '58px' }}>
                  <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                    84% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                  </span>
                  <button
                    onClick={() => setIsJobsModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW (3 Columns) */}
      <div className="row g-3 mb-2">
        {/* COLUMN 1: Recent Activity */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '24px', height: '24px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <Clock size={14} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                  Recent Activity
                </h6>
              </div>
              <button
                onClick={() => setIsScorecardModalOpen(true)}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ color: '#2563EB', fontSize: '0.78rem' }}
              >
                View All
              </button>
            </div>

            {/* Activity List */}
            <div className="d-flex flex-column gap-3 my-auto py-1">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((act: any, idx: number) => {
                  const isInterview = act.type === 'interview';
                  const isDsa = act.type === 'dsa';
                  const isResume = act.type === 'resume';
                  const isSkill = act.type === 'skill';
                  const isGithub = act.type === 'github';

                  const bgColor = isInterview ? '#DCFCE7' : isDsa ? '#ECFDF5' : isResume ? '#F3E8FF' : isSkill ? '#FFEDD5' : '#EFF6FF';
                  const fgColor = isInterview ? '#16A34A' : isDsa ? '#059669' : isResume ? '#9333EA' : isSkill ? '#EA580C' : '#2563EB';

                  return (
                    <div key={act.id || idx} className="d-flex align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2.5 text-truncate">
                        <div 
                          className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '28px', height: '28px', backgroundColor: bgColor, color: fgColor }}
                        >
                          {isInterview ? <Target size={15} /> : isDsa ? <Code2 size={15} /> : isResume ? <FileText size={15} /> : isSkill ? <Layers size={15} /> : isGithub ? <GitPullRequest size={15} /> : <Clock size={15} />}
                        </div>
                        <div className="text-truncate">
                          <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                            {act.title}
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                            {act.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                        {act.timeAgo || 'Recent'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-3 text-secondary small">
                  <Clock size={20} className="mb-1 opacity-50" />
                  <p className="mb-0">No recent activity recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Interview Score Progress */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                Interview Score Progress
              </h6>
              <button
                onClick={() => setIsScorecardModalOpen(true)}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ color: '#2563EB', fontSize: '0.78rem' }}
              >
                View All
              </button>
            </div>

            {/* Chart Area with Tooltip Pin */}
            <div className="position-relative my-2 py-2" style={{ height: '180px' }}>
              {/* Tooltip over the Sep point */}
              <div 
                className="position-absolute bg-white px-2 py-1 rounded-2 shadow-sm border text-center z-1"
                style={{
                  top: '15px',
                  right: '32px',
                  borderColor: '#E2E8F0',
                  fontSize: '0.72rem',
                  lineHeight: '1.2'
                }}
              >
                <div className="fw-bold text-dark">82%</div>
                <div className="text-secondary" style={{ fontSize: '0.65rem' }}>1 Sep 2025</div>
              </div>

              {/* Responsive SVG Chart */}
              <svg width="100%" height="100%" viewBox="0 0 320 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scoreProgressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((val, idx) => {
                  const y = 15 + idx * 25;
                  return (
                    <g key={val}>
                      <text x="5" y={y + 3} fill="#94A3B8" fontSize="8" fontFamily="system-ui">
                        {100 - val}
                      </text>
                      <line x1="28" y1={y} x2="310" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                  );
                })}

                {/* Bottom line at 0 */}
                <text x="10" y="143" fill="#94A3B8" fontSize="8" fontFamily="system-ui">0</text>
                <line x1="28" y1="140" x2="310" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Area Gradient Fill */}
                <path
                  d="M 50 86 Q 140 58 200 48 T 270 28 L 270 140 L 50 140 Z"
                  fill="url(#scoreProgressGrad)"
                />

                {/* Curve Line */}
                <path
                  d="M 50 86 Q 140 58 200 48 T 270 28"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Jul, Aug, Sep Dots */}
                {/* Jul (x: 50, y: 86) */}
                <circle cx="50" cy="86" r="3.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                {/* Aug (x: 180, y: 50) */}
                <circle cx="180" cy="50" r="3.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                {/* Sep (x: 270, y: 28) */}
                <circle cx="270" cy="28" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />

                {/* X-axis labels */}
                <text x="45" y="148" fill="#64748B" fontSize="9" fontFamily="system-ui">Jul</text>
                <text x="175" y="148" fill="#64748B" fontSize="9" fontFamily="system-ui">Aug</text>
                <text x="265" y="148" fill="#64748B" fontSize="9" fontFamily="system-ui">Sep</text>
              </svg>
            </div>

            {/* Great Progress Banner */}
            <div 
              className="p-2.5 rounded-2 d-flex align-items-center gap-2.5"
              style={{ backgroundColor: '#FEF3C7' }}
            >
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '28px', height: '28px', backgroundColor: '#FDE68A', color: '#D97706' }}
              >
                <Trophy size={16} />
              </div>
              <div>
                <div className="fw-bold" style={{ color: '#92400E', fontSize: '0.82rem' }}>
                  Great Progress!
                </div>
                <div style={{ color: '#B45309', fontSize: '0.72rem' }}>
                  Your average score has improved by 22% in the last month.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Recommended Open Source Issues */}
        <div className="col-12 col-lg-4">
          <div 
            className="card h-100 p-3 bg-white rounded-3 d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <GitHubIcon />
                <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.92rem' }}>
                  Recommended Open Source Issues
                </h6>
              </div>
              <button
                onClick={() => setIsOpenSourceModalOpen(true)}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ color: '#2563EB', fontSize: '0.78rem' }}
              >
                View All
              </button>
            </div>

            {/* Issues List */}
            <div className="d-flex flex-column gap-2.5 my-auto py-1">
              {/* Issue 1: React */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <ReactLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      React
                    </div>
                    <div className="text-secondary small mb-1.5 text-truncate" style={{ fontSize: '0.72rem' }}>
                      Improve documentation for hooks
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['good first issue', 'documentation', 'javascript'].map((tag) => (
                        <span 
                          key={tag} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.66rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '62px' }}>
                  <div className="d-flex align-items-center gap-1">
                    <span 
                      className="badge rounded-pill"
                      style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.65rem' }}
                    >
                      Beginner
                    </span>
                    <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                      94% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpenSourceModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Issue
                  </button>
                </div>
              </div>

              {/* Issue 2: Node.js */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <NodeLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      Node.js
                    </div>
                    <div className="text-secondary small mb-1.5 text-truncate" style={{ fontSize: '0.72rem' }}>
                      Fix memory leak in HTTP module
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['bug', 'good first issue', 'backend'].map((tag) => (
                        <span 
                          key={tag} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.66rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '62px' }}>
                  <div className="d-flex align-items-center gap-1">
                    <span 
                      className="badge rounded-pill"
                      style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.65rem' }}
                    >
                      Intermediate
                    </span>
                    <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                      89% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpenSourceModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Issue
                  </button>
                </div>
              </div>

              {/* Issue 3: TensorFlow */}
              <div 
                className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <TensorFlowLogo />
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.84rem' }}>
                      TensorFlow
                    </div>
                    <div className="text-secondary small mb-1.5 text-truncate" style={{ fontSize: '0.72rem' }}>
                      Add examples for new API
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      {['documentation', 'python', 'machine learning'].map((tag) => (
                        <span 
                          key={tag} 
                          className="px-1.5 py-0.5 rounded-pill"
                          style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.66rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0" style={{ height: '62px' }}>
                  <div className="d-flex align-items-center gap-1">
                    <span 
                      className="badge rounded-pill"
                      style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.65rem' }}
                    >
                      Beginner
                    </span>
                    <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.75rem' }}>
                      86% <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>Match</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpenSourceModalOpen(true)}
                    className="btn btn-sm px-2.5 py-0.5 rounded-pill fw-semibold"
                    style={{
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      backgroundColor: 'transparent',
                      fontSize: '0.72rem'
                    }}
                  >
                    View Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE ACTION MODALS */}


      <CodingInterviewModal
        isOpen={isCodingModalOpen}
        onClose={() => setIsCodingModalOpen(false)}
      />

      <CodingScorecardModal
        isOpen={isCodingScorecardOpen}
        onClose={() => {
          setIsCodingScorecardOpen(false);
          setSelectedCodingAssessment(null);
        }}
        assessment={selectedCodingAssessment || data.latestCodingAssessment || null}
        onRetake={() => {
          if (onNavigateToCoding) onNavigateToCoding();
        }}
      />

      <JobsExplorerModal
        isOpen={isJobsModalOpen}
        onClose={() => setIsJobsModalOpen(false)}
        jobs={recommendedJobs}
        onApplyJob={handleApplyJob}
      />

      <ScorecardDetailsModal
        isOpen={isScorecardModalOpen}
        onClose={() => {
          setIsScorecardModalOpen(false);
          setSelectedInterview(null);
        }}
        interview={selectedInterview || data.recentInterview}
        interviewId={selectedInterview?.id || data.recentInterview?.id}
      />

      <PracticeRoadmapModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        onStartCoding={() => setIsCodingModalOpen(true)}
      />

      <OpenSourceModal
        isOpen={isOpenSourceModalOpen}
        onClose={() => setIsOpenSourceModalOpen(false)}
        issues={recommendedIssues}
      />
    </div>
  );
};
