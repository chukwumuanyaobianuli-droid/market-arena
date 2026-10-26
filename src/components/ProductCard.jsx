import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Eye } from 'lucide-react';
import { whatsappLink } from '../utils/phone';
import { isBoosted } from '../utils/constants';

export default function ProductCard({ item }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('market_arena_favorites') || '[]');
    setIsSaved(savedItems.includes(item.id));
  }, [item.id]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let savedItems = JSON.parse(localStorage.getItem('market_arena_favorites') || '[]');
    if (isSaved) {
      savedItems = savedItems.filter(id => id !== item.id);
      setIsSaved(false);
    } else {
      savedItems.push(item.id);
      setIsSaved(true);
    }
    localStorage.setItem('market_arena_favorites', JSON.stringify(savedItems));
  };

  // Format price in Nigerian Naira
  const formattedPrice = Number(item.price || 0).toLocaleString();

  // WhatsApp chat link
  const whatsappUrl = whatsappLink(
    item.whatsappNumber,
    `Hi, I saw your item "${item.title}" on Market Arena. Is it still available?`
  );

  const boosted = isBoosted(item);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between relative group shadow-sm hover:shadow-md ${
      boosted ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-gray-100 hover:border-emerald-200'
    }`}>
      
      {/* Whole card links to item details */}
      <Link to={`/item/${item.id}`} className="absolute inset-0 z-10" aria-label={item.title} />

      <div>
        {/* Image & Badges */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img 
            src={item.images?.[0] || item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            loading="lazy"
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-20">
            {item.category}
          </div>

          {/* Featured Badge */}
          {boosted && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow z-20">
              FEATURED
            </div>
          )}

          {/* Sold Badge */}
          {item.status === 'sold' && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow z-20">
              SOLD
            </div>
          )}

          {/* Heart Save Button */}
          <button
            onClick={toggleSave}
            className="absolute bottom-3 right-3 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
            title={isSaved ? "Remove from saved" : "Save item"}
          >
            <svg 
              className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="flex items-center text-[#064E3B] font-semibold">
              <MapPin className="w-3.5 h-3.5 mr-0.5 text-[#22C55E]" />
              {item.location || 'Calabar'}
            </span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">{item.condition || 'Used'}</span>
          </div>

          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#22C55E] transition-colors">
            {item.title}
          </h3>

          <p className="text-base font-black text-[#22C55E] mt-1">
            ₦{formattedPrice}
          </p>
        </div>
      </div>

      {/* Footer: Clickable Seller Store link & WhatsApp button */}
      <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2 text-[11px] text-gray-500">
          {item.sellerId ? (
            <Link 
              to={`/vendor/${item.sellerId}`}
              className="truncate max-w-[90px] font-semibold text-gray-700 hover:text-[#22C55E] transition-colors relative z-20"
              title={`View ${item.sellerName || 'Vendor'}'s Store`}
            >
              {item.sellerName || 'Vendor'}
            </Link>
          ) : (
            <span className="truncate max-w-[90px] font-semibold text-gray-700">
              {item.sellerName || 'Vendor'}
            </span>
          )}

          <span className="text-gray-300">•</span>
          
          <span className="flex items-center gap-1 text-gray-400">
            <Eye className="w-3 h-3" /> {item.views || 0}
          </span>
        </div>
        
        {whatsappUrl && item.status !== 'sold' ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer relative z-20"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat</span>
          </a>
        ) : (
          <span className="text-xs font-bold text-gray-400">
            {item.status === 'sold' ? 'Sold Out' : 'No Chat'}
          </span>
        )}
      </div>

    </div>
  );
}