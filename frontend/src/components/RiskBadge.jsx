import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const LEVEL_CONFIG = {
  HIGH: {
    wrapper:  'bg-rose-50 border-rose-100',
    icon:     <AlertTriangle size={24} className="text-rose-500" strokeWidth={2.5} />,
    pill:     'bg-rose-500 text-white',
    label:    'High Risk',
    textColor:'text-rose-900',
    descColor:'text-rose-600'
  },
  MODERATE: {
    wrapper:  'bg-amber-50 border-amber-100',
    icon:     <AlertCircle size={24} className="text-amber-500" strokeWidth={2.5} />,
    pill:     'bg-amber-500 text-white',
    label:    'Moderate Risk',
    textColor:'text-amber-900',
    descColor:'text-amber-600'
  },
  LOW: {
    wrapper:  'bg-emerald-50 border-emerald-100',
    icon:     <CheckCircle size={24} className="text-emerald-500" strokeWidth={2.5} />,
    pill:     'bg-emerald-500 text-white',
    label:    'Low Risk',
    textColor:'text-emerald-900',
    descColor:'text-emerald-600'
  },
};

export default function RiskBadge({ level, label }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.LOW;

  return (
    <div className={`border rounded-2xl p-5 mb-5 flex items-center gap-4 ${cfg.wrapper} transition-all duration-300`}>
      <div className="flex-shrink-0">{cfg.icon}</div>
      <div className="flex-1">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${cfg.pill}`}>
          {cfg.label.split(' ')[1]}
        </span>
        <h4 className={`text-sm font-black mt-2 leading-tight ${cfg.textColor}`}>
          {level} Alert
        </h4>
        {label && (
          <p className={`text-xs font-bold mt-1.5 leading-snug opacity-80 ${cfg.textColor}`}>
            {label}
          </p>
        )}
      </div>
      <p className="text-gray-400 text-[10px] font-bold text-right leading-tight max-w-[80px] uppercase tracking-tighter opacity-50">
        Nutritional Data Only
      </p>
    </div>
  );
}
