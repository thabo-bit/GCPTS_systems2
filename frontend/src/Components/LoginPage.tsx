// src/Components/LoginPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  PartyPopper,
  Sparkles,
  Lock,
} from 'lucide-react';
import './LoginPage.css';
import UserIcon from '../assets/circle-user-solid-full.svg';
import PasswordIcon from '../assets/password.png';
import { useAuth } from '../AuthContext';

type ResetStep = 'idle' | 'verifying' | 'password' | 'updating' | 'success';
type StepMode = 'code' | 'password';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Popup state
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  // Reset flow
  const [resetStep, setResetStep] = useState<ResetStep>('idle');
  const [stepMode, setStepMode] = useState<StepMode>('code');
  const [resetDigits, setResetDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetError, setResetError] = useState('');

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resetCode = resetDigits.join('');

  useEffect(() => {
    if (resetStep === 'password' && stepMode === 'code') {
      setTimeout(() => digitRefs.current[0]?.focus(), 150);
    }
  }, [resetStep, stepMode]);

  // ═══ LOGIN ═══
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || 'Invalid email or password.');
        } catch {
          throw new Error(responseText || 'Invalid email or password.');
        }
      }

      const data = responseText ? JSON.parse(responseText) : {};
      login({
        id: data.id,
        email: data.email || email,
        fullName: data.fullName || 'User',
        userType: data.userType || 'user',
        token: data.token,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email || email);
      localStorage.setItem('fullName', data.fullName || 'User');
      localStorage.setItem('userType', data.userType || 'user');
      if (data.id != null) localStorage.setItem('userId', String(data.id));

      navigate(data.userType === 'admin' ? '/Admin' : '/Dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // ═══ FORGOT PASSWORD ═══
  const handleForgotPassword = async () => {
    if (!email || !email.trim()) {
      setPopup({ type: 'error', message: 'Please type your email in the box above first.' });
      return;
    }

    setSending(true);
    setPopup(null);
    setResetDigits(['', '', '', '', '', '']);
    setNewPass('');
    setConfirmPass('');
    setResetError('');
    setStepMode('code');

    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      setResetStep('password');
    } catch (err: any) {
      setPopup({ type: 'error', message: err.message || 'Failed to send code.' });
    } finally {
      setSending(false);
    }
  };

  // ═══ Digit input handlers ═══
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...resetDigits];
      next[index] = '';
      setResetDigits(next);
      return;
    }

    const next = [...resetDigits];

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) next[i] = digits[i] || '';
      setResetDigits(next);
      const lastFilled = Math.min(digits.length, 5);
      digitRefs.current[lastFilled]?.focus();
      return;
    }

    next[index] = cleaned;
    setResetDigits(next);

    if (index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !resetDigits[index] && index > 0) {
      const next = [...resetDigits];
      next[index - 1] = '';
      setResetDigits(next);
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter' && resetDigits.every((d) => d)) {
      handleVerifyCode();
    }
  };

  // ═══ VERIFY CODE ═══
  const handleVerifyCode = async () => {
    setResetError('');
    if (resetCode.length !== 6) {
      setResetError('Please enter all 6 digits.');
      return;
    }

    setResetStep('verifying');

    const requestPromise = fetch('http://localhost:8080/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), code: resetCode.trim() }),
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .catch(() => ({ ok: false, data: { message: 'Network error.' } }));

    const minDelay = new Promise((r) => setTimeout(r, 4000));
    const [result] = await Promise.all([requestPromise, minDelay]);

    if (!result.ok) {
      setResetError(result.data.message || 'Invalid code.');
      setResetStep('password');
      setStepMode('code');
      return;
    }

    setStepMode('password');
    setResetStep('password');
  };

  // ═══ RESET PASSWORD ═══
  const handleResetPassword = async () => {
    setResetError('');

    if (newPass.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetStep('updating');

    const requestPromise = fetch('http://localhost:8080/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        code: resetCode.trim(),
        newPassword: newPass,
      }),
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .catch(() => ({ ok: false, data: { message: 'Network error.' } }));

    const minDelay = new Promise((r) => setTimeout(r, 2000));
    const [result] = await Promise.all([requestPromise, minDelay]);

    if (!result.ok) {
      setResetError(result.data.message || 'Reset failed.');
      setResetStep('password');
      return;
    }

    setResetStep('success');
    setTimeout(() => {
      closeReset();
      setPassword('');
    }, 3200);
  };

  const closeReset = () => {
    setResetStep('idle');
    setResetDigits(['', '', '', '', '', '']);
    setNewPass('');
    setConfirmPass('');
    setResetError('');
    setStepMode('code');
  };

  return (
    <div className="login-screen">
      <div className="login-card-container">
        <div className="login-left-pane">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>

          <div className="welcome-content">
            <h1>WELCOME</h1>
            <h2>GCPTS TRANSPARENCY PORTAL</h2>
            <p>
              Tracking every public development project with complete transparency.
              Sign in to manage projects, verify community reports, and monitor budgets.
            </p>
          </div>
        </div>

        <div className="login-right-pane">
          <div className="form-header">
            <h2>Sign in</h2>
            <p>Enter your details to access your account</p>
          </div>

          {error && (
            <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <img className="input-icon" src={UserIcon} alt="User Icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <img className="input-icon" src={PasswordIcon} alt="Password Icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div className="form-meta-row">
              <label className="remember-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span
                onClick={sending ? undefined : handleForgotPassword}
                className="forgot-link"
                style={{ cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.6 : 1 }}
              >
                {sending ? 'Sending…' : 'Forgot Password?'}
              </span>
            </div>

            <button type="submit" className="primary-signin-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="divider-container"><span>Or</span></div>

          <button type="button" className="secondary-signin-btn">Sign in with other</button>

          <p className="signup-prompt">
            Don't have an account?{' '}
            <span onClick={() => navigate('/Register')} className="signup-link">Sign Up</span>
          </p>
        </div>
      </div>

      {/* ═══════════════ RESET MODAL ═══════════════ */}
      {resetStep !== 'idle' && (
        <div className="reset-modal-backdrop">
          <div className="reset-modal">
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

              .reset-modal-backdrop {
                position: fixed; inset: 0;
                background: rgba(15, 23, 42, 0.35);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000; padding: 20px;
                animation: rmbFadeIn 0.35s ease-out;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
              }

              .reset-modal {
                background: #ffffff;
                border-radius: 24px;
                padding: 40px 36px;
                max-width: 480px;
                width: 100%;
                box-shadow:
                  0 24px 60px -12px rgba(15, 23, 42, 0.18),
                  0 0 0 1px rgba(15, 23, 42, 0.04);
                animation: rmbModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
              }

              .reset-modal::before {
                content: '';
                position: absolute; top: 0; left: 0; right: 0; height: 4px;
                background: linear-gradient(90deg, #a7f3d0, #6ee7b7, #a7f3d0);
                background-size: 200% 100%;
                animation: rmbShimmer 3s linear infinite;
              }

              .rmb-title {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: #1e293b;
                letter-spacing: -0.3px;
                text-align: center;
              }

              .rmb-subtitle {
                color: #64748b;
                font-size: 14px;
                margin: 8px 0 32px;
                line-height: 1.6;
                font-weight: 400;
                text-align: center;
              }
              .rmb-subtitle b { color: #059669; font-weight: 600; }

              .rmb-code-row {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-bottom: 24px;
              }

              .rmb-digit-box {
                width: 56px;
                height: 68px;
                border-radius: 14px;
                border: 2px solid #e2e8f0;
                background: #f8fafc;
                color: #1e293b;
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 28px;
                font-weight: 700;
                text-align: center;
                outline: none;
                transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
                caret-color: #10b981;
                box-sizing: border-box;
              }
              .rmb-digit-box::placeholder {
                color: #cbd5e1;
                font-weight: 400;
                font-size: 22px;
              }
              .rmb-digit-box:hover:not(:disabled) { border-color: #cbd5e1; }
              .rmb-digit-box:focus {
                border-color: #34d399;
                background: #ffffff;
                box-shadow: 0 0 0 4px rgba(167, 243, 208, 0.5);
                transform: translateY(-2px);
              }
              .rmb-digit-box:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }

              .rmb-digit-box.waving {
                border-color: #34d399;
                background: #ffffff;
                box-shadow: 0 0 0 4px rgba(167, 243, 208, 0.4);
                animation: rmbDigitWave 1.4s ease-in-out infinite;
              }
              .rmb-digit-box.waving:nth-child(1) { animation-delay: 0s;    }
              .rmb-digit-box.waving:nth-child(2) { animation-delay: 0.12s; }
              .rmb-digit-box.waving:nth-child(3) { animation-delay: 0.24s; }
              .rmb-digit-box.waving:nth-child(4) { animation-delay: 0.36s; }
              .rmb-digit-box.waving:nth-child(5) { animation-delay: 0.48s; }
              .rmb-digit-box.waving:nth-child(6) { animation-delay: 0.6s;  }

              @keyframes rmbDigitWave {
                0%, 100% { transform: translateY(0);     border-color: #a7f3d0; background: #f8fafc; }
                50%      { transform: translateY(-16px); border-color: #34d399; background: #ecfdf5; }
              }

              .rmb-verify-text {
                color: #64748b;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.2px;
                text-align: center;
                margin-top: 8px;
              }

              .rmb-label {
                display: block;
                font-size: 12.5px;
                font-weight: 600;
                color: #475569;
                margin: 0 0 8px 4px;
                letter-spacing: 0.2px;
              }

              .rmb-input {
                width: 100%;
                padding: 14px 16px;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                background: #f8fafc;
                color: #1e293b;
                outline: none;
                font-size: 14px;
                font-family: 'Inter', system-ui, sans-serif;
                font-weight: 500;
                transition: all 0.25s ease;
                box-sizing: border-box;
              }
              .rmb-input::placeholder { color: #94a3b8; font-weight: 400; }
              .rmb-input:focus {
                border-color: #6ee7b7;
                background: #ffffff;
                box-shadow: 0 0 0 5px rgba(167, 243, 208, 0.35);
              }

              .rmb-btn-primary {
                flex: 2;
                padding: 14px 20px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
                color: #ffffff;
                font-family: 'Inter', system-ui, sans-serif;
                font-weight: 700;
                font-size: 14.5px;
                cursor: pointer;
                letter-spacing: 0.2px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.5);
              }
              .rmb-btn-primary:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 12px 28px -6px rgba(16, 185, 129, 0.65);
              }
              .rmb-btn-primary:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                box-shadow: none;
              }

              .rmb-btn-secondary {
                flex: 1;
                padding: 14px 20px;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                background: #ffffff;
                color: #64748b;
                font-family: 'Inter', system-ui, sans-serif;
                font-weight: 600;
                font-size: 14.5px;
                cursor: pointer;
                transition: all 0.2s ease;
              }
              .rmb-btn-secondary:hover {
                border-color: #cbd5e1;
                color: #334155;
                background: #f8fafc;
              }

              .rmb-error {
                color: #b91c1c;
                font-size: 13px;
                margin: 14px 0;
                padding: 12px 16px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 10px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: center;
              }

              .rmb-btn-row {
                display: flex;
                gap: 12px;
                margin-top: 12px;
              }

              .rmb-success {
                text-align: center;
                padding: 24px 8px;
                animation: rmbFadeIn 0.4s ease-out;
              }

              .rmb-success-icon {
                width: 92px;
                height: 92px;
                border-radius: 50%;
                background: linear-gradient(135deg, #a7f3d0 0%, #10b981 100%);
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                box-shadow: 0 16px 40px -8px rgba(16, 185, 129, 0.5);
                animation: rmbCheckPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                           rmbPulseRing 1.8s ease-out 0.4s infinite;
              }

              @keyframes rmbFadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes rmbModalIn {
                from { opacity: 0; transform: translateY(24px) scale(0.96); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes rmbShimmer {
                from { background-position: -200% 0; }
                to   { background-position: 200% 0; }
              }
              @keyframes rmbCheckPop {
                0%   { transform: scale(0);   }
                60%  { transform: scale(1.2); }
                100% { transform: scale(1);   }
              }
              @keyframes rmbPulseRing {
                0%   { box-shadow: 0 16px 40px -8px rgba(16, 185, 129, 0.5), 0 0 0 0 rgba(16, 185, 129, 0.5); }
                70%  { box-shadow: 0 16px 40px -8px rgba(16, 185, 129, 0.5), 0 0 0 26px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 16px 40px -8px rgba(16, 185, 129, 0.5), 0 0 0 0 rgba(16, 185, 129, 0); }
              }
            `}</style>

            {/* ═══ STEP 1: Enter code ═══ */}
            {resetStep === 'password' && stepMode === 'code' && (
              <>
                <h3 className="rmb-title">Enter verification code</h3>
                <p className="rmb-subtitle">
                  We sent a 6-digit code to <b>{email}</b>.<br />
                  It expires in 15 minutes.
                </p>

                <div className="rmb-code-row">
                  {resetDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { digitRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      placeholder="·"
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      onFocus={(e) => e.currentTarget.select()}
                      className="rmb-digit-box"
                    />
                  ))}
                </div>

                {resetError && (
                  <div className="rmb-error">
                    <AlertCircle size={18} />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="rmb-btn-row">
                  <button onClick={closeReset} className="rmb-btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={resetCode.length !== 6}
                    className="rmb-btn-primary"
                  >
                    <Sparkles size={16} />
                    Verify Code
                  </button>
                </div>
              </>
            )}

            {/* ═══ VERIFYING ═══ */}
            {resetStep === 'verifying' && (
              <>
                <h3 className="rmb-title">Verifying your code…</h3>
                <p className="rmb-subtitle" style={{ marginBottom: 24 }}>
                  Please wait a moment.
                </p>

                <div className="rmb-code-row" style={{ marginBottom: 24 }}>
                  {resetDigits.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      value={digit}
                      disabled
                      className="rmb-digit-box waving"
                      readOnly
                    />
                  ))}
                </div>

                <p className="rmb-verify-text">Verifying your code…</p>
              </>
            )}

            {/* ═══ STEP 2: New password ═══ */}
            {resetStep === 'password' && stepMode === 'password' && (
              <>
                <h3 className="rmb-title">Set a new password</h3>
                <p className="rmb-subtitle">
                  Choose a strong password of at least 8 characters.
                </p>

                <label className="rmb-label">New password</label>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="rmb-input"
                    style={{ paddingRight: 72 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', color: '#10b981',
                      fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {showNewPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                <label className="rmb-label">Confirm password</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="rmb-input"
                  style={{ marginBottom: 18 }}
                />

                {resetError && (
                  <div className="rmb-error">
                    <AlertCircle size={18} />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="rmb-btn-row">
                  <button onClick={closeReset} className="rmb-btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleResetPassword} className="rmb-btn-primary">
                    <Lock size={16} />
                    Update Password
                  </button>
                </div>
              </>
            )}

            {/* ═══ UPDATING ═══ */}
            {resetStep === 'updating' && (
              <>
                <h3 className="rmb-title">Updating your password…</h3>
                <p className="rmb-subtitle" style={{ marginBottom: 24 }}>
                  Almost there.
                </p>

                <div className="rmb-code-row" style={{ marginBottom: 24 }}>
                  {resetDigits.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      value={digit}
                      disabled
                      className="rmb-digit-box waving"
                      readOnly
                    />
                  ))}
                </div>

                <p className="rmb-verify-text">Updating your password…</p>
              </>
            )}

            {/* ═══ SUCCESS ═══ */}
            {resetStep === 'success' && (
              <div className="rmb-success">
                <div className="rmb-success-icon">
                  <PartyPopper size={44} strokeWidth={2.2} />
                </div>
                <h3 className="rmb-title" style={{ fontSize: 22, marginBottom: 8 }}>
                  Password Updated!
                </h3>
                <p className="rmb-subtitle" style={{ marginBottom: 0 }}>
                  You can now sign in with your new password.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Simple popup ═══ */}
      {popup && (
        <div
          onClick={() => setPopup(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10001, padding: 20,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '32px 28px',
              maxWidth: 400, width: '100%', textAlign: 'center',
              boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: popup.type === 'success'
                  ? 'linear-gradient(135deg, #a7f3d0, #10b981)'
                  : 'linear-gradient(135deg, #fecaca, #ef4444)',
                color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              {popup.type === 'success' ? (
                <CheckCircle2 size={38} strokeWidth={2.2} />
              ) : (
                <AlertCircle size={38} strokeWidth={2.2} />
              )}
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              {popup.type === 'success' ? 'Success' : 'Notice'}
            </h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
              {popup.message}
            </p>
            <button
              onClick={() => setPopup(null)}
              style={{
                padding: '12px 36px', border: 'none',
                borderRadius: 12,
                background: popup.type === 'success'
                  ? 'linear-gradient(135deg, #34d399, #10b981)'
                  : 'linear-gradient(135deg, #f87171, #ef4444)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
                fontSize: 14.5,
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}