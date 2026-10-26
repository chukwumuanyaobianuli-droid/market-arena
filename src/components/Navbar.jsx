import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, PlusCircle, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, userProfile } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Location */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-brand-600 text-white p-2 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Market<span className="text-brand-600">Arena</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-brand-600 mr-1" />
              Calabar
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/post-item" 
              className="flex items-center space-x-1 bg-brand-600 hover:bg-brand-700 text-white font-medium px-3.5 py-2 rounded-lg text-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Item</span>
            </Link>

            {currentUser ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-1 text-gray-700 hover:text-brand-600 bg-gray-100 p-2 rounded-lg text-sm font-medium"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline">
                  {userProfile?.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-brand-600 font-medium px-3 py-2 rounded-lg text-sm"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}