// Material UI
import React, { useState, useEffect } from 'react';
import { Button, Switch, TextField, CircularProgress } from '@mui/material';
import WeeklySugarChart from './WeeklySugarChart';
import {
  LogOut, Mail, ShieldCheck, Check,
  Edit3, X, Save, Scale, ArrowRight, User as UserIcon, Calendar, Info, Activity, HeartPulse, Stethoscope,
  Syringe, FlaskConical, Zap, AlertCircle, Baby, User, TrendingDown, CheckCircle, AlertTriangle, XCircle,
  Droplets, ChevronRight
} from 'lucide-react';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') + '/api';

const COMMON_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', Icon: Syringe },
  { id: 'hypertension', label: 'Hypertension', Icon: HeartPulse },
  { id: 'cholesterol', label: 'High Chol.', Icon: FlaskConical },
  { id: 'thyroid', label: 'Thyroid', Icon: Zap },
  { id: 'allergy', label: 'Allergies', Icon: AlertCircle },
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

function StatMini({ icon: Icon, label, val, unit, colorClass = "text-emerald-600", bgClass = "bg-emerald-50" }) {
  return (
    <div className={`flex-1 rounded-2xl p-4 flex flex-col justify-center ${bgClass}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${colorClass}`}>
        <Icon size={14} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-gray-900">{val}</span>
        {unit && <span className="text-xs font-bold text-gray-500">{unit}</span>}
      </div>
      <div className="w-full h-1 bg-black/5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-current ${colorClass.replace('text-', 'bg-')}`} />
      </div>
    </div>
  );
}

