import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, FileText } from 'lucide-react';

export default function Footer() {
  const { currentUser } = useAuth();

  // Replace with your actual admin UID or check your admin logic
  // (You can also check if currentUser?.email === 'your-admin-email@gmail.com')
  const ADMIN_UID = 'YOUR_ADMIN_UID_HERE'; // Or adjust based on how your Admin.jsx checks admin
  const isAdmin = currentUser && currentUser.uid === ADMIN_UID;

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8 px-4 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Dynamic Copyright / Admin Backdoor */}
        <div className="flex items-center space-x-1">
          <span>Copyright</span>
          {isAdmin ? (
            <Link 
              to="/admin" 
              title="Admin Portal" 
              className="font-bold text-[#22C55E] hover:underline cursor-pointer px-1 bg-emerald-50 rounded"
            >
              ©
            </Link>
          ) : (
            <span>©</span>
          )}
          <span>{new Date().getFullYear()} Market Arena. All rights reserved.</span>
        </div>

        {/* Center/Right: Policy Links for Paystack Compliance */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-gray-600">
          <Link to="/policies" className="hover:text-[#22C55E] transition-colors flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Policies</span>
          </Link>
          <span className="text-gray-300">•</span>
          <Link to="/policies#privacy" className="hover:text-[#22C55E] transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <Link to="/policies#safety" className="hover:text-[#22C55E] transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Safety Guidelines</span>
          </Link>
        </div>

      </div>
    </footer>
  );
}