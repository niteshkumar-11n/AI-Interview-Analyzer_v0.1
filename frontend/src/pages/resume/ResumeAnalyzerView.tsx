import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Cpu, 
  Database, 
  Sparkles, 
  Check, 
  Clock, 
  Layers, 
  Award, 
  AlertTriangle, 
  RefreshCw, 
  Briefcase, 
  GraduationCap, 
  Terminal, 
  FolderGit2, 
  Star, 
  Play, 
  Mic, 
  ExternalLink, 
  AlertCircle, 
  Info, 
  Code2, 
  ChevronRight, 
  GitPullRequest, 
  BarChart3, 
  TrendingUp, 
  UserCheck,
  Code,
  Copy,
  CheckCheck,
  RotateCcw,
  Eye,
  FileCode,
  Download,
  Server,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Sparkle
} from 'lucide-react';

interface ResumeAnalyzerViewProps {
  onOpenMockTest?: () => void;
  onNavigateToJobs?: () => void;
  onOpenCoding?: () => void;
  onOpenGithub?: () => void;
  onOpenRoadmap?: () => void;
  onOpenScorecard?: () => void;
  onNavigateToSection?: (section: string) => void;
}

type WorkflowStage = 'upload' | 'processing' | 'results';
type ResultTab = 'all' | 'extracted' | 'analysis' | 'ats';

