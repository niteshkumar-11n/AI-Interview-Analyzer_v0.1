import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Code2, 
  Sparkles, 
  GitPullRequest, 
  BarChart3, 
  User, 
  Settings, 
  Star,
  ChevronRight,
  X,
  Link2,
  Headphones,
  BarChart2,
  GraduationCap
} from 'lucide-react';

export type NavItemKey = 
  | 'dashboard' 
  | 'job-match' 
  | 'job-recommendations'
  | 'ai-interview'
  | 'coding-interview' 
  | 'interview-readiness' 
  | 'github' 
  | 'interview-history' 
  | 'profile' 
  | 'settings';

export type ViewType = 
  | 'dashboard' 
  | 'profile' 
  | 'job-matching' 
  | 'job-recommendations' 
  | 'ai-interview' 
  | 'coding-interview' 
  | 'interview-readiness' 
  | 'github'
  | 'analytics';

interface SidebarProps {
  currentView: ViewType;
  activeNav: NavItemKey;
  onNavigate: (view: ViewType, navKey?: NavItemKey) => void;
  onOpenModal: (modal: 'coding' | 'jobs' | 'github' | 'history' | 'settings' | 'support' | 'mock') => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeNav,
  onNavigate,
  onOpenModal,
  isMobileOpen,
  onCloseMobile
}) => {

  const handleNavClick = (key: NavItemKey) => {
    onCloseMobile();
    if (key === 'dashboard') {
      onNavigate('dashboard', 'dashboard');
    } else if (key === 'profile') {
      onNavigate('profile', 'profile');
    } else if (key === 'job-match') {
      onNavigate('job-matching', 'job-match');
    } else if (key === 'job-recommendations') {
      onNavigate('job-recommendations', 'job-recommendations');
    } else if (key === 'ai-interview') {
      onNavigate('ai-interview', 'ai-interview');
    } else if (key === 'coding-interview') {
      onNavigate('coding-interview', 'coding-interview');
    } else if (key === 'github') {
      onNavigate('github', 'github');
    } else if (key === 'interview-readiness') {
      onNavigate('interview-readiness', 'interview-readiness');
    } else if (key === 'interview-history') {
      onNavigate('analytics', 'interview-history');
    } else if (key === 'settings') {
      onOpenModal('settings');
    }
  };

  const navItems: { key: NavItemKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'job-match', label: 'Job Matching', icon: <Link2 size={18} /> },
    { key: 'job-recommendations', label: 'Job Recommendations', icon: <Briefcase size={18} /> },
    { key: 'ai-interview', label: 'AI Interview', icon: <Headphones size={18} /> },
    { key: 'coding-interview', label: 'Coding Practice', icon: <Code2 size={18} /> },
    { key: 'github', label: 'GitHub & Open Source', icon: <GitPullRequest size={18} /> },
    { key: 'interview-readiness', label: 'Interview Readiness', icon: <BarChart2 size={18} /> },
    { key: 'interview-history', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-3 d-lg-none"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Main Container */}
      <aside 
        className={`d-flex flex-column justify-content-between text-white transition-all position-fixed top-0 bottom-0 start-0 z-4 ${
          isMobileOpen ? 'translate-middle-x-0' : 'd-none d-lg-flex'
        }`}
        style={{
          width: '240px',
          backgroundColor: '#0B132B',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.15)',
          zIndex: 1040,
        }}
      >
        <div className="d-flex flex-column h-100 justify-content-between">
          <div>
            {/* Brand Logo & Name */}
            <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-white border-opacity-10">
              <div 
                className="d-flex align-items-center gap-2.5 cursor-pointer text-decoration-none"
                onClick={() => onNavigate('dashboard', 'dashboard')}
              >
                <div 
                  className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                  style={{
                    width: '34px',
                    height: '34px',
                    background: 'linear-gradient(135deg, #00B69B 0%, #0D7A5F 100%)'
                  }}
                >
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <span className="fw-bold fs-6 tracking-tight text-white d-block lh-sm">
                    SkillNexus
                  </span>
                  <span className="text-secondary" style={{ fontSize: '0.66rem', letterSpacing: '0.02em' }}>
                    Ace Interviews &amp; Skills
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile */}
              <button 
                className="btn btn-sm btn-link text-secondary d-lg-none p-1"
                onClick={onCloseMobile}
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="p-3 d-flex flex-column gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 210px)' }}>
              {navItems.map((item) => {
                const isActive = 
                  (item.key === 'dashboard' && currentView === 'dashboard') ||
                  (item.key === 'profile' && currentView === 'profile') ||
                  (item.key === 'job-match' && currentView === 'job-matching') ||
                  (item.key === 'job-recommendations' && currentView === 'job-recommendations') ||
                  (item.key === 'ai-interview' && currentView === 'ai-interview') ||
                  (item.key === 'coding-interview' && currentView === 'coding-interview') ||

                  (item.key === 'interview-readiness' && currentView === 'interview-readiness') ||
                  (item.key === 'github' && currentView === 'github') ||
                  (item.key === 'interview-history' && currentView === 'analytics') ||
                  activeNav === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 border-0 transition-all ${
                      isActive ? 'fw-bold text-white shadow-xs' : 'text-secondary fw-medium'
                    }`}
                    style={{
                      fontSize: '0.84rem',
                      backgroundColor: isActive ? '#2563EB' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                      }
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-secondary'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="text-white opacity-75 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
