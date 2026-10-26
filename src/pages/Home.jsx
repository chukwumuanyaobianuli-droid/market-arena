import React, { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PackageOpen, AlertCircle } from 'lucide-react';
import { db } from '../firebase/firebase';
import Hero from '../components/Hero';
import CategoryPills from '../components/CategoryPills';
import ProductCard from '../components/ProductCard';
import { isBoosted } from '../utils/constants';

const PAGE_SIZE = 20;

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(PAGE_SIZE);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load newest listings. "Load more" makes count bigger.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(count));
        const snap = await getDocs(q);
        if (!cancelled) {
          setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('Error loading listings:', err);
        if (!cancelled) setError('Could not load items. Check your network and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [count]);

  // Filter, search and put boosted items first
  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => item.status !== 'sold')
      .filter((item) => selectedLocation === 'All Locations' || item.location === selectedLocation)
      .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
      .filter(
        (item) =>
          !term ||
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      )
      .sort((a, b) => Number(isBoosted(b)) - Number(isBoosted(a)));
  }, [items, searchTerm, selectedLocation, selectedCategory]);

  const canLoadMore = !loading && !error && items.length >= count;

  return (
    <div>
      <Hero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      <CategoryPills selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading items...</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800 mb-1">No items found</h3>
            <p className="text-xs text-gray-500">Try another category, location or search word.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {canLoadMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setCount((c) => c + PAGE_SIZE)}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm"
            >
              Load more
            </button>
          </div>
        )}

        {loading && items.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">Loading more...</p>
        )}
      </div>
    </div>
  );
}
