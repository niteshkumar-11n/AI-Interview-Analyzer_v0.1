import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types.ts';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Code2, 
  Users, 
  FolderGit2, 
  ArrowRight, 
  Bot, 
  ThumbsUp, 
  Check, 
  RotateCcw,
  Sliders,
  Send
} from 'lucide-react';

interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentRecorded: (data: DashboardData) => void;
  onOpenCoding?: () => void;
}

type InterviewTrack = 'Technical' | 'HR' | 'Project';

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  isOpen,
  onClose,
  onAssessmentRecorded,
  onOpenCoding,
}) => {
  const { user } = useAuth();
  const candidateName = user?.profile?.name || 'Candidate';
  const [track, setTrack] = useState<InterviewTrack>('Project');
  const [title, setTitle] = useState('Project Deep-Dive: AI Resume Analyzer & MERN');
  const [role, setRole] = useState('Full Stack Engineer (SDE-1)');
  const [overallScore, setOverallScore] = useState(86);
  const [technical, setTechnical] = useState(88);
  const [problemSolving, setProblemSolving] = useState(84);
  const [communication, setCommunication] = useState(86);
  const [codeQuality, setCodeQuality] = useState(85);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Track-specific interview questions generated from candidate resume profile
  const trackQuestions: Record<InterviewTrack, { question: string; context: string; keyPoints: string[] }[]> = {
    Technical: [
      {
        question: 'Explain how Node.js handles asynchronous non-blocking I/O using the Event Loop and libuv thread pool.',
        context: 'Core Backend Competency &bull; Node.js / Express',
        keyPoints: ['Call Stack', 'Event Queue / Microtask Queue', 'libuv worker threads for crypto/fs', 'Non-blocking timers']
      },
      {
        question: 'In React 18/19, how does concurrent rendering differ from previous synchronous reconciliation?',
        context: 'Frontend Architecture &bull; React',
        keyPoints: ['Fiber tree interruption', 'useTransition / useDeferredValue', 'Time slicing', 'Batching updates']
      },
      {
        question: 'When designing MongoDB schemas for an e-commerce platform, when would you embed documents versus referencing them?',
        context: 'Database Design &bull; MongoDB',
        keyPoints: ['1-to-few vs 1-to-many', '16MB BSON document limit', 'Read vs write performance', 'Atomic updates']
      }
    ],
    HR: [
      {
        question: 'Tell me about a time when a team member disagreed with your architectural approach. How did you resolve it?',
        context: 'STAR Behavioral &bull; Conflict Resolution & Collaboration',
        keyPoints: ['Situation setup', 'Objective data/benchmarking used', 'Active listening', 'Positive project outcome']
      },
      {
        question: 'Describe a situation where a project deadline was moved up significantly. How did you prioritize deliverables?',
        context: 'STAR Behavioral &bull; Prioritization & Pressure Management',
        keyPoints: ['Scope renegotiation (MoSCoW)', 'Transparent stakeholder updates', 'Focus on MVP', 'Maintaining code quality']
      },
      {
        question: 'Why are you passionate about transitioning from a student into a full-time Full Stack Engineer at our company?',
        context: 'Culture Fit & Motivation &bull; Career Ambition',
        keyPoints: ['Specific company mission interest', 'Demonstrated self-learning (3 built projects)', 'Growth mindset', 'Long-term value creation']
      }
    ],
    Project: [
      {
        question: 'In your "AI Resume Analyzer" project, how did you handle varied PDF structures and ensure accurate extraction of technical skills and scores?',
        context: 'Resume Project #1 &bull; AI Resume Analyzer (NLP & Parsing)',
        keyPoints: ['Text extraction pipeline (pdf-parse)', 'Prompt engineering with structured JSON schema', 'Handling edge-case layouts', 'Error fallback mechanisms']
      },
      {
        question: 'For your "E-commerce Web App", how did you guarantee data consistency during concurrent order checkouts and handle payment webhook verifications?',
        context: 'Resume Project #2 &bull; E-commerce Web App (MERN)',
        keyPoints: ['Database transactions / locks', 'Stripe webhook signature validation', 'Idempotency keys to avoid double-charging', 'Inventory decrementation']
      },
      {
        question: 'In your "Weather Forecasting App", how did you implement client-side caching and prevent exceeding third-party API rate limits?',
        context: 'Resume Project #3 &bull; Weather Forecasting App',
        keyPoints: ['LocalStorage / Redis TTL cache', 'Debounced search inputs', 'Geolocation API error fallbacks', 'Optimistic UI rendering']
      }
    ]
  };

  const currentQuestions = trackQuestions[track];
  const activeQ = currentQuestions[activeQuestionIdx] || currentQuestions[0];

  const handleTrackChange = (newTrack: InterviewTrack) => {
    setTrack(newTrack);
    setActiveQuestionIdx(0);
    setCandidateAnswer('');
    setEvalFeedback(null);
    if (newTrack === 'Technical') {
      setTitle('Technical Interview: React, Node.js & System Architecture');
    } else if (newTrack === 'HR') {
      setTitle('HR Behavioral Interview: STAR Competency & Culture Fit');
    } else {
      setTitle('Project Deep-Dive: AI Resume Analyzer & MERN Projects');
    }
  };

  const handleEvaluateAnswer = () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvalFeedback(
        `AI Evaluation: Strong answer! You articulated key architectural trade-offs well. High score on technical clarity (88%) and structured reasoning. Tip: Mentioning automated tests or monitoring metrics would strengthen your answer even further.`
      );
    }, 1200);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      const res = await api.dashboard.recordMockInterview({
        title,
        role,
        score: overallScore,
        breakdown: {
          technical,
          problemSolving,
          communication,
          codeQuality,
        },
        feedback: `Completed ${track} interview simulation. Candidate showed strong command of fundamentals and articulated project details with clarity.`
      });

      if (res.success) {
        setNotice('Interview score recorded! Candidate readiness analytics updated.');
        onAssessmentRecorded(res.data);
        setTimeout(() => {
          onClose();
          setNotice(null);
        }, 1200);
      }
    } catch (err: any) {
      setNotice(err.message || 'Failed to submit interview score.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-light border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs"
                style={{ width: '38px', height: '38px', backgroundColor: '#2563EB' }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold fs-6 mb-0 text-dark">
                  AI Interview Simulation Suite
                </h5>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
                  Candidate: <strong>{candidateName}</strong> &bull; SDE-1 Readiness Platform
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {notice && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                  <CheckCircle2 size={16} />
                  <span>{notice}</span>
                </div>
              )}

              {/* Step 1: Track Selector matching Architecture Flowchart (Technical | HR | Project) */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  Select AI Interview Track (from Project Structure):
                </label>
                <div className="row g-2">
                  <div className="col-12 col-md-4">
                    <button
                      type="button"
                      onClick={() => handleTrackChange('Technical')}
                      className={`btn w-100 p-2.5 rounded-3 text-start border transition-all ${
                        track === 'Technical' 
                          ? 'border-primary bg-primary text-white shadow-xs' 
                          : 'bg-light text-dark'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Code2 size={16} />
                        <span className="fw-bold small">1. Technical Interview</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: track === 'Technical' ? 0.9 : 0.7 }}>
                        React, Node.js, Python, MongoDB algorithms & system fundamentals.
                      </div>
                    </button>
                  </div>

                  <div className="col-12 col-md-4">
                    <button
                      type="button"
                      onClick={() => handleTrackChange('HR')}
                      className={`btn w-100 p-2.5 rounded-3 text-start border transition-all ${
                        track === 'HR' 
                          ? 'border-primary bg-primary text-white shadow-xs' 
                          : 'bg-light text-dark'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Users size={16} />
                        <span className="fw-bold small">2. HR Behavioral</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: track === 'HR' ? 0.9 : 0.7 }}>
                        STAR method situational questions, teamwork & conflict resolution.
                      </div>
                    </button>
                  </div>

                  <div className="col-12 col-md-4">
                    <button
                      type="button"
                      onClick={() => handleTrackChange('Project')}
                      className={`btn w-100 p-2.5 rounded-3 text-start border transition-all ${
                        track === 'Project' 
                          ? 'border-primary bg-primary text-white shadow-xs' 
                          : 'bg-light text-dark'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <FolderGit2 size={16} />
                        <span className="fw-bold small">3. Project Deep-Dive</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: track === 'Project' ? 0.9 : 0.7 }}>
                        Specific questions on {candidateName}&apos;s parsed projects!
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Interactive Question Simulator */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-lg-7">
                  <div className="p-3.5 rounded-3 border bg-light h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small">
                          Question {activeQuestionIdx + 1} of {currentQuestions.length}
                        </span>
                        <div className="btn-group btn-group-sm">
                          {currentQuestions.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setActiveQuestionIdx(i); setEvalFeedback(null); }}
                              className={`btn ${activeQuestionIdx === i ? 'btn-primary' : 'btn-outline-secondary'}`}
                              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                            >
                              Q{i + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-secondary small fw-medium mb-1" style={{ fontSize: '0.75rem' }}>
                        {activeQ.context}
                      </div>

                      <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        &ldquo;{activeQ.question}&rdquo;
                      </h6>

                      {/* Expected Key Points */}
                      <div className="p-2.5 rounded-2 bg-white border mb-3">
                        <div className="fw-bold text-secondary small mb-1" style={{ fontSize: '0.72rem' }}>
                          Key Points AI Interviewer Expects:
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {activeQ.keyPoints.map((kp, idx) => (
                            <span key={idx} className="badge bg-light text-dark border small" style={{ fontSize: '0.68rem' }}>
                              <Check size={11} className="text-success me-1" />
                              {kp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Candidate Answer Input */}
                      <div>
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Your Answer (Practice Articulating or Type):
                        </label>
                        <textarea
                          rows={3}
                          className="form-control"
                          placeholder="Explain your approach, architectural decisions, trade-offs, and metrics..."
                          value={candidateAnswer}
                          onChange={(e) => setCandidateAnswer(e.target.value)}
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <button
                          type="button"
                          onClick={handleEvaluateAnswer}
                          disabled={isEvaluating || !candidateAnswer.trim()}
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5"
                          style={{ fontSize: '0.78rem' }}
                        >
                          {isEvaluating ? (
                            <span>Analyzing with AI...</span>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>Get AI Critique</span>
                            </>
                          )}
                        </button>

                        <div className="d-flex gap-2">
                          {onOpenCoding && (
                            <button
                              type="button"
                              onClick={() => { onClose(); onOpenCoding(); }}
                              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                              style={{ fontSize: '0.74rem' }}
                            >
                              <Code2 size={13} />
                              <span>Coding Practice</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {evalFeedback && (
                        <div className="alert alert-info py-2 px-3 small rounded-3 mt-2 mb-0" style={{ fontSize: '0.76rem' }}>
                          {evalFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Score Recording Sliders */}
                <div className="col-12 col-lg-5">
                  <div className="p-3.5 rounded-3 border bg-white h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small">
                        <Sliders size={16} />
                        <span>Assessment Scores</span>
                      </div>

                      <div className="mb-2.5">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.75rem' }}>
                          Assessment Title
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small text-secondary mb-0.5" style={{ fontSize: '0.75rem' }}>
                          Target Role
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>

                      {/* Overall score range */}
                      <div className="p-2.5 bg-light rounded-2 border mb-2.5">
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span className="text-dark">Overall Score</span>
                          <span className="badge bg-primary fs-6">{overallScore}%</span>
                        </div>
                        <input
                          type="range"
                          className="form-range"
                          min="50"
                          max="100"
                          value={overallScore}
                          onChange={(e) => setOverallScore(Number(e.target.value))}
                        />
                      </div>

                      <div className="row g-2">
                        <div className="col-6">
                          <div className="p-2 bg-light rounded-2 border">
                            <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                              <span>Technical</span>
                              <span className="text-primary fw-bold">{technical}%</span>
                            </div>
                            <input
                              type="range"
                              className="form-range"
                              min="50"
                              max="100"
                              value={technical}
                              onChange={(e) => setTechnical(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="p-2 bg-light rounded-2 border">
                            <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                              <span>Problem Solving</span>
                              <span className="text-primary fw-bold">{problemSolving}%</span>
                            </div>
                            <input
                              type="range"
                              className="form-range"
                              min="50"
                              max="100"
                              value={problemSolving}
                              onChange={(e) => setProblemSolving(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="p-2 bg-light rounded-2 border">
                            <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                              <span>Communication</span>
                              <span className="text-primary fw-bold">{communication}%</span>
                            </div>
                            <input
                              type="range"
                              className="form-range"
                              min="50"
                              max="100"
                              value={communication}
                              onChange={(e) => setCommunication(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="p-2 bg-light rounded-2 border">
                            <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                              <span>Code Quality</span>
                              <span className="text-primary fw-bold">{codeQuality}%</span>
                            </div>
                            <input
                              type="range"
                              className="form-range"
                              min="50"
                              max="100"
                              value={codeQuality}
                              onChange={(e) => setCodeQuality(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-top">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-xs d-flex align-items-center justify-content-center gap-2"
                        style={{ backgroundColor: '#2563EB', fontSize: '0.85rem' }}
                      >
                        {submitting ? (
                          <span>Updating Dashboard Readiness...</span>
                        ) : (
                          <>
                            <span>Save & Update Readiness Index</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
