import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  FileText, 
  Target, 
  UploadCloud, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  Briefcase, 
  Wrench, 
  GraduationCap, 
  ClipboardList, 
  Code2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  X, 
  Lightbulb, 
  BookOpen, 
  ChevronRight,
  RefreshCw, 
  ExternalLink,
  Layers, 
  HelpCircle,
  FileCheck,
  Play,
  Mic,
  Code,
  Copy,
  CheckCheck,
  TrendingUp,
  UserCheck,
  BarChart3,
  RotateCcw,
  Download,
  Search,
  Sparkle,
  Zap,
  Brain,
  Shield,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react';

export type JobMatchingStage = 'upload' | 'analyzing' | 'jd-analysis' | 'match-gap';

interface JobMatchingViewProps {
  onOpenRoadmap?: () => void;
  onOpenSupport?: () => void;
  onNavigateToResume?: () => void;
  onNavigateToJobs?: () => void;
  onNavigateToInterview?: () => void;
  onNavigateToCoding?: () => void;
  onNavigateToVoice?: () => void;
  onOpenMockTest?: () => void;
}

// Gemini API result type (matches backend response)
interface GeminiAnalysisResult {
  jobPosting: {
    title: string;
    company: string;
    location: string;
    experienceRequired: string;
    educationRequired: string;
  };
  extractedRequirements: {
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    technologiesMentioned: string[];
    keyResponsibilities: string[];
  };
  matchAnalysis: {
    overallMatchScore: number;
    skillsMatchPercent: number;
    experienceMatchPercent: number;
    educationMatchPercent: number;
    projectRelevancePercent: number;
  };
  skillComparison: {
    matchedSkills: string[];
    partialSkills: { name: string; note: string }[];
    missingSkills: { name: string; priority: 'Critical' | 'Moderate' | 'Low'; scoreImpact: string }[];
  };
  learningPath: {
    title: string;
    description: string;
    duration: string;
  }[];
  summary: string;
  improvementTips: string[];
}

