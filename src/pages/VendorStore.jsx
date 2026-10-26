import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, Store, ShieldCheck } from 'lucide-react';

export default function VendorStore() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [sellerName, setSellerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorListings = async () => {
      try {
        const q = query(
          collection(db, 'listings'),
          where('sellerId', '==', sellerId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedItems = [];
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() });
        });

        setItems(fetchedItems);
        if (fetchedItems.length > 0) {
          setSellerName(fetchedItems[0].sellerName || 'Vendor');
        }
      } catch (err) {
        console.error('Error fetching vendor items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchVendorListings();
    }
  }, [sellerId]);

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading vendor store...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1 text-xs font-medium text-gray-600 mb-6 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Vendor Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex items-center space-x-4">
        <div className="w-14 h-14 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
          <Store className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-gray-900">{sellerName}'s Store</h1>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Campus Vendor</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {items.length} active {items.length === 1 ? 'listing' : 'listings'} on Market Arena
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-600">This vendor has no active listings right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}