import React from 'react';
import { Salad } from 'lucide-react';

const NutritionBar = ({ percentage, colorClass }) => (
  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
    <div 
      className={`h-full rounded-full transition-all duration-700 ${colorClass}`} 
      style={{ width: `${Math.min(percentage, 100)}%` }} 
    />
  </div>
);

const MacroBlock = ({ label, humanValue, percentage, sub }) => {
  let barColor = 'bg-emerald-500';
  if (percentage >= 30 && percentage <= 70) barColor = 'bg-amber-500';
  else if (percentage > 70) barColor = 'bg-rose-500';

  return (
    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
      <div>
        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</div>
        <div className="text-gray-900 font-bold text-lg leading-tight tracking-tight">{humanValue}</div>
        {sub && <div className="text-gray-500 text-[11px] font-medium mt-0.5">{sub}</div>}
      </div>
      <NutritionBar percentage={percentage || 0} colorClass={barColor} />
    </div>
  );
};

export default function NutritionCard({ data }) {
  if (!data || !data.per100g) return null;

  const { sugar_g, fat_g, sodium_mg, calories_kcal, protein_g = 0, fiber_g = 0 } = data.per100g;
  const serving = data.serving_size_g || 100;
  const scale   = serving / 100;

  const sugarS    = sugar_g    * scale;
  const fatS      = fat_g      * scale;
  const sodiumS   = sodium_mg  * scale;
  const calS      = calories_kcal * scale;
  const proteinS  = protein_g  * scale;
  const fiberS    = fiber_g    * scale;

  const sugarTsp  = (sugarS  / 4).toFixed(1);
  const fatTbsp   = (fatS    / 14).toFixed(1);
  const sodiumPinch = (sodiumS / 300).toFixed(1); // 1 pinch of salt is roughly 300mg of sodium

  const sugarPct   = (sugarS  / 25)   * 100;
  const fatPct     = (fatS    / 65)   * 100;
  const sodiumPct  = (sodiumS / 2300) * 100;
  const proteinPct = (proteinS/ 50)   * 100;
  const fiberPct   = (fiberS  / 28)   * 100;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
      {/* Product header */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-50">
        {data.image_url ? (
          <img src={data.image_url} alt={data.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shadow-sm flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black text-2xl flex-shrink-0">
            {(data.name || '?').charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900 font-black text-xl leading-tight truncate tracking-tight">{data.name}</h2>
          {data.brand && <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">{data.brand}</p>}
          <p className="text-gray-500 text-xs font-semibold mt-1">Per serving ({serving}g)</p>
        </div>
      </div>

      {/* Reality check banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 mb-5 flex items-start gap-3">
        <Salad className="text-amber-500 mt-0.5" size={20} />
        <p className="text-amber-800 text-xs font-bold leading-relaxed">
          Reality Check: This serving has <span className="underline underline-offset-4 decoration-amber-400">{sugarTsp} teaspoons of sugar</span>, <span className="underline underline-offset-4 decoration-amber-400">{fatTbsp} tbsp of fat</span>, and <span className="underline underline-offset-4 decoration-amber-400">{sodiumPinch} pinches of salt</span>.
        </p>
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-2 gap-3">
        <MacroBlock label="Sugar"   humanValue={`${sugarTsp} tsp`}    percentage={sugarPct}  sub={`${sugarS.toFixed(1)}g`} />
        <MacroBlock label="Fat"     humanValue={`${fatTbsp} tbsp`}    percentage={fatPct}    sub={`${fatS.toFixed(1)}g`} />
        <MacroBlock label="Sodium"  humanValue={`${sodiumPinch} pinches`} percentage={sodiumPct} sub={`${sodiumS.toFixed(0)}mg`} />
        <MacroBlock label="Calories" humanValue={`${calS.toFixed(0)} kcal`} percentage={(calS/2000)*100} />
        <MacroBlock label="Protein" humanValue={`${proteinS.toFixed(1)}g`}  percentage={proteinPct} />
        <MacroBlock label="Fiber"   humanValue={`${fiberS.toFixed(1)}g`}    percentage={fiberPct}  />
      </div>
    </div>
  );
}