// ── Watermelon UI Component ───────────────────────────────────────────────────
// Watermelon UI is about sleek, beautifully animated Radix-like components.
const WatermelonCard = ({ children, title }) => (
  <div className="relative group overflow-hidden rounded-[2rem] border border-pink-200/40 bg-gradient-to-br from-pink-50/50 to-emerald-50/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
    {/* Animated background blobs */}
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-400/10 blur-3xl group-hover:bg-pink-400/20 transition-all duration-700"></div>
    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl group-hover:bg-emerald-400/20 transition-all duration-700"></div>
    <div className="relative z-10">
      {title && <h4 className="text-xs font-black uppercase tracking-widest text-pink-500/80 mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> {title}</h4>}
      {children}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage({ user, ageGroup, onAgeGroupChange, onLogout, onProfileUpdate, token }) {
  const [selectedAge, setSelectedAge] = useState(ageGroup);
  const [editing, setEditing] = useState(false);
  const [draftH, setDraftH] = useState(user?.height ? String(user.height) : '');
  const [draftW, setDraftW] = useState(user?.weight ? String(user.weight) : '');
  const [draftConditions, setDraftConditions] = useState(user?.conditions || []);
  const [draftName, setDraftName] = useState(user?.name || '');
  const [draftPassword, setDraftPassword] = useState('');
  const [showSafety, setShowSafety] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [weeklyData, setWeeklyData] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/history/weekly-summary`, {
          headers: { Authorization: `Bearer ${token}`, 'x-session-id': localStorage.getItem('sessionId') || 'anonymous' }
        });
        const data = await res.json();
        setWeeklyData(data);
      } catch (err) {
        console.error('Failed to fetch weekly data:', err);
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [token]);

  const displayBMI = editing ? calcBMI(parseFloat(draftH), parseFloat(draftW)) || user?.bmi : user?.bmi;
  const meta = bmiMeta(displayBMI);

  const handleAgeChange = (id) => {
    setSelectedAge(id);
    onAgeGroupChange(id);
  };

  const toggleCondition = (id) => {
    setDraftConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = async (updates = null) => {
    const isDirectUpdate = updates !== null;
    if (!isDirectUpdate) {
      setSaving(true);
      setSaveError('');
    }
    try {
      const payload = isDirectUpdate ? updates : {
        name: draftName,
        password: draftPassword || undefined,
        height: draftH ? parseFloat(draftH) : null,
        weight: draftW ? parseFloat(draftW) : null,
        conditions: draftConditions,
      };

      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      onProfileUpdate(data.token, data.user);
      if (!isDirectUpdate) setEditing(false);
    } catch (err) {
      if (!isDirectUpdate) setSaveError(err.message);
      else console.error('Failed to update preference:', err);
    } finally {
      if (!isDirectUpdate) setSaving(false);
    }
  };

  const handleToggleRisk = (e) => {
    const newVal = e.target.checked;
    handleSave({ autoFlagHighSugar: newVal });
  };

  const openEdit = () => {
    setDraftName(user?.name || '');
    setDraftPassword('');
    setDraftH(user?.height ? String(user.height) : '');
    setDraftW(user?.weight ? String(user.weight) : '');
    setDraftConditions(user?.conditions || []);
    setEditing(true);
  };

  const AGE_GROUPS = [
    { id: 'child', label: 'Child' },
    { id: 'adult', label: 'Adult' },
    { id: 'senior', label: 'Senior' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-6 px-4 md:px-8 font-sans bg-[#fbfbf9] min-h-[calc(100vh-80px)]">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-900 rounded-full flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-md relative flex-shrink-0">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">{user?.name}</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-widest w-fit">Gold Member</span>
          </div>
          <p className="text-xs md:text-sm font-medium text-gray-500">
            Member since 2024 • {user?.email}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* ── Left Column: Stats & Progress ── */}
        <div className="flex-1 bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full">
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={meta?.fill || '#10b981'} strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="50" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900 tracking-tighter" style={{ color: meta?.fill || '#111827' }}>
                  {displayBMI || '--'}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Health BMI</span>
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <StatMini icon={Scale} label="Weight" val={user?.weight||'--'} unit="kg" colorClass="text-emerald-700" bgClass="bg-emerald-50/70" />
              <StatMini icon={Activity} label="Height" val={user?.height||'--'} unit="cm" colorClass="text-amber-700" bgClass="bg-amber-50/70" />
            </div>
          </div>
        </div>

        {/* ── Right Column: Health Settings ── */}
        <div className="w-full lg:w-[380px]">
          <WatermelonCard title="AI Health Settings">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Profile Data</h3>
              <button onClick={openEdit} className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Edit3 size={16} />
              </button>
            </div>
            
            <div className="mb-8">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Age Group</p>
              <div className="flex bg-white/60 p-1 rounded-xl shadow-sm border border-gray-100">
                {AGE_GROUPS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleAgeChange(g.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedAge === g.id ? 'bg-white text-gray-900 shadow-md border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Medical History</p>
              <div className="flex flex-wrap gap-2">
                {user?.conditions?.map(c => {
                   const m = COMMON_CONDITIONS.find(cc => cc.id === c);
                   return (
                     <span key={c} className="px-3 py-1.5 bg-emerald-800 text-white rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        {m?.label || c}
                     </span>
                   )
                })}
                <button onClick={openEdit} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-[11px] font-bold hover:bg-gray-50 transition-colors">
                  + Add Tag
                </button>
              </div>
            </div>

            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Risk Thresholds</p>
               <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                   <AlertTriangle size={16} className="text-amber-500" /> Auto-Flag High Sugar
                 </div>
                 {/* Material UI Switch inside Watermelon UI Card */}
                 <Switch 
                   checked={!!user?.autoFlagHighSugar} 
                   onChange={handleToggleRisk} 
                   color="success" 
                 />
               </div>
            </div>
          </WatermelonCard>
        </div>
      </div>

      {/* ── Bottom Column: Account Management ── */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
         <div className="flex-1 w-full lg:max-w-2xl">
           <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 tracking-tight">Account Management</h3>
           
           <div className="space-y-1 w-full">
              <div onClick={openEdit} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Personal Details</p>
                    <p className="text-xs font-medium text-gray-500">Name, Birthday, and Gender</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50/50 opacity-60 rounded-2xl transition-colors cursor-not-allowed group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Communications</p>
                    <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-200 px-2 py-1 rounded-md">Locked</span>
              </div>

              <div onClick={() => setShowSafety(true)} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Privacy & Security</p>
                    <p className="text-xs font-medium text-gray-500">Safety terms and data permissions</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              </div>
           </div>
         </div>

         <div className="shrink-0 flex items-end justify-start lg:justify-end mt-4 lg:mt-0">
           {/* Material UI Button */}
           <Button 
             variant="outlined" 
             color="error" 
             startIcon={<LogOut size={16} />} 
             onClick={onLogout} 
             className="w-full lg:w-auto"
             sx={{ borderRadius: '12px', fontWeight: 'bold', textTransform: 'none', padding: '10px 24px' }}
           >
             Sign Out
           </Button>
         </div>
      </div>

      {/* ── MODAL: Health Edit ── */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Modify Health Profile</h3>
              <button onClick={() => setEditing(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 mb-8">
              {/* Profile Details */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Details</label>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  color="success"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  fullWidth
                  InputProps={{ sx: { borderRadius: '16px', fontWeight: 'bold', backgroundColor: '#f9fafb' } }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  variant="outlined"
                  color="success"
                  placeholder="Leave blank to keep current"
                  value={draftPassword}
                  onChange={e => setDraftPassword(e.target.value)}
                  fullWidth
                  InputProps={{ sx: { borderRadius: '16px', fontWeight: 'bold', backgroundColor: '#f9fafb' } }}
                />
              </div>

              <div className="lp-divider" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, letterSpacing: '1px', whiteSpace: 'nowrap' }}>HEALTH PROFILE</div>
                <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
              </div>

              {/* Health Stats */}
              <div className="grid grid-cols-2 gap-6">
                <TextField
                  label="Height (cm)"
                  type="number"
                  variant="outlined"
                  color="success"
                  value={draftH}
                  onChange={e => setDraftH(e.target.value)}
                  fullWidth
                  InputProps={{ sx: { borderRadius: '16px', fontWeight: 'bold', backgroundColor: '#f9fafb' } }}
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  variant="outlined"
                  color="success"
                  value={draftW}
                  onChange={e => setDraftW(e.target.value)}
                  fullWidth
                  InputProps={{ sx: { borderRadius: '16px', fontWeight: 'bold', backgroundColor: '#f9fafb' } }}
                />
              </div>

              {/* Health Conditions */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Medical History</label>
                <div className="flex flex-wrap gap-3">
                  {COMMON_CONDITIONS.map(c => {
                    const isSelected = draftConditions.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCondition(c.id)}
                        className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm
                                ${isSelected ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'}
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
                  Selecting these helps the AI flag ingredients that might be harmful to your specific condition.
                </p>
              </div>
            </div>

            {saveError && <p className="text-red-500 text-xs font-bold mb-6 text-center">{saveError}</p>}

            <div className="flex gap-4">
              <Button
                variant="outlined"
                onClick={() => setEditing(false)}
                sx={{ flex: 1, borderRadius: '16px', padding: '14px', fontWeight: 'bold', color: '#6b7280', borderColor: '#e5e7eb' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                color="success"
                sx={{ flex: 1, borderRadius: '16px', padding: '14px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Safety Terms ── */}
      {showSafety && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Privacy & Safety</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your security is our priority</p>
                </div>
              </div>
              <button onClick={() => setShowSafety(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
               <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" /> End-to-End Encryption
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Your personal health data, BMI records, and scan history are encrypted. We do not share your private health profile with any third-party advertisers.
                  </p>
               </div>

               <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" /> AI Safety Standards
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Our AI risk engine follows international dietary guidelines. However, NutriScan is an informational tool and should not replace professional medical advice.
                  </p>
               </div>

               <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" /> Data Ownership
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    You have complete control over your data. You can delete your scan history or your entire account at any time from the account management dashboard.
                  </p>
               </div>

               <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-bold leading-relaxed italic text-center">
                    "We built NutriScan to empower you with transparency, starting with how we handle your data."
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={() => setShowSafety(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                I Understand
              </button>
              <button 
                onClick={() => { setShowSafety(false); openEdit(); }}
                className="w-full py-3 bg-white text-gray-400 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:text-emerald-600 transition-all active:scale-95 border border-transparent hover:border-emerald-100"
              >
                Manage Security Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
