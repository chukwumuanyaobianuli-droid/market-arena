import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function VendorReviews({ vendorId, vendorName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerName, setBuyerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!vendorId) {
        console.warn('VendorReviews: No vendorId provided!');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching reviews for vendorId:', vendorId);
        const q = query(
          collection(db, 'reviews'),
          where('vendorId', '==', vendorId)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReviews(fetched);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [vendorId]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!vendorId) {
      alert('Error: Vendor ID is missing.');
      return;
    }
    if (!buyerName.trim() || !comment.trim()) {
      alert('Please enter your name and a review comment.');
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        vendorId,
        buyerName: buyerName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      const newReview = {
        id: docRef.id,
        buyerName: buyerName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: { seconds: Date.now() / 1000 }
      };

      setReviews([newReview, ...reviews]);
      setBuyerName('');
      setComment('');
      setRating(5);
      setSuccessMsg('Review posted successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review. Please check your console.');
    } finally {
      setSubmitting(false);
    }
  };

  // If there's no vendorId yet, don't crash
  if (!vendorId) {
    return (
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-xs text-gray-400">
        Loading reviews module... (Waiting for vendor ID)
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#22C55E]" />
            Vendor Reviews & Ratings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified feedback from buyers who dealt with {vendorName || 'this vendor'}.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50/80 px-4 py-2.5 rounded-xl border border-emerald-100">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="text-sm font-black text-[#064E3B]">
            {avgRating} <span className="text-xs font-normal text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="mt-6 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Leave a Review for {vendorName}</h4>
        
        {successMsg && (
          <div className="mb-3 bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Your Name / Nickname</label>
            <input 
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. Emeka from UNICAL"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#22C55E]"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5.0 - Excellent Service</option>
              <option value="4">⭐⭐⭐⭐ 4.0 - Good & Reliable</option>
              <option value="3">⭐⭐⭐ 3.0 - Average</option>
              <option value="2">⭐⭐ 2.0 - Below Expectations</option>
              <option value="1">⭐ 1.0 - Poor</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Your Feedback / Experience</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="2"
            placeholder="How was your transaction? Were item details accurate?"
            required
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#22C55E]"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-5 py-2 rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Posting Review...' : 'Post Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 bg-gray-50/40 rounded-xl border border-dashed border-gray-200">
            No reviews yet. Be the first buyer to review this vendor!
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#064E3B] font-bold text-xs flex items-center justify-center">
                    {rev.buyerName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-bold text-xs text-gray-900">{rev.buyerName}</span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(Number(rev.rating || 5))].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}