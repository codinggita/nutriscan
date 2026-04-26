import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, ArrowRight, X, ChevronRight, ShieldCheck, Flame, Candy, Milk, Activity, Wheat, Lightbulb, Salad } from 'lucide-react';

// ── Nutrition bar ─────────────────────────────────────────────────────────────
function NutriBar({ pct }) {
  const color = pct > 70 ? '#ef4444' : pct > 35 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ── Macro row inside popup ────────────────────────────────────────────────────
function MacroRow({ label, value, sub, pct, Icon }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} className="text-gray-400" /> {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
          {value} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{sub}</span>
        </span>
      </div>
      <NutriBar pct={pct} />
    </div>
  );
}

// ── Product Detail Popup ──────────────────────────────────────────────────────
function AlternativePopup({ alt, onClose }) {
  const p        = alt.per100g || {};
  const serving  = alt.serving_size_g || 100;
  const scale    = serving / 100;

  const sugar    = (p.sugar_g    || 0) * scale;
  const fat      = (p.fat_g     || 0) * scale;
  const sodium   = (p.sodium_mg || 0) * scale;
  const cal      = (p.calories_kcal || 0) * scale;
  const protein  = (p.protein_g || 0) * scale;
  const fiber    = (p.fiber_g   || 0) * scale;

  const sugarTsp  = (sugar / 4).toFixed(1);
  const fatTbsp   = (fat   / 14).toFixed(1);
  const sodiumDisplay = sodium > 9999 ? (sodium / 1000).toFixed(1) + 'g' : sodium.toFixed(0) + 'mg';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001,
        background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px',
        maxHeight: '88dvh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 22px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><X size={16} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {alt.image_url ? <img src={alt.image_url} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 14 }} /> : <div style={{ width: 60, height: 60, borderRadius: 14, background: '#ecfdf5', border: '2px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Salad size={32} /></div>}
          <div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Top Choice</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '4px 0 0' }}>{alt.name}</h2>
            {alt.brand && <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{alt.brand}</p>}
          </div>
        </div>

        {alt.why_better && (
          <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 22 }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: '#065f46', margin: 0 }}>{alt.why_better}</p>
          </div>
        )}

        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div className="flex items-center gap-2"><Flame size={16} className="text-orange-500" /><span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Calories</span></div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{cal.toFixed(0)} <span style={{ fontSize: 12, color: '#9ca3af' }}>kcal</span></span>
        </div>

        <MacroRow label="Sugar" Icon={Candy} value={`${sugarTsp} tsp`} sub={`(${sugar.toFixed(1)}g)`} pct={(sugar / 25) * 100} />
        <MacroRow label="Fat" Icon={Milk} value={`${fatTbsp} tbsp`} sub={`(${fat.toFixed(1)}g)`} pct={(fat / 65) * 100} />
        <MacroRow label="Sodium" Icon={Activity} value={sodiumDisplay} sub="max 2300mg" pct={(sodium / 2300) * 100} />

        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <Lightbulb size={16} className="text-emerald-500" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Healthier choice for your next run!</span>
        </div>
      </div>
    </>
  );
}

// ── Alternatives list ──────────────────────────────────────────────────────────
export default function Alternatives({ alternatives }) {
  const [selected, setSelected] = useState(null);
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="mt-8 mb-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Leaf size={20} className="text-emerald-600" /></div>
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Healthier Swaps</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Better for your health profile</p>
        </div>
      </div>

      <div className="space-y-4">
        {alternatives.map((alt, idx) => {
          const sugarTsp = (alt.per100g.sugar_g / 4).toFixed(1);
          return (
            <button key={idx} onClick={() => setSelected(alt)} className="group w-full bg-white border border-gray-100 rounded-2xl p-5 hover:border-emerald-300 transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-base leading-tight">{alt.name}</h4>
                  {alt.brand && <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">{alt.brand}</p>}
                </div>
                <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={11} fill="white" /><span className="text-[9px] font-black uppercase">Top Pick</span>
                </div>
              </div>
              <div className="flex gap-2 items-center bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                <ArrowRight size={14} className="text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-900 text-[11px] font-bold italic leading-relaxed">{alt.why_better}</p>
              </div>
            </button>
          );
        })}
      </div>
      {selected && <AlternativePopup alt={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
