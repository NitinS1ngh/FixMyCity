import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExternalLink } from 'lucide-react';

const PublicLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-govbg flex flex-col font-sans">
      {/* Main navigation header */}
      <header className="bg-[#0b1a30] border-b border-[#1e2e4a] sticky top-0 z-40 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary text-white flex items-center justify-center font-black rounded-md text-sm transition-transform group-hover:scale-105">
              FMC
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                FixMyCity
              </span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-0.5 block">
                Prayagraj Municipal Corporation
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="text-xs font-semibold text-slate-200 px-3 py-1.5 hover:bg-slate-800 hover:text-white rounded transition-all duration-200">
              Home
            </Link>
            <Link to="/stats" className="text-xs font-semibold text-slate-200 px-3 py-1.5 hover:bg-slate-800 hover:text-white rounded transition-all duration-200">
              Statistics
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
              >
                Dashboard
                <ExternalLink size={12} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-slate-200 px-3 py-1.5 hover:bg-slate-800 hover:text-white rounded transition-all duration-200">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded transition-all shadow-sm hover:shadow"
                >
                  Register Complaint
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0b1a30] border-t border-[#1e2e4a] py-8 mt-12 text-slate-300">
        <div className="max-w-[1600px] mx-auto px-4 text-center sm:text-left sm:flex sm:justify-between sm:items-center text-xs">
          <div>
            <p className="font-extrabold text-white text-sm">FixMyCity Portal</p>
            <p className="mt-1 text-slate-400">© 2026 Municipal Complaint Management Systems. All rights reserved.</p>
          </div>
          <div className="flex justify-center sm:justify-start gap-4 mt-3 sm:mt-0 font-medium text-slate-300">
            <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white hover:underline transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white hover:underline transition-colors">Accessibility Statement</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
