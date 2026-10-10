import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Sparkles, 
  Menu,
  LogIn,
  UserPlus,
  Coins
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onNavigateToProfile: () => void;
  onOpenSettings: () => void;
  onOpenMockTest: () => void;
  onSearch?: (query: string) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenCreditModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onNavigateToProfile,
  onOpenSettings,
  onOpenMockTest,
  onSearch,
  onOpenLogin,
  onOpenRegister,
  onOpenCreditModal,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const displayName = user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const fullName = user?.profile?.name || user?.email || 'User Profile';
  const targetRole = user?.profile?.targetRole || 'Software Candidate';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <header 
      className="bg-white border-bottom border-slate-200 px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between sticky-top z-3"
      style={{
        height: '64px',
        borderColor: '#E2E8F0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Left side: Mobile Toggle + Search Bar */}
      <div className="d-flex align-items-center gap-3 flex-grow-1 max-w-xl">
        {/* Mobile Hamburger */}
        <button
          className="btn btn-sm btn-light d-lg-none p-1.5 rounded-2 text-dark border"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="position-relative w-100 max-w-md">
          <Search 
            size={16} 
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" 
          />
          <input
            type="text"
            className="form-control rounded-pill ps-5 pe-3 py-1.5 text-sm"
            placeholder="Search for interviews, skills, jobs, or anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: '0.875rem',
              color: '#334155'
            }}
          />
        </form>
      </div>

      {/* Right side: Credits Pill + Notifications + (Login/Register buttons OR Profile Dropdown) */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        {/* Credits Balance Pill */}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              if (onOpenLogin) onOpenLogin();
            } else if (onOpenCreditModal) {
              onOpenCreditModal();
            }
          }}
          className="btn btn-sm d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-pill border shadow-xs"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
            color: '#B45309'
          }}
          title="Click to view Credit Wallet & Packages"
        >
          <Coins size={16} className="text-amber-500 flex-shrink-0" />
          <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
            {isAuthenticated ? (user?.credits ?? 100) : '—'}
          </span>
          <span className="text-secondary small d-none d-sm-inline" style={{ fontSize: '0.74rem' }}>
            Credits
          </span>
        </button>

        {/* Notification Bell */}
        <div className="position-relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="btn btn-link text-secondary p-2 rounded-circle hover-bg-light position-relative border-0"
            title="Notifications"
            style={{ color: '#64748B' }}
          >
            <Bell size={20} />
            <span 
              className="position-absolute badge rounded-pill bg-danger border border-white d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                fontSize: '0.62rem',
                top: '4px',
                right: '2px',
                width: '16px',
                height: '16px',
                padding: 0
              }}
            >
              3
            </span>
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div 
              className="position-absolute end-0 mt-2 card shadow-lg p-0 rounded-3 border z-3"
              style={{ width: '320px', borderColor: '#E2E8F0' }}
            >
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top-3">
                <span className="fw-semibold small text-dark">Notifications</span>
                <span className="badge bg-primary rounded-pill">3 New</span>
              </div>
              <div className="list-group list-group-flush small">
                <div className="list-group-item list-group-item-action py-2.5 px-3">
                  <div className="d-flex w-100 justify-content-between">
                    <strong className="text-dark">Technical Interview Assessed</strong>
                    <small className="text-muted">2d ago</small>
                  </div>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.78rem' }}>
                    Score: 82%. Strengths identified in React State Architecture.
                  </p>
                </div>
                <div className="list-group-item list-group-item-action py-2.5 px-3">
                  <div className="d-flex w-100 justify-content-between">
                    <strong className="text-dark">New High-Match Role</strong>
                    <small className="text-muted">3d ago</small>
                  </div>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.78rem' }}>
                    Frontend Developer at Razorpay matches 91% of your skills.
                  </p>
                </div>
                <div className="list-group-item list-group-item-action py-2.5 px-3">
                  <div className="d-flex w-100 justify-content-between">
                    <strong className="text-dark">Open-Source Bug Fix</strong>
                    <small className="text-muted">4d ago</small>
                  </div>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.78rem' }}>
                    React #29140 tagged Good First Issue matches your stack.
                  </p>
                </div>
              </div>
              <div className="p-2 text-center border-top bg-light rounded-bottom-3">
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="btn btn-link btn-sm text-decoration-none text-primary p-0"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conditional: Unauthenticated -> Show Login & Register Buttons */}
        {!isAuthenticated ? (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={onOpenLogin}
              className="btn btn-outline-primary btn-sm px-3 py-1.5 rounded-pill fw-medium d-flex align-items-center gap-1.5 shadow-xs"
            >
              <LogIn size={15} />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="btn btn-primary btn-sm px-3.5 py-1.5 rounded-pill fw-medium d-flex align-items-center gap-1.5 shadow-sm"
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>
        ) : (
          /* Authenticated -> Show Profile Dropdown */
          <div className="position-relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="btn p-1 d-flex align-items-center gap-2 border-0 bg-transparent text-dark rounded-pill hover-bg-light"
              style={{ cursor: 'pointer' }}
            >
              {/* User Avatar Graphic */}
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs overflow-hidden position-relative"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  fontSize: '0.85rem'
                }}
              >
                {user?.profile?.photoUrl ? (
                  <img
                    src={user.profile.photoUrl}
                    alt={fullName}
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span>{initials}</span>
              </div>

              {/* Name & Role */}
              <div className="text-start d-none d-sm-block lh-sm pe-1">
                <div className="fw-semibold text-dark small" style={{ fontSize: '0.84rem' }}>
                  {displayName}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                  {targetRole}
                </div>
              </div>
              <ChevronDown size={14} className="text-secondary ms-1" />
            </button>

            {/* User Profile Dropdown */}
            {isProfileOpen && (
              <div 
                className="position-absolute end-0 mt-2 card shadow-lg p-2 rounded-3 border z-3"
                style={{ width: '240px', borderColor: '#E2E8F0' }}
              >
                <div className="p-2 border-bottom mb-1">
                  <div className="fw-bold text-dark small">{fullName}</div>
                  <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
                    {user?.email}
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill mt-1" style={{ fontSize: '0.68rem' }}>
                    {targetRole}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigateToProfile();
                  }}
                  className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-2.5 rounded-2 small text-dark"
                >
                  <UserIcon size={16} className="text-secondary" />
                  <span>View & Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenMockTest();
                  }}
                  className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-2.5 rounded-2 small text-dark"
                >
                  <Sparkles size={16} className="text-primary" />
                  <span>Simulate Assessment</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-2.5 rounded-2 small text-dark"
                >
                  <Settings size={16} className="text-secondary" />
                  <span>Settings</span>
                </button>

                <div className="dropdown-divider my-1"></div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-2.5 rounded-2 small text-danger"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
