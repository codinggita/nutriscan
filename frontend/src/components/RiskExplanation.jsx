import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function RiskExplanation({ explanation, signals }) {
  if (!explanation) return null;

  return (
    <div className="bg-slate-50 border-l-4 border-l-blue-500 border-y border-r border-gray-200 p-6 md:p-8 rounded-r-2xl rounded-l-sm mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Stethoscope size={20} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Medical Context</h3>
      </div>

      {signals && signals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {signals.map((signal, idx) => (
            <span key={idx} className="px-3 py-1 bg-white text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {signal}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-slate-800 text-sm md:text-base font-medium leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}
