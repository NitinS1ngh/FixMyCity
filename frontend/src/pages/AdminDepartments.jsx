import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [head, setHead] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/departments');
      setDepartments(data.departments || []);
      
      const empRes = await api.get('/auth/users?role=employee');
      setEmployees(empRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleEditClick = (d) => {
    setEditingId(d._id);
    setName(d.name);
    setCode(d.code);
    setDescription(d.description);
    setHead(d.head?._id || d.head || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setDescription('');
    setHead('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, { name, code, description, head });
        setSuccess('Department updated successfully.');
      } else {
        await api.post('/departments', { name, code, description, head });
        setSuccess('Department created successfully.');
      }
      setName('');
      setCode('');
      setDescription('');
      setHead('');
      setEditingId(null);
      fetchDepts();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? Employees and complaints in this department will need reassignment.')) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepts();
      } catch (err) {
        alert(err.message || 'Failed to delete department.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-govborder p-6 rounded-sm">
        <h1 className="text-lg font-bold text-govtext-dark">Municipal Departments Registry</h1>
        <p className="text-xs text-govtext-muted mt-1">Manage core city administrative departments, codes, descriptions, and assign heads of departments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="bg-white border border-govborder p-6 rounded-sm h-fit space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
            {editingId ? 'Edit Department Details' : 'Create Administrative Department'}
          </h2>

          {error && (
            <div className="p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-success-light text-success border border-success-light text-xs rounded-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Department Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Roads Department"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Department Code</label>
              <input
                type="text"
                required
                placeholder="e.g. ROAD"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary of department operations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">Department Head</label>
              <select
                value={head}
                onChange={(e) => setHead(e.target.value)}
                className="w-full p-2 border border-govborder text-xs rounded-sm bg-white"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 border border-govborder text-govtext-dark text-xs font-bold py-2 rounded-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-sm flex justify-center items-center gap-1.5"
              >
                {submitting && <Loader2 className="animate-spin" size={12} />}
                {editingId ? 'Save Changes' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>

        {/* List table */}
        <div className="lg:col-span-2 bg-white border border-govborder p-6 rounded-sm">
          <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
            Active Administrative Registers
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          ) : departments.length === 0 ? (
            <p className="text-xs text-govtext-muted text-center py-8">No departments defined.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-govborder text-govtext-light font-bold">
                    <th className="py-2.5">NAME</th>
                    <th className="py-2.5">CODE</th>
                    <th className="py-2.5">HEAD OF DEPT</th>
                    <th className="py-2.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govborder/60">
                  {departments.map((d) => (
                    <tr key={d._id} className="text-govtext-dark hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-[10px] text-govtext-light mt-0.5">{d.description || 'No description provided'}</div>
                      </td>
                      <td className="py-3 font-mono font-bold text-primary">{d.code}</td>
                      <td className="py-3 font-semibold text-govtext-muted">{d.head?.name || 'Unassigned'}</td>
                      <td className="py-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="text-primary hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="text-danger hover:underline font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDepartments;
