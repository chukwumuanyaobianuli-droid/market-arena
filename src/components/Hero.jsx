import React from 'react';
import { Search, PlusCircle, ShieldCheck, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText'; // Ensure path matches your project structure

export default function Hero({ searchTerm = '', setSearchTerm, selectedCategory = '', setSelectedCategory }) {
  const navigate = useNavigate();

  const handlePostClick = () => {
    navigate('/post-item');
  };

  const handleCategoryClick = (cat) => {
    if (setSelectedCategory) {
      setSelectedCategory(selectedCategory === cat ? '' : cat);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-gradient-to-b from-emerald-50/80 via-white to-white border border-gray-100 overflow-hidden pt-8 pb-14 px-4 sm:px-6 rounded-3xl mb-6 shadow-sm"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Pill Tag with subtle scale-blur reveal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-xs font-bold text-[#064E3B] tracking-wide">
                Calabar's Premium Verified Marketplace
              </span>
            </motion.div>

            {/* Smooth Word-by-Word Headline Reveal */}
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
              <AnimatedText text="Shop, Sell & Grow Across" className="inline-block" />{" "}
              <motion.span 
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-gradient-to-r from-[#064E3B] via-[#16a34a] to-[#22C55E] bg-clip-text text-transparent inline-block"
              >
                Calabar
              </motion.span>
            </h1>

            {/* Smooth Blurred Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed max-w-xl"
            >
              Buy directly from verified sellers in UNICAL, Etta Agbo, Marian Road, Satellite Town, and across Calabar with zero hassle.
            </motion.p>

            {/* Search Box Float-In */}
            <motion.div 
              initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white p-2.5 rounded-2xl shadow-xl shadow-emerald-950/5 border border-gray-200/80 flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
            >
              <div className="flex items-center w-full px-3 py-2">
                <Search className="w-5 h-5 text-[#22C55E] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search phones, hostels, fashion, services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-gray-800 focus:outline-none placeholder-gray-400 bg-transparent"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handlePostClick}
                className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Ad</span>
              </motion.button>
            </motion.div>

            {/* Quick Category Filter Pills */}
            <motion.div 
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap items-center gap-2 pt-1 text-xs"
            >
              <span className="text-gray-400 font-medium mr-1 text-[11px]">Popular:</span>
              {['Hostels & Rooms', 'Phones & Laptops', 'Fashion & Wear', 'Services'].map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#064E3B] text-white shadow-md'
                      : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#064E3B] border border-gray-200/60'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>

            {/* Badges */}
            <div className="pt-2 flex items-center space-x-6 text-xs font-semibold text-gray-500">
              <div className="flex items-center space-x-1.5 text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Verified Local Sellers</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-700">
                <MapPin className="w-4 h-4 text-[#22C55E]" />
                <span>All Calabar Locations</span>
              </div>
            </div>

          </div>

          {/* Right Column Visual Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative mx-auto w-full max-w-md">
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="bg-gradient-to-br from-[#064E3B] to-[#16a34a] p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured Store
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">Got items to sell in Calabar?</h3>
                <p className="text-xs text-emerald-100/90 mb-6 leading-relaxed">
                  Join hundreds of top vendors, residents, and businesses reaching buyers daily.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handlePostClick}
                  className="w-full bg-white text-[#064E3B] hover:bg-emerald-50 font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Start Selling Now</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center space-x-3">
                <div className="w-9 h-9 bg-emerald-100 text-[#22C55E] rounded-xl flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Direct WhatsApp Chat</p>
                  <p className="text-[10px] text-gray-500">No middleman fees</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}