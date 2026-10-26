import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (currentUser && data.sellerId !== currentUser.uid) {
            navigate('/');
            return;
          }
          setTitle(data.title);
          setPrice(data.price);
          setDescription(data.description);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, currentUser, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'listings', id);
      await updateDoc(docRef, {
        title,
        price: Number(price),
        description,
      });
      navigate(`/item/${id}`);
    } catch (err) {
      setError('Failed to update listing.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xs text-gray-500">Loading item...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1 text-xs font-medium text-gray-600 mb-4 bg-white px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Edit Listing</h2>

        {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-3 rounded-xl cursor-pointer transition-colors"
          >
            {saving ? 'Saving Changes...' : 'Update Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}