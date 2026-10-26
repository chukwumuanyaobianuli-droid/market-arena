import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ShieldCheck, ShieldAlert, Trash2, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'users'
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all listings and users safely
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from 'items' collection
      const itemsSnap = await getDocs(collection(db, 'items'));
      let fetchedItems = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // If 'items' is empty, try fetching from 'listings' collection as fallback
      if (fetchedItems.length === 0) {
        const listingsSnap = await getDocs(collection(db, 'listings'));
        fetchedItems = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setListings(fetchedItems);

      // 2. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(fetchedUsers);

      console.log('Admin loaded items:', fetchedItems.length, 'users:', fetchedUsers.length);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Action: Toggle Verified Seller Badge on User Doc
  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVerified: !currentStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
      alert(`User verification status updated to: ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update user status. Check console.');
    }
  };

  // Action: Delete Listing
  const handleDeleteListing = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;

    try {
      // Try deleting from 'items' first, then 'listings'
      await deleteDoc(doc(db, 'items', itemId)).catch(() => deleteDoc(doc(db, 'listings', itemId)));
      setListings(listings.filter(item => item.id !== itemId));
      alert('Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing.');
    }
  };

  const filteredListings = listings.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-[#064E3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="bg-[#22C55E] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
              ADMIN CONTROL PANEL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Market Arena Management</h1>
            <p className="text-xs text-emerald-100 mt-1">Approve verified seller badges and remove scam posts across Calabar.</p>
          </div>
          <button 
            onClick={fetchData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            Refresh Data 🔄
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Total Listings</div>
            <div className="text-xl font-black text-white">{listings.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Registered Users</div>
            <div className="text-xl font-black text-white">{users.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-xs text-emerald-200">Verified Vendors</div>
            <div className="text-xl font-black text-[#22C55E]">
              {users.filter(u => u.isVerified).length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings' 
                ? 'bg-[#064E3B] text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-[#064E3B] text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Users ({users.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'listings' ? "Search listings..." : "Search users..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#22C55E]"
          />
        </div>
      </div>

      {/* Tab 1: Listings Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-12">Loading platform listings...</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No listings found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-400">{item.category} • {item.location || 'Calabar'}</div>
                      </td>
                      <td className="p-4 font-extrabold text-[#064E3B]">
                        ₦{Number(item.price || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/vendor/${item.sellerId}`} 
                          className="font-semibold text-gray-700 hover:text-[#22C55E] flex items-center gap-1"
                        >
                          {item.sellerName || 'Vendor'}
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </Link>
                      </td>
                      <td className="p-4">
                        {item.isBoosted ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ⚡ Boosted
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl border border-red-200 transition-all cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users & Verification Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-12">Loading user accounts...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No users found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">User Info</th>
                    <th className="p-4">Badge Status</th>
                    <th className="p-4 text-right">Toggle Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{u.displayName || 'Unnamed User'}</div>
                        <div className="text-[11px] text-gray-400">{u.email || u.id}</div>
                      </td>
                      <td className="p-4">
                        {u.isVerified ? (
                          <span className="bg-emerald-100 text-[#064E3B] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Verified Seller
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5 text-gray-400" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleUserVerification(u.id, u.isVerified)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer ${
                            u.isVerified 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-[#22C55E] text-white hover:bg-[#16a34a]'
                          }`}
                        >
                          {u.isVerified ? 'Revoke Badge' : 'Approve Badge'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}