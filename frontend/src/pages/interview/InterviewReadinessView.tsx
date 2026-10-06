import React, { useState } from 'react';
import { 
  BarChart2, 
  Target, 
  TrendingUp, 
  SlidersHorizontal, 
  Code2, 
  MessageSquare, 
  Brain, 
  Folder, 
  Users, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Trophy, 
  AlertTriangle, 
  Lightbulb, 
  Quote, 
  Check, 
  X,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';

interface InterviewReadinessViewProps {
  onNavigateToCoding?: () => void;
  onNavigateToResume?: () => void;
  onNavigateToAIInterview?: () => void;
}

export const InterviewReadinessView: React.FC<InterviewReadinessViewProps> = ({
  onNavigateToCoding,
  onNavigateToResume,
  onNavigateToAIInterview
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'plan' | 'history'>('overview');
  const [isLearningPlanModalOpen, setIsLearningPlanModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);

  // Month hover for trend line chart
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Roadmap tasks completion tracking inside modal
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': true,
    'task-3': false,
    'task-4': false,
    'task-5': false
  });

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Trend chart monthly data
  const trendData = [
    { month: 'Jan', score: 30, x: 20, y: 70 },
    { month: 'Feb', score: 40, x: 36, y: 60 },
    { month: 'Mar', score: 45, x: 52, y: 55 },
    { month: 'Apr', score: 55, x: 68, y: 45 },
    { month: 'May', score: 65, x: 84, y: 35 },
    { month: 'Jun', score: 78, x: 96, y: 22 }
  ];

  return (
    <div className="container-fluid p-3 p-md-4 max-w-7xl mx-auto" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* 1. Header Banner & Motivational Quote */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="d-flex align-items-center gap-3">
          <div 
            className="d-flex align-items-center justify-content-center rounded-3 shadow-xs flex-shrink-0"
            style={{ 
              width: '52px', 
              height: '52px', 
              backgroundColor: '#DBEAFE',
              color: '#2563EB'
            }}
          >
            <BarChart2 size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="fw-bold text-dark fs-4 mb-0.5" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Interview Readiness
            </h1>
            <p className="text-secondary small mb-0" style={{ color: '#64748B' }}>
              Get a complete view of your interview readiness based on your performance across all modules.
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
            <Target size={20} className="text-primary" />
          </div>
          <div className="lh-sm">
            <div className="fw-bold text-primary small" style={{ fontSize: '0.86rem' }}>
              “You are closer to your dream job than you think.”
            </div>
            <div className="text-secondary small mt-0.5" style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Keep practicing. Keep improving.
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
            { key: 'plan', label: 'Improvement Plan' },
            { key: 'history', label: 'History' }
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

      {/* 3. Top Row Cards: Your Interview Readiness Score (Left) & Trend Line Chart (Right) */}
      <div className="row g-3 mb-4">
        
        {/* Left Card: Your Interview Readiness Score */}
        <div className="col-lg-6">
          <div className="card bg-white border rounded-4 p-4 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            {/* Card Header */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#2563EB' }}
              >
                <BarChart2 size={16} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                Your Interview Readiness Score
              </h2>
            </div>

            <div className="row g-4 align-items-center">
              
              {/* Circular Gauge Graphic */}
              <div className="col-sm-6 text-center border-end-sm pb-3 pb-sm-0" style={{ borderColor: '#F1F5F9' }}>
                <div className="position-relative d-inline-flex align-items-center justify-content-center my-1" style={{ width: '160px', height: '160px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="39"
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="9"
                    />
                    {/* Active Arc 78% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="39"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="9"
                      strokeDasharray="245"
                      strokeDashoffset={245 * (1 - 0.78)}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="position-absolute text-center">
                    <div className="fw-bold text-dark lh-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
                      78<span className="text-secondary fs-6 fw-normal ms-0.5">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Good Progress Badge */}
                <div className="mt-2">
                  <span 
                    className="badge rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1"
                    style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.78rem' }}
                  >
                    Good Progress! 🎯
                  </span>
                </div>

                <p className="text-secondary small mt-2 mb-0 px-2" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  You are well on your way. Focus on the suggested areas to boost your score.
                </p>
              </div>

              {/* Score Scale Legend on Right */}
              <div className="col-sm-6 ps-sm-3">
                <div className="d-flex flex-column gap-2.5">
                  
                  {/* 90 - 100 */}
                  <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-1 d-flex align-items-center justify-content-center text-white"
                        style={{ width: '16px', height: '16px', backgroundColor: '#10B981' }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="fw-bold text-dark">90 - 100</span>
                    </div>
                    <span className="fw-medium text-dark">Excellent</span>
                    <span className="fw-medium" style={{ color: '#2563EB' }}>(Ready to Apply)</span>
                  </div>

                  {/* 75 - 89 (Current active tier) */}
                  <div className="d-flex align-items-center justify-content-between p-1 rounded-2" style={{ fontSize: '0.78rem', backgroundColor: '#F0FDF4' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-1 d-flex align-items-center justify-content-center text-white"
                        style={{ width: '16px', height: '16px', backgroundColor: '#10B981' }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="fw-bold text-dark">75 - 89</span>
                    </div>
                    <span className="fw-bold text-success">Good</span>
                    <span className="fw-medium" style={{ color: '#2563EB' }}>(Keep Improving)</span>
                  </div>

                  {/* 60 - 74 */}
                  <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-1 d-flex align-items-center justify-content-center text-white"
                        style={{ width: '16px', height: '16px', backgroundColor: '#F59E0B' }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="fw-bold text-dark">60 - 74</span>
                    </div>
                    <span className="fw-medium text-dark">Average</span>
                    <span className="fw-medium" style={{ color: '#2563EB' }}>(Needs Focus)</span>
                  </div>

                  {/* Below 60 */}
                  <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-1 d-flex align-items-center justify-content-center text-white"
                        style={{ width: '16px', height: '16px', backgroundColor: '#EF4444' }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="fw-bold text-dark">Below 60</span>
                    </div>
                    <span className="fw-medium text-dark">Needs Work</span>
                    <span className="fw-medium" style={{ color: '#2563EB' }}>(Build Core Skills)</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Card: Trend Line Chart */}
        <div className="col-lg-6">
          <div className="card bg-white border rounded-4 p-4 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Top Green Notification Banner */}
            <div 
              className="rounded-3 p-2.5 px-3 mb-3 d-flex align-items-center gap-2.5 border"
              style={{ backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0"
                style={{ width: '32px', height: '32px', backgroundColor: '#DCFCE7' }}
              >
                <TrendingUp size={18} className="text-success" />
              </div>
              <div className="lh-sm">
                <span className="fw-bold text-success small d-block" style={{ fontSize: '0.86rem' }}>
                  Your readiness score has improved by 12%
                </span>
                <span className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                  compared to last month. Keep up the great work!
                </span>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="flex-grow-1 position-relative" style={{ minHeight: '170px' }}>
              <svg className="w-100 h-100" viewBox="0 0 450 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scoreTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Grid Lines */}
                {[
                  { val: 100, y: 15 },
                  { val: 80, y: 39 },
                  { val: 60, y: 63 },
                  { val: 40, y: 87 },
                  { val: 20, y: 111 },
                  { val: 0, y: 135 }
                ].map((grid, idx) => (
                  <g key={idx}>
                    <text 
                      x="20" 
                      y={grid.y + 4} 
                      fill="#94A3B8" 
                      fontSize="10" 
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {grid.val}
                    </text>
                    <line 
                      x1="28" 
                      y1={grid.y} 
                      x2="440" 
                      y2={grid.y} 
                      stroke="#F1F5F9" 
                      strokeWidth="1" 
                    />
                  </g>
                ))}

                {/* Area Gradient Fill */}
                <path
                  d="M 45,99 L 115,87 L 185,81 L 255,69 L 325,57 L 395,41 L 395,135 L 45,135 Z"
                  fill="url(#scoreTrendGrad)"
                />

                {/* Connecting Trend Line */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="45,99 115,87 185,81 255,69 325,57 395,41"
                />

                {/* Data Points */}
                {[
                  { m: 'Jan', val: 30, x: 45, y: 99 },
                  { m: 'Feb', val: 40, x: 115, y: 87 },
                  { m: 'Mar', val: 45, x: 185, y: 81 },
                  { m: 'Apr', val: 55, x: 255, y: 69 },
                  { m: 'May', val: 65, x: 325, y: 57 },
                  { m: 'Jun', val: 78, x: 395, y: 41 }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.m === 'Jun' ? 4.5 : 3.5}
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth={pt.m === 'Jun' ? 2 : 1.5}
                      className="cursor-pointer"
                    />
                    {pt.m === 'Jun' && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        fill="#059669"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        78
                      </text>
                    )}
                    {/* X-Axis Month label */}
                    <text
                      x={pt.x}
                      y="152"
                      fill="#64748B"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight={pt.m === 'Jun' ? 'bold' : 'normal'}
                    >
                      {pt.m}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Middle Row: Readiness Breakdown (Col-7) & Personalized Improvement Plan (Col-5) */}
      <div className="row g-3 mb-4">
        
        {/* Left Column: Readiness Breakdown */}
        <div className="col-lg-7">
          <div className="card bg-white border rounded-4 p-4 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-1">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#2563EB' }}
              >
                <SlidersHorizontal size={15} />
              </div>
              <div>
                <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                  Readiness Breakdown
                </h2>
              </div>
            </div>
            <p className="text-secondary small mb-3 ps-4 ms-1" style={{ fontSize: '0.76rem' }}>
              Performance across key areas
            </p>

            {/* Breakdown Items List */}
            <div className="d-flex flex-column gap-2.5">
              
              {/* 1. Technical Knowledge */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#2563EB' }}
                  >
                    <SlidersHorizontal size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Technical Knowledge
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '82%', backgroundColor: '#2563EB' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>82%</span>
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.68rem' }}>
                    Good
                  </span>
                </div>
              </div>

              {/* 2. Coding */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#10B981' }}
                  >
                    <Code2 size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Coding
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '76%', backgroundColor: '#10B981' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>76%</span>
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.68rem' }}>
                    Good
                  </span>
                </div>
              </div>

              {/* 3. Communication */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#8B5CF6' }}
                  >
                    <MessageSquare size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Communication
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '74%', backgroundColor: '#8B5CF6' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>74%</span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" style={{ fontSize: '0.68rem' }}>
                    Needs Focus
                  </span>
                </div>
              </div>

              {/* 4. Problem Solving */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#EF4444' }}
                  >
                    <Brain size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Problem Solving
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '79%', backgroundColor: '#EF4444' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>79%</span>
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.68rem' }}>
                    Good
                  </span>
                </div>
              </div>

              {/* 5. Project Knowledge */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#F97316' }}
                  >
                    <Folder size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Project Knowledge
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '86%', backgroundColor: '#F97316' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>86%</span>
                  <span className="badge rounded-pill text-success border border-success-subtle px-2.5 py-1" style={{ backgroundColor: '#DCFCE7', fontSize: '0.68rem' }}>
                    Strong
                  </span>
                </div>
              </div>

              {/* 6. HR */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#9333EA' }}
                  >
                    <Users size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    HR
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '72%', backgroundColor: '#9333EA' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>72%</span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" style={{ fontSize: '0.68rem' }}>
                    Needs Focus
                  </span>
                </div>
              </div>

              {/* 7. Resume Quality */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#0284C7' }}
                  >
                    <FileText size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Resume Quality
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '80%', backgroundColor: '#0284C7' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>80%</span>
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.68rem' }}>
                    Good
                  </span>
                </div>
              </div>

              {/* 8. Skill Gap (Overall) */}
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2.5" style={{ width: '190px', flexShrink: 0 }}>
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '26px', height: '26px', backgroundColor: '#E11D48' }}
                  >
                    <Target size={14} />
                  </div>
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                    Skill Gap (Overall)
                  </span>
                </div>

                <div className="progress flex-grow-1 rounded-pill" style={{ height: '7.5px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '68%', backgroundColor: '#E11D48' }} />
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '110px', flexShrink: 0 }}>
                  <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>68%</span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" style={{ fontSize: '0.68rem' }}>
                    Needs Focus
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Personalized Improvement Plan */}
        <div className="col-lg-5">
          <div className="card bg-white border rounded-4 p-4 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-1">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#2563EB' }}
              >
                <ShieldCheck size={16} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                Personalized Improvement Plan
              </h2>
            </div>
            <p className="text-secondary small mb-3 ps-4 ms-1" style={{ fontSize: '0.76rem' }}>
              Based on your performance, here are your top priorities
            </p>

            {/* Priorities List */}
            <div className="d-flex flex-column gap-2.5 mb-3 flex-grow-1">
              
              {/* Item 1: Improve DSA */}
              <div 
                onClick={() => {
                  setSelectedPriority(1);
                  setIsLearningPlanModalOpen(true);
                }}
                className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2.5 cursor-pointer hover-shadow transition-all"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              >
                <div className="d-flex align-items-start gap-2.5">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#EF4444', fontSize: '0.85rem' }}
                  >
                    1
                  </div>
                  <div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                      Improve DSA
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                      Practice more coding problems on arrays, trees, graphs and DP.
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span 
                    className="badge rounded-pill px-2.5 py-1 fw-semibold"
                    style={{ backgroundColor: '#FFE4E6', color: '#E11D48', fontSize: '0.68rem' }}
                  >
                    High Priority
                  </span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </div>

              {/* Item 2: Improve Communication */}
              <div 
                onClick={() => {
                  setSelectedPriority(2);
                  setIsLearningPlanModalOpen(true);
                }}
                className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2.5 cursor-pointer hover-shadow transition-all"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              >
                <div className="d-flex align-items-start gap-2.5">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#F59E0B', fontSize: '0.85rem' }}
                  >
                    2
                  </div>
                  <div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                      Improve Communication
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                      Take more mock interviews and practice explaining your thought process.
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span 
                    className="badge rounded-pill px-2.5 py-1 fw-semibold"
                    style={{ backgroundColor: '#FFE4E6', color: '#E11D48', fontSize: '0.68rem' }}
                  >
                    High Priority
                  </span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </div>

              {/* Item 3: Study System Design */}
              <div 
                onClick={() => {
                  setSelectedPriority(3);
                  setIsLearningPlanModalOpen(true);
                }}
                className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2.5 cursor-pointer hover-shadow transition-all"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              >
                <div className="d-flex align-items-start gap-2.5">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#3B82F6', fontSize: '0.85rem' }}
                  >
                    3
                  </div>
                  <div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                      Study System Design
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                      Learn core concepts, practice common design questions.
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span 
                    className="badge rounded-pill px-2.5 py-1 fw-semibold"
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.68rem' }}
                  >
                    Medium Priority
                  </span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </div>

              {/* Item 4: Practice Project Questions */}
              <div 
                onClick={() => {
                  setSelectedPriority(4);
                  setIsLearningPlanModalOpen(true);
                }}
                className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-2.5 cursor-pointer hover-shadow transition-all"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              >
                <div className="d-flex align-items-start gap-2.5">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: '#10B981', fontSize: '0.85rem' }}
                  >
                    4
                  </div>
                  <div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                      Practice Project Questions
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                      Be ready to discuss your projects in depth (architecture, tech stack, challenges).
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span 
                    className="badge rounded-pill px-2.5 py-1 fw-semibold"
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.68rem' }}
                  >
                    Medium Priority
                  </span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </div>

            </div>

            {/* Bottom Button: View Detailed Learning Plan */}
            <button
              type="button"
              onClick={() => setIsLearningPlanModalOpen(true)}
              className="btn btn-outline-primary w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 transition-all mt-auto"
              style={{ fontSize: '0.84rem' }}
            >
              <span>View Detailed Learning Plan</span>
              <ArrowRight size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* 5. Bottom Row: 3 Insight Cards (Strengths, Areas to Improve, Recommended Next Steps) */}
      <div className="row g-3 mb-4">
        
        {/* Card 1: Strengths */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#10B981' }}
              >
                <Trophy size={15} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                Strengths
              </h2>
            </div>

            {/* Green background block for strengths */}
            <div className="p-3 rounded-3" style={{ backgroundColor: '#F0FDF4' }}>
              <div className="d-flex flex-column gap-2.5">
                {[
                  'Strong project knowledge',
                  'Good technical foundation',
                  'Consistent improvement',
                  'Well-structured resume'
                ].map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '18px', height: '18px', backgroundColor: '#10B981' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="small text-dark fw-medium" style={{ fontSize: '0.8rem' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Areas to Improve */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#EF4444' }}
              >
                <AlertTriangle size={15} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                Areas to Improve
              </h2>
            </div>

            {/* List with red 'x' marks */}
            <div className="p-3 rounded-3" style={{ backgroundColor: '#FFF5F5' }}>
              <div className="d-flex flex-column gap-2.5">
                {[
                  'Data Structures & Algorithms',
                  'Communication skills',
                  'System design concepts',
                  'HR interview preparation'
                ].map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '18px', height: '18px', backgroundColor: '#EF4444' }}
                    >
                      <X size={12} strokeWidth={3} />
                    </div>
                    <span className="small text-dark fw-medium" style={{ fontSize: '0.8rem' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: Recommended Next Steps */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '26px', height: '26px', backgroundColor: '#3B82F6' }}
              >
                <Lightbulb size={15} />
              </div>
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.92rem' }}>
                Recommended Next Steps
              </h2>
            </div>

            {/* List with green checkmarks */}
            <div className="p-3 rounded-3" style={{ backgroundColor: '#EFF6FF' }}>
              <div className="d-flex flex-column gap-2.5">
                {[
                  'Solve 20 DSA problems this week',
                  'Take 2 more AI mock interviews',
                  'Learn system design basics',
                  'Review and practice project explanations'
                ].map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '18px', height: '18px', backgroundColor: '#10B981' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="small text-dark fw-medium" style={{ fontSize: '0.8rem' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 6. Footer Quote Banner */}
      <div 
        className="card border rounded-4 p-3 px-4 d-flex flex-row align-items-center justify-content-between gap-3 shadow-xs bg-white"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
            style={{ width: '36px', height: '36px', backgroundColor: '#2563EB' }}
          >
            <Quote size={18} fill="#FFFFFF" />
          </div>
          <span className="fst-italic text-dark small" style={{ fontSize: '0.88rem', color: '#1E293B' }}>
            “Preparation today creates opportunities tomorrow.”
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsLearningPlanModalOpen(true)}
          className="btn btn-link text-decoration-none text-primary fw-semibold small p-0 d-flex align-items-center gap-1 flex-shrink-0"
          style={{ fontSize: '0.84rem' }}
        >
          <span>Keep learning. Keep growing.</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 7. Interactive Learning Plan & Detailed Action Modal */}
      {isLearningPlanModalOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5 p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
          onClick={() => setIsLearningPlanModalOpen(false)}
        >
          <div 
            className="card border-0 rounded-4 shadow-lg w-100 overflow-hidden"
            style={{ maxWidth: '680px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center gap-2.5">
                <div 
                  className="rounded-2 d-flex align-items-center justify-content-center text-white"
                  style={{ width: '32px', height: '32px', backgroundColor: '#2563EB' }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="fw-bold text-dark fs-5 mb-0">Personalized Learning Roadmap</h3>
                  <p className="text-secondary small mb-0">Recommended milestones tailored to your 78/100 readiness profile</p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setIsLearningPlanModalOpen(false)}
                aria-label="Close" 
              />
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
              
              {/* Progress Tracker */}
              <div className="p-3 rounded-3 mb-4 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span className="fw-bold small text-dark">4-Week Completion Progress</span>
                  <span className="fw-bold text-primary small">40% Complete</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#E2E8F0' }}>
                  <div className="progress-bar rounded-pill" style={{ width: '40%', backgroundColor: '#2563EB' }} />
                </div>
              </div>

              {/* Action Checklist */}
              <h4 className="fw-bold text-dark small mb-3 text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.78rem' }}>
                Priority Action Items
              </h4>

              <div className="d-flex flex-column gap-2.5 mb-4">
                {[
                  {
                    id: 'task-1',
                    week: 'Week 1',
                    title: 'DSA: Dynamic Programming & Binary Trees',
                    desc: 'Solve 15 LeetCode medium questions with pattern identification.',
                    tag: 'Coding',
                    tagBg: '#ECFDF5',
                    tagColor: '#10B981',
                    action: onNavigateToCoding
                  },
                  {
                    id: 'task-2',
                    week: 'Week 1',
                    title: 'Behavioral Interview: STAR Methodology Drill',
                    desc: 'Practice behavioral responses for past projects with clear structure.',
                    tag: 'Behavioral',
                    tagBg: '#EFF6FF',
                    tagColor: '#2563EB',
                    action: onNavigateToAIInterview
                  },
                  {
                    id: 'task-3',
                    week: 'Week 2',
                    title: 'System Design: Caching & Horizontal Scaling',
                    desc: 'Study Redis cache invalidation and database sharding patterns.',
                    tag: 'Architecture',
                    tagBg: '#F5F3FF',
                    tagColor: '#8B5CF6'
                  },
                  {
                    id: 'task-4',
                    week: 'Week 3',
                    title: 'Resume Bullet Optimization with Quantified Metrics',
                    desc: 'Ensure every project bullet contains impact metrics (% performance increase, latency reduced).',
                    tag: 'Resume',
                    tagBg: '#ECFEFF',
                    tagColor: '#0891B2',
                    action: onNavigateToResume
                  },
                  {
                    id: 'task-5',
                    week: 'Week 4',
                    title: 'Full AI Mock Interview Simulation',
                    desc: 'Simulate an end-to-end 45-minute live technical screen.',
                    tag: 'Mock Test',
                    tagBg: '#FFF7ED',
                    tagColor: '#EA580C',
                    action: onNavigateToAIInterview
                  }
                ].map(task => {
                  const isDone = completedTasks[task.id];
                  return (
                    <div 
                      key={task.id}
                      className={`p-3 rounded-3 border d-flex align-items-start justify-content-between gap-3 transition-all ${
                        isDone ? 'bg-light opacity-75' : 'bg-white shadow-xs'
                      }`}
                      style={{ borderColor: '#E2E8F0' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5 ${
                            isDone ? 'btn-success text-white' : 'btn-outline-secondary'
                          }`}
                          style={{ width: '22px', height: '22px' }}
                        >
                          {isDone && <Check size={13} strokeWidth={3} />}
                        </button>

                        <div>
                          <div className="d-flex align-items-center gap-2 mb-0.5">
                            <span className="badge rounded-1 bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                              {task.week}
                            </span>
                            <span 
                              className="badge rounded-1"
                              style={{ backgroundColor: task.tagBg, color: task.tagColor, fontSize: '0.65rem' }}
                            >
                              {task.tag}
                            </span>
                            <span className={`fw-bold small ${isDone ? 'text-decoration-line-through text-secondary' : 'text-dark'}`} style={{ fontSize: '0.84rem' }}>
                              {task.title}
                            </span>
                          </div>
                          <p className="small text-secondary mb-0" style={{ fontSize: '0.76rem' }}>
                            {task.desc}
                          </p>
                        </div>
                      </div>

                      {task.action && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsLearningPlanModalOpen(false);
                            task.action?.();
                          }}
                          className="btn btn-sm btn-outline-primary flex-shrink-0 py-1 px-2.5 rounded-2"
                          style={{ fontSize: '0.74rem' }}
                        >
                          Practice Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 px-4 border-top bg-light d-flex justify-content-between align-items-center">
              <span className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                Updated based on your mock test scores
              </span>
              <button 
                type="button" 
                className="btn btn-primary rounded-2 px-4 py-1.5 fw-semibold" 
                style={{ fontSize: '0.84rem', backgroundColor: '#2563EB' }}
                onClick={() => setIsLearningPlanModalOpen(false)}
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
