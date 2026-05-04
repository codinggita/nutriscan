import React, { useState, useEffect } from 'react';
import { User, Baby, PersonStanding, Check, ArrowRight, ScanLine, ShieldCheck, BarChart3, Salad, Leaf, Star } from 'lucide-react';

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BACKEND_URL = baseUrl.replace(/\/+$/, '') + '/api';

function calcBMI(h, w) {
  if (!h || !w || h <= 0 || w <= 0) return null;
  const m = h / 100;
  return parseFloat((w / (m * m)).toFixed(1));
}
function bmiLabel(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { text: 'Underweight', bg: '#eff6ff', color: '#2563eb' };
  if (bmi < 25)   return { text: 'Normal',      bg: '#ecfdf5', color: '#065f46', showCheck: true };
  if (bmi < 30)   return { text: 'Overweight',  bg: '#fffbeb', color: '#92400e' };
  return           { text: 'Obese',             bg: '#fef2f2', color: '#991b1b' };
}

function Field({ id, label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="lp-field">
      <label htmlFor={id} className="lp-label">
        {label}
        {!required && <span className="lp-optional"> (optional)</span>}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off"
        className="lp-input"
      />
    </div>
  );
}

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100dvh; width: 100%;
          display: flex;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          background: #ffffff;
        }

        /* ═══ LEFT PANEL ═══ */
        .lp-left {
          display: none;
          position: relative;
          flex: 1.1;
          overflow: hidden;
          background: #052e16;
        }
        @media (min-width: 960px) { .lp-left { display: block; } }

        /* Hero image fills the panel */
        .lp-hero-img {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0.35;
          filter: saturate(1.2) brightness(0.8);
        }

        /* Gradient overlay on top of image */
        .lp-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(3, 28, 14, 0.90) 0%,
            rgba(5, 46, 22, 0.82) 35%,
            rgba(6, 60, 37, 0.75) 65%,
            rgba(3, 28, 14, 0.92) 100%
          );
        }

        /* Content on top of overlay */
        .lp-left-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 44px 44px;
        }

        /* Brand row */
        .lp-brand { display: flex; align-items: center; gap: 13px; }
        .lp-brand-icon {
          width: 46px; height: 46px;
          border-radius: 13px;
          overflow: hidden;
          background: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .lp-brand-icon img { width: 100%; height: 100%; object-fit: cover; }
        .lp-brand-name  { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
        .lp-brand-sub   { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.45); letter-spacing: 2px; text-transform: uppercase; }

        /* Main headline */
        .lp-headline-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 0 32px; }
        .lp-headline {
          font-size: clamp(30px, 3.2vw, 44px);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.13;
          letter-spacing: -1px;
          margin-bottom: 18px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
        .lp-headline em { font-style: normal; color: #6ee7b7; }
        .lp-tagline {
          font-size: 15px; font-weight: 500;
          color: rgba(255,255,255,0.82);
          line-height: 1.65;
          max-width: 360px;
          margin-bottom: 44px;
        }

        /* Floating stat chips */
        .lp-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 40px; }
        .lp-stat-chip {
          display: flex; align-items: center; gap: 9px;
          background: rgba(0,0,0,0.30);
          border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(10px);
          padding: 10px 16px;
          border-radius: 99px;
          transition: background 0.2s;
        }
        .lp-stat-chip:hover { background: rgba(0,0,0,0.45); }
        .lp-stat-chip-icon { font-size: 16px; }
        .lp-stat-chip-label { font-size: 12px; font-weight: 700; color: #ffffff; }

        /* Feature 2×2 cards */
        .lp-feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lp-feat {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 16px;
          padding: 16px 14px;
          backdrop-filter: blur(10px);
          transition: background 0.2s, transform 0.2s;
          cursor: default;
        }
        .lp-feat:hover { background: rgba(0,0,0,0.50); transform: translateY(-2px); }
        .lp-feat-ic {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 9px;
        }
        .lp-feat-t  { font-size: 13px; font-weight: 800; color: #ffffff; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        .lp-feat-d  { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.80); line-height: 1.45; }

        /* Bottom trust */
        .lp-trust {
          display: flex; align-items: center; gap: 10px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .lp-trust-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #34d399; flex-shrink: 0;
          box-shadow: 0 0 8px rgba(52,211,153,0.8);
          animation: lpBlink 2.2s ease-in-out infinite;
        }
        @keyframes lpBlink { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        .lp-trust-txt { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85); }

        /* ═══ RIGHT PANEL ═══ */
        .lp-right {
          flex: 0 0 auto;
          width: 100%;
          max-width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          background: #fff;
          overflow-y: auto;
        }
        @media (min-width: 960px) {
          .lp-right { width: 540px; max-width: 540px; flex-shrink: 0; border-left: 1px solid #f3f4f6; }
        }

        .lp-form-wrap { width: 100%; max-width: 460px; }

        /* Mobile logo */
        .lp-m-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        @media (min-width: 960px) { .lp-m-logo { display: none; } }
        .lp-m-logo-ic { width: 38px; height: 38px; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; }
        .lp-m-logo-ic img { width: 100%; height: 100%; object-fit: cover; }
        .lp-m-logo-name { font-size: 19px; font-weight: 900; color: #111827; letter-spacing: -0.4px; }
        .lp-m-logo-name span { color: #10b981; }

        /* Greeting */
        .lp-greeting { font-size: 27px; font-weight: 900; color: #0f172a; letter-spacing: -0.7px; line-height: 1.2; margin-bottom: 5px; }
        .lp-greeting-sub { font-size: 13.5px; color: #64748b; font-weight: 500; margin-bottom: 28px; line-height: 1.55; }

        /* Tab toggle */
        .lp-tabs {
          display: flex; background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 12px; padding: 4px; margin-bottom: 28px;
          gap: 4px;
        }
        .lp-tab {
          flex: 1; padding: 10px; border: none; background: transparent;
          border-radius: 9px; font-size: 13px; font-weight: 700;
          color: #94a3b8; cursor: pointer; font-family: inherit;
          transition: all 0.22s;
        }
        .lp-tab.active {
          background: #10b981; color: #fff;
          box-shadow: 0 2px 10px rgba(16,185,129,0.35);
        }

        /* Form */
        .lp-form { display: flex; flex-direction: column; gap: 14px; }
        .lp-field { display: flex; flex-direction: column; gap: 5px; }
        .lp-label { font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.7px; text-transform: uppercase; }
        .lp-optional { color: #94a3b8; font-weight: 500; text-transform: none; letter-spacing: 0; }
        .lp-input {
          width: 100%; padding: 12px 14px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; color: #0f172a;
          font-size: 14px; font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-input::placeholder { color: #cbd5e1; }
        .lp-input:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.10); }

        .lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .lp-div { display: flex; align-items: center; gap: 10px; margin: 2px 0; }
        .lp-div-line { flex: 1; height: 1px; background: #f1f5f9; }
        .lp-div-txt  { font-size: 10px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }

        /* BMI */
        .lp-bmi {
          border-radius: 10px; padding: 12px 14px;
          display: flex; align-items: center; justify-content: space-between;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          animation: lpSlide 0.25s ease;
        }
        @keyframes lpSlide { from{opacity:0;transform:translateY(-5px);} to{opacity:1;transform:none;} }
        .lp-bmi-lbl { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .lp-bmi-val { font-size: 21px; font-weight: 900; line-height: 1; }
        .lp-bmi-pill{ font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 99px; }

        /* Age */
        .lp-age-row { display: flex; gap: 8px; }
        .lp-age-btn {
          flex: 1; padding: 10px 0;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 9px; color: #64748b;
          font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.18s;
        }
        .lp-age-btn:hover { border-color: #cbd5e1; background: #f1f5f9; }
        .lp-age-btn.active { border-color: #10b981; background: #10b981; color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.25); }
        .lp-age-ic { display: flex; align-items: center; justify-content: center; gap: 6px; }

        /* Submit */
        .lp-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff; border: none; border-radius: 11px;
          font-size: 14px; font-weight: 800; font-family: inherit;
          cursor: pointer; margin-top: 4px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.5px; text-transform: uppercase;
          box-shadow: 0 4px 16px rgba(16,185,129,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .lp-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.4); }
        .lp-btn:active:not(:disabled){ transform: translateY(1px); box-shadow: 0 2px 8px rgba(16,185,129,0.25); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Feedback */
        .lp-err, .lp-ok {
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600; text-align: center;
          animation: lpSlide 0.25s ease;
        }
        .lp-err { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }
        .lp-ok  { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; }

        /* Footer */
        .lp-foot { text-align: center; margin-top: 20px; font-size: 13px; color: #94a3b8; font-weight: 500; }
        .lp-foot button { background: none; border: none; color: #10b981; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit; }
        .lp-foot button:hover { text-decoration: underline; }

        /* Spinner */
        .lp-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="lp-root">

        {/* ════ LEFT PANEL ════ */}
        <div className="lp-left">
          <img src="/login-hero.png" alt="" className="lp-hero-img" />
          <div className="lp-left-overlay" />
          <div className="lp-left-content">

            {/* Brand */}
            <div className="lp-brand">
              <div className="lp-brand-icon">
                <img src="/nutriscan-logo.png" alt="NutriScan" />
              </div>
              <div>
                <div className="lp-brand-name">NutriScan</div>
                <div className="lp-brand-sub">Smart Nutrition Scanner</div>
              </div>
            </div>

            {/* Headline + stats + features */}
            <div className="lp-headline-wrap">
              <h2 className="lp-headline">
                Know exactly<br />what's <em>in your food</em>.
              </h2>
              <p className="lp-tagline">
                Scan any barcode and get instant, personalised nutritional analysis and health risk alerts.
              </p>

              {/* Stat chips */}
              <div className="lp-stats">
                {[
                  { Icon: Salad,       label: 'Nutrition Breakdown', color: '#6ee7b7' },
                  { Icon: ShieldCheck, label: 'Risk Alerts',         color: '#93c5fd' },
                  { Icon: Leaf,        label: 'Healthy Swaps',       color: '#a5b4fc' },
                  { Icon: BarChart3,   label: 'History Tracking',    color: '#fcd34d' },
                ].map(c => (
                  <div className="lp-stat-chip" key={c.label}>
                    <c.Icon size={14} color={c.color} strokeWidth={2.5} />
                    <span className="lp-stat-chip-label">{c.label}</span>
                  </div>
                ))}
              </div>

              {/* 2×2 feature cards */}
              <div className="lp-feat-grid">
                {[
                  { ic: <ScanLine size={16} color="#6ee7b7" />,   bg: 'rgba(16,185,129,0.18)', t: 'Instant Scan',    d: 'Scan barcodes for real-time nutritional data' },
                  { ic: <ShieldCheck size={16} color="#93c5fd" />, bg: 'rgba(59,130,246,0.18)', t: 'Health Alerts',   d: 'Personalised warnings for your body type' },
                  { ic: <BarChart3 size={16} color="#fcd34d" />,   bg: 'rgba(245,158,11,0.18)', t: 'Daily Tracking',  d: 'Monitor calories and macros day by day' },
                  { ic: <Salad size={16} color="#c4b5fd" />,       bg: 'rgba(139,92,246,0.18)', t: 'Smart Swaps',     d: 'Find healthier alternatives instantly' },
                ].map(f => (
                  <div className="lp-feat" key={f.t}>
                    <div className="lp-feat-ic" style={{ background: f.bg }}>{f.ic}</div>
                    <div className="lp-feat-t">{f.t}</div>
                    <div className="lp-feat-d">{f.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badge */}
            <div className="lp-trust">
              <div className="lp-trust-dot" />
              <div className="lp-trust-txt">Your health data is private and never shared with third parties.</div>
            </div>

          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="lp-right">
          <div className="lp-form-wrap">

            {/* Mobile logo */}
            <div className="lp-m-logo">
              <div className="lp-m-logo-ic">
                <img src="/nutriscan-logo.png" alt="NutriScan" />
              </div>
              <div className="lp-m-logo-name">Nutri<span>Scan</span></div>
            </div>

            {/* Greeting */}
            <h1 className="lp-greeting">
              {mode === 'login' ? 'Welcome back 👋' : 'Get started today'}
            </h1>
            <p className="lp-greeting-sub">
              {mode === 'login'
                ? 'Log in to access your personalised food analysis.'
                : 'Create your free account and start scanning smarter.'}
            </p>

            {/* Tabs */}
            <div className="lp-tabs">
              <button id="toggle-login"  className={`lp-tab ${mode === 'login'  ? 'active' : ''}`} onClick={() => setMode('login')}>Log In</button>
              <button id="toggle-signup" className={`lp-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
            </div>

            {/* Form */}
            <form className="lp-form" onSubmit={handleSubmit} noValidate>

              {mode === 'signup' && (
                <Field id="signup-name" label="Full Name" required value={name} onChange={setName} placeholder="Harshit Kumar" />
              )}

              <Field id="auth-email"    label="Email"    type="email"    required value={email}    onChange={setEmail}    placeholder="you@example.com" />
              <Field id="auth-password" label="Password" type="password" required value={password} onChange={setPassword} placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} />

              {mode === 'signup' && (
                <>
                  <div className="lp-div">
                    <div className="lp-div-line" />
                    <div className="lp-div-txt">HEALTH PROFILE (optional)</div>
                    <div className="lp-div-line" />
                  </div>

                  <div className="lp-row">
                    <Field id="signup-height" label="Height" type="number" value={height} onChange={setHeight} placeholder="cm e.g. 175" />
                    <Field id="signup-weight" label="Weight" type="number" value={weight} onChange={setWeight} placeholder="kg e.g. 70" />
                  </div>

                  {bmi && bmiInfo && (
                    <div className="lp-bmi">
                      <div>
                        <div className="lp-bmi-lbl">Your BMI</div>
                        <div className="lp-bmi-val" style={{ color: bmiInfo.color }}>{bmi}</div>
                      </div>
                      <span className="lp-bmi-pill flex items-center gap-1.5" style={{ background: bmiInfo.bg, color: bmiInfo.color }}>
                        {bmiInfo.showCheck && <Check size={12} strokeWidth={3} />}
                        {bmiInfo.text}
                      </span>
                    </div>
                  )}

                  <div className="lp-field">
                    <label className="lp-label">Age Group</label>
                    <div className="lp-age-row">
                      {[
                        { id: 'child',  label: 'Child',  Icon: Baby           },
                        { id: 'adult',  label: 'Adult',  Icon: PersonStanding },
                        { id: 'senior', label: 'Senior', Icon: User           },
                      ].map(g => (
                        <button key={g.id} type="button" id={`age-${g.id}`}
                          className={`lp-age-btn ${ageGroup === g.id ? 'active' : ''}`}
                          onClick={() => setAgeGroup(g.id)}>
                          <div className="lp-age-ic">
                            <g.Icon size={14} strokeWidth={ageGroup === g.id ? 3 : 2} />
                            <span>{g.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error   && <div className="lp-err" role="alert">{error}</div>}
              {success && <div className="lp-ok"  role="status">{success}</div>}

              <button id="auth-submit" type="submit" className="lp-btn" disabled={loading || !!success}>
                {loading
                  ? <><div className="lp-spin" /><span>{mode === 'login' ? 'Logging in…' : 'Creating…'}</span></>
                  : <><span>{mode === 'login' ? 'Log In' : 'Create Account'}</span><ArrowRight size={18} strokeWidth={2.5} /></>
                }
              </button>
            </form>

            <div className="lp-foot">
              {mode === 'login'
                ? <>Don't have an account? <button onClick={() => setMode('signup')}>Sign Up</button></>
                : <>Already have an account? <button onClick={() => setMode('login')}>Log In</button></>}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
