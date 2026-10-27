import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // <--- Corrected import path
import ProductCard from '../components/ProductCard';
import VendorReviews from '../components/VendorReviews';
import { MapPin, Phone, MessageCircle, ArrowLeft, Package, ShieldCheck, Share2 } from 'lucide-react';
import { whatsappLink, telLink } from '../utils/phone';

export default function VendorStore() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchVendorData = async () => {
      try {
        setLoading(true);

        // 1. Public profile (only exists for admin-verified sellers)
        let profile = null;
        try {
          const profileSnap = await getDoc(doc(db, 'publicProfiles', sellerId));
          if (profileSnap.exists()) profile = profileSnap.data();
        } catch (e) {
          // no public profile, that is fine
        }

        // 2. Fetch all active listings by this seller
        const q = query(
          collection(db, 'listings'),
          where('sellerId', '==', sellerId)
        );
        const querySnap = await getDocs(q);
        
        if (isMounted) {
          const items = querySnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((item) => item.status !== 'sold');
          setListings(items);

          // Seller info comes from the listings, plus the public profile if there is one
          if (items.length > 0) {
            setSeller({
              displayName: profile?.displayName || items[0].sellerName || 'Vendor',
              location: profile?.location || items[0].location || 'Calabar',
              whatsappNumber: items[0].whatsappNumber || '',
              isVerified: !!profile?.isVerified,
            });
          } else if (profile) {
            setSeller(profile);
          }
        }
      } catch (err) {
        console.error('Error fetching vendor store:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (sellerId) fetchVendorData();

    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-400">Loading vendor store...</div>;
  }

  const vendorName = seller?.displayName || listings[0]?.sellerName || 'Calabar Vendor';
  const vendorLocation = seller?.location || listings[0]?.location || 'Calabar';
  const whatsappNum = seller?.whatsappNumber || listings[0]?.whatsappNumber;

  const whatsappUrl = whatsappNum 
    ? whatsappLink(whatsappNum, `Hello ${vendorName}, I came across your store on Market Arena!`) 
    : null;
  const phoneUrl = whatsappNum ? telLink(whatsappNum) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-[#064E3B] mb-6 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Vendor Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#064E3B] to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-[#064E3B] font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center shadow-md shrink-0">
              {vendorName[0]?.toUpperCase()}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{vendorName}</h1>
                {seller?.isVerified && (
                  <span className="bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                  {vendorLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#22C55E]" />
                  {listings.length} Active {listings.length === 1 ? 'Listing' : 'Listings'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Vendor</span>
              </a>
            )}

            {phoneUrl && (
              <a
                href={phoneUrl}
                className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}

            <button
              onClick={handleCopyStoreLink}
              className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-xs font-bold p-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
              title="Share Store Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {copied && (
          <div className="mt-4 text-center text-xs text-[#22C55E] bg-white/10 py-1.5 rounded-lg border border-white/10 font-bold">
            Store link copied to clipboard!
          </div>
        )}
      </div>

      {/* Vendor Listings Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Store Products</h2>
        <span className="text-xs text-gray-400 font-medium">Showing active inventory</span>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No active listings</h3>
          <p className="text-xs text-gray-500">This vendor doesn't have any available items right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {listings.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Vendor Reviews & Rating Section */}
      <VendorReviews vendorId={sellerId} vendorName={vendorName} />

    </div>
  );
}