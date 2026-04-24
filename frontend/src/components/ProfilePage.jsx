import React, { useState } from 'react';
import {
  LogOut, Mail, ShieldCheck, Check,
  Edit3, X, Save, Scale, ArrowRight, User as UserIcon, Calendar, Info, Activity, HeartPulse, Stethoscope,
  Syringe, FlaskConical, Zap, AlertCircle, Baby, User, TrendingDown, CheckCircle, AlertTriangle, XCircle,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const COMMON_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', Icon: Syringe },
  { id: 'hypertension', label: 'Hypertension', Icon: HeartPulse },
  { id: 'cholesterol', label: 'High Cholesterol', Icon: FlaskConical },
  { id: 'thyroid', label: 'Thyroid', Icon: Zap },
  { id: 'allergy', label: 'Food Allergies', Icon: AlertCircle },
];

// ── BMI helpers ───────────────────────────────────────────────────────────────
function calcBMI(h, w) {
  if (!h || !w || h <= 0 || w <= 0) return null;
  const m = h / 100;
  return parseFloat((w / (m * m)).toFixed(1));
}

function bmiMeta(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { cat: 'Underweight', fill: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', Icon: TrendingDown, tip: 'Watching for low-calorie & high-sugar items.' };
  if (bmi < 25) return { cat: 'Normal', fill: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', Icon: CheckCircle, tip: 'Standard healthy thresholds applied. Great!' };
  if (bmi < 30) return { cat: 'Overweight', fill: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a', Icon: AlertTriangle, tip: 'Flagging high-sodium & saturated fats strictly.' };
  return { cat: 'Obese', fill: '#ef4444', bg: '#fef2f2', text: '#991b1b', border: '#fecaca', Icon: XCircle, tip: 'High-sugar & calorie-dense items strongly flagged.' };
}

// ── Components ───────────────────────────────────────────────────────────────

function BMIGauge({ bmi, meta }) {
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
  return (
    <div className="bg-white border-2 border-gray-900 rounded-[2rem] p-6 md:p-8 mb-8 transition-all hover:translate-y-[-2px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Health Index</p>
          <div className="flex items-center gap-4">
            <span className="text-6xl md:text-7xl font-black tracking-tighter" style={{ color: meta.fill }}>{bmi}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <meta.Icon size={20} style={{ color: meta.fill }} />
                <span className="text-lg font-black text-gray-900">{meta.cat}</span>
              </div>
              <p className="text-gray-500 text-xs font-bold leading-relaxed max-w-[200px]">{meta.tip}</p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto px-6 py-4 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Goal Range</p>
          <p className="text-xl font-black text-gray-900">18.5 – 24.9</p>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-visible">
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(to right, #3b82f6 0%, #10b981 28%, #f59e0b 60%, #ef4444 100%)' }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 rounded-full shadow-xl z-10 transition-all duration-700 ease-out"
            style={{ left: `${pct}%`, borderColor: meta.fill }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <div className="w-1 h-1 bg-gray-900 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-3 px-1">
          {['10', '18.5', '25', '30', '40'].map(n => (
            <span key={n} className="text-[10px] font-black text-gray-400">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value, sub, editAction }) {
  return (
    <div className="bg-white border-2 border-gray-900 rounded-3xl p-6 shadow-[0_4px_0_0_#111827] flex flex-col relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={48} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {sub && <span className="text-sm font-bold text-gray-400">{sub}</span>}
      </div>
      {editAction && (
        <button
          onClick={editAction}
          className="mt-4 self-start flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors"
        >
          <Edit3 size={14} /> Edit Data
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage({ user: propUser, ageGroup: propAgeGroup, onAgeGroupChange, onLogout, onProfileUpdate, token }) {
  // Static fallback if no props (for demo)
  const defaultUser = {
    name: 'Harshit Kumar',
    email: 'harshit@example.com',
    height: 175,
    weight: 70,
    bmi: 22.9,
    conditions: ['diabetes', 'allergy']
  };

  const user = propUser || defaultUser;
  const [selectedAge, setSelectedAge] = useState(propAgeGroup || 'adult');
  const [editing, setEditing] = useState(false);
  const [draftH, setDraftH] = useState(user?.height ? String(user.height) : '');
  const [draftW, setDraftW] = useState(user?.weight ? String(user.weight) : '');
  const [draftConditions, setDraftConditions] = useState(user?.conditions || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const displayBMI = editing ? calcBMI(parseFloat(draftH), parseFloat(draftW)) || user?.bmi : user?.bmi;
  const meta = bmiMeta(displayBMI);

  const handleAgeChange = (id) => {
    setSelectedAge(id);
    if (onAgeGroupChange) onAgeGroupChange(id);
  };

  const toggleCondition = (id) => {
    setDraftConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!token) {
      // Demo save
      setSaving(true);
      setTimeout(() => {
        setEditing(false);
        setSaving(false);
        alert('Demo: Profile updated locally!');
      }, 800);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          height: draftH ? parseFloat(draftH) : null,
          weight: draftW ? parseFloat(draftW) : null,
          conditions: draftConditions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      if (onProfileUpdate) onProfileUpdate(data.token, data.user);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setDraftH(user?.height ? String(user.height) : '');
    setDraftW(user?.weight ? String(user.weight) : '');
    setDraftConditions(user?.conditions || []);
    setEditing(true);
  };

  const AGE_GROUPS = [
    { id: 'child', Icon: Baby, label: 'Child', sub: 'Under 12' },
    { id: 'adult', Icon: User, label: 'Adult', sub: '12–59' },
    { id: 'senior', Icon: Activity, label: 'Senior', sub: '60+' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 animate-in">
      {/* ── Desktop Layout: Two Columns ── */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* LEFT COLUMN: Identity & Core Metrics */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">

          {/* Identity Card */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg rotate-3">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">{user?.name}</h2>
              <p className="text-gray-400 font-bold text-sm mb-6 flex items-center gap-2">
                <Mail size={14} className="text-emerald-500" /> {user?.email}
              </p>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <ShieldCheck className="text-emerald-400" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Member Status</p>
                  <p className="text-xs font-bold text-emerald-400">Verified Health Profile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <ProfileStat icon={Scale} label="Weight" value={user?.weight || '—'} sub="kg" editAction={openEdit} />
            <ProfileStat icon={Activity} label="Height" value={user?.height || '—'} sub="cm" editAction={openEdit} />
          </div>

          {/* Health Conditions Summary */}
          <div className="bg-white border-2 border-gray-900 rounded-[2rem] p-6 shadow-[0_4px_0_0_#111827]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical History</p>
              <button onClick={openEdit} className="text-emerald-600 hover:text-emerald-700">
                <Edit3 size={14} />
              </button>
            </div>
            {user?.conditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.conditions.map(c => {
                  const meta = COMMON_CONDITIONS.find(cc => cc.id === c);
                  return (
                    <span key={c} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-black text-gray-700 flex items-center gap-1.5">
                      {meta ? <meta.Icon size={14} className="text-gray-400" /> : <Stethoscope size={14} />}
                      {meta?.label || c}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-xs font-bold italic">No conditions reported.</p>
            )}
          </div>

          {/* Logout Sidebar */}
          <button
            onClick={onLogout}
            className="w-full py-3.5 rounded-2xl border-2 border-red-100 font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2.5 text-xs"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* RIGHT COLUMN: Analysis & Detailed Settings */}
        <div className="flex-1">

          {/* BMI Analysis */}
          {displayBMI && meta && <BMIGauge bmi={displayBMI} meta={meta} />}

          {/* Age Selection: Horizontal Laptop Style */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-900">
                <Calendar size={18} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Age Group Analysis</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AGE_GROUPS.map((g) => {
                const active = selectedAge === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => handleAgeChange(g.id)}
                    className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left group
                      ${active ? 'border-gray-900 bg-gray-900 text-white shadow-xl translate-y-[-4px]' : 'border-gray-100 bg-white hover:border-gray-300'}
                    `}
                  >
                    <g.Icon size={32} className={active ? 'text-emerald-400' : 'text-gray-400'} />
                    <div>
                      <p className={`font-black uppercase text-[11px] tracking-widest ${active ? 'text-emerald-400' : 'text-gray-400'}`}>{g.label}</p>
                      <p className={`font-bold text-sm ${active ? 'text-gray-300' : 'text-gray-900'}`}>{g.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-3">
              <Info size={16} className="text-emerald-600 mt-0.5" />
              <p className="text-emerald-800 text-xs font-bold leading-relaxed">
                Food risk thresholds are dynamically adjusted based on your selected age group to ensure maximum safety.
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 rounded-[2.5rem] p-8 border-2 border-gray-100">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Application Intelligence</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs">AI</div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Google Gemini AI</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model: 1.5 Flash</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">ACTIVE</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold"><ShieldCheck size={16} /></div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Secure Vault</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encryption: JWT RS256</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">STABLE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Health Edit ── */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg bg-white border-4 border-gray-900 rounded-[2.5rem] p-8 shadow-[0_12px_0_0_#111827] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Modify Health Profile</h3>
              <button onClick={() => setEditing(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 mb-8">
              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Height (cm)</label>
                  <input
                    type="number"
                    value={draftH}
                    onChange={e => setDraftH(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-xl"
                    placeholder="175"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={draftW}
                    onChange={e => setDraftW(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-xl"
                    placeholder="70"
                  />
                </div>
              </div>

              {/* Health Conditions */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Health Conditions</label>
                <div className="flex flex-wrap gap-3">
                  {COMMON_CONDITIONS.map(c => {
                    const isSelected = draftConditions.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCondition(c.id)}
                        className={`px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold text-sm
                                ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'}
                             `}
                      >
                        <c.Icon size={18} className={isSelected ? 'text-white' : 'text-gray-400'} />
                        {c.label}
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">
                  Selecting these will help the AI prioritize flagging ingredients that might be harmful to your specific condition.
                </p>
              </div>
            </div>

            {saveError && <p className="text-red-500 text-xs font-bold mb-6 text-center">{saveError}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-100 font-black text-gray-400 hover:bg-gray-50 transition-all uppercase text-xs tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-emerald-600 transition-all uppercase text-xs tracking-widest shadow-xl shadow-gray-200"
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
