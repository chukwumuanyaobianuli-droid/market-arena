import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, Trash2, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'listings'

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Reports
      const reportsSnap = await getDocs(collection(db, 'reports'));
      const fetchedReports = [];
      reportsSnap.forEach((d) => {
        fetchedReports.push({ id: d.id, ...d.data() });
      });
      setReports(fetchedReports);

      // Fetch All Listings for Moderation
      const listingsSnap = await getDocs(collection(db, 'listings'));
      const fetchedListings = [];
      listingsSnap.forEach((d) => {
        fetchedListings.push({ id: d.id, ...d.data() });
      });
      setListings(fetchedListings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteListing = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'listings', itemId));
      setListings(listings.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  const handleMarkSold = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
    try {
      await updateDoc(doc(db, 'listings', itemId), { status: newStatus });
      setListings(
        listings.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading admin panel...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center space-x-1 text-xs font-medium text-gray-600 mb-6 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Admin Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Market Arena Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Moderate listings and review reported student items.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Listings ({listings.length})
          </button>
        </div>
      </div>

      {/* Tab Content: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
              No reports found. Everything looks safe!
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Reported Listing</span>
                    </span>
                    <span className="text-xs font-bold text-gray-800">{report.itemTitle}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1"><strong>Reason:</strong> {report.reason}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Listing ID: {report.itemId}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`/item/${report.itemId}`, '_blank')}
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteListing(report.itemId)}
                    className="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Item</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: All Listings Moderation */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate">{item.title}</td>
                    <td className="p-4 text-gray-600">{item.category}</td>
                    <td className="p-4 font-bold text-brand-700">₦{Number(item.price).toLocaleString()}</td>
                    <td className="p-4 text-gray-600">{item.location}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === 'sold' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.status === 'sold' ? 'Sold' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleMarkSold(item.id, item.status)}
                        className="text-gray-600 hover:text-brand-600 font-medium cursor-pointer"
                      >
                        {item.status === 'sold' ? 'Unmark' : 'Mark Sold'}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}