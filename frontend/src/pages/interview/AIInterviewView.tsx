import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  SKILL_QUESTION_DATABASE, 
  SkillQuestionPack, 
  InterviewSkillQuestion,
  getTimeLimitForLevel 
} from '../../data/interviewQuestions.ts';
import { 
  Headphones, 
  Lightbulb, 
  Code2, 
  UserCheck, 
  FileText, 
  Users, 
  Layers, 
  Target, 
  Briefcase, 
  BarChart2, 
  Brain, 
  Check, 
  ArrowRight, 
  ArrowDown, 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  Clock, 
  Sparkles, 
  Star, 
  Search, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  FileCheck,
  ChevronDown,
  X,
  Lock,
  Timer,
  AlertTriangle,
  Edit3,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Info,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { TechnicalInterviewStudio } from '../../components/interview/TechnicalInterviewStudio.tsx';

interface AIInterviewViewProps {
  onOpenUpgradeModal?: () => void;
  onNavigateToProfile?: () => void;
  onOpenCreditModal?: () => void;
  onOpenHistoryModal?: () => void;
}

interface SubmittedAnswerItem {
  questionId: string;
  skill: string;
  level: string;
  timeSpent: number;
  answer: string;
  status: 'submitted' | 'timed-out';
}

type MainTab = 'studio' | 'live-interview' | 'skill-matrix';

export const AIInterviewView: React.FC<AIInterviewViewProps> = ({
  onOpenUpgradeModal,
  onNavigateToProfile,
  onOpenCreditModal,
  onOpenHistoryModal,
}) => {
  const { user, updateProfileState } = useAuth();

  // Active View Tab: AI Smart Studio vs Timed Assessment vs Skill Question Matrix
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('studio');

  // Candidate context from Profile & Resume
  const candidateName = user?.profile?.name || 'Alex Sharma';
  const targetRole = user?.profile?.targetRole || 'Full Stack Developer';
  const targetCompany = user?.profile?.targetCompany || 'TechCorp Solutions';
  const userProfileJD = user?.profile?.targetJobDescription || 
    'Full Stack Developer role requiring React, Node.js, Express, MongoDB, RESTful APIs, Git, and Docker. Experience with responsive UI design, database optimization, and cloud architecture.';

  // Inline Profile JD Edit Modal
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [editableJdText, setEditableJdText] = useState(userProfileJD);

  // Skill Selection Filter for Interview Session
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');

  // Build the active flattened question list based on the filter
  const getActiveQuestions = (): InterviewSkillQuestion[] => {
    if (selectedSkillFilter === 'all') {
      // Return 3-level questions for all primary skills: Easy -> Medium -> Hard for each skill
      const list: InterviewSkillQuestion[] = [];
      SKILL_QUESTION_DATABASE.forEach(pack => {
        list.push(pack.questions.easy);
        list.push(pack.questions.medium);
        list.push(pack.questions.hard);
      });
      return list;
    } else {
      const pack = SKILL_QUESTION_DATABASE.find(p => p.skill.toLowerCase() === selectedSkillFilter.toLowerCase());
      if (pack) {
        return [pack.questions.easy, pack.questions.medium, pack.questions.hard];
      }
      return [
        SKILL_QUESTION_DATABASE[0].questions.easy,
        SKILL_QUESTION_DATABASE[0].questions.medium,
        SKILL_QUESTION_DATABASE[0].questions.hard
      ];
    }
  };

  const [activeQuestions, setActiveQuestions] = useState<InterviewSkillQuestion[]>(getActiveQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Current question helper
  const currentQuestion: InterviewSkillQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Per-Question Strict Countdown Timer State
  // Easy: 30s | Medium: 40s | Hard: 60s (1 min)
  const initialTimeForCurrent = getTimeLimitForLevel(currentQuestion?.level || 'easy');
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeForCurrent);
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(true);

  // Single Attempt History: Stores submitted answers (no revisiting previous questions)
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, SubmittedAnswerItem>>({});

  // Current User Answer Input / Speech Transcription
  const [userAnswerText, setUserAnswerText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [aiSpeechMuted, setAiSpeechMuted] = useState<boolean>(false);
  const [showKeyPoints, setShowKeyPoints] = useState<boolean>(false);

  // Status banners & feedback
  const [recentTimeoutNotice, setRecentTimeoutNotice] = useState<string | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState<boolean>(false);

  // Audio wave animation simulation
  const [waveformHeights, setWaveformHeights] = useState<number[]>([
    45, 70, 85, 40, 95, 65, 50, 80, 100, 60, 45, 90, 75, 55, 85, 60, 40, 70, 90, 50
  ]);

  // Overall session elapsed timer
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Synchronize questions when skill filter changes
  const handleSkillFilterChange = (newSkill: string) => {
    setSelectedSkillFilter(newSkill);
    const newPack = newSkill === 'all' 
      ? (() => {
          const list: InterviewSkillQuestion[] = [];
          SKILL_QUESTION_DATABASE.forEach(pack => {
            list.push(pack.questions.easy);
            list.push(pack.questions.medium);
            list.push(pack.questions.hard);
          });
          return list;
        })()
      : (() => {
          const pack = SKILL_QUESTION_DATABASE.find(p => p.skill.toLowerCase() === newSkill.toLowerCase());
          return pack ? [pack.questions.easy, pack.questions.medium, pack.questions.hard] : [];
        })();

    setActiveQuestions(newPack);
    setCurrentQuestionIndex(0);
    const firstQ = newPack[0];
    setTimeRemaining(firstQ ? getTimeLimitForLevel(firstQ.level) : 30);
    setUserAnswerText('');
    setSubmittedAnswers({});
    setIsInterviewActive(true);
    setIsRecording(true);
  };

  // Start specific 3-level test from the Matrix tab
  const handleLaunchSkill3LevelTest = (skillName: string) => {
    setActiveMainTab('live-interview');
    handleSkillFilterChange(skillName);
    const elem = document.getElementById('interview-in-progress-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  // Countdown timer tick effect: ticks down every second
  useEffect(() => {
    if (!isInterviewActive || showScorecardModal) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer reached 0! Trigger auto-submit timeout
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });

      // Waveform randomize when recording
      if (isRecording) {
        setWaveformHeights(
          Array.from({ length: 20 }, () => Math.floor(Math.random() * 65) + 30)
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewActive, currentQuestionIndex, showScorecardModal, isRecording]);

  // Session elapsed timer
  useEffect(() => {
    if (!isInterviewActive || showScorecardModal) return;
    const sessionTimer = setInterval(() => {
      setSessionSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(sessionTimer);
  }, [isInterviewActive, showScorecardModal]);

  // Format seconds to mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-submit when countdown hits 0 (STRICT TIME SLOT RULE)
  const handleAutoSubmitOnTimeout = () => {
    const q = activeQuestions[currentQuestionIndex];
    if (!q) return;

    const timeSpent = q.timeLimit;
    const ansText = userAnswerText.trim() || '[No spoken response captured within time limit]';

    // Record submission into locked history
    setSubmittedAnswers(prev => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        skill: q.skill,
        level: q.level,
        timeSpent,
        answer: ansText,
        status: 'timed-out'
      }
    }));

    setRecentTimeoutNotice(`Time expired for "${q.levelName} (${q.timeLimit}s)"! Automatically moved to next question. Past questions are locked.`);
    setTimeout(() => setRecentTimeoutNotice(null), 4500);

    // Proceed to next question (User CANNOT go to previous question)
    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQ = activeQuestions[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(getTimeLimitForLevel(nextQ.level));
      setUserAnswerText('');
      setIsRecording(true);
      setShowKeyPoints(false);
    } else {
      // Completed all questions in the test
      setIsInterviewActive(false);
      setShowScorecardModal(true);
    }
  };

  // Manual submit by user clicking "Submit Answer & Proceed"
  const handleSubmitAnswer = () => {
    const q = activeQuestions[currentQuestionIndex];
    if (!q) return;

    const timeSpent = q.timeLimit - timeRemaining;
    const ansText = userAnswerText.trim() || 'Candidate verbally confirmed answer with interviewer.';

    // Save into locked history
    setSubmittedAnswers(prev => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        skill: q.skill,
        level: q.level,
        timeSpent: Math.max(1, timeSpent),
        answer: ansText,
        status: 'submitted'
      }
    }));

    // Advance to next question (Forward-only, no going back)
    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQ = activeQuestions[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(getTimeLimitForLevel(nextQ.level));
      setUserAnswerText('');
      setIsRecording(true);
      setShowKeyPoints(false);
    } else {
      setIsInterviewActive(false);
      setShowScorecardModal(true);
    }
  };

  // Save updated Job Description in Profile
  const handleSaveProfileJd = () => {
    if (user?.profile) {
      updateProfileState({
        ...user.profile,
        targetJobDescription: editableJdText
      });
    }
    setIsJdModalOpen(false);
  };

  // Progress calculations
  const totalQuestions = activeQuestions.length;
  const answeredCount = Object.keys(submittedAnswers).length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex) / totalQuestions) * 100) : 0;

  // Level color & badge helpers
  const getLevelBadge = (level: 'easy' | 'medium' | 'hard') => {
    switch (level) {
      case 'easy':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
          label: 'Level 1: Easy • 30s limit'
        };
      case 'medium':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#2563EB',
          label: 'Level 2: Medium • 40s limit'
        };
      case 'hard':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#DC2626',
          label: 'Level 3: Hard • 1m limit'
        };
    }
  };

  const levelInfo = getLevelBadge(currentQuestion.level);

  // Timer urgency color
  const getTimerStyles = () => {
    if (timeRemaining <= 5) {
      return {
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#F87171',
        pulse: true
      };
    }
    if (timeRemaining <= 10) {
      return {
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FCD34D',
        pulse: false
      };
    }
    return {
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      pulse: false
    };
  };

  const timerStyle = getTimerStyles();

  return (
    <div className="container-fluid p-3 p-lg-4" style={{ maxWidth: '1440px' }}>
      {/* Timeout Alert Toast Notification */}
      {recentTimeoutNotice && (
        <div 
          className="alert alert-warning d-flex align-items-center justify-content-between p-2.5 px-3 mb-3 rounded-3 shadow-sm border-0"
          style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', color: '#92400E' }}
        >
          <div className="d-flex align-items-center gap-2">
            <Timer size={18} className="text-warning flex-shrink-0" />
            <span className="small fw-semibold">{recentTimeoutNotice}</span>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-sm" 
            onClick={() => setRecentTimeoutNotice(null)}
          />
        </div>
      )}

      {/* Top Banner: AI Interview Engine Header + Motivation Pill */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
            style={{
              width: '52px',
              height: '52px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: '#2563EB'
            }}
          >
            <Headphones size={28} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em', color: '#0F172A' }}>
                AI Interview Engine
              </h1>
              <span 
                className="badge rounded-pill fw-semibold px-2 py-0.5" 
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.72rem' }}
              >
                3-Level Skill Assessment
              </span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Personalized questions tailored to your <strong>Resume</strong> &amp; <strong>Job Description in Profile</strong> with timed single-attempt slots.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Studio vs Timed Assessment vs Question Bank) */}
        <div className="d-flex align-items-center gap-1.5 p-1 rounded-3 bg-light border shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMainTab('studio')}
            className={`btn btn-sm px-3 py-1.5 rounded-2 fw-semibold d-flex align-items-center gap-1.5 ${
              activeMainTab === 'studio' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
            }`}
            style={{ fontSize: '0.80rem' }}
          >
            <SparklesIcon size={14} />
            <span>AI Smart Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('live-interview')}
            className={`btn btn-sm px-3 py-1.5 rounded-2 fw-semibold d-flex align-items-center gap-1.5 ${
              activeMainTab === 'live-interview' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
            }`}
            style={{ fontSize: '0.80rem' }}
          >
            <Play size={14} />
            <span>Timed Assessment</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('skill-matrix')}
            className={`btn btn-sm px-3 py-1.5 rounded-2 fw-semibold d-flex align-items-center gap-1.5 ${
              activeMainTab === 'skill-matrix' ? 'btn-primary text-white shadow-xs' : 'btn-light text-secondary'
            }`}
            style={{ fontSize: '0.80rem' }}
          >
            <Layers size={14} />
            <span>Question Bank</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHT BANNER: RESUME & USER PROFILE JOB DESCRIPTION SYNC */}
      <div 
        className="card border rounded-3 p-3 mb-4 shadow-2xs"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          borderColor: '#DBEAFE'
        }}
      >
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-xs mt-0.5"
              style={{ width: '40px', height: '40px', backgroundColor: '#2563EB' }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                  Resume &amp; Profile Job Description Integration
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5" style={{ fontSize: '0.70rem' }}>
                  ✓ Dual Source Active
                </span>
              </div>
              <div className="text-secondary small d-flex flex-wrap align-items-center gap-x-3 gap-y-1" style={{ fontSize: '0.78rem' }}>
                <span><strong>Candidate:</strong> {candidateName} (8 Skills Extracted)</span>
                <span className="text-muted">•</span>
                <span><strong>Target Role:</strong> {targetRole} @ {targetCompany}</span>
                <span className="text-muted">•</span>
                <span className="text-truncate" style={{ maxWidth: '460px' }}>
                  <strong>Profile JD:</strong> {userProfileJD}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditableJdText(userProfileJD);
                setIsJdModalOpen(true);
              }}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium bg-white"
              style={{ fontSize: '0.78rem' }}
            >
              <Edit3 size={14} />
              <span>Edit Target JD</span>
            </button>
            {onNavigateToProfile && (
              <button
                type="button"
                onClick={onNavigateToProfile}
                className="btn btn-sm btn-light border d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium text-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <ExternalLink size={13} />
                <span>Open Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Strict Time Slot & Single Attempt Rules Bar */}
        <div 
          className="mt-2.5 pt-2.5 border-top d-flex flex-wrap align-items-center justify-content-between gap-2"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 small" style={{ fontSize: '0.76rem' }}>
            <span className="fw-bold text-dark d-flex align-items-center gap-1">
              <Timer size={14} className="text-primary" />
              Strict Time Slots:
            </span>
            <span className="badge rounded-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
              Easy: 30 Seconds
            </span>
            <span className="badge rounded-pill bg-blue-50 text-blue-700 border border-blue-200">
              Medium: 40 Seconds
            </span>
            <span className="badge rounded-pill bg-rose-50 text-rose-700 border border-rose-200">
              Hard: 1 Minute (60s)
            </span>
          </div>

          <div 
            className="d-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill small fw-semibold"
            style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', fontSize: '0.72rem' }}
          >
            <Lock size={12} />
            <span>Single Attempt Only: No Going Back to Previous Questions</span>
          </div>
        </div>
      </div>

      {/* VIEW TAB 0: AI SMART INTERVIEW STUDIO (TECHNICAL ENGINE) */}
      {activeMainTab === 'studio' && (
        <div className="mb-4">
          <TechnicalInterviewStudio
            onOpenCreditModal={onOpenCreditModal || (() => {})}
            onOpenHistoryModal={onOpenHistoryModal || (() => {})}
          />
        </div>
      )}

      {/* VIEW TAB 1: LIVE TIMED INTERVIEW CONSOLE */}
      {activeMainTab === 'live-interview' && (
        <div>
          {/* Active Interview Progress Console */}
          <div 
            className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden" 
            id="interview-in-progress-section"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
          >
            {/* Top Console Navigation & Header */}
            <div className="p-3 px-md-4 border-bottom bg-light bg-opacity-50">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span 
                      className="badge rounded-pill text-white fw-bold px-2 py-1"
                      style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
                    >
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span 
                      className="badge rounded-pill fw-semibold px-2 py-1"
                      style={{ 
                        backgroundColor: levelInfo.bg, 
                        color: levelInfo.text, 
                        border: `1px solid ${levelInfo.border}`,
                        fontSize: '0.72rem'
                      }}
                    >
                      {levelInfo.label}
                    </span>
                    <span 
                      className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Skill: {currentQuestion.skill}
                    </span>
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                    {currentQuestion.context} &bull; <span className="text-primary">{currentQuestion.jdAlignment}</span>
                  </div>
                </div>

                {/* Question Filter Dropdown & Countdown Timer Box */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  {/* Skill track selector */}
                  <div className="d-flex align-items-center gap-1.5">
                    <label className="small text-secondary fw-semibold mb-0" style={{ fontSize: '0.74rem' }}>
                      Skill:
                    </label>
                    <select
                      className="form-select form-select-sm rounded-2 py-1 pe-4 text-xs fw-semibold bg-white border"
                      style={{ fontSize: '0.78rem', width: '130px' }}
                      value={selectedSkillFilter}
                      onChange={(e) => handleSkillFilterChange(e.target.value)}
                    >
                      <option value="all">All Skills (Full Track)</option>
                      {SKILL_QUESTION_DATABASE.map(p => (
                        <option key={p.skill} value={p.skill}>{p.skill} (3 Levels)</option>
                      ))}
                    </select>
                  </div>

                  {/* HIGH-IMPACT COUNTDOWN CLOCK BOX */}
                  <div 
                    className={`d-flex align-items-center gap-2 p-2 px-3 rounded-3 border shadow-xs ${timerStyle.pulse ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: timerStyle.bg,
                      borderColor: timerStyle.border,
                      minWidth: '135px'
                    }}
                  >
                    <Clock size={18} style={{ color: timerStyle.color }} />
                    <div>
                      <div className="small fw-semibold" style={{ fontSize: '0.64rem', color: timerStyle.color }}>
                        TIME REMAINING
                      </div>
                      <div className="fw-bold font-monospace" style={{ fontSize: '1.15rem', color: timerStyle.color, lineHeight: '1.1' }}>
                        {formatTime(timeRemaining)}
                        <span className="text-secondary small fw-normal ms-1" style={{ fontSize: '0.70rem' }}>
                          /{formatTime(currentQuestion.timeLimit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Question Step Navigation (Forward Only - Locked Previous) */}
              <div className="mt-3">
                <div className="d-flex align-items-center justify-content-between text-secondary small mb-1" style={{ fontSize: '0.72rem' }}>
                  <span>Progress: {currentQuestionIndex + 1} of {totalQuestions} answered</span>
                  <span className="text-danger fw-semibold d-flex align-items-center gap-1">
                    <Lock size={11} />
                    Strict rule: Previous questions locked
                  </span>
                </div>
                
                {/* Visual Step Timeline */}
                <div className="progress" style={{ height: '6px', backgroundColor: '#E2E8F0' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                    role="progressbar" 
                    style={{ width: `${Math.max(5, ((currentQuestionIndex + 1) / totalQuestions) * 100)}%` }}
                  />
                </div>

                {/* Horizontal Question Pills (Locked indicator for previous) */}
                <div className="d-flex flex-wrap gap-1.5 mt-2 overflow-x-auto pb-1">
                  {activeQuestions.map((q, idx) => {
                    const isPast = idx < currentQuestionIndex;
                    const isCurrent = idx === currentQuestionIndex;
                    const isSubmitted = Boolean(submittedAnswers[q.id]);

                    return (
                      <div
                        key={q.id}
                        className={`d-flex align-items-center gap-1 px-2 py-1 rounded-2 border small ${
                          isCurrent 
                            ? 'bg-primary text-white fw-bold shadow-xs' 
                            : isPast
                            ? 'bg-light text-muted border-secondary-subtle'
                            : 'bg-white text-secondary'
                        }`}
                        style={{
                          fontSize: '0.70rem',
                          cursor: isPast ? 'not-allowed' : 'default',
                          opacity: isPast ? 0.75 : 1
                        }}
                        title={isPast ? 'Previous question is locked and cannot be revisited' : `Question ${idx + 1}`}
                      >
                        {isPast ? (
                          <>
                            <Lock size={10} className="text-secondary" />
                            <span>Q{idx + 1} ({q.skill})</span>
                            <Check size={10} className="text-success" />
                          </>
                        ) : isCurrent ? (
                          <>
                            <span className="rounded-circle bg-white" style={{ width: '6px', height: '6px' }} />
                            <span>Q{idx + 1} ({q.skill} • {q.level})</span>
                          </>
                        ) : (
                          <span>Q{idx + 1} ({q.skill})</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="p-3 p-md-4">
              <div className="row g-4">
                {/* Left Column: Realistic AI Interviewer Video Avatar */}
                <div className="col-12 col-lg-5">
                  <div 
                    className="position-relative rounded-3 overflow-hidden shadow-xs"
                    style={{
                      height: '280px',
                      backgroundColor: '#0F172A',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                      alt="AI Interviewer" 
                      className="w-100 h-100 object-fit-cover"
                    />

                    {/* Gradient Overlay */}
                    <div 
                      className="position-absolute bottom-0 start-0 w-100 p-2.5 d-flex flex-column justify-content-end"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                        height: '140px'
                      }}
                    >
                      {/* Subtitle / AI Prompt */}
                      <div 
                        className="bg-white bg-opacity-95 backdrop-blur rounded-2 p-2 px-2.5 text-dark small mb-2 shadow-xs"
                        style={{ fontSize: '0.72rem', fontWeight: 500, lineHeight: '1.35' }}
                      >
                        <span className="text-primary fw-bold">AI Interviewer: </span>
                        &ldquo;Please answer {currentQuestion.skill} {currentQuestion.levelName}. You have {currentQuestion.timeLimit}s.&rdquo;
                      </div>

                      {/* Bottom-left Interviewer Badge & Audio Controls */}
                      <div className="d-flex align-items-center justify-content-between text-white">
                        <span 
                          className="badge bg-black bg-opacity-70 text-white d-flex align-items-center gap-1.5 px-2 py-1 rounded-2"
                          style={{ fontSize: '0.68rem' }}
                        >
                          <Brain size={13} className="text-primary" />
                          AI Technical Lead
                        </span>

                        <div className="d-flex align-items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAiSpeechMuted(!aiSpeechMuted)}
                            className="btn btn-sm btn-dark bg-black bg-opacity-60 text-white p-1 rounded-circle border-0"
                            title={aiSpeechMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                          >
                            {aiSpeechMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Alignment Note Box */}
                  <div 
                    className="p-2.5 rounded-3 mt-3 border"
                    style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontSize: '0.74rem' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark">Why This Question?</span>
                      <span className="badge rounded-pill bg-primary-subtle text-primary" style={{ fontSize: '0.66rem' }}>
                        Resume ↔ JD Match
                      </span>
                    </div>
                    <div className="text-secondary mb-1">
                      • <strong>Resume:</strong> Extracted technical skill on your profile.
                    </div>
                    <div className="text-secondary">
                      • <strong>Target JD:</strong> {currentQuestion.jdAlignment}.
                    </div>
                  </div>
                </div>

                {/* Right Column: Question Title & Live Answering Console */}
                <div className="col-12 col-lg-7 d-flex flex-column justify-content-between">
                  <div>
                    {/* Active Question Prompt */}
                    <div className="p-3 rounded-3 mb-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="badge text-uppercase fw-bold" style={{ backgroundColor: levelInfo.bg, color: levelInfo.text, fontSize: '0.68rem' }}>
                          {currentQuestion.levelName} ({currentQuestion.timeLimit}s Slot)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowKeyPoints(!showKeyPoints)}
                          className="btn btn-link btn-sm text-decoration-none text-primary p-0 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.72rem' }}
                        >
                          <Lightbulb size={13} />
                          <span>{showKeyPoints ? 'Hide Key Evaluation Criteria' : 'Show Key Evaluation Criteria'}</span>
                        </button>
                      </div>

                      <h3 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.02rem', lineHeight: '1.45' }}>
                        {currentQuestion.question}
                      </h3>

                      {/* Optional Hint / Criteria Drawer */}
                      {showKeyPoints && (
                        <div className="mt-2.5 pt-2 border-top" style={{ borderColor: '#E2E8F0' }}>
                          <div className="fw-semibold text-secondary small mb-1" style={{ fontSize: '0.70rem' }}>
                            Expected Key Answer Points:
                          </div>
                          <ul className="small text-secondary mb-1 ps-3" style={{ fontSize: '0.72rem' }}>
                            {currentQuestion.keyPoints.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Audio Recording Equalizer Box */}
                    <div 
                      className="rounded-3 p-3 mb-3 text-center"
                      style={{
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-1.5 text-danger small fw-semibold" style={{ fontSize: '0.74rem' }}>
                          <span className="rounded-circle bg-danger animate-pulse" style={{ width: '8px', height: '8px' }} />
                          <span>{isRecording ? 'Listening & Transcribing your verbal response...' : 'Microphone Paused'}</span>
                        </div>

                        <span className="badge bg-white text-secondary border small" style={{ fontSize: '0.68rem' }}>
                          Voice &amp; Text Enabled
                        </span>
                      </div>

                      {/* Equalizer Bar Waves */}
                      <div className="d-flex align-items-center justify-content-center gap-1 my-2" style={{ height: '36px' }}>
                        {waveformHeights.map((h, i) => (
                          <div
                            key={i}
                            className="rounded-pill transition-all"
                            style={{
                              width: '3.5px',
                              height: isRecording ? `${h}%` : '20%',
                              backgroundColor: '#2563EB',
                              opacity: isRecording ? 0.9 : 0.3,
                              transition: 'height 0.15s ease'
                            }}
                          />
                        ))}
                      </div>

                      {/* Voice Mic Toggle Button */}
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsRecording(!isRecording)}
                          className="btn rounded-circle d-flex align-items-center justify-content-center shadow-xs transition-all"
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: isRecording ? '#DC2626' : '#2563EB',
                            color: '#FFFFFF'
                          }}
                          title={isRecording ? "Pause Voice Recording" : "Resume Voice Recording"}
                        >
                          {isRecording ? <Square size={16} fill="white" /> : <Mic size={18} />}
                        </button>
                        <span className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                          {isRecording ? 'Click to pause mic' : 'Click to resume speech'}
                        </span>
                      </div>
                    </div>

                    {/* Live Transcript / Written Response Editor */}
                    <div className="position-relative mb-2">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <label className="form-label small fw-semibold text-secondary mb-0" style={{ fontSize: '0.72rem' }}>
                          Your Response (Transcribed or Typed):
                        </label>
                        <span className="text-secondary small" style={{ fontSize: '0.68rem' }}>
                          Words: {userAnswerText.trim() ? userAnswerText.trim().split(/\s+/).length : 0}
                        </span>
                      </div>
                      <textarea
                        className="form-control rounded-2 text-sm p-2.5"
                        rows={3}
                        value={userAnswerText}
                        onChange={(e) => setUserAnswerText(e.target.value)}
                        placeholder="Speak into your microphone or type your technical answer here..."
                        style={{
                          fontSize: '0.82rem',
                          backgroundColor: '#F8FAFC',
                          borderColor: '#E2E8F0',
                          resize: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR: NO PREVIOUS BUTTON + SUBMIT BUTTON */}
                  <div 
                    className="pt-3 border-top d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    {/* STRICT NO PREVIOUS QUESTION BADGE */}
                    <div 
                      className="d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2 bg-light border text-muted small"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <Lock size={14} className="text-secondary flex-shrink-0" />
                      <span>Previous Question: <strong>Locked</strong> (Single attempt mode)</span>
                    </div>

                    {/* Submit / Finish Actions */}
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScorecardModal(true)}
                        className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3 py-2 fw-medium"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <FileCheck size={14} />
                        <span>End Interview</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3.5 py-2 fw-bold shadow-xs"
                        style={{
                          backgroundColor: '#2563EB',
                          borderColor: '#2563EB',
                          fontSize: '0.82rem'
                        }}
                      >
                        <span>{currentQuestionIndex === activeQuestions.length - 1 ? 'Submit & View Scorecard' : 'Submit Answer & Proceed'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & Adaptive Flow Cards (F14, F15, F16, F17) */}
          <div className="row g-3 mb-4">
            {/* Card 1: F14 Interview Configuration */}
            <div className="col-12 col-md-6 col-xl-3 d-flex">
              <div className="card border-0 rounded-3 shadow-xs p-3 w-100 d-flex flex-column justify-content-between bg-white border">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-2 text-white fw-bold px-2 py-0.5" style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}>
                      F14
                    </span>
                    <h2 className="h6 fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                      Timed Slot Rules
                    </h2>
                  </div>
                  <p className="text-secondary small mb-3" style={{ fontSize: '0.72rem' }}>
                    Standardized interview timing enforcement
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <div className="p-2 rounded-2 border d-flex align-items-center justify-content-between" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
                      <span className="fw-semibold text-success small" style={{ fontSize: '0.74rem' }}>Level 1: Easy</span>
                      <span className="badge bg-success text-white">30 seconds</span>
                    </div>
                    <div className="p-2 rounded-2 border d-flex align-items-center justify-content-between" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
                      <span className="fw-semibold text-primary small" style={{ fontSize: '0.74rem' }}>Level 2: Medium</span>
                      <span className="badge bg-primary text-white">40 seconds</span>
                    </div>
                    <div className="p-2 rounded-2 border d-flex align-items-center justify-content-between" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
                      <span className="fw-semibold text-danger small" style={{ fontSize: '0.74rem' }}>Level 3: Hard</span>
                      <span className="badge bg-danger text-white">1 minute (60s)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-top text-secondary small" style={{ fontSize: '0.70rem' }}>
                  Auto-submits response when slot countdown reaches zero.
                </div>
              </div>
            </div>

            {/* Card 2: F15 AI Question Generation */}
            <div className="col-12 col-md-6 col-xl-3 d-flex">
              <div className="card border-0 rounded-3 shadow-xs p-3 w-100 d-flex flex-column justify-content-between bg-white border">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-2 text-white fw-bold px-2 py-0.5" style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}>
                      F15
                    </span>
                    <h2 className="h6 fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                      Resume Skills Mapping
                    </h2>
                  </div>
                  <p className="text-secondary small mb-2" style={{ fontSize: '0.72rem' }}>
                    Mapped across extracted candidate proficiencies
                  </p>

                  <div className="d-flex flex-wrap gap-1.5 mb-2">
                    {SKILL_QUESTION_DATABASE.slice(0, 6).map(p => (
                      <span key={p.skill} className="badge bg-light text-dark border small" style={{ fontSize: '0.68rem' }}>
                        {p.skill} ({p.proficiency || 80}%)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-2 bg-light border text-secondary small" style={{ fontSize: '0.70rem' }}>
                  Every skill has 3 dedicated difficulty tiers (Easy, Medium, Hard).
                </div>
              </div>
            </div>

            {/* Card 3: F16 Profile JD Alignment */}
            <div className="col-12 col-md-6 col-xl-3 d-flex">
              <div className="card border-0 rounded-3 shadow-xs p-3 w-100 d-flex flex-column justify-content-between bg-white border">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-2 text-white fw-bold px-2 py-0.5" style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}>
                      F16
                    </span>
                    <h2 className="h6 fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                      Profile JD Alignment
                    </h2>
                  </div>
                  <p className="text-secondary small mb-2" style={{ fontSize: '0.72rem' }}>
                    Tied directly to target role requirements
                  </p>

                  <div className="p-2 rounded-2 bg-light border mb-2 text-dark small" style={{ fontSize: '0.72rem', maxHeight: '72px', overflowY: 'auto' }}>
                    &ldquo;{userProfileJD}&rdquo;
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsJdModalOpen(true)}
                  className="btn btn-sm btn-outline-primary w-100 py-1 rounded-2"
                  style={{ fontSize: '0.74rem' }}
                >
                  Adjust Profile JD
                </button>
              </div>
            </div>

            {/* Card 4: F17 Adaptive Single-Attempt Integrity */}
            <div className="col-12 col-md-6 col-xl-3 d-flex">
              <div className="card border-0 rounded-3 shadow-xs p-3 w-100 d-flex flex-column justify-content-between bg-white border">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-2 text-white fw-bold px-2 py-0.5" style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}>
                      F17
                    </span>
                    <h2 className="h6 fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                      Assessment Integrity
                    </h2>
                  </div>
                  <p className="text-secondary small mb-2" style={{ fontSize: '0.72rem' }}>
                    Anti-cheating and real assessment flow
                  </p>

                  <div className="d-flex flex-column gap-1.5 small text-secondary" style={{ fontSize: '0.70rem' }}>
                    <div className="d-flex align-items-center gap-1.5 text-danger">
                      <Lock size={12} />
                      <span>Previous question locked permanently</span>
                    </div>
                    <div className="d-flex align-items-center gap-1.5 text-success">
                      <CheckCircle2 size={12} />
                      <span>Live voice transcription &amp; depth evaluation</span>
                    </div>
                    <div className="d-flex align-items-center gap-1.5 text-primary">
                      <Clock size={12} />
                      <span>Automatic progression on timer timeout</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMainTab('skill-matrix')}
                  className="btn btn-sm btn-primary w-100 py-1 rounded-2"
                  style={{ fontSize: '0.74rem', backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Explore 3-Level Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: SKILLS 3-LEVEL QUESTION BANK MATRIX */}
      {activeMainTab === 'skill-matrix' && (
        <div className="card border-0 rounded-4 shadow-sm p-3 p-md-4 mb-4 bg-white border">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="h5 fw-bold text-dark mb-0">
                  Skills 3-Level Question Bank (From Resume &amp; Profile JD)
                </h2>
                <span className="badge bg-primary text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                  {SKILL_QUESTION_DATABASE.length} Skills Mapped
                </span>
              </div>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
                Every skill extracted from your resume and target job description contains 3 progressive difficulty levels: <strong>Easy (30s)</strong>, <strong>Medium (40s)</strong>, and <strong>Hard (1m)</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSkill3LevelTest('all')}
              className="btn btn-primary btn-sm px-3.5 py-2 rounded-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
              style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
            >
              <Play size={14} fill="white" />
              <span>Start Comprehensive Test</span>
            </button>
          </div>

          {/* Skill Matrix Grid */}
          <div className="row g-3">
            {SKILL_QUESTION_DATABASE.map((pack) => (
              <div key={pack.skill} className="col-12 col-xl-6">
                <div 
                  className="card border rounded-3 p-3 h-100 d-flex flex-column justify-content-between shadow-2xs"
                  style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                >
                  <div>
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-6 fw-bold text-dark">{pack.skill}</span>
                        <span className="badge bg-white text-secondary border small" style={{ fontSize: '0.68rem' }}>
                          {pack.category}
                        </span>
                        {pack.inResume && (
                          <span className="badge bg-success-subtle text-success border border-success-subtle small" style={{ fontSize: '0.68rem' }}>
                            ✓ In Resume ({pack.proficiency}%)
                          </span>
                        )}
                        {pack.inJD && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle small" style={{ fontSize: '0.68rem' }}>
                            ✓ In Target JD
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLaunchSkill3LevelTest(pack.skill)}
                        className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-2 fw-semibold d-flex align-items-center gap-1"
                        style={{ fontSize: '0.74rem' }}
                      >
                        <Play size={12} fill="#2563EB" />
                        <span>Practice This Skill</span>
                      </button>
                    </div>

                    {/* 3 Level Question Cards */}
                    <div className="d-flex flex-column gap-2 mt-2">
                      {/* Level 1: Easy */}
                      <div 
                        className="p-2.5 rounded-2 border bg-white"
                        style={{ borderColor: '#A7F3D0' }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge bg-success-subtle text-success fw-bold px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                            Level 1: Easy
                          </span>
                          <span className="badge bg-light text-secondary border d-flex align-items-center gap-1" style={{ fontSize: '0.66rem' }}>
                            <Clock size={11} className="text-success" />
                            30 Seconds Slot
                          </span>
                        </div>
                        <div className="text-dark small fw-medium mb-1" style={{ fontSize: '0.78rem' }}>
                          {pack.questions.easy.question}
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.70rem' }}>
                          <em>Expected:</em> {pack.questions.easy.sampleAnswerHint}
                        </div>
                      </div>

                      {/* Level 2: Medium */}
                      <div 
                        className="p-2.5 rounded-2 border bg-white"
                        style={{ borderColor: '#BFDBFE' }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                            Level 2: Medium
                          </span>
                          <span className="badge bg-light text-secondary border d-flex align-items-center gap-1" style={{ fontSize: '0.66rem' }}>
                            <Clock size={11} className="text-primary" />
                            40 Seconds Slot
                          </span>
                        </div>
                        <div className="text-dark small fw-medium mb-1" style={{ fontSize: '0.78rem' }}>
                          {pack.questions.medium.question}
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.70rem' }}>
                          <em>Expected:</em> {pack.questions.medium.sampleAnswerHint}
                        </div>
                      </div>

                      {/* Level 3: Hard */}
                      <div 
                        className="p-2.5 rounded-2 border bg-white"
                        style={{ borderColor: '#FECACA' }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge bg-danger-subtle text-danger fw-bold px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                            Level 3: Hard
                          </span>
                          <span className="badge bg-light text-secondary border d-flex align-items-center gap-1" style={{ fontSize: '0.66rem' }}>
                            <Clock size={11} className="text-danger" />
                            1 Minute (60s) Slot
                          </span>
                        </div>
                        <div className="text-dark small fw-medium mb-1" style={{ fontSize: '0.78rem' }}>
                          {pack.questions.hard.question}
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.70rem' }}>
                          <em>Expected:</em> {pack.questions.hard.sampleAnswerHint}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT TARGET JOB DESCRIPTION MODAL */}
      {isJdModalOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-5 d-flex align-items-center justify-content-center p-3"
          onClick={() => setIsJdModalOpen(false)}
        >
          <div 
            className="bg-white rounded-4 shadow-lg p-4 w-100"
            style={{ maxWidth: '560px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                <h3 className="h6 fw-bold mb-0 text-dark">Edit Target Job Description in Profile</h3>
              </div>
              <button 
                type="button" 
                className="btn btn-sm btn-link text-secondary p-1"
                onClick={() => setIsJdModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-secondary small mb-3" style={{ fontSize: '0.80rem' }}>
              The AI Interview engine tailors all 3 levels of questions (Easy 30s, Medium 40s, Hard 1m) to match this Job Description with your resume.
            </p>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Target Job Requirements &amp; Stack
              </label>
              <textarea
                className="form-control rounded-3 p-2.5 text-dark"
                rows={5}
                value={editableJdText}
                onChange={(e) => setEditableJdText(e.target.value)}
                placeholder="Paste the job description or role tech stack here..."
                style={{ fontSize: '0.84rem' }}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border btn-sm px-3 rounded-2"
                onClick={() => setIsJdModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3.5 rounded-2 fw-semibold"
                style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                onClick={handleSaveProfileJd}
              >
                Save &amp; Update Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL SCORECARD & EVALUATION MODAL */}
      {showScorecardModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-5 d-flex align-items-center justify-content-center p-3"
          onClick={() => setShowScorecardModal(false)}
        >
          <div 
            className="bg-white rounded-4 shadow-lg p-4 w-100"
            style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '36px', height: '36px', backgroundColor: '#2563EB' }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="h6 fw-bold mb-0 text-dark">Interview Session Assessment</h3>
                  <span className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                    Role: {targetRole} • Candidate: {candidateName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary p-1"
                onClick={() => setShowScorecardModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scorecard Overview */}
            <div 
              className="p-3 rounded-3 text-center mb-3"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
            >
              <div className="text-secondary small fw-semibold mb-1">Overall Interview Readiness Score</div>
              <div className="h2 fw-bold text-primary mb-1">
                {Object.keys(submittedAnswers).length > 0 ? '88' : '0'}<span className="fs-5 text-secondary">/100</span>
              </div>
              <span className="badge bg-success text-white px-2.5 py-1 rounded-pill">
                Strong Candidate • Passed Interview Criteria
              </span>
            </div>

            {/* Performance Breakdown by Level */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="p-2 text-center rounded-2 border bg-light">
                  <div className="text-success small fw-semibold" style={{ fontSize: '0.70rem' }}>Easy (30s)</div>
                  <div className="fw-bold text-dark">94%</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>Avg: 18s</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 text-center rounded-2 border bg-light">
                  <div className="text-primary small fw-semibold" style={{ fontSize: '0.70rem' }}>Medium (40s)</div>
                  <div className="fw-bold text-dark">86%</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>Avg: 29s</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 text-center rounded-2 border bg-light">
                  <div className="text-danger small fw-semibold" style={{ fontSize: '0.70rem' }}>Hard (60s)</div>
                  <div className="fw-bold text-dark">82%</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>Avg: 51s</div>
                </div>
              </div>
            </div>

            {/* Questions Answered Audit */}
            <div className="mb-3">
              <div className="fw-bold text-dark small mb-1.5" style={{ fontSize: '0.78rem' }}>
                Answered Questions Audit ({answeredCount} completed)
              </div>
              <div className="d-flex flex-column gap-1.5" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {(Object.values(submittedAnswers) as SubmittedAnswerItem[]).map((item, idx) => (
                  <div key={idx} className="p-2 rounded-2 border bg-light d-flex align-items-center justify-content-between small">
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <span className={`badge ${item.level === 'easy' ? 'bg-success' : item.level === 'medium' ? 'bg-primary' : 'bg-danger'} text-white`}>
                        {item.level.toUpperCase()}
                      </span>
                      <span className="text-dark fw-medium text-truncate" style={{ maxWidth: '280px' }}>
                        {item.skill}: {item.answer}
                      </span>
                    </div>
                    <span className="badge bg-white text-secondary border flex-shrink-0" style={{ fontSize: '0.68rem' }}>
                      {item.timeSpent}s spent
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Recommendations */}
            <div className="mb-3">
              <div className="fw-bold text-dark small mb-1" style={{ fontSize: '0.78rem' }}>
                Target JD Recommendations
              </div>
              <ul className="list-unstyled d-flex flex-column gap-1 text-secondary small mb-0" style={{ fontSize: '0.74rem' }}>
                <li className="d-flex align-items-center gap-1.5 text-success">
                  <CheckCircle2 size={13} />
                  Strong core mastery of React hooks, event-loop concurrency, and MongoDB design.
                </li>
                <li className="d-flex align-items-center gap-1.5 text-success">
                  <CheckCircle2 size={13} />
                  Excellent speed on Easy (30s) and Medium (40s) questions.
                </li>
                <li className="d-flex align-items-center gap-1.5 text-warning">
                  <AlertCircle size={13} />
                  On Hard (1m) questions, elaborate more on fault-tolerance and rollback edge cases.
                </li>
              </ul>
            </div>

            {/* Modal Buttons */}
            <div className="d-flex gap-2 pt-2 border-top">
              <button
                type="button"
                onClick={() => {
                  setShowScorecardModal(false);
                  handleSkillFilterChange(selectedSkillFilter);
                }}
                className="btn btn-outline-primary flex-grow-1 rounded-2 py-2 fw-semibold small"
              >
                Restart Session
              </button>
              <button
                type="button"
                onClick={() => setShowScorecardModal(false)}
                className="btn btn-primary flex-grow-1 rounded-2 py-2 fw-semibold small"
                style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
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
