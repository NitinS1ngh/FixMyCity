import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  Loader2,
  FolderSync,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { user, updateProfilePhoto } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    setPhotoError('');
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      await updateProfilePhoto(formData);
      setShowPhotoModal(false);
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoLoading(true);
    setPhotoError('');
    try {
      const formData = new FormData();
      formData.append('removePhoto', 'true');
      await updateProfilePhoto(formData);
      setShowPhotoModal(false);
    } catch (err) {
      setPhotoError(err.message || 'Failed to remove photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  // Filters for Citizen / Employee lists
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [disputedComplaints, setDisputedComplaints] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user.role === 'admin') {
        const data = await api.get('/analytics');
        setAnalytics(data.data);
        
        // Fetch disputed complaints for admin overview console
        const dispData = await api.get('/complaints?isDisputed=true');
        setDisputedComplaints(dispData.complaints || []);
      } else {
        // Citizen / Employee gets list of relevant complaints
        const data = await api.get('/complaints');
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-primary mr-2" size={24} />
        <span className="text-xs font-semibold text-govtext-muted">Restoring session...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-primary mr-2" size={24} />
        <span className="text-xs font-semibold text-govtext-muted">Loading Secure Dashboard...</span>
      </div>
    );
  }

  // Render Admin Dashboard
  if (user.role === 'admin') {
    const summary = analytics?.summary || {};
    const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#14B8A6'];

    // Pie chart data
    const pieData = analytics?.statusCounts?.map((s) => ({
      name: s._id,
      value: s.count,
    })) || [];

    // Category chart data
    const categoryBarData = analytics?.categoryCounts?.slice(0, 5).map((c) => ({
      name: c._id,
      count: c.count,
    })) || [];

    return (
      <div className="space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white border border-govborder border-l-4 border-l-primary p-6 rounded-md shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div
            onClick={() => setShowPhotoModal(true)}
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity relative group"
            title="Click to manage profile photo"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-govtext-muted uppercase font-black text-2xl">
                {user?.name.substring(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-[#0b1a30]">{user?.name}</h2>
              <span className="text-[10px] text-white bg-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <div className="text-xs text-govtext-muted space-y-0.5 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-1 sm:space-y-0">
              <p>Email: <span className="font-semibold text-govtext-dark">{user?.email}</span></p>
              <p>Phone: <span className="font-semibold text-govtext-dark">{user?.phone}</span></p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white border border-govborder p-6 rounded-md shadow-sm">
          <div>
            <h1 className="text-lg font-extrabold text-[#0b1a30]">Municipal Control Center</h1>
            <p className="text-xs text-govtext-muted mt-1">Real-time status of public complaints, municipal departments, and resolutions.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded border border-govborder font-bold text-govtext-dark">
            SYSTEM STATUS: OPERATIONAL
          </span>
        </div>

        {/* Aggregated totals */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-govborder border-l-4 border-l-primary p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-blue-50/10">
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider font-bold block">Total Complaints</span>
            <span className="text-2xl font-black text-govtext-dark mt-1 block">{summary.totalComplaints || 0}</span>
          </div>
          <div className="bg-white border border-govborder border-l-4 border-l-warning p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-yellow-50/10">
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider font-bold block">Active Tickets</span>
            <span className="text-2xl font-black text-warning mt-1 block">{summary.activeComplaints || 0}</span>
          </div>
          <div className="bg-white border border-govborder border-l-4 border-l-success p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-green-50/10">
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider font-bold block">Closed Cases</span>
            <span className="text-2xl font-black text-success mt-1 block">{summary.closedComplaints || 0}</span>
          </div>
          <div className="bg-white border border-govborder border-l-4 border-l-slate-400 p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-slate-50/10">
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider font-bold block">Active Staff</span>
            <span className="text-2xl font-black text-govtext-dark mt-1 block">{summary.totalEmployees || 0}</span>
          </div>
          <div className="bg-white border border-govborder border-l-4 border-l-primary p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-blue-50/10">
            <span className="text-[10px] text-govtext-muted uppercase tracking-wider font-bold block">Total Departments</span>
            <span className="text-2xl font-black text-primary mt-1 block">{summary.totalDepartments || 0}</span>
          </div>
        </div>

        {/* Reopened Disputes Console (Action Required) */}
        {disputedComplaints.length > 0 && (
          <div className="bg-red-50/20 border border-red-200 rounded-md p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider">
              <AlertCircle size={15} />
              <span>Disputed & Reopened Complaints ({disputedComplaints.length}) — Immediate Action Required</span>
            </div>
            <p className="text-xs text-govtext-muted leading-relaxed">
              The following complaints were previously marked as Resolved by staff, but have been reopened by citizens due to unsatisfactory completion. Please review, adjust priority, or reassign resources immediately.
            </p>
            <div className="overflow-x-auto border border-govborder rounded-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-govborder text-govtext-light font-bold">
                    <th className="py-2.5 px-3">CASE ID</th>
                    <th className="py-2.5 px-3">TITLE / CATEGORY</th>
                    <th className="py-2.5 px-3">WARD / AREA</th>
                    <th className="py-2.5 px-3">REASON / REMARK</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govborder/75">
                  {disputedComplaints.map((c) => {
                    const lastRemark = c.remarks?.filter(r => r.comment.includes('REOPENED'))?.[0]?.comment || 'No explanation provided.';
                    return (
                      <tr key={c._id} className="text-govtext-dark hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-primary">{c.complaintId}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold">{c.title}</div>
                          <div className="text-[10px] text-govtext-muted mt-0.5">{c.category}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div>{c.location?.ward}</div>
                          <div className="text-[10px] text-govtext-light mt-0.5">{c.location?.area}</div>
                        </td>
                        <td className="py-3 px-3 max-w-[240px] truncate text-danger font-medium" title={lastRemark}>
                          {lastRemark.replace('REOPENED & DISPUTED:', '').replace('REOPENED:', '').trim()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/complaints/${c._id}`}
                            className="border border-danger/35 text-danger hover:bg-danger-light px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-sm inline-flex items-center gap-1 bg-white"
                          >
                            Investigate
                            <ExternalLink size={10} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend bar chart */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Monthly Submission Trends
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthlyCounts || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status distribution pie chart */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Active Status Distribution
            </h2>
            <div className="h-64 flex flex-col sm:flex-row items-center justify-between">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2 mt-4 sm:mt-0">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 block rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-govtext-muted">{item.name}</span>
                    </div>
                    <span className="font-bold text-govtext-dark">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Department Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-govborder p-6 rounded-md shadow-sm">
            <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Department Workload & Efficiency
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-govborder text-govtext-light font-bold">
                    <th className="py-3">DEPARTMENT NAME</th>
                    <th className="py-3">CODE</th>
                    <th className="py-3 text-center">TOTAL TICKETS</th>
                    <th className="py-3 text-center">RESOLVED</th>
                    <th className="py-3 text-right">EFFICIENCY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govborder/60">
                  {analytics?.deptPerformance?.map((dept) => {
                    const pct = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                    return (
                      <tr key={dept._id} className="text-govtext-dark hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-semibold">{dept.name}</td>
                        <td className="py-3.5"><span className="bg-slate-50 border border-govborder px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">{dept.code}</span></td>
                        <td className="py-3.5 text-center font-bold">{dept.total}</td>
                        <td className="py-3.5 text-center text-success font-bold">{dept.resolved}</td>
                        <td className="py-3.5 text-right font-black text-primary">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Wards */}
          <div className="bg-white border border-govborder p-6 rounded-md shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
                Top Reporting Wards
              </h2>
              <div className="space-y-3">
                {analytics?.wardCounts?.slice(0, 5).map((w, i) => (
                  <div key={w._id} className="flex justify-between items-center text-xs">
                    <span className="text-govtext-muted font-medium">
                      {i + 1}. {w._id || 'General Ward'}
                    </span>
                    <span className="font-bold text-govtext-dark bg-slate-100 px-2 py-0.5 rounded-sm">
                      {w.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Link
              to="/admin/complaints"
              className="mt-6 w-full text-center border border-primary/20 bg-blue-50/60 hover:bg-primary hover:text-white text-xs font-bold py-2.5 rounded transition-all text-primary flex justify-center items-center gap-1"
            >
              Access All Complaints List
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Profile Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white border border-govborder rounded-md shadow-md max-w-sm w-full p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0b1a30] uppercase tracking-wider border-b border-govborder pb-2">
                Manage Profile Photo
              </h3>
              {photoError && (
                <div className="p-3 bg-danger-light text-danger text-[11px] font-semibold border border-danger-light rounded-sm">
                  {photoError}
                </div>
              )}
              <div className="space-y-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded transition-colors flex justify-center items-center gap-1.5"
                >
                  {photoLoading ? <Loader2 className="animate-spin" size={14} /> : 'Upload New Photo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                {user?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={photoLoading}
                    className="w-full border border-danger text-danger hover:bg-danger-light text-xs font-bold py-2.5 rounded transition-all flex justify-center items-center gap-1.5 bg-white"
                  >
                    Remove Current Photo
                  </button>
                )}

                <button
                  onClick={() => { setShowPhotoModal(false); setPhotoError(''); }}
                  disabled={photoLoading}
                  className="w-full border border-govborder hover:bg-slate-100 text-govtext-dark text-xs font-bold py-2.5 rounded transition-colors bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Citizen / Employee Dashboard List
  const isCitizen = user.role === 'citizen';
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const activeCount = complaints.filter((c) => ['Assigned', 'Accepted', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ['Resolved', 'Citizen Verification', 'Closed'].includes(c.status)).length;

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-govborder border-l-4 border-l-primary p-6 rounded-md shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div
          onClick={() => setShowPhotoModal(true)}
          className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-slate-100 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity relative group"
          title="Click to manage profile photo"
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="text-govtext-muted uppercase font-black text-2xl">
              {user?.name.substring(0, 2)}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-[#0b1a30]">{user?.name}</h2>
            <span className="text-[10px] text-white bg-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {user?.role}
            </span>
            {user?.department && (
              <span className="text-[10px] text-primary bg-primary-light px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-blue-150">
                {user.department.code} Department
              </span>
            )}
          </div>
          <div className="text-xs text-govtext-muted space-y-0.5 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-1 sm:space-y-0">
            <p>Email: <span className="font-semibold text-govtext-dark">{user?.email}</span></p>
            <p>Phone: <span className="font-semibold text-govtext-dark">{user?.phone}</span></p>
            {user?.ward && <p>Ward: <span className="font-semibold text-govtext-dark">{user.ward}</span></p>}
          </div>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border border-govborder p-6 rounded-md shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-[#0b1a30]">
            {isCitizen ? 'Citizen Dashboard' : 'Employee Work Bench'}
          </h1>
          <p className="text-xs text-govtext-muted mt-1">
            {isCitizen
              ? 'File new complaints, track existing issues, and verify resolution completions.'
              : `Review issues filed under the ${user.department?.name || 'Assigned'} department.`}
          </p>
        </div>
        {isCitizen && (
          <Link
            to="/complaints/new"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-center"
          >
            <Plus size={16} />
            File New Complaint
          </Link>
        )}
      </div>

      {/* Role specific quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-govborder border-l-4 border-l-danger p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-red-50/10">
          <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Pending Setup</span>
          <span className="text-2xl font-black text-danger mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white border border-govborder border-l-4 border-l-warning p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-yellow-50/10">
          <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Active / In Progress</span>
          <span className="text-2xl font-black text-warning mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-white border border-govborder border-l-4 border-l-success p-5 rounded-md shadow-sm bg-gradient-to-r from-white to-green-50/10">
          <span className="text-[10px] text-govtext-muted uppercase tracking-wider block font-bold">Resolved / Closed</span>
          <span className="text-2xl font-black text-success mt-1 block">{resolvedCount}</span>
        </div>
      </div>

      {/* Complaints List Table/Cards */}
      <div className="bg-white border border-govborder rounded-md p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-govborder">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider">
            {isCitizen ? 'My Filed Complaints' : 'Department Tasks Feed'}
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 border border-govborder rounded-sm bg-govbg focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Citizen Verification">Citizen Verification</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-2 border border-govborder rounded-sm bg-govbg focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Garbage Collection">Garbage Collection</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Drainage">Drainage</option>
              <option value="Street Light">Street Light</option>
              <option value="Illegal Construction">Illegal Construction</option>
              <option value="Public Toilet">Public Toilet</option>
              <option value="Parks">Parks</option>
              <option value="Stray Animals">Stray Animals</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-govtext-muted flex flex-col justify-center items-center gap-2">
            <FileText size={32} className="text-govtext-light" />
            <p>No complaints match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-govborder text-govtext-light font-bold">
                  <th className="py-3">ID</th>
                  <th className="py-3">TITLE</th>
                  <th className="py-3">CATEGORY</th>
                  <th className="py-3">WARD</th>
                  <th className="py-3">PRIORITY</th>
                  <th className="py-3">STATUS</th>
                  <th className="py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder/60">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="text-govtext-dark hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-primary">{c.complaintId}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-govtext-dark">{c.title}</div>
                      <div className="text-[10px] text-govtext-light mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        Filed on {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-govtext-muted">{c.category}</td>
                    <td className="py-3.5 font-medium">{c.location?.ward || 'Unspecified'}</td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${c.priority === 'Critical'
                          ? 'border-danger/30 text-danger bg-danger/5'
                          : c.priority === 'High'
                            ? 'border-warning/30 text-warning bg-warning/5'
                            : 'border-slate-200 text-govtext-muted bg-slate-50'
                        }`}>
                        {c.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${c.status === 'Resolved' || c.status === 'Closed'
                          ? 'border-success/30 text-success bg-success/5'
                          : c.status === 'Pending'
                            ? 'border-danger/30 text-danger bg-danger/5'
                            : 'border-warning/30 text-warning bg-warning/5'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="border border-primary/20 bg-blue-50/60 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-sm inline-flex items-center gap-1"
                      >
                        Inspect
                        <ExternalLink size={10} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-govborder rounded-md shadow-md max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0b1a30] uppercase tracking-wider border-b border-govborder pb-2">
              Manage Profile Photo
            </h3>
            {photoError && (
              <div className="p-3 bg-danger-light text-danger text-[11px] font-semibold border border-danger-light rounded-sm">
                {photoError}
              </div>
            )}
            <div className="space-y-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded transition-colors flex justify-center items-center gap-1.5"
              >
                {photoLoading ? <Loader2 className="animate-spin" size={14} /> : 'Upload New Photo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />

              {user?.profilePhoto && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={photoLoading}
                  className="w-full border border-danger text-danger hover:bg-danger-light text-xs font-bold py-2.5 rounded transition-all flex justify-center items-center gap-1.5 bg-white"
                >
                  Remove Current Photo
                </button>
              )}

              <button
                onClick={() => { setShowPhotoModal(false); setPhotoError(''); }}
                disabled={photoLoading}
                className="w-full border border-govborder hover:bg-slate-100 text-govtext-dark text-xs font-bold py-2.5 rounded transition-colors bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
