import React from 'react';
import { X, Check, Baby, User, Activity } from 'lucide-react';

const PROFILES = [
  {
    id:    'child',
    icon:  Baby,
    label: 'Child',
    desc:  'Under 12 years age group',
    info:  'Extra strict on sugar & trans fats.'
  },
  {
    id:    'adult',
    icon:  User,
    label: 'Adult',
    desc:  'Standard health thresholds',
    info:  'Balanced nutrition and sodium limits.'
  },
  {
    id:    'senior',
    icon:  Activity,
    label: 'Senior',
    desc:  '60+ with heart focus',
    info:  'Aggressive salt & fat tracking.'
  },
];

export default function ProfileSelector({ ageGroup, onChange, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 backdrop-blur-md px-4 pb-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-xl p-7 shadow-2xl animate-in relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Select Profile</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-rose-500 transition-colors">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Choose your health baseline</p>

        <div className="space-y-3">
          {PROFILES.map((p) => {
            const isSelected = ageGroup === p.id;
            return (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); onClose(); }}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 text-left
                  ${isSelected
                    ? 'bg-emerald-50 px-6 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <p.icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className={`font-black text-base ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>{p.label}</p>
                  <p className={`text-xs font-bold mt-1 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>{p.desc}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter mt-1">{p.info}</p>
                </div>
                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                    <Check size={16} strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
