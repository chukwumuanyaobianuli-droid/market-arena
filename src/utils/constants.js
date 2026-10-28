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

export const CATEGORIES = [
  'Gadgets',
  'Fashion',
  'Hostel Gear',
  'Vehicles',
  'Services',
  'Books',
  'Others'
];

// Boost (featured listing) plans. Price is in Naira.
export const BOOST_PLANS = [
  { id: '3d', days: 3, price: 500, label: '3 days' },
  { id: '7d', days: 7, price: 1000, label: '7 days' },
];

// Monetization Plans for Banners, Hostels, and Vendor Stores
export const MONETIZATION_PLANS = {
  BANNER_ADS: [
    { id: 'banner_weekly', label: '1 Week Banner Ad', price: 2500 },
    { id: 'banner_monthly', label: '1 Month Banner Ad', price: 8000 }
  ],
  HOSTEL_LISTINGS: [
    { id: 'hostel_single', label: 'Hostel Agent Single Post', price: 1500 },
    { id: 'hostel_unlimited', label: 'Hostel Agent Monthly Pass', price: 5000 }
  ],
  VENDOR_STORE_SUBSCRIPTIONS: [
    { id: 'vendor_pro_monthly', label: 'Vendor Store Pro (Unlimited Post + Badge)', price: 3000 }
  ]
};

// A listing is "boosted" only while its boost time has not finished
export const isBoosted = (item) =>
  !!item?.isFeatured && (!item.featuredUntil || item.featuredUntil > Date.now());