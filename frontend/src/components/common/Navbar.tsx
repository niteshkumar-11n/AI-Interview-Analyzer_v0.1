import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Sparkles, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Award, 
  CheckCircle2, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'profile';
  onNavigate: (view: 'dashboard' | 'profile') => void;
  onOpenMockTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenMockTest }) => {
  const { user, logout, quickDemoLogin } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2 px-3 sticky-top border-bottom border-secondary shadow-sm">
      <div className="container-fluid max-w-7xl">
        {/* Brand */}
        <button 
          className="navbar-brand d-flex align-items-center gap-2 border-0 bg-transparent text-white p-0"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="rounded-3 bg-primary p-2 d-flex align-items-center justify-content-center text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="text-start">
            <div className="fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
              SkillNexus <span className="text-primary fw-extrabold">AI</span>
              <span className="badge bg-primary bg-opacity-25 text-primary-emphasis border border-primary border-opacity-50 fs-xs py-1 px-2 rounded-pill">
                Phase 0 Foundation
              </span>
            </div>
          </div>
        </button>

        {/* Center Navigation */}
        <div className="d-flex align-items-center gap-2 my-2 my-lg-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${
              currentView === 'dashboard'
                ? 'btn-primary shadow-sm'
                : 'btn-outline-secondary text-light border-0'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="fw-medium">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${
              currentView === 'profile'
                ? 'btn-primary shadow-sm'
                : 'btn-outline-secondary text-light border-0'
            }`}
          >
            <User size={16} />
            <span className="fw-medium">User Profile</span>
          </button>

          <button
            onClick={onOpenMockTest}
            className="btn btn-sm btn-outline-info d-flex align-items-center gap-2 px-3 py-2 rounded-pill ms-1"
            title="Simulate a new mock interview to test readiness recalculation"
          >
            <Zap size={15} />
            <span>Mock Assessment</span>
          </button>
        </div>

        {/* Right Controls & Profile */}
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-none d-md-flex flex-column text-end cursor-pointer"
                onClick={() => onNavigate('profile')}
              >
                <div className="fw-bold text-white small d-flex align-items-center gap-1 justify-content-end">
                  {user.profile.name || user.email.split('@')[0]}
                  <CheckCircle2 size={13} className="text-success" />
                </div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  {user.profile.targetRole || 'Candidate'}
                </div>
              </div>

              <div 
                className="rounded-circle bg-primary bg-opacity-25 border border-primary text-primary fw-bold d-flex align-items-center justify-content-center cursor-pointer"
                style={{ width: '38px', height: '38px', fontSize: '0.875rem' }}
                onClick={() => onNavigate('profile')}
                title="View & Edit Profile"
              >
                {(user.profile.name || user.email)[0].toUpperCase()}
              </div>

              <button
                onClick={logout}
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-pill"
                title="Logout from session"
              >
                <LogOut size={15} />
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={quickDemoLogin}
                className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
              >
                <ShieldCheck size={16} />
                <span>Demo Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
