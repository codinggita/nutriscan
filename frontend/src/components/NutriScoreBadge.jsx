import React from 'react';

const GRADE_CONFIG = {
  A: { bg: 'bg-[#038141]', text: 'text-white', label: 'Excellent' },
  B: { bg: 'bg-[#85BB2F]', text: 'text-white', label: 'Good'      },
  C: { bg: 'bg-[#FECB02]', text: 'text-gray-900', label: 'Average'},
  D: { bg: 'bg-[#EE8100]', text: 'text-white', label: 'Poor'      },
  E: { bg: 'bg-[#E63E11]', text: 'text-white', label: 'Bad'       },
};

export default function NutriScoreBadge({ grade, label }) {
  if (!grade) return null;
  const active = GRADE_CONFIG[grade] || GRADE_CONFIG.C;

  return (
    <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
        NutriScore Rating
      </p>

      {/* Grade bar */}
      <div className="flex items-center gap-2">
        {['A', 'B', 'C', 'D', 'E'].map((g) => {
          const cfg    = GRADE_CONFIG[g];
          const isActive = g === grade;
          return (
            <div
              key={g}
              className={`
                flex items-center justify-center font-black transition-all duration-300
                ${cfg.bg} ${cfg.text}
                ${isActive
                  ? 'w-11 h-11 rounded-xl text-xl shadow-lg ring-4 ring-white scale-110 z-10'
                  : 'w-8 h-8 rounded-lg text-xs opacity-20 hover:opacity-40 cursor-default'}
              `}
            >
              {g}
            </div>
          );
        })}

        <div className="ml-4 flex flex-col">
          <span className="text-gray-900 font-black text-lg leading-tight tracking-tight">{active.label}</span>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Grade {grade}</span>
        </div>
      </div>
    </div>
  );
}
