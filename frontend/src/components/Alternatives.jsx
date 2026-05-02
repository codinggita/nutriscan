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

  // Clamp sodium for display (some entries have bad data)
  const sodiumDisplay = sodium > 9999 ? (sodium / 1000).toFixed(1) + 'g' : sodium.toFixed(0) + 'mg';

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(17,24,39,0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'altFadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px',
        maxHeight: '88dvh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        animation: 'altSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 22px' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 34, height: 34, borderRadius: '50%',
            border: '1.5px solid #e5e7eb',
            background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}
          id="alt-popup-close"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {alt.image_url ? (
            <img
              src={alt.image_url} alt={alt.name}
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 14, border: '1px solid #f3f4f6', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: '#ecfdf5', border: '2px solid #d1fae5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981', flexShrink: 0,
            }}>
              <Salad size={32} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <span style={{
                background: '#10b981', color: '#fff',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Sparkles size={9} fill="#fff" /> Healthier Pick
              </span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1.2, margin: 0 }}>{alt.name}</h2>
            {alt.brand && <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '3px 0 0' }}>{alt.brand}</p>}
          </div>
        </div>

        {/* Why better banner */}
        {alt.why_better && (
          <div style={{
            background: '#ecfdf5', border: '1.5px solid #a7f3d0',
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
            marginBottom: 22,
          }}>
            <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: '#065f46', lineHeight: 1.55, margin: 0 }}>{alt.why_better}</p>
          </div>
        )}

        {/* Per serving label */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Nutrition per {serving}g serving
        </p>

        {/* Calories pill */}
        <div style={{
          background: '#f9fafb', border: '1.5px solid #e5e7eb',
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 18,
        }}>
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Calories</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
            {cal.toFixed(0)} <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>kcal</span>
          </span>
        </div>

        {/* Macros */}
        <MacroRow label="Sugar"   Icon={Candy}    value={`${sugarTsp} tsp`}   sub={`(${sugar.toFixed(1)}g)`}   pct={(sugar / 25) * 100} />
        <MacroRow label="Fat"     Icon={Milk}     value={`${fatTbsp} tbsp`}   sub={`(${fat.toFixed(1)}g)`}     pct={(fat  / 65) * 100} />
        <MacroRow label="Sodium"  Icon={Activity} value={sodiumDisplay}        sub="daily limit 2300mg"          pct={Math.min((sodium / 2300) * 100, 100)} />
        <MacroRow label="Protein" Icon={Activity} value={`${protein.toFixed(1)}g`} sub="of 50g daily"           pct={(protein / 50) * 100} />
        <MacroRow label="Fiber"   Icon={Wheat}    value={`${fiber.toFixed(1)}g`}   sub="of 28g daily"           pct={(fiber  / 28) * 100} />

        {/* Closing nudge */}
        <div style={{
          background: '#f9fafb', border: '1px solid #f3f4f6',
          borderRadius: 12, padding: '12px 14px',
          display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
          marginTop: 10,
        }}>
          <Lightbulb size={16} className="text-emerald-500" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
            Swap this in your next grocery run for a healthier choice!
          </span>
        </div>
      </div>

      <style>{`
        @keyframes altFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes altSlideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
      `}</style>
    </>
  );
}

// ── Alternatives list ──────────────────────────────────────────────────────────
export default function Alternatives({ alternatives }) {
  const [selected, setSelected] = useState(null);

  if (!alternatives || alternatives.length === 0) return null;

  return (
    <>
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Leaf size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Healthy Swap Suggestions</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tap any card to see full details</p>
          </div>
        </div>

        <div className="space-y-4">
          {alternatives.map((alt, idx) => {
            const sugarTsp = (alt.per100g.sugar_g / 4).toFixed(1);
            const fatTbsp  = (alt.per100g.fat_g   / 14).toFixed(1);
            const sodium   = alt.per100g.sodium_mg || 0;
            const sodiumDisplay = sodium > 9999 ? (sodium / 1000).toFixed(1) + 'g' : sodium.toFixed(0) + 'mg';

            return (
              <button
                key={idx}
                id={`alt-card-${idx}`}
                onClick={() => setSelected(alt)}
                className="group w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 text-base group-hover:text-emerald-600 transition-colors leading-tight">{alt.name}</h4>
                    {alt.brand && <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">{alt.brand}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                    <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Sparkles size={11} fill="white" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Top Pick</span>
                    </div>
                    <div className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                      <ChevronRight size={13} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Sugar',  val: `${sugarTsp} tsp` },
                    { label: 'Fat',    val: `${fatTbsp} tbsp` },
                    { label: 'Sodium', val: sodiumDisplay },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 border border-gray-100/50 rounded-xl p-2.5 text-center">
                      <p className="text-gray-400 text-[9px] font-black uppercase mb-1 tracking-widest">{stat.label}</p>
                      <p className="text-gray-900 text-xs font-black">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 flex gap-3 items-start">
                  <ArrowRight size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-900 text-[11px] font-bold italic leading-relaxed">{alt.why_better}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      {selected && <AlternativePopup alt={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
