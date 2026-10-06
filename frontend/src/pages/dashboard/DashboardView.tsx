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
  PenTool
} from 'lucide-react';
import { ResumeAnalyzerModal } from '../../components/resume/ResumeAnalyzerModal.tsx';
import { CodingInterviewModal } from '../../components/coding/CodingInterviewModal.tsx';
import { JobsExplorerModal } from '../../components/job/JobsExplorerModal.tsx';

import { ScorecardDetailsModal } from '../../components/interview/ScorecardDetailsModal.tsx';
import { PracticeRoadmapModal } from '../../components/interview/PracticeRoadmapModal.tsx';
import { OpenSourceModal } from '../../components/github/OpenSourceModal.tsx';

interface DashboardViewProps {
  onOpenMockTest: () => void;
  onNavigateToProfile: () => void;
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
  onNavigateToProfile 
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
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

      {/* 2. TOP ROW METRICS GRID (4 Columns) */}
      <div className="row g-3 mb-4">
        {/* CARD 1: Interview Readiness */}
        <div className="col-12 col-sm-6 col-lg-3">
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
                    78
                  </div>
                  <div className="text-secondary small mt-0.5" style={{ fontSize: '0.72rem' }}>
                    / 100
                  </div>
                </div>
              </div>

              {/* Status Below Ring */}
              <div className="text-center mt-1">
                <div className="fw-bold" style={{ color: '#D97706', fontSize: '0.82rem' }}>
                  Almost Ready
                </div>
                <div className="text-secondary" style={{ fontSize: '0.74rem' }}>
                  Keep practicing to reach 90+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Recent Interview Score */}
        <div className="col-12 col-sm-6 col-lg-3">
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
                <Target size={15} />
              </div>
              <h6 className="fw-bold mb-0" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                Recent Interview Score
              </h6>
            </div>

            {/* Score Content */}
            <div className="d-flex flex-column align-items-center justify-content-center my-auto py-2 text-center">
              <div className="d-flex align-items-center gap-2 mb-1">
                <BarChart3 size={24} style={{ color: '#2563EB' }} />
                <span className="fw-bold" style={{ fontSize: '2.1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  82%
                </span>
              </div>
              <div className="fw-semibold" style={{ color: '#0F172A', fontSize: '0.85rem' }}>
                Technical Interview
              </div>
              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                1 Sep 2025
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => setIsScorecardModalOpen(true)}
              className="btn btn-sm w-100 text-white fw-semibold rounded-2 py-2"
              style={{
                backgroundColor: '#2563EB',
                fontSize: '0.82rem',
                border: 'none'
              }}
            >
              View Details
            </button>
          </div>
        </div>

        {/* CARD 3: 2 Small Stat Metric Cards */}
        <div className="col-12 col-sm-6 col-lg-2 d-flex flex-column gap-3">
          {/* Stat 1: Interviews Taken */}
          <div 
            className="card p-3 bg-white rounded-3 flex-fill d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: '26px', height: '26px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
              >
                <Calendar size={14} />
              </div>
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.75rem' }}>
                Interviews Taken
              </span>
            </div>
            <div className="my-1">
              <div className="fw-bold" style={{ fontSize: '1.6rem', color: '#0F172A' }}>
                12
              </div>
            </div>
            <div className="small fw-medium" style={{ color: '#10B981', fontSize: '0.72rem' }}>
              ↑ +3 this month
            </div>
          </div>

          {/* Stat 2: Practice Time */}
          <div 
            className="card p-3 bg-white rounded-3 flex-fill d-flex flex-column justify-content-between"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: '26px', height: '26px', backgroundColor: '#F3E8FF', color: '#9333EA' }}
              >
                <Clock size={14} />
              </div>
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.75rem' }}>
                Practice Time
              </span>
            </div>
            <div className="my-1">
              <div className="fw-bold" style={{ fontSize: '1.6rem', color: '#0F172A' }}>
                18 hrs
              </div>
            </div>
            <div className="small fw-medium" style={{ color: '#10B981', fontSize: '0.72rem' }}>
              ↑ +5 hrs this week
            </div>
          </div>
        </div>

        {/* CARD 4: Practice Smarter Hero Banner */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div 
            className="card h-100 p-4 text-white rounded-3 position-relative overflow-hidden d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 55%, #3B82F6 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            <div className="position-relative z-1 max-w-xs">
              <h5 className="fw-bold mb-1" style={{ fontSize: '1.25rem', lineHeight: '1.25' }}>
                Practice Smarter<br />Get Hired Faster
              </h5>
              <p className="text-white-50 mb-3" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                AI-powered interviews,<br />real career growth.
              </p>

              <button
                onClick={onOpenMockTest}
                className="btn btn-sm bg-white fw-semibold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ color: '#1D4ED8', fontSize: '0.8rem', border: 'none' }}
              >
                <span>Start a New Interview</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Right Graphic: Developer with Laptop & 4 Step Badges */}
            <div className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center pe-3 pe-md-4">
              {/* Developer Illustration SVG */}
              <div className="position-relative me-2 d-none d-sm-block">
                <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
                  {/* Chair & Desk */}
                  <path d="M75 95H10" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M20 95V108" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M65 95V108" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  {/* Person Body */}
                  <circle cx="50" cy="30" r="14" fill="#FDBA74" />
                  {/* Hair */}
                  <path d="M38 28C38 20 44 16 54 16C62 16 64 22 64 28C60 26 50 26 42 30Z" fill="#1E293B" />
                  {/* Torso */}
                  <path d="M36 50C36 44 42 42 50 42C58 42 64 44 64 50V75H36V50Z" fill="#38BDF8" />
                  {/* Arms */}
                  <path d="M36 52L26 68L38 72" stroke="#FDBA74" strokeWidth="4" strokeLinecap="round" />
                  <path d="M64 52L74 68L62 72" stroke="#FDBA74" strokeWidth="4" strokeLinecap="round" />
                  {/* Laptop */}
                  <polygon points="30,70 68,70 74,75 24,75" fill="#E2E8F0" />
                  <polygon points="34,50 64,50 68,70 30,70" fill="#0F172A" />
                  <polygon points="36,52 62,52 65,68 33,68" fill="#60A5FA" opacity="0.9" />
                  {/* Glow */}
                  <circle cx="49" cy="60" r="12" fill="#93C5FD" opacity="0.4" filter="blur(4px)" />
                </svg>
              </div>

              {/* 4 Vertical Process Pills */}
              <div className="d-flex flex-column gap-1.5 text-center">
                {['Learn', 'Practice', 'Improve', 'Succeed'].map((step) => (
                  <div
                    key={step}
                    className="px-2 py-0.5 rounded-pill text-white fw-semibold"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(4px)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
              {/* Item 1 */}
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#DCFCE7', color: '#16A34A' }}
                  >
                    <Code2 size={15} />
                  </div>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                      Completed Technical Interview
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      Scored 82% &bull; 1 Sep 2025
                    </div>
                  </div>
                </div>
                <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                  2 hours ago
                </span>
              </div>

              {/* Item 2 */}
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#F3E8FF', color: '#9333EA' }}
                  >
                    <FileText size={15} />
                  </div>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                      Analyzed Resume
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      Updated ATS score to 86%
                    </div>
                  </div>
                </div>
                <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                  1 day ago
                </span>
              </div>

              {/* Item 3 */}
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#FFEDD5', color: '#EA580C' }}
                  >
                    <Layers size={15} />
                  </div>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                      Practiced DSA Questions
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      Solved 5 questions on Arrays
                    </div>
                  </div>
                </div>
                <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                  2 days ago
                </span>
              </div>

              {/* Item 4 */}
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                  >
                    <User size={15} />
                  </div>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                      Added a new skill
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      MongoDB
                    </div>
                  </div>
                </div>
                <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                  3 days ago
                </span>
              </div>

              {/* Item 5 */}
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 text-truncate">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#F1F5F9', color: '#0F172A' }}
                  >
                    <GitHubIcon />
                  </div>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                      Connected GitHub
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      Analyzed 12 repositories
                    </div>
                  </div>
                </div>
                <span className="text-secondary flex-shrink-0 small" style={{ fontSize: '0.72rem' }}>
                  4 days ago
                </span>
              </div>
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
      <ResumeAnalyzerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      <CodingInterviewModal
        isOpen={isCodingModalOpen}
        onClose={() => setIsCodingModalOpen(false)}
      />

      <JobsExplorerModal
        isOpen={isJobsModalOpen}
        onClose={() => setIsJobsModalOpen(false)}
        jobs={recommendedJobs}
        onApplyJob={handleApplyJob}
      />

      <ScorecardDetailsModal
        isOpen={isScorecardModalOpen}
        onClose={() => setIsScorecardModalOpen(false)}
        interview={recentInterview}
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
