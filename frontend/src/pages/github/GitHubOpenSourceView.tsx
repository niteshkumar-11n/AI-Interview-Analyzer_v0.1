import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  GitPullRequest, 
  GitBranch, 
  GitFork, 
  GitCommit, 
  Star, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Users, 
  BookOpen, 
  Code2, 
  Terminal, 
  FileCode, 
  Layers, 
  CheckCircle2, 
  MessageSquare, 
  Flame, 
  Cpu, 
  ShieldCheck, 
  Filter, 
  RefreshCw,
  Search,
  Bookmark,
  Share2,
  FolderGit2,
  X
} from 'lucide-react';

interface GitHubOpenSourceViewProps {
  onExploreIssues?: () => void;
  onNavigateToCoding?: () => void;
}

export const GitHubOpenSourceView: React.FC<GitHubOpenSourceViewProps> = ({
  onExploreIssues,
  onNavigateToCoding
}) => {
  const { user } = useAuth();
  const candidateName = user?.profile?.name || 'Developer';
  const githubUsername = user?.profile?.github 
    ? user.profile.github.replace(/https?:\/\/github\.com\/?/, '').replace(/\/$/, '') 
    : (user?.profile?.name ? user.profile.name.toLowerCase().replace(/\s+/g, '-') : 'developer');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'profile-analysis' | 'skill-matches' | 'issue-recommendations' | 'contribution-roadmap'>('overview');
  
  // Connection state
  const [isConnected, setIsConnected] = useState(true);

  // Timeframe filter for activity
  const [activityTimeframe, setActivityTimeframe] = useState<'1year' | '6months' | '30days'>('1year');
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);

  // Analyzer sub-tabs
  const [analyzerTab, setAnalyzerTab] = useState<'overview' | 'repositories' | 'contributions' | 'technologies'>('overview');

  // Issue filter tabs
  const [issueFilterTab, setIssueFilterTab] = useState<'recommended' | 'good-first' | 'trending' | 'saved'>('recommended');

  // Selected issue for details modal
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  // Selected roadmap step modal
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Interactive saved issues list
  const [savedIssueIds, setSavedIssueIds] = useState<string[]>([]);

  // Hovered heatmap cell
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  const toggleSaveIssue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIssueIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Generate 52 weeks x 7 days mock contribution heatmap
  const generateHeatmap = () => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 52 columns
    for (let w = 0; w < 52; w++) {
      const days = [];
      const monthIdx = Math.floor((w / 52) * 12);
      for (let d = 0; d < 7; d++) {
        // Deterministic realistic density based on week and day
        const seed = (w * 7 + d * 13) % 100;
        let count = 0;
        let level = 0;
        
        if (seed > 85) {
          count = Math.floor(seed / 8) + 6;
          level = 4; // dark green
        } else if (seed > 65) {
          count = Math.floor(seed / 12) + 3;
          level = 3; // medium-dark green
        } else if (seed > 40) {
          count = Math.floor(seed / 18) + 1;
          level = 2; // medium green
        } else if (seed > 20) {
          count = 1;
          level = 1; // light green
        } else {
          count = 0;
          level = 0; // empty gray
        }

        const dateStr = `${months[monthIdx]} ${((w * 7 + d) % 28) + 1}, 2024`;
        days.push({ date: dateStr, count, level });
      }
      weeks.push(days);
    }
    return weeks;
  };

  const heatmapWeeks = React.useMemo(() => generateHeatmap(), []);

  // Level color mapping
  const getLevelColor = (lvl: number) => {
    switch (lvl) {
      case 1: return '#86EFAC';
      case 2: return '#4ADE80';
      case 3: return '#22C55E';
      case 4: return '#15803D';
      default: return '#E2E8F0';
    }
  };

  // Issue recommendations data
  const issuesData = [
    {
      id: 'issue-1',
      repo: 'vercel / next.js',
      repoUrl: 'https://github.com/vercel/next.js',
      logoType: 'vercel',
      title: 'Improve documentation for App Router',
      tags: ['documentation', 'good first issue'],
      matchScore: 94,
      comments: 12,
      updated: '2 days ago',
      category: 'good-first',
      description: 'The current documentation for parallel routing in the App Router lacks examples with complex error boundaries and loading states.',
      difficulty: 'Beginner Friendly',
      prerequisites: ['Next.js 14', 'Markdown', 'TypeScript'],
      fileToEdit: 'docs/02-app/02-api-reference/04-functions/parallel-routes.md'
    },
    {
      id: 'issue-2',
      repo: 'mui / material-ui',
      repoUrl: 'https://github.com/mui/material-ui',
      logoType: 'mui',
      title: 'Add dark mode example in docs',
      tags: ['documentation', 'React', 'TypeScript'],
      matchScore: 89,
      comments: 8,
      updated: '3 days ago',
      category: 'recommended',
      description: 'Expand the ThemeProvider documentation by adding an interactive live code sandbox showing persistent dark/light theme switching with CSS variables.',
      difficulty: 'Intermediate',
      prerequisites: ['React', 'CSS Variables', 'TypeScript'],
      fileToEdit: 'docs/src/pages/customization/dark-mode.js'
    },
    {
      id: 'issue-3',
      repo: 'supabase / supabase',
      repoUrl: 'https://github.com/supabase/supabase',
      logoType: 'supabase',
      title: 'Improve error handling in Auth module',
      tags: ['TypeScript', 'backend', 'good first issue'],
      matchScore: 86,
      comments: 15,
      updated: '4 days ago',
      category: 'good-first',
      description: 'When OAuth tokens fail validation on network timeout, ensure proper catch handlers normalize the error code and trigger the fallback refresh loop.',
      difficulty: 'Intermediate',
      prerequisites: ['TypeScript', 'Go / Auth APIs', 'Jest'],
      fileToEdit: 'packages/gotrue/src/GoTrueClient.ts'
    }
  ];

  // Roadmap steps details
  const roadmapSteps = [
    {
      step: 1,
      title: 'Understand Repository',
      desc: 'Read README, explore the codebase, understand the project.',
      color: '#2563EB',
      icon: <MessageSquare size={18} />,
      details: [
        'Check the project CONTRIBUTING.md file for code conventions.',
        'Review the existing pull request templates and discussion forums.',
        'Look at closed issues to understand the maintainers tone and preferred architecture.'
      ],
      cmd: 'git clone https://github.com/organization/project.git'
    },
    {
      step: 2,
      title: 'Setup Locally',
      desc: 'Fork the repo and set it up on your local machine.',
      color: '#10B981',
      icon: <Terminal size={18} />,
      details: [
        'Fork the repository directly to your personal GitHub account.',
        'Clone your fork locally and configure the upstream remote repository.',
        'Install dependencies via npm, yarn, or pnpm and verify the development build.'
      ],
      cmd: 'git remote add upstream https://github.com/original/project.git'
    },
    {
      step: 3,
      title: 'Select Issue',
      desc: 'Choose a suitable issue based on your skills.',
      color: '#8B5CF6',
      icon: <Layers size={18} />,
      details: [
        'Look for issues labeled "good first issue", "help wanted", or "documentation".',
        'Drop a comment asking if the issue is still open for contributions.',
        'Confirm scope with the maintainer before diving into heavy code changes.'
      ],
      cmd: '# Comment on issue: "Hi @maintainer, I would love to work on this!"'
    },
    {
      step: 4,
      title: 'Create Branch',
      desc: 'Create a new branch for your changes.',
      color: '#F97316',
      icon: <GitBranch size={18} />,
      details: [
        'Ensure your main branch is synchronized with upstream/main.',
        'Create a dedicated feature or bugfix branch with a descriptive name.',
        'Never commit directly to your local main branch.'
      ],
      cmd: 'git checkout -b fix/auth-error-handling'
    },
    {
      step: 5,
      title: 'Implement',
      desc: 'Write code, follow guidelines and make changes.',
      color: '#EF4444',
      icon: <Code2 size={18} />,
      details: [
        'Keep changes minimal and strictly focused on resolving the issue.',
        'Follow existing code formatting styles and ESLint/Prettier configs.',
        'Write concise, descriptive commit messages adhering to Conventional Commits.'
      ],
      cmd: 'git commit -m "fix(auth): normalize network timeout error responses"'
    },
    {
      step: 6,
      title: 'Test',
      desc: 'Run tests and ensure everything works.',
      color: '#14B8A6',
      icon: <CheckCircle2 size={18} />,
      details: [
        'Run the test suite locally (e.g. npm test, pytest, vitest).',
        'Add new test cases that cover the bug or feature you implemented.',
        'Ensure build and type-checking scripts pass without any warnings.'
      ],
      cmd: 'npm run test && npm run lint'
    },
    {
      step: 7,
      title: 'Create Pull Request',
      desc: 'Submit your changes and describe them clearly.',
      color: '#2563EB',
      icon: <GitPullRequest size={18} />,
      details: [
        'Push your branch to your personal fork on GitHub.',
        'Open a pull request referencing the issue number (e.g. "Closes #142").',
        'Respond constructively to maintainer review comments and suggestions.'
      ],
      cmd: 'git push origin fix/auth-error-handling'
    }
  ];

  const filteredIssues = issuesData.filter(issue => {
    if (issueFilterTab === 'recommended') return true;
    if (issueFilterTab === 'good-first') return issue.category === 'good-first';
    if (issueFilterTab === 'saved') return savedIssueIds.includes(issue.id);
    return true;
  });

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
              color: '#0F172A'
            }}
          >
            {/* GitHub Octocat / Branch Icon */}
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="fw-bold text-dark fs-4 mb-0.5" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              GitHub & Open Source
            </h1>
            <p className="text-secondary small mb-0" style={{ color: '#64748B' }}>
              Connect your GitHub, analyze your profile, discover opportunities and grow as a developer.
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
            <Sparkles size={20} className="text-primary" />
          </div>
          <div className="lh-sm">
            <div className="fw-bold text-primary small" style={{ fontSize: '0.86rem' }}>
              “Contribute today. Build tomorrow.”
            </div>
            <div className="text-secondary small mt-0.5" style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Open source experience makes you a better developer.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-navigation Tabs */}
      <div className="card bg-white border rounded-3 shadow-xs mb-4 p-0 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex border-bottom px-3 pt-1 bg-white overflow-x-auto" style={{ borderColor: '#E2E8F0' }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'profile-analysis', label: 'Profile Analysis' },
            { key: 'skill-matches', label: 'Skill Matches' },
            { key: 'issue-recommendations', label: 'Issue Recommendations' },
            { key: 'contribution-roadmap', label: 'Contribution Roadmap' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`btn btn-link text-decoration-none py-2.5 px-4 fw-semibold position-relative border-0 rounded-0 text-nowrap ${
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

      {/* 3. Top Row Cards: F31 Connect Your GitHub | GitHub Activity | Top Languages */}
      <div className="row g-3 mb-4">
        
        {/* Card F31: Connect Your GitHub (3.5 col) */}
        <div className="col-lg-3 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header with F31 Badge */}
            <div className="d-flex align-items-start gap-2 mb-3">
              <span 
                className="badge fw-bold text-white rounded-2 px-2 py-1 flex-shrink-0"
                style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
              >
                F31
              </span>
              <div>
                <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.92rem' }}>
                  Connect Your GitHub
                </h2>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                  Link your GitHub account to analyze your repositories, contributions and skills.
                </p>
              </div>
            </div>

            {/* Profile Box */}
            <div className="p-3 rounded-3 border mb-3" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <div className="d-flex align-items-center gap-2.5 mb-2">
                {/* User Avatar */}
                <div 
                  className="rounded-circle overflow-hidden flex-shrink-0 border"
                  style={{ width: '42px', height: '42px', borderColor: '#CBD5E1' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                    alt="Rohan Singh"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>

                <div className="lh-sm flex-grow-1">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="fw-bold text-dark small" style={{ fontSize: '0.86rem' }}>
                      {githubUsername}
                    </span>
                    <span 
                      className="badge rounded-pill fw-medium d-inline-flex align-items-center gap-1"
                      style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.66rem', padding: '3px 7px' }}
                    >
                      <Check size={10} strokeWidth={3} /> Connected
                    </span>
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                    {candidateName}
                  </div>
                  <div className="text-muted d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
                    <Calendar size={11} /> Active Contributor
                  </div>
                </div>
              </div>

              {/* 3 Metric counters */}
              <div className="row g-2 text-center pt-2 border-top" style={{ borderColor: '#E2E8F0' }}>
                <div className="col-4">
                  <div className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>128</div>
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Repositories</div>
                </div>
                <div className="col-4 border-start border-end" style={{ borderColor: '#E2E8F0' }}>
                  <div className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>342</div>
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Followers</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>286</div>
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Following</div>
                </div>
              </div>
            </div>

            {/* Disconnect / Connect Button */}
            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setIsConnected(!isConnected)}
                className="btn btn-sm btn-outline-secondary w-100 rounded-3 py-1.5 fw-semibold"
                style={{ fontSize: '0.78rem', borderColor: '#CBD5E1', color: '#475569' }}
              >
                {isConnected ? 'Disconnect' : 'Connect GitHub'}
              </button>
            </div>

          </div>
        </div>

        {/* Card: GitHub Activity (Heatmap) (5.8 col) */}
        <div className="col-lg-6 col-xl-6">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header & Dropdown */}
            <div className="d-flex align-items-center justify-content-between mb-1">
              <h2 className="fw-bold text-dark small mb-0" style={{ fontSize: '0.94rem' }}>
                GitHub Activity
              </h2>
              
              <div className="dropdown position-relative">
                <button
                  type="button"
                  onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                  className="btn btn-sm btn-light border rounded-2 px-2.5 py-1 text-secondary d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.74rem', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                >
                  <span>{activityTimeframe === '1year' ? 'Last 1 year' : activityTimeframe === '6months' ? 'Last 6 months' : 'Last 30 days'}</span>
                  <ChevronDown size={13} />
                </button>

                {isTimeframeDropdownOpen && (
                  <div 
                    className="position-absolute end-0 mt-1 card shadow-md border rounded-2 p-1 z-3"
                    style={{ width: '130px', borderColor: '#E2E8F0' }}
                  >
                    {[
                      { key: '1year', label: 'Last 1 year' },
                      { key: '6months', label: 'Last 6 months' },
                      { key: '30days', label: 'Last 30 days' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setActivityTimeframe(opt.key as any);
                          setIsTimeframeDropdownOpen(false);
                        }}
                        className={`btn btn-sm text-start w-100 rounded-1 px-2 py-1 small ${
                          activityTimeframe === opt.key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
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

            <p className="text-secondary small mb-2.5" style={{ fontSize: '0.74rem' }}>
              1,482 contributions in the last year
            </p>

            {/* Contribution Heatmap Canvas */}
            <div className="p-2 rounded-3 border mb-3 overflow-x-auto" style={{ backgroundColor: '#FAFAFA', borderColor: '#F1F5F9' }}>
              <div className="d-flex gap-1" style={{ minWidth: '460px' }}>
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="d-flex flex-column gap-1">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="rounded-1 cursor-pointer transition-all hover-scale"
                        style={{
                          width: '7.5px',
                          height: '7.5px',
                          backgroundColor: getLevelColor(day.level)
                        }}
                        title={`${day.count} contributions on ${day.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Month Labels & Legend */}
              <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top" style={{ borderColor: '#F1F5F9', fontSize: '0.66rem', color: '#94A3B8' }}>
                <div className="d-flex justify-content-between flex-grow-1 pe-4">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                    <span key={idx}>{m}</span>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                  <span>Less</span>
                  <div className="rounded-1" style={{ width: '7.5px', height: '7.5px', backgroundColor: '#E2E8F0' }} />
                  <div className="rounded-1" style={{ width: '7.5px', height: '7.5px', backgroundColor: '#86EFAC' }} />
                  <div className="rounded-1" style={{ width: '7.5px', height: '7.5px', backgroundColor: '#4ADE80' }} />
                  <div className="rounded-1" style={{ width: '7.5px', height: '7.5px', backgroundColor: '#22C55E' }} />
                  <div className="rounded-1" style={{ width: '7.5px', height: '7.5px', backgroundColor: '#15803D' }} />
                  <span>More</span>
                </div>
              </div>

              {/* Hover Tooltip feedback */}
              {hoveredCell && (
                <div className="text-center pt-1 text-primary fw-medium" style={{ fontSize: '0.7rem' }}>
                  {hoveredCell.count} contributions on {hoveredCell.date}
                </div>
              )}
            </div>

            {/* 4 Bottom Stats */}
            <div className="row g-2 text-center mt-auto">
              <div className="col-3">
                <div className="fw-bold text-dark fs-5">42</div>
                <div className="text-secondary" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                  Contributions<br />(last 30 days)
                </div>
              </div>
              <div className="col-3 border-start" style={{ borderColor: '#F1F5F9' }}>
                <div className="fw-bold text-dark fs-5">12</div>
                <div className="text-secondary" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                  Active<br />repositories
                </div>
              </div>
              <div className="col-3 border-start" style={{ borderColor: '#F1F5F9' }}>
                <div className="fw-bold text-dark fs-5">8</div>
                <div className="text-secondary" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                  Pull<br />requests
                </div>
              </div>
              <div className="col-3 border-start" style={{ borderColor: '#F1F5F9' }}>
                <div className="fw-bold text-dark fs-5">6</div>
                <div className="text-secondary" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                  Issues<br />opened
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Card: Top Languages (Donut Chart) (3.2 col) */}
        <div className="col-lg-3 col-xl-3">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            <h2 className="fw-bold text-dark small mb-3" style={{ fontSize: '0.94rem' }}>
              Top Languages
            </h2>

            <div className="row g-2 align-items-center my-auto">
              
              {/* Donut Chart SVG with 128 Repositories center */}
              <div className="col-6 text-center">
                <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* JavaScript 34.2% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.342)}
                    />
                    {/* TypeScript 22.1% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.221)}
                      style={{ transform: 'rotate(123deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Python 16.8% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.168)}
                      style={{ transform: 'rotate(203deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Java 10.4% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#F97316"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.104)}
                      style={{ transform: 'rotate(263deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* HTML 8.1% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.081)}
                      style={{ transform: 'rotate(301deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* CSS 5.2% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.052)}
                      style={{ transform: 'rotate(330deg)', transformOrigin: '50% 50%' }}
                    />
                    {/* Others 3.2% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth="12"
                      strokeDasharray="226"
                      strokeDashoffset={226 * (1 - 0.032)}
                      style={{ transform: 'rotate(349deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="position-absolute text-center lh-1">
                    <div className="fw-bold text-dark fs-5">128</div>
                    <div className="text-secondary" style={{ fontSize: '0.62rem' }}>Repositories</div>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="col-6">
                <div className="d-flex flex-column gap-1.5" style={{ fontSize: '0.74rem' }}>
                  
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B' }} />
                      <span className="text-dark">JavaScript</span>
                    </div>
                    <span className="fw-bold text-dark">34.2%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6' }} />
                      <span className="text-dark">TypeScript</span>
                    </div>
                    <span className="fw-bold text-dark">22.1%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#10B981' }} />
                      <span className="text-dark">Python</span>
                    </div>
                    <span className="fw-bold text-dark">16.8%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#F97316' }} />
                      <span className="text-dark">Java</span>
                    </div>
                    <span className="fw-bold text-dark">10.4%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#EF4444' }} />
                      <span className="text-dark">HTML</span>
                    </div>
                    <span className="fw-bold text-dark">8.1%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#8B5CF6' }} />
                      <span className="text-dark">CSS</span>
                    </div>
                    <span className="fw-bold text-dark">5.2%</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#94A3B8' }} />
                      <span className="text-dark">Others</span>
                    </div>
                    <span className="fw-bold text-dark">3.2%</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* 4. Middle Row: F32 GitHub Profile Analyzer | F33 Skill Extraction | F34 Open-Source Issues */}
      <div className="row g-3 mb-4">
        
        {/* Card F32: GitHub Profile Analyzer (Col 4) */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header with F32 Badge */}
            <div className="d-flex align-items-start gap-2 mb-2">
              <span 
                className="badge fw-bold text-white rounded-2 px-2 py-1 flex-shrink-0"
                style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
              >
                F32
              </span>
              <div>
                <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.92rem' }}>
                  GitHub Profile Analyzer
                </h2>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.72rem' }}>
                  AI analyzes your GitHub profile and activity.
                </p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="d-flex border-bottom mb-3" style={{ borderColor: '#E2E8F0' }}>
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'repositories', label: 'Repositories' },
                { key: 'contributions', label: 'Contributions' },
                { key: 'technologies', label: 'Technologies' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setAnalyzerTab(tab.key as any)}
                  className={`btn btn-link text-decoration-none py-1.5 px-2.5 fw-semibold border-0 rounded-0 position-relative small ${
                    analyzerTab === tab.key ? 'text-primary' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.74rem' }}
                >
                  {tab.label}
                  {analyzerTab === tab.key && (
                    <div className="position-absolute bottom-0 start-0 end-0 bg-primary" style={{ height: '2px' }} />
                  )}
                </button>
              ))}
            </div>

            {/* 6 Quick Stat Tiles (2 rows x 3 columns) */}
            <div className="row g-2 mb-3">
              
              {/* Tile 1: Repositories */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-primary mb-0.5"><FolderGit2 size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>128</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Repositories</div>
                  <div className="text-success fw-semibold" style={{ fontSize: '0.62rem' }}>+12 this year</div>
                </div>
              </div>

              {/* Tile 2: Contributions */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-success mb-0.5"><Calendar size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>1,482</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Contributions</div>
                  <div className="text-success fw-semibold" style={{ fontSize: '0.62rem' }}>+28% increase</div>
                </div>
              </div>

              {/* Tile 3: Active Streak */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-danger mb-0.5"><Flame size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>24</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Active Streak</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>days</div>
                </div>
              </div>

              {/* Tile 4: Pull Requests */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-primary mb-0.5"><GitPullRequest size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>8</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Pull Requests</div>
                  <div className="text-success fw-semibold" style={{ fontSize: '0.62rem' }}>5 merged</div>
                </div>
              </div>

              {/* Tile 5: Issues Opened */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-danger mb-0.5"><AlertCircle size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>12</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Issues Opened</div>
                  <div className="text-success fw-semibold" style={{ fontSize: '0.62rem' }}>4 closed</div>
                </div>
              </div>

              {/* Tile 6: Technologies Detected */}
              <div className="col-4">
                <div className="p-2 rounded-3 border text-center h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                  <div className="text-purple mb-0.5" style={{ color: '#8B5CF6' }}><Cpu size={16} /></div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.96rem' }}>18</div>
                  <div className="text-secondary" style={{ fontSize: '0.64rem' }}>Technologies</div>
                  <div className="text-secondary" style={{ fontSize: '0.62rem' }}>Detected</div>
                </div>
              </div>

            </div>

            {/* Recent Activity List */}
            <div className="mt-auto">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                  Recent Activity
                </span>
                <a href="#all-activity" className="text-primary text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <span>View All Activity</span>
                  <ArrowRight size={12} />
                </a>
              </div>

              <div className="d-flex flex-column gap-2" style={{ fontSize: '0.74rem' }}>
                
                {/* Activity 1 */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <GitCommit size={14} className="text-secondary flex-shrink-0" />
                    <span>Pushed to <strong className="text-primary">portfolio-website</strong></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>2 hours ago</span>
                </div>

                {/* Activity 2 */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <GitPullRequest size={14} className="text-secondary flex-shrink-0" />
                    <span>Merged PR #42 in <strong className="text-primary">open-source-ui</strong></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>1 day ago</span>
                </div>

                {/* Activity 3 */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <AlertCircle size={14} className="text-secondary flex-shrink-0" />
                    <span>Opened issue in <strong className="text-primary">awesome-project</strong></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>2 days ago</span>
                </div>

                {/* Activity 4 */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Star size={14} className="text-secondary flex-shrink-0" />
                    <span>Starred <strong className="text-primary">vercel/next.js</strong></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>3 days ago</span>
                </div>

                {/* Activity 5 */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <GitFork size={14} className="text-secondary flex-shrink-0" />
                    <span>Forked <strong className="text-primary">tailwindlabs/tailwindcss</strong></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>5 days ago</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Card F33: Skill Extraction (Col 4) */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header with F33 Badge */}
            <div className="d-flex align-items-start gap-2 mb-2">
              <span 
                className="badge fw-bold text-white rounded-2 px-2 py-1 flex-shrink-0"
                style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
              >
                F33
              </span>
              <div>
                <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.92rem' }}>
                  Skill Extraction
                </h2>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.72rem' }}>
                  Combine resume and GitHub to build a stronger skill profile.
                </p>
              </div>
            </div>

            {/* Skills From Resume vs Skills From GitHub (Two columns with arrow) */}
            <div className="position-relative mb-3">
              <div className="row g-2">
                
                {/* Skills from Resume */}
                <div className="col-6">
                  <div className="p-2 rounded-3 border h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                    <div className="fw-bold text-dark mb-1.5" style={{ fontSize: '0.74rem' }}>
                      Skills from Resume
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {['React', 'Node.js', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'Git', 'Express.js', 'Problem Solving', 'Teamwork'].map((s, i) => (
                        <span 
                          key={i} 
                          className="badge rounded-pill fw-medium"
                          style={{ backgroundColor: '#F1F5F9', color: '#334155', fontSize: '0.66rem', border: '1px solid #E2E8F0' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills from GitHub */}
                <div className="col-6">
                  <div className="p-2 rounded-3 border h-100" style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}>
                    <div className="fw-bold text-primary mb-1.5" style={{ fontSize: '0.74rem' }}>
                      Skills from GitHub
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {['TypeScript', 'Next.js', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'Tailwind CSS', 'CI/CD', 'Open Source', 'System Design'].map((s, i) => (
                        <span 
                          key={i} 
                          className="badge rounded-pill fw-medium"
                          style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.66rem' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Connecting Arrow -> */}
              <div 
                className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white border shadow-xs d-flex align-items-center justify-content-center text-primary"
                style={{ width: '22px', height: '22px', borderColor: '#CBD5E1', zIndex: 2 }}
              >
                <ArrowRight size={12} />
              </div>
            </div>

            {/* Downward Arrow ↓ */}
            <div className="text-center my-1 text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>

            {/* Verified / Observed Skills */}
            <div className="p-2.5 rounded-3 border mb-3" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div className="d-flex align-items-center gap-1.5 mb-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '16px', height: '16px', backgroundColor: '#10B981' }}
                >
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                  Verified/Observed Skills
                </span>
              </div>

              <div className="d-flex flex-wrap gap-1">
                {[
                  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
                  'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 
                  'Git', 'HTML', 'CSS', 'Tailwind CSS', 'CI/CD', 
                  'System Design', 'Open Source', 'Problem Solving'
                ].map((skill, idx) => (
                  <span 
                    key={idx}
                    className="badge rounded-pill fw-medium"
                    style={{ 
                      backgroundColor: '#F8FAFC', 
                      color: '#0F172A', 
                      border: '1px solid #E2E8F0',
                      fontSize: '0.67rem',
                      padding: '4px 8px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Green Callout Box */}
            <div 
              className="p-2 px-3 rounded-3 d-flex align-items-center gap-2 border mt-auto"
              style={{ backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '18px', height: '18px', backgroundColor: '#10B981' }}
              >
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="small text-dark" style={{ fontSize: '0.74rem' }}>
                Your skill profile is <strong className="text-success">63% stronger</strong> with GitHub data!
              </span>
            </div>

          </div>
        </div>

        {/* Card F34: Open-Source Issue Recommendations (Col 4) */}
        <div className="col-lg-4">
          <div className="card bg-white border rounded-4 p-3.5 shadow-xs h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
            
            {/* Header with F34 Badge */}
            <div className="d-flex align-items-start gap-2 mb-2">
              <span 
                className="badge fw-bold text-white rounded-2 px-2 py-1 flex-shrink-0"
                style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
              >
                F34
              </span>
              <div>
                <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.92rem' }}>
                  Open-Source Issue Recommendations
                </h2>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.72rem' }}>
                  AI finds the best issues for you based on your skills and interests.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex border-bottom mb-2.5 overflow-x-auto" style={{ borderColor: '#E2E8F0' }}>
              {[
                { key: 'recommended', label: 'Recommended' },
                { key: 'good-first', label: 'Good First Issues' },
                { key: 'trending', label: 'Trending' },
                { key: 'saved', label: 'Saved' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setIssueFilterTab(tab.key as any)}
                  className={`btn btn-link text-decoration-none py-1.5 px-2 fw-semibold border-0 rounded-0 position-relative text-nowrap ${
                    issueFilterTab === tab.key ? 'text-primary' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.74rem' }}
                >
                  {tab.label}
                  {issueFilterTab === tab.key && (
                    <div className="position-absolute bottom-0 start-0 end-0 bg-primary" style={{ height: '2px' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Issue Cards List */}
            <div className="d-flex flex-column gap-2 mb-2 flex-grow-1">
              {filteredIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className="p-2.5 rounded-3 border hover-shadow transition-all bg-white"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  {/* Top line: Logo, Repo name & Skill Match badge */}
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <div className="d-flex align-items-center gap-2">
                      {/* Repo Logo */}
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          backgroundColor: issue.logoType === 'vercel' ? '#000000' : issue.logoType === 'mui' ? '#007FFF' : '#1C1C1C' 
                        }}
                      >
                        {issue.logoType === 'vercel' && (
                          <svg width="14" height="14" viewBox="0 0 115 100" fill="currentColor">
                            <path d="M57.5 0L115 100H0L57.5 0Z" />
                          </svg>
                        )}
                        {issue.logoType === 'mui' && (
                          <span className="fw-bold" style={{ fontSize: '0.75rem' }}>M</span>
                        )}
                        {issue.logoType === 'supabase' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#24B47E">
                            <path d="M21.362 9.354H12V.396a.396.396 0 00-.716-.233L2.203 12.424a.396.396 0 00.323.642H12v8.958a.396.396 0 00.716.233l9.081-12.261a.396.396 0 00-.323-.642z"/>
                          </svg>
                        )}
                      </div>

                      <span className="text-secondary small fw-medium" style={{ fontSize: '0.76rem' }}>
                        {issue.repo}
                      </span>
                    </div>

                    <span 
                      className="badge rounded-pill fw-bold"
                      style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.68rem', padding: '3px 8px' }}
                    >
                      {issue.matchScore}% Skill Match
                    </span>
                  </div>

                  {/* Issue Title */}
                  <h3 
                    onClick={() => setSelectedIssue(issue)}
                    className="fw-bold text-dark small mb-1.5 cursor-pointer hover-text-primary" 
                    style={{ fontSize: '0.82rem', lineHeight: '1.3' }}
                  >
                    {issue.title}
                  </h3>

                  {/* Tags */}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {issue.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx}
                        className="badge rounded-pill"
                        style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.64rem', padding: '2px 7px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Meta: comments, updated date, and View Issue button */}
                  <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ borderColor: '#F1F5F9', fontSize: '0.7rem', color: '#64748B' }}>
                    <div className="d-flex align-items-center gap-2.5">
                      <span className="d-flex align-items-center gap-1">
                        <MessageSquare size={12} /> {issue.comments} comments
                      </span>
                      <span>Updated {issue.updated}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedIssue(issue)}
                      className="btn btn-primary btn-sm rounded-2 py-1 px-2.5 fw-semibold border-0"
                      style={{ fontSize: '0.72rem', backgroundColor: '#2563EB' }}
                    >
                      View Issue
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Bottom Link: View More Issues */}
            <div className="text-end mt-auto pt-1">
              <a 
                href="#more-issues" 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('issue-recommendations');
                }}
                className="text-primary fw-semibold small text-decoration-none d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.76rem' }}
              >
                <span>View More Issues</span>
                <ArrowRight size={13} />
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Bottom Row: Card F35: Contribution Roadmap */}
      <div className="card bg-white border rounded-4 p-4 shadow-xs mb-3" style={{ borderColor: '#E2E8F0' }}>
        
        {/* Header with F35 Badge */}
        <div className="d-flex align-items-start gap-2 mb-4">
          <span 
            className="badge fw-bold text-white rounded-2 px-2 py-1 flex-shrink-0"
            style={{ backgroundColor: '#2563EB', fontSize: '0.72rem' }}
          >
            F35
          </span>
          <div>
            <h2 className="fw-bold text-dark small mb-0.5" style={{ fontSize: '0.94rem' }}>
              Contribution Roadmap
            </h2>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.74rem' }}>
              Step-by-step guide to make your first (or next) open-source contribution.
            </p>
          </div>
        </div>

        {/* 7 Interactive Steps in linear flow */}
        <div className="d-flex align-items-center justify-content-between overflow-x-auto pb-2 gap-2">
          {roadmapSteps.map((step, idx) => (
            <React.Fragment key={step.step}>
              {/* Step Tile */}
              <div 
                onClick={() => setSelectedStep(step.step)}
                className="text-center p-2.5 rounded-3 cursor-pointer transition-all hover-shadow"
                style={{ 
                  width: '135px', 
                  flexShrink: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9'
                }}
              >
                {/* Icon Container */}
                <div 
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-white mb-2 shadow-xs"
                  style={{ width: '38px', height: '38px', backgroundColor: step.color }}
                >
                  {step.icon}
                </div>

                {/* Step Subtitle */}
                <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                  Step {step.step}
                </div>

                {/* Step Title */}
                <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                  {step.title}
                </div>

                {/* Step Description */}
                <div className="text-secondary small" style={{ fontSize: '0.68rem', lineHeight: '1.3' }}>
                  {step.desc}
                </div>
              </div>

              {/* Connecting Arrow (between items) */}
              {idx < roadmapSteps.length - 1 && (
                <div className="text-muted flex-shrink-0 px-1" style={{ color: '#CBD5E1' }}>
                  <ArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div 
          className="rounded-3 p-2.5 px-3.5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}
        >
          <div className="d-flex align-items-center gap-2.5">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
              style={{ width: '22px', height: '22px', backgroundColor: '#10B981' }}
            >
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
              You're ready to contribute! Start with a "good first issue" to get hands-on experience.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIssueFilterTab('good-first');
              const el = document.getElementById('issue-recommendations-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn-primary btn-sm rounded-3 py-1.5 px-3.5 fw-semibold d-flex align-items-center gap-1.5 flex-shrink-0 border-0"
            style={{ backgroundColor: '#2563EB', fontSize: '0.8rem' }}
          >
            <span>Explore Issues</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* 6. Selected Issue Detail Modal */}
      {selectedIssue && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5 p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSelectedIssue(null)}
        >
          <div 
            className="card border-0 rounded-4 shadow-lg w-100 overflow-hidden"
            style={{ maxWidth: '640px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill">Open Issue</span>
                <span className="fw-semibold text-secondary small">{selectedIssue.repo}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSelectedIssue(null)} 
                aria-label="Close" 
              />
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <h3 className="fw-bold text-dark fs-5 mb-2">{selectedIssue.title}</h3>
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
                  {selectedIssue.matchScore}% Skill Match
                </span>
                <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1">
                  Difficulty: {selectedIssue.difficulty}
                </span>
                <span className="badge rounded-pill bg-light text-secondary border px-2.5 py-1">
                  Updated: {selectedIssue.updated}
                </span>
              </div>

              <div className="p-3 rounded-3 mb-3 bg-light border">
                <div className="fw-semibold text-dark small mb-1">Description:</div>
                <p className="text-secondary small mb-0">{selectedIssue.description}</p>
              </div>

              <div className="mb-3">
                <div className="fw-semibold text-dark small mb-1.5">Recommended Skills:</div>
                <div className="d-flex flex-wrap gap-1.5">
                  {selectedIssue.prerequisites.map((p: string, idx: number) => (
                    <span key={idx} className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-3 mb-3 border bg-dark text-white font-monospace small">
                <div className="text-secondary mb-1" style={{ fontSize: '0.7rem' }}>Suggested file to modify:</div>
                <div className="text-warning">{selectedIssue.fileToEdit}</div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2">
                <button
                  type="button"
                  onClick={(e) => toggleSaveIssue(selectedIssue.id, e)}
                  className={`btn btn-sm d-flex align-items-center gap-1.5 ${
                    savedIssueIds.includes(selectedIssue.id) ? 'btn-outline-danger' : 'btn-outline-secondary'
                  }`}
                >
                  <Bookmark size={14} />
                  <span>{savedIssueIds.includes(selectedIssue.id) ? 'Saved' : 'Save for Later'}</span>
                </button>

                <a 
                  href={selectedIssue.repoUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1.5"
                >
                  <span>Open on GitHub</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Selected Roadmap Step Modal */}
      {selectedStep !== null && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5 p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSelectedStep(null)}
        >
          {(() => {
            const stepObj = roadmapSteps.find(s => s.step === selectedStep);
            if (!stepObj) return null;
            return (
              <div 
                className="card border-0 rounded-4 shadow-lg w-100 overflow-hidden"
                style={{ maxWidth: '580px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3.5 border-bottom d-flex align-items-center justify-content-between bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <span 
                      className="rounded-2 d-flex align-items-center justify-content-center text-white"
                      style={{ width: '28px', height: '28px', backgroundColor: stepObj.color }}
                    >
                      {stepObj.icon}
                    </span>
                    <span className="fw-bold text-dark">Step {stepObj.step}: {stepObj.title}</span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedStep(null)} aria-label="Close" />
                </div>

                <div className="p-4">
                  <p className="text-secondary small mb-3">{stepObj.desc}</p>
                  
                  <h4 className="fw-bold text-dark small mb-2">Best Practices & Checkpoints:</h4>
                  <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
                    {stepObj.details.map((det, i) => (
                      <li key={i} className="d-flex align-items-start gap-2 small text-dark">
                        <Check size={14} className="text-success flex-shrink-0 mt-1" />
                        <span>{det}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-3 bg-dark text-white font-monospace small mb-3">
                    <div className="text-secondary mb-1" style={{ fontSize: '0.7rem' }}>Terminal Command:</div>
                    <div className="text-success">{stepObj.cmd}</div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    {selectedStep > 1 && (
                      <button 
                        type="button"
                        onClick={() => setSelectedStep(selectedStep - 1)}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Previous Step
                      </button>
                    )}
                    {selectedStep < roadmapSteps.length ? (
                      <button 
                        type="button"
                        onClick={() => setSelectedStep(selectedStep + 1)}
                        className="btn btn-primary btn-sm"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setSelectedStep(null)}
                        className="btn btn-success btn-sm"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
