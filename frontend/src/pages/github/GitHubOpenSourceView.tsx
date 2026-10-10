import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  api,
  githubAuthStorage,
  type GitHubAnalysis,
  type GitHubIssueRecommendation,
  type WeaknessIssueRecommendation,
  type TechnicalAssessmentQuestion,
  type TechnicalAssessmentResult,
  type IdentifiedWeakness,
} from '../../services/api.ts';
import {
  GitPullRequest,
  GitBranch,
  GitFork,
  Star,
  AlertCircle,
  ExternalLink,
  Check,
  ArrowRight,
  Sparkles,
  Search,
  Bookmark,
  Loader2,
  MapPin,
  Building2,
  TrendingUp,
  BarChart3,
  Award,
  ChevronRight,
  Clock,
  CircleDot,
  Info,
  AlertTriangle,
  Github,
  CheckCircle2,
  XCircle,
  BookOpen,
  Code2,
  Terminal,
  Layers,
  RefreshCw,
  Lock,
  ChevronLeft,
  SlidersHorizontal,
  BookmarkCheck,
  FileCode,
  ShieldAlert,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface GitHubOpenSourceViewProps {
  onExploreIssues?: () => void;
  onNavigateToCoding?: () => void;
}

// 5-Stage User Journey Tabs
type MainTab = 'connect' | 'dashboard' | 'assessment' | 'results' | 'issues';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

// Loading skeleton component
const Skeleton: React.FC<{ width?: string; height?: string; className?: string; rounded?: boolean }> = ({
  width = '100%',
  height = '16px',
  className = '',
  rounded = false,
}) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width,
      height,
      backgroundColor: '#E2E8F0',
      borderRadius: rounded ? '50%' : '8px',
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
    }}
  />
);

