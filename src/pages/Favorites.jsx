import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { optimizeImage } from '../utils/imageUpload';

export default function Favorites() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchSavedItems = async () => {
      try {
        // 1. Get user document to read savedItemIds array
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const favoriteIds = userData.savedItemIds || [];

          if (favoriteIds.length > 0) {
            // Firestore 'in' query allows up to 30 IDs per batch
            const chunks = [];
            for (let i = 0; i < favoriteIds.length; i += 10) {
              chunks.push(favoriteIds.slice(i, i + 10));
            }

            let loadedListings = [];
            for (const chunk of chunks) {
              const q = query(collection(db, 'listings'), where(documentId(), 'in', chunk));
              const querySnap = await getDocs(q);
              querySnap.forEach((docSnap) => {
                loadedListings.push({ id: docSnap.id, ...docSnap.data() });
              });
            }

            setSavedItems(loadedListings);
          } else {
            setSavedItems([]);
          }
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 px-4">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-800 mb-1">Please log in</h2>
        <p className="text-xs text-gray-500 mb-4">You need an account to save favorite items.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#22C55E] text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-sm">Loading your favorites...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>My Favorite Items</span>
          </h1>
          <p className="text-xs text-gray-500">Items you've bookmarked for later</p>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-6">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-700">No favorite items yet</h3>
          <p className="text-xs text-gray-400 mb-4">Tap the heart icon on any listing to bookmark it here.</p>
          <Link to="/" className="inline-block bg-[#22C55E] text-white text-xs px-4 py-2 rounded-xl font-bold">
            Browse Market Arena
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {savedItems.map((item) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img
                    src={optimizeImage(item.images?.[0] || item.imageUrl, 400)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    ₦{Number(item.price || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{item.title}</h3>
                  <div className="flex items-center text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3 text-[#22C55E] mr-1 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}