/* ─── Inline styles for premium aesthetics ─── */
const GRADIENT_PRIMARY = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const GRADIENT_CARD = 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))';
const GRADIENT_DARK = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
const GRADIENT_SUCCESS = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
const GRADIENT_ACCENT = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)';
const GLASS_BG = 'rgba(255, 255, 255, 0.7)';
const GLASS_BORDER = '1px solid rgba(255, 255, 255, 0.3)';

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 25%, #f0fdf4 50%, #fef3c7 75%, #fdf2f8 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    padding: '24px',
  } as React.CSSProperties,
  heroSection: {
    background: GRADIENT_DARK,
    borderRadius: '24px',
    padding: '32px 36px',
    marginBottom: '28px',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
  } as React.CSSProperties,
  heroOverlay: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(139,92,246,0.2) 0%, transparent 50%)',
    pointerEvents: 'none' as const,
  },
  glassMorphCard: {
    background: GLASS_BG,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: GLASS_BORDER,
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  premiumCard: {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  iconBadge: (color: string) => ({
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 4px 12px ${color}40`,
  }),
  stepperPill: (active: boolean, completed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    borderRadius: '50px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: active ? '2px solid #6366f1' : completed ? '2px solid #10b981' : '2px solid #e2e8f0',
    background: active ? 'linear-gradient(135deg, #eef2ff, #ede9fe)' : completed ? '#ecfdf5' : 'white',
    color: active ? '#4f46e5' : completed ? '#059669' : '#64748b',
    boxShadow: active ? '0 4px 16px rgba(99,102,241,0.15)' : 'none',
  }),
  analyzeBtn: {
    background: GRADIENT_ACCENT,
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    padding: '16px 32px',
    fontSize: '1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  scoreCircle: (score: number) => ({
    background: score >= 80 ? GRADIENT_SUCCESS : score >= 60 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: score >= 80 
      ? '0 12px 40px rgba(16,185,129,0.3)' 
      : score >= 60 
      ? '0 12px 40px rgba(245,158,11,0.3)' 
      : '0 12px 40px rgba(239,68,68,0.3)',
    position: 'relative' as const,
  }),
  skillPill: (type: 'matched' | 'partial' | 'missing') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    cursor: 'default',
    ...(type === 'matched' ? {
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      color: '#047857',
      border: '1px solid #a7f3d0',
    } : type === 'partial' ? {
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      color: '#b45309',
      border: '1px solid #fde68a',
    } : {
      background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
      color: '#b91c1c',
      border: '1px solid #fecaca',
    }),
  }),
  progressBar: (percent: number, color: string) => ({
    height: '8px',
    borderRadius: '4px',
    background: '#f1f5f9',
    overflow: 'hidden' as const,
  }),
  progressFill: (percent: number, color: string) => ({
    height: '100%',
    width: `${percent}%`,
    borderRadius: '4px',
    background: color,
    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
  }),
};

/* ─── Keyframe injection ─── */
const injectKeyframes = () => {
  if (document.getElementById('jd-premium-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'jd-premium-keyframes';
  style.textContent = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .jd-card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important;
    }
    .jd-skill-pill:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .jd-action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important;
      border-color: #6366f1 !important;
    }
    .jd-textarea:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.1) !important;
      outline: none;
    }
    .jd-btn-shimmer::after {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 3s infinite;
    }
    @media (max-width: 768px) {
      .jd-hero-section { padding: 20px !important; border-radius: 16px !important; }
      .jd-stepper-row { flex-direction: column !important; gap: 8px !important; }
      .jd-stepper-pill { width: 100% !important; justify-content: center !important; }
      .jd-main-grid { grid-template-columns: 1fr !important; }
      .jd-score-section { flex-direction: column !important; }
      .jd-match-cols { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 576px) {
      .jd-page-container { padding: 12px !important; }
      .jd-hero-section { padding: 16px !important; }
    }
  `;
  document.head.appendChild(style);
};

/* ─── Sample JD Templates ─── */
const JD_TEMPLATES = [
  {
    id: 'fullstack',
    label: 'Full Stack Developer',
    company: 'TechCorp',
    icon: <Code2 size={14} />,
    text: `Full Stack Developer at TechCorp Solutions
Location: Bangalore, India (Hybrid)
Experience: 2 - 4 years

Required Skills:
- React.js, Node.js, Express.js
- MongoDB, REST API, JavaScript, Git
- AWS (EC2, S3, Lambda), Docker containerization

Preferred Skills:
- TypeScript, Kubernetes orchestration, CI/CD pipelines
- System Design principles, GraphQL APIs

Key Responsibilities:
- Develop and maintain web applications using React and Node.js
- Design and implement RESTful APIs
- Work with MongoDB for data storage
- Deploy and manage applications on AWS
- Collaborate with cross-functional teams
- Write clean, scalable, and maintainable code
- Participate in code reviews`
  },
  {
    id: 'frontend',
    label: 'Frontend Engineer',
    company: 'Razorpay',
    icon: <Layers size={14} />,
    text: `Frontend Engineer at Razorpay
Location: Bengaluru, India (Hybrid)
Experience: 1 - 3 years

Required Skills:
- React, JavaScript (ES6+), TypeScript
- Tailwind CSS, HTML5, CSS3, Modern State Management
- Git version control and collaborative workflows

Preferred Skills:
- Next.js (SSR/SSG), Performance Optimization
- Jest / React Testing Library, GraphQL integration

Responsibilities:
- Build merchant payment interfaces and interactive dashboards
- Deliver pixel-perfect, accessible, and fast web UIs
- Work closely with designers and product managers`
  },
  {
    id: 'backend',
    label: 'Backend Engineer',
    company: 'Swiggy',
    icon: <Shield size={14} />,
    text: `Backend Cloud Engineer at Swiggy
Location: Bangalore, India (On-site)
Experience: 2 - 5 years

Required Skills:
- Node.js, Express.js, MongoDB
- Redis caching, Microservices architecture, Kafka
- High-availability REST API design

Preferred Skills:
- Go / Golang, Distributed Systems, Docker & Kubernetes
- Observability (Prometheus, Grafana)`
  }
];

export const JobMatchingView: React.FC<JobMatchingViewProps> = ({
  onOpenRoadmap,
  onOpenSupport,
  onNavigateToResume,
  onNavigateToJobs,
  onNavigateToInterview,
  onNavigateToCoding,
  onNavigateToVoice,
  onOpenMockTest
}) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<JobMatchingStage>('upload');

  // Input state
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [activeInputTab, setActiveInputTab] = useState<'paste' | 'upload'>('paste');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [showResumeInput, setShowResumeInput] = useState<boolean>(false);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);
  const [analyzingStep, setAnalyzingStep] = useState<string>('');

  // UI state
  const [showJdJsonModal, setShowJdJsonModal] = useState<boolean>(false);
  const [showDetailedReportModal, setShowDetailedReportModal] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const candidateName = user?.profile?.name || 'Candidate';

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Load a sample JD template
  const handleLoadTemplate = (template: typeof JD_TEMPLATES[0]) => {
    setJobDescriptionText(template.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Start Gemini Analysis
  const handleStartAnalysis = async () => {
    if (!jobDescriptionText.trim() || jobDescriptionText.trim().length < 20) {
      setAnalysisError('Please enter a job description (at least 20 characters).');
      return;
    }
    setAnalysisError(null);
    setIsAnalyzing(true);
    setStage('analyzing');
    setAnalyzingProgress(0);

    // Animate progress
    const steps = [
      { p: 15, t: 'Reading and parsing Job Description text...' },
      { p: 35, t: 'Extracting role title, skills & requirements via Gemini AI...' },
      { p: 55, t: 'Comparing with candidate resume profile...' },
      { p: 75, t: 'Computing match scores & identifying skill gaps...' },
      { p: 90, t: 'Generating personalized learning recommendations...' },
    ];

    const timers: NodeJS.Timeout[] = [];
    steps.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setAnalyzingProgress(step.p);
        setAnalyzingStep(step.t);
      }, i * 800));
    });

    try {
      const response = await api.job.analyzeJD(jobDescriptionText.trim(), resumeText.trim());
      
      timers.forEach(t => clearTimeout(t));
      setAnalyzingProgress(100);
      setAnalyzingStep('Analysis Complete! Rendering results...');

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        setTimeout(() => {
          setStage('jd-analysis');
          setIsAnalyzing(false);
        }, 600);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (err: any) {
      timers.forEach(t => clearTimeout(t));
      setAnalysisError(err.message || 'Failed to analyze. Please check your Gemini API key.');
      setIsAnalyzing(false);
      setStage('upload');
    }
  };

  const handleCopyJson = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 55) return 'Moderate Match';
    return 'Needs Improvement';
  };

  const r = analysisResult; // shorthand

  return (
    <div className="jd-page-container" style={styles.pageContainer}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* ═══════════════════════════════════════════════════
            HERO SECTION 
        ═══════════════════════════════════════════════════ */}
        <div className="jd-hero-section" style={styles.heroSection}>
          <div style={styles.heroOverlay} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: GRADIENT_ACCENT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                  animation: 'float 3s ease-in-out infinite',
                }}>
                  <FileText size={28} color="white" />
                </div>
                <div>
                  <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    Job Description Intelligence
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '4px 0 0' }}>
                    Powered by <span style={{ color: '#a78bfa', fontWeight: 700 }}>Google Gemini AI</span> — Upload JD · Extract Requirements · Match Resume · Identify Gaps
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
                background: 'rgba(255,255,255,0.08)', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: GRADIENT_ACCENT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', fontWeight: 700 }}>
                    AI-Powered Analysis
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
                    Real-time Gemini matching
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            STEPPER NAV 
        ═══════════════════════════════════════════════════ */}
        <div style={{ ...styles.premiumCard, padding: '16px 24px', marginBottom: '28px' }}>
          <div className="jd-stepper-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Step 1 */}
              <div
                className="jd-stepper-pill"
                onClick={() => setStage('upload')}
                style={styles.stepperPill(stage === 'upload', stage !== 'upload')}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: stage === 'upload' ? '#6366f1' : stage !== 'upload' ? '#10b981' : '#e2e8f0',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800,
                }}>
                  {stage !== 'upload' ? <Check size={14} /> : '1'}
                </div>
                <span>Upload JD</span>
              </div>

              <ChevronRight size={16} style={{ color: '#cbd5e1' }} />

              {/* Step 2 */}
              <div
                className="jd-stepper-pill"
                onClick={() => r && setStage('jd-analysis')}
                style={styles.stepperPill(stage === 'jd-analysis', stage === 'match-gap')}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: stage === 'jd-analysis' ? '#6366f1' : stage === 'match-gap' ? '#10b981' : '#e2e8f0',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800,
                }}>
                  {stage === 'match-gap' ? <Check size={14} /> : '2'}
                </div>
                <span>JD Analysis</span>
              </div>

              <ChevronRight size={16} style={{ color: '#cbd5e1' }} />

              {/* Step 3 */}
              <div
                className="jd-stepper-pill"
                onClick={() => r && setStage('match-gap')}
                style={styles.stepperPill(stage === 'match-gap', false)}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: stage === 'match-gap' ? '#6366f1' : '#e2e8f0',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800,
                }}>3</div>
                <span>Resume Match & Gaps</span>
              </div>
            </div>

            {/* Resume indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '12px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              fontSize: '0.78rem',
            }}>
              <UserCheck size={14} style={{ color: '#6366f1' }} />
              <span style={{ color: '#64748b' }}>Candidate:</span>
              <strong style={{ color: '#1e293b' }}>{candidateName}</strong>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            STAGE 1: UPLOAD JOB DESCRIPTION 
        ═══════════════════════════════════════════════════ */}
        {stage === 'upload' && (
          <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="jd-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
              
              {/* Left: Input Card */}
              <div className="jd-card-hover" style={{ ...styles.glassMorphCard, padding: '28px' }}>
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={styles.iconBadge(GRADIENT_ACCENT)}>
                      <UploadCloud size={22} color="white" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Upload Job Description
                      </h2>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                        Paste the job posting or upload a file
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
                    color: '#6366f1', padding: '6px 14px', borderRadius: '10px',
                    fontSize: '0.72rem', fontWeight: 700,
                  }}>Step 1 of 3</span>
                </div>

                {/* Quick Templates */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>
                    Quick-load sample JD templates:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {JD_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleLoadTemplate(t)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 14px', borderRadius: '10px',
                          border: '1px solid #e2e8f0', background: 'white',
                          fontSize: '0.76rem', fontWeight: 600, color: '#475569',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          (e.target as HTMLElement).style.borderColor = '#6366f1';
                          (e.target as HTMLElement).style.background = '#eef2ff';
                        }}
                        onMouseLeave={e => {
                          (e.target as HTMLElement).style.borderColor = '#e2e8f0';
                          (e.target as HTMLElement).style.background = 'white';
                        }}
                      >
                        {t.icon}
                        <span>{t.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>({t.company})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                  <button
                    onClick={() => setActiveInputTab('paste')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      background: activeInputTab === 'paste' ? 'white' : 'transparent',
                      color: activeInputTab === 'paste' ? '#6366f1' : '#64748b',
                      boxShadow: activeInputTab === 'paste' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    ✏️ Paste Text
                  </button>
                  <button
                    onClick={() => setActiveInputTab('upload')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      background: activeInputTab === 'upload' ? 'white' : 'transparent',
                      color: activeInputTab === 'upload' ? '#6366f1' : '#64748b',
                      boxShadow: activeInputTab === 'upload' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    📄 Upload File
                  </button>
                </div>

                {/* Input Area */}
                {activeInputTab === 'paste' ? (
                  <div style={{ marginBottom: '16px' }}>
                    <textarea
                      ref={textareaRef}
                      className="jd-textarea"
                      rows={12}
                      placeholder={`Paste the complete job description here...\n\nExample:\nRole: Full Stack Developer\nCompany: TechCorp\nRequired Skills: React, Node.js, MongoDB, AWS, Docker\nKey Responsibilities: Design REST APIs, manage databases...`}
                      value={jobDescriptionText}
                      onChange={e => setJobDescriptionText(e.target.value)}
                      style={{
                        width: '100%', resize: 'none', padding: '16px', borderRadius: '14px',
                        border: '2px solid #e2e8f0', fontSize: '0.84rem', lineHeight: 1.6,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        color: '#334155', background: '#fafbff',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Supports plaintext, markdown, or copied LinkedIn/Indeed JDs
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {jobDescriptionText.length} chars · {jobDescriptionText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed #cbd5e1', borderRadius: '16px',
                    padding: '40px 24px', textAlign: 'center', marginBottom: '16px',
                    background: '#fafbff', cursor: 'pointer', transition: 'all 0.2s',
                    minHeight: '200px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '12px',
                    }}>
                      <UploadCloud size={28} style={{ color: '#6366f1' }} />
                    </div>
                    {uploadedFileName ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', marginBottom: '4px' }}>{uploadedFileName}</div>
                        <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 12px' }}>File attached · Ready for AI analysis</p>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', marginBottom: '4px' }}>
                          Drop your JD file here
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 12px' }}>
                          Supports PDF, DOCX, TXT formats
                        </p>
                      </>
                    )}
                    <label style={{
                      padding: '8px 20px', borderRadius: '10px', border: '1px solid #6366f1',
                      color: '#6366f1', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      Browse Files
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept=".pdf,.docx,.txt"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFileName(file.name);
                            // Read text files directly
                            if (file.name.endsWith('.txt')) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                setJobDescriptionText(ev.target?.result as string || '');
                              };
                              reader.readAsText(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Optional Resume Input */}
                <div style={{ marginBottom: '16px' }}>
                  <button
                    onClick={() => setShowResumeInput(!showResumeInput)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'none', border: 'none', color: '#6366f1',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    <ChevronDown size={16} style={{
                      transform: showResumeInput ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }} />
                    {showResumeInput ? 'Hide' : 'Add'} your Resume Text (optional — improves match accuracy)
                  </button>
                  {showResumeInput && (
                    <div style={{ marginTop: '12px', animation: 'slideUp 0.3s ease-out' }}>
                      <textarea
                        className="jd-textarea"
                        rows={6}
                        placeholder="Paste your resume content here for better matching accuracy..."
                        value={resumeText}
                        onChange={e => setResumeText(e.target.value)}
                        style={{
                          width: '100%', resize: 'none', padding: '14px', borderRadius: '12px',
                          border: '2px solid #e2e8f0', fontSize: '0.82rem', lineHeight: 1.5,
                          color: '#334155', background: '#f0fdf4',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Error */}
                {analysisError && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                    padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'slideUp 0.3s ease-out',
                  }}>
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 500 }}>{analysisError}</span>
                  </div>
                )}

                {/* Analyze CTA */}
                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing || !jobDescriptionText.trim()}
                  className="jd-btn-shimmer"
                  style={{
                    ...styles.analyzeBtn,
                    opacity: (!jobDescriptionText.trim() || isAnalyzing) ? 0.6 : 1,
                    cursor: (!jobDescriptionText.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Sparkles size={20} />
                  <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with Google Gemini AI'}</span>
                  <ArrowRight size={20} />
                </button>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', marginTop: '8px' }}>
                  Takes 5-10 seconds · AI extracts requirements, computes match scores & identifies skill gaps
                </p>
              </div>

              {/* Right: Info Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Pipeline Info Card */}
                <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={styles.iconBadge('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>
                      <Zap size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        How It Works
                      </h3>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>
                        Powered by Gemini 2.0 Flash
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { num: '1', title: 'Upload JD', desc: 'Paste or upload job posting text', color: '#6366f1', icon: <UploadCloud size={16} /> },
                      { num: '2', title: 'AI Analysis', desc: 'Gemini extracts skills, requirements & role details', color: '#8b5cf6', icon: <Brain size={16} /> },
                      { num: '3', title: 'Match & Gaps', desc: 'Compute resume compatibility & skill gaps', color: '#10b981', icon: <Target size={16} /> },
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '12px',
                          background: step.color, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, boxShadow: `0 4px 12px ${step.color}30`,
                        }}>
                          {step.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{step.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivational Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)',
                  borderRadius: '20px', padding: '24px',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: GRADIENT_ACCENT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Lightbulb size={20} color="white" />
                    </div>
                    <div style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.88rem' }}>
                      Pro Tip
                    </div>
                  </div>
                  <p style={{ color: '#6366f1', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                    Adding your resume text alongside the JD gives much more accurate match percentages and personalized skill gap recommendations from Gemini AI.
                  </p>
                </div>

                {/* Resume Nav */}
                {onNavigateToResume && (
                  <button
                    onClick={onNavigateToResume}
                    className="jd-card-hover"
                    style={{
                      ...styles.premiumCard,
                      padding: '16px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', textAlign: 'left', border: '1px solid #e2e8f0',
                    }}
                  >
                    <FileText size={18} style={{ color: '#6366f1' }} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.84rem', color: '#1e293b' }}>
                      View Parsed Resume
                    </span>
                    <ExternalLink size={14} style={{ color: '#94a3b8' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            ANALYZING STATE 
        ═══════════════════════════════════════════════════ */}
        {stage === 'analyzing' && (
          <div style={{ animation: 'scaleIn 0.4s ease-out' }}>
            <div style={{
              ...styles.glassMorphCard,
              padding: '60px 40px',
              textAlign: 'center',
              maxWidth: '640px',
              margin: '40px auto',
            }}>
              {/* Spinner */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', position: 'relative',
                animation: 'pulseGlow 2s infinite',
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                  animation: 'spin 1s linear infinite',
                  position: 'absolute',
                }} />
                <Brain size={32} style={{ color: '#6366f1' }} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Gemini AI is Analyzing...
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '24px' }}>
                {analyzingStep || 'Initializing AI analysis pipeline...'}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  height: '10px', borderRadius: '5px',
                  background: '#f1f5f9', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '5px',
                    background: GRADIENT_ACCENT,
                    width: `${analyzingProgress}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: '8px', fontSize: '0.76rem',
                }}>
                  <span style={{ color: '#94a3b8' }}>Processing JD</span>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>{analyzingProgress}%</span>
                  <span style={{ color: '#94a3b8' }}>Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE 2: JD ANALYSIS RESULT 
        ═══════════════════════════════════════════════════ */}
        {stage === 'jd-analysis' && r && (
          <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            
            {/* Success Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              borderRadius: '16px', padding: '16px 24px', marginBottom: '24px',
              border: '1px solid #a7f3d0',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: GRADIENT_SUCCESS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#047857', fontSize: '0.92rem' }}>
                    JD Analyzed Successfully by Gemini AI
                  </div>
                  <div style={{ color: '#059669', fontSize: '0.78rem' }}>
                    {r.extractedRequirements.mustHaveSkills.length} required skills · {r.extractedRequirements.keyResponsibilities.length} responsibilities extracted
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setStage('upload')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontWeight: 600, fontSize: '0.8rem', color: '#475569', cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} /> Edit JD
                </button>
                <button
                  onClick={() => setShowJdJsonModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    border: '1px solid #6366f1', background: '#eef2ff',
                    fontWeight: 600, fontSize: '0.8rem', color: '#6366f1', cursor: 'pointer',
                  }}
                >
                  <Code2 size={14} /> View JSON
                </button>
                <button
                  onClick={() => setStage('match-gap')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 20px', borderRadius: '10px',
                    border: 'none', background: GRADIENT_ACCENT,
                    fontWeight: 700, fontSize: '0.82rem', color: 'white', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                  }}
                >
                  Resume Match & Gaps <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Main Analysis Card */}
            <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '28px', marginBottom: '24px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={styles.iconBadge('#6366f1')}>
                    <FileText size={22} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      JD Analysis Result
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                      Extracted by Google Gemini AI
                    </p>
                  </div>
                </div>
                <span style={{
                  background: '#ecfdf5', color: '#059669', padding: '6px 14px',
                  borderRadius: '10px', fontSize: '0.76rem', fontWeight: 700,
                  border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Check size={14} /> Analyzed
                </span>
              </div>

              {/* Role Summary Bar */}
              <div style={{
                background: '#f8fafc', borderRadius: '16px', padding: '20px 24px',
                border: '1px solid #e2e8f0', marginBottom: '24px',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #c7d2fe',
                  }}>
                    <Briefcase size={24} style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Target Position
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {r.jobPosting.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {r.jobPosting.company}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                    <MapPin size={14} style={{ color: '#ef4444' }} />
                    {r.jobPosting.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                    <Briefcase size={14} style={{ color: '#6366f1' }} />
                    {r.jobPosting.experienceRequired}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                    <GraduationCap size={14} style={{ color: '#f59e0b' }} />
                    {r.jobPosting.educationRequired}
                  </div>
                </div>
              </div>

              {/* Detailed Grid */}
              <div className="jd-match-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Required Skills */}
                <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #fecaca', background: 'linear-gradient(135deg, #fff5f5, #fef2f2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Briefcase size={14} color="white" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Required Skills</span>
                    </div>
                    <span style={{
                      background: '#fee2e2', color: '#b91c1c', padding: '4px 10px',
                      borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {r.extractedRequirements.mustHaveSkills.length} found
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {r.extractedRequirements.mustHaveSkills.map(s => (
                      <span key={s} style={{
                        background: 'white', border: '1px solid #e2e8f0',
                        padding: '6px 12px', borderRadius: '8px',
                        fontSize: '0.78rem', fontWeight: 600, color: '#1e293b',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #c4b5fd', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Wrench size={14} color="white" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Preferred Skills</span>
                    </div>
                    <span style={{
                      background: '#ede9fe', color: '#7c3aed', padding: '4px 10px',
                      borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {r.extractedRequirements.niceToHaveSkills.length} found
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {r.extractedRequirements.niceToHaveSkills.map(s => (
                      <span key={s} style={{
                        background: 'white', border: '1px solid #e2e8f0',
                        padding: '6px 12px', borderRadius: '8px',
                        fontSize: '0.78rem', fontWeight: 600, color: '#1e293b',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #fed7aa', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ClipboardList size={14} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Key Responsibilities</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {r.extractedRequirements.keyResponsibilities.map((resp, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>{resp}</li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #a7f3d0', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Code2 size={14} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Technologies Mentioned</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {r.extractedRequirements.technologiesMentioned.map(t => (
                      <span key={t} style={{
                        background: 'white', border: '1px solid #a7f3d0',
                        padding: '6px 12px', borderRadius: '8px',
                        fontSize: '0.78rem', fontWeight: 600, color: '#047857',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div style={{
                marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.82rem' }}>
                  <Sparkles size={16} style={{ color: '#6366f1' }} />
                  <span>Ready for resume matching</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setStage('upload')}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      border: '1px solid #e2e8f0', background: 'white',
                      fontWeight: 600, fontSize: '0.82rem', color: '#475569', cursor: 'pointer',
                    }}
                  >
                    ← Re-upload JD
                  </button>
                  <button
                    onClick={() => setStage('match-gap')}
                    style={{
                      padding: '10px 24px', borderRadius: '10px',
                      border: 'none', background: GRADIENT_ACCENT,
                      fontWeight: 700, fontSize: '0.84rem', color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}
                  >
                    Resume Match & Skill Gap <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE 3: RESUME MATCH & SKILL GAP 
        ═══════════════════════════════════════════════════ */}
        {stage === 'match-gap' && r && (
          <div style={{ animation: 'slideUp 0.5s ease-out' }}>

            {/* Top Nav Bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
              gap: '12px', marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setStage('jd-analysis')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontWeight: 600, fontSize: '0.8rem', color: '#475569', cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} /> Back to JD Analysis
                </button>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>·</span>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  <strong>{r.jobPosting.title}</strong> at {r.jobPosting.company}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setStage('upload')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontWeight: 600, fontSize: '0.78rem', color: '#475569', cursor: 'pointer',
                  }}
                >
                  <UploadCloud size={13} /> New JD
                </button>
                <button
                  onClick={() => setShowDetailedReportModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    border: '1px solid #6366f1', background: '#eef2ff',
                    fontWeight: 600, fontSize: '0.78rem', color: '#6366f1', cursor: 'pointer',
                  }}
                >
                  <FileText size={13} /> Full Report
                </button>
              </div>
            </div>

            {/* Match Score Card */}
            <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={styles.iconBadge('#6366f1')}>
                    <FileCheck size={22} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Resume ↔ Job Match
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                      AI-computed compatibility between your profile and <strong>{r.jobPosting.title}</strong>
                    </p>
                  </div>
                </div>
                <span style={{
                  background: r.matchAnalysis.overallMatchScore >= 70 ? '#ecfdf5' : '#fffbeb',
                  color: r.matchAnalysis.overallMatchScore >= 70 ? '#047857' : '#b45309',
                  padding: '6px 14px', borderRadius: '10px',
                  fontSize: '0.78rem', fontWeight: 700,
                  border: r.matchAnalysis.overallMatchScore >= 70 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                }}>
                  {getScoreLabel(r.matchAnalysis.overallMatchScore)}
                </span>
              </div>

              <div className="jd-score-section" style={{ display: 'flex', gap: '32px', marginTop: '24px', alignItems: 'center' }}>
                {/* Score Circle */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={styles.scoreCircle(r.matchAnalysis.overallMatchScore) as React.CSSProperties}>
                    <div style={{ color: 'white', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>
                      {r.matchAnalysis.overallMatchScore}
                      <span style={{ fontSize: '1.2rem' }}>%</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.76rem', fontWeight: 600 }}>
                      Match Score
                    </div>
                  </div>
                  <div style={{
                    marginTop: '12px', background: r.matchAnalysis.overallMatchScore >= 80 ? '#ecfdf5' : '#fffbeb',
                    padding: '6px 14px', borderRadius: '8px',
                    fontSize: '0.76rem', fontWeight: 700,
                    color: r.matchAnalysis.overallMatchScore >= 80 ? '#047857' : '#b45309',
                  }}>
                    {r.matchAnalysis.overallMatchScore >= 80 ? 'Strong Fit' : 'Bridge Training Needed'}
                  </div>
                </div>

                {/* Match Breakdown */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: '16px' }}>
                    Match Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Skills Match', value: r.matchAnalysis.skillsMatchPercent, color: '#10b981' },
                      { label: 'Experience Match', value: r.matchAnalysis.experienceMatchPercent, color: '#3b82f6' },
                      { label: 'Education Match', value: r.matchAnalysis.educationMatchPercent, color: '#8b5cf6' },
                      { label: 'Project Relevance', value: r.matchAnalysis.projectRelevancePercent, color: '#f97316' },
                    ].map(bar => (
                      <div key={bar.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{bar.label}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{bar.value}%</span>
                        </div>
                        <div style={styles.progressBar(bar.value, bar.color)}>
                          <div style={styles.progressFill(bar.value, bar.color)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Comparison */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', margin: 0 }}>
                      Skill Comparison
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Matched
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        Partial
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        Missing
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {r.skillComparison.matchedSkills.map(s => (
                      <span key={s} className="jd-skill-pill" style={styles.skillPill('matched')}>
                        <Check size={12} strokeWidth={3} /> {s}
                      </span>
                    ))}
                    {r.skillComparison.partialSkills.map(ps => (
                      <span key={ps.name} className="jd-skill-pill" style={styles.skillPill('partial')} title={ps.note}>
                        <AlertTriangle size={12} /> {ps.name}
                      </span>
                    ))}
                    {r.skillComparison.missingSkills.map(ms => (
                      <span key={ms.name} className="jd-skill-pill" style={styles.skillPill('missing')} title={ms.scoreImpact}>
                        <X size={12} strokeWidth={3} /> {ms.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {r.summary && (
                <div style={{
                  marginTop: '24px', padding: '16px 20px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Brain size={16} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4338ca' }}>AI Summary</span>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                    {r.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Skill Gap + Learning Path Row */}
            <div className="jd-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Skill Gap Analysis */}
              <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.iconBadge('#6366f1')}>
                      <Layers size={20} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Skill Gap Analysis
                    </h2>
                  </div>
                  <span style={{
                    background: '#fee2e2', color: '#b91c1c', padding: '4px 12px',
                    borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                    border: '1px solid #fecaca',
                  }}>
                    {r.skillComparison.missingSkills.length} Gaps
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '20px' }}>
                  Skill proficiencies required by <strong>{r.jobPosting.company}</strong>
                </p>

                <div className="jd-match-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {/* Matched */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                        Matched ({r.skillComparison.matchedSkills.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {r.skillComparison.matchedSkills.map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#1e293b' }}>
                          <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Partial */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                        Partial ({r.skillComparison.partialSkills.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {r.skillComparison.partialSkills.map(ps => (
                        <div key={ps.name}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                            <span style={{
                              width: '16px', height: '16px', borderRadius: '50%',
                              background: '#f59e0b', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                            }}>!</span>
                            {ps.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: '24px', lineHeight: 1.3, marginTop: '2px' }}>
                            {ps.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                        Missing ({r.skillComparison.missingSkills.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {r.skillComparison.missingSkills.map(ms => (
                        <div key={ms.name} style={{
                          padding: '10px 12px', borderRadius: '10px',
                          background: '#fef2f2', border: '1px solid #fecaca',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                              <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                              {ms.name}
                            </div>
                            <span style={{
                              background: ms.priority === 'Critical' ? '#ef4444' : ms.priority === 'Moderate' ? '#f59e0b' : '#64748b',
                              color: 'white', padding: '2px 8px',
                              borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
                            }}>
                              {ms.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#10b981', paddingLeft: '22px', marginTop: '4px', fontWeight: 600 }}>
                            Impact: {ms.scoreImpact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvement Tips */}
                {r.improvementTips && r.improvementTips.length > 0 && (
                  <div style={{
                    marginTop: '20px', padding: '16px 20px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)',
                    border: '1px solid rgba(99,102,241,0.15)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Lightbulb size={16} style={{ color: '#6366f1' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4338ca' }}>Improvement Tips</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {r.improvementTips.map((tip, i) => (
                        <li key={i} style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Learning Path */}
              <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.iconBadge('linear-gradient(135deg, #6366f1, #8b5cf6)')}>
                      <BookOpen size={20} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Learning Path
                    </h2>
                  </div>
                  <span style={{
                    background: '#eef2ff', color: '#6366f1', padding: '4px 12px',
                    borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                    border: '1px solid #c7d2fe',
                  }}>
                    AI Tailored
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '20px' }}>
                  Bridge your skill gaps step-by-step
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {r.learningPath.map((step, idx) => (
                    <div
                      key={step.title}
                      className="jd-action-card"
                      onClick={() => onOpenRoadmap?.()}
                      style={{
                        padding: '16px', borderRadius: '14px',
                        border: '1px solid #e2e8f0', background: '#f8fafc',
                        display: 'flex', alignItems: 'center', gap: '14px',
                        cursor: 'pointer', transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: GRADIENT_ACCENT, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: 800, flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          {step.description}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, marginTop: '4px' }}>
                          <Clock size={11} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                          {step.duration}
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>

                {onOpenRoadmap && (
                  <button
                    onClick={onOpenRoadmap}
                    style={{
                      width: '100%', marginTop: '16px', padding: '12px',
                      borderRadius: '12px', border: '2px solid #6366f1',
                      background: '#eef2ff', color: '#6366f1',
                      fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Sparkles size={16} /> Launch Interactive Roadmap
                  </button>
                )}
              </div>
            </div>

            {/* Career Actions Hub */}
            <div className="jd-card-hover" style={{ ...styles.premiumCard, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={styles.iconBadge(GRADIENT_ACCENT)}>
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Career Actions for This Role
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                    Continue your prep based on the analyzed requirements
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {[
                  {
                    title: `Mock Interview for ${r.jobPosting.title}`,
                    desc: `Practice questions for ${r.jobPosting.company}'s tech stack`,
                    icon: <Play size={20} />,
                    color: '#6366f1',
                    action: () => { onOpenMockTest?.() || onNavigateToInterview?.(); },
                    cta: 'Start Interview',
                  },
                  {
                    title: 'Practice Coding Challenges',
                    desc: `Solve problems matching ${r.extractedRequirements.mustHaveSkills.slice(0, 3).join(', ')}`,
                    icon: <Code size={20} />,
                    color: '#10b981',
                    action: () => onNavigateToCoding?.(),
                    cta: 'Solve Challenges',
                  },
                  {
                    title: 'AI Interview Prep',
                    desc: 'Full-stack technical Q&A and behavioral scenarios',
                    icon: <Mic size={20} />,
                    color: '#8b5cf6',
                    action: () => onNavigateToInterview?.(),
                    cta: 'Start Prep',
                  },
                  {
                    title: 'Explore Similar Jobs',
                    desc: `View openings matching your ${r.matchAnalysis.overallMatchScore}% profile`,
                    icon: <Briefcase size={20} />,
                    color: '#3b82f6',
                    action: () => onNavigateToJobs?.(),
                    cta: 'View Openings',
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="jd-action-card"
                    onClick={card.action}
                    style={{
                      padding: '20px', borderRadius: '16px',
                      border: '1px solid #e2e8f0', background: '#fafbff',
                      cursor: 'pointer', transition: 'all 0.3s ease',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      minHeight: '150px',
                    }}
                  >
                    <div>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: `${card.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px', color: card.color,
                      }}>
                        {card.icon}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '4px' }}>
                        {card.title}
                      </div>
                      <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                        {card.desc}
                      </p>
                    </div>
                    <div style={{
                      marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                      color: card.color, fontSize: '0.78rem', fontWeight: 700,
                    }}>
                      {card.cta} <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════
          MODALS 
      ═══════════════════════════════════════════════════ */}

      {/* JSON Inspector Modal */}
      {showJdJsonModal && r && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.7)', zIndex: 1060,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowJdJsonModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px',
              maxWidth: '800px', width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.iconBadge('#6366f1')}>
                  <Code2 size={18} color="white" />
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: '#0f172a' }}>
                    Gemini Analysis JSON
                  </h5>
                  <small style={{ color: '#94a3b8' }}>
                    {r.jobPosting.title} at {r.jobPosting.company}
                  </small>
                </div>
              </div>
              <button
                onClick={() => setShowJdJsonModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px', borderRadius: '8px',
                }}
              >
                <X size={20} style={{ color: '#64748b' }} />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Structured Gemini response</span>
                <button
                  onClick={handleCopyJson}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontWeight: 600, fontSize: '0.78rem', color: '#475569', cursor: 'pointer',
                  }}
                >
                  {copiedJson ? <CheckCheck size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  {copiedJson ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{
                background: GRADIENT_DARK, borderRadius: '14px',
                padding: '20px', maxHeight: '400px', overflow: 'auto',
              }}>
                <pre style={{ color: '#a5b4fc', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", margin: 0, lineHeight: 1.5 }}>
                  {JSON.stringify(r, null, 2)}
                </pre>
              </div>
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <button
                  onClick={() => setShowJdJsonModal(false)}
                  style={{
                    padding: '10px 24px', borderRadius: '10px',
                    border: 'none', background: GRADIENT_ACCENT,
                    fontWeight: 700, fontSize: '0.84rem', color: 'white', cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {showDetailedReportModal && r && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.7)', zIndex: 1060,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowDetailedReportModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px',
              maxWidth: '800px', width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.iconBadge('#10b981')}>
                  <FileText size={18} color="white" />
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: '#0f172a' }}>
                    Full Compatibility Report
                  </h5>
                  <small style={{ color: '#94a3b8' }}>
                    {r.jobPosting.title} · {r.jobPosting.company}
                  </small>
                </div>
              </div>
              <button
                onClick={() => setShowDetailedReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={20} style={{ color: '#64748b' }} />
              </button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflow: 'auto' }}>
              {/* Score Summary */}
              <div style={{
                background: '#ecfdf5', borderRadius: '14px', padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
                border: '1px solid #a7f3d0',
              }}>
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.86rem', color: '#047857' }}>
                  <strong>{r.matchAnalysis.overallMatchScore}% Overall Compatibility:</strong> {candidateName} {r.matchAnalysis.overallMatchScore >= 70 ? 'meets the core requirements' : 'has potential with targeted skill development'} for {r.jobPosting.title}.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '10px' }}>
                    High Confidence Factors
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {r.skillComparison.matchedSkills.length} key technical skills matched ({r.skillComparison.matchedSkills.slice(0, 4).join(', ')})
                    </li>
                    <li style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Education: {r.jobPosting.educationRequired}
                    </li>
                    <li style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Skills match: {r.matchAnalysis.skillsMatchPercent}%
                    </li>
                  </ul>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '10px' }}>
                    Targeted Actions
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {r.skillComparison.missingSkills.map(m => (
                      <li key={m.name} style={{ fontSize: '0.82rem', color: '#475569' }}>
                        Acquire <strong>{m.name}</strong> ({m.scoreImpact})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Summary */}
              {r.summary && (
                <div style={{
                  padding: '16px 20px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eef2ff, #fdf4ff)',
                  border: '1px solid rgba(99,102,241,0.15)', marginBottom: '16px',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#4338ca', marginBottom: '8px' }}>
                    AI Summary
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {r.summary}
                  </p>
                </div>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '16px', borderTop: '1px solid #e2e8f0',
              }}>
                <button
                  onClick={() => { setShowDetailedReportModal(false); setStage('upload'); }}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontWeight: 600, fontSize: '0.82rem', color: '#475569', cursor: 'pointer',
                  }}
                >
                  ← Upload New JD
                </button>
                <button
                  onClick={() => setShowDetailedReportModal(false)}
                  style={{
                    padding: '10px 24px', borderRadius: '10px',
                    border: 'none', background: GRADIENT_ACCENT,
                    fontWeight: 700, fontSize: '0.84rem', color: 'white', cursor: 'pointer',
                  }}
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
