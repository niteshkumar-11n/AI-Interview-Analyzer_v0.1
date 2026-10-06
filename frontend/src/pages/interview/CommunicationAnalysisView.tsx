import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Quote, 
  Lightbulb, 
  Target, 
  Gauge, 
  Mic, 
  FileText, 
  Type, 
  Pause, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Smile,
  ShieldCheck,
  Award
} from 'lucide-react';

interface CommunicationAnalysisViewProps {
  onPracticeAgain?: () => void;
}

export const CommunicationAnalysisView: React.FC<CommunicationAnalysisViewProps> = ({
  onPracticeAgain
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'transcript' | 'improve'>('overview');

  // Sample Improved Answer Toggle: 'your' | 'improved'
  const [answerToggle, setAnswerToggle] = useState<'your' | 'improved'>('improved');

  // Audio Playback simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(88); // 01:28 = 88s
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setPlaybackSeconds(prev => {
          if (prev <= 0) {
            setIsPlayingAudio(false);
            return 88;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeakingAnswer(false);
      }
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = "I am a final year computer science student. I have experience in web development and have built a MERN stack e-commerce project. I chose the MERN stack because it allows me to work with JavaScript across the entire stack, which makes development faster and more efficient. In the future, I want to work on scalable applications and contribute to open source projects.";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setIsSpeakingAnswer(false);
        };
        setIsSpeakingAnswer(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container-fluid p-3 p-md-4 max-w-7xl mx-auto" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* 1. Header Banner & Motivational Quote */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="d-flex align-items-center gap-3">
          <div 
            className="d-flex align-items-center justify-content-center rounded-3 shadow-xs text-primary flex-shrink-0"
            style={{ 
              width: '54px', 
              height: '54px', 
              backgroundColor: '#DBEAFE',
              color: '#2563EB'
            }}
          >
            <Headphones size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="fw-bold text-dark fs-4 mb-0.5" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Communication Analysis
            </h1>
            <p className="text-secondary small mb-0" style={{ color: '#64748B' }}>
              Get detailed feedback on your speaking skills, answer structure, and communication style.
            </p>
          </div>
        </div>

        {/* Right: Motivational Quote Box */}
        <div 
          className="card border-0 rounded-3 p-2.5 px-3.5 d-flex flex-row align-items-center gap-3 shadow-xs"
          style={{ 
            backgroundColor: '#EFF6FF', 
            border: '1px solid #DBEAFE',
            maxWidth: '430px'
          }}
        >
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '38px', height: '38px', backgroundColor: '#DBEAFE', color: '#2563EB' }}
          >
            <Quote size={20} className="text-primary" fill="#2563EB" />
          </div>
          <div className="lh-sm">
            <div className="fw-bold text-primary small" style={{ fontSize: '0.86rem' }}>
              “Better communication opens bigger opportunities.”
            </div>
            <div className="text-secondary small mt-0.5" style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Speak with confidence. Grow with feedback.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-navigation Tabs */}
      <div className="card bg-white border rounded-3 shadow-xs mb-4 p-0 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex border-bottom px-3 pt-1 bg-white" style={{ borderColor: '#E2E8F0' }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'detailed', label: 'Detailed Analysis' },
            { key: 'transcript', label: 'Transcript' },
            { key: 'improve', label: 'Improve' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`btn btn-link text-decoration-none py-2.5 px-4 fw-semibold position-relative border-0 rounded-0 ${
                activeTab === tab.key ? 'text-primary' : 'text-secondary'
              }`}
              style={{ fontSize: '0.88rem' }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div 
                  className="position-absolute bottom-0 start-0 end-0 bg-primary" 
                  style={{ height: '2.5px', borderRadius: '2px 2px 0 0' }} 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Top Row Cards: Overall Score + Key Metrics (Left) & Speaking Analysis (Right) */}
      <div className="row g-3 mb-4">
        
        {/* Left Card: Overall Communication Score + Key Metrics */}
        <div className="col-lg-8">
          <div className="card bg-white border rounded-4 p-4 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="row g-4 align-items-center">
              
              {/* Overall Score Column with Circular Gauge */}
              <div className="col-md-5 text-center border-end-md pb-3 pb-md-0" style={{ borderColor: '#F1F5F9' }}>
                <h2 className="fw-bold text-dark small mb-3 text-start text-md-center" style={{ fontSize: '0.92rem' }}>
                  Overall Communication Score
                </h2>

                {/* Circular Gauge Graphic matching mockup */}
                <div className="position-relative d-inline-flex align-items-center justify-content-center my-2" style={{ width: '160px', height: '160px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="10"
                    />
                    {/* Active Gradient Arc for 76% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.76)}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="position-absolute text-center">
                    <div className="fw-bold text-dark lh-1" style={{ fontSize: '2.4rem', letterSpacing: '-0.03em' }}>
                      76<span className="text-secondary fs-6 fw-normal ms-0.5">/ 100</span>
                    </div>
                    <span 
                      className="badge rounded-pill text-white mt-2 px-3 py-1 fw-bold"
                      style={{ backgroundColor: '#10B981', fontSize: '0.75rem' }}
                    >
                      Good
                    </span>
                  </div>
                </div>

                <p className="text-secondary small mt-3 mb-0 px-2" style={{ fontSize: '0.78rem', lineHeight: '1.45' }}>
                  You communicate well, with clear ideas. Focus on reducing filler words and improving structure to make an even bigger impact.
                </p>
              </div>

              {/* Key Metrics Column */}
              <div className="col-md-7 ps-md-4">
                <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.92rem' }}>
                  Key Metrics
                </h2>

                <div className="d-flex flex-column gap-2.5">
                  {/* 1. Clarity */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                          <Lightbulb size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Clarity</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>82%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '82%', backgroundColor: '#3B82F6' }} />
                    </div>
                  </div>

                  {/* 2. Relevance */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                          <Target size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Relevance</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>86%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '86%', backgroundColor: '#10B981' }} />
                    </div>
                  </div>

                  {/* 3. Speaking Pace */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}>
                          <Gauge size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Speaking Pace</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>74%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '74%', backgroundColor: '#F97316' }} />
                    </div>
                  </div>

                  {/* 4. Filler Words */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                          <Mic size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Filler Words</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>63%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '63%', backgroundColor: '#EF4444' }} />
                    </div>
                  </div>

                  {/* 5. Answer Structure */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                          <FileText size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Answer Structure</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>71%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '71%', backgroundColor: '#8B5CF6' }} />
                    </div>
                  </div>

                  {/* 6. Grammar */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECFEFF', color: '#06B6D4' }}>
                          <Type size={14} />
                        </div>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>Grammar</span>
                      </div>
                      <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>80%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#F1F5F9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: '80%', backgroundColor: '#06B6D4' }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Card: Speaking Analysis (4 Tiles) */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.92rem' }}>
              Speaking Analysis
            </h2>

            <div className="row g-2.5">
              {/* Tile 1: Speaking Pace */}
              <div className="col-6">
                <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary mb-2"
                    style={{ width: '32px', height: '32px', backgroundColor: '#EFF6FF' }}
                  >
                    <Gauge size={16} />
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Speaking Pace</div>
                  <div className="fw-bold text-dark small my-0.5" style={{ fontSize: '0.88rem' }}>
                    142 words/min
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-1">
                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.66rem' }}>
                      Good
                    </span>
                  </div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.68rem' }}>
                    Ideal: 120–160 wpm
                  </div>
                </div>
              </div>

              {/* Tile 2: Pauses */}
              <div className="col-6">
                <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary mb-2"
                    style={{ width: '32px', height: '32px', backgroundColor: '#EFF6FF' }}
                  >
                    <Pause size={16} />
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Pauses</div>
                  <div className="fw-bold text-dark small my-0.5" style={{ fontSize: '0.88rem' }}>
                    8 pauses
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-1">
                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.66rem' }}>
                      Normal
                    </span>
                  </div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.68rem' }}>
                    (~2.3s each)
                  </div>
                </div>
              </div>

              {/* Tile 3: Filler Words */}
              <div className="col-6">
                <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-danger mb-2"
                    style={{ width: '32px', height: '32px', backgroundColor: '#FEF2F2' }}
                  >
                    <Mic size={16} />
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Filler Words</div>
                  <div className="fw-bold text-dark small my-0.5" style={{ fontSize: '0.88rem' }}>
                    6 per minute
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-1">
                    <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.66rem' }}>
                      Slightly High
                    </span>
                  </div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.68rem' }}>
                    Try to reduce "um", "like"
                  </div>
                </div>
              </div>

              {/* Tile 4: Response Duration */}
              <div className="col-6">
                <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary mb-2"
                    style={{ width: '32px', height: '32px', backgroundColor: '#EFF6FF' }}
                  >
                    <Clock size={16} />
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>Response Duration</div>
                  <div className="fw-bold text-dark small my-0.5" style={{ fontSize: '0.88rem' }}>
                    1 min 28 sec
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-1">
                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.66rem' }}>
                      Good
                    </span>
                  </div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.68rem' }}>
                    Ideal: 1–2 minutes
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Middle Row: Your Answer | AI Feedback | Filler Words Analysis */}
      <div className="row g-3 mb-4">
        
        {/* Column 1: Your Answer */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.92rem' }}>
              Your Answer
            </h2>

            {/* Audio Player Bar */}
            <div className="card border rounded-3 p-2 px-3 mb-3 d-flex flex-row align-items-center gap-3 bg-white" style={{ borderColor: '#E2E8F0' }}>
              <button
                type="button"
                onClick={togglePlayAudio}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 shadow-xs"
                style={{ width: '34px', height: '34px', backgroundColor: '#2563EB' }}
                title={isPlayingAudio ? 'Pause Audio' : 'Play Response Audio'}
              >
                {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ms-0.5" />}
              </button>

              {/* Waveform graphic */}
              <div className="d-flex align-items-center gap-1 flex-grow-1 overflow-hidden" style={{ height: '32px' }}>
                {[12, 18, 26, 38, 22, 14, 30, 48, 62, 75, 52, 36, 68, 85, 78, 55, 32, 20, 35, 50, 65, 45, 28, 18, 25, 40, 30, 16].map((h, i) => {
                  const isLeft = i < 15;
                  return (
                    <div
                      key={i}
                      className="rounded-pill"
                      style={{
                        width: '3px',
                        height: isPlayingAudio ? `${Math.min(100, Math.max(15, h * (0.8 + Math.sin(i + playbackSeconds) * 0.4)))}%` : `${h}%`,
                        backgroundColor: isLeft ? '#2563EB' : '#CBD5E1',
                        transition: 'height 0.15s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Timestamp */}
              <span className="text-secondary small font-monospace flex-shrink-0" style={{ fontSize: '0.74rem' }}>
                {isPlayingAudio ? formatSeconds(playbackSeconds) : '01:28'} / 01:28
              </span>
            </div>

            {/* Quote Transcript Box */}
            <div className="rounded-3 p-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.55', color: '#334155' }}>
                “I am a final year computer science student. I have experience in web development and have built a MERN stack e-commerce project. I chose the MERN stack because it allows me to work with JavaScript across the entire stack, which makes development faster and more efficient. In the future, I want to work on scalable applications and contribute to open source projects.”
              </p>
            </div>

          </div>
        </div>

        {/* Column 2: AI Feedback */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '22px', height: '22px', backgroundColor: '#2563EB' }}
              >
                <Sparkles size={13} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                AI Feedback
              </h2>
            </div>

            {/* What You Did Well */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '18px', height: '18px', backgroundColor: '#10B981' }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                  What You Did Well
                </span>
              </div>
              <ul className="small text-secondary mb-0 ps-3.5 d-flex flex-column gap-1" style={{ fontSize: '0.78rem' }}>
                <li>Good technical knowledge and relevant examples</li>
                <li>Clear explanation of your project</li>
                <li>Confident and natural tone</li>
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '18px', height: '18px', backgroundColor: '#F97316' }}
                >
                  <AlertTriangle size={11} />
                </div>
                <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                  Areas to Improve
                </span>
              </div>
              <ul className="small text-secondary mb-0 ps-3.5 d-flex flex-column gap-1" style={{ fontSize: '0.78rem' }}>
                <li>Try to structure your answers more clearly</li>
                <li>Reduce filler words like “um”, “like”, “you know”</li>
                <li>Add more specific examples and outcomes</li>
              </ul>
            </div>

            {/* AI Suggestion */}
            <div>
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '18px', height: '18px', backgroundColor: '#8B5CF6' }}
                >
                  <Lightbulb size={11} />
                </div>
                <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                  AI Suggestion
                </span>
              </div>
              <p className="small text-secondary mb-0 ps-1" style={{ fontSize: '0.77rem', lineHeight: '1.45' }}>
                Use the STAR method (Situation, Task, Action, Result) to structure your answers. Speak a little slower and take short pauses to sound more confident.
              </p>
            </div>

          </div>
        </div>

        {/* Column 3: Filler Words Analysis */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.92rem' }}>
              Filler Words Analysis
            </h2>

            {/* Donut Chart & Breakdown */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
              
              {/* Donut Graphic */}
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '130px', height: '130px' }}>
                <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {/* um: 40% (Red #EF4444) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeDasharray="238.7"
                    strokeDashoffset="0"
                  />
                  {/* like: 25% (Orange #F97316) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="12"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * 0.4}
                  />
                  {/* you know: 15% (Yellow #EAB308) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#EAB308"
                    strokeWidth="12"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * 0.65}
                  />
                  {/* basically: 10% (Teal #14B8A6) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#14B8A6"
                    strokeWidth="12"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * 0.8}
                  />
                  {/* actually: 10% (Purple #8B5CF6) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="12"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * 0.9}
                  />
                </svg>

                {/* Donut Center */}
                <div className="position-absolute text-center lh-1">
                  <div className="fw-bold text-dark fs-4 mb-0.5">6</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>filler words</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>per minute</div>
                </div>
              </div>

              {/* Legend List */}
              <div className="d-flex flex-column gap-1.5 ps-3">
                <div className="d-flex align-items-center justify-content-between gap-3" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#EF4444' }} />
                    <span className="text-dark">um</span>
                  </div>
                  <span className="fw-bold text-dark">40%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#F97316' }} />
                    <span className="text-dark">like</span>
                  </div>
                  <span className="fw-bold text-dark">25%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#EAB308' }} />
                    <span className="text-dark">you know</span>
                  </div>
                  <span className="fw-bold text-dark">15%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#14B8A6' }} />
                    <span className="text-dark">basically</span>
                  </div>
                  <span className="fw-bold text-dark">10%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#8B5CF6' }} />
                    <span className="text-dark">actually</span>
                  </div>
                  <span className="fw-bold text-dark">10%</span>
                </div>
              </div>

            </div>

            {/* Bottom Advice Box */}
            <div 
              className="card border-0 rounded-3 p-2.5 px-3 d-flex flex-row align-items-center gap-2.5 shadow-xs mt-auto"
              style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#FEF3C7' }}
              >
                <Lightbulb size={15} className="text-warning" fill="#F59E0B" />
              </div>
              <div className="small lh-sm text-dark" style={{ fontSize: '0.76rem' }}>
                Try to replace filler words with short pauses. A pause sounds more confident than “um” or “like”.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Bottom Row: Detailed Parameter Analysis | Sample Improved Answer | Personalized Tips */}
      <div className="row g-3 mb-4">
        
        {/* Column 1: Detailed Parameter Analysis Table */}
        <div className="col-lg-5">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.92rem' }}>
              Detailed Parameter Analysis
            </h2>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr className="text-secondary" style={{ fontSize: '0.72rem', borderBottom: '1px solid #E2E8F0' }}>
                    <th className="fw-semibold pb-2 ps-1">Parameter</th>
                    <th className="fw-semibold pb-2">Your Score</th>
                    <th className="fw-semibold pb-2">Benchmark</th>
                    <th className="fw-semibold pb-2 text-end pe-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Clarity */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Lightbulb size={13} className="text-primary" />
                        <span className="text-dark fw-medium">Clarity</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">82%</td>
                    <td className="text-secondary">&ge; 70%</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                        Good
                      </span>
                    </td>
                  </tr>

                  {/* 2. Relevance */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Target size={13} className="text-success" />
                        <span className="text-dark fw-medium">Relevance</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">86%</td>
                    <td className="text-secondary">&ge; 75%</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                        Excellent
                      </span>
                    </td>
                  </tr>

                  {/* 3. Speaking Pace */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Gauge size={13} className="text-warning" />
                        <span className="text-dark fw-medium">Speaking Pace</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">74%</td>
                    <td className="text-secondary">120–160 wpm</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                        Good
                      </span>
                    </td>
                  </tr>

                  {/* 4. Filler Words */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Mic size={13} className="text-danger" />
                        <span className="text-dark fw-medium">Filler Words</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">63%</td>
                    <td className="text-secondary">&le; 5 per min</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '0.68rem' }}>
                        Needs Work
                      </span>
                    </td>
                  </tr>

                  {/* 5. Answer Structure */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <FileText size={13} className="text-purple" style={{ color: '#8B5CF6' }} />
                        <span className="text-dark fw-medium">Answer Structure</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">71%</td>
                    <td className="text-secondary">&ge; 75%</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '0.68rem' }}>
                        Needs Work
                      </span>
                    </td>
                  </tr>

                  {/* 6. Grammar */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Type size={13} className="text-info" />
                        <span className="text-dark fw-medium">Grammar</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">80%</td>
                    <td className="text-secondary">&ge; 70%</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                        Good
                      </span>
                    </td>
                  </tr>

                  {/* 7. Confidence (Tone) */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <ShieldCheck size={13} className="text-success" />
                        <span className="text-dark fw-medium">Confidence (Tone)</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">77%</td>
                    <td className="text-secondary">&ge; 70%</td>
                    <td className="text-end pe-1">
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                        Good
                      </span>
                    </td>
                  </tr>

                  {/* 8. Eye Contact */}
                  <tr>
                    <td className="ps-1">
                      <div className="d-flex align-items-center gap-1.5">
                        <Eye size={13} className="text-secondary" />
                        <span className="text-dark fw-medium">Eye Contact (if video)</span>
                      </div>
                    </td>
                    <td className="fw-bold text-secondary">N/A</td>
                    <td className="text-secondary">&mdash;</td>
                    <td className="text-end pe-1 text-secondary">&mdash;</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Column 2: Sample Improved Answer */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                Sample Improved Answer
              </h2>

              {/* Toggle Pills: Your Answer | Improved Version */}
              <div className="btn-group btn-group-sm p-0.5 rounded-2 border" style={{ backgroundColor: '#F8FAFC' }}>
                <button
                  type="button"
                  onClick={() => setAnswerToggle('your')}
                  className={`btn btn-sm py-0.5 px-2 rounded-1 fw-semibold ${
                    answerToggle === 'your' ? 'btn-white bg-white text-dark shadow-xs' : 'btn-link text-secondary text-decoration-none'
                  }`}
                  style={{ fontSize: '0.72rem' }}
                >
                  Your Answer
                </button>
                <button
                  type="button"
                  onClick={() => setAnswerToggle('improved')}
                  className={`btn btn-sm py-0.5 px-2 rounded-1 fw-semibold ${
                    answerToggle === 'improved' ? 'btn-primary text-white shadow-xs' : 'btn-link text-secondary text-decoration-none'
                  }`}
                  style={{ fontSize: '0.72rem', backgroundColor: answerToggle === 'improved' ? '#2563EB' : 'transparent' }}
                >
                  Improved Version
                </button>
              </div>
            </div>

            {/* Answer Display Box */}
            <div 
              className="rounded-3 p-3 flex-grow-1 border"
              style={{ 
                backgroundColor: answerToggle === 'improved' ? '#F0FDF4' : '#F8FAFC',
                borderColor: answerToggle === 'improved' ? '#BBF7D0' : '#E2E8F0'
              }}
            >
              <p className="text-dark small mb-0" style={{ fontSize: '0.79rem', lineHeight: '1.6' }}>
                {answerToggle === 'improved' ? (
                  <>
                    “I am a final year computer science student with experience in web development. I recently built a MERN stack e-commerce application where I implemented user authentication, product management, and payment integration. I chose the MERN stack because it allows me to use JavaScript across the entire stack, which improves development speed and makes it easier to maintain the codebase. Through this project, I learned a lot about scalable architecture and database design. In the future, I want to work on large-scale applications and actively contribute to open source projects.”
                  </>
                ) : (
                  <>
                    “I am a final year computer science student. I have experience in web development and have built a MERN stack e-commerce project. I chose the MERN stack because it allows me to work with JavaScript across the entire stack, which makes development faster and more efficient. In the future, I want to work on scalable applications and contribute to open source projects.”
                  </>
                )}
              </p>
            </div>

          </div>
        </div>

        {/* Column 3: Personalized Tips */}
        <div className="col-lg-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '24px', height: '24px', backgroundColor: '#2563EB' }}
              >
                <Target size={14} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                Personalized Tips
              </h2>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {[
                { num: 1, text: 'Use structured frameworks like STAR for better answers.' },
                { num: 2, text: 'Reduce filler words and take natural pauses.' },
                { num: 3, text: 'Maintain a steady speaking pace (120–160 wpm).' },
                { num: 4, text: 'Be concise, relevant, and avoid repetition.' },
                { num: 5, text: 'Practice regularly to build confidence.' }
              ].map(tip => (
                <div key={tip.num} className="d-flex align-items-start gap-2.5">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0"
                    style={{ width: '24px', height: '24px', backgroundColor: '#EFF6FF', fontSize: '0.78rem' }}
                  >
                    {tip.num}
                  </div>
                  <span className="small text-dark lh-sm pt-0.5" style={{ fontSize: '0.78rem' }}>
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* 6. Bottom Action / Encouragement Banner */}
      <div 
        className="card border-0 rounded-4 p-3.5 px-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-xs"
        style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-primary flex-shrink-0"
            style={{ width: '38px', height: '38px', backgroundColor: '#DBEAFE' }}
          >
            <TrendingUp size={20} className="text-primary" />
          </div>
          <span className="fw-semibold text-dark small" style={{ fontSize: '0.88rem' }}>
            Your communication skills are improving! Keep practicing to become a more confident speaker.
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onPracticeAgain) {
              onPracticeAgain();
            }
          }}
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 rounded-3 fw-semibold text-white shadow-xs border-0 flex-shrink-0"
          style={{ backgroundColor: '#2563EB', fontSize: '0.84rem' }}
        >
          <span>Practice Again</span>
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  );
};
