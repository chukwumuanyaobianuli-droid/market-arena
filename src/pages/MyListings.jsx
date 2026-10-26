import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import {
  collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { Trash2, CheckCircle, Plus, ShoppingBag, Zap, AlertCircle } from 'lucide-react';
import { BOOST_PLANS, isBoosted } from '../utils/constants';

export default function MyListings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [boostOpen, setBoostOpen] = useState(null); // id of the item showing boost plans
  const [notice, setNotice] = useState(null); // { type: 'error' | 'success', text }

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'listings'), where('sellerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setMyItems(items);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      setNotice({ type: 'error', text: 'Could not load your listings. Check your network.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [currentUser]);

  // Mark an item as Sold
  const handleMarkAsSold = async (id) => {
    try {
      setActionLoading(id);
      await updateDoc(doc(db, 'listings', id), { status: 'sold' });
      setMyItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'sold' } : item)));
    } catch (error) {
      console.error('Error updating status:', error);
      setNotice({ type: 'error', text: 'Could not mark as sold. Try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete listing from Firestore
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      setActionLoading(id);
      await deleteDoc(doc(db, 'listings', id));
      setMyItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
      setNotice({ type: 'error', text: 'Could not delete this listing. Try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  // After Paystack says payment is OK: pin the listing and save the payment record
  const finishBoost = async (item, plan, reference) => {
    try {
      const featuredUntil = Date.now() + plan.days * 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, 'listings', item.id), { isFeatured: true, featuredUntil });
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        listingId: item.id,
        amount: plan.price,
        type: 'featured_boost',
        paystackReference: reference,
        status: 'success',
        createdAt: serverTimestamp()
      });
      setMyItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFeatured: true, featuredUntil } : i))
      );
      setNotice({ type: 'success', text: `Done! "${item.title}" is featured for ${plan.label}.` });
    } catch (error) {
      console.error('Boost save error:', error);
      setNotice({
        type: 'error',
        text: `Payment received but we could not feature the item. Save this reference and contact support: ${reference}`
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open the Paystack payment window
  const handleBoost = (item, plan) => {
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      return setNotice({ type: 'error', text: 'Boost is not ready. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.' });
    }
    if (!window.PaystackPop) {
      return setNotice({ type: 'error', text: 'Payment window did not load. Check your network and try again.' });
    }

    setBoostOpen(null);
    setActionLoading(item.id);

    const handler = window.PaystackPop.setup({
      key,
      email: currentUser.email,
      amount: plan.price * 100, // Paystack uses kobo
      currency: 'NGN',
      ref: `MA-${item.id.slice(0, 6)}-${Date.now()}`,
      metadata: { listingId: item.id, plan: plan.id },
      // Paystack wants a normal function here, not an async one
      callback: function (response) {
        finishBoost(item, plan, response.reference);
      },
      onClose: function () {
        setActionLoading(null);
      }
    });
    handler.openIframe();
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-sm">Loading your listings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
          <p className="text-xs text-gray-500">Manage your active products and sales status</p>
        </div>

        <Link
          to="/post-item"
          className="flex items-center space-x-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Item</span>
        </Link>
      </div>

      {notice && (
        <div
          className={`mb-4 p-3 text-xs rounded-xl flex items-start space-x-2 border ${
            notice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{notice.text}</span>
          <button onClick={() => setNotice(null)} className="font-bold">×</button>
        </div>
      )}

      {myItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No listings yet</h3>
          <p className="text-xs text-gray-500 mb-4">You haven't posted any items for sale yet.</p>
          <Link
            to="/post-item"
            className="inline-block bg-brand-600 text-white text-xs font-medium px-4 py-2 rounded-xl"
          >
            Sell Your First Item
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to={`/item/${item.id}`} className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                      {item.status === 'sold' ? (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          SOLD
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          ACTIVE
                        </span>
                      )}
                      {isBoosted(item) && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-sm font-bold text-brand-700">₦{Number(item.price).toLocaleString()}</p>
                  </div>
                </Link>

                {/* Controls */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {item.status !== 'sold' && !isBoosted(item) && (
                    <button
                      onClick={() => setBoostOpen(boostOpen === item.id ? null : item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center space-x-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Boost</span>
                    </button>
                  )}

                  {item.status !== 'sold' && (
                    <button
                      onClick={() => handleMarkAsSold(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center space-x-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark as Sold</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoading === item.id}
                    className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Boost plans */}
              {boostOpen === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Pin this item at the top of the home page with a FEATURED badge:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BOOST_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleBoost(item, plan)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
                      >
                        ₦{plan.price.toLocaleString()} for {plan.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
