import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Loader2, Building, CheckCircle2, AlertCircle, RefreshCw, MapPin, Shield, Check, PhoneCall } from 'lucide-react';

const PublicPortal = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/public/stats');
      setStats(data.stats);
      setRecentComplaints(data.recentComplaints || []);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const data = await api.get(`/public/stats`);
      const matched = data.recentComplaints.find(
        (c) => c.complaintId.toLowerCase() === searchId.trim().toLowerCase()
      );

      if (matched) {
        setSearchResult(matched);
      } else {
        setSearchError('Complaint details are secure or the ID is invalid. Registered users can view full history via the Dashboard.');
      }
    } catch (err) {
      setSearchError('Error finding complaint. Please check the ID.');
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-primary mr-2" size={24} />
        <span className="text-xs font-semibold text-govtext-muted">Loading Portal Aggregates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Split Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-govborder p-6 sm:p-8 rounded-md shadow-sm">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-light text-primary rounded-sm text-[10px] font-bold uppercase tracking-wider">
            <Shield size={12} />
            Official Transparency Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-govtext-dark tracking-tight leading-tight">
            Municipal Corporation <br className="hidden sm:inline" />
            <span className="text-primary">Complaint Registry Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-govtext-muted leading-relaxed max-w-2xl">
            Welcome to the public-facing city dashboard. We believe in complete transparency. Track civic issues, inspect ongoing operations, and verify completion timelines in real-time.
          </p>
        </div>
        <div className="bg-slate-50 border border-govborder p-5 rounded-md space-y-3">
          <span className="text-[10px] text-govtext-light uppercase tracking-wider font-extrabold block">Registry Steps</span>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold mt-0.5">1</span>
              <div>
                <p className="font-bold text-govtext-dark">File Complaint</p>
                <p className="text-[10px] text-govtext-muted">Submit description & photos.</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold mt-0.5">2</span>
              <div>
                <p className="font-bold text-govtext-dark">Track Work Log</p>
                <p className="text-[10px] text-govtext-muted">Inspect assignment timelines.</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold mt-0.5">3</span>
              <div>
                <p className="font-bold text-govtext-dark">Verify Completion</p>
                <p className="text-[10px] text-govtext-muted">Give feedback to close file.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Stats Cards with Left Accent Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-govborder border-l-4 border-l-primary p-5 rounded-md shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Total Filed</span>
            <span className="text-2xl font-black text-govtext-dark mt-0.5 block">{stats?.total || 0}</span>
          </div>
          <Building className="text-primary" size={28} />
        </div>

        <div className="bg-white border border-govborder border-l-4 border-l-success p-5 rounded-md shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Resolved Cases</span>
            <span className="text-2xl font-black text-success mt-0.5 block">{stats?.resolved || 0}</span>
          </div>
          <CheckCircle2 className="text-success" size={28} />
        </div>

        <div className="bg-white border border-govborder border-l-4 border-l-warning p-5 rounded-md shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">In Progress</span>
            <span className="text-2xl font-black text-warning mt-0.5 block">{stats?.inProgress || 0}</span>
          </div>
          <AlertCircle className="text-warning" size={28} />
        </div>

        <div className="bg-white border border-govborder border-l-4 border-l-danger p-5 rounded-md shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Pending Setup</span>
            <span className="text-2xl font-black text-danger mt-0.5 block">{stats?.pending || 0}</span>
          </div>
          <RefreshCw className="text-danger" size={28} />
        </div>
      </div>

      {/* Search and Main section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Public Tracker & Recent Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="font-bold text-sm text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Public Case Tracker
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-govtext-light" size={16} />
                <input
                  type="text"
                  placeholder="Enter Case ID (e.g. FMC-2026-0001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary bg-govbg font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2 rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="animate-spin" size={14} /> : 'Search Registry'}
              </button>
            </form>

            {searchError && (
              <div className="mt-4 p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium">
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="mt-4 p-4 border border-govborder bg-govbg rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-primary text-white font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                      {searchResult.complaintId}
                    </span>
                    <h3 className="font-bold text-xs text-govtext-dark mt-1">{searchResult.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase border px-2 py-0.5 rounded-sm bg-white">
                    {searchResult.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-govtext-muted pt-2 border-t border-govborder/60">
                  <div>
                    <span className="block font-bold">Category</span>
                    <span>{searchResult.category}</span>
                  </div>
                  <div>
                    <span className="block font-bold">Location</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} />
                      {searchResult.location?.ward}, {searchResult.location?.area}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent list */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="font-bold text-sm text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Municipal Case Stream
            </h2>
            <div className="divide-y divide-govborder overflow-hidden">
              {recentComplaints.length === 0 ? (
                <div className="py-4 text-center text-xs text-govtext-muted">
                  No public complaints filed yet.
                </div>
              ) : (
                recentComplaints.map((c) => (
                  <div key={c._id} className="py-3.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] text-primary">{c.complaintId}</span>
                        <span className="font-semibold text-govtext-dark">{c.title}</span>
                      </div>
                      <p className="text-[10px] text-govtext-muted mt-1">
                        Category: {c.category} • {c.location?.ward}, {c.location?.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm ${c.status === 'Resolved' || c.status === 'Closed'
                          ? 'border-success text-success bg-success-light/20'
                          : c.status === 'Pending'
                            ? 'border-danger text-danger bg-danger-light/20'
                            : 'border-warning text-warning bg-warning-light/20'
                        }`}>
                        {c.status}
                      </span>
                      <span className="block text-[9px] text-govtext-light mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Aggregated Statistics Sidebars */}
        <div className="space-y-6">
          {/* Category-wise Breakdown */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="font-bold text-xs text-govtext-dark mb-3 uppercase tracking-wider border-b border-govborder pb-2">
              Cases by Category
            </h2>
            <div className="space-y-2">
              {stats?.categoryStats?.length === 0 ? (
                <p className="text-xs text-govtext-muted py-2">No category data.</p>
              ) : (
                stats?.categoryStats?.map((cat) => (
                  <div key={cat._id} className="flex justify-between items-center text-xs">
                    <span className="text-govtext-muted">{cat._id}</span>
                    <span className="font-bold text-govtext-dark bg-slate-100 px-2 py-0.5 rounded-sm">
                      {cat.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ward-wise Breakdown */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="font-bold text-xs text-govtext-dark mb-3 uppercase tracking-wider border-b border-govborder pb-2">
              Cases by Ward
            </h2>
            <div className="space-y-2">
              {stats?.wardStats?.length === 0 ? (
                <p className="text-xs text-govtext-muted py-2">No ward data.</p>
              ) : (
                stats?.wardStats?.map((w) => (
                  <div key={w._id} className="flex justify-between items-center text-xs">
                    <span className="text-govtext-muted">{w._id || 'General'}</span>
                    <span className="font-bold text-govtext-dark bg-slate-100 px-2 py-0.5 rounded-sm">
                      {w.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Contact Directory */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm space-y-3">
            <h2 className="font-bold text-xs text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2 flex items-center gap-1.5">
              <PhoneCall size={14} className="text-primary" />
              Administrative Contacts
            </h2>
            <div className="space-y-2 text-[11px] text-govtext-muted">
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Road Repair Desk</span>
                <span className="font-bold text-govtext-dark">1800-419-1001</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Water Supply Desk</span>
                <span className="font-bold text-govtext-dark">1800-419-1002</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Sanitation & Garbage</span>
                <span className="font-bold text-govtext-dark">1800-419-1003</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity Grievance</span>
                <span className="font-bold text-govtext-dark">1800-419-1004</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPortal;
