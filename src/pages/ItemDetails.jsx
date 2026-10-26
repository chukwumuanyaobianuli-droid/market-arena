import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Phone, MessageCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { whatsappLink, telLink } from '../utils/phone';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
        className="flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-brand-600 mb-4 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit"
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
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${activeImageIndex === idx ? 'border-brand-600' : 'border-transparent'}`}
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
            <div className="grid grid-cols-2 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={phoneUrl}
                className="flex items-center justify-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Seller</span>
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

    </div>
  );
}