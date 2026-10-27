import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { optimizeImage } from '../utils/imageUpload';
import { db } from '../firebase/firebase';
import { addDoc, collection, doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { MapPin, Phone, MessageCircle, ArrowLeft, ShieldAlert, AlertCircle, Eye, Share2, Pencil } from 'lucide-react';
import { whatsappLink, telLink } from '../utils/phone';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State for reporting modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Load item & increment view count atomically
  useEffect(() => {
    let isMounted = true;

    const fetchItemAndIncrementView = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() };
          if (isMounted) setItem(itemData);

          // Count one view per visitor per session (not the owner)
          try {
            const viewedKey = `viewed_${id}`;
            const isOwner = currentUser?.uid && currentUser.uid === itemData.sellerId;
            if (!isOwner && !sessionStorage.getItem(viewedKey)) {
              sessionStorage.setItem(viewedKey, '1');
              updateDoc(docRef, { views: increment(1) }).catch(() => {});
            }
          } catch {
            // storage blocked: skip counting
          }
        } else {
          if (isMounted) setItem(null);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchItemAndIncrementView();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle tracking WhatsApp clicks
  const handleWhatsAppClick = async () => {
    try {
      const docRef = doc(db, 'listings', id);
      await updateDoc(docRef, {
        whatsappClicks: increment(1)
      });
    } catch (err) {
      console.error('Error tracking WhatsApp click:', err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    if (!currentUser) {
      alert('Please log in to report a listing.');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        itemId: id,
        itemTitle: item?.title || 'Item',
        sellerId: item?.sellerId || '',
        reporterId: currentUser.uid,
        reason: reportReason.trim().slice(0, 500),
        createdAt: serverTimestamp(),
      });

      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportReason('');
      }, 2000);
    } catch (err) {
      console.error('Error reporting item:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-sm">Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Item not found</h2>
        <p className="text-xs text-gray-500 mb-4">This listing may have been sold or removed.</p>
        <button onClick={() => navigate('/')} className="bg-[#22C55E] text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer">
          Back to Home
        </button>
      </div>
    );
  }

  const formattedPrice = Number(item.price || 0).toLocaleString();
  const isSold = item.status === 'sold';
  const whatsappUrl = whatsappLink(item.whatsappNumber, `Hi, is this still available: ${item.title}? (from Market Arena)`);
  const phoneUrl = telLink(item.whatsappNumber);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-[#064E3B] mb-4 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Images Section */}
        <div>
          <div className="relative h-72 sm:h-80 bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-200">
            {isSold && (
              <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">SOLD</div>
            )}
            <img 
              src={optimizeImage(item.images?.[activeImageIndex] || item.imageUrl, 900) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {item.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${activeImageIndex === idx ? 'border-[#22C55E]' : 'border-transparent'}`}
                >
                  <img src={optimizeImage(img, 160)} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="bg-emerald-50 text-[#064E3B] text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                {item.category}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {item.condition || 'Used'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{item.title}</h1>
            <p className="text-2xl font-black text-[#22C55E] mb-3">₦{formattedPrice}</p>

            {/* View & Engagement Counters */}
            <div className="flex items-center space-x-4 text-xs font-semibold text-gray-500 mb-4 py-2 px-3 bg-gray-50 rounded-xl w-fit border border-gray-100">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Eye className="w-4 h-4 text-gray-400" />
                <span>{item.views || 0} Views</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>{item.whatsappClicks || 0} Inquiries</span>
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-600 mb-4 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
              <MapPin className="w-4 h-4 text-[#22C55E] mr-1.5 shrink-0" />
              <span>Location: <strong className="text-gray-900 font-bold">{item.location}</strong></span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Description</h3>
              <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed">{item.description}</p>
            </div>
          </div>

          {/* Seller Card & Contact Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-[#064E3B] rounded-full flex items-center justify-center font-bold text-sm">
                {item.sellerName?.[0] || 'V'}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Seller</p>
                <Link to={`/vendor/${item.sellerId}`} className="text-sm font-bold text-gray-800 hover:text-[#22C55E]">{item.sellerName || 'Seller'}</Link>
              </div>
            </div>

            {isSold && (
              <div className="text-center text-xs font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                This item has been sold.
              </div>
            )}

            {!isSold && !whatsappUrl && (
              <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                The seller has not added a valid contact number.
              </div>
            )}

            {!isSold && whatsappUrl && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center space-x-1.5 bg-[#22C55E] hover:bg-[#16a34a] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={phoneUrl}
                    className="flex items-center justify-center space-x-1.5 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Seller</span>
                  </a>
                </div>

                {/* Share to WhatsApp Button */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this item on Market Arena! 🛒\n*${item?.title || 'Product'}*\nPrice: ₦${formattedPrice}\nLocation: ${item?.location || 'Calabar'}\n\nView here: ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Share to WhatsApp</span>
                </a>
              </div>
            )}

            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Meet in safe public spots like UNICAL campus or Marian Road.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Report Listing Button & Modal */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        {currentUser?.uid === item.sellerId ? (
          <Link to={`/edit/${id}`} className="text-[#064E3B] hover:text-[#22C55E] font-semibold flex items-center space-x-1">
            <Pencil className="w-4 h-4" />
            <span>Edit listing</span>
          </Link>
        ) : (
          <span>Listing ID: {id}</span>
        )}
        <button
          onClick={() => setShowReportModal(true)}
          className="text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Report this listing</span>
        </button>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-base font-bold text-gray-900 mb-2">Report Suspicious Listing</h3>
            <p className="text-xs text-gray-500 mb-4">
              Help keep Calabar students safe. Let us know why this listing is problematic.
            </p>

            {reportSubmitted ? (
              <div className="bg-emerald-50 text-[#064E3B] text-xs p-4 rounded-xl text-center font-semibold border border-emerald-100">
                Report submitted successfully. Our admin team will review it.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <textarea
                  rows="3"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g., Fake price, scammer asking for prepayment..."
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-gray-800"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}