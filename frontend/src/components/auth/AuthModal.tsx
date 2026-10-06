import React, { useState, useEffect } from 'react';
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
  X,
  LogIn,
  UserPlus
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, loading: authLoading } = useAuth();

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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

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
      setSuccessMsg('Successfully signed in! Welcome back.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
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
      setSuccessMsg('Account registered successfully! Welcome to CareerCraft AI.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
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
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden bg-white">
          {/* Header */}
          <div className="modal-header border-bottom py-3 px-4 bg-slate-50 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                  {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                </h5>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  {mode === 'login' ? 'Sign in to access your interview profile' : mode === 'register' ? 'Register to store your profile & progress' : 'Enter your email to reset password'}
                </span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="d-flex border-bottom bg-light">
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages(); }}
                className={`btn flex-fill py-2.5 rounded-0 fw-semibold text-center border-0 small d-flex align-items-center justify-content-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-primary border-bottom border-primary border-2 shadow-none'
                    : 'text-secondary bg-light'
                }`}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages(); }}
                className={`btn flex-fill py-2.5 rounded-0 fw-semibold text-center border-0 small d-flex align-items-center justify-content-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-primary border-bottom border-primary border-2 shadow-none'
                    : 'text-secondary bg-light'
                }`}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="modal-body p-4">
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

            {/* 1. LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
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
                      placeholder="your.email@example.com"
                      className="form-control border-start-0 ps-0 text-sm"
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
                      style={{ fontSize: '0.78rem' }}
                    >
                      Forgot?
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
                      className="form-control border-start-0 border-end-0 ps-0 text-sm"
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
                  className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-4 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
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
                      className="form-control border-start-0 ps-0 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
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
                      className="form-control border-start-0 ps-0 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Target Career Role
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Briefcase size={16} />
                    </span>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="form-select border-start-0 ps-0 text-sm"
                    >
                      <option value="Full Stack Engineer">Full Stack Engineer</option>
                      <option value="Frontend Engineer">Frontend Engineer</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                      <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                      <option value="Associate Software Engineer">Associate Software Engineer</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Password (min. 6 characters)
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
                      className="form-control border-start-0 border-end-0 ps-0 text-sm"
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
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-semibold text-dark fs-6 d-flex align-items-center gap-1.5">
                    <KeyRound size={18} className="text-primary" />
                    <span>Reset Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); clearMessages(); }}
                    className="btn btn-sm btn-link text-decoration-none text-secondary p-0 small"
                  >
                    Back to Sign In
                  </button>
                </div>

                {resetStep === 'request' ? (
                  <form onSubmit={handleForgotPassword}>
                    <p className="small text-muted mb-3">
                      Enter your registered email address to generate a secure reset token.
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
                          placeholder="e.g. dev@example.com"
                          className="form-control border-start-0 ps-0"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                    >
                      {isSubmitting ? 'Generating...' : 'Generate Reset Token'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    {generatedDemoToken && (
                      <div className="p-2.5 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3 mb-3">
                        <div className="small fw-semibold text-info-emphasis d-flex align-items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Generated Reset Token</span>
                        </div>
                        <div className="font-monospace small text-truncate mt-1 text-dark bg-white p-1 rounded border">
                          {resetToken}
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
                      {isSubmitting ? 'Updating...' : 'Confirm New Password'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
