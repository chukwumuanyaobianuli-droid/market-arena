import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Phone, MessageSquare, ShoppingBag, Settings, Eye, PlusCircle, BarChart3, TrendingUp } from 'lucide-react';

export default function BrandProfile() {
  const { brandId } = useParams();
  const { currentUser } = useAuth();
  const [brand, setBrand] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser && brand && (currentUser.uid === brand.ownerId || currentUser.uid === brandId);

  useEffect(() => {
    const fetchBrandAndCatalog = async () => {
      try {
        setLoading(true);
        // 1. Fetch Brand Document
        const brandSnap = await getDoc(doc(db, 'brands', brandId));
        if (brandSnap.exists()) {
          const brandData = { id: brandSnap.id, ...brandSnap.data() };
          setBrand(brandData);

          // 2. Increment store view counter if visitor is not the owner
          if (!currentUser || currentUser.uid !== brandData.ownerId) {
            try {
              await updateDoc(doc(db, 'brands', brandId), {
                views: increment(1)
              });
            } catch (e) {
              console.error('Could not increment store view:', e);
            }
          }

          // 3. Fetch items tied specifically to this brand's catalog (brandId)
          const q = query(collection(db, 'listings'), where('brandId', '==', brandId));
          const listingsSnap = await getDocs(q);
          const catalogItems = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Sort boosted / featured items to the top automatically
          catalogItems.sort((a, b) => {
            const aFeatured = a.isFeatured && a.featuredUntil > Date.now() ? 1 : 0;
            const bFeatured = b.isFeatured && b.featuredUntil > Date.now() ? 1 : 0;
            return bFeatured - aFeatured;
          });

          setItems(catalogItems);
        }
      } catch (err) {
        console.error('Error loading brand storefront:', err);
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrandAndCatalog();
    }
  }, [brandId, currentUser]);

  // Calculate total product views and total inquiries for the brand owner's metrics
  const totalProductViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalInquiries = items.reduce((sum, item) => sum + (item.whatsappClicks || 0), 0);

  if (loading) return <div className="text-center py-20 text-xs text-gray-400">Loading Brand Storefront...</div>;
  if (!brand) return <div className="text-center py-20 text-xs text-gray-400">Brand page not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Banner & Brand Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="h-48 sm:h-60 bg-gray-200 relative">
          <img
            src={brand.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <img
                src={brand.logoUrl || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef'}
                alt={brand.brandName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
              <div className="mb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{brand.brandName}</h1>
                  {brand.isVerified && <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />}
                </div>
                <p className="text-xs text-[#22C55E] font-semibold">{brand.category}</p>
              </div>
            </div>

            {/* Action & Management Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {isOwner && (
                <>
                  <Link
                    to="/post-item"
                    className="bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Post to Store
                  </Link>
                  <Link
                    to="/edit-brand"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Edit Storefront
                  </Link>
                </>
              )}
              {brand.whatsapp && (
                <a
                  href={`https://wa.me/${brand.whatsapp.replace(/\+/g, '')}?text=Hello%20${encodeURIComponent(brand.brandName)},%20I%20saw%20your%20store%20on%20Market%20Arena`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {brand.phone && (
                <a
                  href={`tel:${brand.phone}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4 max-w-3xl leading-relaxed">{brand.description || 'Official verified vendor storefront on Market Arena Calabar.'}</p>

          {/* 🌟 VENDOR ANALYTICS DASHBOARD CARD (Visible to Store Owners) */}
          {isOwner && (
            <div className="mb-4 p-4 bg-emerald-900 text-white rounded-2xl shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Store Visits
                </p>
                <p className="text-xl font-black">{brand.views || 1}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Product Impressions
                </p>
                <p className="text-xl font-black">{totalProductViews}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Inquiries
                </p>
                <p className="text-xl font-black">{totalInquiries}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> Active Catalog
                </p>
                <p className="text-xl font-black">{items.length} Items</p>
              </div>
            </div>
          )}

          {/* Location & Public Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 border-t pt-4">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <MapPin className="w-4 h-4 text-emerald-600" /> {brand.location || 'Calabar, Nigeria'}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> {items.length} Products in Catalog
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full uppercase text-[10px]">
              {brand.subscriptionPlan === 'free' ? 'Free Trial Plan' : `${brand.subscriptionPlan || 'Active'} Storefront`}
            </span>
          </div>
        </div>
      </div>

      {/* Official Brand Catalog Grid with Product-Level Views */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Official Catalog & Inventory</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No products in your catalog yet</h3>
          <p className="text-xs text-gray-500 mb-4">Add your products so Calabar buyers can browse and buy.</p>
          {isOwner && (
            <Link
              to="/post-item"
              className="inline-flex items-center gap-2 bg-[#22C55E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add Product to Store
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.id} to={`/item/${item.id}`} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow block relative">
              {item.isFeatured && item.featuredUntil > Date.now() && (
                <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                  ⚡ BOOSTED
                </span>
              )}
              <div className="relative">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                  alt={item.title}
                  className="w-full h-36 object-cover rounded-xl mb-2.5"
                />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-400" /> {item.views || 0}
                </span>
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{item.title}</h3>
              <p className="text-xs font-extrabold text-[#22C55E]">₦{Number(item.price).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}