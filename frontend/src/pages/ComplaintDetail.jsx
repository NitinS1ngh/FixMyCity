import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Loader2,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  FileCheck,
  RotateCcw,
  Send,
  Trash2,
  Edit3,
  User,
  Star,
} from 'lucide-react';
import MapDisplay from '../components/MapDisplay';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Assignment state
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [assignLoading, setAssignLoading] = useState(false);

  // Employee/Admin status update state
  const [updateStatusVal, setUpdateStatusVal] = useState('');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [progressFiles, setProgressFiles] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  // Citizen Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Citizen Reopen state
  const [reopenRemarks, setReopenRemarks] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      setData(res);
      setSelectedDept(res.complaint.department?._id || '');
      setSelectedEmp(res.complaint.assignedTo?._id || '');
      setSelectedPriority(res.complaint.priority || 'Medium');
      setUpdateStatusVal(res.complaint.status || '');
    } catch (err) {
      setError(err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    if (user?.role === 'admin') {
      try {
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.departments || []);
        
        const empRes = await api.get('/auth/users?role=employee');
        setEmployees(empRes.users || []);
      } catch (err) {
        console.error('Failed to load lists:', err);
      }
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    fetchDropdowns();
  }, [id, user]);

  const handleAdminAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await api.patch(`/complaints/${id}/assign`, {
        departmentId: selectedDept || null,
        employeeId: selectedEmp || null,
        priority: selectedPriority,
      });
      await fetchComplaintDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleEmployeeAccept = async () => {
    setStatusLoading(true);
    try {
      await api.patch(`/complaints/${id}/accept`);
      await fetchComplaintDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      const formData = new FormData();
      formData.append('status', updateStatusVal);
      formData.append('remarks', updateRemarks);
      progressFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.patch(`/complaints/${id}/status`, formData);
      setUpdateRemarks('');
      setProgressFiles([]);
      await fetchComplaintDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCitizenFeedback = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comments: feedbackComments,
      });
      await fetchComplaintDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCitizenReopen = async (e) => {
    e.preventDefault();
    setReopenLoading(true);
    try {
      await api.patch(`/complaints/${id}/reopen`, {
        remarks: reopenRemarks,
      });
      setReopenRemarks('');
      await fetchComplaintDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setReopenLoading(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (window.confirm('Are you sure you want to permanently delete this complaint case file?')) {
      try {
        await api.delete(`/complaints/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-primary mr-2" size={24} />
        <span className="text-xs font-semibold text-govtext-muted">Loading Complaint Details...</span>
      </div>
    );
  }

  const { complaint, auditLogs, feedback } = data || {};

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-govborder pb-4">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="p-2 hover:bg-slate-200 rounded-sm text-govtext-muted transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-primary bg-primary-light px-2 py-0.5 rounded-sm">
                {complaint?.complaintId}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm ${
                complaint?.status === 'Resolved' || complaint?.status === 'Closed'
                  ? 'border-success text-success bg-success-light/20'
                  : complaint?.status === 'Pending'
                  ? 'border-danger text-danger bg-danger-light/20'
                  : 'border-warning text-warning bg-warning-light/20'
              }`}>
                {complaint?.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-govtext-dark mt-1">{complaint?.title}</h1>
          </div>
        </div>

        {/* Citizen Edit/Delete actions (before assignment) */}
        {user?.role === 'citizen' && complaint?.status === 'Pending' && (
          <div className="flex gap-2">
            <button
              onClick={handleDeleteComplaint}
              className="border border-danger text-danger hover:bg-danger-light text-xs font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 transition-colors"
            >
              <Trash2 size={14} />
              Delete Case
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Main detail page breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center: Case Details & Images */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-govborder p-6 rounded-sm space-y-4">
            <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
              Case Description & Metadata
            </h2>
            <div className="text-xs text-govtext-dark leading-relaxed whitespace-pre-wrap">
              {complaint?.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-govborder">
              <div>
                <span className="text-[10px] text-govtext-light font-bold block uppercase tracking-wider">Filed By</span>
                <span className="font-semibold text-govtext-dark">{complaint?.citizen?.name}</span>
                <span className="block text-[10px] text-govtext-muted">Contact: {complaint?.citizen?.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-govtext-light font-bold block uppercase tracking-wider">Department</span>
                <span className="font-semibold text-govtext-dark">{complaint?.department?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] text-govtext-light font-bold block uppercase tracking-wider">Category</span>
                <span className="font-semibold text-govtext-dark">{complaint?.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-govtext-light font-bold block uppercase tracking-wider">Priority</span>
                <span className="font-semibold text-govtext-dark">{complaint?.priority || 'Medium'}</span>
              </div>
            </div>

            {/* Location Address */}
            <div className="bg-slate-50 border border-govborder p-4 rounded-sm flex items-start gap-2.5 text-xs text-govtext-dark">
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Location Address</p>
                <p className="mt-0.5">{complaint?.location?.address}</p>
                <p className="text-[10px] text-govtext-muted mt-1 font-semibold">
                  Ward: {complaint?.location?.ward} • Area: {complaint?.location?.area}
                </p>
              </div>
            </div>

            {/* Pinpoint Location Map */}
            {complaint?.location?.coordinates?.latitude && complaint?.location?.coordinates?.longitude && (
              <div className="pt-2">
                <MapDisplay
                  lat={complaint.location.coordinates.latitude}
                  lng={complaint.location.coordinates.longitude}
                />
              </div>
            )}

            {/* Images evidence */}
            {complaint?.images?.length > 0 && (
              <div className="space-y-2 pt-4">
                <span className="text-[10px] text-govtext-light font-bold block uppercase tracking-wider">Photographic Evidence</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((img, i) => (
                    <a href={img} target="_blank" rel="noopener noreferrer" key={i} className="border border-govborder overflow-hidden rounded-sm hover:opacity-90 transition-opacity">
                      <img src={img} alt="Evidence" className="object-cover w-full h-32" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Images uploaded by staff */}
            {complaint?.progressImages?.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-govborder">
                <span className="text-[10px] text-success font-bold block uppercase tracking-wider">Resolution Progress Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.progressImages.map((img, i) => (
                    <a href={img} target="_blank" rel="noopener noreferrer" key={i} className="border border-success/40 overflow-hidden rounded-sm hover:opacity-90 transition-opacity">
                      <img src={img} alt="Progress" className="object-cover w-full h-32" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline - Audit Logs */}
          <div className="bg-white border border-govborder p-6 rounded-sm">
            <h2 className="text-xs font-bold text-govtext-dark mb-4 uppercase tracking-wider border-b border-govborder pb-2">
              Timeline & Audit Log
            </h2>
            <div className="relative pl-6 border-l border-govborder space-y-6">
              {auditLogs?.map((log) => (
                <div key={log._id} className="relative text-xs">
                  {/* Status dot */}
                  <span className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-4 ring-slate-100"></span>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-govtext-dark">{log.actionDescription}</span>
                      <p className="text-[10px] text-govtext-muted mt-0.5">
                        Actor: {log.actor?.name} ({log.actor?.role})
                      </p>
                    </div>
                    <span className="text-[10px] text-govtext-light font-medium">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Actions panel based on RBAC */}
        <div className="space-y-6">
          {/* Admin Assignment Block */}
          {user?.role === 'admin' && complaint?.status !== 'Closed' && (
            <div className="bg-white border border-govborder p-6 rounded-sm space-y-4">
              <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
                Admin Assignment Control
              </h2>
              <form onSubmit={handleAdminAssign} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">
                    Target Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setSelectedEmp(''); // reset employee on dept change
                    }}
                    className="w-full p-2 border border-govborder text-xs rounded-sm bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">
                    Assign Staff Employee
                  </label>
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    disabled={!selectedDept}
                    className="w-full p-2 border border-govborder text-xs rounded-sm bg-white disabled:opacity-50"
                  >
                    <option value="">Select Employee</option>
                    {employees
                      .filter((emp) => emp.department?._id === selectedDept || emp.department === selectedDept)
                      .map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-govtext-dark mb-1 uppercase tracking-wider">
                    Priority Level
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full p-2 border border-govborder text-xs rounded-sm bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-sm transition-colors flex justify-center items-center gap-1.5"
                >
                  {assignLoading && <Loader2 className="animate-spin" size={12} />}
                  Update Assignment
                </button>
              </form>
            </div>
          )}

          {/* Employee Action panel */}
          {user?.role === 'employee' && (
            <div className="bg-white border border-govborder p-6 rounded-sm space-y-4">
              <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
                Employee Action Panel
              </h2>

              {complaint?.status === 'Assigned' ? (
                <div className="space-y-2">
                  <p className="text-xs text-govtext-muted">This ticket is assigned. Click accept to begin work.</p>
                  <button
                    onClick={handleEmployeeAccept}
                    disabled={statusLoading}
                    className="w-full bg-success hover:bg-success-hover text-white text-xs font-bold py-2 rounded-sm flex justify-center items-center gap-1 transition-colors"
                  >
                    {statusLoading && <Loader2 className="animate-spin" size={12} />}
                    Accept Complaint Work Order
                  </button>
                </div>
              ) : ['Accepted', 'In Progress'].includes(complaint?.status) ? (
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                      Work Action Status
                    </label>
                    <select
                      value={updateStatusVal}
                      onChange={(e) => setUpdateStatusVal(e.target.value)}
                      className="w-full p-2 border border-govborder text-xs rounded-sm bg-white"
                    >
                      <option value="Accepted">Accepted (Not Started)</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved (Complete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                      Progress Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={updateRemarks}
                      onChange={(e) => setUpdateRemarks(e.target.value)}
                      placeholder="Explain action taken, parts replacement, or inspection remarks..."
                      className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                      Progress/Resolution Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProgressFiles(Array.from(e.target.files || []))}
                      className="text-xs w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={statusLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-sm flex justify-center items-center gap-1.5 transition-colors"
                  >
                    {statusLoading && <Loader2 className="animate-spin" size={12} />}
                    Update Work Ticket
                  </button>
                </form>
              ) : (
                <p className="text-xs text-govtext-muted italic text-center">Ticket is {complaint?.status}. No employee action required.</p>
              )}
            </div>
          )}

          {/* Citizen Verification & Close Panel */}
          {user?.role === 'citizen' && complaint?.status === 'Resolved' && (
            <div className="space-y-6">
              {/* Feedback and Close */}
              <div className="bg-white border border-govborder p-6 rounded-sm space-y-4">
                <h2 className="text-xs font-bold text-success uppercase tracking-wider border-b border-govborder pb-2 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Verify Resolution & Close Case
                </h2>
                <p className="text-xs text-govtext-muted">
                  The municipality marked this as Resolved. Please verify and leave feedback. Submitting this form closes the ticket.
                </p>

                <form onSubmit={handleCitizenFeedback} className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                      Satisfaction Rating
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="text-yellow-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            fill={star <= feedbackRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                      Feedback Comments
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="Optional compliments or suggestions..."
                      className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="w-full bg-success hover:bg-success-hover text-white text-xs font-bold py-2 rounded-sm flex justify-center items-center gap-1 transition-colors"
                  >
                    {feedbackLoading && <Loader2 className="animate-spin" size={12} />}
                    Submit Feedback & Close Case
                  </button>
                </form>
              </div>

              {/* Reopen complaint option */}
              <div className="bg-white border border-govborder p-6 rounded-sm space-y-3">
                <h2 className="text-xs font-bold text-danger uppercase tracking-wider border-b border-govborder pb-2 flex items-center gap-1">
                  <RotateCcw size={14} />
                  Issue Still Persists? Reopen Case
                </h2>
                <p className="text-xs text-govtext-muted">
                  If the issue remains unresolved, fill the details below to reopen this complaint.
                </p>
                <form onSubmit={handleCitizenReopen} className="space-y-3">
                  <textarea
                    rows={2}
                    value={reopenRemarks}
                    onChange={(e) => setReopenRemarks(e.target.value)}
                    placeholder="Provide details on why the issue is still active..."
                    required
                    className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={reopenLoading}
                    className="w-full bg-danger hover:bg-danger-hover text-white text-xs font-bold py-2 rounded-sm flex justify-center items-center gap-1 transition-colors"
                  >
                    {reopenLoading && <Loader2 className="animate-spin" size={12} />}
                    Reopen Complaint
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Feedback details display */}
          {feedback && (
            <div className="bg-white border border-govborder p-6 rounded-sm space-y-3 bg-success-light/10 border-success-light">
              <h2 className="text-xs font-bold text-success uppercase tracking-wider border-b border-success-light pb-2 flex items-center gap-1">
                <FileCheck size={14} />
                Citizen Satisfaction Feedback
              </h2>
              <div className="text-xs">
                <div className="flex gap-0.5 text-yellow-500 mb-1">
                  {Array.from({ length: feedback.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="italic text-govtext-dark">"{feedback.comments || 'No comment left'}"</p>
                <p className="text-[10px] text-govtext-muted mt-2">
                  Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
