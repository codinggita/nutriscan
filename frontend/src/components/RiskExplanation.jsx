import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function RiskExplanation({ explanation, signals }) {
  if (!explanation) return null;

  return (
    <div className="bg-white border border-emerald-50 p-6 rounded-2xl mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <BrainCircuit size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Context</h3>
      </div>

      {signals && signals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {signals.map((signal, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {signal}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-gray-800 text-sm font-bold leading-relaxed tracking-tight">
        {explanation}
      </p>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/30" />)}
        </div>
        <div className="text-[9px] font-black text-gray-300 flex items-center gap-1 uppercase tracking-widest">
          Gemini Intelligence
        </div>
      </div>
    </div>
  );
}
