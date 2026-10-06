import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Briefcase, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, quickDemoLogin, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');

  // Forgot / Reset password states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [generatedDemoToken, setGeneratedDemoToken] = useState<string | null>(null);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      setSuccessMsg('Authentication successful! Loading your dashboard...');
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password, targetRole });
      setSuccessMsg('Account registered successfully! Welcome to SkillNexus AI.');
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const res = await api.auth.forgotPassword(email);
      setSuccessMsg(res.message);
      if (res.resetToken) {
        setGeneratedDemoToken(res.resetToken);
        setResetToken(res.resetToken);
        setResetStep('reset');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const res = await api.auth.resetPassword({ token: resetToken, newPassword });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        setResetStep('request');
        setGeneratedDemoToken(null);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAndSignIn = async () => {
    clearMessages();
    setIsSubmitting(true);
    try {
      await quickDemoLogin();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg('Failed demo login. Please try manual entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-slate-900 py-5 px-3">
      {/* Container Box */}
      <div className="w-100" style={{ maxWidth: '480px' }}>
        {/* Brand & Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary mb-3 shadow-sm">
            <Sparkles size={32} />
          </div>
          <h2 className="fw-bold text-white tracking-tight mb-1">
            SkillNexus <span className="text-primary">AI</span>
          </h2>
          <p className="text-secondary small mb-0">
            Phase 0 — Platform Foundation & Career Readiness Engine
          </p>
        </div>

        {/* Quick Demo Access Callout */}
        <div className="card bg-dark border-primary border-opacity-50 text-white mb-3 shadow">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-circle bg-primary text-white">
                <Zap size={16} />
              </div>
              <div>
                <div className="fw-semibold small">Instant Reviewer Access</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Pre-configured with candidate profile & mock scores
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoAndSignIn}
              disabled={isSubmitting || authLoading}
              className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-medium d-flex align-items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck size={15} />
              <span>1-Click Sign In</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="card shadow-lg border-0 bg-white rounded-4 overflow-hidden">
          {/* Header Switcher */}
          {mode !== 'forgot' && (
            <div className="d-flex border-bottom bg-light">
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages(); }}
                className={`btn flex-fill py-3 rounded-0 fw-semibold text-center border-0 ${
                  mode === 'login'
                    ? 'bg-white text-primary border-bottom border-primary border-3 shadow-none'
                    : 'text-secondary bg-light'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages(); }}
                className={`btn flex-fill py-3 rounded-0 fw-semibold text-center border-0 ${
                  mode === 'register'
                    ? 'bg-white text-primary border-bottom border-primary border-3 shadow-none'
                    : 'text-secondary bg-light'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="card-body p-4">
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{errorMsg}</div>
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                <CheckCircle2 size={16} className="flex-shrink-0 text-success" />
                <div>{successMsg}</div>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. dev@skillnexus.ai"
                      className="form-control border-start-0 ps-0"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-secondary mb-0">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); clearMessages(); }}
                      className="btn btn-link p-0 text-primary small text-decoration-none"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-control border-start-0 border-end-0 ps-0"
                    />
                    <button
                      type="button"
                      className="btn btn-light border border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      defaultChecked
                    />
                    <label className="form-check-label small text-muted" htmlFor="rememberMe">
                      Stay authenticated (JWT)
                    </label>
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary border rounded-pill">
                    JWT Session
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <UserIcon size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Divyanshu Sharma"
                      className="form-control border-start-0 ps-0"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="form-control border-start-0 ps-0"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Target Role
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Briefcase size={16} />
                    </span>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="form-select border-start-0 ps-0"
                    >
                      <option value="Full Stack Engineer">Full Stack Engineer</option>
                      <option value="Frontend Engineer">Frontend Engineer</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                      <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                      <option value="Associate Software Engineer">Associate Software Engineer (Campus)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Choose Password (min. 6 characters)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-control border-start-0 border-end-0 ps-0"
                    />
                    <button
                      type="button"
                      className="btn btn-light border border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Creating Profile...</span>
                  ) : (
                    <>
                      <span>Register & Create Profile</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FLOW */}
            {mode === 'forgot' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-bold text-dark fs-5 d-flex align-items-center gap-2">
                    <KeyRound size={20} className="text-primary" />
                    <span>Reset Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); clearMessages(); }}
                    className="btn btn-sm btn-link text-decoration-none text-secondary"
                  >
                    Back to Sign In
                  </button>
                </div>

                {resetStep === 'request' ? (
                  <form onSubmit={handleForgotPassword}>
                    <p className="small text-muted mb-3">
                      Enter your registered email address. We will generate a secure password reset token to authenticate your update.
                    </p>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Registered Email
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. dev@skillnexus.ai"
                          className="form-control border-start-0 ps-0"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                    >
                      {isSubmitting ? 'Generating Token...' : 'Generate Reset Token'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    {generatedDemoToken && (
                      <div className="p-2.5 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3 mb-3">
                        <div className="small fw-semibold text-info-emphasis d-flex align-items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Generated Token (Demo Fast-Fill)</span>
                        </div>
                        <div className="font-monospace small text-truncate mt-1 text-dark bg-white p-1.5 rounded border">
                          {generatedDemoToken}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Reset Token
                      </label>
                      <input
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste reset token here"
                        className="form-control font-monospace"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        New Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-control"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-success w-100 py-2 rounded-3 fw-semibold"
                    >
                      {isSubmitting ? 'Resetting...' : 'Confirm New Password'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-light p-3 border-top text-center text-muted small">
            <span>SkillNexus AI Platform Foundation &bull; JWT Auth &bull; Protected APIs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
