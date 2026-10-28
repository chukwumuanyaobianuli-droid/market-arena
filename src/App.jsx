import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import MyListings from './pages/MyListings';
import VendorStore from './pages/VendorStore';
import Admin from './pages/Admin';
import EditItem from './pages/EditItem';
import Policies from './pages/Policies';
import InstallPromptModal from './components/InstallPromptModal';
import Favorites from './pages/Favorites';

// Go to top of the page every time the route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="text-center py-20 px-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Page not found</h2>
      <p className="text-xs text-gray-500 mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="inline-block bg-brand-600 text-white text-xs px-4 py-2 rounded-xl">
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col justify-between bg-gray-50 font-sans text-gray-900">
        <div>
          <Navbar />
         <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/favorites" element={<Favorites />} /> {/* 👈 HERE */}
  <Route path="/post-item" element={<PostItem />} />
  <Route path="/item/:id" element={<ItemDetails />} />
  <Route path="/my-listings" element={<MyListings />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/vendor/:sellerId" element={<VendorStore />} />
  <Route path="/edit/:id" element={<EditItem />} />
  <Route path="/policies" element={<Policies />} />
  <Route path="*" element={<NotFound />} />
</Routes>
        </div>
        
        {/* PWA Install Modal lives safely outside Routes */}
        <InstallPromptModal />
        
        <Footer />
      </div>
    </Router>
  );
}