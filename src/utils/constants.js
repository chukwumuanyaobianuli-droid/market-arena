// One place for lists used across the app
export const CONDITIONS = [
  'Brand New',
  'UK Used (Foreign Used)',
  'Nigerian Used (Clean)',
  'Fairly Used'
];

export const LOCATIONS = [
  'UNICAL Campus (Malabor)',
  'UNICROSS',
  'Etta Agbo',
  'Marian Road',
  'Watt Market',
  'Satellite Town',
  'Atimbo',
  'State Housing',
  'Parliamentary Extension',
  '8 Miles',
  'Ikot Ansa',
  'Goldie',
  'Effio Ette'
];
// src/utils/constants.js

export const CATEGORIES = [
  "Hostels & Rooms",
  "Phones & Laptops",
  "Electronics",
  "Fashion & Wear",
  "Books & Study Materials",
  "Vehicles",
  "Services",
  "Others"
];



// Boost (featured listing) plans. Price is in Naira.
export const BOOST_PLANS = [
  { id: '3d', days: 3, price: 500, label: '3 days' },
  { id: '7d', days: 7, price: 1000, label: '7 days' },
];

// A listing is "boosted" only while its boost time has not finished
export const isBoosted = (item) =>
  !!item?.isFeatured && (!item.featuredUntil || item.featuredUntil > Date.now());
