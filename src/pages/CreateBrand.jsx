import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND_PLANS, startBrandSubscription } from '../utils/brandSubscription';
import { Store, MapPin, Upload, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

const CATEGORIES = ['Fashion & Apparel', 'Electronics & Tech', 'Beauty & Personal Care', 'Food & Eateries', 'Services', 'Home & Living'];

export default function CreateBrand() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brandName: '',
    category: CATEGORIES[0],
    description: '',
    location: 'Satellite Town, Calabar',
    phone: '',
    whatsapp: '',
    logoUrl: '',
    bannerUrl: ''
  });

  const [selectedPlan, setSelectedPlan] = useState(BRAND_PLANS[0]); // Default to Free Trial
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to upload files directly to Cloudinary
  const uploadToCloudinary = async (file, type) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'banner') setUploadingBanner(true);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.secure_url) {
        setForm((prev) => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'bannerUrl']: data.secure_url
        }));
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      console.error('Cloudinary error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.brandName || !form.phone) {
      setError('Please fill in your Brand Name and Phone Number.');
      return;
    }

    setLoading(true);
    setError(null);

    startBrandSubscription({
      brandData: form,
      plan: selectedPlan,
      email: currentUser?.email,
      userId: currentUser?.uid,
      onSuccess: () => {
        setLoading(false);
        navigate(`/brand/${currentUser.uid}`);
      },
      onError: (msg) => {
        setLoading(false);
        setError(msg);
      },
      onClose: () => setLoading(false)
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
          Market Arena Brand Hub
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Your Verified Brand Page</h1>
        <p className="text-xs text-gray-500 mt-1">
          Get a dedicated storefront, custom link, verified badge, and priority placement in Calabar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Brand Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#22C55E]" /> Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brand / Store Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Silvah Core Tech"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Business Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Brand Description</label>
            <textarea
              rows={3}
              placeholder="Tell buyers what your brand offers..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          {/* Direct File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Logo File Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Upload Brand Logo</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative hover:border-[#22C55E] transition-colors bg-gray-50/50">
                {form.logoUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={form.logoUrl} alt="Logo preview" className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200" />
                    <span className="text-[10px] text-emerald-600 font-bold">Logo Uploaded!</span>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    {uploadingLogo ? (
                      <Loader2 className="w-6 h-6 text-[#22C55E] animate-spin mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs text-gray-600 font-semibold">
                      {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'logo')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Banner File Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Upload Cover/Banner Image</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative hover:border-[#22C55E] transition-colors bg-gray-50/50">
                {form.bannerUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={form.bannerUrl} alt="Banner preview" className="w-full h-16 rounded-xl object-cover mb-2 border border-gray-200" />
                    <span className="text-[10px] text-emerald-600 font-bold">Banner Uploaded!</span>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    {uploadingBanner ? (
                      <Loader2 className="w-6 h-6 text-[#22C55E] animate-spin mb-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs text-gray-600 font-semibold">
                      {uploadingBanner ? 'Uploading...' : 'Click to upload banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'banner')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#22C55E]" /> Location & Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location / Store Address</label>
              <input
                type="text"
                placeholder="e.g. Marian Road, Calabar"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="09128531086"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Line</label>
              <input
                type="text"
                placeholder="09128531086"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>
        </div>

        {/* Subscription Plan Selection */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2">Select Subscription Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BRAND_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan.id === plan.id
                    ? 'border-[#22C55E] bg-green-50/50 ring-2 ring-[#22C55E]/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-gray-900">{plan.label}</span>
                  <span className="font-extrabold text-[#22C55E] text-xs">
                    {plan.price === 0 ? 'FREE' : `₦${plan.price.toLocaleString()}`}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploadingLogo || uploadingBanner}
          className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? 'Activating Brand...'
            : selectedPlan.price === 0
            ? 'Launch Brand Page (Free Trial)'
            : `Subscribe & Launch Brand (₦${selectedPlan.price.toLocaleString()})`}
        </button>
      </form>
    </div>
  );
}