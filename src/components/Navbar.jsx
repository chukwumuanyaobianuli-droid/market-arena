import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PlusCircle, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Location */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group cursor-pointer">
              
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Market Arena" 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-extrabold text-gray-900 text-lg leading-tight tracking-tight">
                  Market<span className="text-[#22C55E]">Arena</span>
                </span>
                <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                  Shop • Sell • Grow
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-gray-200">|</span>

            <div className="hidden sm:flex items-center text-xs font-semibold text-gray-600 bg-emerald-50/85 px-3 py-1 rounded-full border border-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-[#22C55E] mr-1" />
              Calabar, Nigeria
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Favorites Link */}
            <Link
              to="/favorites"
              title="My Favorites"
              className="flex items-center space-x-1 text-xs font-semibold text-gray-700 bg-red-50/60 hover:bg-red-50 text-red-600 px-3 py-2.5 rounded-xl border border-red-100 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span className="hidden sm:inline font-bold">Saved</span>
            </Link>

            {/* Sell Item Button */}
            <Link
              to="/post-item"
              className="flex items-center space-x-1.5 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Item</span>
            </Link>

            {/* Account / Login */}
            <Link
              to={currentUser ? "/profile" : "/login"}
              className="flex items-center space-x-1 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3.5 py-2.5 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">{currentUser ? 'Account' : 'Login'}</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}