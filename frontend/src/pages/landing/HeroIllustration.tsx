import React from 'react';
import { 
  FileText, 
  Code2, 
  Briefcase, 
  Mic, 
  Github, 
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import heroPersonImg from '../../assets/images/hero-person.jpg';

interface HeroIllustrationProps {
  onSelectFeature?: (featureKey: string) => void;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ onSelectFeature }) => {
  return (
    <div className="sn-hero-graphic-wrap">
      {/* Mint Radial Glow Background */}
      <div className="sn-hero-glow-bg" />

      {/* Main Composite Card */}
      <div className="sn-hero-monitor-screen">
        {/* Top Window Bar */}
        <div className="sn-monitor-topbar">
          <div className="sn-monitor-dots">
            <span className="sn-monitor-dot sn-dot-red" />
            <span className="sn-monitor-dot sn-dot-yellow" />
            <span className="sn-monitor-dot sn-dot-green" />
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-white text-secondary border px-2 py-1" style={{ fontSize: '0.72rem' }}>
              app.skillnexus.ai
            </span>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Dashboard Preview + Person Image Composite */}
        <div className="position-relative" style={{ minHeight: '380px' }}>
          {/* Simulated Dashboard Screen Backdrop */}
          <div 
            className="p-3" 
            style={{ 
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.75rem'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark">Welcome back, Nitesh! 👋</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2">
                  Pro Candidate
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Candidate Portal</span>
            </div>

            {/* Mini Dashboard Metric Cards */}
            <div className="row g-2 mb-2">
              <div className="col-4">
                <div className="bg-white p-2 rounded border text-center shadow-xs">
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Interview Readiness</div>
                  <div className="fw-bold text-success" style={{ fontSize: '1rem' }}>78<span style={{ fontSize: '0.65rem', color: '#64748b' }}>/100</span></div>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-white p-2 rounded border text-center shadow-xs">
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Resume Score</div>
                  <div className="fw-bold text-primary" style={{ fontSize: '1rem' }}>82<span style={{ fontSize: '0.65rem', color: '#64748b' }}>/100</span></div>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-white p-2 rounded border text-center shadow-xs">
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Coding Progress</div>
                  <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>12 <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Solved</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo of Professional Engineer at Laptop */}
          <div className="sn-hero-photo-wrapper">
            <img 
              src={heroPersonImg} 
              alt="SkillNexus Candidate preparing for technical interviews" 
              className="sn-hero-photo"
              style={{ maxHeight: '380px' }}
            />
            {/* Soft gradient overlay at bottom of photo */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70px',
                background: 'linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 100%)',
                pointerEvents: 'none'
              }}
            />
            {/* SkillNexus Laptop Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0F172A',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              🎓 SkillNexus Platform
            </div>
          </div>
        </div>
      </div>

      {/* 6 Desktop Floating Feature Badges (Matching Reference Image Positions) */}
      <div className="d-none d-md-block">
        {/* 1. Resume Analyzer (Top Left) */}
        <div 
          className="sn-floating-badge badge-pos-resume"
          onClick={() => onSelectFeature?.('resume')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="Resume Analyzer"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <FileText size={18} />
          </div>
          <div>
            <div className="sn-float-title">Resume Analyzer</div>
            <div className="sn-float-desc">ATS Score &amp; Feedback</div>
          </div>
        </div>

        {/* 2. Coding Interview (Top Right) */}
        <div 
          className="sn-floating-badge badge-pos-coding"
          onClick={() => onSelectFeature?.('coding')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="Coding Interview"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <Code2 size={18} />
          </div>
          <div>
            <div className="sn-float-title">Coding Interview</div>
            <div className="sn-float-desc">Real-time Execution</div>
          </div>
        </div>

        {/* 3. Job Recommendations (Mid Left) */}
        <div 
          className="sn-floating-badge badge-pos-jobs"
          onClick={() => onSelectFeature?.('jobs')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="Job Recommendations"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <div className="sn-float-title">Job Recommendations</div>
            <div className="sn-float-desc">Personalized for You</div>
          </div>
        </div>

        {/* 4. Voice Interview (Mid Right) */}
        <div 
          className="sn-floating-badge badge-pos-voice"
          onClick={() => onSelectFeature?.('voice')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="Voice Interview"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
            <Mic size={18} />
          </div>
          <div>
            <div className="sn-float-title">Voice Interview</div>
            <div className="sn-float-desc">AI Feedback</div>
          </div>
        </div>

        {/* 5. GitHub & Open Source (Bottom Left) */}
        <div 
          className="sn-floating-badge badge-pos-github"
          onClick={() => onSelectFeature?.('github')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="GitHub & Open Source"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
            <Github size={18} />
          </div>
          <div>
            <div className="sn-float-title">GitHub &amp; Open Source</div>
            <div className="sn-float-desc">Find Contribution Opportunities</div>
          </div>
        </div>

        {/* 6. Communication Analysis (Bottom Right) */}
        <div 
          className="sn-floating-badge badge-pos-comm"
          onClick={() => onSelectFeature?.('communication')}
          style={{ cursor: 'pointer' }}
          role="button"
          title="Communication Analysis"
        >
          <div className="sn-float-icon-box" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="sn-float-title">Communication Analysis</div>
            <div className="sn-float-desc">Improve Speaking Skills</div>
          </div>
        </div>
      </div>

      {/* Mobile Badges Grid (Shown neatly below image on phones) */}
      <div className="d-md-none sn-mobile-badges-grid">
        <div className="sn-floating-badge" onClick={() => onSelectFeature?.('resume')}>
          <div className="sn-float-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
            <FileText size={16} />
          </div>
          <div>
            <div className="sn-float-title">Resume Analyzer</div>
            <div className="sn-float-desc">ATS &amp; Feedback</div>
          </div>
        </div>
        <div className="sn-floating-badge" onClick={() => onSelectFeature?.('coding')}>
          <div className="sn-float-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <Code2 size={16} />
          </div>
          <div>
            <div className="sn-float-title">Coding Interview</div>
            <div className="sn-float-desc">Judge0 Execution</div>
          </div>
        </div>
        <div className="sn-floating-badge" onClick={() => onSelectFeature?.('voice')}>
          <div className="sn-float-icon-box" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
            <Mic size={16} />
          </div>
          <div>
            <div className="sn-float-title">Voice Interview</div>
            <div className="sn-float-desc">AI Evaluation</div>
          </div>
        </div>
        <div className="sn-floating-badge" onClick={() => onSelectFeature?.('jobs')}>
          <div className="sn-float-icon-box" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            <Briefcase size={16} />
          </div>
          <div>
            <div className="sn-float-title">Job Recommendations</div>
            <div className="sn-float-desc">Personalized Matches</div>
          </div>
        </div>
      </div>
    </div>
  );
};
