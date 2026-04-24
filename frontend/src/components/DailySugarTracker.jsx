import React, { useEffect, useState, useRef } from 'react';

function CircleProgress({ value, max, color, size = 100 }) {
  const radius          = (size - 14) / 2;
  const circumference   = 2 * Math.PI * radius;
  const pct             = Math.min((value / max) * 100, 100);
  const strokeDashoffset= circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
    </svg>
  );
}

function MiniBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-gray-50 rounded-full overflow-hidden mt-2 border border-gray-100">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function DailySugarTracker({ summary }) {
  if (!summary) return null;

  const {
    totalSugar_g       = 0,
    totalFat_g         = 0,
    totalSodium_mg     = 0,
    totalCalories_kcal = 0,
    sugarTsp           = 0,
    scanCount          = 0,
    dailyLimits        = { sugar_g: 25, fat_g: 65, sodium_mg: 2300, calories_kcal: 2000 },
  } = summary;

  const sugarPct = (totalSugar_g / dailyLimits.sugar_g) * 100;
  const ringColor =
    sugarPct > 90 ? '#f43f5e' :
    sugarPct > 60 ? '#f59e0b' :
    sugarPct > 30 ? '#eab308' :
                    '#10b981';

  const secondaryStats = [
    { label: 'Fat',      value: totalFat_g,         max: dailyLimits.fat_g,         unit: 'g',    color: '#f59e0b' },
    { label: 'Sodium',   value: totalSodium_mg,      max: dailyLimits.sodium_mg,     unit: 'mg',   color: '#6366f1' },
    { label: 'Calories', value: totalCalories_kcal,  max: dailyLimits.calories_kcal, unit: 'kcal', color: '#ec4899' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50/90 to-indigo-50/90 backdrop-blur-lg border-2 border-gray-900 rounded-[2rem] p-6 md:p-8 mb-6 shadow-[0_6px_0_0_#111827] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#111827] transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient orb for extra glassmorphism feel */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      {/* Title row */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-gray-900 font-black text-base tracking-tight">Today's Intake</h3>
        <span className="text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg font-black tracking-widest uppercase">
          {scanCount} scan{scanCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sugar hero */}
      <div className="flex items-center gap-6 mb-7">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <CircleProgress value={totalSugar_g} max={dailyLimits.sugar_g} color={ringColor} />
          <div className="absolute text-center flex flex-col items-center">
            <p className="text-gray-900 font-black text-2xl leading-none tracking-tighter">{sugarTsp}</p>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-0.5">tsp</p>
          </div>
        </div>
        <div>
          <h4 className="text-gray-900 font-black text-xl leading-tight tracking-tight">
            {sugarTsp} Teaspoons
          </h4>
          <p className="text-gray-500 text-xs font-bold mt-1">
            Total sugar intake today
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ringColor }}></div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              Limit: {dailyLimits.sugar_g}g · {(sugarPct).toFixed(0)}% Used
            </p>
          </div>
        </div>
      </div>

      {/* Secondary nutrients */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 mt-2 border-t border-gray-200/50">
        {secondaryStats.map(({ label, value, max, unit, color }) => (
          <div key={label} className="border border-gray-200/80 bg-white/40 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{label}</p>
            <p className="text-gray-900 font-black text-sm mt-1">
              {value.toFixed(label === 'Sodium' ? 0 : 1)}<span className="text-gray-400 text-[10px] ml-0.5 font-bold uppercase">{unit}</span>
            </p>
            <MiniBar value={value} max={max} color={color} />
          </div>
        ))}
      </div>
    </div>
  );
}
