import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Trash2, Search, ExternalLink, Store } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { isBoosted } from '../utils/constants';

export default function Admin() {
  const { currentUser, userProfile } = useAuth();
  
  // Robust admin check
  const ADMIN_EMAIL = 'chukwumuanyaobianuli@gmail.com';
  const isAdmin = userProfile?.role === 'admin' || (currentUser && currentUser.email === ADMIN_EMAIL);

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'users' | 'brands' | 'reports'
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all admin datasets
  const fetchData = async () => {
    setLoading(true);
    try {
      const listingsSnap = await getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(100)));
      setListings(listingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const brandsSnap = await getDocs(query(collection(db, 'brands'), limit(100)));
      setBrands(brandsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const reportsSnap = await getDocs(query(collection(db, 'reports'), limit(100)));
      setReports(reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  // Toggle Verified Seller Badge on User Doc
  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      const target = users.find((u) => u.id === userId) || {};
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isVerified: !currentStatus });
      await setDoc(doc(db, 'publicProfiles', userId), {
        isVerified: !currentStatus,
        displayName: target.displayName || '',
        location: target.location || ''
      }, { merge: true });
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
      alert(`User verification status updated to: ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update user status.');
    }
  };

  // Toggle Brand Verification Badge
  const toggleBrandVerification = async (brandId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'brands', brandId), { isVerified: !currentStatus });
      setBrands(brands.map(b => b.id === brandId ? { ...b, isVerified: !currentStatus } : b));
      alert(`Brand verification updated to: ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
    } catch (err) {
      console.error('Error updating brand verification:', err);
      alert('Failed to update brand verification.');
    }
  };

  // Delete Listing
  const handleDeleteListing = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await deleteDoc(doc(db, 'listings', itemId));
      setListings(listings.filter(item => item.id !== itemId));
      alert('Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing.');
    }
  };

  // Delete Reported Listing
  const handleDeleteReportedItem = async (listingId, reportId) => {
    if (!window.confirm('Are you sure you want to delete this reported listing and clear the report?')) return;
    try {
      if (listingId) {
        await deleteDoc(doc(db, 'listings', listingId));
        setListings(listings.filter(item => item.id !== listingId));
      }
      await deleteDoc(doc(db, 'reports', reportId));
      setReports(reports.filter((r) => r.id !== reportId));
      alert('Reported listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting reported listing:', err);
      alert('Failed to delete listing.');
    }
  };

  // Dismiss a report
  const handleDeleteReport = async (reportId) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to dismiss report.');
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

  const filteredBrands = brands.filter(b =>
    b.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) return <Navigate to="/" replace />;

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
            <p className="text-xs text-emerald-100 mt-1">Approve verified badges, monitor brand storefronts, and moderate Calabar listings.</p>
          </div>
          <button 
            onClick={fetchData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            Refresh Data 🔄
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Total Listings</div>
            <div className="text-xl font-black text-white">{listings.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Registered Users</div>
            <div className="text-xl font-black text-white">{users.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Verified Brands</div>
            <div className="text-xl font-black text-[#22C55E]">
              {brands.filter(b => b.isVerified).length}
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200">Pending Reports</div>
            <div className="text-xl font-black text-amber-300">{reports.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'brands' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Brands ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports ({reports.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records..."
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
            <p className="text-center text-xs text-gray-400 py-12">Loading listings...</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No listings found.</p>
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
                        <Link to={`/vendor/${item.sellerId}`} className="font-semibold text-gray-700 hover:text-[#22C55E] flex items-center gap-1">
                          {item.sellerName || 'Vendor'} <ExternalLink className="w-3 h-3 text-gray-400" />
                        </Link>
                      </td>
                      <td className="p-4">
                        {isBoosted(item) ? (
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
            <p className="text-center text-xs text-gray-400 py-12">No users found.</p>
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

      {/* Tab 3: Brand Storefronts Moderation */}
      {activeTab === 'brands' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-12">Loading brand storefronts...</p>
          ) : filteredBrands.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No registered brand stores yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Brand Store</th>
                    <th className="p-4">Category / Plan</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBrands.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={b.logoUrl || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef'} alt="" className="w-9 h-9 rounded-xl object-cover" />
                          <div>
                            <Link to={`/brand/${b.id}`} className="font-bold text-gray-900 hover:text-[#22C55E] flex items-center gap-1">
                              {b.brandName} <ExternalLink className="w-3 h-3 text-gray-400" />
                            </Link>
                            <div className="text-[11px] text-gray-400">{b.location || 'Calabar'} • {b.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800">{b.category}</span>
                        <div className="text-[11px] uppercase text-amber-600 font-bold">{b.subscriptionPlan || 'Monthly'} Pass</div>
                      </td>
                      <td className="p-4">
                        {b.isVerified ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verified Brand
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-full w-fit">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleBrandVerification(b.id, b.isVerified)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            b.isVerified
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {b.isVerified ? 'Revoke Verified' : 'Verify Brand'}
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

      {/* Tab 4: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-12">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No reports. All clear.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {reports.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      to={`/item/${r.itemId || r.listingId}`}
                      className="font-bold text-xs text-gray-900 hover:text-[#22C55E] flex items-center gap-1"
                    >
                      {r.itemTitle || r.listingTitle || 'Reported Listing'}
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>
                    <p className="text-xs text-gray-600 mt-1">Reason: <span className="font-medium text-red-600">{r.reason}</span></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteReportedItem(r.itemId || r.listingId, r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Delete Item
                    </button>
                    <button
                      onClick={() => handleDeleteReport(r.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}