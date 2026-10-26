import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { isValidNgPhone } from '../utils/phone';
import { LOCATIONS, CATEGORIES, CONDITIONS, BOOST_PLANS } from '../utils/constants';
import { startBoostPayment } from '../utils/boost';
import { Upload, X, AlertCircle, ShoppingBag, Phone, Zap } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/imageUpload';

const MAX_PHOTOS = 3;

export default function PostItem() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [location, setLocation] = useState(
    LOCATIONS.includes(userProfile?.location) ? userProfile.location : LOCATIONS[0]
  );
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsappNumber || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [boostPlanId, setBoostPlanId] = useState(''); // '' means no boost
  const [paying, setPaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Not logged in? Go to login straight away
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // If the profile arrives late, fill the empty fields
  useEffect(() => {
    if (!userProfile) return;
    if (LOCATIONS.includes(userProfile.location)) setLocation(userProfile.location);
    setWhatsapp((prev) => prev || userProfile.whatsappNumber || '');
  }, [userProfile]);

  // Handle Image Selection & Upload to Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = ''; // lets the user pick the same photo again
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      return setError(`You can upload a maximum of 3 photos.`);
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) return setError('Please choose image files only.');
      if (file.size > 5 * 1024 * 1024) return setError('Each photo must be less than 5MB.');
    }

    setError('');
    setProcessing(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          return await uploadImageToCloudinary(file);
        })
      );
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err.message || 'Failed to upload photos.');
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit listing to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    if (processing) return setError('Please wait, photos are still uploading.');
    if (images.length === 0) return setError('Please upload at least 1 photo of your item.');
    if (!isValidNgPhone(whatsapp)) return setError('Enter a valid WhatsApp number, e.g. 08123456789.');
    if (Number(price) <= 0) return setError('Enter a price greater than 0.');

    try {
      setLoading(true);
      setError('');

      // Save the number on the profile if it was empty or changed
      if (whatsapp !== userProfile?.whatsappNumber) {
        await updateUserProfile({ whatsappNumber: whatsapp });
      }

      const listingData = {
        title: title.trim(),
        price: Number(price),
        category,
        condition,
        location,
        description: description.trim(),
        images, // Cloudinary image links
        sellerId: currentUser.uid,
        sellerName: userProfile?.displayName || 'Market Arena Seller',
        whatsappNumber: whatsapp,
        isFeatured: false,
        status: 'active',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);

      // Item is posted. If a boost was chosen, open the payment window now.
      const plan = BOOST_PLANS.find((p) => p.id === boostPlanId);
      if (plan) {
        setPaying(true);
        startBoostPayment({
          listing: { id: docRef.id },
          plan,
          email: currentUser.email,
          userId: currentUser.uid,
          onSuccess: () => navigate('/'),
          onClose: () => navigate('/my-listings'), // posted, not boosted. Can boost later.
          onError: (msg) => {
            window.alert(`${msg}\n\nYour item is posted. You can boost it later in My Listings.`);
            navigate('/my-listings');
          }
        });
        return;
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to post item. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Post an Item for Sale</h1>
            <p className="text-xs text-gray-500">Reach buyers across UNICAL and Calabar metropolis</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Item Title</label>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="e.g. iPhone 13 Pro 128GB (Clean UK used)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white cursor-pointer"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number (buyers will chat you here)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="e.g. 08123456789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows="3"
              placeholder="Describe your item, battery health, reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Item Photos (Max {MAX_PHOTOS})</label>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative h-24 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_PHOTOS && (
                <label className="border-2 border-dashed border-gray-300 hover:border-brand-600 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">
                    {processing ? 'Please wait...' : 'Add Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={processing}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Advertise / Boost (optional) */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-2 text-yellow-700 font-semibold text-xs mb-1">
              <Zap className="w-4 h-4" />
              <span>Advertise this item (optional)</span>
            </div>
            <p className="text-[11px] text-yellow-700 mb-3">
              Boosted items stay at the top of the home page with a FEATURED badge, so more buyers see them.
              You pay after you tap Publish.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBoostPlanId('')}
                className={`py-2 rounded-xl text-xs font-medium border ${
                  boostPlanId === '' ? 'bg-white border-brand-600 text-brand-700' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                No boost
              </button>
              {BOOST_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setBoostPlanId(plan.id)}
                  className={`py-2 rounded-xl text-xs font-medium border ${
                    boostPlanId === plan.id ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  ₦{plan.price.toLocaleString()} for {plan.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || processing || paying}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors mt-4 shadow-sm disabled:opacity-50"
          >
            {loading || paying
              ? 'Please wait...'
              : boostPlanId
                ? `Publish & Pay ₦${BOOST_PLANS.find((p) => p.id === boostPlanId).price.toLocaleString()}`
                : 'Publish Listing'}
          </button>

        </form>

      </div>
    </div>
  );
}