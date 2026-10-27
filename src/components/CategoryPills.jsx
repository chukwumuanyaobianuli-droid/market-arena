import React from 'react';
import { Smartphone, Shirt, Home, Car, Wrench, BookOpen, Layers, Package } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

// Map icons to your exact category names
const CATEGORY_ICONS = {
  'Gadgets': Smartphone,
  'Fashion': Shirt,
  'Hostel Gear': Home,
  'Vehicles': Car,
  'Services': Wrench,
  'Books': BookOpen,
  'Others': Package
};

export default function CategoryPills({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="my-6 px-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
        {/* All Pill */}
        <button
          onClick={() => setSelectedCategory('All')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
            selectedCategory === 'All'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All</span>
        </button>

        {/* Dynamic Pills from constants.js */}
        {CATEGORIES.map((catName) => {
          const Icon = CATEGORY_ICONS[catName] || Package;
          const isSelected = selectedCategory === catName;

          return (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{catName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}