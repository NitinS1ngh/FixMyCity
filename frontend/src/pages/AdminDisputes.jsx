import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, MapPin, ExternalLink, ShieldAlert, CheckCircle } from 'lucide-react';

const AdminDisputes = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints?isDisputed=true');
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-govborder border-l-4 border-l-danger p-6 rounded-sm flex items-start gap-4 shadow-sm">
        <div className="p-2.5 bg-red-100 text-danger rounded-full mt-0.5">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-govtext-dark">Reopened Disputes Console</h1>
          <p className="text-xs text-govtext-muted mt-1">
            Review and resolve complaints that citizens have reopened. These issues require reassignment, priority changes, or immediate resolution inspections.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 bg-white border border-govborder rounded-sm">
          <Loader2 className="animate-spin text-primary mr-2" size={24} />
          <span className="text-xs font-semibold text-govtext-muted">Loading Reopened Disputes...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-govborder p-16 text-center rounded-sm shadow-sm space-y-3">
          <div className="w-12 h-12 bg-green-50 text-success rounded-full flex items-center justify-center mx-auto border border-green-100">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-govtext-dark block uppercase tracking-wider">Zero Disputed Tickets</span>
            <span className="text-[11px] text-govtext-muted mt-1 block">All citizen reopened tickets are currently resolved or assigned!</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((c) => {
            const lastRemarkObj = c.remarks?.filter(r => r.comment.includes('REOPENED'))?.[0];
            const disputeReason = lastRemarkObj?.comment
              ? lastRemarkObj.comment.replace('REOPENED & DISPUTED:', '').replace('REOPENED:', '').trim()
              : 'No explanation provided.';
            
            return (
              <div key={c._id} className="bg-white border border-govborder rounded-sm shadow-sm p-5 space-y-4 hover:border-danger/30 transition-all border-l-2 border-l-danger">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-govborder/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{c.complaintId}</span>
                      <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider">{c.title}</h2>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                        c.priority === 'Critical' ? 'bg-danger text-white' :
                        c.priority === 'High' ? 'bg-warning text-white' :
                        'bg-slate-200 text-govtext-dark'
                      }`}>
                        {c.priority} Priority
                      </span>
                    </div>
                    <div className="text-[10px] text-govtext-muted mt-1.5 flex flex-wrap gap-x-4">
                      <span>Category: <strong className="text-govtext-dark">{c.category}</strong></span>
                      <span>Ward: <strong className="text-govtext-dark">{c.location?.ward}</strong></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-govtext-light block">Reopened Date</span>
                    <span className="text-xs font-bold text-govtext-dark block mt-0.5">
                      {lastRemarkObj ? new Date(lastRemarkObj.createdAt || c.updatedAt).toLocaleDateString() : new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="bg-red-50/20 border border-red-100 p-3.5 rounded-sm space-y-1">
                  <span className="text-[9px] font-bold text-[#b22b2b] uppercase tracking-wider block">Citizen Dispute Explanation:</span>
                  <p className="text-xs font-medium text-danger leading-relaxed">"{disputeReason}"</p>
                </div>

                <div className="flex justify-between items-center pt-2 gap-4 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] text-govtext-light">
                    <MapPin size={12} />
                    <span>{c.location?.address}, {c.location?.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-4 py-2 rounded-sm transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Investigate & Reassign
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
