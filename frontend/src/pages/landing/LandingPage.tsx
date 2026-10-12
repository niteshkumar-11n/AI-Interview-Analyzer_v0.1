import React, { useState } from 'react';
import { 
  GraduationCap, 
  Rocket, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  FileText, 
  Code2, 
  Mic, 
  MessageSquare, 
  Briefcase, 
  Github, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Terminal,
  Cpu,
  Database,
  Layers,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { HeroIllustration } from './HeroIllustration.tsx';
import './LandingPage.css';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isAuthenticated?: boolean;
  onNavigateToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  isAuthenticated = false,
  onNavigateToDashboard,
}) => {
  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'how-it-works' | 'technologies' | 'pricing'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string, navKey: 'home' | 'features' | 'how-it-works' | 'technologies' | 'pricing') => {
    setActiveSection(navKey);
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeatureClick = () => {
    if (isAuthenticated && onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      onOpenRegister();
    }
  };

  return (
    <div className="sn-landing-page">
      {/* 1. Header / Navigation Bar */}
      <nav className="sn-navbar py-3 px-3 px-md-4 px-lg-5">
        <div className="container-fluid d-flex align-items-center justify-content-between p-0 max-w-7xl">
          {/* Logo */}
          <a 
            href="#home" 
            className="sn-brand-logo"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home', 'home');
            }}
          >
            <div className="sn-logo-badge">
              <GraduationCap size={22} />
            </div>
            <span>SkillNexus</span>
          </a>

          {/* Center Links (Desktop) */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            <a 
              href="#home" 
              className={`sn-nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home', 'home');
              }}
            >
              Home
            </a>
            <a 
              href="#features" 
              className={`sn-nav-link ${activeSection === 'features' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features', 'features');
              }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className={`sn-nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works', 'how-it-works');
              }}
            >
              How It Works
            </a>
            <a 
              href="#technologies" 
              className={`sn-nav-link ${activeSection === 'technologies' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('technologies', 'technologies');
              }}
            >
              Technologies
            </a>
            <a 
              href="#pricing" 
              className={`sn-nav-link ${activeSection === 'pricing' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('pricing', 'pricing');
              }}
            >
              Pricing
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <button 
                type="button" 
                className="sn-btn-primary d-flex align-items-center gap-2"
                onClick={onNavigateToDashboard}
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  className="sn-btn-login"
                  onClick={onOpenLogin}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  className="sn-btn-primary"
                  onClick={onOpenRegister}
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn btn-light d-lg-none p-2 border"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="d-lg-none pt-3 pb-2 border-top mt-3 bg-white">
            <div className="d-flex flex-column gap-2">
              <button 
                className="btn btn-link text-start text-dark text-decoration-none px-2"
                onClick={() => scrollToSection('home', 'home')}
              >
                Home
              </button>
              <button 
                className="btn btn-link text-start text-dark text-decoration-none px-2"
                onClick={() => scrollToSection('features', 'features')}
              >
                Features
              </button>
              <button 
                className="btn btn-link text-start text-dark text-decoration-none px-2"
                onClick={() => scrollToSection('how-it-works', 'how-it-works')}
              >
                How It Works
              </button>
              <button 
                className="btn btn-link text-start text-dark text-decoration-none px-2"
                onClick={() => scrollToSection('technologies', 'technologies')}
              >
                Technologies
              </button>
              <button 
                className="btn btn-link text-start text-dark text-decoration-none px-2"
                onClick={() => scrollToSection('pricing', 'pricing')}
              >
                Pricing
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="sn-hero-section">
        <div className="container px-4 px-lg-5">
          <div className="row align-items-center g-5">
            {/* Left Content Column */}
            <div className="col-lg-6 col-xl-6">
              {/* Top Badge */}
              <div className="sn-badge-pill">
                <Rocket size={15} />
                <span>AI-Powered Career &amp; Interview Preparation Platform</span>
              </div>

              {/* Headline */}
              <h1 className="sn-hero-title">
                Build Skills.<br />
                Ace Interviews.<br />
                Grow Your Career.
              </h1>

              {/* Subtitle */}
              <p className="sn-hero-description">
                Prepare for technical interviews, analyze your resume, discover relevant IT jobs,
                improve communication, and find open-source opportunities with AI-powered career guidance.
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
                <button 
                  type="button" 
                  className="sn-hero-cta-btn"
                  onClick={isAuthenticated && onNavigateToDashboard ? onNavigateToDashboard : onOpenRegister}
                >
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
                  <ArrowRight size={18} />
                </button>
                <button 
                  type="button" 
                  className="sn-hero-secondary-btn"
                  onClick={() => scrollToSection('features', 'features')}
                >
                  Explore Features
                </button>
              </div>

              {/* 3 Value Pillars / Perks */}
              <div className="row g-3 pt-3 border-top" style={{ borderColor: '#F1F5F9' }}>
                <div className="col-12 col-sm-4">
                  <div className="sn-hero-perk-item">
                    <div className="sn-hero-perk-icon">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="sn-hero-perk-title">All-in-One Platform</div>
                      <div className="sn-hero-perk-sub">Everything you need</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <div className="sn-hero-perk-item">
                    <div className="sn-hero-perk-icon">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <div className="sn-hero-perk-title">AI-Powered Analysis</div>
                      <div className="sn-hero-perk-sub">Personalized insights</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <div className="sn-hero-perk-item">
                    <div className="sn-hero-perk-icon">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="sn-hero-perk-title">Career Growth</div>
                      <div className="sn-hero-perk-sub">Practical opportunities</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Illustration Column */}
            <div className="col-lg-6 col-xl-6 text-center">
              <HeroIllustration 
                onSelectFeature={() => scrollToSection('features', 'features')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (All 6 SkillNexus Features matching design) */}
      <section id="features" className="sn-features-section">
        <div className="container px-4 px-lg-5">
          {/* Section Header */}
          <div className="sn-section-header">
            <div className="sn-section-pill">
              <Sparkles size={14} />
              <span>Features</span>
            </div>
            <h2 className="sn-section-title">
              Powerful Features for Your <span className="sn-title-highlight">Career Growth</span>
            </h2>
            <p className="sn-section-subtitle">
              Everything you need to prepare, practice, and get hired — in one platform.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="row g-4">
            {/* 1. Resume Analyzer */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <FileText size={22} />
                </div>
                <h3 className="sn-feature-card-title">Resume Analyzer</h3>
                <p className="sn-feature-card-desc">
                  Upload your resume and get AI-powered analysis with ATS compatibility score and improvement suggestions.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 2. Coding Interview */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <Code2 size={22} />
                </div>
                <h3 className="sn-feature-card-title">Coding Interview</h3>
                <p className="sn-feature-card-desc">
                  Practice coding questions with real-time execution using self-hosted Judge0 CE and get instant feedback.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 3. Voice Interview */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
                  <Mic size={22} />
                </div>
                <h3 className="sn-feature-card-title">Voice Interview</h3>
                <p className="sn-feature-card-desc">
                  Practice interview questions using voice and get AI-based evaluation on your answers.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 4. Communication Analysis */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                  <MessageSquare size={22} />
                </div>
                <h3 className="sn-feature-card-title">Communication Analysis</h3>
                <p className="sn-feature-card-desc">
                  Analyze your speaking skills, clarity, relevance and confidence with AI feedback.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 5. Job Recommendations */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#FFF1F2', color: '#E11D48' }}>
                  <Briefcase size={22} />
                </div>
                <h3 className="sn-feature-card-title">Job Recommendations</h3>
                <p className="sn-feature-card-desc">
                  Discover IT jobs based on your skills, experience and career goals using AI and real job data.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 6. GitHub & Open Source */}
            <div className="col-12 col-md-6 col-lg-4 col-xl-2">
              <div className="sn-feature-card">
                <div className="sn-feature-icon-box" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
                  <Github size={22} />
                </div>
                <h3 className="sn-feature-card-title">GitHub &amp; Open Source</h3>
                <p className="sn-feature-card-desc">
                  Analyze your GitHub profile and get personalized open-source contribution recommendations.
                </p>
                <button 
                  type="button" 
                  className="sn-feature-card-link"
                  onClick={handleFeatureClick}
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="sn-steps-section">
        <div className="container px-4 px-lg-5">
          <div className="sn-section-header">
            <div className="sn-section-pill">
              <span>Workflow</span>
            </div>
            <h2 className="sn-section-title">
              How SkillNexus <span className="sn-title-highlight">Empowers You</span>
            </h2>
            <p className="sn-section-subtitle">
              A structured 3-step pathway from candidate onboarding to receiving job offers.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="sn-step-card">
                <div className="sn-step-number">1</div>
                <h4 className="fw-bold mb-2 text-dark">Profile &amp; Skill Baseline</h4>
                <p className="text-secondary small">
                  Complete candidate onboarding, configure your target engineering role, and upload your resume for automatic fact extraction.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="sn-step-card">
                <div className="sn-step-number">2</div>
                <h4 className="fw-bold mb-2 text-dark">AI Interview &amp; Code Practice</h4>
                <p className="text-secondary small">
                  Simulate voice mock interviews with AI interviewers and run real algorithmic challenges verified through self-hosted Judge0 CE.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="sn-step-card">
                <div className="sn-step-number">3</div>
                <h4 className="fw-bold mb-2 text-dark">Job Matches &amp; Open Source</h4>
                <p className="text-secondary small">
                  Receive personalized IT job matches aligned with your confirmed skills and find high-impact open-source issues to strengthen your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technologies Section */}
      <section id="technologies" className="py-5 bg-white">
        <div className="container px-4 px-lg-5 py-4">
          <div className="sn-section-header">
            <div className="sn-section-pill">
              <span>Architecture</span>
            </div>
            <h2 className="sn-section-title">
              Built on Modern <span className="sn-title-highlight">Engineering Standards</span>
            </h2>
            <p className="sn-section-subtitle">
              High-performance, secure, and production-grade technologies behind SkillNexus.
            </p>
          </div>

          <div className="row g-3 justify-content-center">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="p-3 bg-light rounded text-center border h-100">
                <Cpu className="text-primary mb-2 mx-auto" size={24} />
                <div className="fw-bold small text-dark">Gemini 2.5 AI</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Generative Intelligence</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="p-3 bg-light rounded text-center border h-100">
                <Terminal className="text-success mb-2 mx-auto" size={24} />
                <div className="fw-bold small text-dark">Judge0 CE</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Code Sandbox</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="p-3 bg-light rounded text-center border h-100">
                <Layers className="text-info mb-2 mx-auto" size={24} />
                <div className="fw-bold small text-dark">React 19 &amp; Bootstrap</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Responsive UI</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="p-3 bg-light rounded text-center border h-100">
                <Database className="text-warning mb-2 mx-auto" size={24} />
                <div className="fw-bold small text-dark">MongoDB Atlas</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Candidate Data</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="p-3 bg-light rounded text-center border h-100">
                <ShieldCheck className="text-danger mb-2 mx-auto" size={24} />
                <div className="fw-bold small text-dark">JWT Security</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Encrypted Auth</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing / CTA Banner Section */}
      <section id="pricing" className="container px-4 px-lg-5">
        <div className="sn-cta-banner text-center">
          <h2 className="fw-bold mb-3" style={{ fontSize: '2.4rem' }}>
            Ready to Ace Your Next Interview?
          </h2>
          <p className="mx-auto mb-4" style={{ maxWidth: '640px', fontSize: '1.05rem', opacity: 0.9 }}>
            Join SkillNexus today. Test your coding skills, practice AI voice interviews, optimize your resume, and discover matching developer jobs.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button 
              type="button" 
              className="btn btn-light btn-lg fw-bold px-4 py-2 text-dark shadow-sm"
              onClick={isAuthenticated && onNavigateToDashboard ? onNavigateToDashboard : onOpenRegister}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-light btn-lg fw-bold px-4 py-2"
              onClick={() => scrollToSection('features', 'features')}
            >
              Explore All Features
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="sn-footer">
        <div className="container px-4 px-lg-5">
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="sn-brand-logo mb-2">
                <div className="sn-logo-badge">
                  <GraduationCap size={20} />
                </div>
                <span>SkillNexus</span>
              </div>
              <p className="text-secondary small mb-3">
                AI-powered career &amp; interview preparation platform. Build verified technical skills, practice mock interviews, and connect with top IT engineering jobs.
              </p>
            </div>

            <div className="col-6 col-md-2">
              <div className="sn-footer-title">Navigation</div>
              <a href="#home" className="sn-footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('home', 'home'); }}>Home</a>
              <a href="#features" className="sn-footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('features', 'features'); }}>Features</a>
              <a href="#how-it-works" className="sn-footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works', 'how-it-works'); }}>How It Works</a>
              <a href="#technologies" className="sn-footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('technologies', 'technologies'); }}>Technologies</a>
            </div>

            <div className="col-6 col-md-3">
              <div className="sn-footer-title">Platform Features</div>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>Resume Analyzer</span>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>Coding Interview</span>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>Voice Interview</span>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>Communication Analysis</span>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>Job Recommendations</span>
              <span className="sn-footer-link" style={{ cursor: 'pointer' }} onClick={handleFeatureClick}>GitHub &amp; Open Source</span>
            </div>

            <div className="col-12 col-md-3">
              <div className="sn-footer-title">Authentication</div>
              {isAuthenticated ? (
                <div>
                  <p className="text-secondary small mb-2">Signed in with authenticated session.</p>
                  <button 
                    type="button" 
                    className="sn-btn-primary btn-sm w-100"
                    onClick={onNavigateToDashboard}
                  >
                    Open Dashboard
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <button 
                    type="button" 
                    className="sn-btn-login w-100 text-center"
                    onClick={onOpenLogin}
                  >
                    Candidate Login
                  </button>
                  <button 
                    type="button" 
                    className="sn-btn-primary w-100 text-center"
                    onClick={onOpenRegister}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top text-secondary small">
            <div>
              &copy; {new Date().getFullYear()} SkillNexus. All rights reserved.
            </div>
            <div className="d-flex gap-3">
              <span>MERN Stack</span>
              <span>&bull;</span>
              <span>Judge0 CE</span>
              <span>&bull;</span>
              <span>Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
