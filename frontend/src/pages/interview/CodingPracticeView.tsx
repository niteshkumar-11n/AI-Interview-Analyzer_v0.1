/**
 * Coding Practice & 4-Tier Assessment View
 * Features:
 * 1. Free Practice: Topic-based curated DSA problems with Monaco editor, local sandbox / Wandbox
 * 2. 4-Tier Assessment (100 Marks):
 *    - Easy (10 Marks)
 *    - Medium (20 Marks)
 *    - Medium-Hard (30 Marks)
 *    - Star Challenge (40 Marks - Medium or Hard)
 *    - Authoritative test-case execution via Judge0 CE (with Wandbox fallback)
 *    - Correctness score: (Passed / Total) * Max Marks
 *    - AI Code Review with Big-O complexity & actionable improvements
 *    - Persistent MongoDB storage and Scorecard modal
 * 3. Assessment History: Review past assessments and detailed scorecards
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  CODING_PROBLEMS,
  TOPICS,
  type CodingProblem,
} from '../../data/codingProblems.ts';
import {
  runAllTests,
  type RunAllResult,
} from '../../utils/codeRunner.ts';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Trophy,
  Sparkles,
  Terminal,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Zap,
  Wifi,
  Eye,
  EyeOff,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Calendar,
} from 'lucide-react';
import { CodingScorecardModal } from '../../components/coding/CodingScorecardModal.tsx';
import type {
  CodingAssessmentQuestion,
  CodingAssessmentQuestionResult,
  CodingAssessmentRecord,
} from '../../types.ts';

/* ===========================
   Types & Constants
   =========================== */
type SupportedLanguage = 'Python' | 'JavaScript' | 'C++' | 'Java';

const LANGUAGE_TO_JUDGE0_ID: Record<SupportedLanguage, number> = {
  Python: 71,
  JavaScript: 63,
  'C++': 54,
  Java: 62,
};

const LANGUAGES: { id: SupportedLanguage; label: string; monacoId: string; icon: string }[] = [
  { id: 'Python', label: 'Python 3', monacoId: 'python', icon: '🐍' },
  { id: 'JavaScript', label: 'JavaScript', monacoId: 'javascript', icon: '⚡' },
  { id: 'C++', label: 'C++', monacoId: 'cpp', icon: '⚙️' },
  { id: 'Java', label: 'Java', monacoId: 'java', icon: '☕' },
];

interface CodingPracticeViewProps {
  onOpenUpgradeModal?: () => void;
  onNavigateToDashboard?: () => void;
}

function getDifficultyStyle(d: string): { bg: string; fg: string; glow: string } {
  if (d === 'Easy') return { bg: 'rgba(34,197,94,0.15)', fg: '#6EE7B7', glow: 'rgba(34,197,94,0.3)' };
  if (d === 'Medium') return { bg: 'rgba(245,158,11,0.15)', fg: '#FCD34D', glow: 'rgba(245,158,11,0.3)' };
  if (d === 'Medium-Hard') return { bg: 'rgba(249,115,22,0.15)', fg: '#FDBA74', glow: 'rgba(249,115,22,0.3)' };
  return { bg: 'rgba(239,68,68,0.15)', fg: '#FCA5A5', glow: 'rgba(239,68,68,0.3)' };
}

function formatTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export const CodingPracticeView: React.FC<CodingPracticeViewProps> = ({
  onNavigateToDashboard,
}) => {
  const { user } = useAuth();

  // ── Mode Switcher: 'practice' | 'assessment' | 'history' ──
  const [mainMode, setMainMode] = useState<'practice' | 'assessment' | 'history'>('practice');

  // ══════════════════════════════════════════
  // FREE PRACTICE STATE
  // ══════════════════════════════════════════
  const [selectedTopic, setSelectedTopic] = useState<string>('Arrays');
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('Python');
  const [practiceCode, setPracticeCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'solution'>('description');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'problem' | 'editor'>('problem');
  const [judge0Status, setJudge0Status] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [isPracticeRunning, setIsPracticeRunning] = useState(false);
  const [practiceResults, setPracticeResults] = useState<RunAllResult | null>(null);
  const [practiceOutputTab, setPracticeOutputTab] = useState<'results' | 'output'>('results');
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);
  const [practiceTimerRunning, setPracticeTimerRunning] = useState(false);

  // ══════════════════════════════════════════
  // 4-TIER CODING ASSESSMENT STATE
  // ══════════════════════════════════════════
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<CodingAssessmentQuestion[]>([]);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [assessmentCodes, setAssessmentCodes] = useState<Record<string, Record<SupportedLanguage, string>>>({});
  const [assessmentResults, setAssessmentResults] = useState<Record<string, CodingAssessmentQuestionResult>>({});
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [isEvaluatingQuestion, setIsEvaluatingQuestion] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentSampleResult, setAssessmentSampleResult] = useState<RunAllResult | null>(null);
  const [isAssessmentSampleRunning, setIsAssessmentSampleRunning] = useState(false);
  const [assessmentTab, setAssessmentTab] = useState<'description' | 'testcases'>('description');
  const [completedRecord, setCompletedRecord] = useState<CodingAssessmentRecord | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [assessmentTimerSeconds, setAssessmentTimerSeconds] = useState(2700); // 45:00
  const [assessmentTimerRunning, setAssessmentTimerRunning] = useState(false);

  // ══════════════════════════════════════════
  // ASSESSMENT HISTORY STATE
  // ══════════════════════════════════════════
  const [historyList, setHistoryList] = useState<CodingAssessmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<CodingAssessmentRecord | null>(null);

  // ── Computed Free Practice Data ──
  const topicProblems = useMemo(() => CODING_PROBLEMS[selectedTopic] || [], [selectedTopic]);
  const currentPracticeProblem: CodingProblem | null = topicProblems[selectedProblemIdx] || null;

  // ── Computed Active Assessment Question ──
  const currentAssessmentQ: CodingAssessmentQuestion | null = assessmentQuestions[activeQIdx] || null;
  const currentAssessmentCode = useMemo(() => {
    if (!currentAssessmentQ) return '';
    const stored = assessmentCodes[currentAssessmentQ.id]?.[selectedLang];
    if (stored !== undefined) return stored;
    return currentAssessmentQ.starterCode[selectedLang] || '';
  }, [currentAssessmentQ, selectedLang, assessmentCodes]);

  const currentTotalScore = useMemo(() => {
    return Math.round(
      Object.values(assessmentResults).reduce((sum, r) => sum + (r.score || 0), 0) * 100
    ) / 100;
  }, [assessmentResults]);

  // ── Responsive Detection ──
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setLeftPanelOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Judge0 Health Check ──
  useEffect(() => {
    (async () => {
      try {
        const res = await api.coding.health();
        setJudge0Status(res.status === 'connected' ? 'connected' : 'offline');
      } catch {
        setJudge0Status('offline');
      }
    })();
  }, []);

  // ── Sync practice starter code ──
  useEffect(() => {
    if (currentPracticeProblem) {
      const starter = currentPracticeProblem.starterCode[selectedLang] || '// Write your code here\n';
      setPracticeCode(starter);
      setShowSolution(false);
      setCopiedSolution(false);
      setPracticeResults(null);
      setActiveTestCase(0);
    }
  }, [currentPracticeProblem?.id, selectedLang]);

  // ── Practice Timer ──
  useEffect(() => {
    if (!practiceTimerRunning) return;
    const interval = setInterval(() => setPracticeTimerSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [practiceTimerRunning]);

  // ── Assessment Countdown Timer ──
  useEffect(() => {
    if (!assessmentTimerRunning) return;
    const interval = setInterval(() => {
      setAssessmentTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAssessmentTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [assessmentTimerRunning]);

  // ── Fetch Assessment History ──
  const fetchAssessmentHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.coding.getAssessmentHistory();
      if (res.success && Array.isArray(res.history)) {
        setHistoryList(res.history);
      }
    } catch (e: any) {
      console.warn('Failed to fetch history:', e.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // ══════════════════════════════════════════
  // ASSESSMENT ACTION HANDLERS
  // ══════════════════════════════════════════
  const handleStartNewAssessment = async () => {
    setIsGeneratingAssessment(true);
    try {
      const res = await api.coding.generateAssessment();
      if (res.success && res.questions && res.questions.length >= 4) {
        setAssessmentId(res.assessmentId);
        setAssessmentQuestions(res.questions);
        setActiveQIdx(0);
        setAssessmentResults({});

        // Pre-populate starter codes for all 4 questions
        const initialCodes: Record<string, Record<SupportedLanguage, string>> = {};
        res.questions.forEach(q => {
          initialCodes[q.id] = {
            Python: q.starterCode.Python || '# Write your solution here\n',
            JavaScript: q.starterCode.JavaScript || '// Write your solution here\n',
            'C++': q.starterCode['C++'] || '// Write your solution here\n',
            Java: q.starterCode.Java || '// Write your solution here\n',
          };
        });
        setAssessmentCodes(initialCodes);
        setAssessmentTimerSeconds(2700); // 45:00
        setAssessmentTimerRunning(true);
        setMainMode('assessment');
        setAssessmentSampleResult(null);
      }
    } catch (err: any) {
      alert('Failed to initialize coding assessment: ' + err.message);
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleAssessmentCodeChange = (val: string | undefined) => {
    if (!currentAssessmentQ) return;
    const updated = val || '';
    setAssessmentCodes(prev => ({
      ...prev,
      [currentAssessmentQ.id]: {
        ...(prev[currentAssessmentQ.id] || {}),
        [selectedLang]: updated,
      },
    }));
  };

  const handleRunAssessmentSample = async () => {
    if (!currentAssessmentQ || isAssessmentSampleRunning) return;
    setIsAssessmentSampleRunning(true);
    setAssessmentSampleResult(null);

    try {
      const sampleCases = currentAssessmentQ.visibleTestCases.map((tc, idx) => ({
        label: `Sample ${idx + 1}`,
        input: tc.stdin,
        expectedOutput: tc.expectedOutput,
      }));

      const results = await runAllTests(
        currentAssessmentCode,
        currentAssessmentQ.id,
        selectedLang,
        sampleCases
      );
      setAssessmentSampleResult(results);
    } catch (err: any) {
      setAssessmentSampleResult({
        totalTests: currentAssessmentQ.visibleTestCases.length,
        passed: 0,
        failed: currentAssessmentQ.visibleTestCases.length,
        results: currentAssessmentQ.visibleTestCases.map((tc, i) => ({
          index: i,
          label: `Sample ${i + 1}`,
          passed: false,
          input: tc.stdin,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: err.message || 'Execution failed',
          executionTimeMs: 0,
        })),
        overallTimeMs: 0,
        compilationError: err.message || 'Unknown execution error',
      });
    } finally {
      setIsAssessmentSampleRunning(false);
    }
  };

  const handleSubmitAssessmentQuestion = async () => {
    if (!assessmentId || !currentAssessmentQ || isEvaluatingQuestion) return;
    setIsEvaluatingQuestion(true);

    try {
      const langId = LANGUAGE_TO_JUDGE0_ID[selectedLang] || 71;
      const res = await api.coding.evaluateAssessmentQuestion({
        assessmentId,
        questionId: currentAssessmentQ.id,
        languageId: langId,
        languageName: selectedLang,
        sourceCode: currentAssessmentCode,
      });

      if (res.success && res.result) {
        setAssessmentResults(prev => ({
          ...prev,
          [currentAssessmentQ.id]: res.result,
        }));
      }
    } catch (err: any) {
      alert('Error evaluating question: ' + err.message);
    } finally {
      setIsEvaluatingQuestion(false);
    }
  };

  const handleFinishAssessment = async () => {
    if (!assessmentId || assessmentQuestions.length === 0 || isSubmittingAssessment) return;

    const unsubmitted = assessmentQuestions.filter(q => !assessmentResults[q.id]);
    if (unsubmitted.length > 0) {
      const confirmFinish = window.confirm(
        `You have ${unsubmitted.length} unsubmitted question(s). Unsubmitted questions will receive 0 marks. Do you wish to finalize and submit?`
      );
      if (!confirmFinish) return;
    }

    setIsSubmittingAssessment(true);
    try {
      const payloadQuestions = assessmentQuestions.map(q => {
        const evalRes = assessmentResults[q.id];
        const code = assessmentCodes[q.id]?.[selectedLang] || q.starterCode[selectedLang] || '';
        return {
          questionId: q.id,
          title: q.title,
          difficulty: q.tierName,
          marks: q.marks,
          score: evalRes ? evalRes.score : 0,
          submittedCode: code,
          language: selectedLang,
          languageId: LANGUAGE_TO_JUDGE0_ID[selectedLang],
          passedTests: evalRes ? evalRes.passedTests : 0,
          totalTests: evalRes ? evalRes.totalTests : q.visibleTestCases.length + 3,
          status: evalRes ? evalRes.status : 'Unattempted',
          executionTime: evalRes?.executionTime || null,
          memory: evalRes?.memory || null,
          aiReview: evalRes?.aiReview || {
            feedback: 'Question was unattempted or not evaluated.',
            strengths: [],
            improvements: ['Submit questions for evaluation to receive feedback.'],
          },
          testResults: evalRes?.testResults || [],
        };
      });

      const elapsedMinutes = Math.max(1, Math.round((2700 - assessmentTimerSeconds) / 60));

      const res = await api.coding.submitAssessment({
        assessmentId,
        questions: payloadQuestions,
        durationMinutes: elapsedMinutes,
      });

      if (res.success && res.assessment) {
        setCompletedRecord(res.assessment);
        setIsScorecardOpen(true);
        setAssessmentTimerRunning(false);
        // Refresh history in background
        fetchAssessmentHistory();
      }
    } catch (err: any) {
      alert('Failed to submit assessment: ' + err.message);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // ══════════════════════════════════════════
  // FREE PRACTICE HANDLERS
  // ══════════════════════════════════════════
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedProblemIdx(0);
    setShowTopicDropdown(false);
  };

  const handlePrevProblem = () => {
    setSelectedProblemIdx(prev => (prev - 1 + topicProblems.length) % topicProblems.length);
  };

  const handleNextProblem = () => {
    setSelectedProblemIdx(prev => (prev + 1) % topicProblems.length);
  };

  const handleResetPracticeCode = () => {
    if (currentPracticeProblem) {
      setPracticeCode(currentPracticeProblem.starterCode[selectedLang] || '');
      setPracticeResults(null);
    }
  };

  const handleShowSolution = () => {
    if (currentPracticeProblem && !showSolution) {
      setPracticeCode(currentPracticeProblem.optimalCode[selectedLang] || '// Solution not available');
    } else if (currentPracticeProblem) {
      setPracticeCode(currentPracticeProblem.starterCode[selectedLang] || '');
    }
    setShowSolution(!showSolution);
  };

  const handleCopySolution = async () => {
    if (currentPracticeProblem) {
      await navigator.clipboard.writeText(currentPracticeProblem.optimalCode[selectedLang] || '');
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const handleRunPracticeCode = useCallback(async () => {
    if (isPracticeRunning || !currentPracticeProblem) return;
    setIsPracticeRunning(true);
    setPracticeResults(null);
    setPracticeOutputTab('results');

    try {
      const results = await runAllTests(
        practiceCode,
        currentPracticeProblem.id,
        selectedLang,
        currentPracticeProblem.testCases
      );
      setPracticeResults(results);
    } catch (err: any) {
      setPracticeResults({
        totalTests: currentPracticeProblem.testCases.length,
        passed: 0,
        failed: currentPracticeProblem.testCases.length,
        results: currentPracticeProblem.testCases.map((tc, i) => ({
          index: i,
          label: tc.label,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: err.message || 'Execution failed',
          executionTimeMs: 0,
        })),
        overallTimeMs: 0,
        compilationError: err.message || 'Unknown error',
      });
    }
    setIsPracticeRunning(false);
  }, [isPracticeRunning, selectedLang, practiceCode, currentPracticeProblem]);

  return (
    <div
      id="coding-practice-container"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes cpv-spin { to { transform: rotate(360deg); } }
        @keyframes cpv-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .cpv-fade-in { animation: cpv-fadeIn 0.3s ease-out; }
        .cpv-btn { transition: all 0.2s ease; cursor: pointer; border: none; outline: none; }
        .cpv-btn:hover { filter: brightness(1.1); }
        .cpv-btn:active { transform: scale(0.97); }
        .cpv-scrollbar::-webkit-scrollbar { width: 6px; }
        .cpv-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cpv-scrollbar::-webkit-scrollbar-thumb { background: rgba(71,85,105,0.4); border-radius: 3px; }
        .cpv-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,0.6); }
        @media (max-width: 899px) {
          .cpv-desktop-only { display: none !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════
         TOP HEADER BAR + MODE SWITCHER
         ════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '10px 12px' : '10px 20px',
          background: 'rgba(15,23,42,0.95)',
          borderBottom: '1px solid rgba(71,85,105,0.3)',
          backdropFilter: 'blur(12px)',
          gap: '10px',
          flexShrink: 0,
          zIndex: 10,
          flexWrap: 'wrap',
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            }}
          >
            <Code2 size={18} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
              }}
            >
              SkillNexus Coding Studio
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: 0 }}>
              Algorithmic Practice &bull; 4-Tier Assessments &bull; Judge0 CE &bull; Wandbox
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '3px',
            background: 'rgba(30,41,59,0.8)',
            padding: '3px',
            borderRadius: '12px',
            border: '1px solid rgba(71,85,105,0.35)',
          }}
        >
          <button
            className="cpv-btn"
            onClick={() => setMainMode('practice')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: mainMode === 'practice' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
              color: mainMode === 'practice' ? '#fff' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={13} />
            <span>Free Practice</span>
          </button>

          <button
            className="cpv-btn"
            onClick={() => {
              if (!assessmentId && assessmentQuestions.length === 0) {
                handleStartNewAssessment();
              } else {
                setMainMode('assessment');
              }
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: mainMode === 'assessment' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
              color: mainMode === 'assessment' ? '#fff' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trophy size={13} />
            <span>4-Tier Assessment (100M)</span>
          </button>

          <button
            className="cpv-btn"
            onClick={() => {
              fetchAssessmentHistory();
              setMainMode('history');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: mainMode === 'history' ? 'rgba(71,85,105,0.6)' : 'transparent',
              color: mainMode === 'history' ? '#fff' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={13} />
            <span>History</span>
          </button>
        </div>

        {/* Right Info: Timer & Engine Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mainMode === 'assessment' && assessmentTimerRunning && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              <Clock size={13} />
              <span>{formatTimer(assessmentTimerSeconds)}</span>
            </div>
          )}

          <div
            className="cpv-desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '16px',
              background: judge0Status === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${judge0Status === 'connected' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}
          >
            <Wifi size={12} color={judge0Status === 'connected' ? '#22C55E' : '#F59E0B'} />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: judge0Status === 'connected' ? '#22C55E' : '#F59E0B',
              }}
            >
              {judge0Status === 'connected' ? 'Judge0 Live' : 'Wandbox Live'}
            </span>
          </div>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="cpv-btn"
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'rgba(71,85,105,0.3)',
                color: '#E2E8F0',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: '1px solid rgba(71,85,105,0.4)',
              }}
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
         MODE 1: 4-TIER CODING ASSESSMENT
         ════════════════════════════════════════ */}
      {mainMode === 'assessment' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isGeneratingAssessment ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                }}
              >
                <Sparkles size={32} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                Generating Your 4-Tier Assessment
              </h3>
              <p style={{ color: '#94A3B8', maxWidth: '500px', fontSize: '0.85rem', margin: 0 }}>
                Synthesizing progressive challenges tailored to your candidate profile: Easy (10m), Medium (20m),
                Medium-Hard (30m), and Star Challenge (40m)...
              </p>
              <Loader2 size={24} style={{ color: '#10B981', animation: 'cpv-spin 1s linear infinite' }} />
            </div>
          ) : assessmentQuestions.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <Trophy size={48} color="#10B981" />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>
                  SkillNexus 4-Tier Coding Assessment
                </h2>
                <p style={{ color: '#94A3B8', maxWidth: '520px', fontSize: '0.88rem', margin: '0 auto' }}>
                  Take a comprehensive 100-mark assessment with authoritative test case execution. Your scores will be
                  persisted to MongoDB and displayed on your personalized dashboard.
                </p>
              </div>

              {/* Rubric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                  gap: '12px',
                  maxWidth: '750px',
                  width: '100%',
                }}
              >
                <div style={{ padding: '14px', background: 'rgba(30,41,59,0.7)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>Tier 1</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>10 Marks</div>
                  <small style={{ color: '#94A3B8' }}>Easy Foundations</small>
                </div>
                <div style={{ padding: '14px', background: 'rgba(30,41,59,0.7)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 700 }}>Tier 2</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>20 Marks</div>
                  <small style={{ color: '#94A3B8' }}>Medium Algorithms</small>
                </div>
                <div style={{ padding: '14px', background: 'rgba(30,41,59,0.7)', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.3)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#FDBA74', fontWeight: 700 }}>Tier 3</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>30 Marks</div>
                  <small style={{ color: '#94A3B8' }}>Medium-Hard DP</small>
                </div>
                <div style={{ padding: '14px', background: 'rgba(30,41,59,0.7)', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#D8B4FE', fontWeight: 700 }}>Tier 4</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>40 Marks</div>
                  <small style={{ color: '#94A3B8' }}>⭐ Star Challenge</small>
                </div>
              </div>

              <button
                className="cpv-btn"
                onClick={handleStartNewAssessment}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                }}
              >
                <Sparkles size={16} />
                <span>Begin Assessment (100 Marks)</span>
              </button>
            </div>
          ) : (
            /* Active Assessment Workspace */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Question Selection Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  background: 'rgba(15,23,42,0.85)',
                  borderBottom: '1px solid rgba(71,85,105,0.3)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {/* 4 Question Tabs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {assessmentQuestions.map((q, idx) => {
                    const evalResult = assessmentResults[q.id];
                    const isSelected = activeQIdx === idx;
                    const isDone = !!evalResult;
                    return (
                      <button
                        key={q.id}
                        className="cpv-btn"
                        onClick={() => setActiveQIdx(idx)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: isSelected
                            ? 'rgba(16,185,129,0.2)'
                            : isDone
                            ? 'rgba(30,41,59,0.7)'
                            : 'rgba(15,23,42,0.6)',
                          border: `1px solid ${
                            isSelected
                              ? '#10B981'
                              : isDone
                              ? 'rgba(71,85,105,0.5)'
                              : 'rgba(71,85,105,0.25)'
                          }`,
                          color: isSelected ? '#6EE7B7' : '#E2E8F0',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>Q{idx + 1}: {q.tierName} ({q.marks}m)</span>
                        {evalResult && (
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: '10px',
                              fontSize: '0.66rem',
                              background: evalResult.score === q.marks ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
                              color: evalResult.score === q.marks ? '#6EE7B7' : '#FCD34D',
                            }}
                          >
                            {evalResult.score}/{q.marks}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Score & Finish Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: 'rgba(30,41,59,0.8)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#6EE7B7',
                    }}
                  >
                    Score: {currentTotalScore} / 100 Marks
                  </div>

                  <button
                    className="cpv-btn"
                    onClick={handleFinishAssessment}
                    disabled={isSubmittingAssessment}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#fff',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {isSubmittingAssessment ? (
                      <Loader2 size={13} style={{ animation: 'cpv-spin 1s linear infinite' }} />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>Finish Assessment</span>
                  </button>
                </div>
              </div>

              {/* Assessment Question Workspace (Split View) */}
              {currentAssessmentQ && (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Left: Problem Details */}
                  <div
                    style={{
                      width: isMobile ? '100%' : '45%',
                      borderRight: '1px solid rgba(71,85,105,0.3)',
                      background: 'rgba(15,23,42,0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      padding: '16px',
                      gap: '14px',
                    }}
                    className="cpv-scrollbar"
                  >
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            ...getDifficultyStyle(currentAssessmentQ.tierName),
                          }}
                        >
                          {currentAssessmentQ.tierName} &bull; {currentAssessmentQ.marks} Marks
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{currentAssessmentQ.topic}</span>
                      </div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                        {currentAssessmentQ.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: '0.82rem', lineHeight: '1.6', color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>
                      {currentAssessmentQ.description}
                    </div>

                    {/* Constraints */}
                    {currentAssessmentQ.constraints?.length > 0 && (
                      <div style={{ padding: '10px 14px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', border: '1px solid rgba(71,85,105,0.3)' }}>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                          Constraints
                        </h6>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.76rem', color: '#94A3B8' }}>
                          {currentAssessmentQ.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Examples */}
                    {currentAssessmentQ.examples?.length > 0 && (
                      <div>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                          Examples
                        </h6>
                        {currentAssessmentQ.examples.map((ex, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 12px',
                              background: 'rgba(30,41,59,0.4)',
                              borderRadius: '8px',
                              border: '1px solid rgba(71,85,105,0.2)',
                              marginBottom: '8px',
                              fontSize: '0.76rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            <div style={{ color: '#94A3B8' }}><strong style={{ color: '#CBD5E1' }}>Input:</strong> {ex.input}</div>
                            <div style={{ color: '#94A3B8' }}><strong style={{ color: '#CBD5E1' }}>Output:</strong> {ex.output}</div>
                            {ex.explanation && (
                              <div style={{ color: '#64748B', fontFamily: 'inherit', marginTop: '4px' }}>
                                <em>Explanation: {ex.explanation}</em>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Code Editor & Execution Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor Toolbar */}
                    <div
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(15,23,42,0.85)',
                        borderBottom: '1px solid rgba(71,85,105,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      {/* Language Selector */}
                      <div style={{ display: 'flex', gap: '3px', background: 'rgba(30,41,59,0.6)', borderRadius: '8px', padding: '2px' }}>
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.id}
                            className="cpv-btn"
                            onClick={() => setSelectedLang(lang.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: selectedLang === lang.id ? 'rgba(16,185,129,0.2)' : 'transparent',
                              color: selectedLang === lang.id ? '#6EE7B7' : '#94A3B8',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              border: selectedLang === lang.id ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                            }}
                          >
                            <span style={{ marginRight: '3px' }}>{lang.icon}</span>
                            {lang.id}
                          </button>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="cpv-btn"
                          onClick={handleRunAssessmentSample}
                          disabled={isAssessmentSampleRunning}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(71,85,105,0.4)',
                            color: '#E2E8F0',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {isAssessmentSampleRunning ? (
                            <Loader2 size={13} style={{ animation: 'cpv-spin 1s linear infinite' }} />
                          ) : (
                            <Play size={13} />
                          )}
                          <span>Run Sample Tests</span>
                        </button>

                        <button
                          className="cpv-btn"
                          onClick={handleSubmitAssessmentQuestion}
                          disabled={isEvaluatingQuestion}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: '#fff',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {isEvaluatingQuestion ? (
                            <Loader2 size={13} style={{ animation: 'cpv-spin 1s linear infinite' }} />
                          ) : (
                            <Send size={13} />
                          )}
                          <span>Submit Question</span>
                        </button>
                      </div>
                    </div>

                    {/* Monaco Code Editor */}
                    <div style={{ flex: '1 1 50%', minHeight: '260px' }}>
                      <Editor
                        height="100%"
                        language={LANGUAGES.find(l => l.id === selectedLang)?.monacoId || 'python'}
                        value={currentAssessmentCode}
                        onChange={handleAssessmentCodeChange}
                        theme="vs-dark"
                        options={{
                          fontSize: 13,
                          lineNumbers: 'on',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 4,
                        }}
                      />
                    </div>

                    {/* Bottom Results Area */}
                    <div
                      style={{
                        height: '240px',
                        background: 'rgba(15,23,42,0.95)',
                        borderTop: '1px solid rgba(71,85,105,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '6px 14px',
                          background: 'rgba(30,41,59,0.5)',
                          borderBottom: '1px solid rgba(71,85,105,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#CBD5E1' }}>
                          Evaluation Results &amp; Test Cases
                        </span>
                        {assessmentResults[currentAssessmentQ.id] && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#6EE7B7',
                            }}
                          >
                            Score: {assessmentResults[currentAssessmentQ.id].score} / {currentAssessmentQ.marks} marks ({assessmentResults[currentAssessmentQ.id].passedTests}/{assessmentResults[currentAssessmentQ.id].totalTests} passed)
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }} className="cpv-scrollbar">
                        {/* Sample Run Output */}
                        {assessmentSampleResult && !assessmentResults[currentAssessmentQ.id] && (
                          <div style={{ fontSize: '0.76rem' }}>
                            <div style={{ fontWeight: 700, color: assessmentSampleResult.failed === 0 ? '#6EE7B7' : '#FCD34D', marginBottom: '8px' }}>
                              Sample Run: {assessmentSampleResult.passed}/{assessmentSampleResult.totalTests} tests passed
                            </div>
                            {assessmentSampleResult.results.map((r, i) => (
                              <div key={i} style={{ marginBottom: '6px', padding: '6px 10px', background: 'rgba(30,41,59,0.4)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: r.passed ? '#6EE7B7' : '#FCA5A5' }}>
                                    {r.passed ? '✓' : '✗'} {r.label}
                                  </span>
                                </div>
                                <div style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                  Expected: {r.expectedOutput} | Actual: {r.actualOutput || r.error || '(no output)'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Authoritative Evaluation Results */}
                        {assessmentResults[currentAssessmentQ.id] ? (
                          <div>
                            {/* AI Code Review Box */}
                            {assessmentResults[currentAssessmentQ.id].aiReview && (
                              <div style={{ padding: '10px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Sparkles size={12} /> AI Code Review &bull; {assessmentResults[currentAssessmentQ.id].status}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                                    Time: {assessmentResults[currentAssessmentQ.id].aiReview.timeComplexity || 'O(N)'} | Space: {assessmentResults[currentAssessmentQ.id].aiReview.spaceComplexity || 'O(1)'}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: '0 0 6px 0' }}>
                                  {assessmentResults[currentAssessmentQ.id].aiReview.feedback}
                                </p>
                                {assessmentResults[currentAssessmentQ.id].aiReview.improvements?.length > 0 && (
                                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                    <strong style={{ color: '#FCD34D' }}>Recommendation: </strong>
                                    {assessmentResults[currentAssessmentQ.id].aiReview.improvements[0]}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Test Cases Details */}
                            <div style={{ fontSize: '0.74rem' }}>
                              {assessmentResults[currentAssessmentQ.id].testResults.map((tr, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    background: 'rgba(30,41,59,0.3)',
                                    borderRadius: '6px',
                                    marginBottom: '4px',
                                  }}
                                >
                                  <span style={{ color: tr.passed ? '#6EE7B7' : '#FCA5A5', fontWeight: 600 }}>
                                    {tr.passed ? '✓' : '✗'} Test Case {i + 1} {tr.isHidden ? '(Hidden Evaluation Test)' : '(Sample Test)'}
                                  </span>
                                  <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                    {tr.status.description} {tr.time ? `(${tr.time}s)` : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : !assessmentSampleResult && (
                          <div style={{ color: '#64748B', fontSize: '0.76rem', textAlign: 'center', paddingTop: '20px' }}>
                            Click "Run Sample Tests" to test against visible examples, or "Submit Question" for authoritative full evaluation.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
         MODE 2: FREE PRACTICE
         ════════════════════════════════════════ */}
      {mainMode === 'practice' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel: Problem Statement */}
          {currentPracticeProblem && leftPanelOpen && (
            <div
              style={{
                width: isMobile ? '100%' : '45%',
                borderRight: '1px solid rgba(71,85,105,0.3)',
                background: 'rgba(15,23,42,0.7)',
                display: isMobile && mobileView === 'editor' ? 'none' : 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                padding: '16px',
                gap: '14px',
              }}
              className="cpv-scrollbar"
            >
              {/* Topic Selector & Nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div className="position-relative">
                  <button
                    className="cpv-btn"
                    onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: 'rgba(30,41,59,0.8)',
                      border: '1px solid rgba(71,85,105,0.4)',
                      color: '#E2E8F0',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{selectedTopic}</span>
                    <ChevronDown size={13} />
                  </button>

                  {showTopicDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '4px',
                        background: '#1E293B',
                        border: '1px solid rgba(71,85,105,0.4)',
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 20,
                        minWidth: '140px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                    >
                      {TOPICS.map(topic => (
                        <button
                          key={topic}
                          className="cpv-btn"
                          onClick={() => handleSelectTopic(topic)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: selectedTopic === topic ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: selectedTopic === topic ? '#A5B4FC' : '#CBD5E1',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="cpv-btn"
                    onClick={handlePrevProblem}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(30,41,59,0.6)',
                      border: '1px solid rgba(71,85,105,0.3)',
                      color: '#94A3B8',
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {selectedProblemIdx + 1} / {topicProblems.length}
                  </span>
                  <button
                    className="cpv-btn"
                    onClick={handleNextProblem}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(30,41,59,0.6)',
                      border: '1px solid rgba(71,85,105,0.3)',
                      color: '#94A3B8',
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Title & Difficulty */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      ...getDifficultyStyle(currentPracticeProblem.difficulty),
                    }}
                  >
                    {currentPracticeProblem.difficulty}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{currentPracticeProblem.category}</span>
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                  {currentPracticeProblem.title}
                </h2>
              </div>

              {/* Problem Description */}
              <div style={{ fontSize: '0.82rem', lineHeight: '1.6', color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>
                {currentPracticeProblem.description}
              </div>

              {/* Examples */}
              {currentPracticeProblem.examples?.length > 0 && (
                <div>
                  <h6 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                    Examples
                  </h6>
                  {currentPracticeProblem.examples.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(30,41,59,0.4)',
                        borderRadius: '8px',
                        border: '1px solid rgba(71,85,105,0.2)',
                        marginBottom: '8px',
                        fontSize: '0.76rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <div style={{ color: '#94A3B8' }}><strong style={{ color: '#CBD5E1' }}>Input:</strong> {ex.input}</div>
                      <div style={{ color: '#94A3B8' }}><strong style={{ color: '#CBD5E1' }}>Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div style={{ color: '#64748B', fontFamily: 'inherit', marginTop: '4px' }}>
                          <em>Explanation: {ex.explanation}</em>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {currentPracticeProblem.constraints?.length > 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', border: '1px solid rgba(71,85,105,0.3)' }}>
                  <h6 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                    Constraints
                  </h6>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.76rem', color: '#94A3B8' }}>
                    {currentPracticeProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Right Panel: Editor + Runner */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div
              style={{
                padding: '6px 14px',
                background: 'rgba(15,23,42,0.85)',
                borderBottom: '1px solid rgba(71,85,105,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', gap: '3px', background: 'rgba(30,41,59,0.6)', borderRadius: '8px', padding: '2px' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    className="cpv-btn"
                    onClick={() => setSelectedLang(lang.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: selectedLang === lang.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: selectedLang === lang.id ? '#A5B4FC' : '#94A3B8',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: selectedLang === lang.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    }}
                  >
                    <span style={{ marginRight: '3px' }}>{lang.icon}</span>
                    {lang.id}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="cpv-btn"
                  onClick={handleResetPracticeCode}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(71,85,105,0.3)',
                    color: '#94A3B8',
                    fontSize: '0.72rem',
                    border: '1px solid rgba(71,85,105,0.4)',
                  }}
                  title="Reset Code"
                >
                  <RotateCcw size={13} />
                </button>

                <button
                  className="cpv-btn"
                  onClick={handleShowSolution}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: showSolution ? 'rgba(245,158,11,0.15)' : 'rgba(71,85,105,0.3)',
                    color: showSolution ? '#FCD34D' : '#94A3B8',
                    fontSize: '0.72rem',
                    border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showSolution ? 'Hide Solution' : 'Solution'}</span>
                </button>

                <button
                  className="cpv-btn"
                  onClick={handleRunPracticeCode}
                  disabled={isPracticeRunning}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {isPracticeRunning ? (
                    <Loader2 size={13} style={{ animation: 'cpv-spin 1s linear infinite' }} />
                  ) : (
                    <Play size={13} />
                  )}
                  <span>Run Tests</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: '1 1 55%', minHeight: '260px' }}>
              <Editor
                height="100%"
                language={LANGUAGES.find(l => l.id === selectedLang)?.monacoId || 'python'}
                value={practiceCode}
                onChange={val => setPracticeCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                }}
              />
            </div>

            {/* Practice Results Drawer */}
            <div
              style={{
                height: '220px',
                background: 'rgba(15,23,42,0.95)',
                borderTop: '1px solid rgba(71,85,105,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '6px 14px',
                  background: 'rgba(30,41,59,0.5)',
                  borderBottom: '1px solid rgba(71,85,105,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#CBD5E1' }}>
                  Execution Results
                </span>
                {practiceResults && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: practiceResults.failed === 0 ? '#6EE7B7' : '#FCD34D',
                    }}
                  >
                    {practiceResults.passed} of {practiceResults.totalTests} Passed
                  </span>
                )}
              </div>

              <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }} className="cpv-scrollbar">
                {practiceResults ? (
                  <div>
                    {practiceResults.compilationError && (
                      <div style={{ padding: '8px', background: 'rgba(239,68,68,0.15)', borderRadius: '6px', color: '#FCA5A5', fontSize: '0.74rem', marginBottom: '8px' }}>
                        {practiceResults.compilationError}
                      </div>
                    )}
                    {practiceResults.results.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: 'rgba(30,41,59,0.3)',
                          borderRadius: '6px',
                          marginBottom: '4px',
                          fontSize: '0.74rem',
                        }}
                      >
                        <span style={{ color: r.passed ? '#6EE7B7' : '#FCA5A5', fontWeight: 600 }}>
                          {r.passed ? '✓' : '✗'} {r.label}
                        </span>
                        <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                          Exp: {r.expectedOutput} | Act: {r.actualOutput || r.error || '(no output)'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748B', fontSize: '0.76rem', textAlign: 'center', paddingTop: '20px' }}>
                    Click "Run Tests" to execute your solution against test cases via Wandbox / local sandbox.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         MODE 3: ASSESSMENT HISTORY
         ════════════════════════════════════════ */}
      {mainMode === 'history' && (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(15,23,42,0.8)' }} className="cpv-scrollbar">
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                  Assessment Attempt History
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  Review past 4-tier coding scores, test case results, and AI code evaluations.
                </p>
              </div>
              <button
                className="cpv-btn"
                onClick={handleStartNewAssessment}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                <span>New 4-Tier Assessment</span>
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader2 size={24} style={{ color: '#10B981', animation: 'cpv-spin 1s linear infinite' }} />
              </div>
            ) : historyList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {historyList.map(rec => {
                  const score = rec.score ?? rec.totalScore ?? 0;
                  return (
                    <div
                      key={rec.id}
                      style={{
                        padding: '16px',
                        background: 'rgba(30,41,59,0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(71,85,105,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.92rem' }}>
                            {rec.title || '4-Tier Coding Assessment'}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: score >= 80 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                              color: score >= 80 ? '#6EE7B7' : '#FCD34D',
                            }}
                          >
                            {score >= 80 ? 'Mastery' : score >= 60 ? 'Proficient' : 'Needs Practice'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>
                          Completed on {new Date(rec.date || (rec as any).createdAt).toLocaleDateString()} &bull; Easy: {rec.easyScore}/10 &bull; Med: {rec.mediumScore}/20 &bull; Med-Hard: {rec.mediumHardScore}/30 &bull; Star: {rec.starChallengeScore}/40
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: score >= 80 ? '#6EE7B7' : '#FCD34D' }}>
                            {score} <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>/ 100</span>
                          </div>
                        </div>
                        <button
                          className="cpv-btn"
                          onClick={() => {
                            setSelectedHistoryRecord(rec);
                            setIsScorecardOpen(true);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(71,85,105,0.4)',
                            color: '#E2E8F0',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            border: '1px solid rgba(71,85,105,0.5)',
                          }}
                        >
                          View Scorecard
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(30,41,59,0.3)', borderRadius: '12px' }}>
                <Trophy size={36} color="#64748B" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#CBD5E1', marginBottom: '6px' }}>No Completed Assessments Yet</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                  Take your first 4-tier coding assessment to receive comprehensive test-case evaluations and AI feedback.
                </p>
                <button
                  className="cpv-btn"
                  onClick={handleStartNewAssessment}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                  }}
                >
                  Start First Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         SCORECARD MODAL
         ════════════════════════════════════════ */}
      <CodingScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => {
          setIsScorecardOpen(false);
          setSelectedHistoryRecord(null);
        }}
        assessment={selectedHistoryRecord || completedRecord}
        onRetake={handleStartNewAssessment}
      />
    </div>
  );
};
