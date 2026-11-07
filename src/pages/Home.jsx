import React, { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PackageOpen, AlertCircle, Eye, MapPin } from 'lucide-react';
import { db } from '../firebase/firebase';
import Hero from '../components/Hero';
import CategoryPills from '../components/CategoryPills';
import { isBoosted } from '../utils/constants';
import HomeBrandsSection from '../components/HomeBrandsSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(PAGE_SIZE);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
        const boostedDiff = Number(isBoosted(b)) - Number(isBoosted(a));
        if (boostedDiff !== 0) return boostedDiff;

        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;

        const timeA = a.createdAt?.seconds || new Date(a.createdAt || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.createdAt || 0).getTime() / 1000;
        return timeB - timeA;
      });
  }, [items, searchTerm, selectedLocation, selectedCategory, sortBy, minPrice, maxPrice]);

  const canLoadMore = !loading && !error && items.length >= count;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
    >
      <Hero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <CategoryPills selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      <div className="max-w-7xl mx-auto">
        <HomeBrandsSection />
      </div>

      {/* Sort & Price Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs font-bold text-gray-700 flex items-center space-x-2 w-full md:w-auto">
          <span>Filter & Sort Listings ({visibleItems.length} found)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#22C55E] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

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

      <div>
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
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {visibleItems.map((item, index) => {
                const isFeaturedItem = item.isFeatured && item.featuredUntil > Date.now();
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.03 }}
                  >
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="h-full"
                    >
                      <Link
                        to={`/item/${item.id}`}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 block overflow-hidden h-full flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-square relative overflow-hidden bg-gray-100">
                            {isFeaturedItem && (
                              <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-md border border-amber-200 tracking-wider flex items-center gap-1">
                                ⭐ FEATURED
                              </span>
                            )}
                            <img
                              src={item.images?.[0] || item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                              <Eye className="w-3 h-3 text-emerald-400" /> {item.views || 0}
                            </span>
                          </div>

                          <div className="p-3">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {item.category}
                            </span>
                            <h3 className="text-xs font-bold text-gray-800 line-clamp-1 mt-1.5 group-hover:text-[#22C55E] transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-3 pt-0">
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className="text-xs font-extrabold text-[#22C55E]">
                              ₦{Number(item.price).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" /> {item.location?.split(',')[0]}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
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
    </motion.div>
  );
}