import React, { useState, useEffect } from 'react';
import { Salad, User, Baby, PersonStanding, Check, ArrowRight, Sparkles, ScanLine } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

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

    const endpoint = mode === 'login' ? '/api/users/login' : '/api/users/register';
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

        /* ── Soft emerald glow blob ── */
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

        /* ── Card ── */
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
        .lp-input {
          width: 100%; padding: 11px 13px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #111827;
          font-size: 14px; font-family: inherit;
          outline: none;
        }
        .lp-input:focus {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }

        .lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .lp-bmi-card {
          border-radius: 8px; padding: 11px 14px;
          display: flex; align-items: center; justify-content: space-between;
          border: 1.5px solid #e5e7eb; background: #f9fafb;
        }
        .lp-bmi-label { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; }
        .lp-bmi-value { font-size: 20px; font-weight: 800; line-height: 1; }
        .lp-bmi-pill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }

        .lp-age-row { display: flex; gap: 8px; }
        .lp-age-btn {
          flex: 1; padding: 9px 0; background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 8px; color: #6b7280; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .lp-age-btn.active { border-color: #10b981; background: #10b981; color: #ffffff; }

        .lp-submit {
          width: 100%; padding: 14px; background: #10b981; color: #ffffff;
          border: none; border-radius: 8px; font-size: 15px; font-weight: 800;
          cursor: pointer; margin-top: 4px; transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .lp-submit:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
        .lp-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-error { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; padding: 10px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 600; }
        .lp-success { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; padding: 10px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 600; }

        .lp-footer { text-align: center; margin-top: 18px; font-size: 13px; color: #9ca3af; }
        .lp-footer button { background: none; border: none; color: #10b981; font-weight: 700; cursor: pointer; }
      `}</style>

      <div className="lp-root">
        <div className="lp-blob" />
        <div className="lp-blob lp-blob-2" />

        <div className="lp-card">
          <div className="lp-logo">
            <div className="lp-logo-icon"><ScanLine size={22} strokeWidth={2.5} /></div>
            <div className="lp-logo-name">NutriScan <span>AI</span></div>
          </div>

          <div className="lp-toggle">
            <button className={`lp-toggle-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log In</button>
            <button className={`lp-toggle-btn ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

          <h1 className="lp-heading flex items-center gap-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
            {mode === 'login' && <Sparkles size={20} className="text-emerald-500" />}
          </h1>
          <p className="lp-sub">
            {mode === 'login' ? 'Access your personalised food risk analysis.' : 'Join to unlock AI-powered food intelligence.'}
          </p>

          <form className="lp-form" onSubmit={handleSubmit}>
            {mode === 'signup' && <Field id="name" label="Full Name" required value={name} onChange={setName} placeholder="Harshit Kumar" />}
            <Field id="email" label="Email" type="email" required value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field id="password" label="Password" type="password" required value={password} onChange={setPassword} placeholder="••••••••" />

            {mode === 'signup' && (
              <>
                <div className="lp-row">
                  <Field id="height" label="Height (cm)" type="number" value={height} onChange={setHeight} placeholder="175" />
                  <Field id="weight" label="Weight (kg)" type="number" value={weight} onChange={setWeight} placeholder="70" />
                </div>
                {bmi && bmiInfo && (
                  <div className="lp-bmi-card">
                    <div><div className="lp-bmi-label">Your BMI</div><div className="lp-bmi-value" style={{ color: bmiInfo.color }}>{bmi}</div></div>
                    <span className="lp-bmi-pill" style={{ background: bmiInfo.bg, color: bmiInfo.color }}>{bmiInfo.text}</span>
                  </div>
                )}
                <div className="lp-field">
                  <label className="lp-label">Age Group</label>
                  <div className="lp-age-row">
                    {[
                      { id: 'child',  label: 'Child',  Icon: Baby },
                      { id: 'adult',  label: 'Adult',  Icon: PersonStanding },
                      { id: 'senior', label: 'Senior', Icon: User },
                    ].map(g => (
                      <button key={g.id} type="button" className={`lp-age-btn ${ageGroup === g.id ? 'active' : ''}`} onClick={() => setAgeGroup(g.id)}>
                        <div className="flex items-center justify-center gap-2"><g.Icon size={14} />{g.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <div className="lp-error">{error}</div>}
            {success && <div className="lp-success">{success}</div>}

            <button type="submit" className="lp-submit flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
              {!loading && <ArrowRight size={18} strokeWidth={3} />}
            </button>
          </form>

          <div className="lp-footer">
            {mode === 'login' ? <>New here? <button onClick={() => setMode('signup')}>Sign Up</button></> : <>Member? <button onClick={() => setMode('login')}>Log In</button></>}
          </div>
        </div>
      </div>
    </>
  );
}
