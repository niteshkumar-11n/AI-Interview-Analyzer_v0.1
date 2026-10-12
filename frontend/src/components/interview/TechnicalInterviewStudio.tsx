import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  InterviewSessionData, 
  TechnicalInterviewReport, 
  QuestionWiseScore 
} from '../../types.ts';
import femaleVideo from '../../assets/videos/female-ai.mp4';
import maleVideo from '../../assets/videos/male-ai.mp4';
import {
  Coins,
  Play,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Download,
  Brain,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  History,
  FileText,
  UserCheck,
  Check,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TechnicalInterviewStudioProps {
  onOpenCreditModal: () => void;
  onOpenHistoryModal: () => void;
  onNavigateToDashboard?: () => void;
}

export const TechnicalInterviewStudio: React.FC<TechnicalInterviewStudioProps> = ({
  onOpenCreditModal,
  onOpenHistoryModal,
  onNavigateToDashboard
}) => {
  const { user } = useAuth();

  // Wizard Steps: 1 = Setup, 2 = Live Session, 3 = Scorecard Report
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Setup Form State
  const [category, setCategory] = useState<string>('Full Stack');
  const [role, setRole] = useState<string>(user?.profile?.targetRole || 'Full Stack Engineer');
  const [experience, setExperience] = useState<string>(user?.profile?.experience || '1-2 years');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [mode, setMode] = useState<'Technical' | 'HR'>('Technical');

  // Loading & Error States
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Active Session State
  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeoutTriggered, setIsTimeoutTriggered] = useState(false);

  // Synchronized refs to prevent stale timer closures
  const answerTextRef = useRef('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    answerTextRef.current = answerText;
  }, [answerText]);

  // Audio / Speech State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [subtitles, setSubtitles] = useState('');
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Final Report State
  const [report, setReport] = useState<TechnicalInterviewReport | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const categories = [
    'Full Stack',
    'Frontend (React/TypeScript)',
    'Backend (Node.js/Express)',
    'Database & System Design',
    'DevOps & Cloud (Docker/AWS)',
    'Data Structures & Algorithms'
  ];

  const currentQuestion = session?.questions[currentIdx];

  // ================= SPEECH SYNTHESIS (TTS) =================
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      if (voiceGender === 'female') {
        const femaleVoice = voices.find(v => 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha')
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('mark')
        );
        if (maleVoice) utterance.voice = maleVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = voiceGender === 'female' ? 1.05 : 0.95;

      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setSubtitles(text);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      };

      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        resolve();
      };

      utterance.onerror = () => {
        setIsAiSpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // ================= SPEECH RECOGNITION (STT) =================
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setAnswerText(prev => prev ? `${prev} ${transcript.trim()}` : transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsMicOn(false);
      };

      recognition.onend = () => {
        setIsMicOn(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly.');
      return;
    }

    if (isMicOn) {
      try { recognitionRef.current.stop(); } catch {}
      setIsMicOn(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsMicOn(true);
      } catch {
        setIsMicOn(false);
      }
    }
  };

  // ================= SUBMIT ANSWER & ADVANCE =================
  const submitAnswerAndAdvance = async (candidateAnswer: string, isTimeout: boolean = false) => {
    if (!session || isSubmittingRef.current || isFinishing) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    if (isTimeout) setIsTimeoutTriggered(true);

    // Stop microphone if active
    if (recognitionRef.current && isMicOn) {
      try { recognitionRef.current.stop(); } catch {}
      setIsMicOn(false);
    }

    // Stop speech synthesis if speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    const timeLimit = currentQuestion?.timeLimit || 60;
    const timeSpent = isTimeout ? timeLimit : Math.max(1, timeLimit - timeLeft);
    const trimmed = (candidateAnswer || '').trim();

    try {
      await api.interview.submitAnswer({
        interviewId: session.interviewId,
        questionIndex: currentIdx,
        answer: trimmed,
        timeTaken: Math.max(1, timeSpent)
      });
    } catch (err: any) {
      console.warn('[InterviewStudio] Submit answer warning:', err.message);
    }

    // Check if more questions remain
    if (currentIdx + 1 < session.questions.length) {
      const nextIdx = currentIdx + 1;
      const nextQ = session.questions[nextIdx];
      setCurrentIdx(nextIdx);
      setAnswerText('');
      answerTextRef.current = '';
      setIsTimeoutTriggered(false);
      setTimeLeft(nextQ.timeLimit || 60);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      // Read the next question
      speakText(nextQ.question);
    } else {
      // Completed all 5 questions -> Finalize interview
      setIsFinishing(true);
      try {
        const res = await api.interview.finish({ interviewId: session.interviewId });
        if (res.success && res.data) {
          setReport(res.data);
          setStep(3);
        }
      } catch (err: any) {
        console.error('[InterviewStudio] Finish interview error:', err);
        alert('Failed to generate scorecard report: ' + err.message);
      } finally {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        setIsFinishing(false);
        setIsTimeoutTriggered(false);
      }
    }
  };

  // ================= QUESTION TIMER =================
  useEffect(() => {
    if (step !== 2 || !currentQuestion || isSubmitting || isFinishing) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Automatically advance when timer runs out
          submitAnswerAndAdvance(answerTextRef.current, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, currentIdx, isSubmitting, isFinishing, currentQuestion, session]);

  // Read initial question aloud on session start
  useEffect(() => {
    if (step === 2 && currentQuestion && currentIdx === 0) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setAnswerText('');
      answerTextRef.current = '';
      speakText(currentQuestion.question);
    }
  }, [step, session]);

  // ================= STEP 1: START INTERVIEW =================
  const handleStartInterview = async () => {
    setStartError(null);
    setIsStarting(true);

    try {
      const res = await api.interview.generateQuestions({
        role: role.trim(),
        category,
        experience: experience.trim(),
        difficulty,
        mode,
        skills: user?.profile?.skills?.map(s => s.name) || []
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to start interview.');
      }

      setSession(res.data);
      setCurrentIdx(0);
      setAnswerText('');
      answerTextRef.current = '';
      setTimeLeft(res.data.questions[0]?.timeLimit || 60);
      setStep(2);
    } catch (err: any) {
      console.error('Start interview error:', err);
      setStartError(err.message || 'Failed to start interview. Check credit balance.');
    } finally {
      setIsStarting(false);
    }
  };

  // ================= PDF REPORT EXPORT =================
  const handleDownloadPdf = () => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Primary blue
    doc.text('SkillNexus AI — Interview Performance Report', pageWidth / 2, y, { align: 'center' });
    y += 7;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Candidate Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${user?.profile?.name || user?.email || 'Alex Sharma'}`, margin, y);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString('en-GB')}`, pageWidth - margin - 45, y);
    y += 6;
    doc.text(`Role: ${report.role} (${report.mode})`, margin, y);
    doc.text(`Difficulty: ${report.difficulty}`, pageWidth - margin - 45, y);
    y += 12;

    // Score Summary Card
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 64, 175);
    doc.text(`Overall Score: ${report.finalScore} / 10  (${Math.round(report.finalScore * 10)}%)`, pageWidth / 2, y + 14, { align: 'center' });
    y += 30;

    // Skill Breakdown
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Correctness: ${report.correctness} / 10`, margin + 10, y + 13);
    doc.text(`Communication: ${report.communication} / 10`, margin + 65, y + 13);
    doc.text(`Confidence: ${report.confidence} / 10`, margin + 125, y + 13);
    y += 30;

    // Question Breakdown Table
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Question', 'Score', 'Feedback']],
      body: report.questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback || 'Answer recorded.'
      ]),
      styles: { fontSize: 8.5, cellPadding: 4, valign: 'top' },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 'auto' }
      }
    });

    doc.save(`SkillNexus_Interview_Report_${report.role.replace(/\s+/g, '_')}.pdf`);
  };

  const videoSource = voiceGender === 'female' ? femaleVideo : maleVideo;

  // ================= RENDER =================
  return (
    <div className="w-100">
      {/* ================= STEP 1: SETUP ================= */}
      {step === 1 && (
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
          <div className="row g-0">
            {/* Left Setup Banner */}
            <div 
              className="col-12 col-lg-5 p-4 p-md-5 d-flex flex-column justify-content-between text-white"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)'
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge rounded-pill bg-white text-primary px-3 py-1.5 fw-bold small">
                    AI Smart Simulator
                  </span>
                  <span className="badge rounded-pill bg-blue-400 bg-opacity-25 text-white px-2.5 py-1.5 small">
                    Voice + Video Avatar
                  </span>
                </div>

                <h2 className="fw-bold tracking-tight mb-3 text-white" style={{ fontSize: '1.9rem', lineHeight: '1.2' }}>
                  Technical Interview Engine
                </h2>
                <p className="text-blue-100 mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Simulate high-pressure technical interviews tailored to your exact target role, experience, and domain. Receive real-time speech evaluation and comprehensive scorecards.
                </p>

                <div className="d-flex flex-column gap-3 mb-4">
                  {[
                    { title: 'Interactive Audio & Video Avatar', desc: 'Real speech synthesis and voice answer recognition.' },
                    { title: 'Comprehensive Rubric Scoring', desc: 'Scored on correctness, conceptual depth, and communication.' },
                    { title: 'Full Scorecard & PDF Export', desc: 'Download accredited performance reports for your portfolio.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="d-flex align-items-start gap-2.5">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                        style={{ width: '22px', height: '22px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <Check size={13} className="text-white" />
                      </div>
                      <div>
                        <div className="fw-semibold text-white small">{feat.title}</div>
                        <div className="text-blue-200" style={{ fontSize: '0.78rem' }}>{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet Credits Bar */}
              <div 
                className="p-3 rounded-3 d-flex align-items-center justify-content-between border"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <Coins size={20} className="text-amber-300" />
                  <div>
                    <div className="text-white small fw-bold">Session Cost: 50 Credits</div>
                    <div className="text-blue-200" style={{ fontSize: '0.75rem' }}>
                      Available Balance: <strong>{user?.credits ?? 100}</strong> Credits
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onOpenCreditModal}
                  className="btn btn-sm btn-light text-primary fw-bold rounded-pill px-3 py-1 small shadow-xs"
                >
                  Buy Credits
                </button>
              </div>
            </div>

            {/* Right Configuration Form */}
            <div className="col-12 col-lg-7 p-4 p-md-5">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h4 className="fw-bold text-dark mb-1">Configure Your Session</h4>
                  <p className="text-secondary small mb-0">Select your parameters to generate realistic questions.</p>
                </div>

                <button 
                  onClick={onOpenHistoryModal}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.82rem' }}
                >
                  <History size={15} />
                  <span>Past Interviews</span>
                </button>
              </div>

              {startError && (
                <div className="alert alert-danger rounded-3 p-3 small mb-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <AlertCircle size={18} className="text-danger flex-shrink-0" />
                    <span>{startError}</span>
                  </div>
                  <button 
                    onClick={onOpenCreditModal}
                    className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold small flex-shrink-0"
                  >
                    Refill Credits
                  </button>
                </div>
              )}

              <div className="d-flex flex-column gap-3.5">
                {/* Category Selection */}
                <div>
                  <label className="form-label text-dark fw-semibold small mb-1.5">
                    Interview Subject & Category
                  </label>
                  <select 
                    className="form-select rounded-3 py-2 text-dark"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ fontSize: '0.88rem' }}
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Role Input */}
                <div>
                  <label className="form-label text-dark fw-semibold small mb-1.5">
                    Target Job Title / Role
                  </label>
                  <input 
                    type="text"
                    className="form-control rounded-3 py-2 text-dark"
                    placeholder="e.g. Full Stack Engineer, React Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ fontSize: '0.88rem' }}
                  />
                </div>

                {/* Experience & Difficulty Row */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-dark fw-semibold small mb-1.5">
                      Experience Level
                    </label>
                    <select 
                      className="form-select rounded-3 py-2 text-dark"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      style={{ fontSize: '0.88rem' }}
                    >
                      <option value="Fresher / Entry Level">Fresher / Entry Level (0-1 yr)</option>
                      <option value="1-3 years">Junior / Mid (1-3 yrs)</option>
                      <option value="3-5 years">Mid-Senior (3-5 yrs)</option>
                      <option value="5+ years">Lead / Principal (5+ yrs)</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label text-dark fw-semibold small mb-1.5">
                      Difficulty Level
                    </label>
                    <select 
                      className="form-select rounded-3 py-2 text-dark"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{ fontSize: '0.88rem' }}
                    >
                      <option value="Beginner">Beginner (Foundational)</option>
                      <option value="Intermediate">Intermediate (Real-world scenarios)</option>
                      <option value="Advanced">Advanced (High-scale & Edge cases)</option>
                    </select>
                  </div>
                </div>

                {/* Interview Mode (Technical vs HR) */}
                <div>
                  <label className="form-label text-dark fw-semibold small mb-1.5">
                    Interview Round
                  </label>
                  <div className="d-flex gap-3">
                    <label 
                      className={`btn flex-fill rounded-3 py-2.5 px-3 border text-start d-flex align-items-center gap-2 ${
                        mode === 'Technical' ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'border-slate-200 text-secondary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input 
                        type="radio" 
                        name="mode" 
                        className="d-none" 
                        checked={mode === 'Technical'} 
                        onChange={() => setMode('Technical')} 
                      />
                      <Brain size={18} />
                      <span className="small">Technical Round</span>
                    </label>

                    <label 
                      className={`btn flex-fill rounded-3 py-2.5 px-3 border text-start d-flex align-items-center gap-2 ${
                        mode === 'HR' ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'border-slate-200 text-secondary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input 
                        type="radio" 
                        name="mode" 
                        className="d-none" 
                        checked={mode === 'HR'} 
                        onChange={() => setMode('HR')} 
                      />
                      <UserCheck size={18} />
                      <span className="small">HR / Behavioral Round</span>
                    </label>
                  </div>
                </div>

                {/* Submit Launch Button */}
                <div className="pt-3">
                  <button
                    onClick={handleStartInterview}
                    disabled={isStarting || !role.trim()}
                    className="btn btn-primary w-100 rounded-3 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    style={{ fontSize: '0.95rem' }}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating Progressive Questions...</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} fill="currentColor" />
                        <span>Launch AI Technical Interview (50 Credits)</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-muted small mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                    Instant AI generation • 5 questions • Real voice evaluation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: LIVE AI INTERVIEW ================= */}
      {step === 2 && session && currentQuestion && (
        <div 
          className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden"
          style={{ minHeight: '620px' }}
        >
          {/* Top Session Progress Bar */}
          <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-slate-50 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill small">
                Question {currentIdx + 1} of {session.questions.length}
              </span>
              <span className="fw-bold text-dark small">
                {session.role} ({session.difficulty})
              </span>
            </div>

            {/* Voice Avatar Selector & Controls */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-1.5 bg-white border px-2.5 py-1 rounded-pill">
                <span className="text-muted small">Interviewer Voice:</span>
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`btn btn-sm py-0 px-2 rounded-pill fw-semibold ${
                    voiceGender === 'female' ? 'btn-primary' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                >
                  Female
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`btn btn-sm py-0 px-2 rounded-pill fw-semibold ${
                    voiceGender === 'male' ? 'btn-primary' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                >
                  Male
                </button>
              </div>

              {/* Status Badge */}
              <div className="d-flex align-items-center gap-1.5 text-secondary small">
                <Clock size={15} />
                <span>Session Active</span>
              </div>
            </div>
          </div>

          <div className="row g-0 flex-grow-1">
            {/* Left Column: AI Avatar & Timer */}
            <div 
              className="col-12 col-lg-4 p-4 border-end d-flex flex-column align-items-center justify-content-between bg-slate-50"
              style={{ minHeight: '360px' }}
            >
              {/* Video Avatar Player */}
              <div 
                className="w-100 rounded-4 overflow-hidden position-relative shadow-sm mb-3 bg-dark"
                style={{ aspectRatio: '16/10', maxHeight: '220px' }}
              >
                <video
                  ref={videoRef}
                  src={videoSource}
                  playsInline
                  muted
                  loop
                  className="w-100 h-100 object-fit-cover"
                />

                {/* Talking Indicator Overlay */}
                <div 
                  className="position-absolute bottom-0 start-0 m-2 px-2.5 py-1 rounded-pill d-flex align-items-center gap-1.5 text-white small"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', fontSize: '0.72rem' }}
                >
                  <span 
                    className="rounded-circle"
                    style={{
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: isAiSpeaking ? '#22C55E' : '#94A3B8'
                    }}
                  />
                  <span>{isAiSpeaking ? 'AI Speaking...' : 'Listening to Candidate'}</span>
                </div>
              </div>

              {/* Question Subtitles Box */}
              {subtitles && (
                <div 
                  className="w-100 p-2.5 rounded-3 mb-3 border bg-white small text-secondary text-center"
                  style={{ fontSize: '0.78rem', minHeight: '48px' }}
                >
                  "{subtitles}"
                </div>
              )}

              {/* Circular SVG Timer */}
              <div className="w-100 p-3 rounded-3 bg-white border text-center shadow-xs">
                <div className="d-flex justify-content-between align-items-center mb-2 text-secondary small">
                  <span>Time Remaining</span>
                  <span className={`fw-bold ${timeLeft < 15 ? 'text-danger' : 'text-primary'}`}>
                    {timeLeft}s
                  </span>
                </div>

                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${timeLeft < 15 ? 'bg-danger' : 'bg-primary'}`}
                    role="progressbar"
                    style={{ width: `${(timeLeft / (currentQuestion.timeLimit || 60)) * 100}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between text-muted small mt-2" style={{ fontSize: '0.7rem' }}>
                  <span>Difficulty: {currentQuestion.difficulty.toUpperCase()}</span>
                  <span>Limit: {currentQuestion.timeLimit}s</span>
                </div>
              </div>
            </div>

            {/* Right Column: Question & Answer Interaction */}
            <div className="col-12 col-lg-8 p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                {/* Active Question Banner */}
                <div className="p-3.5 rounded-3 border mb-4 bg-blue-50 border-blue-200">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-primary fw-bold small text-uppercase tracking-wider">
                      Question {currentIdx + 1} of {session.questions.length}
                    </span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {currentQuestion.difficulty} &bull; {currentQuestion.timeLimit || 60}s limit
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mb-0 lh-base" style={{ fontSize: '1.15rem' }}>
                    {currentQuestion.question}
                  </h5>
                </div>

                {/* Candidate Answer Box */}
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold small d-flex justify-content-between">
                    <span>Your Response</span>
                    <span className="text-secondary fw-normal">
                      Speak via Microphone or Type Response
                    </span>
                  </label>

                  <textarea
                    rows={6}
                    disabled={isSubmitting || isFinishing}
                    className="form-control rounded-3 p-3 text-dark font-monospace"
                    style={{ fontSize: '0.88rem', resize: 'vertical' }}
                    placeholder="Speak using the microphone button below or type your response here..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                </div>
              </div>

              {/* Bottom Actions: Mic + Submit Button */}
              <div className="pt-2">
                {isTimeoutTriggered && (
                  <div className="alert alert-warning py-1.5 px-3 mb-2 small d-flex align-items-center gap-2">
                    <Clock size={14} className="text-warning flex-shrink-0" />
                    <span>Time limit reached! Recording response and advancing...</span>
                  </div>
                )}

                <div className="d-flex align-items-center gap-3">
                  <button
                    onClick={toggleMic}
                    disabled={isSubmitting || isFinishing}
                    className={`btn rounded-3 p-3 d-flex align-items-center justify-content-center shadow-xs ${
                      isMicOn ? 'btn-danger' : 'btn-dark'
                    }`}
                    style={{ width: '52px', height: '52px' }}
                    title={isMicOn ? 'Stop Microphone' : 'Start Speech Recognition'}
                  >
                    {isMicOn ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>

                  <button
                    onClick={() => submitAnswerAndAdvance(answerText, false)}
                    disabled={isSubmitting || isFinishing}
                    className={`btn flex-grow-1 rounded-3 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm ${
                      currentIdx + 1 === session.questions.length ? 'btn-success' : 'btn-primary'
                    }`}
                    style={
                      currentIdx + 1 === session.questions.length
                        ? { backgroundColor: '#059669', borderColor: '#059669' }
                        : {}
                    }
                  >
                    {isSubmitting || isFinishing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>
                          {currentIdx + 1 === session.questions.length
                            ? 'Evaluating All 5 Questions & Generating Scorecard...'
                            : `Saving & Moving to Question ${currentIdx + 2}...`}
                        </span>
                      </>
                    ) : (
                      <>
                        {currentIdx + 1 === session.questions.length ? (
                          <>
                            <Award size={18} />
                            <span>Submit Final Answer &amp; Complete Interview</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Submit Answer &amp; Next Question</span>
                            <ArrowRight size={18} className="ms-1" />
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SCORECARD REPORT ================= */}
      {step === 3 && report && (
        <div className="d-flex flex-column gap-4">
          {/* Top Actions Bar */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-emerald-100 text-emerald-800 rounded-pill px-3 py-1 font-semibold small">
                  Session Completed
                </span>
                <span className="text-secondary small">
                  {new Date(report.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                {report.role} — AI Scorecard &amp; Performance Review
              </h3>
            </div>

            <div className="d-flex align-items-center gap-2">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="btn btn-outline-secondary rounded-3 px-3.5 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{ fontSize: '0.88rem' }}
                >
                  <ArrowRight size={16} />
                  <span>Return to Dashboard</span>
                </button>
              )}

              <button
                onClick={handleDownloadPdf}
                className="btn btn-outline-primary rounded-3 px-3.5 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ fontSize: '0.88rem' }}
              >
                <Download size={16} />
                <span>Download PDF Report</span>
              </button>

              <button
                onClick={() => setStep(1)}
                className="btn btn-primary rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2"
                style={{ fontSize: '0.88rem' }}
              >
                <RotateCcw size={16} />
                <span>Start New Interview</span>
              </button>
            </div>
          </div>

          {/* Personalized AI Feedback Card */}
          <div 
            className="card p-4 border-0 rounded-4 shadow-sm bg-white"
            style={{ borderLeft: '5px solid #2563EB', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <Sparkles size={20} className="text-primary" />
              <h5 className="fw-bold text-dark mb-0 fs-6">Personalized AI Evaluation &amp; Feedback</h5>
            </div>
            <p className="text-dark mb-0 lh-base" style={{ fontSize: '0.92rem' }}>
              {report.overallFeedback || `Great job completing the 5-question ${report.role} interview! Your overall score is ${report.scoreOutOf100 || Math.round(report.finalScore * 10)}/100. Review the detailed question breakdown below to target areas for improvement.`}
            </p>
          </div>

          {/* Metrics Overview Grid */}
          <div className="row g-3">
            {/* Overall Score Card */}
            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 rounded-4 shadow-sm bg-white text-center d-flex flex-column justify-content-between">
                <div>
                  <h6 className="text-secondary small fw-bold text-uppercase mb-3">Overall Performance</h6>
                  <div className="position-relative d-inline-block my-2">
                    <div 
                      className="rounded-circle d-flex flex-column align-items-center justify-content-center mx-auto"
                      style={{
                        width: '120px', 
                        height: '120px', 
                        backgroundColor: '#EFF6FF',
                        border: '8px solid #2563EB'
                      }}
                    >
                      <span className="fs-1 fw-bold text-dark lh-1">{report.finalScore}</span>
                      <span className="text-muted small mt-1">/ 10</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className={`badge px-3 py-1.5 rounded-pill ${
                    report.finalScore >= 7.5 ? 'bg-emerald-100 text-emerald-700' :
                    report.finalScore >= 5.5 ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {report.finalScore >= 7.5 ? 'Strong Interview Readiness' :
                     report.finalScore >= 5.5 ? 'Moderate Foundations' :
                     'Needs Structured Revision'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rubric Breakdown Card */}
            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 rounded-4 shadow-sm bg-white">
                <h6 className="text-secondary small fw-bold text-uppercase mb-3">Competency Breakdown</h6>
                <div className="d-flex flex-column gap-3.5 my-auto">
                  {[
                    { label: 'Technical Correctness', val: report.correctness, color: '#2563EB' },
                    { label: 'Communication Clarity', val: report.communication, color: '#10B981' },
                    { label: 'Candidate Confidence', val: report.confidence, color: '#F59E0B' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="d-flex justify-content-between small fw-semibold text-dark mb-1">
                        <span>{item.label}</span>
                        <span>{item.val} / 10</span>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div 
                          className="progress-bar rounded-pill"
                          role="progressbar"
                          style={{ width: `${item.val * 10}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Practice Topics */}
            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 rounded-4 shadow-sm bg-white d-flex flex-column justify-content-between">
                <div>
                  <h6 className="text-secondary small fw-bold text-uppercase mb-3">Recommended Practice Topics</h6>
                  {report.recommendedPracticeTopics && report.recommendedPracticeTopics.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {report.recommendedPracticeTopics.map((topic, idx) => (
                        <span key={idx} className="badge bg-slate-100 text-slate-700 px-3 py-2 rounded-3 small fw-semibold border">
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary small mb-0">
                      Solid performance! Continue practicing high-scale architecture and edge-case handling.
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-top text-muted small" style={{ fontSize: '0.78rem' }}>
                  Based on AI detection of missing concepts in candidate responses.
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
            <h6 className="fw-bold text-dark mb-3">Question-by-Question Score Trend</h6>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.questionWiseScore.map((q, i) => ({ name: `Q${i+1}`, score: q.score }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Question Review Cards */}
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
            <h5 className="fw-bold text-dark mb-4">Detailed Question Breakdown</h5>
            <div className="d-flex flex-column gap-3.5">
              {report.questionWiseScore.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-3 border bg-slate-50">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <span className="badge bg-slate-200 text-slate-800 small me-2">Q{idx + 1}</span>
                      <span className="fw-bold text-dark">{item.question}</span>
                    </div>
                    <span className="badge bg-primary text-white px-2.5 py-1.5 rounded-pill flex-shrink-0">
                      {item.score} / 10
                    </span>
                  </div>

                  {item.answer && (
                    <div className="p-2.5 rounded-2 bg-white border small text-secondary mb-2.5 font-monospace">
                      <strong className="text-dark">Your Response: </strong>
                      {item.answer}
                    </div>
                  )}

                  <div className="p-2.5 rounded-2 bg-blue-50 border border-blue-100 text-blue-900 small">
                    <strong>AI Feedback: </strong>
                    {item.feedback || 'Evaluated successfully.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
