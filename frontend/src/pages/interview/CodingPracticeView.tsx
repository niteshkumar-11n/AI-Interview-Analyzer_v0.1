/**
 * Coding Practice View — Premium Responsive Offline-First UI
 *
 * Works without Judge0! Uses local problem data from codingProblems.ts.
 * Falls back to Judge0 for actual code execution when available.
 *
 * Features:
 * - Offline-first: All problems, starter code, optimal solutions loaded locally
 * - Topic filtering & problem navigation
 * - Monaco Code Editor with syntax highlighting
 * - 4 language support (Python, JavaScript, C++, Java)
 * - Show/Hide Solution toggle
 * - Test case display & simulated validation
 * - Fully responsive: mobile → tablet → desktop
 * - Premium dark theme with glassmorphism & micro-animations
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
  canAutoTest,
  type RunAllResult,
  type TestCaseResult,
} from '../../utils/codeRunner.ts';
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Trophy,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Terminal,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Server,
  Wifi,
  WifiOff,
  Cpu,
  MemoryStick,
  RefreshCw,
  BookOpen,
  Target,
  Award,
  Activity,
  Eye,
  EyeOff,
  Filter,
  Hash,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

/* ===========================
   Types & Constants
   =========================== */
type SupportedLanguage = 'Python' | 'JavaScript' | 'C++' | 'Java';

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

/* Difficulty colors */
function getDifficultyStyle(d: string): { bg: string; fg: string; glow: string } {
  if (d === 'Easy') return { bg: 'rgba(34,197,94,0.15)', fg: '#6EE7B7', glow: 'rgba(34,197,94,0.3)' };
  if (d === 'Medium') return { bg: 'rgba(245,158,11,0.15)', fg: '#FCD34D', glow: 'rgba(245,158,11,0.3)' };
  return { bg: 'rgba(239,68,68,0.15)', fg: '#FCA5A5', glow: 'rgba(239,68,68,0.3)' };
}

/* ===========================
   Component
   =========================== */
