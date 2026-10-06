import React, { useState } from 'react';
import { 
  BarChart3, 
  BarChart2, 
  TrendingUp, 
  FileText, 
  User, 
  Clock, 
  Trophy, 
  ChevronDown, 
  ArrowRight, 
  ExternalLink, 
  Code2, 
  GitBranch, 
  MessageSquare, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Users, 
  CheckCircle2, 
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

interface AnalyticsViewProps {
  onNavigateToCoding?: () => void;
  onNavigateToInterviewReadiness?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onNavigateToCoding,
  onNavigateToInterviewReadiness
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'performance' | 'skills' | 'insights'>('overview');
  
  // Timeframe filter dropdown
  const [timeframe, setTimeframe] = useState<'6months' | '3months' | '30days' | '1year'>('6months');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Performance tracking metric selector
  const [perfMetric, setPerfMetric] = useState<'interview' | 'technical' | 'communication'>('interview');
  const [isPerfMetricOpen, setIsPerfMetricOpen] = useState(false);

  // Skill progress filter
  const [skillFilter, setSkillFilter] = useState<'all' | 'technical' | 'soft'>('all');
  const [isSkillFilterOpen, setIsSkillFilterOpen] = useState(false);

  // Practice activity timeframe
  const [practiceTimeframe, setPracticeTimeframe] = useState<'6months' | '3months' | '1year'>('6months');
  const [isPracticeTimeframeOpen, setIsPracticeTimeframeOpen] = useState(false);

  // Selected interview for modal view
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

  // Hovered day in practice activity heatmap
  const [hoveredDay, setHoveredDay] = useState<{ day: string; date: string; count: number } | null>(null);

  // Interview history items
  const interviewHistory = [
    {
      id: 1,
      date: 'Jun 10, 2026',
      type: 'Technical',
      role: 'Full Stack',
      score: 78,
      duration: '45 min',
      weakArea: 'System Design',
      weakAreaColor: '#EF4444',
      typeBadgeColor: '#EFF6FF',
      typeBadgeText: '#2563EB',
      details: {
        topicsCovered: ['REST API design', 'Database sharding', 'Authentication flows'],
        feedback: 'Great architectural choices, but needs deeper analysis into distributed caching and failure mitigation.',
        interviewer: 'AI Technical Lead',
        strengths: ['High-level diagramming', 'Database normalization']
      }
    },
    {
      id: 2,
      date: 'Jun 05, 2026',
      type: 'Coding',
      role: 'Software Engineer',
      score: 82,
      duration: '60 min',
      weakArea: 'DP, Graphs',
      weakAreaColor: '#F97316',
      typeBadgeColor: '#F3E8FF',
      typeBadgeText: '#7E22CE',
      details: {
        topicsCovered: ['Topological Sort', 'Dynamic Programming on Grids'],
        feedback: 'Solves graph traversal smoothly. DP memoization was correct, but time complexity explanation had minor ambiguity.',
        interviewer: 'AI Code Reviewer',
        strengths: ['Edge case handling', 'Clean code style']
      }
    },
    {
      id: 3,
      date: 'May 28, 2026',
      type: 'Behavioral',
      role: 'Backend',
      score: 74,
      duration: '30 min',
      weakArea: 'Filler Words',
      weakAreaColor: '#EF4444',
      typeBadgeColor: '#ECFDF5',
      typeBadgeText: '#047857',
      details: {
        topicsCovered: ['Behavioral STAR Method', 'Conflict Resolution'],
        feedback: 'Answers were well structured. Try pausing instead of saying "um" and "like" during conceptual transitions.',
        interviewer: 'AI Behavioral Coach',
        strengths: ['Storytelling structure', 'Professional tone']
      }
    },
    {
      id: 4,
      date: 'May 20, 2026',
      type: 'HR',
      role: 'SDE',
      score: 68,
      duration: '25 min',
      weakArea: 'Confidence',
      weakAreaColor: '#EF4444',
      typeBadgeColor: '#FEF2F2',
      typeBadgeText: '#B91C1C',
      details: {
        topicsCovered: ['Career goals', 'Salary expectations', 'Workplace culture'],
        feedback: 'Clarify long-term technical growth aspirations and maintain consistent vocal energy throughout.',
        interviewer: 'AI Talent Partner',
        strengths: ['Honesty', 'Culture fit']
      }
    },
    {
      id: 5,
      date: 'May 15, 2026',
      type: 'Mixed',
      role: 'Full Stack',
      score: 62,
      duration: '50 min',
      weakArea: 'Communication',
      weakAreaColor: '#F97316',
      typeBadgeColor: '#FFFBEB',
      typeBadgeText: '#B45309',
      details: {
        topicsCovered: ['Full-stack debugging', 'Component architecture', 'Team communication'],
        feedback: 'Practice thinking out loud while debugging live frontend-to-backend integration bugs.',
        interviewer: 'AI Senior Mentor',
        strengths: ['Quick problem recognition']
      }
    }
  ];

  // 26 weeks x 7 days Practice Activity Heatmap generator
  const generatePracticeHeatmap = () => {
    const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const grid: { day: string; date: string; level: number; count: number }[][] = [];

    // 7 rows (Mon to Sun)
    for (let r = 0; r < 7; r++) {
      const row = [];
      for (let c = 0; c < 24; c++) {
        // Realistic heatmap density pattern
        const val = (r * 11 + c * 7) % 100;
        let level = 0;
        let count = 0;
        if (val > 80) { level = 4; count = 5; }
        else if (val > 60) { level = 3; count = 3; }
        else if (val > 40) { level = 2; count = 2; }
        else if (val > 20) { level = 1; count = 1; }
        else { level = 0; count = 0; }

        const monthIdx = Math.min(Math.floor(c / 4), 5);
        const dayNum = (c * 7 + r) % 28 + 1;
        row.push({
          day: daysName[r],
          date: `${months[monthIdx]} ${dayNum}, 2026`,
          level,
          count
        });
      }
      grid.push(row);
    }
    return grid;
  };

  const practiceGrid = React.useMemo(() => generatePracticeHeatmap(), []);

  const getHeatmapColor = (lvl: number) => {
    switch (lvl) {
      case 1: return '#86EFAC';
      case 2: return '#4ADE80';
      case 3: return '#22C55E';
      case 4: return '#15803D';
      default: return '#E2E8F0';
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4 max-w-7xl mx-auto" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* 1. Header Banner & Motivational Callout */}
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
            <BarChart2 size={30} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="fw-bold text-dark fs-4 mb-0.5" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Analytics
            </h1>
            <p className="text-secondary small mb-0" style={{ color: '#64748B' }}>
              Track your progress, analyze your performance, and see how you're improving.
            </p>
          </div>
        </div>

        {/* Right: Motivational Callout Box */}
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
            style={{ width: '40px', height: '40px', backgroundColor: '#2563EB', color: '#FFFFFF' }}
          >
            <Trophy size={20} />
          </div>
          <div className="lh-sm">
            <div className="fw-bold text-primary small" style={{ fontSize: '0.86rem' }}>
              “Small steps every day lead to big results.”
            </div>
            <div className="text-secondary small mt-0.5" style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Keep practicing. You're making great progress!
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs & Timeframe Dropdown */}
      <div className="card bg-white border rounded-3 shadow-xs mb-4 p-0 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between px-3 pt-1 border-bottom bg-white" style={{ borderColor: '#E2E8F0' }}>
          
          {/* Navigation Links */}
          <div className="d-flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'history', label: 'Interview History' },
              { key: 'performance', label: 'Performance' },
              { key: 'skills', label: 'Skill Progress' },
              { key: 'insights', label: 'Detailed Insights' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`btn btn-link text-decoration-none py-2.5 px-3.5 fw-semibold position-relative border-0 rounded-0 text-nowrap ${
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

          {/* Timeframe Dropdown on right */}
          <div className="my-2 my-sm-0 position-relative">
            <button
              type="button"
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
              className="btn btn-sm btn-light border rounded-2 px-3 py-1.5 text-secondary d-flex align-items-center gap-2"
              style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              <span>{timeframe === '6months' ? 'Last 6 Months' : timeframe === '3months' ? 'Last 3 Months' : timeframe === '30days' ? 'Last 30 Days' : 'Last 1 Year'}</span>
              <ChevronDown size={14} />
            </button>

            {isTimeframeOpen && (
              <div 
                className="position-absolute end-0 mt-1 card shadow-md border rounded-2 p-1 z-3"
                style={{ width: '150px', borderColor: '#E2E8F0' }}
              >
                {[
                  { key: '30days', label: 'Last 30 Days' },
                  { key: '3months', label: 'Last 3 Months' },
                  { key: '6months', label: 'Last 6 Months' },
                  { key: '1year', label: 'Last 1 Year' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTimeframe(opt.key as any);
                      setIsTimeframeOpen(false);
                    }}
                    className={`btn btn-sm text-start w-100 rounded-1 px-2.5 py-1.5 small ${
                      timeframe === opt.key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
                    }`}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Top Row 4 KPI Cards */}
      <div className="row g-3 mb-4">
        
        {/* Card 1: Total Interviews */}
        <div className="col-sm-6 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '48px', height: '48px', backgroundColor: '#2563EB' }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div className="text-secondary small fw-medium" style={{ fontSize: '0.78rem' }}>
                  Total Interviews
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-bold text-dark fs-3" style={{ lineHeight: '1.2' }}>24</span>
                  <span className="text-success fw-semibold small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                    ↑ 33% <span className="text-secondary fw-normal ms-1" style={{ fontSize: '0.68rem' }}>vs last month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="col-sm-6 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '48px', height: '48px', backgroundColor: '#10B981' }}
              >
                <User size={22} />
              </div>
              <div>
                <div className="text-secondary small fw-medium" style={{ fontSize: '0.78rem' }}>
                  Average Score
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-bold text-dark fs-3" style={{ lineHeight: '1.2' }}>72%</span>
                  <span className="text-success fw-semibold small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                    ↑ 12% <span className="text-secondary fw-normal ms-1" style={{ fontSize: '0.68rem' }}>vs last month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Practice Time */}
        <div className="col-sm-6 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF6' }}
              >
                <Clock size={22} />
              </div>
              <div>
                <div className="text-secondary small fw-medium" style={{ fontSize: '0.78rem' }}>
                  Total Practice Time
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-bold text-dark fs-3" style={{ lineHeight: '1.2' }}>18.5 hrs</span>
                  <span className="text-success fw-semibold small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                    ↑ 28% <span className="text-secondary fw-normal ms-1" style={{ fontSize: '0.68rem' }}>vs last month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Skill Improvement */}
        <div className="col-sm-6 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100" style={{ borderColor: '#E2E8F0' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '48px', height: '48px', backgroundColor: '#F97316' }}
              >
                <BarChart2 size={22} />
              </div>
              <div>
                <div className="text-secondary small fw-medium" style={{ fontSize: '0.78rem' }}>
                  Skill Improvement
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-bold text-dark fs-3" style={{ lineHeight: '1.2' }}>+24%</span>
                  <span className="text-secondary fw-normal small" style={{ fontSize: '0.72rem' }}>
                    avg. across all skills
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Middle Row: Performance Tracking (Line Chart) & Skill Progress (Grouped Bar Chart) */}
      <div className="row g-3 mb-4">
        
        {/* Performance Tracking (Line Chart) */}
        <div className="col-lg-6">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header & Dropdown */}
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div>
                <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.94rem' }}>
                  Performance Tracking
                </h2>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.74rem' }}>
                  Your interview scores over time
                </p>
              </div>

              <div className="dropdown position-relative">
                <button
                  type="button"
                  onClick={() => setIsPerfMetricOpen(!isPerfMetricOpen)}
                  className="btn btn-sm btn-light border rounded-2 px-2.5 py-1 text-secondary d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.74rem', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                >
                  <span>{perfMetric === 'interview' ? 'Interview Score' : perfMetric === 'technical' ? 'Technical Score' : 'Communication Score'}</span>
                  <ChevronDown size={13} />
                </button>

                {isPerfMetricOpen && (
                  <div 
                    className="position-absolute end-0 mt-1 card shadow-md border rounded-2 p-1 z-3"
                    style={{ width: '160px', borderColor: '#E2E8F0' }}
                  >
                    {[
                      { key: 'interview', label: 'Interview Score' },
                      { key: 'technical', label: 'Technical Score' },
                      { key: 'communication', label: 'Communication Score' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setPerfMetric(opt.key as any);
                          setIsPerfMetricOpen(false);
                        }}
                        className={`btn btn-sm text-start w-100 rounded-1 px-2 py-1 small ${
                          perfMetric === opt.key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
                        }`}
                        style={{ fontSize: '0.74rem' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Line Chart SVG */}
            <div className="mt-3 flex-grow-1 position-relative" style={{ minHeight: '230px' }}>
              <svg className="w-100 h-100" viewBox="0 0 540 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[
                  { y: 20, label: '100' },
                  { y: 55, label: '80' },
                  { y: 90, label: '60' },
                  { y: 125, label: '40' },
                  { y: 160, label: '20' },
                  { y: 195, label: '0' }
                ].map((grid, idx) => (
                  <g key={idx}>
                    <line 
                      x1="45" 
                      y1={grid.y} 
                      x2="520" 
                      y2={grid.y} 
                      stroke="#F1F5F9" 
                      strokeWidth="1" 
                      strokeDasharray={idx === 5 ? "0" : "3,3"} 
                    />
                    <text 
                      x="35" 
                      y={grid.y + 4} 
                      textAnchor="end" 
                      fontSize="10" 
                      fill="#94A3B8"
                    >
                      {grid.label}
                    </text>
                  </g>
                ))}

                {/* Area Gradient Fill */}
                <polygon
                  points="65,195 65,115 155,100 245,86 335,76 425,65 505,55 505,195"
                  fill="url(#scoreAreaGradient)"
                />

                {/* Line Path */}
                <polyline
                  points="65,115 155,100 245,86 335,76 425,65 505,55"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points with Badges/Labels */}
                {[
                  { x: 65, y: 115, score: '62%', month: 'Jan' },
                  { x: 155, y: 100, score: '68%', month: 'Feb' },
                  { x: 245, y: 86, score: '74%', month: 'Mar' },
                  { x: 335, y: 76, score: '78%', month: 'Apr' },
                  { x: 425, y: 65, score: '82%', month: 'May' },
                  { x: 505, y: 55, score: '86%', month: 'Jun' }
                ].map((pt, idx) => (
                  <g key={idx} className="cursor-pointer">
                    {/* Circle Node */}
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    
                    {/* Score Label above node */}
                    <text 
                      x={pt.x} 
                      y={pt.y - 10} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fontWeight="700" 
                      fill="#0F172A"
                    >
                      {pt.score}
                    </text>

                    {/* Month Label below */}
                    <text 
                      x={pt.x} 
                      y="212" 
                      textAnchor="middle" 
                      fontSize="11" 
                      fill="#64748B"
                    >
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

          </div>
        </div>

        {/* Skill Progress (Grouped Bar Chart) */}
        <div className="col-lg-6">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header, Legend & Dropdown */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                Skill Progress
              </h2>

              <div className="d-flex align-items-center gap-3">
                {/* Legend */}
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.72rem' }}>
                  <div className="d-flex align-items-center gap-1">
                    <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#BFDBFE' }} />
                    <span className="text-secondary">Before Practice</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#2563EB' }} />
                    <span className="text-secondary">After Practice</span>
                  </div>
                </div>

                {/* Dropdown */}
                <div className="dropdown position-relative">
                  <button
                    type="button"
                    onClick={() => setIsSkillFilterOpen(!isSkillFilterOpen)}
                    className="btn btn-sm btn-light border rounded-2 px-2.5 py-1 text-secondary d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.74rem', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                  >
                    <span>{skillFilter === 'all' ? 'All Skills' : skillFilter === 'technical' ? 'Technical' : 'Soft Skills'}</span>
                    <ChevronDown size={13} />
                  </button>

                  {isSkillFilterOpen && (
                    <div 
                      className="position-absolute end-0 mt-1 card shadow-md border rounded-2 p-1 z-3"
                      style={{ width: '130px', borderColor: '#E2E8F0' }}
                    >
                      {[
                        { key: 'all', label: 'All Skills' },
                        { key: 'technical', label: 'Technical' },
                        { key: 'soft', label: 'Soft Skills' }
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSkillFilter(opt.key as any);
                            setIsSkillFilterOpen(false);
                          }}
                          className={`btn btn-sm text-start w-100 rounded-1 px-2 py-1 small ${
                            skillFilter === opt.key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
                          }`}
                          style={{ fontSize: '0.74rem' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grouped Bar Chart SVG */}
            <div className="mt-3 flex-grow-1 position-relative" style={{ minHeight: '230px' }}>
              <svg className="w-100 h-100" viewBox="0 0 540 220" preserveAspectRatio="none">
                {/* Y-Axis Gridlines & Labels */}
                {[
                  { y: 20, label: '100' },
                  { y: 55, label: '80' },
                  { y: 90, label: '60' },
                  { y: 125, label: '40' },
                  { y: 160, label: '20' },
                  { y: 195, label: '0' }
                ].map((grid, idx) => (
                  <g key={idx}>
                    <line 
                      x1="45" 
                      y1={grid.y} 
                      x2="520" 
                      y2={grid.y} 
                      stroke="#F1F5F9" 
                      strokeWidth="1" 
                      strokeDasharray={idx === 5 ? "0" : "3,3"} 
                    />
                    <text 
                      x="35" 
                      y={grid.y + 4} 
                      textAnchor="end" 
                      fontSize="10" 
                      fill="#94A3B8"
                    >
                      {grid.label}
                    </text>
                  </g>
                ))}

                {/* 6 Skill Groups */}
                {[
                  { name: 'DSA', before: 48, after: 72, x: 75 },
                  { name: 'System\nDesign', before: 35, after: 62, x: 155 },
                  { name: 'Communication', before: 61, after: 78, x: 235 },
                  { name: 'Project\nKnowledge', before: 55, after: 80, x: 315 },
                  { name: 'HR\nPreparation', before: 50, after: 76, x: 395 },
                  { name: 'Problem\nSolving', before: 58, after: 79, x: 475 }
                ].map((grp, idx) => {
                  const bHeight = (grp.before / 100) * 175;
                  const aHeight = (grp.after / 100) * 175;
                  const bY = 195 - bHeight;
                  const aY = 195 - aHeight;
                  const barWidth = 14;

                  return (
                    <g key={idx}>
                      {/* Before Practice Bar (Light Blue) */}
                      <rect
                        x={grp.x - 16}
                        y={bY}
                        width={barWidth}
                        height={bHeight}
                        fill="#BFDBFE"
                        rx="2"
                      />
                      <text
                        x={grp.x - 9}
                        y={bY - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748B"
                        fontWeight="600"
                      >
                        {grp.before}%
                      </text>

                      {/* After Practice Bar (Solid Blue) */}
                      <rect
                        x={grp.x + 2}
                        y={aY}
                        width={barWidth}
                        height={aHeight}
                        fill="#2563EB"
                        rx="2"
                      />
                      <text
                        x={grp.x + 9}
                        y={aY - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#0F172A"
                        fontWeight="700"
                      >
                        {grp.after}%
                      </text>

                      {/* Skill Name along X-Axis */}
                      {grp.name.includes('\n') ? (
                        <>
                          <text x={grp.x} y="206" textAnchor="middle" fontSize="9.5" fill="#475569">
                            {grp.name.split('\n')[0]}
                          </text>
                          <text x={grp.x} y="216" textAnchor="middle" fontSize="9.5" fill="#475569">
                            {grp.name.split('\n')[1]}
                          </text>
                        </>
                      ) : (
                        <text x={grp.x} y="210" textAnchor="middle" fontSize="9.5" fill="#475569">
                          {grp.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Third Row: Interview History & Score Distribution */}
      <div className="row g-3 mb-4">
        
        {/* Interview History Table (60%) */}
        <div className="col-lg-7 col-xl-7">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                Interview History
              </h2>
              <a 
                href="#all-history" 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('history');
                }}
                className="text-primary fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: '0.76rem' }}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </a>
            </div>

            {/* Table */}
            <div className="table-responsive flex-grow-1">
              <table className="table align-middle table-hover mb-0" style={{ fontSize: '0.78rem' }}>
                <thead style={{ backgroundColor: '#F8FAFC' }}>
                  <tr className="text-secondary" style={{ fontSize: '0.72rem', borderColor: '#E2E8F0' }}>
                    <th scope="col" className="py-2 px-2">#</th>
                    <th scope="col" className="py-2 px-2">Date</th>
                    <th scope="col" className="py-2 px-2">Type</th>
                    <th scope="col" className="py-2 px-2">Role</th>
                    <th scope="col" className="py-2 px-2">Score</th>
                    <th scope="col" className="py-2 px-2">Duration</th>
                    <th scope="col" className="py-2 px-2">Weak Areas</th>
                    <th scope="col" className="py-2 px-2 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interviewHistory.map((item) => (
                    <tr key={item.id} style={{ borderColor: '#F1F5F9' }}>
                      <td className="px-2 text-secondary fw-medium">{item.id}</td>
                      <td className="px-2 text-dark fw-medium text-nowrap">{item.date}</td>
                      <td className="px-2">
                        <span 
                          className="badge rounded-pill fw-medium"
                          style={{ backgroundColor: item.typeBadgeColor, color: item.typeBadgeText, fontSize: '0.68rem', padding: '3px 8px' }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-2 text-dark text-nowrap">{item.role}</td>
                      <td className="px-2">
                        <span 
                          className="fw-bold"
                          style={{ 
                            color: item.score >= 80 ? '#15803D' : item.score >= 70 ? '#D97706' : '#DC2626',
                            fontSize: '0.82rem'
                          }}
                        >
                          {item.score}%
                        </span>
                      </td>
                      <td className="px-2 text-secondary">{item.duration}</td>
                      <td className="px-2">
                        <div className="d-flex align-items-center gap-1.5 text-nowrap">
                          {item.weakArea === 'System Design' && <GitBranch size={13} style={{ color: item.weakAreaColor }} />}
                          {item.weakArea === 'DP, Graphs' && <Layers size={13} style={{ color: item.weakAreaColor }} />}
                          {item.weakArea === 'Filler Words' && <MessageSquare size={13} style={{ color: item.weakAreaColor }} />}
                          {item.weakArea === 'Confidence' && <ShieldAlert size={13} style={{ color: item.weakAreaColor }} />}
                          {item.weakArea === 'Communication' && <MessageSquare size={13} style={{ color: item.weakAreaColor }} />}
                          <span className="text-dark" style={{ fontSize: '0.75rem' }}>{item.weakArea}</span>
                        </div>
                      </td>
                      <td className="px-2 text-end">
                        <button
                          type="button"
                          onClick={() => setSelectedInterview(item)}
                          className="btn btn-sm btn-light border py-1 px-2.5 rounded-2 fw-semibold text-primary"
                          style={{ fontSize: '0.72rem', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Score Distribution Donut Chart (40%) */}
        <div className="col-lg-5 col-xl-5">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.94rem' }}>
              Score Distribution
            </h2>

            <div className="row g-2 align-items-center my-auto">
              
              {/* Donut Chart */}
              <div className="col-5 text-center">
                <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: '130px', height: '130px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Excellent (90-100) 12% - Green */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.12)}
                    />
                    {/* Good (75-89) 38% - Blue */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.38)}
                      style={{ transform: 'rotate(43.2deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Average (60-74) 32% - Yellow */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.32)}
                      style={{ transform: 'rotate(180deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Below Average (<60) 18% - Red */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.18)}
                      style={{ transform: 'rotate(295.2deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="position-absolute text-center lh-1">
                    <div className="fw-bold text-dark fs-4">72%</div>
                    <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Average Score</div>
                  </div>
                </div>
              </div>

              {/* Legend with colored dots */}
              <div className="col-7">
                <div className="d-flex flex-column gap-2" style={{ fontSize: '0.76rem' }}>
                  
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: '#10B981' }} />
                      <span className="text-dark">Excellent (90–100)</span>
                    </div>
                    <span className="fw-bold text-dark">12%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: '#3B82F6' }} />
                      <span className="text-dark">Good (75–89)</span>
                    </div>
                    <span className="fw-bold text-dark">38%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: '#F59E0B' }} />
                      <span className="text-dark">Average (60–74)</span>
                    </div>
                    <span className="fw-bold text-dark">32%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: '#EF4444' }} />
                      <span className="text-dark">Below Average (&lt;60)</span>
                    </div>
                    <span className="fw-bold text-dark">18%</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Green Callout */}
            <div 
              className="mt-3 p-2.5 rounded-3 d-flex align-items-center gap-2"
              style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}
            >
              <TrendingUp size={16} className="text-success flex-shrink-0" />
              <span className="small text-dark" style={{ fontSize: '0.74rem' }}>
                Your average score has improved by <strong className="text-success">12%</strong> compared to last month!
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 6. Bottom Row: Skill Improvement Details | Practice Activity | Time Spent by Module */}
      <div className="row g-3 mb-3">
        
        {/* Skill Improvement Details (Col 3.5) */}
        <div className="col-lg-4 col-xl-3.5">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.94rem' }}>
              Skill Improvement Details
            </h2>

            <div className="table-responsive flex-grow-1">
              <table className="table align-middle mb-0" style={{ fontSize: '0.76rem' }}>
                <thead>
                  <tr className="text-secondary" style={{ fontSize: '0.7rem', borderColor: '#E2E8F0' }}>
                    <th scope="col" className="py-1.5 px-1">Skill</th>
                    <th scope="col" className="py-1.5 px-1 text-center">Before</th>
                    <th scope="col" className="py-1.5 px-1 text-center">After</th>
                    <th scope="col" className="py-1.5 px-1 text-end">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'DSA', before: '48%', after: '72%', imp: '+24%', color: '#8B5CF6', icon: <Code2 size={13} /> },
                    { name: 'System Design', before: '35%', after: '62%', imp: '+27%', color: '#2563EB', icon: <GitBranch size={13} /> },
                    { name: 'Communication', before: '61%', after: '78%', imp: '+17%', color: '#F59E0B', icon: <MessageSquare size={13} /> },
                    { name: 'Project Knowledge', before: '55%', after: '80%', imp: '+25%', color: '#10B981', icon: <Layers size={13} /> },
                    { name: 'HR Preparation', before: '50%', after: '76%', imp: '+26%', color: '#EF4444', icon: <User size={13} /> },
                    { name: 'Problem Solving', before: '58%', after: '79%', imp: '+21%', color: '#0EA5E9', icon: <Cpu size={13} /> }
                  ].map((s, idx) => (
                    <tr key={idx} style={{ borderColor: '#F1F5F9' }}>
                      <td className="py-2 px-1">
                        <div className="d-flex align-items-center gap-1.5">
                          <span style={{ color: s.color }}>{s.icon}</span>
                          <span className="fw-medium text-dark text-nowrap">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-1 text-center text-secondary">{s.before}</td>
                      <td className="py-2 px-1 text-center text-dark fw-bold">{s.after}</td>
                      <td className="py-2 px-1 text-end">
                        <span 
                          className="badge rounded-pill fw-bold"
                          style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.68rem', padding: '3px 7px' }}
                        >
                          {s.imp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Practice Activity Heatmap (Col 4.5) */}
        <div className="col-lg-4 col-xl-4.5">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header & Dropdown */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                Practice Activity
              </h2>

              <div className="dropdown position-relative">
                <button
                  type="button"
                  onClick={() => setIsPracticeTimeframeOpen(!isPracticeTimeframeOpen)}
                  className="btn btn-sm btn-light border rounded-2 px-2.5 py-1 text-secondary d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.74rem', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                >
                  <span>{practiceTimeframe === '6months' ? 'Last 6 Months' : practiceTimeframe === '3months' ? 'Last 3 Months' : 'Last 1 Year'}</span>
                  <ChevronDown size={13} />
                </button>

                {isPracticeTimeframeOpen && (
                  <div 
                    className="position-absolute end-0 mt-1 card shadow-md border rounded-2 p-1 z-3"
                    style={{ width: '130px', borderColor: '#E2E8F0' }}
                  >
                    {[
                      { key: '3months', label: 'Last 3 Months' },
                      { key: '6months', label: 'Last 6 Months' },
                      { key: '1year', label: 'Last 1 Year' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setPracticeTimeframe(opt.key as any);
                          setIsPracticeTimeframeOpen(false);
                        }}
                        className={`btn btn-sm text-start w-100 rounded-1 px-2 py-1 small ${
                          practiceTimeframe === opt.key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
                        }`}
                        style={{ fontSize: '0.74rem' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="p-2 rounded-3 border flex-grow-1 overflow-x-auto" style={{ backgroundColor: '#FAFAFA', borderColor: '#F1F5F9' }}>
              <div className="d-flex align-items-start gap-2" style={{ minWidth: '340px' }}>
                
                {/* Days of Week Labels on Left */}
                <div className="d-flex flex-column gap-1 pt-0.5 text-secondary" style={{ fontSize: '0.62rem', width: '22px' }}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* 24 Columns of 7 Days */}
                <div className="d-flex gap-1 flex-grow-1">
                  {Array.from({ length: 24 }).map((_, cIdx) => (
                    <div key={cIdx} className="d-flex flex-column gap-1">
                      {practiceGrid.map((row, rIdx) => {
                        const cell = row[cIdx];
                        return (
                          <div
                            key={rIdx}
                            onMouseEnter={() => setHoveredDay(cell)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className="rounded-1 cursor-pointer transition-all"
                            style={{
                              width: '9.5px',
                              height: '9.5px',
                              backgroundColor: getHeatmapColor(cell.level)
                            }}
                            title={`${cell.count} practice sessions on ${cell.date}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>

              {/* Month Labels along Bottom & Legend */}
              <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top" style={{ borderColor: '#F1F5F9', fontSize: '0.66rem', color: '#94A3B8' }}>
                <div className="d-flex justify-content-between flex-grow-1 ps-4 pe-3">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, idx) => (
                    <span key={idx}>{m}</span>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                  <span>Less</span>
                  <div className="rounded-1" style={{ width: '8px', height: '8px', backgroundColor: '#E2E8F0' }} />
                  <div className="rounded-1" style={{ width: '8px', height: '8px', backgroundColor: '#86EFAC' }} />
                  <div className="rounded-1" style={{ width: '8px', height: '8px', backgroundColor: '#4ADE80' }} />
                  <div className="rounded-1" style={{ width: '8px', height: '8px', backgroundColor: '#22C55E' }} />
                  <div className="rounded-1" style={{ width: '8px', height: '8px', backgroundColor: '#15803D' }} />
                  <span>More</span>
                </div>
              </div>

              {/* Hover Tooltip */}
              {hoveredDay && (
                <div className="text-center pt-1 text-primary fw-medium" style={{ fontSize: '0.7rem' }}>
                  {hoveredDay.count} practice sessions on {hoveredDay.date}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Time Spent by Module (Col 4) */}
        <div className="col-lg-4 col-xl-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.94rem' }}>
              Time Spent by Module
            </h2>

            <div className="row g-2 align-items-center my-auto">
              
              {/* Donut Chart */}
              <div className="col-5 text-center">
                <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: '130px', height: '130px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Coding 34% - Blue */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.34)}
                    />
                    {/* Technical 22% - Purple */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.22)}
                      style={{ transform: 'rotate(122.4deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Voice 15% - Teal */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#06B6D4"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.15)}
                      style={{ transform: 'rotate(201.6deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Communication 13% - Orange */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#F97316"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.13)}
                      style={{ transform: 'rotate(255.6deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* HR 10% - Red */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.10)}
                      style={{ transform: 'rotate(302.4deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Others 6% - Slate */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth="13"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.06)}
                      style={{ transform: 'rotate(338.4deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="position-absolute text-center lh-1">
                    <div className="fw-bold text-dark fs-4">18.5</div>
                    <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Total Hours</div>
                  </div>
                </div>
              </div>

              {/* Legend with colored dots */}
              <div className="col-7">
                <div className="d-flex flex-column gap-1.5" style={{ fontSize: '0.74rem' }}>
                  
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6' }} />
                      <span className="text-dark">Coding</span>
                    </div>
                    <span className="fw-bold text-dark">6.2 hrs (34%)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#8B5CF6' }} />
                      <span className="text-dark">Technical</span>
                    </div>
                    <span className="fw-bold text-dark">4.1 hrs (22%)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#06B6D4' }} />
                      <span className="text-dark">Behavioral</span>
                    </div>
                    <span className="fw-bold text-dark">2.8 hrs (15%)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#F97316' }} />
                      <span className="text-dark">Communication</span>
                    </div>
                    <span className="fw-bold text-dark">2.5 hrs (13%)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#EF4444' }} />
                      <span className="text-dark">HR</span>
                    </div>
                    <span className="fw-bold text-dark">1.8 hrs (10%)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#94A3B8' }} />
                      <span className="text-dark">Others</span>
                    </div>
                    <span className="fw-bold text-dark">1.1 hrs (6%)</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* 7. Selected Interview Detail Modal */}
      {selectedInterview && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5 p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSelectedInterview(null)}
        >
          <div 
            className="card border-0 rounded-4 shadow-lg w-100 overflow-hidden"
            style={{ maxWidth: '580px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center gap-2">
                <span 
                  className="badge rounded-pill fw-bold"
                  style={{ backgroundColor: selectedInterview.typeBadgeColor, color: selectedInterview.typeBadgeText }}
                >
                  {selectedInterview.type} Interview
                </span>
                <span className="fw-semibold text-secondary small">{selectedInterview.role}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSelectedInterview(null)} 
                aria-label="Close" 
              />
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h3 className="fw-bold text-dark fs-5 mb-0.5">{selectedInterview.role} Mock Interview</h3>
                  <div className="text-secondary small">{selectedInterview.date} &bull; {selectedInterview.duration}</div>
                </div>
                <div className="text-end">
                  <div className="fs-3 fw-bold" style={{ color: selectedInterview.score >= 80 ? '#15803D' : selectedInterview.score >= 70 ? '#D97706' : '#DC2626' }}>
                    {selectedInterview.score}%
                  </div>
                  <div className="text-secondary small">Overall Score</div>
                </div>
              </div>

              <div className="p-3 rounded-3 mb-3 bg-light border">
                <div className="fw-semibold text-dark small mb-1">AI Evaluator Feedback:</div>
                <p className="text-secondary small mb-0">{selectedInterview.details.feedback}</p>
              </div>

              <div className="mb-3">
                <div className="fw-semibold text-dark small mb-1.5">Topics Covered:</div>
                <div className="d-flex flex-wrap gap-1.5">
                  {selectedInterview.details.topicsCovered.map((topic: string, i: number) => (
                    <span key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="fw-semibold text-dark small mb-1.5">Strengths:</div>
                <div className="d-flex flex-wrap gap-1.5">
                  {selectedInterview.details.strengths.map((str: string, i: number) => (
                    <span key={i} className="badge bg-success-subtle text-success border border-success-subtle">
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-3 mb-3 border border-danger-subtle bg-danger-subtle d-flex align-items-center gap-2">
                <ShieldAlert size={16} className="text-danger flex-shrink-0" />
                <span className="small text-danger">
                  Recommended improvement area: <strong>{selectedInterview.weakArea}</strong>
                </span>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInterview(null);
                    if (onNavigateToInterviewReadiness) onNavigateToInterviewReadiness();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Go to Interview Readiness
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
