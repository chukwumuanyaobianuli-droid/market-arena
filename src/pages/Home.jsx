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

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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

  // Filter, search, price range and sort items (Boosted items stay on top)
  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => item.status !== 'sold')
      .filter((item) => selectedLocation === 'All Locations' || item.location === selectedLocation)
      .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
      .filter((item) => {
        const price = Number(item.price) || 0;
        const matchesMin = minPrice ? price >= Number(minPrice) : true;
        const matchesMax = maxPrice ? price <= Number(maxPrice) : true;
        return matchesMin && matchesMax;
      })
      .filter(
        (item) =>
          !term ||
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        // 1st Priority: Boosted items always come first
        const boostedDiff = Number(isBoosted(b)) - Number(isBoosted(a));
        if (boostedDiff !== 0) return boostedDiff;

        // 2nd Priority: User selected sorting
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;

        // Default ('newest'): latest creation date first
        const timeA = a.createdAt?.seconds || new Date(a.createdAt || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.createdAt || 0).getTime() / 1000;
        return timeB - timeA;
      });
  }, [items, searchTerm, selectedLocation, selectedCategory, sortBy, minPrice, maxPrice]);

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

      {/* Sort & Price Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-xs font-bold text-gray-700 flex items-center space-x-2 w-full md:w-auto">
            <span>Filter & Sort Listings ({visibleItems.length} found)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Min Price */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-gray-400 mr-1">₦</span>
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 bg-transparent focus:outline-none text-gray-800 font-medium"
              />
            </div>

            <span className="text-gray-300">-</span>

            {/* Max Price */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-gray-400 mr-1">₦</span>
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 bg-transparent focus:outline-none text-gray-800 font-medium"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Clear Filters Button */}
            {(minPrice || maxPrice || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSortBy('newest');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}

          </div>
        </div>
      </div>

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
            <p className="text-xs text-gray-500">Try another category, location, price range or search word.</p>
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
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
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