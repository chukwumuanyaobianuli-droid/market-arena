import React from 'react';
import { Search, MapPin } from 'lucide-react';

export default function Hero({ searchTerm, setSearchTerm, selectedLocation, setSelectedLocation }) {
  const locations = [
    'All Locations',
    'UNICAL',
    'UNICROSS',
    'Etta Agbo',
    'Marian Road',
    'Watt Market',
    'Satellite Town',
    'Atimbo',
    'State Housing'
  ];

  return (
    <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white py-8 px-4 sm:px-6 lg:px-8 rounded-b-2xl shadow-md">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Buy & Sell Quickly in Calabar
        </h1>
        <p className="mt-2 text-brand-100 text-sm sm:text-base">
          Find gadgets, hostel gear, fashion & services near UNICAL, Etta Agbo, Marian & more.
        </p>

        {/* Search & Location Filter Bar */}
        <div className="mt-6 bg-white p-2 rounded-xl shadow-lg flex flex-col sm:flex-row gap-2 text-gray-800">
          
          {/* Location Selector */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 sm:w-1/3">
            <MapPin className="w-5 h-5 text-brand-600 shrink-0 mr-2" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm font-medium text-gray-700 cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 sm:w-2/3">
            <Search className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search phones, laptops, mattresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm text-gray-800 placeholder-gray-400"
            />
          </div>

        </div>
      </div>
    </div>
  );
}