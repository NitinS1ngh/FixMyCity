import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, CheckCircle2, Search, ClipboardList } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section - Centered Clean Presentation */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-primary rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">
          <Shield size={14} />
          Official Municipality Grievance Portal
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0b1a30] tracking-tight leading-tight">
          Empowering Citizens. <br />
          <span className="text-primary">Building Better Cities, Together.</span>
        </h1>
        <p className="text-base sm:text-lg text-govtext-muted leading-relaxed max-w-3xl mx-auto">
          FixMyCity is a direct, transparent channel connecting municipal residents with specific city engineering departments. Report potholes, sewer leaks, broken lights, and track completion progress in real-time.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-8 py-3.5 rounded-md shadow-sm transition-all flex items-center gap-1.5"
            >
              Access My Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-8 py-3.5 rounded-md shadow-sm transition-all flex items-center gap-1.5"
              >
                Lodge a Complaint
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/stats"
                className="border border-govborder bg-white hover:bg-slate-50 text-[#0b1a30] text-sm font-bold px-8 py-3.5 rounded-md shadow-sm transition-all"
              >
                View Live Resolution Stats
              </Link>
            </>
          )}
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-white border border-govborder p-10 rounded-md shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1a30]">How It Works</h2>
          <p className="text-sm sm:text-base text-govtext-muted mt-2">
            A three-step loop designed to ensure maximum accountability and civic transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-4">
            <div className="w-14 h-14 bg-blue-50 text-primary flex items-center justify-center rounded-full mx-auto font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#0b1a30]">Citizens Report</h3>
            <p className="text-xs sm:text-sm text-govtext-muted leading-relaxed">
              Upload photos, select ward category, and pinpoint the exact issue location on our interactive maps.
            </p>
          </div>

          <div className="text-center space-y-4 p-4">
            <div className="w-14 h-14 bg-blue-50 text-primary flex items-center justify-center rounded-full mx-auto font-black text-lg">
              2
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#0b1a30]">Departments Resolve</h3>
            <p className="text-xs sm:text-sm text-govtext-muted leading-relaxed">
              Admins assign tickets to specialized department staff who accept and complete the repairs, posting progress updates.
            </p>
          </div>

          <div className="text-center space-y-4 p-4">
            <div className="w-14 h-14 bg-blue-50 text-primary flex items-center justify-center rounded-full mx-auto font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#0b1a30]">Feedback & Close</h3>
            <p className="text-xs sm:text-sm text-govtext-muted leading-relaxed">
              Once marked as resolved, citizens verify the resolution on-site, rate the work, and close the case file.
            </p>
          </div>
        </div>
      </div>

      {/* Guide: How to Lodge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-[#F0F5FF] border border-blue-100 p-10 rounded-md shadow-sm">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1a30]">How to Lodge a Complaint</h2>
          <p className="text-xs sm:text-sm text-govtext-muted leading-relaxed">
            Lodging a civic issue takes less than two minutes. Follow this checklist to ensure department inspectors get accurate information:
          </p>
          <ul className="space-y-4 text-xs sm:text-sm text-govtext-muted">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Register & Sign In:</strong> Create a citizen profile associated with your local Ward.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Pin Location:</strong> Use the interactive Leaflet map to set pinpoint coordinates of the issue.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Attach Photos:</strong> Upload clear images of the pothole, water leak, or damaged wiring as evidence.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Submit and Monitor:</strong> Track assignments, staff names, progress logs, and receive live email/portal alerts.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-govborder p-8 rounded-md space-y-6 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg text-[#0b1a30]">Quick Actions Directory</h3>
          <p className="text-xs sm:text-sm text-govtext-muted">Direct links to portal features:</p>
          <div className="space-y-4">
            <Link
              to="/stats"
              className="flex justify-between items-center p-4 hover:bg-blue-50 border border-govborder rounded-md text-xs sm:text-sm font-semibold text-[#0b1a30] transition-colors"
            >
              <span className="flex items-center gap-3">
                <ClipboardList size={16} className="text-primary" />
                Live Resolution statistics
              </span>
              <ArrowRight size={14} className="text-govtext-light" />
            </Link>
            <Link
              to="/login"
              className="flex justify-between items-center p-4 hover:bg-blue-50 border border-govborder rounded-md text-xs sm:text-sm font-semibold text-[#0b1a30] transition-colors"
            >
              <span className="flex items-center gap-3">
                <Search size={16} className="text-primary" />
                Inspect active case registry
              </span>
              <ArrowRight size={14} className="text-govtext-light" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
