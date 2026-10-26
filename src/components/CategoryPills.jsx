import React from 'react';
import { Smartphone, Shirt, Home, Car, Wrench, BookOpen, Layers } from 'lucide-react';

export default function CategoryPills({ selectedCategory, setSelectedCategory }) {
  const categories = [
    { name: 'All', icon: Layers },
    { name: 'Gadgets', icon: Smartphone },
    { name: 'Fashion', icon: Shirt },
    { name: 'Hostel Gear', icon: Home },
    { name: 'Vehicles', icon: Car },
    { name: 'Services', icon: Wrench },
    { name: 'Books', icon: BookOpen },
  ];

  return (
    <div className="my-6 px-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}