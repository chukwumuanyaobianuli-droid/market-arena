// One place for lists used across the app
export const LOCATIONS = [
  'UNICAL',
  'UNICROSS',
  'Etta Agbo',
  'Marian Road',
  'Watt Market',
  'Satellite Town',
  'Atimbo',
  'State Housing',
];

export const CATEGORIES = ['Gadgets', 'Fashion', 'Hostel Gear', 'Vehicles', 'Services', 'Books'];

export const CONDITIONS = ['Brand New', 'Used - Like New', 'Fair'];

// Boost (featured listing) plans. Price is in Naira.
export const BOOST_PLANS = [
  { id: '3d', days: 3, price: 500, label: '3 days' },
  { id: '7d', days: 7, price: 1000, label: '7 days' },
];

// A listing is "boosted" only while its boost time has not finished
export const isBoosted = (item) =>
  !!item?.isFeatured && (!item.featuredUntil || item.featuredUntil > Date.now());
