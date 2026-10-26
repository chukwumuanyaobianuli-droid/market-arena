import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Logo({ size = "w-9 h-9", showText = true, textSize = "text-lg" }) {
  return (
    <div className="flex items-center space-x-2 group cursor-pointer">
      {/* Logo Container with fallback */}
      <div className={`${size} rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
        <img 
          src="/logo.png" 
          alt="Market Arena" 
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            // If logo.png isn't found in public folder, show crisp icon fallback automatically
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full bg-[#22C55E] text-white items-center justify-center hidden">
          <ShoppingBag className="w-4 h-4" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-gray-900 ${textSize} leading-tight tracking-tight`}>
            Market<span className="text-[#22C55E]">Arena</span>
          </span>
          <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
            Shop • Sell • Grow
          </span>
        </div>
      )}
    </div>
  );
}