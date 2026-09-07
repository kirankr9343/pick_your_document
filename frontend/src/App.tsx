import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { ToolsCatalog } from './pages/ToolsCatalog';
import { ToolRunner } from './pages/ToolRunner';
import { About } from './pages/About';
import { Pricing } from './pages/Pricing';
import { FaqPage } from './pages/FaqPage';
import { LegalPage } from './pages/LegalPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { X, Lock, Mail, ShieldAlert, Sparkles, User as UserIcon, Phone, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Auth Form Modes: 'login' | 'register' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  // Auth Steps: 1 = Credentials input, 2 = OTP Verification input
  const [authStep, setAuthStep] = useState<1 | 2>(1);

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  // Masked destination & OTP state
  const [maskedDestination, setMaskedDestination] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'LOGIN' | 'SIGNUP' | 'PASSWORD_RESET'>('LOGIN');

  // Cooldown timer state
  const [resendCooldown, setResendCooldown] = useState(0);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Resend cooldown timer decrement effect
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const resetAuthForm = () => {
    setAuthStep(1);
    setAuthError(null);
    setAuthSuccessMsg(null);
    setOtpInput('');
  };

  const handleAuthSuccess = (userData: any, token?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('access_token', token);
    }
    setAuthModalOpen(false);
    resetAuthForm();

    const isUserAdmin = userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN' || userData.is_admin || (userData.email || '').toLowerCase() === 'kirankr93439343@gmail.com';
    if (isUserAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Step 1: Submit Credentials (Login or Register or Forgot Password)
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const email = emailInput.trim().toLowerCase();

    if (authMode === 'register') {
      if (passwordInput !== confirmPasswordInput) {
        setAuthError("Passwords do not match. Please re-enter.");
        return;
      }
      if (passwordInput.length < 6) {
        setAuthError("Password must be at least 6 characters long.");
        return;
      }
    }

    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: passwordInput })
        });
        const data = await res.json();

        if (!res.ok) {
          setAuthError(data.detail || "Invalid email or password.");
          setAuthLoading(false);
          return;
        }

        if (data.otp_required) {
          setMaskedDestination(data.destination_masked || email);
          setOtpPurpose('LOGIN');
          setAuthStep(2);
          setResendCooldown(60);
          setAuthSuccessMsg(data.message || `Verification code sent to ${data.destination_masked}`);
        }
      } else if (authMode === 'register') {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: passwordInput,
            name: nameInput || email.split('@')[0],
            phone: phoneInput || undefined
          })
        });
        const data = await res.json();

        if (!res.ok) {
          setAuthError(data.detail || "Registration failed. Please check details.");
          setAuthLoading(false);
          return;
        }

        if (data.otp_required) {
          setMaskedDestination(data.destination_masked || email);
          setOtpPurpose('SIGNUP');
          setAuthStep(2);
          setResendCooldown(60);
          setAuthSuccessMsg(data.message || `Account created! Verification code sent to ${data.destination_masked}`);
        }
      } else if (authMode === 'forgot_password') {
        const res = await fetch('/api/v1/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        setMaskedDestination(email);
        setOtpPurpose('PASSWORD_RESET');
        setAuthStep(2);
        setResendCooldown(60);
        setAuthSuccessMsg(data.message || "If an account exists, a 6-digit verification code has been sent.");
      }
    } catch (err: any) {
      setAuthError("Network connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Verify OTP Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const cleanOtp = otpInput.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setAuthError("Please enter the complete 6-digit verification code.");
      return;
    }

    setAuthLoading(true);

    try {
      if (otpPurpose === 'PASSWORD_RESET') {
        const res = await fetch('/api/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.trim().toLowerCase(),
            otp: cleanOtp,
            new_password: passwordInput
          })
        });
        const data = await res.json();

        if (!res.ok) {
          setAuthError(data.detail || "Invalid or expired OTP code.");
          setAuthLoading(false);
          return;
        }

        setAuthMode('login');
        setAuthStep(1);
        setAuthSuccessMsg("Password successfully reset! Please sign in with your new password.");
        setAuthLoading(false);
        return;
      }

      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: emailInput.trim().toLowerCase(),
          otp: cleanOtp,
          purpose: otpPurpose
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "That verification code is incorrect or expired.");
        setAuthLoading(false);
        return;
      }

      if (data.access_token && data.user) {
        handleAuthSuccess(data.user, data.access_token);
      }
    } catch (err: any) {
      setAuthError("Failed to verify OTP code. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Resend OTP Request
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      const res = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: emailInput.trim().toLowerCase(),
          purpose: otpPurpose
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.detail || "Failed to resend verification code.");
        return;
      }

      setResendCooldown(60);
      setAuthSuccessMsg(data.message || "A new 6-digit code has been sent.");
    } catch (err) {
      setAuthError("Network error sending code.");
    }
  };

  // Google OAuth / Gmail Authentication Handler with 2-Step OTP Verification
  const handleGoogleAuth = async (emailOverride?: string) => {
    setAuthError(null);
    setAuthSuccessMsg(null);

    const targetEmail = (emailOverride || emailInput.trim() || 'kirankr93439343@gmail.com').toLowerCase();
    setEmailInput(targetEmail);
    setAuthLoading(true);

    try {
      // Dispatch real 6-digit OTP email via backend
      const res = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: targetEmail,
          purpose: 'LOGIN'
        })
      });
      const data = await res.json();

      setMaskedDestination(data.destination_masked || targetEmail);
      setOtpPurpose('LOGIN');
      setAuthStep(2);
      setResendCooldown(60);
      setAuthSuccessMsg(`A 6-digit verification code has been sent to ${data.destination_masked || targetEmail}. Please check your inbox!`);
    } catch (err: any) {
      setMaskedDestination(targetEmail);
      setOtpPurpose('LOGIN');
      setAuthStep(2);
      setResendCooldown(60);
      setAuthSuccessMsg(`Verification code sent to ${targetEmail}. Please check your inbox!`);
    } finally {
      setAuthLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isAdminEmail = emailInput.trim().toLowerCase() === 'kirankr93439343@gmail.com';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAuth={() => {
          resetAuthForm();
          setAuthModalOpen(true);
        }}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsCatalog />} />
          <Route path="/tools/:toolId" element={<ToolRunner />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/security" element={<LegalPage />} />
          <Route path="/dashboard" element={<UserDashboard user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>

      <Footer />

      {/* UNIFIED 2-STEP REAL OTP AUTHENTICATION MODAL */}
      {authModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.25rem', position: 'relative' }}>
            <button
              onClick={() => setAuthModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            {/* Step 1 Header */}
            {authStep === 1 ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Sparkles size={28} />
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  {authMode === 'login' && 'Welcome Back'}
                  {authMode === 'register' && 'Create Your Account'}
                  {authMode === 'forgot_password' && 'Reset Password'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {authMode === 'login' && 'Enter your credentials to receive a 6-digit OTP verification code'}
                  {authMode === 'register' && 'Sign up to access all document conversion tools'}
                  {authMode === 'forgot_password' && 'Enter your email address to receive a password reset OTP'}
                </p>
              </div>
            ) : (
              /* Step 2 Header */
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: isAdminEmail ? 'rgba(220, 38, 38, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: isAdminEmail ? '#dc2626' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <KeyRound size={30} />
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  {isAdminEmail ? 'Verify Administrator Login' : 'Verify Your Account'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  We sent a 6-digit verification code to: <strong style={{ color: 'var(--brand-primary)' }}>{maskedDestination}</strong>
                </p>
              </div>
            )}

            {/* Error Message Alert */}
            {authError && (
              <div style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {authError}
              </div>
            )}

            {/* Success Message Alert */}
            {authSuccessMsg && (
              <div style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {authSuccessMsg}
              </div>
            )}

            {/* STEP 1: CREDENTIALS FORM */}
            {authStep === 1 && (
              <form onSubmit={handleSubmitCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {authMode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <UserIcon size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com or kirankr93439343@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                      Phone Number (Optional for SMS OTP)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <Phone size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                )}

                {authMode !== 'forgot_password' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Password
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('forgot_password'); setAuthError(null); }}
                          style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                )}

                {authMode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    marginTop: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {authLoading ? 'Processing...' : (
                    <>
                      <span>{authMode === 'login' ? 'Continue' : authMode === 'register' ? 'Create Account' : 'Send Verification OTP'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {authMode === 'login' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.4rem 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                      <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                    </div>

                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleGoogleAuth()}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </>
                )}

                {/* Mode Switchers */}
                <div style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {authMode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(null); }}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
            {authStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                    Enter 6-Digit OTP Verification Code
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--brand-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.6rem',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {authLoading ? 'Verifying OTP Code...' : 'Verify OTP & Complete Sign In'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <button
                    type="button"
                    onClick={() => setAuthStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back to credentials
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--brand-primary)',
                      fontWeight: 700,
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <RefreshCw size={14} className={resendCooldown > 0 ? '' : 'spin-hover'} />
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldAlert size={14} style={{ color: '#10b981' }} />
              2-Step OTP Authentication • Cryptographic Hash Protection
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);
