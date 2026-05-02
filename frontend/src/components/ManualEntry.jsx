import React, { useState } from 'react';
import { X, Activity, Info } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-white border-4 border-gray-900 rounded-[2.5rem] shadow-[0_12px_0_0_#111827] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b-4 border-gray-900 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manual Entry</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Can't scan? Enter details here.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-900 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-none">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><Info size={16}/></div>
               <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Dark Chocolate"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-bold text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cadbury"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-bold text-sm"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ingredients (Separated by commas)</label>
               <textarea 
                 required
                 placeholder="e.g. Sugar, Cocoa Butter, Milk Solids..."
                 className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-bold text-sm h-24 resize-none"
                 value={formData.ingredients}
                 onChange={e => setFormData({...formData, ingredients: e.target.value})}
               />
            </div>
          </div>

          {/* Section: Nutrition per 100g */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><Activity size={16}/></div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Nutrition (Per 100g)</h4>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Calories (kcal)</label>
                   <input 
                     required
                     type="number" 
                     placeholder="0"
                     className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-center"
                     value={formData.calories}
                     onChange={e => setFormData({...formData, calories: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sugar (g)</label>
                   <input 
                     required
                     type="number" 
                     placeholder="0"
                     className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-center"
                     value={formData.sugar}
                     onChange={e => setFormData({...formData, sugar: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Fat (g)</label>
                   <input 
                     required
                     type="number" 
                     placeholder="0"
                     className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-center"
                     value={formData.fat}
                     onChange={e => setFormData({...formData, fat: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sodium (mg)</label>
                   <input 
                     required
                     type="number" 
                     placeholder="0"
                     className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-center"
                     value={formData.sodium}
                     onChange={e => setFormData({...formData, sodium: e.target.value})}
                   />
                </div>
             </div>
             <div className="space-y-1.5 w-full md:w-1/2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serving Size (g)</label>
                <input 
                  required
                  type="number" 
                  placeholder="100"
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:bg-gray-50 outline-none transition-all font-black text-center"
                  value={formData.servingSize}
                  onChange={e => setFormData({...formData, servingSize: e.target.value})}
                />
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-8 border-t-4 border-gray-900 bg-gray-50 flex gap-4">
           <button 
             type="button"
             onClick={onClose}
             className="flex-1 py-4 rounded-2xl border-2 border-gray-900 font-black uppercase tracking-widest text-gray-900 hover:bg-gray-100 transition-all text-xs"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all text-xs shadow-[0_6px_0_0_#111827] active:translate-y-[2px] active:shadow-none"
           >
             Analyze Product
           </button>
        </div>
      </div>
    </div>
  );
}
