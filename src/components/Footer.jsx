import React from 'react';
import { ShieldAlert, CheckCircle, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
      
      {/* Calabar Safety Tips Banner */}
      <div className="bg-gray-800 py-6 px-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-yellow-400 font-bold mb-3">
            <ShieldAlert className="w-5 h-5" />
            <span>Safety Tips for Calabar Buyers & Sellers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <span>Meet in safe public places like UNICAL Malabor Square, Marian Mall, or Watt Market main entrance.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <span>Always inspect and test gadgets or items carefully before making any transfer or cash payment.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <span>Never send money in advance for delivery or item reservation to unknown sellers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-brand-500" />
          <span>Built for UNICAL, UNICROSS & Calabar Metropolis</span>
        </div>
        <p>© {new Date().getFullYear()} Market Arena. All rights reserved.</p>
      </div>

    </footer>
  );
}