import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const RISK_CONFIG = {
  HIGH:     { border: 'border-rose-100', bg: 'bg-rose-50', text: 'text-rose-500', badge: 'bg-rose-500 text-white', Icon: AlertTriangle },
  MODERATE: { border: 'border-amber-100', bg: 'bg-amber-50', text: 'text-amber-500', badge: 'bg-amber-500 text-white', Icon: AlertCircle   },
  LOW:      { border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-500', badge: 'bg-blue-500 text-white', Icon: Info          },
};

export default function IngredientWarnings({ warnings }) {
  const [expanded, setExpanded] = useState(false);

  if (!warnings || warnings.length === 0) return null;

  const ORDER = { HIGH: 0, MODERATE: 1, LOW: 2 };
  const sorted = [...warnings].sort((a, b) => (ORDER[a.risk] ?? 1) - (ORDER[b.risk] ?? 1));

  const highCount     = sorted.filter(w => w.risk === 'HIGH').length;
  const visibleItems  = expanded ? sorted : sorted.slice(0, 2);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Ingredient Analysis
        </h3>
        {highCount > 0 && (
          <span className="ml-auto text-[9px] bg-rose-500 text-white px-2 py-1 rounded-lg font-black tracking-widest opacity-90">
            {highCount} WARNINGS
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleItems.map((warning, idx) => {
          const cfg  = RISK_CONFIG[warning.risk] || RISK_CONFIG.MODERATE;
          const { Icon } = cfg;
          return (
            <div key={idx} className={`rounded-2xl p-4 border ${cfg.border} ${cfg.bg} transition-all`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg bg-white shadow-sm ${cfg.text}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-gray-900 text-sm tracking-tight">{warning.ingredient}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed font-medium">
                    {warning.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length > 2 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors py-2 bg-white border border-gray-100 rounded-xl shadow-sm"
        >
          {expanded ? <><ChevronUp size={14} /> See less items</> : <><ChevronDown size={14} /> View {sorted.length - 2} more warnings</>}
        </button>
      )}
    </div>
  );
}
