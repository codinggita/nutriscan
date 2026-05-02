import React, { useState } from 'react';
import { Eye, ImageOff } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = product.image_url || `https://images.openfoodfacts.org/images/products/${product.barcode}/front_en.3.400.jpg`; 

  return (
    <div 
      onClick={() => onClick(product.barcode)}
      className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full bg-gray-50/50"></div>
        ) : (
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors pointer-events-none" />
        
        {/* Quick info badge */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="glass px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter text-emerald-900 border-white/40">
            {product.per100g.calories_kcal} kcal
          </div>
        </div>

        {/* Action Icon overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
            <Eye size={18} />
          </div>
        </div>
      </div>

      <div className="px-1 items-start flex flex-col">
        <p className="text-gray-400 text-[9px] font-bold tracking-widest leading-none mb-1">
          {product.brand}
        </p>
        <h4 className="font-extrabold text-gray-900 text-sm leading-tight text-left">
          {product.name}
        </h4>
        
        <div className="mt-3 w-full flex items-center justify-between text-[10px] font-bold">
           <span className="text-gray-400">Sugar: <span className="text-gray-900">{product.per100g.sugar_g}g</span></span>
           <span className="text-gray-400">Fat: <span className="text-gray-900">{product.per100g.fat_g}g</span></span>
        </div>
      </div>
    </div>
  );
}
