import React, { useState } from 'react';
import { X, Activity, Info, FileText } from 'lucide-react';

export default function ManualEntry({ isOpen, onClose, onAnalyze }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    ingredients: '',
    calories: '',
    sugar: '',
    fat: '',
    sodium: '',
    servingSize: '100',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct a "product" object similar to OpenFoodFacts structure
    const product = {
      name: formData.name,
      brand: formData.brand,
      ingredients_text: formData.ingredients,
      per100g: {
        calories_kcal: parseFloat(formData.calories) || 0,
        sugar_g: parseFloat(formData.sugar) || 0,
        fat_g: parseFloat(formData.fat) || 0,
        sodium_mg: parseFloat(formData.sodium) || 0,
      },
      serving_size_g: parseFloat(formData.servingSize) || 100,
      source: 'manual',
    };

    onAnalyze(product);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Soft background blobs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-white/50 backdrop-blur-md flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manual Entry</h3>
              <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Add product details directly</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
          
          {/* Section: Basic Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><Info size={16}/></div>
               <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Dark Chocolate"
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand <span className="text-gray-300 normal-case">(Optional)</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cadbury"
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Ingredients (Comma separated)</label>
               <textarea 
                 required
                 placeholder="e.g. Sugar, Cocoa Butter, Milk Solids..."
                 className="w-full p-4 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300 h-28 resize-none"
                 value={formData.ingredients}
                 onChange={e => setFormData({...formData, ingredients: e.target.value})}
               />
            </div>
          </div>

          {/* Section: Nutrition per 100g */}
          <div className="space-y-5 pt-4">
             <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Activity size={16}/></div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Nutrition (Per 100g)</h4>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Calories</label>
                   <div className="relative">
                     <input 
                       required
                       type="number" 
                       placeholder="0"
                       className="w-full p-4 pr-10 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-black text-gray-900"
                       value={formData.calories}
                       onChange={e => setFormData({...formData, calories: e.target.value})}
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">kcal</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sugar</label>
                   <div className="relative">
                     <input 
                       required
                       type="number" 
                       placeholder="0"
                       className="w-full p-4 pr-8 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-black text-gray-900"
                       value={formData.sugar}
                       onChange={e => setFormData({...formData, sugar: e.target.value})}
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">g</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Fat</label>
                   <div className="relative">
                     <input 
                       required
                       type="number" 
                       placeholder="0"
                       className="w-full p-4 pr-8 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-black text-gray-900"
                       value={formData.fat}
                       onChange={e => setFormData({...formData, fat: e.target.value})}
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">g</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sodium</label>
                   <div className="relative">
                     <input 
                       required
                       type="number" 
                       placeholder="0"
                       className="w-full p-4 pr-10 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-black text-gray-900"
                       value={formData.sodium}
                       onChange={e => setFormData({...formData, sodium: e.target.value})}
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">mg</span>
                   </div>
                </div>
             </div>
             <div className="space-y-2 w-full md:w-1/2 pt-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Serving Size</label>
                <div className="relative">
                  <input 
                    required
                    type="number" 
                    placeholder="100"
                    className="w-full p-4 pr-8 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-gray-50 focus:bg-white outline-none transition-all font-black text-gray-900"
                    value={formData.servingSize}
                    onChange={e => setFormData({...formData, servingSize: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">g</span>
                </div>
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex gap-4 relative z-10">
           <button 
             type="button"
             onClick={onClose}
             className="flex-1 py-4 rounded-2xl border border-gray-200 font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all text-xs"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest hover:bg-emerald-700 transition-all text-xs shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
           >
             Analyze Product
           </button>
        </div>
      </div>
    </div>
  );
}
