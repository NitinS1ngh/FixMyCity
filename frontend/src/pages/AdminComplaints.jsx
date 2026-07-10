import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Loader2, Calendar, MapPin, ExternalLink } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [complaintId, setComplaintId] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [ward, setWard] = useState('');
  const [area, setArea] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const q = `complaintId=${complaintId}&category=${category}&department=${department}&status=${status}&ward=${ward}&area=${area}`;
      const res = await api.get(`/complaints?${q}`);
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepts = async () => {
    try {
      const data = await api.get('/departments');
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [complaintId, category, department, status, ward, area]);

  useEffect(() => {
    fetchDepts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-govborder p-6 rounded-sm">
        <h1 className="text-lg font-bold text-govtext-dark">Municipal Complaints Central Log</h1>
        <p className="text-xs text-govtext-muted mt-1">Review, sort, filter, and inspect case files reported by citizens across all wards.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-govborder p-5 rounded-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Search ID</label>
          <input
            type="text"
            placeholder="e.g. FMC-2026"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm bg-white focus:outline-none"
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

        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm bg-white focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.code}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm bg-white focus:outline-none"
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
        </div>

        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Ward</label>
          <input
            type="text"
            placeholder="e.g. Ward 1: Civil Lines"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Area / Locality</label>
          <input
            type="text"
            placeholder="e.g. Down Town"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full p-1.5 border border-govborder text-xs rounded-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white border border-govborder p-6 rounded-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-xs text-govtext-muted text-center py-8">No complaints found. Adjust filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-govborder text-govtext-light font-bold">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">CITIZEN</th>
                  <th className="py-2.5">TITLE & DATE</th>
                  <th className="py-2.5">CATEGORY</th>
                  <th className="py-2.5">WARD</th>
                  <th className="py-2.5">ASSIGNMENT</th>
                  <th className="py-2.5">PRIORITY</th>
                  <th className="py-2.5">STATUS</th>
                  <th className="py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder/60">
                {complaints.map((c) => (
                  <tr key={c._id} className="text-govtext-dark hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-primary">{c.complaintId}</td>
                    <td className="py-3">
                      <div className="font-semibold">{c.citizen?.name}</div>
                      <div className="text-[10px] text-govtext-muted">{c.citizen?.phone}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-[10px] text-govtext-light mt-0.5 flex items-center gap-0.5">
                        <Calendar size={10} />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 font-medium text-govtext-muted">{c.category}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} />
                        {c.location?.ward || 'Unspecified'}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-govtext-muted">
                      {c.department ? (
                        <div>
                          <span className="font-semibold text-govtext-dark">{c.department.code}</span>
                          {c.assignedTo && <p className="text-[10px]">Staff: {c.assignedTo.name}</p>}
                        </div>
                      ) : (
                        <span className="text-danger italic font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                        c.priority === 'Critical'
                          ? 'border-danger text-danger bg-danger-light/20'
                          : c.priority === 'High'
                          ? 'border-warning text-warning bg-warning-light/10'
                          : 'border-slate-300 text-govtext-muted bg-slate-100'
                      }`}>
                        {c.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm ${
                        c.status === 'Resolved' || c.status === 'Closed'
                          ? 'border-success text-success bg-success-light/20'
                          : c.status === 'Pending'
                          ? 'border-danger text-danger bg-danger-light/20'
                          : 'border-warning text-warning bg-warning-light/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="text-primary hover:underline font-bold text-[11px] inline-flex items-center gap-0.5"
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
    </div>
  );
};

export default AdminComplaints;
