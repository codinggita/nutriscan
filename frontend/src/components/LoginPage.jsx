import React, { useState, useEffect } from 'react';
import { Salad, User, Baby, PersonStanding, Check, ArrowRight, Sparkles, ScanLine } from 'lucide-react';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') + '/api';

// ── BMI helpers ───────────────────────────────────────────────────────────────
function calcBMI(h, w) {
  if (!h || !w || h <= 0 || w <= 0) return null;
  const m = h / 100;
  return parseFloat((w / (m * m)).toFixed(1));
}
function bmiLabel(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { text: 'Underweight', bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' };
  if (bmi < 25)   return { text: 'Normal',      bg: '#ecfdf5', color: '#065f46', dot: '#10b981', showCheck: true };
  if (bmi < 30)   return { text: 'Overweight',   bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' };
  return           { text: 'Obese',              bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
}

// ── Reusable form field ───────────────────────────────────────────────────────
function Field({ id, label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="lp-field">
      <label htmlFor={id} className="lp-label">
        {label}
        {!required && <span className="lp-optional"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="lp-input"
      />
    </div>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
export default function LoginPage({ onAuth }) {
  const [mode,     setMode]     = useState('login');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [height,   setHeight]   = useState('');
  const [weight,   setWeight]   = useState('');
  const [ageGroup, setAgeGroup] = useState('adult');

  const bmi     = calcBMI(parseFloat(height), parseFloat(weight));
  const bmiInfo = bmiLabel(bmi);

  useEffect(() => { setError(''); setSuccess(''); }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    const endpoint = mode === 'login' ? '/user/login' : '/user/register';
    const body     = mode === 'login'
      ? { email, password }
      : { name, email, password, height: height || null, weight: weight || null, ageGroup };

    try {
      const res  = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setSuccess(mode === 'login'
          ? `Welcome back, ${data.user.name}!`
          : `Account created! Welcome, ${data.user.name}!`);
        localStorage.setItem('sf_token', data.token);
        localStorage.setItem('sf_user',  JSON.stringify(data.user));
        setTimeout(() => onAuth(data.token, data.user), 800);
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── Base ── */
        .lp-root {
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 32px 16px;
        }

        /* ── Subtle grid / dot pattern background ── */
        .lp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, #d1fae5 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.55;
          pointer-events: none;
        }

        /* ── Soft emerald glow blob (top-left) ── */
        .lp-blob {
          position: absolute;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          top: -160px; left: -160px;
          pointer-events: none;
          animation: blobFloat 10s ease-in-out infinite;
        }
        .lp-blob-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          bottom: -120px; right: -80px;
          animation-delay: -4s;
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(24px, -28px) scale(1.04); }
        }

        /* ── Card — matches app hero style ── */
        .lp-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 448px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          padding: 36px 32px 32px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @media (max-width: 480px) {
          .lp-card { padding: 28px 20px 24px; border-radius: 1.25rem; }
        }

        /* ── Logo ── */
        .lp-logo {
          display: flex; align-items: center; gap: 11px; margin-bottom: 26px;
        }
        .lp-logo-icon {
          width: 40px; height: 40px;
          background: #10b981;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }
        .lp-logo-name {
          font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1;
        }
        .lp-logo-name span { color: #10b981; }
        .lp-logo-powered {
          font-size: 10px; font-weight: 700; color: #9ca3af;
          letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px;
        }

        /* ── Mode toggle ── */
        .lp-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }
        .lp-toggle-btn {
          flex: 1; padding: 10px 0;
          border: none; background: transparent;
          color: #9ca3af;
          border-radius: 8px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s;
        }
        .lp-toggle-btn.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* ── Heading ── */
        .lp-heading {
          font-size: 24px; font-weight: 800; color: #111827;
          margin-bottom: 4px; letter-spacing: -0.5px; line-height: 1.25;
        }
        .lp-sub {
          font-size: 13px; color: #6b7280; font-weight: 500;
          margin-bottom: 22px; line-height: 1.5;
        }

        /* ── Form ── */
        .lp-form { display: flex; flex-direction: column; gap: 13px; }
        .lp-field { display: flex; flex-direction: column; gap: 5px; }
        .lp-label {
          font-size: 11px; font-weight: 700; color: #374151;
          letter-spacing: 0.8px; text-transform: uppercase;
        }
        .lp-optional { color: #9ca3af; font-weight: 500; text-transform: none; letter-spacing: 0; }
        .lp-input {
          width: 100%; padding: 11px 13px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #111827;
          font-size: 14px; font-family: inherit;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .lp-input::placeholder { color: #d1d5db; }
        .lp-input:focus {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }

        /* ── Two-column row ── */
        .lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── Divider ── */
        .lp-divider {
          display: flex; align-items: center; gap: 10px; margin: 2px 0;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #f3f4f6; }
        .lp-divider-text { font-size: 10px; color: #9ca3af; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }

        /* ── BMI preview card ── */
        .lp-bmi-card {
          border-radius: 8px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          animation: fadeSlideIn 0.25s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
        .lp-bmi-label {
          font-size: 10px; color: #9ca3af; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;
        }
        .lp-bmi-value { font-size: 20px; font-weight: 800; line-height: 1; }
        .lp-bmi-pill {
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 99px;
        }

        /* ── Age group buttons ── */
        .lp-age-row { display: flex; gap: 8px; }
        .lp-age-btn {
          flex: 1; padding: 9px 0;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
          font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s;
        }
        .lp-age-btn:hover { border-color: #d1d5db; background: #f3f4f6; }
        .lp-age-btn.active {
          border-color: #10b981;
          background: #10b981;
          color: #ffffff;
        }
        .lp-age-content {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* ── Submit button — matches app's CTA ── */
        .lp-submit {
          width: 100%; padding: 14px;
          background: #10b981;
          color: #ffffff;
          border: none; border-radius: 8px;
          font-size: 15px; font-weight: 800; font-family: inherit;
          cursor: pointer; margin-top: 4px;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .lp-submit:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }
        .lp-submit:active:not(:disabled) {
          transform: translateY(1px);
        }
        .lp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* ── Feedback ── */
        .lp-error, .lp-success {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px; font-weight: 600;
          text-align: center;
          animation: fadeSlideIn 0.25s ease;
        }
        .lp-error   { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }
        .lp-success { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; }

        /* ── Footer ── */
        .lp-footer {
          text-align: center; margin-top: 18px;
          font-size: 13px; color: #9ca3af; font-weight: 500;
        }
        .lp-footer button {
          background: none; border: none;
          color: #10b981; font-weight: 700;
          cursor: pointer; font-size: 13px; font-family: inherit;
        }
        .lp-footer button:hover { text-decoration: underline; }
      `}</style>

      <div className="lp-root">
        {/* Soft background blobs */}
        <div className="lp-blob" aria-hidden="true" />
        <div className="lp-blob lp-blob-2" aria-hidden="true" />

        <div className="lp-card">

          {/* ── Logo ── */}
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <ScanLine size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="lp-logo-name">NutriScan <span>AI</span></div>
              <div className="lp-logo-powered">INTELLIGENT HEALTH AI</div>
            </div>
          </div>

          {/* ── Mode toggle ── */}
          <div className="lp-toggle">
            <button
              id="toggle-login"
              type="button"
              className={`lp-toggle-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Log In
            </button>
            <button
              id="toggle-signup"
              type="button"
              className={`lp-toggle-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* ── Heading ── */}
          <h1 className="lp-heading flex items-center gap-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
            {mode === 'login' && <Sparkles size={20} className="text-emerald-500" />}
          </h1>
          <p className="lp-sub">
            {mode === 'login'
              ? 'Log in to get your personalised food risk analysis.'
              : 'Join to unlock AI-powered food intelligence tailored to you.'}
          </p>

          {/* ── Form ── */}
          <form className="lp-form" onSubmit={handleSubmit} noValidate>

            {mode === 'signup' && (
              <Field
                id="signup-name" label="Full Name" required
                value={name} onChange={setName} placeholder="Harshit Kumar"
              />
            )}

            <Field
              id="auth-email" label="Email" type="email" required
              value={email} onChange={setEmail} placeholder="you@example.com"
            />

            <Field
              id="auth-password" label="Password" type="password" required
              value={password} onChange={setPassword}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
            />

            {mode === 'signup' && (
              <>
                {/* Divider */}
                <div className="lp-divider">
                  <div className="lp-divider-line" />
                  <div className="lp-divider-text">HEALTH PROFILE (optional)</div>
                  <div className="lp-divider-line" />
                </div>

                {/* Height + Weight */}
                <div className="lp-row">
                  <Field
                    id="signup-height" label="Height" type="number"
                    value={height} onChange={setHeight} placeholder="cm  e.g. 175"
                  />
                  <Field
                    id="signup-weight" label="Weight" type="number"
                    value={weight} onChange={setWeight} placeholder="kg  e.g. 70"
                  />
                </div>

                {/* Live BMI preview */}
                {bmi && bmiInfo && (
                  <div className="lp-bmi-card">
                    <div>
                      <div className="lp-bmi-label">Your BMI</div>
                      <div className="lp-bmi-value" style={{ color: bmiInfo.color }}>{bmi}</div>
                    </div>
                    <span
                      className="lp-bmi-pill flex items-center gap-1.5"
                      style={{ background: bmiInfo.bg, color: bmiInfo.color }}
                    >
                      {bmiInfo.showCheck && <Check size={12} strokeWidth={3} />}
                      {bmiInfo.text}
                    </span>
                  </div>
                )}

                {/* Age group */}
                <div className="lp-field">
                  <label className="lp-label">Age Group</label>
                  <div className="lp-age-row">
                    {[
                      { id: 'child',  label: 'Child',  Icon: Baby           },
                      { id: 'adult',  label: 'Adult',  Icon: PersonStanding },
                      { id: 'senior', label: 'Senior', Icon: User           },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        id={`age-${g.id}`}
                        className={`lp-age-btn ${ageGroup === g.id ? 'active' : ''}`}
                        onClick={() => setAgeGroup(g.id)}
                      >
                        <div className="lp-age-content">
                          <g.Icon size={14} strokeWidth={ageGroup === g.id ? 3 : 2} />
                          <span>{g.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Feedback */}
            {error   && <div className="lp-error"   role="alert">{error}</div>}
            {success && <div className="lp-success" role="status">{success}</div>}

            <button
              id="auth-submit"
              type="submit"
              className="lp-submit flex items-center justify-center gap-2"
              disabled={loading || !!success}
            >
              {loading
                ? (mode === 'login' ? 'Logging in…' : 'Creating account…')
                : (
                  <>
                    <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
            </button>
          </form>

          {/* Footer */}
          <div className="lp-footer">
            {mode === 'login'
              ? <>Don't have an account? <button onClick={() => setMode('signup')}>Sign Up</button></>
              : <>Already have an account? <button onClick={() => setMode('login')}>Log In</button></>}
          </div>

        </div>
      </div>
    </>
  );
}