// Format number
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// Time ago helper
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(diff / 2592000000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export const GitHubOpenSourceView: React.FC<GitHubOpenSourceViewProps> = ({
  onExploreIssues,
  onNavigateToCoding,
}) => {
  const { user } = useAuth();

  // --- Active Tab ---
  const [mainTab, setMainTab] = useState<MainTab>('connect');

  // --- Input & Validation ---
  const [usernameInput, setUsernameInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    username?: string;
    avatarUrl?: string;
    name?: string;
  } | null>(null);

  // --- Profile Analysis ---
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedUsername, setAnalyzedUsername] = useState<string>('');

  // --- OAuth State ---
  const [connectedUser, setConnectedUser] = useState<{
    username: string;
    name?: string;
    avatarUrl: string;
    bio?: string;
    publicRepos: number;
    connectedAt: string;
  } | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [showOAuthHelpModal, setShowOAuthHelpModal] = useState(false);
  const [oauthCallbackUrl, setOauthCallbackUrl] = useState<string>('http://localhost:3000/api/github/oauth/callback');

  // --- 10-Question Technical Assessment State ---
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<TechnicalAssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<TechnicalAssessmentResult | null>(null);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // --- Issues & Recommendations ---
  const [issues, setIssues] = useState<WeaknessIssueRecommendation[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueTotalCount, setIssueTotalCount] = useState(0);
  const [weaknessFilter, setWeaknessFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [issueSearchQuery, setIssueSearchQuery] = useState('');
  const [savedIssueIds, setSavedIssueIds] = useState<Set<string>>(new Set());

  // --- Notifications ---
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // --- Initial Check: OAuth Status & Active Session ---
  const checkOAuthStatus = useCallback(async () => {
    try {
      const [statusRes, userRes] = await Promise.all([
        api.github.getOAuthStatus().catch(() => ({ success: false, configured: false, callbackUrl: '' })),
        api.github.getConnectedOAuthUser().catch(() => ({ success: false, connected: false, user: null })),
      ]);

      if ('configured' in statusRes) {
        setOauthConfigured(Boolean(statusRes.configured));
        if (statusRes.callbackUrl) {
          setOauthCallbackUrl(statusRes.callbackUrl);
        }
      }

      if (userRes.connected && userRes.user) {
        setConnectedUser(userRes.user);
        if (!usernameInput) {
          setUsernameInput(userRes.user.username);
        }
      }
    } catch (err) {
      console.warn('OAuth status check warning:', err);
    }
  }, [usernameInput]);

  useEffect(() => {
    checkOAuthStatus();
  }, [checkOAuthStatus]);

  // --- Auto-fill from user profile ---
  useEffect(() => {
    if (user?.profile?.github && !usernameInput) {
      const clean = user.profile.github.replace(/https?:\/\/github\.com\/?/, '').replace(/\/$/, '');
      if (clean) setUsernameInput(clean);
    }
  }, [user, usernameInput]);

  // --- Listen for OAuth Popup Message & URL query params ---
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const { sessionToken, username, name, avatarUrl } = event.data;
        if (sessionToken) {
          githubAuthStorage.setSessionToken(sessionToken);
        }
        setConnectedUser({
          username,
          name,
          avatarUrl,
          publicRepos: 0,
          connectedAt: new Date().toISOString(),
        });
        setIsConnectingOAuth(false);
        showNotification('success', `GitHub account @${username} connected successfully!`);
        triggerAnalysis(username);
      } else if (event.data?.type === 'GITHUB_OAUTH_ERROR') {
        setIsConnectingOAuth(false);
        showNotification('error', `GitHub authorization failed: ${event.data.error}`);
      }
    }

    window.addEventListener('message', handleMessage);

    const params = new URLSearchParams(window.location.search);
    const ghConnected = params.get('github_connected');
    const ghUsername = params.get('username');
    const ghSessionToken = params.get('session_token');
    const ghOAuthError = params.get('github_oauth_error');

    if (ghConnected && ghUsername) {
      if (ghSessionToken) {
        githubAuthStorage.setSessionToken(ghSessionToken);
      }
      setConnectedUser({
        username: ghUsername,
        avatarUrl: `https://github.com/${ghUsername}.png`,
        publicRepos: 0,
        connectedAt: new Date().toISOString(),
      });
      showNotification('success', `Connected GitHub account @${ghUsername}!`);
      window.history.replaceState({}, document.title, window.location.pathname);
      triggerAnalysis(ghUsername);
    } else if (ghOAuthError) {
      showNotification('error', `GitHub OAuth error: ${ghOAuthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [showNotification]);

  // --- OAuth Handlers ---
  const handleConnectOAuth = async () => {
    setIsConnectingOAuth(true);
    try {
      const status = await api.github.getOAuthStatus();
      setOauthConfigured(Boolean(status.configured));
      if (status.callbackUrl) setOauthCallbackUrl(status.callbackUrl);

      if (!status.configured) {
        setIsConnectingOAuth(false);
        setShowOAuthHelpModal(true);
        return;
      }

      const res = await api.github.getOAuthAuthorizeUrl();
      if (!res.success || !res.authUrl) {
        throw new Error(res.message || 'Could not generate authorization URL.');
      }

      const width = 600;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        res.authUrl,
        'github_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = res.authUrl;
      } else {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsConnectingOAuth(false);
          }
        }, 1000);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to initiate GitHub authorization.');
      setIsConnectingOAuth(false);
    }
  };

  const handleDisconnectOAuth = async () => {
    try {
      await api.github.disconnectOAuthUser();
    } catch (e) {
      console.warn('Disconnect error:', e);
    } finally {
      githubAuthStorage.removeSessionToken();
      setConnectedUser(null);
      showNotification('info', 'GitHub account disconnected.');
    }
  };

  // --- Profile Validation ---
  const handleValidateUsername = async () => {
    if (!usernameInput.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await api.github.validateUsername(usernameInput.trim());
      setValidationResult(res);
      if (!res.valid) {
        showNotification('error', res.message || 'GitHub user not found.');
      }
    } catch (err: any) {
      setValidationResult({ valid: false });
      showNotification('error', err.message || 'Failed to validate username.');
    } finally {
      setIsValidating(false);
    }
  };

  // --- Profile Analysis ---
  const triggerAnalysis = async (targetHandle?: string, forceRefresh = false) => {
    const handle = targetHandle || validationResult?.username || usernameInput.trim();
    if (!handle) {
      showNotification('error', 'Please enter a GitHub username to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await api.github.analyzeProfile(handle, forceRefresh);
      if (res.success && res.data) {
        setAnalysis(res.data);
        setAnalyzedUsername(res.data.profile.login);
        setMainTab('dashboard');
        showNotification(
          'success',
          res.cached
            ? `Profile loaded from cache for @${res.data.profile.login}`
            : `Successfully analyzed @${res.data.profile.login}'s GitHub repositories!`
        );
      } else {
        throw new Error(res.message || 'Could not analyze GitHub profile.');
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze GitHub profile.');
      showNotification('error', err.message || 'Failed to analyze GitHub profile.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 10-Question Technical Assessment Handlers ---
  const handleStartAssessment = async () => {
    const handle = analyzedUsername || connectedUser?.username || usernameInput.trim();
    if (!handle) {
      showNotification('error', 'Please analyze a profile before starting the assessment.');
      return;
    }

    setIsStartingAssessment(true);
    try {
      const res = await api.github.startAssessment(handle);
      if (res.success && res.data) {
        setAssessmentId(res.data.assessmentId);
        setAssessmentQuestions(res.data.questions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setAssessmentResult(null);
        setMainTab('assessment');
        showNotification('success', `Generated 10 personalized questions for @${handle}!`);
      } else {
        throw new Error(res.message || 'Failed to generate assessment.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Could not start technical assessment.');
    } finally {
      setIsStartingAssessment(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).length;
  }, [selectedAnswers]);

  const handleSubmitAssessment = async () => {
    if (!assessmentId) return;

    setShowSubmitConfirmModal(false);
    setIsSubmittingAssessment(true);

    const answersPayload = assessmentQuestions.map(q => ({
      questionId: q.id,
      selectedOptionIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const res = await api.github.submitAssessment(assessmentId, answersPayload);
      if (res.success && res.data) {
        setAssessmentResult(res.data);
        setMainTab('results');
        showNotification(
          'success',
          `Assessment evaluated! Score: ${res.data.score}/${res.data.totalQuestions} (${res.data.percentage}%).`
        );
        // Automatically fetch open-source issues targeting the identified weaknesses
        fetchWeaknessIssues(res.data.weaknesses);
      } else {
        throw new Error(res.message || 'Failed to evaluate assessment.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to submit assessment.');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // --- Fetch Issues for Weaknesses ---
  const fetchWeaknessIssues = async (
    weaknessesList?: IdentifiedWeakness[],
    filterTopic = weaknessFilter,
    diff = difficultyFilter
  ) => {
    setIsLoadingIssues(true);
    setIssueError(null);

    const targetWeaknesses = weaknessesList || assessmentResult?.weaknesses || [];

    try {
      const res = await api.github.getWeaknessIssues({
        assessmentId: assessmentId || undefined,
        weaknesses: targetWeaknesses,
        username: analyzedUsername || connectedUser?.username,
        difficulty: diff === 'all' ? undefined : diff,
        weaknessTopic: filterTopic === 'all' ? undefined : filterTopic,
        perPage: 12,
      });

      if (res.success && res.data) {
        setIssues(res.data.issues);
        setIssueTotalCount(res.data.totalCount);
      } else {
        throw new Error(res.message || 'Failed to fetch issues.');
      }
    } catch (err: any) {
      setIssueError(err.message || 'Failed to fetch recommendations.');
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // Filtered issues for search query
  const filteredIssues = useMemo(() => {
    if (!issueSearchQuery.trim()) return issues;
    const q = issueSearchQuery.toLowerCase();
    return issues.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.repo.toLowerCase().includes(q) ||
        item.weaknessAddressed.toLowerCase().includes(q) ||
        item.labels.some(l => l.toLowerCase().includes(q))
    );
  }, [issues, issueSearchQuery]);

  const toggleSaveIssue = (id: string) => {
    setSavedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: '1400px' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-4 shadow-lg d-flex align-items-center gap-3 text-white`}
          style={{
            zIndex: 1090,
            backgroundColor:
              notification.type === 'success' ? '#059669' : notification.type === 'error' ? '#DC2626' : '#2563EB',
            maxWidth: '420px',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {notification.type === 'success' && <CheckCircle2 size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'info' && <Info size={20} />}
          <div className="flex-grow-1" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
            {notification.message}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setNotification(null)}
          />
        </div>
      )}

      {/* Main Feature Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge px-3 py-1 rounded-pill"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: '0.75rem' }}
            >
              SkillNexus Intelligence
            </span>
            {connectedUser && (
              <span
                className="badge px-2.5 py-1 rounded-pill d-flex align-items-center gap-1"
                style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.75rem' }}
              >
                <CheckCircle2 size={12} /> Connected: @{connectedUser.username}
              </span>
            )}
          </div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            GitHub Intelligence & Technical Assessment
          </h1>
          <p className="text-secondary mb-0" style={{ fontSize: '0.92rem' }}>
            Connect your account or analyze public repositories, take a personalized 10-question assessment, pinpoint weaknesses, and contribute to targeted open-source issues.
          </p>
        </div>

        {connectedUser ? (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => triggerAnalysis(connectedUser.username, true)}
              disabled={isAnalyzing}
              className="btn btn-outline-primary rounded-3 px-3 py-2 d-flex align-items-center gap-2"
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={isAnalyzing ? 'spin' : ''} />
              Refresh Analysis
            </button>
            <button
              type="button"
              onClick={handleDisconnectOAuth}
              className="btn btn-outline-danger rounded-3 px-3 py-2"
              style={{ fontSize: '0.85rem' }}
            >
              Disconnect
            </button>
          </div>
        ) : null}
      </div>

      {/* 5-Step Workflow Pipeline Navigation Tabs */}
      <div className="bg-white rounded-4 p-2 shadow-xs mb-4 border d-flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMainTab('connect')}
          className={`btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 transition-all ${
            mainTab === 'connect' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
          }`}
          style={{ fontSize: '0.85rem' }}
        >
          <Github size={16} />
          <span>1. Connect & Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('dashboard')}
          disabled={!analysis}
          className={`btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 transition-all ${
            mainTab === 'dashboard' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
          }`}
          style={{ fontSize: '0.85rem', opacity: !analysis ? 0.6 : 1 }}
        >
          <BarChart3 size={16} />
          <span>2. Profile Intelligence</span>
          {analysis && (
            <span className="badge rounded-pill bg-white text-primary px-2" style={{ fontSize: '0.7rem' }}>
              Ready
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (assessmentQuestions.length === 0) {
              handleStartAssessment();
            } else {
              setMainTab('assessment');
            }
          }}
          disabled={!analysis && assessmentQuestions.length === 0}
          className={`btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 transition-all ${
            mainTab === 'assessment' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
          }`}
          style={{ fontSize: '0.85rem', opacity: !analysis && assessmentQuestions.length === 0 ? 0.6 : 1 }}
        >
          <Code2 size={16} />
          <span>3. 10-Question Assessment</span>
          {assessmentQuestions.length > 0 && (
            <span
              className="badge rounded-pill px-2"
              style={{
                backgroundColor: mainTab === 'assessment' ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
                color: mainTab === 'assessment' ? '#FFFFFF' : '#4F46E5',
                fontSize: '0.7rem',
              }}
            >
              {answeredCount}/10
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('results')}
          disabled={!assessmentResult}
          className={`btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 transition-all ${
            mainTab === 'results' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
          }`}
          style={{ fontSize: '0.85rem', opacity: !assessmentResult ? 0.6 : 1 }}
        >
          <ShieldAlert size={16} />
          <span>4. Weakness Analysis</span>
          {assessmentResult && (
            <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-2" style={{ fontSize: '0.7rem' }}>
              {assessmentResult.weaknesses.length} Gaps
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab('issues');
            if (issues.length === 0) fetchWeaknessIssues();
          }}
          disabled={!analysis && !assessmentResult}
          className={`btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 transition-all ${
            mainTab === 'issues' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
          }`}
          style={{ fontSize: '0.85rem', opacity: !analysis && !assessmentResult ? 0.6 : 1 }}
        >
          <GitPullRequest size={16} />
          <span>5. Open Source Recommendations</span>
          {issues.length > 0 && (
            <span
              className="badge rounded-pill px-2"
              style={{
                backgroundColor: mainTab === 'issues' ? 'rgba(255,255,255,0.25)' : '#DCFCE7',
                color: mainTab === 'issues' ? '#FFFFFF' : '#15803D',
                fontSize: '0.7rem',
              }}
            >
              {issues.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONNECT & PROFILE TAB                                                   */}
      {/* ========================================================================= */}
      {mainTab === 'connect' && (
        <div className="row g-4">
          {/* Option A: Real GitHub OAuth Connection Card */}
          <div className="col-12 col-lg-6">
            <div className="card h-100 rounded-4 p-4 p-md-5 border shadow-sm bg-white d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#0F172A', color: '#FFFFFF', width: '56px', height: '56px' }}
                  >
                    <Github size={28} />
                  </div>
                  {connectedUser ? (
                    <span className="badge bg-success-subtle text-success-emphasis px-3 py-2 rounded-pill fw-semibold">
                      <CheckCircle2 size={13} className="me-1 inline" /> Account Authorized
                    </span>
                  ) : (
                    <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill fw-semibold">
                      Option A · Direct OAuth
                    </span>
                  )}
                </div>

                <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.35rem' }}>
                  Connect Your GitHub Account
                </h2>
                <p className="text-secondary mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Authorize SkillNexus AI with your personal GitHub account to inspect both public and private repositories with high API rate limits.
                </p>

                {connectedUser ? (
                  <div className="p-3 rounded-4 border bg-light mb-4 d-flex align-items-center gap-3">
                    <img
                      src={connectedUser.avatarUrl}
                      alt={connectedUser.username}
                      className="rounded-circle border"
                      style={{ width: '52px', height: '52px' }}
                    />
                    <div className="flex-grow-1">
                      <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                        {connectedUser.name || connectedUser.username}
                      </h4>
                      <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>
                        @{connectedUser.username} · Authorized via GitHub
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="d-flex align-items-center gap-2 mb-1 fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                      <Lock size={15} className="text-primary" />
                      Strict Security & Minimal Scopes
                    </div>
                    <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      We only request standard read permissions to fetch repository languages, topics, and stars. We never write code or modify your settings.
                    </p>
                  </div>
                )}
              </div>

              <div>
                {connectedUser ? (
                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      onClick={() => triggerAnalysis(connectedUser.username)}
                      disabled={isAnalyzing}
                      className="btn btn-primary rounded-3 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                      style={{ backgroundColor: '#2563EB', border: 'none' }}
                    >
                      {isAnalyzing ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                      Analyze My Connected Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectOAuth}
                      className="btn btn-outline-secondary rounded-3 py-2 fw-medium text-muted"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Disconnect GitHub Account
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectOAuth}
                    disabled={isConnectingOAuth}
                    className="btn w-100 rounded-3 py-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2 shadow-xs"
                    style={{ backgroundColor: '#0F172A', border: 'none', fontSize: '0.95rem' }}
                  >
                    {isConnectingOAuth ? (
                      <>
                        <Loader2 size={20} className="spin" />
                        Connecting to GitHub...
                      </>
                    ) : (
                      <>
                        <Github size={20} />
                        Connect GitHub Account
                      </>
                    )}
                  </button>
                )}

                {oauthConfigured === false && !connectedUser && (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowOAuthHelpModal(true)}
                      className="btn btn-link text-decoration-none p-0 text-secondary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Info size={13} className="me-1 inline" /> Admin OAuth Setup Guide
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Option B: Public Profile Analysis Card */}
          <div className="col-12 col-lg-6">
            <div className="card h-100 rounded-4 p-4 p-md-5 border shadow-sm bg-white d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF', width: '56px', height: '56px' }}
                  >
                    <Search size={28} />
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill fw-semibold">
                    Option B · Public Analysis
                  </span>
                </div>

                <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.35rem' }}>
                  Analyze Any Public Profile
                </h2>
                <p className="text-secondary mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Enter any public GitHub username or URL to analyze public repositories, tech stacks, and generate a personalized 10-question assessment immediately without OAuth login.
                </p>

                {/* Input and Verify */}
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold small mb-2">GitHub Username or Profile URL</label>
                  <div className="d-flex gap-2">
                    <div className="position-relative flex-grow-1">
                      <div className="position-absolute top-50 translate-middle-y ps-3 text-muted">
                        <Github size={18} />
                      </div>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={e => {
                          setUsernameInput(e.target.value);
                          setValidationResult(null);
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleValidateUsername()}
                        placeholder="e.g. torvalds or octocat"
                        className="form-control rounded-3 py-2.5 ps-5 border"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleValidateUsername}
                      disabled={isValidating || !usernameInput.trim()}
                      className="btn btn-outline-secondary rounded-3 px-3 fw-medium d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: '0.88rem' }}
                    >
                      {isValidating ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                      Verify
                    </button>
                  </div>
                </div>

                {/* Validation Status Box */}
                {validationResult && (
                  <div
                    className={`rounded-3 p-3 mb-4 d-flex align-items-center gap-3 border ${
                      validationResult.valid ? 'bg-success-subtle text-success-emphasis border-success-subtle' : 'bg-danger-subtle text-danger-emphasis border-danger-subtle'
                    }`}
                  >
                    {validationResult.valid ? (
                      <>
                        <img
                          src={validationResult.avatarUrl}
                          alt={validationResult.username}
                          className="rounded-circle border"
                          style={{ width: '42px', height: '42px' }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                            {validationResult.name || validationResult.username}
                          </div>
                          <div className="small text-muted">@{validationResult.username}</div>
                        </div>
                        <CheckCircle2 size={20} className="text-success" />
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} className="text-danger flex-shrink-0" />
                        <div className="small flex-grow-1">
                          {validationResult.message || 'GitHub username not found. Please verify spelling.'}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => triggerAnalysis(undefined, false)}
                  disabled={isAnalyzing || !usernameInput.trim()}
                  className="btn btn-primary w-100 rounded-3 py-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2 shadow-xs"
                  style={{ backgroundColor: '#2563EB', border: 'none', fontSize: '0.95rem' }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} className="spin" />
                      Analyzing Public Repositories...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Analyze GitHub Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PROFILE INTELLIGENCE DASHBOARD TAB                                      */}
      {/* ========================================================================= */}
      {mainTab === 'dashboard' && analysis && (
        <div className="d-flex flex-column gap-4">
          {/* Top Profile Header Card */}
          <div className="card rounded-4 border shadow-sm p-4 bg-white">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={analysis.profile.avatar_url}
                  alt={analysis.profile.login}
                  className="rounded-circle border"
                  style={{ width: '76px', height: '76px' }}
                />
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h2 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.4rem' }}>
                      {analysis.profile.name || analysis.profile.login}
                    </h2>
                    <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-2.5 py-1">
                      @{analysis.profile.login}
                    </span>
                  </div>
                  {analysis.profile.bio && (
                    <p className="text-secondary mb-1 mt-1 small" style={{ maxWidth: '600px' }}>
                      {analysis.profile.bio}
                    </p>
                  )}
                  <div className="d-flex align-items-center gap-3 text-muted small mt-1 flex-wrap">
                    {analysis.profile.company && (
                      <span className="d-flex align-items-center gap-1">
                        <Building2 size={13} /> {analysis.profile.company}
                      </span>
                    )}
                    {analysis.profile.location && (
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={13} /> {analysis.profile.location}
                      </span>
                    )}
                    <span className="d-flex align-items-center gap-1">
                      <Clock size={13} /> Account age: {analysis.stats.accountAgeYears} years
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-4 flex-wrap">
                <div className="text-center">
                  <div className="fw-bold text-dark fs-5">{analysis.profile.public_repos}</div>
                  <div className="text-muted small">Repositories</div>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-dark fs-5">{formatNumber(analysis.stats.totalStars)}</div>
                  <div className="text-muted small">Stars Earned</div>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-dark fs-5">{formatNumber(analysis.profile.followers)}</div>
                  <div className="text-muted small">Followers</div>
                </div>
                <a
                  href={analysis.profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2 small"
                >
                  <ExternalLink size={14} /> Open GitHub
                </a>
              </div>
            </div>
          </div>

          {/* High Impact CTA: Start Technical Assessment */}
          <div
            className="card rounded-4 p-4 text-white border-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #7C3AED 100%)',
            }}
          >
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div>
                <span className="badge rounded-pill bg-white text-primary px-3 py-1 fw-bold small mb-2">
                  Next Step in Career Pipeline
                </span>
                <h3 className="fw-bold mb-1" style={{ fontSize: '1.4rem' }}>
                  Ready to Test Your Engineering Skills?
                </h3>
                <p className="mb-0 text-blue-100" style={{ fontSize: '0.9rem', color: '#E0E7FF' }}>
                  We detected your core stack ({analysis.skills.languages.slice(0, 3).join(', ')}). Take our personalized 10-question assessment to pinpoint weaknesses and get tailored open-source contributions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartAssessment}
                disabled={isStartingAssessment}
                className="btn btn-light rounded-3 px-4 py-3 fw-bold text-primary d-flex align-items-center gap-2 shadow flex-shrink-0"
                style={{ fontSize: '0.95rem' }}
              >
                {isStartingAssessment ? (
                  <>
                    <Loader2 size={18} className="spin text-primary" />
                    Generating Assessment...
                  </>
                ) : (
                  <>
                    <Code2 size={18} />
                    Start My 10-Question Technical Assessment
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Languages & Skills Breakdown */}
          <div className="row g-4">
            {/* Language Breakdown */}
            <div className="col-12 col-lg-5">
              <div className="card rounded-4 border shadow-sm p-4 bg-white h-100">
                <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                  <BarChart3 size={18} className="text-primary" />
                  Language Distribution
                </h4>

                {/* Progress bar */}
                <div className="d-flex rounded-pill overflow-hidden mb-3" style={{ height: '10px' }}>
                  {analysis.languageStats.languages.slice(0, 6).map((lang, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${Math.max(lang.percentage, 2)}%`,
                        backgroundColor: lang.color,
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                {/* Language list */}
                <div className="d-flex flex-column gap-2">
                  {analysis.languageStats.languages.slice(0, 6).map((lang, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between small">
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: lang.color }} />
                        <span className="fw-medium text-dark">{lang.name}</span>
                      </div>
                      <span className="text-secondary fw-semibold">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Skills Categorized */}
            <div className="col-12 col-lg-7">
              <div className="card rounded-4 border shadow-sm p-4 bg-white h-100">
                <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                  <Terminal size={18} className="text-primary" />
                  Technical Stack Inferred from Repositories
                </h4>

                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="text-muted small fw-semibold mb-1.5">Languages Detected</div>
                    <div className="d-flex flex-wrap gap-1.5">
                      {analysis.skills.languages.map((l, i) => (
                        <span key={i} className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-1.5">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.skills.frameworks.length > 0 && (
                    <div>
                      <div className="text-muted small fw-semibold mb-1.5">Frameworks & Libraries</div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {analysis.skills.frameworks.map((f, i) => (
                          <span key={i} className="badge bg-indigo-subtle text-indigo-emphasis rounded-pill px-3 py-1.5" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.skills.tools.length > 0 && (
                    <div>
                      <div className="text-muted small fw-semibold mb-1.5">Tools & Infrastructure</div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {analysis.skills.tools.map((t, i) => (
                          <span key={i} className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-1.5">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.skills.databases.length > 0 && (
                    <div>
                      <div className="text-muted small fw-semibold mb-1.5">Databases & Storage</div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {analysis.skills.databases.map((d, i) => (
                          <span key={i} className="badge bg-success-subtle text-success-emphasis rounded-pill px-3 py-1.5">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Repositories Grid */}
          <div>
            <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
              <Layers size={20} className="text-primary" />
              Top Analyzed Repositories
            </h4>

            <div className="row g-3">
              {analysis.topRepos.map(repo => (
                <div key={repo.id} className="col-12 col-md-6 col-xl-4">
                  <div className="card rounded-4 border shadow-xs p-3 bg-white h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fw-bold text-dark text-decoration-none text-truncate"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {repo.name}
                        </a>
                        <ExternalLink size={13} className="text-muted flex-shrink-0" />
                      </div>
                      <p className="text-secondary small mb-3" style={{ minHeight: '38px', lineHeight: '1.4' }}>
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top small text-muted">
                      <span className="fw-medium text-dark">{repo.language || 'Code'}</span>
                      <div className="d-flex align-items-center gap-3">
                        <span className="d-flex align-items-center gap-1">
                          <Star size={13} className="text-warning" /> {repo.stargazers_count}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <GitFork size={13} /> {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 10-QUESTION PERSONALIZED TECHNICAL ASSESSMENT TAB                       */}
      {/* ========================================================================= */}
      {mainTab === 'assessment' && assessmentQuestions.length > 0 && (
        <div className="mx-auto" style={{ maxWidth: '850px' }}>
          {/* Assessment Header & Progress Bar */}
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 fw-bold">
                  Question {currentQuestionIndex + 1} of 10
                </span>
                <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-2.5 py-1">
                  {assessmentQuestions[currentQuestionIndex].category}
                </span>
                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 text-capitalize">
                  {assessmentQuestions[currentQuestionIndex].difficulty}
                </span>
              </div>
              <div className="text-muted small fw-medium">
                {answeredCount} of 10 Answered
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-100 bg-light rounded-pill overflow-hidden mb-3" style={{ height: '8px' }}>
              <div
                className="bg-primary rounded-pill transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / 10) * 100}%`,
                  height: '100%',
                }}
              />
            </div>

            {/* Quick Question Bubble Jump Bar */}
            <div className="d-flex align-items-center justify-content-center gap-1.5 flex-wrap">
              {assessmentQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className="btn p-0 rounded-circle fw-bold d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      fontSize: '0.8rem',
                      backgroundColor: isCurrent ? '#2563EB' : isAnswered ? '#DCFCE7' : '#F1F5F9',
                      color: isCurrent ? '#FFFFFF' : isAnswered ? '#15803D' : '#64748B',
                      border: isCurrent ? '2px solid #1D4ED8' : isAnswered ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {(() => {
            const activeQ = assessmentQuestions[currentQuestionIndex];
            const currentSelected = selectedAnswers[activeQ.id];

            return (
              <div className="card rounded-4 border shadow-sm p-4 p-md-5 bg-white mb-4">
                <div className="d-flex align-items-center gap-2 text-primary small fw-semibold mb-2">
                  <Sparkles size={16} /> Focus Topic: {activeQ.topic}
                </div>

                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.25rem', lineHeight: '1.5' }}>
                  {activeQ.question}
                </h3>

                {/* Optional Code Snippet */}
                {activeQ.codeSnippet && (
                  <div
                    className="p-3 rounded-3 mb-4 font-monospace text-white overflow-x-auto"
                    style={{ backgroundColor: '#0F172A', fontSize: '0.85rem', lineHeight: '1.5' }}
                  >
                    <pre className="mb-0" style={{ margin: 0 }}>
                      <code>{activeQ.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* 4 Multiple-Choice Options */}
                <div className="d-flex flex-column gap-2.5 mb-4">
                  {activeQ.options.map((option, optIdx) => {
                    const isSelected = currentSelected === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectAnswer(activeQ.id, optIdx)}
                        className={`p-3.5 rounded-3 border d-flex align-items-start gap-3 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary-subtle text-primary-emphasis shadow-xs' : 'bg-white hover-bg-light'
                        }`}
                        style={{ cursor: 'pointer', borderWidth: isSelected ? '2px' : '1px' }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold`}
                          style={{
                            width: '26px',
                            height: '26px',
                            fontSize: '0.8rem',
                            backgroundColor: isSelected ? '#2563EB' : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : '#64748B',
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="flex-grow-1" style={{ fontSize: '0.92rem', paddingTop: '2px', lineHeight: '1.5' }}>
                          {option}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.88rem' }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div className="d-flex align-items-center gap-2">
                    {currentQuestionIndex < 9 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(prev + 1, 9))}
                        className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-1.5 fw-semibold"
                        style={{ fontSize: '0.88rem', backgroundColor: '#2563EB' }}
                      >
                        Next Question <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSubmitConfirmModal(true)}
                        className="btn btn-success rounded-3 px-4 py-2 d-flex align-items-center gap-1.5 fw-semibold text-white shadow-xs"
                        style={{ fontSize: '0.88rem', backgroundColor: '#059669' }}
                      >
                        Review & Submit Assessment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WEAKNESS ANALYSIS & ASSESSMENT RESULTS TAB                              */}
      {/* ========================================================================= */}
      {mainTab === 'results' && assessmentResult && (
        <div className="d-flex flex-column gap-4">
          {/* Scorecard Hero */}
          <div
            className="card rounded-4 p-4 p-md-5 text-white border-0 shadow-sm"
            style={{
              background:
                assessmentResult.percentage >= 70
                  ? 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)'
                  : 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%)',
            }}
          >
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
              <div>
                <span className="badge rounded-pill bg-white text-dark px-3 py-1 fw-bold small mb-2">
                  Evaluation Complete · Verified from Answers
                </span>
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.6rem' }}>
                  Technical Score: {assessmentResult.score} / {assessmentResult.totalQuestions} ({assessmentResult.percentage}%)
                </h2>
                <p className="mb-0 text-white-50" style={{ fontSize: '0.92rem' }}>
                  Performance Tier: <strong className="text-white">{assessmentResult.performanceRating}</strong>. {assessmentResult.evaluationSummary}
                </p>
              </div>

              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('issues');
                    if (issues.length === 0) fetchWeaknessIssues();
                  }}
                  className="btn btn-light rounded-3 px-4 py-3 fw-bold text-dark d-flex align-items-center gap-2 shadow"
                  style={{ fontSize: '0.92rem' }}
                >
                  <GitPullRequest size={18} />
                  Explore Targeted Open-Source Issues
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Weaknesses vs Strengths Grid */}
          <div className="row g-4">
            {/* Weaknesses / Skill Gaps */}
            <div className="col-12 col-lg-7">
              <div className="card rounded-4 border shadow-sm p-4 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
                    <AlertTriangle size={18} className="text-danger" />
                    Identified Weaknesses & Skill Gaps ({assessmentResult.weaknesses.length})
                  </h4>
                  <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-2.5 py-1">
                    Needs Practice
                  </span>
                </div>

                <div className="d-flex flex-column gap-3">
                  {assessmentResult.weaknesses.map((w, idx) => (
                    <div key={idx} className="p-3.5 rounded-3 border bg-light">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                          {w.topic}
                        </div>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            w.learningPriority === 'High'
                              ? 'bg-danger-subtle text-danger-emphasis'
                              : 'bg-warning-subtle text-warning-emphasis'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {w.learningPriority} Priority
                        </span>
                      </div>

                      <div className="small text-danger mb-2 font-monospace" style={{ fontSize: '0.8rem' }}>
                        {w.evidence}
                      </div>

                      <p className="text-secondary small mb-2" style={{ lineHeight: '1.4' }}>
                        {w.whyItMatters}
                      </p>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                        <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-2">
                          Skill: {w.relatedSkill}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setWeaknessFilter(w.topic);
                            setMainTab('issues');
                            fetchWeaknessIssues(assessmentResult.weaknesses, w.topic);
                          }}
                          className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Find Issues for this Topic <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Category Breakdown */}
            <div className="col-12 col-lg-5">
              <div className="card rounded-4 border shadow-sm p-4 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
                    <CheckCircle2 size={18} className="text-success" />
                    Verified Strengths ({assessmentResult.strengths.length})
                  </h4>
                  <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-2.5 py-1">
                    Mastered
                  </span>
                </div>

                <div className="d-flex flex-column gap-2 mb-4">
                  {assessmentResult.strengths.length > 0 ? (
                    assessmentResult.strengths.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-3 border bg-light d-flex align-items-center gap-2">
                        <Check size={16} className="text-success flex-shrink-0" />
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-dark small">{s.topic}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {s.relatedSkill} · Verified by assessment
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted small">No verified strengths yet. Review the question breakdown below.</div>
                  )}
                </div>

                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>
                  Topic Performance
                </h5>
                <div className="d-flex flex-column gap-2">
                  {assessmentResult.topicBreakdown.map((tb, idx) => (
                    <div key={idx}>
                      <div className="d-flex align-items-center justify-content-between small mb-1">
                        <span className="text-dark fw-medium">{tb.topic}</span>
                        <span className="fw-bold">{tb.percentage}% ({tb.correct}/{tb.total})</span>
                      </div>
                      <div className="bg-light rounded-pill overflow-hidden" style={{ height: '6px' }}>
                        <div
                          className={`rounded-pill ${tb.percentage >= 70 ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${tb.percentage}%`, height: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Complete 10-Question Review */}
          <div className="card rounded-4 border shadow-sm p-4 bg-white">
            <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.15rem' }}>
              Full 10-Question Review & Explanations
            </h4>

            <div className="d-flex flex-column gap-3">
              {assessmentResult.questionResults.map((qr, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-4 border ${
                    qr.isCorrect ? 'border-success-subtle bg-light' : 'border-danger-subtle bg-light'
                  }`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark small">Q{qr.questionId}. {qr.topic}</span>
                      <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill" style={{ fontSize: '0.7rem' }}>
                        {qr.category}
                      </span>
                    </div>
                    {qr.isCorrect ? (
                      <span className="badge bg-success text-white rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1">
                        <Check size={12} /> Correct
                      </span>
                    ) : (
                      <span className="badge bg-danger text-white rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1">
                        <XCircle size={12} /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="fw-medium text-dark mb-2 small" style={{ lineHeight: '1.5' }}>
                    {qr.question}
                  </p>

                  <div className="p-3 rounded-3 bg-white border mb-2 small">
                    <div className="text-secondary mb-1">
                      Your answer:{' '}
                      <strong className={qr.isCorrect ? 'text-success' : 'text-danger'}>
                        {qr.userAnswerIndex >= 0 ? qr.options[qr.userAnswerIndex] : 'Unanswered'}
                      </strong>
                    </div>
                    {!qr.isCorrect && (
                      <div className="text-success fw-semibold">
                        Correct answer: {qr.options[qr.correctAnswerIndex]}
                      </div>
                    )}
                  </div>

                  <div className="small text-muted p-2 rounded-2" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <strong className="text-dark">Explanation:</strong> {qr.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OPEN SOURCE RECOMMENDATIONS TAB                                         */}
      {/* ========================================================================= */}
      {mainTab === 'issues' && (
        <div className="d-flex flex-column gap-4">
          {/* Header Banner */}
          <div className="card rounded-4 border shadow-sm p-4 bg-white">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3">
              <div>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.3rem' }}>
                  Personalized Open-Source Contributions
                </h3>
                <p className="text-secondary mb-0 small">
                  Live open issues from GitHub mapped directly to your verified skill gaps and detected repositories.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchWeaknessIssues()}
                disabled={isLoadingIssues}
                className="btn btn-outline-primary rounded-3 px-3 py-2 d-flex align-items-center gap-2 small flex-shrink-0"
              >
                <RefreshCw size={14} className={isLoadingIssues ? 'spin' : ''} />
                Refresh Issues
              </button>
            </div>

            {/* Filter Bar */}
            <div className="d-flex flex-wrap gap-2 align-items-center pt-3 border-top">
              {/* Weakness filter */}
              {assessmentResult && assessmentResult.weaknesses.length > 0 && (
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  <span className="text-muted small fw-semibold me-1">Target:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setWeaknessFilter('all');
                      fetchWeaknessIssues(assessmentResult.weaknesses, 'all');
                    }}
                    className={`btn btn-sm rounded-pill px-3 ${
                      weaknessFilter === 'all' ? 'btn-primary' : 'btn-light border text-secondary'
                    }`}
                  >
                    All Weaknesses
                  </button>
                  {assessmentResult.weaknesses.map((w, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setWeaknessFilter(w.topic);
                        fetchWeaknessIssues(assessmentResult.weaknesses, w.topic);
                      }}
                      className={`btn btn-sm rounded-pill px-3 ${
                        weaknessFilter === w.topic ? 'btn-primary' : 'btn-light border text-secondary'
                      }`}
                    >
                      {w.topic}
                    </button>
                  ))}
                </div>
              )}

              {/* Difficulty filter */}
              <div className="ms-md-auto d-flex align-items-center gap-2">
                <select
                  value={difficultyFilter}
                  onChange={e => {
                    const d = e.target.value as DifficultyFilter;
                    setDifficultyFilter(d);
                    fetchWeaknessIssues(undefined, weaknessFilter, d);
                  }}
                  className="form-select form-select-sm rounded-3 border"
                  style={{ width: '160px' }}
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner Friendly</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <div className="position-relative" style={{ width: '200px' }}>
                  <input
                    type="text"
                    value={issueSearchQuery}
                    onChange={e => setIssueSearchQuery(e.target.value)}
                    placeholder="Search issues..."
                    className="form-control form-control-sm rounded-3 ps-4"
                  />
                  <Search size={13} className="position-absolute top-50 translate-middle-y text-muted ps-1" style={{ left: '6px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Issue Cards Grid */}
          {isLoadingIssues ? (
            <div className="row g-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="col-12 col-md-6 col-xl-4">
                  <div className="card rounded-4 border p-4 bg-white">
                    <Skeleton width="60%" height="20px" className="mb-2" />
                    <Skeleton width="90%" height="16px" className="mb-3" />
                    <Skeleton width="40%" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className="row g-3">
              {filteredIssues.map(issue => {
                const isSaved = savedIssueIds.has(issue.id);

                return (
                  <div key={issue.id} className="col-12 col-md-6 col-xl-4">
                    <div className="card rounded-4 border shadow-xs p-4 bg-white h-100 d-flex flex-column justify-content-between">
                      <div>
                        {/* Top repo and action */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-2.5 py-1 small">
                            {issue.repo}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSaveIssue(issue.id)}
                            className="btn btn-sm btn-link p-0 text-muted"
                            title={isSaved ? 'Saved' : 'Save for later'}
                          >
                            {isSaved ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} />}
                          </button>
                        </div>

                        {/* Issue Title */}
                        <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '0.98rem', lineHeight: '1.4' }}>
                          #{issue.issueNumber} {issue.title}
                        </h4>

                        {/* Weakness addressed tag */}
                        {issue.weaknessAddressed && (
                          <div
                            className="p-2 rounded-2 mb-2.5 small"
                            style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.78rem' }}
                          >
                            <strong>Targets Skill Gap:</strong> {issue.weaknessAddressed}
                          </div>
                        )}

                        <p className="text-secondary small mb-3" style={{ lineHeight: '1.4' }}>
                          {issue.whyRecommended}
                        </p>

                        {/* Labels */}
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          <span
                            className="badge rounded-pill px-2 py-1"
                            style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '0.7rem' }}
                          >
                            {issue.difficultyEstimate} (Est.)
                          </span>
                          {issue.labels.slice(0, 2).map((l, idx) => (
                            <span key={idx} className="badge bg-light text-muted border rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: GitHub Link */}
                      <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                        <span className="text-muted small">Updated {timeAgo(issue.updated_at)}</span>
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
                          style={{ fontSize: '0.8rem', backgroundColor: '#2563EB' }}
                        >
                          Contribute on GitHub <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card rounded-4 border p-5 text-center bg-white">
              <GitPullRequest size={36} className="text-muted mx-auto mb-2" />
              <h5 className="fw-bold text-dark mb-1">No Matching Issues Found</h5>
              <p className="text-secondary small mb-3">
                Try clearing search terms or selecting a different weakness filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setWeaknessFilter('all');
                  setDifficultyFilter('all');
                  setIssueSearchQuery('');
                  fetchWeaknessIssues();
                }}
                className="btn btn-outline-primary rounded-3 px-3 py-2 small mx-auto"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Submit Assessment Confirmation                                      */}
      {/* ========================================================================= */}
      {showSubmitConfirmModal && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '440px', width: '100%', border: '1px solid #E2E8F0' }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-dark">
              <Award size={22} className="text-primary" />
              <h4 className="fw-bold mb-0" style={{ fontSize: '1.15rem' }}>Submit Assessment?</h4>
            </div>

            <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
              You have answered <strong>{answeredCount} of 10</strong> questions.
              {answeredCount < 10 && (
                <span className="d-block text-danger fw-semibold mt-1">
                  Note: You have {10 - answeredCount} unanswered questions that will be marked incorrect.
                </span>
              )}
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="btn btn-light rounded-3 px-3 py-2 small fw-medium"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={isSubmittingAssessment}
                className="btn btn-primary rounded-3 px-4 py-2 small fw-semibold text-white d-flex align-items-center gap-2"
                style={{ backgroundColor: '#2563EB' }}
              >
                {isSubmittingAssessment ? <Loader2 size={16} className="spin" /> : null}
                Yes, Submit for Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OAuth Admin Configuration Guidance (No Sandbox!)                   */}
      {/* ========================================================================= */}
      {showOAuthHelpModal && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '520px', width: '100%', border: '1px solid #E2E8F0' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-3 p-2 bg-dark text-white">
                  <Github size={20} />
                </div>
                <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.15rem' }}>
                  GitHub OAuth Configuration
                </h4>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowOAuthHelpModal(false)} />
            </div>

            <p className="text-secondary small mb-3" style={{ lineHeight: '1.5' }}>
              To allow every new user to authenticate their own GitHub accounts with one click, configure your GitHub OAuth App credentials in your server environment:
            </p>

            <div className="p-3 rounded-3 mb-3 font-monospace small" style={{ backgroundColor: '#0F172A', color: '#E2E8F0', fontSize: '0.8rem' }}>
              <div className="text-muted mb-1"># In backend/.env</div>
              <div className="text-success">GITHUB_CLIENT_ID=your_github_client_id</div>
              <div className="text-success">GITHUB_CLIENT_SECRET=your_github_client_secret</div>
              <div className="text-info">GITHUB_CALLBACK_URL={oauthCallbackUrl}</div>
            </div>

            <div className="p-3 rounded-3 bg-light border mb-4 small text-secondary">
              <strong>Quick Steps:</strong>
              <ol className="mb-0 ps-3 mt-1">
                <li>Create an OAuth App at <code>github.com/settings/developers</code></li>
                <li>Set Authorization callback URL to: <code>{oauthCallbackUrl}</code></li>
                <li>Paste Client ID and Client Secret into <code>backend/.env</code></li>
              </ol>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  await checkOAuthStatus();
                  showNotification('info', 'Checked backend configuration status.');
                  setShowOAuthHelpModal(false);
                }}
                className="btn btn-outline-primary rounded-3 px-3 py-2 small fw-semibold"
              >
                Re-check Status
              </button>
              <button
                type="button"
                onClick={() => setShowOAuthHelpModal(false)}
                className="btn btn-primary rounded-3 px-4 py-2 small fw-semibold text-white"
                style={{ backgroundColor: '#2563EB' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
