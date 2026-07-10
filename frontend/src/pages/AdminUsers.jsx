import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Search, ShieldAlert, ShieldCheck, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Register Employee state
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhoto, setEmpPhoto] = useState(null);
  const [empError, setEmpError] = useState('');
  const [empSuccess, setEmpSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/auth/users?search=${search}&role=${roleFilter}&status=${statusFilter}`);
      setUsers(data.users || []);
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
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      await api.patch(`/auth/users/${id}/toggle-block`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to toggle block status.');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setEmpError('');
    setEmpSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', empName);
      formData.append('email', empEmail);
      formData.append('password', empPassword);
      formData.append('phone', empPhone);
      formData.append('department', empDept);
      formData.append('role', 'employee');
      if (empPhoto) {
        formData.append('profilePhoto', empPhoto);
      }

      await api.post('/auth/register', formData);
      setEmpSuccess('Municipality employee registered successfully.');
      setEmpName('');
      setEmpEmail('');
      setEmpPassword('');
      setEmpPhone('');
      setEmpDept('');
      setEmpPhoto(null);
      fetchUsers();
    } catch (err) {
      setEmpError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-govborder p-6 rounded-sm">
        <div>
          <h1 className="text-lg font-bold text-govtext-dark">User Accounts Management</h1>
          <p className="text-xs text-govtext-muted mt-1">Review registrations, manage municipal employees, and regulate system access privileges.</p>
        </div>
        <button
          onClick={() => setShowAddEmp(!showAddEmp)}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-sm flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          {showAddEmp ? 'Cancel Employee Form' : 'Register Municipality Staff'}
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddEmp && (
        <form onSubmit={handleCreateEmployee} className="bg-white border border-govborder p-6 rounded-sm space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
            Register New Municipal Employee Profile
          </h2>

          {empError && (
            <div className="p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium">
              {empError}
            </div>
          )}
          {empSuccess && (
            <div className="p-3 bg-success-light text-success border border-success-light text-xs rounded-sm font-medium">
              {empSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Employee Name</label>
              <input
                type="text"
                required
                placeholder="John Staff"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="staff@fixmycity.gov"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Credential Password</label>
              <input
                type="password"
                required
                placeholder="employee123"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Contact Number</label>
              <input
                type="text"
                required
                placeholder="9876543210"
                value={empPhone}
                onChange={(e) => setEmpPhone(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Associated Department</label>
              <select
                required
                value={empDept}
                onChange={(e) => setEmpDept(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm bg-white focus:outline-none focus:border-primary"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Profile Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEmpPhoto(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-govborder file:text-[10px] file:font-semibold file:bg-govbg hover:file:bg-slate-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-success hover:bg-success-hover text-white text-xs font-bold py-2 rounded-sm transition-colors flex justify-center items-center gap-1.5"
              >
                {submitting && <Loader2 className="animate-spin" size={12} />}
                Create Staff Account
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Users lists and filters */}
      <div className="bg-white border border-govborder p-6 rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 pb-4 border-b border-govborder">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider">
            System Registrations Log
          </h2>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2 text-govtext-light" size={14} />
              <input
                type="text"
                placeholder="Search name/email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary bg-govbg"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs p-1.5 border border-govborder rounded-sm bg-govbg focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="employee">Employee</option>
              <option value="admin">Administrator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 border border-govborder rounded-sm bg-govbg focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-govtext-muted text-center py-8">No registered users matching this search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-govborder text-govtext-light font-bold">
                  <th className="py-2.5">USER NAME</th>
                  <th className="py-2.5">EMAIL ADDRESS</th>
                  <th className="py-2.5">CONTACT PHONE</th>
                  <th className="py-2.5">ROLE TYPE</th>
                  <th className="py-2.5">MUNICIPAL DEPT</th>
                  <th className="py-2.5">STATUS</th>
                  <th className="py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder/60">
                {users.map((u) => (
                  <tr key={u._id} className="text-govtext-dark hover:bg-slate-50/50">
                    <td className="py-3 font-semibold">{u.name}</td>
                    <td className="py-3 font-mono">{u.email}</td>
                    <td className="py-3 font-mono">{u.phone}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase ${
                        u.role === 'admin'
                          ? 'border-indigo-400 text-indigo-700 bg-indigo-50'
                          : u.role === 'employee'
                          ? 'border-amber-400 text-amber-700 bg-amber-50'
                          : 'border-slate-300 text-govtext-dark bg-slate-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-govtext-muted">
                      {u.department?.name || u.ward || 'General Public'}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                        u.status === 'blocked'
                          ? 'border-danger text-danger bg-danger-light/20'
                          : 'border-success text-success bg-success-light/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-sm border transition-colors ${
                            u.status === 'blocked'
                              ? 'border-success text-success hover:bg-success-light'
                              : 'border-danger text-danger hover:bg-danger-light'
                          }`}
                        >
                          {u.status === 'blocked' ? 'Authorize / Unblock' : 'Revoke / Block'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-govtext-light italic">System Protected</span>
                      )}
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

export default AdminUsers;
