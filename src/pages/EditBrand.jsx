import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Store, Upload, ImageIcon, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function EditBrand() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brandName: '',
    category: '',
    description: '',
    location: '',
    phone: '',
    whatsapp: '',
    logoUrl: '',
    bannerUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBrand = async () => {
      if (!currentUser) return navigate('/login');
      try {
        const snap = await getDoc(doc(db, 'brands', currentUser.uid));
        if (snap.exists()) {
          setForm(snap.data());
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load brand profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [currentUser, navigate]);

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
      }
    } catch (err) {
      console.error(err);
      setError('Image upload failed.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, 'brands', currentUser.uid), {
        ...form,
        updatedAt: serverTimestamp()
      });
      navigate(`/brand/${currentUser.uid}`);
    } catch (err) {
      console.error(err);
      setError('Failed to update brand profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xs text-gray-400">Loading brand profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-4 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <Store className="w-5 h-5 text-[#22C55E]" /> Edit Brand Storefront & Media
        </h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          {/* Logo & Banner Replacement Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brand Logo (Change / Replace)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative bg-gray-50">
                <img src={form.logoUrl || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef'} alt="Logo" className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border" />
                <label className="cursor-pointer text-xs font-bold text-[#22C55E] flex items-center justify-center gap-1">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploadingLogo ? 'Uploading...' : 'Replace Logo'}</span>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'logo')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Cover Banner (Change / Replace)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative bg-gray-50">
                <img src={form.bannerUrl || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef'} alt="Banner" className="w-full h-16 rounded-xl object-cover mb-2 border" />
                <label className="cursor-pointer text-xs font-bold text-[#22C55E] flex items-center justify-center gap-1">
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  <span>{uploadingBanner ? 'Uploading...' : 'Replace Banner'}</span>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadToCloudinary(e.target.files[0], 'banner')} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Line</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploadingLogo || uploadingBanner}
            className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Update Brand Store'}
          </button>
        </form>
      </div>
    </div>
  );
}