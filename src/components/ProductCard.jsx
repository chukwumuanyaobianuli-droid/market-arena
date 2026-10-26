import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
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
  const formattedPrice = Number(item.price).toLocaleString();

  // WhatsApp chat link (empty if the seller number is not valid)
  const whatsappUrl = whatsappLink(
    item.whatsappNumber,
    `Hi, I saw your item "${item.title}" on Market Arena. Is it still available?`
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between relative group">
      
      {/* Image & Badges */}
      <Link to={`/item/${item.id}`} className="relative h-48 bg-gray-100 block overflow-hidden">
        <img 
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} 
          alt={item.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full z-10">
          {item.category}
        </div>

        {/* Featured Badge */}
        {isBoosted(item) && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow z-10">
            FEATURED
          </div>
        )}

        {/* Heart Save Button */}
        <button
          onClick={toggleSave}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
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
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center text-brand-600 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-0.5" />
              {item.location}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">{item.condition}</span>
          </div>

          <Link to={`/item/${item.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-brand-600 transition-colors">
              {item.title}
            </h3>
          </Link>

          <p className="text-lg font-bold text-brand-700 mt-1">
            ₦{formattedPrice}
          </p>
        </div>

        {/* Action Button: WhatsApp */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 truncate max-w-[100px]">{item.sellerName}</span>
          
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </a>
          ) : (
            <Link
              to={`/item/${item.id}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              View
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}