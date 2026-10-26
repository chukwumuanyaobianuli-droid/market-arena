import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidNgPhone } from '../utils/phone';
import { LOCATIONS } from '../utils/constants';
import {
  User, Phone, MapPin, ShieldCheck, LogOut, Package, ArrowRight, Pencil, AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const startEditing = () => {
    setName(userProfile?.displayName || '');
    setWhatsapp(userProfile?.whatsappNumber || '');
    setLocation(LOCATIONS.includes(userProfile?.location) ? userProfile.location : LOCATIONS[0]);
    setError('');
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidNgPhone(whatsapp)) return setError('Enter a valid Nigerian number, e.g. 08123456789.');

    try {
      setSaving(true);
      setError('');
      await updateUserProfile({ displayName: name.trim(), whatsappNumber: whatsapp, location });
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError('Could not save. Check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-600 mb-4 text-sm">Please log in to view your profile.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white';

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold uppercase">
              {userProfile?.displayName?.[0] || currentUser.email?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center space-x-1">
                <span>{userProfile?.displayName || 'Market Arena User'}</span>
                {userProfile?.isVerified && (
                  <span title="Verified Seller">
                    <ShieldCheck className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  </span>
                )}
              </h1>
              <p className="text-xs text-brand-100">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-4">

          {!editing && !userProfile?.whatsappNumber && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl">
              Add your WhatsApp number so buyers can chat with you.
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Calabar Area</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="text-xs text-gray-400">WhatsApp Number</p>
                    <p className="text-sm font-medium">{userProfile?.whatsappNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="text-xs text-gray-400">Calabar Location</p>
                    <p className="text-sm font-medium">{userProfile?.location || 'Calabar'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 text-gray-700">
                  <User className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="text-xs text-gray-400">Account Role</p>
                    <p className="text-sm font-medium capitalize">{userProfile?.role || 'user'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={startEditing}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => navigate('/my-listings')}
              className="w-full flex items-center justify-between p-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-sm font-medium transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>My Listings & Posted Items</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