export const CodingPracticeView: React.FC<CodingPracticeViewProps> = () => {
  const { user } = useAuth();

  // ── Topic & Problem Selection ──
  const [selectedTopic, setSelectedTopic] = useState<string>('Arrays');
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // ── Language & Editor ──
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('Python');
  const [code, setCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  // ── UI State ──
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'solution'>('description');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'problem' | 'editor'>('problem');

  // ── Execution State ──
  const [judge0Status, setJudge0Status] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<RunAllResult | null>(null);
  const [outputTab, setOutputTab] = useState<'results' | 'output'>('results');

  // ── Timer ──
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Computed Data ──
  const topicProblems = useMemo(() => CODING_PROBLEMS[selectedTopic] || [], [selectedTopic]);
  const currentProblem: CodingProblem | null = topicProblems[selectedProblemIdx] || null;

  const allProblems = useMemo(() => {
    const all: CodingProblem[] = [];
    Object.values(CODING_PROBLEMS).forEach(problems => all.push(...problems));
    return all;
  }, []);

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

  // ── Check Judge0 Health (optional, non-blocking) ──
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

  // ── Sync starter code when problem or language changes ──
  useEffect(() => {
    if (currentProblem) {
      const starter = currentProblem.starterCode[selectedLang] || '// Write your code here\n';
      setCode(starter);
      setShowSolution(false);
      setCopiedSolution(false);
      setTestResults(null);
      setActiveTestCase(0);
    }
  }, [currentProblem?.id, selectedLang]);

  // ── Timer ──
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Handlers ──
  const handleTopicChange = (topic: string) => {
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

  const handleResetCode = () => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLang] || '');
      setTestResults(null);
    }
  };

  const handleShowSolution = () => {
    if (currentProblem && !showSolution) {
      setCode(currentProblem.optimalCode[selectedLang] || '// Solution not available');
    } else if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLang] || '');
    }
    setShowSolution(!showSolution);
  };

  const handleCopySolution = async () => {
    if (currentProblem) {
      await navigator.clipboard.writeText(currentProblem.optimalCode[selectedLang] || '');
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const handleRunCode = useCallback(async () => {
    if (isRunning || !currentProblem) return;
    setIsRunning(true);
    setTestResults(null);
    setOutputTab('results');

    try {
      const results = await runAllTests(
        code,
        currentProblem.id,
        selectedLang,
        currentProblem.testCases
      );
      setTestResults(results);
    } catch (err: any) {
      setTestResults({
        totalTests: currentProblem.testCases.length,
        passed: 0,
        failed: currentProblem.testCases.length,
        results: currentProblem.testCases.map((tc, i) => ({
          index: i, label: tc.label, passed: false,
          input: tc.input, expectedOutput: tc.expectedOutput,
          actualOutput: '', error: err.message || 'Execution failed',
          executionTimeMs: 0,
        })),
        overallTimeMs: 0,
        compilationError: err.message || 'Unknown error',
      });
    }
    setIsRunning(false);
  }, [isRunning, selectedLang, code, currentProblem]);

  // ── Start timer on first code change ──
  const handleCodeChange = (val: string | undefined) => {
    setCode(val || '');
    if (!timerRunning && val && val !== (currentProblem?.starterCode[selectedLang] || '')) {
      setTimerRunning(true);
    }
  };

  /* ===========================
     RENDER
     =========================== */
  if (!currentProblem) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
      }}>
        <AlertCircle size={36} style={{ color: '#F59E0B' }} />
        <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No problems available for this topic.</span>
      </div>
    );
  }

  const diffStyle = getDifficultyStyle(currentProblem.difficulty);

  return (
    <div id="coding-practice-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: '#E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes cpv-spin { to { transform: rotate(360deg); } }
        @keyframes cpv-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cpv-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cpv-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes cpv-glow { 0%, 100% { box-shadow: 0 0 5px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.6); } }
        .cpv-fade-in { animation: cpv-fadeIn 0.3s ease-out; }
        .cpv-slide-up { animation: cpv-slideUp 0.4s ease-out; }
        .cpv-hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .cpv-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .cpv-btn { transition: all 0.2s ease; cursor: pointer; border: none; outline: none; }
        .cpv-btn:hover { filter: brightness(1.1); }
        .cpv-btn:active { transform: scale(0.97); }
        .cpv-scrollbar::-webkit-scrollbar { width: 6px; }
        .cpv-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cpv-scrollbar::-webkit-scrollbar-thumb { background: rgba(71,85,105,0.4); border-radius: 3px; }
        .cpv-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,0.6); }

        /* Responsive mobile toggle */
        @media (max-width: 899px) {
          .cpv-desktop-only { display: none !important; }
          .cpv-mobile-toggle-bar { display: flex !important; }
        }
        @media (min-width: 900px) {
          .cpv-mobile-only { display: none !important; }
          .cpv-mobile-toggle-bar { display: none !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════
         TOP BAR
         ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '10px 12px' : '10px 20px',
        background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(71,85,105,0.3)',
        backdropFilter: 'blur(12px)', gap: '8px', flexShrink: 0, zIndex: 10,
        flexWrap: 'wrap',
      }}>
        {/* Left — Title + Topic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <Code2 size={18} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #E2E8F0, #94A3B8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Coding Practice
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0, whiteSpace: 'nowrap' }}>
              {allProblems.length} Problems • {TOPICS.length} Topics
            </p>
          </div>
        </div>

        {/* Right — Timer + Status + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '16px',
            background: timerRunning ? 'rgba(99,102,241,0.12)' : 'rgba(71,85,105,0.12)',
            border: `1px solid ${timerRunning ? 'rgba(99,102,241,0.3)' : 'rgba(71,85,105,0.2)'}`,
            cursor: 'pointer',
          }}
            onClick={() => {
              if (timerRunning) { setTimerRunning(false); }
              else { setTimerSeconds(0); setTimerRunning(true); }
            }}
          >
            <Clock size={12} color={timerRunning ? '#A5B4FC' : '#64748B'} />
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace',
              color: timerRunning ? '#A5B4FC' : '#64748B',
            }}>
              {formatTimer(timerSeconds)}
            </span>
          </div>

          {/* Judge0 Status */}
          <div className="cpv-desktop-only" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px', borderRadius: '16px',
            background: judge0Status === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${judge0Status === 'connected' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
          }}>
            {judge0Status === 'checking' ? (
              <Loader2 size={12} style={{ color: '#94A3B8', animation: 'cpv-spin 1s linear infinite' }} />
            ) : judge0Status === 'connected' ? (
              <Wifi size={12} color="#22C55E" />
            ) : (
              <Zap size={12} color="#F59E0B" />
            )}
            <span style={{
              fontSize: '0.68rem', fontWeight: 600,
              color: judge0Status === 'connected' ? '#22C55E' : judge0Status === 'checking' ? '#94A3B8' : '#F59E0B',
            }}>
              {judge0Status === 'checking' ? 'Checking...' : judge0Status === 'connected' ? 'Live Exec' : 'Offline Mode'}
            </span>
          </div>

          {/* User Avatar */}
          {user?.profile?.name && (
            <div className="cpv-desktop-only" style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              border: '2px solid rgba(99,102,241,0.3)',
            }}>
              {user.profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
         MOBILE VIEW TOGGLE BAR
         ════════════════════════════════════════ */}
      <div className="cpv-mobile-toggle-bar" style={{
        display: 'none', padding: '6px 12px',
        background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(71,85,105,0.2)',
        gap: '4px', flexShrink: 0,
      }}>
        {(['problem', 'editor'] as const).map(v => (
          <button
            key={v}
            className="cpv-btn"
            onClick={() => setMobileView(v)}
            style={{
              flex: 1, padding: '8px', borderRadius: '8px',
              background: mobileView === v ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: mobileView === v ? '#A5B4FC' : '#64748B',
              fontSize: '0.78rem', fontWeight: 700,
              border: mobileView === v ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {v === 'problem' ? <><BookOpen size={14} /> Problem</> : <><Terminal size={14} /> Editor</>}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
         MAIN CONTENT
         ════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row',
      }}>

        {/* ═══════ LEFT PANEL — Problem Description ═══════ */}
        <div style={{
          width: isMobile ? '100%' : (leftPanelOpen ? '42%' : '0px'),
          minWidth: isMobile ? 'auto' : (leftPanelOpen ? '340px' : '0px'),
          maxWidth: isMobile ? '100%' : (leftPanelOpen ? '600px' : '0px'),
          overflow: leftPanelOpen ? 'hidden' : 'hidden',
          borderRight: isMobile ? 'none' : '1px solid rgba(71,85,105,0.3)',
          transition: 'all 0.3s ease',
          display: isMobile ? (mobileView === 'problem' ? 'flex' : 'none') : (leftPanelOpen ? 'flex' : 'none'),
          flexDirection: 'column',
          flex: isMobile && mobileView === 'problem' ? 1 : undefined,
        }}>
          {/* Topic + Problem Selector */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid rgba(71,85,105,0.25)',
            background: 'rgba(15,23,42,0.6)',
            flexShrink: 0,
          }}>
            {/* Topic Selector */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <button
                className="cpv-btn"
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(30,41,59,0.8)', color: '#E2E8F0',
                  border: '1px solid rgba(71,85,105,0.4)',
                  fontSize: '0.8rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={13} color="#A5B4FC" />
                  {selectedTopic}
                  <span style={{
                    padding: '1px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700,
                    background: 'rgba(99,102,241,0.15)', color: '#A5B4FC',
                  }}>
                    {topicProblems.length}
                  </span>
                </span>
                <ChevronDown size={14} color="#64748B" style={{
                  transform: showTopicDropdown ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }} />
              </button>

              {showTopicDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  marginTop: '4px', padding: '6px',
                  background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(71,85,105,0.4)',
                  borderRadius: '10px', zIndex: 20,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  maxHeight: '280px', overflowY: 'auto',
                }} className="cpv-scrollbar cpv-fade-in">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      className="cpv-btn"
                      onClick={() => handleTopicChange(topic.id)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px',
                        background: selectedTopic === topic.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: selectedTopic === topic.id ? '#A5B4FC' : '#CBD5E1',
                        fontSize: '0.78rem', fontWeight: 600, textAlign: 'left',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '2px',
                      }}
                    >
                      <span>{topic.name}</span>
                      <span style={{
                        fontSize: '0.65rem', color: '#64748B',
                        padding: '1px 6px', borderRadius: '6px',
                        background: 'rgba(71,85,105,0.2)',
                      }}>
                        {(CODING_PROBLEMS[topic.id] || []).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Problem Navigator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedProblemIdx}
                onChange={e => setSelectedProblemIdx(Number(e.target.value))}
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: '8px',
                  background: 'rgba(30,41,59,0.8)', color: '#E2E8F0',
                  border: '1px solid rgba(71,85,105,0.4)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
                }}
              >
                {topicProblems.map((p, idx) => (
                  <option key={p.id} value={idx} style={{ background: '#1E293B' }}>
                    #{p.number} {p.title}
                  </option>
                ))}
              </select>
              <button onClick={handlePrevProblem} className="cpv-btn" style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                border: '1px solid rgba(71,85,105,0.4)', background: 'rgba(30,41,59,0.6)',
                color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={handleNextProblem} className="cpv-btn" style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                border: '1px solid rgba(71,85,105,0.4)', background: 'rgba(30,41,59,0.6)',
                color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Problem Tabs */}
          <div style={{
            display: 'flex', gap: '2px', padding: '6px 14px',
            borderBottom: '1px solid rgba(71,85,105,0.2)',
            background: 'rgba(15,23,42,0.4)', flexShrink: 0,
          }}>
            {([
              { key: 'description' as const, label: 'Description', icon: <BookOpen size={12} /> },
              { key: 'testcases' as const, label: 'Test Cases', icon: <Target size={12} /> },
              { key: 'solution' as const, label: 'Solution', icon: <Lightbulb size={12} /> },
            ]).map(t => (
              <button
                key={t.key}
                className="cpv-btn"
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '6px',
                  background: activeTab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: activeTab === t.key ? '#A5B4FC' : '#64748B',
                  fontSize: '0.72rem', fontWeight: 600,
                  border: activeTab === t.key ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="cpv-scrollbar cpv-fade-in">

            {/* ─── Description Tab ─── */}
            {activeTab === 'description' && (
              <div>
                {/* Title + Badges */}
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px', color: '#F1F5F9' }}>
                  {currentProblem.title}
                </h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                    background: diffStyle.bg, color: diffStyle.fg,
                    border: `1px solid ${diffStyle.glow}`,
                  }}>
                    {currentProblem.difficulty}
                  </span>
                  {currentProblem.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 600,
                      background: 'rgba(99,102,241,0.1)', color: '#A5B4FC',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      {tag}
                    </span>
                  ))}
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 600,
                    background: 'rgba(71,85,105,0.15)', color: '#94A3B8',
                  }}>
                    <Clock size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                    {currentProblem.timeComplexity}
                  </span>
                </div>

                {/* Description */}
                <div style={{ fontSize: '0.84rem', lineHeight: '1.7', color: '#CBD5E1', marginBottom: '20px' }}>
                  {currentProblem.description.split('\n\n').map((p, i) => (
                    <p key={i} style={{ marginBottom: '10px' }}>{p}</p>
                  ))}
                </div>

                {/* Examples */}
                {currentProblem.examples.map((ex, idx) => (
                  <div key={idx} style={{
                    marginBottom: '12px', padding: '14px', borderRadius: '10px',
                    background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(71,85,105,0.2)',
                  }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '6px' }}>
                      Example {idx + 1}:
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', lineHeight: '1.6' }}>
                      <div><strong style={{ color: '#94A3B8' }}>Input:</strong> <span style={{ color: '#E2E8F0' }}>{ex.input}</span></div>
                      <div><strong style={{ color: '#94A3B8' }}>Output:</strong> <span style={{ color: '#22C55E' }}>{ex.output}</span></div>
                      {ex.explanation && (
                        <div style={{ marginTop: '4px' }}>
                          <strong style={{ color: '#94A3B8' }}>Explanation:</strong>{' '}
                          <span style={{ color: '#CBD5E1' }}>{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Constraints:
                  </div>
                  <ul style={{
                    paddingLeft: '18px', margin: 0,
                    fontSize: '0.76rem', color: '#94A3B8', fontFamily: 'monospace', lineHeight: '1.6',
                  }}>
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Similar Problems */}
                {currentProblem.similarProblems?.length > 0 && (
                  <div style={{
                    padding: '12px', borderRadius: '10px',
                    background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(71,85,105,0.15)',
                  }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrendingUp size={13} /> Similar Problems
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {currentProblem.similarProblems.map((sp, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', borderRadius: '6px',
                          background: 'rgba(15,23,42,0.4)',
                          fontSize: '0.73rem', color: '#94A3B8',
                        }}>
                          <span>{sp.title}</span>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 600,
                            color: getDifficultyStyle(sp.difficulty).fg,
                          }}>{sp.difficulty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Test Cases Tab ─── */}
            {activeTab === 'testcases' && (
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {currentProblem.testCases.map((tc, idx) => (
                    <button
                      key={tc.id}
                      className="cpv-btn"
                      onClick={() => setActiveTestCase(idx)}
                      style={{
                        padding: '5px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600,
                        border: activeTestCase === idx ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(71,85,105,0.3)',
                        background: activeTestCase === idx ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
                        color: activeTestCase === idx ? '#A5B4FC' : '#64748B',
                      }}
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>
                {currentProblem.testCases[activeTestCase] && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem' }} className="cpv-fade-in">
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Input:</div>
                      <pre style={{
                        margin: 0, padding: '12px', borderRadius: '8px',
                        background: 'rgba(30,41,59,0.6)', color: '#E2E8F0',
                        whiteSpace: 'pre-wrap', lineHeight: '1.5',
                        border: '1px solid rgba(71,85,105,0.2)',
                      }}>
                        {currentProblem.testCases[activeTestCase].input}
                      </pre>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Expected Output:</div>
                      <pre style={{
                        margin: 0, padding: '12px', borderRadius: '8px',
                        background: 'rgba(34,197,94,0.06)', color: '#86EFAC',
                        whiteSpace: 'pre-wrap', lineHeight: '1.5',
                        border: '1px solid rgba(34,197,94,0.15)',
                      }}>
                        {currentProblem.testCases[activeTestCase].expectedOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Solution Tab ─── */}
            {activeTab === 'solution' && (
              <div>
                {/* Approach */}
                <div style={{
                  padding: '14px', borderRadius: '10px', marginBottom: '16px',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Lightbulb size={15} color="#A5B4FC" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A5B4FC' }}>
                      {currentProblem.approach.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '10px' }}>
                    {currentProblem.approach.explanation}
                  </p>
                  <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '0.76rem', color: '#94A3B8', lineHeight: '1.7' }}>
                    {currentProblem.approach.steps.map((s, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{s}</li>
                    ))}
                  </ol>
                </div>

                {/* Complexity */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    flex: 1, minWidth: '120px', padding: '10px 14px', borderRadius: '8px',
                    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(71,85,105,0.2)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Clock size={14} color="#6366F1" />
                    <div>
                      <div style={{ fontSize: '0.66rem', color: '#64748B' }}>Time</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>{currentProblem.timeComplexity}</div>
                    </div>
                  </div>
                  <div style={{
                    flex: 1, minWidth: '120px', padding: '10px 14px', borderRadius: '8px',
                    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(71,85,105,0.2)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Layers size={14} color="#8B5CF6" />
                    <div>
                      <div style={{ fontSize: '0.66rem', color: '#64748B' }}>Space</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>{currentProblem.spaceComplexity}</div>
                    </div>
                  </div>
                </div>

                {/* Optimal Code */}
                <div style={{
                  borderRadius: '10px', overflow: 'hidden',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px',
                    background: 'rgba(34,197,94,0.08)',
                    borderBottom: '1px solid rgba(34,197,94,0.15)',
                  }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} /> Optimal Solution ({selectedLang})
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="cpv-btn" onClick={handleCopySolution} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600,
                        background: 'rgba(34,197,94,0.15)', color: '#6EE7B7',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        {copiedSolution ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                      </button>
                      <button className="cpv-btn" onClick={handleShowSolution} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600,
                        background: 'rgba(99,102,241,0.15)', color: '#A5B4FC',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <ArrowRight size={11} /> Load in Editor
                      </button>
                    </div>
                  </div>
                  <pre style={{
                    margin: 0, padding: '14px', fontSize: '0.76rem',
                    background: 'rgba(15,23,42,0.8)', color: '#E2E8F0',
                    whiteSpace: 'pre-wrap', lineHeight: '1.5', fontFamily: "'Fira Code', monospace",
                    maxHeight: '300px', overflowY: 'auto',
                  }} className="cpv-scrollbar">
                    {currentProblem.optimalCode[selectedLang] || '// Solution not available'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ RIGHT PANEL — Editor + Output ═══════ */}
        <div style={{
          flex: 1, display: isMobile ? (mobileView === 'editor' ? 'flex' : 'none') : 'flex',
          flexDirection: 'column', overflow: 'hidden', minWidth: 0,
        }}>
          {/* Editor Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 12px', gap: '6px',
            background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(71,85,105,0.3)',
            flexWrap: 'wrap', flexShrink: 0,
          }}>
            {/* Left — Toggle + Language */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Panel toggle (desktop only) */}
              <button
                className="cpv-btn cpv-desktop-only"
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                title={leftPanelOpen ? 'Hide Problem' : 'Show Problem'}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  border: '1px solid rgba(71,85,105,0.4)', background: 'transparent',
                  color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {leftPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
              </button>

              {/* Language Selector */}
              <div style={{ display: 'flex', gap: '3px', background: 'rgba(30,41,59,0.6)', borderRadius: '8px', padding: '2px' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    className="cpv-btn"
                    onClick={() => setSelectedLang(lang.id)}
                    style={{
                      padding: '5px 10px', borderRadius: '6px',
                      background: selectedLang === lang.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: selectedLang === lang.id ? '#A5B4FC' : '#64748B',
                      fontSize: '0.72rem', fontWeight: 600,
                      border: selectedLang === lang.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ marginRight: '3px' }}>{lang.icon}</span>
                    {isMobile ? '' : lang.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={handleResetCode} className="cpv-btn" title="Reset Code" style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: '1px solid rgba(71,85,105,0.4)', background: 'transparent',
                color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RotateCcw size={13} />
              </button>
              <button onClick={handleShowSolution} className="cpv-btn" title={showSolution ? 'Hide Solution' : 'Show Solution'} style={{
                padding: '5px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600,
                border: '1px solid rgba(245,158,11,0.3)',
                background: showSolution ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: showSolution ? '#FCD34D' : '#64748B',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
                <span className="cpv-desktop-only">{showSolution ? 'Hide' : 'Solution'}</span>
              </button>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="cpv-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 14px', borderRadius: '8px',
                  background: isRunning ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', fontSize: '0.76rem', fontWeight: 700,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxShadow: isRunning ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
                }}
              >
                {isRunning ? <Loader2 size={13} style={{ animation: 'cpv-spin 1s linear infinite' }} /> : <Play size={13} fill="#fff" />}
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, minHeight: isMobile ? '250px' : '300px' }}>
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.id === selectedLang)?.monacoId || 'plaintext'}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: isMobile ? 13 : 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12 },
                lineNumbersMinChars: 3,
                glyphMargin: false,
                folding: true,
                tabSize: 4,
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'gutter',
              }}
            />
          </div>

          {/* ─── OUTPUT PANEL — Test Results ─── */}
          <div style={{
            borderTop: '1px solid rgba(71,85,105,0.3)',
            background: 'rgba(15,23,42,0.9)',
            minHeight: isMobile ? '150px' : '200px',
            maxHeight: isMobile ? '300px' : '350px',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            {/* Output Header with Tabs */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid rgba(71,85,105,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {([{ key: 'results' as const, label: 'Test Results', icon: <Target size={12} /> },
                   { key: 'output' as const, label: 'Raw Output', icon: <Terminal size={12} /> }]).map(t => (
                  <button key={t.key} className="cpv-btn" onClick={() => setOutputTab(t.key)} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                    background: outputTab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: outputTab === t.key ? '#A5B4FC' : '#64748B',
                    border: outputTab === t.key ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              {/* Score Badge */}
              {testResults && !isRunning && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '10px',
                    background: testResults.passed === testResults.totalTests
                      ? 'rgba(34,197,94,0.15)' : testResults.passed > 0
                      ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: testResults.passed === testResults.totalTests
                      ? '#22C55E' : testResults.passed > 0
                      ? '#F59E0B' : '#EF4444',
                    border: `1px solid ${testResults.passed === testResults.totalTests
                      ? 'rgba(34,197,94,0.3)' : testResults.passed > 0
                      ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {testResults.passed === testResults.totalTests ? '✓ All Passed' : `${testResults.passed}/${testResults.totalTests} Passed`}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                    {testResults.overallTimeMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* Output Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }} className="cpv-scrollbar">

              {/* Loading */}
              {isRunning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A5B4FC', padding: '8px 0' }}>
                  <Loader2 size={16} style={{ animation: 'cpv-spin 1s linear infinite' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Running tests...</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                      {selectedLang === 'JavaScript' ? 'Executing locally in browser' : `Executing ${selectedLang} via Wandbox API`}
                    </div>
                  </div>
                </div>
              )}

              {/* No results yet */}
              {!testResults && !isRunning && (
                <div style={{ color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                  <Play size={16} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click "Run" to test your code</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                      {selectedLang === 'JavaScript'
                        ? 'JavaScript runs instantly in your browser — no server needed!'
                        : `${selectedLang} will be compiled & run via Wandbox API (free)`}
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results Tab */}
              {testResults && !isRunning && outputTab === 'results' && (
                <div className="cpv-fade-in">
                  {/* Compilation error banner */}
                  {testResults.compilationError && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '10px 12px', borderRadius: '8px', marginBottom: '10px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                      <AlertCircle size={14} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.76rem', color: '#FCA5A5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {testResults.compilationError}
                      </div>
                    </div>
                  )}

                  {/* Per-test results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {testResults.results.map((tr) => (
                      <div key={tr.index} style={{
                        padding: '10px 12px', borderRadius: '8px',
                        background: tr.passed ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${tr.passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}>
                        {/* Test header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tr.passed ? 0 : '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {tr.passed
                              ? <CheckCircle2 size={14} color="#22C55E" />
                              : <XCircle size={14} color="#EF4444" />
                            }
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: tr.passed ? '#6EE7B7' : '#FCA5A5' }}>
                              {tr.label}
                            </span>
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 600,
                              padding: '1px 8px', borderRadius: '8px',
                              background: tr.passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: tr.passed ? '#22C55E' : '#EF4444',
                            }}>
                              {tr.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                            {tr.executionTimeMs}ms
                          </span>
                        </div>

                        {/* Failure details */}
                        {!tr.passed && (
                          <div style={{ fontSize: '0.74rem', fontFamily: 'monospace' }}>
                            {tr.error && (
                              <div style={{ marginBottom: '6px' }}>
                                <span style={{ color: '#EF4444', fontWeight: 600 }}>Error: </span>
                                <span style={{ color: '#FCA5A5', whiteSpace: 'pre-wrap' }}>{tr.error}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '120px' }}>
                                <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 600, marginBottom: '3px' }}>Expected:</div>
                                <pre style={{
                                  margin: 0, padding: '6px 8px', borderRadius: '6px',
                                  background: 'rgba(34,197,94,0.06)', color: '#86EFAC',
                                  whiteSpace: 'pre-wrap', fontSize: '0.74rem',
                                  border: '1px solid rgba(34,197,94,0.1)',
                                }}>{tr.expectedOutput}</pre>
                              </div>
                              <div style={{ flex: 1, minWidth: '120px' }}>
                                <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 600, marginBottom: '3px' }}>Your Output:</div>
                                <pre style={{
                                  margin: 0, padding: '6px 8px', borderRadius: '6px',
                                  background: 'rgba(239,68,68,0.06)', color: '#FCA5A5',
                                  whiteSpace: 'pre-wrap', fontSize: '0.74rem',
                                  border: '1px solid rgba(239,68,68,0.1)',
                                }}>{tr.actualOutput || '(no output)'}</pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Success banner */}
                  {testResults.passed === testResults.totalTests && testResults.totalTests > 0 && (
                    <div style={{
                      marginTop: '10px', padding: '12px 14px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.06))',
                      border: '1px solid rgba(34,197,94,0.2)',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <Trophy size={20} color="#22C55E" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22C55E' }}>All Test Cases Passed! 🎉</div>
                        <div style={{ fontSize: '0.72rem', color: '#6EE7B7', marginTop: '2px' }}>
                          Executed in {testResults.overallTimeMs}ms • Try the next problem!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Output Tab */}
              {testResults && !isRunning && outputTab === 'output' && (
                <div className="cpv-fade-in" style={{ fontFamily: 'monospace', fontSize: '0.76rem' }}>
                  {testResults.results.map((tr, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                        {tr.label}:
                      </div>
                      <pre style={{
                        margin: 0, padding: '8px', borderRadius: '6px',
                        background: 'rgba(30,41,59,0.6)', color: tr.error ? '#FCA5A5' : '#E2E8F0',
                        whiteSpace: 'pre-wrap', lineHeight: '1.5',
                        border: `1px solid ${tr.error ? 'rgba(239,68,68,0.15)' : 'rgba(71,85,105,0.2)'}`,
                      }}>{tr.actualOutput || tr.error || '(no output)'}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