export const ResumeAnalyzerView: React.FC<ResumeAnalyzerViewProps> = ({
  onOpenMockTest,
  onNavigateToJobs,
  onOpenCoding,
  onOpenGithub,
  onOpenRoadmap,
  onOpenScorecard,
  onNavigateToSection
}) => {
  const { user } = useAuth();
  const candidateName = user?.profile?.name || 'Candidate';
  const candidateEmail = user?.email || 'candidate@example.com';
  const candidateRole = user?.profile?.targetRole || 'Full Stack Developer';
  const candidateInitials = candidateName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CA';

  // 1. Core Workflow State: 'upload' (F04) -> 'processing' (Extract -> Parser -> JSON -> Analysis -> ATS) -> 'results'
  const [stage, setStage] = useState<WorkflowStage>('upload');
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('all');
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Tabs for F05: Extracted Information
  const [activeExtractedTab, setActiveExtractedTab] = useState<
    'Overview' | 'Skills' | 'Experience' | 'Projects' | 'Education' | 'Certifications'
  >('Overview');

  // Selected file state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }>({
    name: 'Rohan_Singh_Resume.pdf',
    size: '2.4 MB',
    type: 'PDF',
    uploadedAt: 'Sep 2, 2025'
  });

  // Processing state & timers
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activePipelineTab, setActivePipelineTab] = useState<'all' | 'interview' | 'jobs' | 'roadmap'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      processingTimerRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Pre-configured Sample Resumes for quick demonstration
  const sampleResumes = [
    { name: 'Rohan_Singh_Resume.pdf', size: '2.4 MB', role: 'Full-Stack Developer (MERN)' },
    { name: 'Priya_Sharma_Resume.pdf', size: '1.8 MB', role: 'Frontend React Specialist' },
    { name: 'Aarav_Patel_Resume.docx', size: '2.1 MB', role: 'Backend & Cloud Engineer' }
  ];

  // Start the end-to-end resume analysis pipeline
  const handleStartAnalysis = () => {
    setStage('processing');
    setProcessingStep(1);
    setProgressPercent(15);

    // Clear any previous timers
    processingTimerRef.current.forEach(t => clearTimeout(t));
    processingTimerRef.current = [];

    // Step 2: Extract Text (at 600ms)
    const t1 = setTimeout(() => {
      setProcessingStep(2);
      setProgressPercent(35);
    }, 650);

    // Step 3: Resume Parser F05 (at 1300ms)
    const t2 = setTimeout(() => {
      setProcessingStep(3);
      setProgressPercent(58);
    }, 1350);

    // Step 4: Structured Candidate JSON (at 2000ms)
    const t3 = setTimeout(() => {
      setProcessingStep(4);
      setProgressPercent(76);
    }, 2050);

    // Step 5: Resume Analysis F06 (at 2700ms)
    const t4 = setTimeout(() => {
      setProcessingStep(5);
      setProgressPercent(90);
    }, 2750);

    // Step 6: ATS Score F07 & MongoDB Storage (at 3400ms)
    const t5 = setTimeout(() => {
      setProcessingStep(6);
      setProgressPercent(100);
    }, 3400);

    // Step 7: Automatic page transition to Extracted Information & Analysis (at 3900ms)
    const t6 = setTimeout(() => {
      setStage('results');
      setActiveResultTab('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3950);

    processingTimerRef.current = [t1, t2, t3, t4, t5, t6];
  };

  // Skip simulation straight to results
  const handleSkipToResults = () => {
    processingTimerRef.current.forEach(t => clearTimeout(t));
    setProcessingStep(6);
    setProgressPercent(100);
    setStage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restart back to upload section
  const handleResetToUpload = () => {
    processingTimerRef.current.forEach(t => clearTimeout(t));
    setStage('upload');
    setProcessingStep(1);
    setProgressPercent(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // File selection handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 'DOCX' : 'PDF',
        uploadedAt: 'Just now'
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 'DOCX' : 'PDF',
        uploadedAt: 'Just now'
      });
    }
  };

  // Candidate Structured JSON Representation
  const candidateStructuredJson = {
    _id: "66d4f9b8c12a874e5021e102",
    candidate_id: "CAND-2025-0982",
    parsed_at: "2025-09-16T06:03:00.000Z",
    status: "PROCESSED_AND_STORED",
    source_file: {
      filename: selectedFile.name,
      file_size: selectedFile.size,
      format: selectedFile.type === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    candidate_profile: {
      full_name: candidateName,
      target_role: candidateRole,
      email: candidateEmail,
      phone: user?.profile?.phone || "+91 98765 43210",
      location: user?.profile?.location || "Bengaluru, Karnataka, India",
      links: {
        github: user?.profile?.github || "https://github.com",
        linkedin: user?.profile?.linkedin || "https://linkedin.com",
        portfolio: user?.profile?.portfolio || "https://portfolio.dev"
      }
    },
    extracted_skills: {
      languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "SQL"],
      frontend: ["React", "Next.js", "Redux", "Tailwind CSS", "HTML5", "CSS3"],
      backend: ["Node.js", "Express.js", "Django", "REST APIs", "GraphQL"],
      database: ["MongoDB", "PostgreSQL", "Redis"],
      devops_tools: ["Docker", "Git", "GitHub Actions", "AWS (EC2, S3)", "Postman"]
    },
    work_experience: [
      {
        role: "Software Developer Intern",
        company: "ABC Tech Solutions",
        period: "Jan 2023 - Jun 2023",
        location: "Bengaluru, India",
        highlights: [
          "Built responsive client portals with React and Tailwind, reducing load time by 34%",
          "Designed RESTful microservices in Node.js/Express handling 10k+ daily transactions",
          "Assisted in Dockerizing internal development containers for team-wide parity"
        ]
      }
    ],
    projects: [
      {
        title: "AI Resume Analyzer",
        tech_stack: ["React", "Node.js", "Python NLP", "MongoDB"],
        description: "Engineered automated resume parsing system with ATS scoring and real-time semantic feedback.",
        live_url: "https://github.com/rohansingh/ai-resume-analyzer"
      },
      {
        title: "E-commerce Web App",
        tech_stack: ["MERN Stack", "Stripe API", "Redux Toolkit"],
        description: "Full-stack e-commerce application featuring JWT authentication, inventory sync, and payment gateway.",
        live_url: "https://github.com/rohansingh/mern-ecommerce"
      },
      {
        title: "Weather Forecasting App",
        tech_stack: ["JavaScript", "OpenWeatherMap API", "Chart.js"],
        description: "Interactive weather dashboard visualizing 7-day climatic trends with geolocation detection.",
        live_url: "https://github.com/rohansingh/weather-forecast"
      }
    ],
    education: [
      {
        degree: "B.Tech in Computer Science & Engineering",
        institution: "XYZ University",
        period: "2020 - 2024",
        grade: "CGPA 8.7 / 10.0"
      }
    ],
    certifications: [
      "AWS Certified Cloud Practitioner",
      "Google Data Analytics Professional Certificate",
      "MERN Stack Specialization (Meta)"
    ],
    analysis_metrics: {
      ats_score: 82,
      grade: "Good",
      technical_skills_score: 84,
      project_quality_score: 81,
      experience_score: 72,
      resume_formatting_score: 79,
      keyword_density_match: 85
    },
    database_metadata: {
      collection: "candidates",
      engine: "MongoDB Atlas",
      downstream_triggers: [
        "TRIGGER_JOB_MATCHING_ENGINE",
        "TRIGGER_AI_INTERVIEW_PREP"
      ]
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(candidateStructuredJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidateStructuredJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "candidate_structured_profile.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-3 p-lg-4" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div className="container-fluid px-0" style={{ maxWidth: '1440px' }}>

        {/* --- TOP HEADER & MOTIVATIONAL BANNER --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#2563EB'
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h1 className="h4 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                Resume Intelligence & Parser
              </h1>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem' }}>
                Automated NLP extraction, ATS scoring, and skill profiling pipeline.
              </p>
            </div>
          </div>

          {/* Flow Stepper Status Badge & Reset Control */}
          <div className="d-flex align-items-center gap-2">
            {stage === 'results' && (
              <button
                type="button"
                onClick={handleResetToUpload}
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1.5 px-3 py-1.5"
                style={{ fontSize: '0.78rem' }}
              >
                <RotateCcw size={14} />
                <span>Upload Another Resume</span>
              </button>
            )}

            <div 
              className="d-flex align-items-center gap-2.5 px-3 py-1.5 rounded-3 border"
              style={{
                backgroundColor: '#EFF6FF',
                borderColor: '#BFDBFE',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.06)'
              }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                style={{ width: '28px', height: '28px', backgroundColor: '#DBEAFE' }}
              >
                <Lightbulb size={16} className="text-primary" />
              </div>
              <div>
                <div className="fw-semibold text-primary" style={{ fontSize: '0.8rem' }}>
                  &ldquo;A better resume opens better opportunities.&rdquo;
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                  {stage === 'upload' ? 'Upload to begin extraction' : stage === 'processing' ? 'Processing pipeline in progress...' : 'Extraction & Analysis complete!'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FLOW DIAGRAM STEPPER BAR (Directly visualizes the user's flowchart) --- */}
        <div className="card border-0 shadow-xs rounded-3 p-3 bg-white mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold text-dark small d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
              <Sparkles size={14} className="text-primary" />
              <span>Resume Intelligence Pipeline Architecture</span>
            </span>
            <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.7rem' }}>
              {stage === 'upload' ? 'Step 1: Upload (F04)' : stage === 'processing' ? `Step ${processingStep}: Processing Pipeline` : 'Step 5: Analysis & MongoDB Complete'}
            </span>
          </div>

          <div className="d-flex align-items-center overflow-x-auto py-1 gap-1 gap-md-2" style={{ whiteSpace: 'nowrap' }}>
            {/* Step 1: Upload Resume (F04) */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'upload' ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 'bg-light text-dark border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'upload' ? 'bg-white text-primary' : 'bg-success text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {stage !== 'upload' ? <Check size={11} /> : '1'}
              </div>
              <span>Upload Resume (F04)</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Step 2: Extract Text */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'processing' && processingStep === 2 ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 
              (stage === 'results' || (stage === 'processing' && processingStep > 2)) ? 'bg-light text-success border-success-subtle' : 'bg-light text-muted border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'results' || (stage === 'processing' && processingStep > 2) ? 'bg-success text-white' : 'bg-secondary text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {(stage === 'results' || (stage === 'processing' && processingStep > 2)) ? <Check size={11} /> : '2'}
              </div>
              <span>Extract Text</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Step 3: Resume Parser (F05) */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'processing' && processingStep === 3 ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 
              (stage === 'results' || (stage === 'processing' && processingStep > 3)) ? 'bg-light text-success border-success-subtle' : 'bg-light text-muted border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'results' || (stage === 'processing' && processingStep > 3) ? 'bg-success text-white' : 'bg-secondary text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {(stage === 'results' || (stage === 'processing' && processingStep > 3)) ? <Check size={11} /> : '3'}
              </div>
              <span>Resume Parser (F05)</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Step 4: Structured Candidate JSON */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'processing' && processingStep === 4 ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 
              (stage === 'results' || (stage === 'processing' && processingStep > 4)) ? 'bg-light text-success border-success-subtle' : 'bg-light text-muted border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'results' || (stage === 'processing' && processingStep > 4) ? 'bg-success text-white' : 'bg-secondary text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {(stage === 'results' || (stage === 'processing' && processingStep > 4)) ? <Check size={11} /> : '4'}
              </div>
              <span>Structured Candidate JSON</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Step 5: Resume Analysis (F06) */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'processing' && processingStep === 5 ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 
              (stage === 'results' || (stage === 'processing' && processingStep > 5)) ? 'bg-light text-success border-success-subtle' : 'bg-light text-muted border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'results' || (stage === 'processing' && processingStep > 5) ? 'bg-success text-white' : 'bg-secondary text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {(stage === 'results' || (stage === 'processing' && processingStep > 5)) ? <Check size={11} /> : '5'}
              </div>
              <span>Resume Analysis (F06)</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Step 6: ATS Score (F07) & MongoDB */}
            <div className={`d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2 border ${
              stage === 'processing' && processingStep === 6 ? 'bg-primary text-white border-primary fw-bold shadow-xs' : 
              stage === 'results' ? 'bg-success text-white border-success fw-bold shadow-xs' : 'bg-light text-muted border-light-subtle'
            }`} style={{ fontSize: '0.75rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                stage === 'results' ? 'bg-white text-success' : 'bg-secondary text-white'
              }`} style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                {stage === 'results' ? <Check size={11} /> : '6'}
              </div>
              <span>ATS Score (F07) & MongoDB</span>
            </div>

            <ChevronRight size={14} className="text-muted flex-shrink-0" />

            {/* Future Phases: Job Matching & AI Interview */}
            <div className="d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2 border bg-light text-secondary border-dashed" style={{ fontSize: '0.75rem' }}>
              <Database size={12} className="text-primary" />
              <span>Job Match & AI Interview</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: FIRSTLY SHOW RESUME UPLOAD SECTION (F04)                         */}
        {/* ========================================================================= */}
        {stage === 'upload' && (
          <div className="row g-4 justify-content-center">
            {/* Primary Upload Card */}
            <div className="col-12 col-lg-7 col-xl-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-4 bg-white">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span 
                    className="badge px-2.5 py-1 rounded-2 fw-bold text-white shadow-xs"
                    style={{ backgroundColor: '#2563EB', fontSize: '0.78rem', letterSpacing: '0.03em' }}
                  >
                    F04
                  </span>
                  <h2 className="h5 fw-bold text-dark mb-0">
                    Resume Upload
                  </h2>
                </div>
                <p className="text-secondary small mb-4" style={{ fontSize: '0.85rem' }}>
                  Upload your candidate resume in PDF or DOCX format to trigger our automated NLP extraction, ATS scoring, and skill profiling pipeline.
                </p>

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-4 text-center p-4 p-md-5 mb-3 d-flex flex-column align-items-center justify-content-center transition-all cursor-pointer"
                  style={{
                    border: isDragOver ? '2px dashed #2563EB' : '2px dashed #93C5FD',
                    backgroundColor: isDragOver ? '#EFF6FF' : '#F8FAFC',
                    minHeight: '220px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".pdf,.docx,.doc" 
                    className="d-none" 
                  />
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-xs"
                    style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                  >
                    <UploadCloud size={28} />
                  </div>
                  <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                    Drag & drop your resume here
                  </div>
                  <div className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
                    or browse files from your computer
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="btn btn-primary px-4 py-2 rounded-3 fw-semibold mb-2 shadow-xs d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#2563EB', fontSize: '0.85rem' }}
                  >
                    <FileText size={16} />
                    <span>Choose File</span>
                  </button>
                  <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                    Supports PDF and DOCX (Maximum file size: 10 MB)
                  </div>
                </div>

                {/* Selected File Card */}
                <div 
                  className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 border"
                  style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                >
                  <div className="d-flex align-items-center gap-3 overflow-hidden">
                    <div 
                      className="rounded-2 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        backgroundColor: selectedFile.type === 'PDF' ? '#EF4444' : '#2563EB', 
                        fontSize: '0.72rem' 
                      }}
                    >
                      {selectedFile.type}
                    </div>
                    <div className="text-truncate">
                      <div className="fw-bold text-dark text-truncate small" style={{ fontSize: '0.88rem' }}>
                        {selectedFile.name}
                      </div>
                      <div className="text-secondary small d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
                        <span>{selectedFile.size}</span>
                        <span>•</span>
                        <span className="text-success fw-semibold">Ready for analysis</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                    style={{ width: '26px', height: '26px', backgroundColor: '#DCFCE7', color: '#16A34A' }}
                  >
                    <Check size={16} />
                  </div>
                </div>

                {/* Resume Analyze Action Button (Requirement #1) */}
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ 
                    backgroundColor: '#2563EB', 
                    fontSize: '1rem',
                    letterSpacing: '0.01em'
                  }}
                >
                  <Sparkles size={18} />
                  <span>Analyze Resume</span>
                  <ArrowRight size={18} />
                </button>
                <div className="text-center text-muted small mt-2" style={{ fontSize: '0.74rem' }}>
                  Clicking Analyze Resume begins text extraction, NLP parsing, and ATS scoring.
                </div>

                {/* Quick Sample Presets */}
                <div className="mt-4 pt-3 border-top">
                  <div className="fw-semibold text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
                    Or test with pre-loaded candidate resumes:
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {sampleResumes.map((sample, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedFile({
                            name: sample.name,
                            size: sample.size,
                            type: sample.name.endsWith('.docx') ? 'DOCX' : 'PDF',
                            uploadedAt: 'Just now'
                          });
                        }}
                        className={`p-2.5 rounded-2 border d-flex align-items-center justify-content-between cursor-pointer transition-all ${
                          selectedFile.name === sample.name ? 'border-primary bg-primary-subtle' : 'bg-white hover-bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={15} className={selectedFile.name === sample.name ? 'text-primary' : 'text-secondary'} />
                          <span className="fw-semibold text-dark small" style={{ fontSize: '0.8rem' }}>
                            {sample.name}
                          </span>
                          <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.68rem' }}>
                            {sample.role}
                          </span>
                        </div>
                        <span className="text-primary small fw-semibold" style={{ fontSize: '0.74rem' }}>
                          {selectedFile.name === sample.name ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Overview Card */}
            <div className="col-12 col-lg-5 col-xl-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="rounded-2 p-1.5 bg-primary-subtle text-primary">
                      <Cpu size={18} />
                    </div>
                    <h3 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1rem' }}>
                      What happens after you click Analyze?
                    </h3>
                  </div>
                  <p className="text-secondary small mb-4" style={{ fontSize: '0.82rem' }}>
                    Our pipeline follows the structured engineering architecture:
                  </p>

                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded-3 border bg-light d-flex align-items-start gap-3">
                      <div className="rounded-circle p-1.5 bg-white text-primary border flex-shrink-0 mt-0.5">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>
                          1. Text Extraction & Layout Parsing
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                          Extracts raw typography, removes PDF rendering artifacts, and segments text into logical paragraphs.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-3 border bg-light d-flex align-items-start gap-3">
                      <div className="rounded-circle p-1.5 bg-white text-info border flex-shrink-0 mt-0.5">
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>
                          2. Resume Parser (F05) → Structured Candidate JSON
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                          NLP entity extraction identifies hard/soft skills, project repos, dates, education, and builds a validated JSON candidate schema.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-3 border bg-light d-flex align-items-start gap-3">
                      <div className="rounded-circle p-1.5 bg-white text-success border flex-shrink-0 mt-0.5">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>
                          3. Resume Analysis (F06) & ATS Score (F07)
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                          Calculates ATS keyword matching score (0-100), highlights key strengths, and flags areas of improvement.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-3 border bg-light d-flex align-items-start gap-3">
                      <div className="rounded-circle p-1.5 bg-white text-warning border flex-shrink-0 mt-0.5">
                        <Database size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>
                          4. MongoDB Sync & Downstream Integrations
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                          Candidate JSON is synchronized to MongoDB, powering instant Job Matching and AI Interview preparation!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="mt-4 p-3 rounded-3 d-flex align-items-center gap-2 border"
                  style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', color: '#1E40AF' }}
                >
                  <ShieldCheck size={18} className="flex-shrink-0 text-primary" />
                  <span style={{ fontSize: '0.75rem' }}>
                    100% Private & Secure. Resumes are parsed in memory and saved to candidate collections safely.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: PROCESSING YOUR RESUME (Step-by-step Animated Screen)            */}
        {/* ========================================================================= */}
        {stage === 'processing' && (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
                {/* Spinner Icon */}
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-xs"
                  style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                >
                  <RefreshCw size={32} className="spinner-border text-primary border-3" />
                </div>

                <h2 className="h4 fw-bold text-dark mb-1">
                  Processing Your Resume...
                </h2>
                <p className="text-secondary small mb-4" style={{ fontSize: '0.88rem' }}>
                  Extracting text, parsing candidate schema, calculating ATS score, and indexing profile into MongoDB.
                </p>

                {/* Progress Bar with Percentage */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between small fw-semibold text-secondary mb-1.5" style={{ fontSize: '0.8rem' }}>
                    <span>Pipeline Progress</span>
                    <span className="text-primary fw-bold">{progressPercent}%</span>
                  </div>
                  <div className="progress" style={{ height: '10px', borderRadius: '6px', backgroundColor: '#F1F5F9' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ 
                        width: `${progressPercent}%`, 
                        backgroundColor: '#2563EB',
                        transition: 'width 0.4s ease-in-out'
                      }}
                    />
                  </div>
                </div>

                {/* Step-by-Step Flow List Matching the User Flowchart */}
                <div className="text-start border rounded-3 p-3.5 mb-4 bg-light">
                  <div className="d-flex flex-column gap-3">

                    {/* Step 1: Upload Resume (F04) */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                          style={{ width: '24px', height: '24px', backgroundColor: '#10B981', fontSize: '0.72rem' }}>
                          <Check size={14} />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            1. Upload Resume (F04)
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {selectedFile.name} loaded into parser buffer
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-success text-white small" style={{ fontSize: '0.68rem' }}>Complete</span>
                    </div>

                    {/* Step 2: Extract Text */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                          processingStep >= 2 ? 'bg-success' : 'bg-secondary'
                        }`} style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>
                          {processingStep > 2 ? <Check size={14} /> : processingStep === 2 ? <RefreshCw size={12} className="spinner-border spinner-border-sm" /> : '2'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            2. Extract Text
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {processingStep >= 2 ? 'Raw text stream extracted from PDF objects' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge small ${processingStep > 2 ? 'bg-success text-white' : processingStep === 2 ? 'bg-primary text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.68rem' }}>
                        {processingStep > 2 ? 'Complete' : processingStep === 2 ? 'Extracting...' : 'Pending'}
                      </span>
                    </div>

                    {/* Step 3: Resume Parser (F05) */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                          processingStep >= 3 ? 'bg-success' : 'bg-secondary'
                        }`} style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>
                          {processingStep > 3 ? <Check size={14} /> : processingStep === 3 ? <RefreshCw size={12} className="spinner-border spinner-border-sm" /> : '3'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            3. Resume Parser (F05)
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {processingStep >= 3 ? 'NLP named entity recognition & section classification' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge small ${processingStep > 3 ? 'bg-success text-white' : processingStep === 3 ? 'bg-primary text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.68rem' }}>
                        {processingStep > 3 ? 'Complete' : processingStep === 3 ? 'Parsing...' : 'Pending'}
                      </span>
                    </div>

                    {/* Step 4: Structured Candidate JSON */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                          processingStep >= 4 ? 'bg-success' : 'bg-secondary'
                        }`} style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>
                          {processingStep > 4 ? <Check size={14} /> : processingStep === 4 ? <RefreshCw size={12} className="spinner-border spinner-border-sm" /> : '4'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            4. Structured Candidate JSON
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {processingStep >= 4 ? 'Candidate JSON schema compiled with verified keys' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge small ${processingStep > 4 ? 'bg-success text-white' : processingStep === 4 ? 'bg-primary text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.68rem' }}>
                        {processingStep > 4 ? 'Complete' : processingStep === 4 ? 'Synthesizing...' : 'Pending'}
                      </span>
                    </div>

                    {/* Step 5: Resume Analysis (F06) */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                          processingStep >= 5 ? 'bg-success' : 'bg-secondary'
                        }`} style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>
                          {processingStep > 5 ? <Check size={14} /> : processingStep === 5 ? <RefreshCw size={12} className="spinner-border spinner-border-sm" /> : '5'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            5. Resume Analysis (F06)
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {processingStep >= 5 ? 'Strengths & improvement areas evaluated' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge small ${processingStep > 5 ? 'bg-success text-white' : processingStep === 5 ? 'bg-primary text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.68rem' }}>
                        {processingStep > 5 ? 'Complete' : processingStep === 5 ? 'Analyzing...' : 'Pending'}
                      </span>
                    </div>

                    {/* Step 6: ATS Score (F07) & MongoDB */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                          processingStep >= 6 ? 'bg-success' : 'bg-secondary'
                        }`} style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>
                          {processingStep >= 6 ? <Check size={14} /> : '6'}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                            6. ATS Score (F07) & MongoDB Storage
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                            {processingStep >= 6 ? 'ATS 82% calculated & record saved in MongoDB candidates collection' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge small ${processingStep >= 6 ? 'bg-success text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.68rem' }}>
                        {processingStep >= 6 ? 'Complete' : 'Pending'}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="text-secondary small d-flex align-items-center gap-1.5" style={{ fontSize: '0.76rem' }}>
                    <Info size={14} className="text-primary" />
                    <span>Please don&apos;t close this page. Redirecting automatically...</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSkipToResults}
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-2"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Skip to Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: EXTRACTED INFORMATION PAGE (F05) + RESUME ANALYSIS (F06) + ATS   */}
        {/* ========================================================================= */}
        {stage === 'results' && (
          <>
            {/* Top Navigation Ribbon for Results */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-xs border">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1">
                  <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                  <span>MongoDB Synced</span>
                </span>
                <span className="fw-bold text-dark small" style={{ fontSize: '0.86rem' }}>
                  Candidate: {candidateName} ({selectedFile.name})
                </span>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2">
                {/* View Filter Pills */}
                <div className="btn-group btn-group-sm" role="group">
                  <button 
                    type="button" 
                    onClick={() => setActiveResultTab('all')}
                    className={`btn ${activeResultTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    All Sections
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveResultTab('extracted')}
                    className={`btn ${activeResultTab === 'extracted' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Extracted Info (F05)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveResultTab('analysis')}
                    className={`btn ${activeResultTab === 'analysis' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Resume Analysis (F06)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveResultTab('ats')}
                    className={`btn ${activeResultTab === 'ats' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    ATS Score (F07)
                  </button>
                </div>

                {/* Structured Candidate JSON Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowJsonModal(true)}
                  className="btn btn-sm btn-outline-primary rounded-2 d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-xs"
                  style={{ fontSize: '0.76rem' }}
                >
                  <Code size={14} />
                  <span>Structured Candidate JSON</span>
                </button>
              </div>
            </div>

            {/* Candidate Summary Quick Strip */}
            <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                    style={{ width: '48px', height: '48px', backgroundColor: '#2563EB', fontSize: '1.1rem' }}
                  >
                    {candidateInitials}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h2 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                        {candidateName}
                      </h2>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill small">
                        {candidateRole}
                      </span>
                    </div>
                    <div className="text-secondary small d-flex flex-wrap align-items-center gap-2 mt-0.5" style={{ fontSize: '0.76rem' }}>
                      <span>{candidateEmail}</span>
                      <span>•</span>
                      <span>{user?.profile?.location || 'Bengaluru, India'}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>ATS Match Score</div>
                    <div className="fw-bolder text-success" style={{ fontSize: '1.25rem' }}>82 / 100</div>
                  </div>
                  <div className="border-start ps-3 text-end">
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Experience Level</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Fresher / Intern</div>
                  </div>
                  <div className="border-start ps-3 text-end">
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Total Skills</div>
                    <div className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>18 Extracted</div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 1: F05 EXTRACTED INFORMATION --- */}
            {(activeResultTab === 'all' || activeResultTab === 'extracted') && (
              <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white mb-4">
                {/* Header with F05 Badge */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span 
                        className="badge px-2.5 py-1 rounded-2 fw-bold text-white shadow-xs"
                        style={{ backgroundColor: '#2563EB', fontSize: '0.75rem', letterSpacing: '0.03em' }}
                      >
                        F05
                      </span>
                      <h2 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                        Extracted Information
                      </h2>
                    </div>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>
                      AI Resume Parser has processed the text stream into structured profile blocks.
                    </p>
                  </div>

                  {/* JSON view quick button */}
                  <button
                    type="button"
                    onClick={() => setShowJsonModal(true)}
                    className="btn btn-sm btn-outline-secondary rounded-2 d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <FileCode size={13} />
                    <span>View JSON Output</span>
                  </button>
                </div>

                {/* Horizontal Category Tabs */}
                <div className="border-bottom mb-3 d-flex overflow-x-auto gap-3 pb-1" style={{ whiteSpace: 'nowrap' }}>
                  {(['Overview', 'Skills', 'Experience', 'Projects', 'Education', 'Certifications'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveExtractedTab(tab)}
                      className={`btn btn-link p-0 text-decoration-none fw-semibold border-bottom border-2 pb-1.5 transition-all ${
                        activeExtractedTab === tab
                          ? 'text-primary border-primary'
                          : 'text-secondary border-transparent'
                      }`}
                      style={{ fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Sub-Card Tab Content */}
                {activeExtractedTab === 'Overview' && (
                  <div className="row g-3">
                    {/* Sub-Card 1: Skills (green icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center text-success"
                            style={{ width: '26px', height: '26px', backgroundColor: '#DCFCE7' }}
                          >
                            <Layers size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Skills (General)</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Git', 'Docker'].map((s) => (
                            <span 
                              key={s} 
                              className="badge bg-white text-dark border px-2 py-1 rounded-2"
                              style={{ fontSize: '0.72rem', fontWeight: 500 }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sub-Card 2: Programming Languages (teal icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{ width: '26px', height: '26px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
                          >
                            <Terminal size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Programming Languages</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'SQL'].map((pl) => (
                            <span 
                              key={pl} 
                              className="badge bg-white text-dark border px-2 py-1 rounded-2"
                              style={{ fontSize: '0.72rem', fontWeight: 500 }}
                            >
                              {pl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sub-Card 3: Frameworks (purple icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                            style={{ width: '26px', height: '26px', backgroundColor: '#F3E8FF', color: '#9333EA' }}
                          >
                            <Code2 size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Frameworks & Libraries</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {['React', 'Node.js', 'Express.js', 'Django', 'Next.js', 'Redux', 'Bootstrap', 'Tailwind CSS'].map((f) => (
                            <span 
                              key={f} 
                              className="badge bg-white text-dark border px-2 py-1 rounded-2"
                              style={{ fontSize: '0.72rem', fontWeight: 500 }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sub-Card 4: Projects (orange icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{ width: '26px', height: '26px', backgroundColor: '#FFEDD5', color: '#EA580C' }}
                          >
                            <FolderGit2 size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Projects</span>
                        </div>
                        <ol className="mb-0 ps-3 text-secondary small" style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                          <li><strong className="text-dark">AI Resume Analyzer</strong> — React, Node, Python NLP, MongoDB</li>
                          <li><strong className="text-dark">E-commerce Web App</strong> — MERN Stack, Stripe API, Redux</li>
                          <li><strong className="text-dark">Weather Forecasting App</strong> — JavaScript, OpenWeatherMap, Chart.js</li>
                        </ol>
                      </div>
                    </div>

                    {/* Sub-Card 5: Experience (red icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{ width: '26px', height: '26px', backgroundColor: '#FFE4E6', color: '#E11D48' }}
                          >
                            <Briefcase size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Work Experience</span>
                        </div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                          Software Developer Intern
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                          ABC Tech Solutions | Jan 2023 – Jun 2023 (Bengaluru, India)
                        </div>
                      </div>
                    </div>

                    {/* Sub-Card 6: Education (blue icon) */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-light h-100" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                            style={{ width: '26px', height: '26px', backgroundColor: '#DBEAFE', color: '#2563EB' }}
                          >
                            <GraduationCap size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Education</span>
                        </div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                          B.Tech in Computer Science & Engineering
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                          XYZ University | 2020 – 2024 (CGPA 8.7 / 10.0)
                        </div>
                      </div>
                    </div>

                    {/* Sub-Card 7: Certifications (amber icon) */}
                    <div className="col-12">
                      <div className="p-3 rounded-3 border bg-light" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center"
                            style={{ width: '26px', height: '26px', backgroundColor: '#FEF3C7', color: '#D97706' }}
                          >
                            <Award size={15} />
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>Certifications</span>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {['AWS Certified Cloud Practitioner', 'Google Data Analytics Certificate', 'MERN Stack Development (Meta)'].map((c) => (
                            <span 
                              key={c} 
                              className="badge bg-white text-dark border px-2.5 py-1.5 rounded-2"
                              style={{ fontSize: '0.74rem', fontWeight: 500 }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeExtractedTab === 'Skills' && (
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="fw-bold text-dark small mb-2">Core Languages</div>
                      <div className="d-flex flex-wrap gap-2">
                        {['JavaScript (Advanced)', 'TypeScript (Intermediate)', 'Python (Intermediate)', 'Java (Core)', 'C++ (DSA)', 'SQL (Queries & Joins)'].map(s => (
                          <span key={s} className="badge bg-white text-dark border px-2.5 py-1.5 rounded-2 small">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="fw-bold text-dark small mb-2">Web & Cloud Technologies</div>
                      <div className="d-flex flex-wrap gap-2">
                        {['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Redis (Basics)', 'Docker', 'AWS S3', 'Git / GitHub'].map(s => (
                          <span key={s} className="badge bg-white text-primary border px-2.5 py-1.5 rounded-2 small">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeExtractedTab === 'Experience' && (
                  <div className="p-3 rounded-3 border bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="fw-bold text-dark">Software Developer Intern</div>
                      <span className="badge bg-primary-subtle text-primary border">Jan 2023 – Jun 2023</span>
                    </div>
                    <div className="text-secondary small mb-3">ABC Tech Solutions • Bengaluru, India</div>
                    <ul className="mb-0 text-secondary small ps-3" style={{ lineHeight: '1.6' }}>
                      <li>Engineered reusable client portals with React and Tailwind CSS, reducing page load latency by 34%.</li>
                      <li>Designed and integrated 12+ RESTful API endpoints using Node.js and Express with JWT authentication.</li>
                      <li>Collaborated with senior engineers to containerize internal dev environments using Docker.</li>
                    </ul>
                  </div>
                )}

                {activeExtractedTab === 'Projects' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="fw-bold text-dark mb-1">AI Resume Analyzer</div>
                        <div className="badge bg-primary text-white mb-2">React, Node, NLP</div>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.76rem' }}>
                          Automated resume parsing engine with ATS score computation and semantic feedback.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="fw-bold text-dark mb-1">E-commerce Web App</div>
                        <div className="badge bg-success text-white mb-2">MERN Stack, Stripe</div>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.76rem' }}>
                          Full-stack retail application with cart persistence, payment gateway, and admin panel.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="fw-bold text-dark mb-1">Weather Forecasting App</div>
                        <div className="badge bg-info text-white mb-2">JS, Chart.js, APIs</div>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.76rem' }}>
                          Climatic tracker plotting temperature, humidity, and barometric trends across 5 days.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeExtractedTab === 'Education' && (
                  <div className="p-3 rounded-3 border bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="fw-bold text-dark">Bachelor of Technology (B.Tech) - Computer Science</div>
                      <span className="badge bg-info-subtle text-info border">2020 – 2024</span>
                    </div>
                    <div className="text-secondary small mb-2">XYZ University • Grade: 8.7 CGPA</div>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
                      Relevant Coursework: Data Structures & Algorithms, Database Management Systems (DBMS), Operating Systems, Computer Networks, Software Engineering.
                    </p>
                  </div>
                )}

                {activeExtractedTab === 'Certifications' && (
                  <div className="d-flex flex-column gap-2">
                    {[
                      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Valid 2023 - 2026' },
                      { name: 'Google Data Analytics Professional Certificate', issuer: 'Coursera / Google', date: 'Issued 2023' },
                      { name: 'MERN Stack Development Specialization', issuer: 'Meta', date: 'Issued 2022' }
                    ].map((cert, idx) => (
                      <div key={idx} className="p-2.5 rounded-2 border bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>{cert.name}</div>
                          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>{cert.issuer}</div>
                        </div>
                        <span className="badge bg-white text-secondary border small">{cert.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- SECTION 2: F06 RESUME ANALYSIS & F07 ATS SCORE (Side-by-Side or Full) --- */}
            <div className="row g-4 mb-4">
              {/* F06: Resume Analysis Card */}
              {(activeResultTab === 'all' || activeResultTab === 'analysis') && (
                <div className={`col-12 ${activeResultTab === 'analysis' ? 'col-lg-12' : 'col-lg-6'}`}>
                  <div className="card h-100 border-0 shadow-sm rounded-3 p-3.5 bg-white">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span 
                        className="badge px-2.5 py-1 rounded-2 fw-bold text-white shadow-xs"
                        style={{ backgroundColor: '#2563EB', fontSize: '0.75rem', letterSpacing: '0.03em' }}
                      >
                        F06
                      </span>
                      <h2 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                        Resume Analysis
                      </h2>
                    </div>
                    <p className="text-secondary small mb-3" style={{ fontSize: '0.8rem' }}>
                      AI-powered qualitative and quantitative analysis of your resume with detailed recommendations.
                    </p>

                    <div className="row g-3">
                      {/* Left Sub-Column: Overall Analysis + Strengths & Improvements */}
                      <div className="col-12 col-md-7">
                        <div className="mb-3">
                          <h3 className="fw-bold text-dark small mb-1" style={{ fontSize: '0.86rem' }}>
                            Overall Analysis
                          </h3>
                          <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                            Your resume is well-structured and showcases a good mix of technical skills and projects. With some improvements in highlighting quantified achievements and adding distributed systems keywords, it can be even stronger.
                          </p>
                        </div>

                        <div className="d-flex flex-column gap-2.5">
                          {/* Strengths Container (Green) */}
                          <div 
                            className="p-2.5 rounded-3 border"
                            style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1.5 text-success fw-bold small" style={{ fontSize: '0.8rem' }}>
                              <CheckCircle2 size={15} />
                              <span>Strengths</span>
                            </div>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                              {[
                                'Strong technical skill set in full-stack web',
                                'Good project portfolio with live GitHub code',
                                'Relevant work experience in software engineering',
                                'Well-structured chronological sections',
                                'Good use of action verbs in project descriptions'
                              ].map((str, idx) => (
                                <li key={idx} className="d-flex align-items-center gap-2 text-dark small" style={{ fontSize: '0.75rem' }}>
                                  <Check size={13} className="text-success flex-shrink-0" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Areas for Improvement Container (Red) */}
                          <div 
                            className="p-2.5 rounded-3 border"
                            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1.5 text-danger fw-bold small" style={{ fontSize: '0.8rem' }}>
                              <AlertCircle size={15} />
                              <span>Areas for Improvement</span>
                            </div>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                              {[
                                'Add more quantified achievements (e.g. latency % or user scale)',
                                'Include relevant cloud/caching keywords (Redis, Kafka)',
                                'Highlight team leadership and code reviews',
                                'Improve formatting consistency across bullet margins',
                                'Add more industry-relevant backend keywords'
                              ].map((imp, idx) => (
                                <li key={idx} className="d-flex align-items-center gap-2 text-dark small" style={{ fontSize: '0.75rem' }}>
                                  <AlertTriangle size={13} className="text-danger flex-shrink-0" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Right Sub-Column: Detailed Scores */}
                      <div className="col-12 col-md-5 d-flex flex-column justify-content-between">
                        <div>
                          <h3 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.86rem' }}>
                            Detailed Scores
                          </h3>

                          <div className="d-flex flex-column gap-3 mb-3">
                            {/* Technical Skills: 84% */}
                            <div>
                              <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                                <span className="text-dark">Technical Skills</span>
                                <span className="text-dark fw-bold">84%</span>
                              </div>
                              <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: '84%', backgroundColor: '#10B981', borderRadius: '4px' }}
                                />
                              </div>
                            </div>

                            {/* Project Quality: 81% */}
                            <div>
                              <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                                <span className="text-dark">Project Quality</span>
                                <span className="text-dark fw-bold">81%</span>
                              </div>
                              <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: '81%', backgroundColor: '#2563EB', borderRadius: '4px' }}
                                />
                              </div>
                            </div>

                            {/* Experience: 72% */}
                            <div>
                              <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                                <span className="text-dark">Experience</span>
                                <span className="text-dark fw-bold">72%</span>
                              </div>
                              <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: '72%', backgroundColor: '#F97316', borderRadius: '4px' }}
                                />
                              </div>
                            </div>

                            {/* Resume Quality: 79% */}
                            <div>
                              <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                                <span className="text-dark">Resume Quality</span>
                                <span className="text-dark fw-bold">79%</span>
                              </div>
                              <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: '79%', backgroundColor: '#9333EA', borderRadius: '4px' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Great Potential Notice Box */}
                        <div 
                          className="p-3 rounded-3 border d-flex align-items-start gap-2.5 mt-auto"
                          style={{ backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }}
                        >
                          <Star size={18} className="text-warning flex-shrink-0 mt-0.5" fill="#EAB308" />
                          <div>
                            <div className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.8rem' }}>
                              Great Potential!
                            </div>
                            <div className="text-secondary small" style={{ fontSize: '0.73rem', lineHeight: '1.4' }}>
                              Your resume shows strong potential. Keep improving and you&apos;re on the right track!
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* F07: ATS Score Card */}
              {(activeResultTab === 'all' || activeResultTab === 'ats') && (
                <div className={`col-12 ${activeResultTab === 'ats' ? 'col-lg-12' : 'col-lg-6'}`}>
                  <div className="card h-100 border-0 shadow-sm rounded-3 p-3.5 bg-white">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span 
                        className="badge px-2.5 py-1 rounded-2 fw-bold text-white shadow-xs"
                        style={{ backgroundColor: '#2563EB', fontSize: '0.75rem', letterSpacing: '0.03em' }}
                      >
                        F07
                      </span>
                      <h2 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                        ATS Score
                      </h2>
                    </div>
                    <p className="text-secondary small mb-3" style={{ fontSize: '0.8rem' }}>
                      See how well your resume matches industry standards and Automated Applicant Tracking Systems.
                    </p>

                    <div className="row g-3">
                      {/* Left Sub-Column: Circular Gauge + Good Score notice */}
                      <div className="col-12 col-md-5 d-flex flex-column justify-content-between align-items-center text-center">
                        {/* Gauge Graphic */}
                        <div className="position-relative my-2" style={{ width: '150px', height: '150px' }}>
                          <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Track */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#F1F5F9"
                              strokeWidth="8"
                            />
                            {/* Progress Arc (82%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#10B981"
                              strokeWidth="8"
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.82)}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                            />
                          </svg>
                          <div 
                            className="position-absolute top-50 start-50 translate-middle text-center"
                            style={{ pointerEvents: 'none' }}
                          >
                            <div className="fw-bolder text-dark lh-1" style={{ fontSize: '2rem' }}>
                              <span style={{ color: '#10B981' }}>82</span>
                              <span className="text-secondary fw-normal" style={{ fontSize: '1rem' }}>/100</span>
                            </div>
                            <div className="text-secondary small fw-medium mt-1" style={{ fontSize: '0.75rem' }}>
                              ATS Score
                            </div>
                          </div>
                        </div>

                        {/* Good Score Message Container */}
                        <div 
                          className="p-2.5 rounded-3 border text-start d-flex align-items-start gap-2 w-100 mt-auto"
                          style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
                        >
                          <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="fw-bold text-success small" style={{ fontSize: '0.8rem' }}>
                              Good Score!
                            </div>
                            <div className="text-dark small" style={{ fontSize: '0.72rem', lineHeight: '1.4' }}>
                              Your resume is likely to pass most ATS screening systems. Consider the suggestions below to reach 95%+.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Sub-Column: ATS Analysis Breakdown & Suggestions */}
                      <div className="col-12 col-md-7">
                        <h3 className="fw-bold text-dark small mb-2.5" style={{ fontSize: '0.84rem' }}>
                          ATS Analysis Breakdown
                        </h3>

                        <div className="d-flex flex-column gap-2 mb-3">
                          {/* Relevant Keywords: 85% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Relevant Keywords</span>
                              <span className="text-dark fw-bold">85%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '85%', backgroundColor: '#0D9488' }} />
                            </div>
                          </div>

                          {/* Resume Sections: 90% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Resume Sections</span>
                              <span className="text-dark fw-bold">90%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '90%', backgroundColor: '#2563EB' }} />
                            </div>
                          </div>

                          {/* Job-related Keywords: 78% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Job-related Keywords</span>
                              <span className="text-dark fw-bold">78%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '78%', backgroundColor: '#F97316' }} />
                            </div>
                          </div>

                          {/* Formatting: 80% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Formatting Quality</span>
                              <span className="text-dark fw-bold">80%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '80%', backgroundColor: '#8B5CF6' }} />
                            </div>
                          </div>

                          {/* Skills Relevance: 84% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Skills Relevance</span>
                              <span className="text-dark fw-bold">84%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '84%', backgroundColor: '#06B6D4' }} />
                            </div>
                          </div>

                          {/* Experience/Project Relevance: 76% */}
                          <div>
                            <div className="d-flex justify-content-between small mb-0.5" style={{ fontSize: '0.74rem' }}>
                              <span className="text-secondary">Experience / Project Relevance</span>
                              <span className="text-dark fw-bold">76%</span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#F1F5F9' }}>
                              <div className="progress-bar" style={{ width: '76%', backgroundColor: '#F43F5E' }} />
                            </div>
                          </div>
                        </div>

                        {/* Suggestions to Improve ATS Score Card */}
                        <div 
                          className="p-2.5 rounded-3 border"
                          style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}
                        >
                          <div className="d-flex align-items-center gap-1.5 fw-bold text-warning-emphasis mb-1" style={{ fontSize: '0.78rem' }}>
                            <Lightbulb size={14} className="text-warning" />
                            <span>Suggestions to Reach 95%+ ATS Score</span>
                          </div>
                          <ul className="mb-0 ps-3 text-secondary small" style={{ fontSize: '0.72rem', lineHeight: '1.5' }}>
                            <li>Include more specific backend keywords (Docker Compose, Redis, Unit Testing)</li>
                            <li>Add quantified performance metrics to your ABC Tech Solutions bullet points</li>
                            <li>Maintain standard single-column PDF margins for flawless machine parsing</li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- SECTION 3: MONGODB & FUTURE PHASES (Job Matching & AI Interview) --- */}
            {/* Directly implements the bottom branch of the user's flowchart:
                 Candidate Profile -> MongoDB -> [Job Matching (Future Phase) | AI Interview (Future Phase)] */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success text-white rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1">
                      <Database size={12} />
                      <span>Saved in MongoDB</span>
                    </span>
                    <h3 className="h6 fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                      Downstream Future Phases: Next Steps
                    </h3>
                  </div>
                  <p className="text-secondary small mb-0 mt-1" style={{ fontSize: '0.82rem' }}>
                    Candidate profile indexed in <code className="text-primary bg-light px-1 py-0.5 rounded">candidates</code> collection (<span className="text-muted">_id: 66d4f9b8c12a874e5021e102</span>). Select a future phase below:
                  </p>
                </div>

                <div className="btn-group btn-group-sm" role="group">
                  <button 
                    type="button" 
                    onClick={() => setActivePipelineTab('all')}
                    className={`btn ${activePipelineTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    All Next Steps
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActivePipelineTab('jobs')}
                    className={`btn ${activePipelineTab === 'jobs' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Job Matching Branch
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActivePipelineTab('interview')}
                    className={`btn ${activePipelineTab === 'interview' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    AI Interview Branch
                  </button>
                </div>
              </div>

              {/* Dual Branching Grid matching the Flowchart */}
              <div className="row g-3">
                {/* BRANCH A: Job Matching (Future Phase) */}
                {(activePipelineTab === 'all' || activePipelineTab === 'jobs') && (
                  <div className="col-12 col-md-6">
                    <div 
                      className="p-3.5 rounded-3 border h-100 d-flex flex-column justify-content-between transition-all"
                      style={{ backgroundColor: '#F8FAFC', borderColor: '#BFDBFE' }}
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                            style={{ width: '36px', height: '36px', backgroundColor: '#EFF6FF' }}
                          >
                            <Briefcase size={18} />
                          </div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                            14 Matched Roles
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-primary text-white" style={{ fontSize: '0.68rem' }}>Flowchart Branch 1</span>
                          <h4 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.98rem' }}>
                            Job Matching (Future Phase)
                          </h4>
                        </div>
                        <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                          Matches your extracted full-stack MERN & Python profile against active job openings at Razorpay, Atlassian, and Swiggy with high compatibility (91% top match).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateToJobs}
                        className="btn btn-primary w-100 rounded-2 d-flex align-items-center justify-content-center gap-2 py-2"
                        style={{ backgroundColor: '#2563EB', fontSize: '0.82rem' }}
                      >
                        <span>Open Job Matching & Recommendations</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* BRANCH B: AI Interview (Future Phase) */}
                {(activePipelineTab === 'all' || activePipelineTab === 'interview') && (
                  <div className="col-12 col-md-6">
                    <div 
                      className="p-3.5 rounded-3 border h-100 d-flex flex-column justify-content-between transition-all"
                      style={{ backgroundColor: '#F8FAFC', borderColor: '#DDD6FE' }}
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div 
                            className="rounded-2 d-flex align-items-center justify-content-center text-purple"
                            style={{ width: '36px', height: '36px', backgroundColor: '#F5F3FF', color: '#7C3AED' }}
                          >
                            <Sparkles size={18} />
                          </div>
                          <span className="badge bg-purple-subtle text-purple border rounded-pill" style={{ color: '#7C3AED', backgroundColor: '#F5F3FF' }}>
                            3 AI Tracks
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-purple text-white" style={{ backgroundColor: '#7C3AED', fontSize: '0.68rem' }}>Flowchart Branch 2</span>
                          <h4 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.98rem' }}>
                            AI Interview (Future Phase)
                          </h4>
                        </div>
                        <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                          Personalized AI technical, HR behavioral, and project deep-dive interviews generated directly from your parsed projects (AI Resume Analyzer, E-commerce).
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={onOpenMockTest}
                          className="btn btn-primary flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1.5 py-2"
                          style={{ backgroundColor: '#7C3AED', borderColor: '#7C3AED', fontSize: '0.82rem' }}
                        >
                          <Play size={14} />
                          <span>Start AI Interview</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenCoding}
                          className="btn btn-outline-secondary rounded-2 d-flex align-items-center justify-content-center gap-1 py-2 px-3"
                          style={{ fontSize: '0.82rem' }}
                        >
                          <Code2 size={14} />
                          <span>Coding</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>

      {/* --- STRUCTURED CANDIDATE JSON MODAL (Inspection viewer) --- */}
      {showJsonModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050, backdropFilter: 'blur(3px)' }}
        >
          <div 
            className="card border-0 shadow-lg rounded-4 overflow-hidden w-100 bg-white"
            style={{ maxWidth: '820px', maxHeight: '88vh' }}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between p-3.5 border-bottom bg-light">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 rounded-2 bg-primary text-white">
                  <Code size={16} />
                </div>
                <div>
                  <div className="fw-bold text-dark small" style={{ fontSize: '0.92rem' }}>
                    Structured Candidate JSON Schema (MongoDB Record)
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                    Synthesized by Resume Parser (F05) prior to MongoDB insertion
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="btn btn-sm btn-outline-secondary rounded-2 d-flex align-items-center gap-1.5 px-2.5 py-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  {copiedJson ? (
                    <>
                      <CheckCheck size={14} className="text-success" />
                      <span className="text-success fw-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="btn btn-sm btn-primary rounded-2 d-flex align-items-center gap-1.5 px-2.5 py-1"
                  style={{ backgroundColor: '#2563EB', fontSize: '0.75rem' }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="btn-close ms-2"
                  aria-label="Close"
                />
              </div>
            </div>

            {/* Modal Body: Syntax View */}
            <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 120px)', backgroundColor: '#0F172A' }}>
              <pre className="mb-0 text-white font-monospace" style={{ fontSize: '0.76rem', lineHeight: '1.5' }}>
                <code>{JSON.stringify(candidateStructuredJson, null, 2)}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="d-flex align-items-center justify-content-between p-3 border-top bg-light">
              <div className="text-secondary small d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
                <Database size={14} className="text-success" />
                <span>Collection: <strong>candidates</strong> | Validated against MongoDB schema</span>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="btn btn-sm btn-secondary px-3 py-1 rounded-2"
                style={{ fontSize: '0.78rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
