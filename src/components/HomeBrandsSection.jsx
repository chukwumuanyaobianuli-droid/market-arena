import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ShieldCheck, Store, Sparkles, Search } from 'lucide-react';

export default function HomeBrandsSection() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const q = query(
          collection(db, 'brands'),
          where('subscriptionStatus', '==', 'active')
        );
        const snap = await getDocs(q);
        setBrands(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // Filter brands based on search input
  const filteredBrands = brands.filter((b) => 
    b.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="my-6">
      {/* 1. Brand Registration CTA Banner */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Market Arena for Businesses
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">Own a Business in Calabar?</h3>
          <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
            Create a verified brand storefront, get your custom link, upload unlimited listings, and boost trust with Calabar buyers.
          </p>
        </div>
        <Link
          to="/create-brand"
          className="bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-black px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2 border border-white/20"
        >
          <Store className="w-4 h-4" /> Create Brand Store
        </Link>
      </div>

      {/* 2. Top Brands Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Store className="w-4.5 h-4.5 text-[#22C55E]" /> Verified Brands & Stores
          </h2>
          <p className="text-xs text-gray-500">Explore official vendor storefronts in Calabar</p>
        </div>

        {/* Brand Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search brands or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#22C55E]"
          />
        </div>
      </div>

      {/* Brand Grid */}
      {filteredBrands.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">
          No brands found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {filteredBrands.map((b) => (
            <Link
              key={b.id}
              to={`/brand/${b.id}`}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow group flex flex-col items-center"
            >
              <img
                src={b.logoUrl || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef'}
                alt={b.brandName}
                className="w-14 h-14 rounded-full object-cover mb-2 border border-gray-100 group-hover:scale-105 transition-transform"
              />
              <div className="flex items-center gap-1 justify-center">
                <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{b.brandName}</h3>
                {b.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{b.category}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}