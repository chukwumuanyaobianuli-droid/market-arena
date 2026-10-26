import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { MapPin, Phone, MessageCircle, ArrowLeft, ShieldAlert, AlertCircle } from 'lucide-react';
import { whatsappLink, telLink } from '../utils/phone';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State for reporting modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await addDoc(collection(db, 'reports'), {
        itemId: id,
        itemTitle: item?.title || 'Item',
        sellerId: item?.sellerId || '',
        reason: reportReason,
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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() });
        } else {
          setItem(null);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-sm">Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Item not found</h2>
        <p className="text-xs text-gray-500 mb-4">This listing may have been sold or removed.</p>
        <button onClick={() => navigate('/')} className="bg-brand-600 text-white text-xs px-4 py-2 rounded-xl">
          Back to Home
        </button>
      </div>
    );
  }

  const formattedPrice = Number(item.price).toLocaleString();
  const isSold = item.status === 'sold';
  const whatsappUrl = whatsappLink(item.whatsappNumber, `Hi, is this still available: ${item.title}? (from Market Arena)`);
  const phoneUrl = telLink(item.whatsappNumber);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-brand-600 mb-4 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit cursor-pointer"
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
              src={item.images?.[activeImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {item.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${activeImageIndex === idx ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {item.condition}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <p className="text-2xl font-extrabold text-brand-700 mb-4">₦{formattedPrice}</p>

            <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl">
              <MapPin className="w-4 h-4 text-brand-600 mr-1.5 shrink-0" />
              <span>Location: <strong className="text-gray-800">{item.location}</strong></span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{item.description}</p>
            </div>
          </div>

          {/* Seller Card & Contact Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold">
                {item.sellerName?.[0]}
              </div>
              <div>
                <p className="text-xs text-gray-400">Seller</p>
                <p className="text-sm font-bold text-gray-800">{item.sellerName}</p>
              </div>
            </div>

            {isSold && (
              <div className="text-center text-xs font-medium text-red-600 bg-red-50 p-3 rounded-xl">
                This item has been sold.
              </div>
            )}

            {!isSold && !whatsappUrl && (
              <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
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
                    className="flex items-center justify-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={phoneUrl}
                    className="flex items-center justify-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Seller</span>
                  </a>
                </div>

                {/* Share to WhatsApp Button */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this item on Market Arena! 🛒\n*${item?.title || 'Product'}*\nPrice: ₦${Number(item?.price || 0).toLocaleString()}\nLocation: ${item?.location || 'Calabar'}\n\nView here: ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Share to WhatsApp</span>
                </a>
              </div>
            )}

            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Meet in safe public spots like UNICAL campus or Marian Road.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Report Listing Button & Modal */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>Listing ID: {id}</span>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 cursor-pointer"
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
              <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl text-center font-medium">
                Report submitted successfully. Our admin team will review it.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <textarea
                  rows="3"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g., Fake price, scammer asking for prepayment..."
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer"
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