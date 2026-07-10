import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Building2,
  LogOut,
  Bell,
  Shield,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigation = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Manage Complaints', path: '/admin/complaints', icon: FileText },
        { name: 'Reopened Disputes', path: '/admin/disputes', icon: ShieldAlert },
        { name: 'Manage Citizens & Staff', path: '/admin/users', icon: Users },
        { name: 'Manage Departments', path: '/admin/departments', icon: Building2 },
      ];
    }
    return [];
  };

  const navigation = getNavigation();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-govbg flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0b1a30] border-b border-[#1e2e4a] sticky top-0 z-40 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800 text-slate-300 lg:hidden rounded-sm"
                aria-label="Toggle Sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
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
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-800 text-slate-300 relative rounded-sm"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-govborder shadow-md rounded-sm z-50 overflow-hidden">
                  <div className="p-3 bg-govbg border-b border-govborder flex justify-between items-center">
                    <span className="font-semibold text-xs text-govtext-dark">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-primary hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-govborder">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-govtext-muted">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 text-xs hover:bg-govbg transition-colors ${
                            !n.isRead ? 'bg-blue-50/40 border-l-2 border-primary' : ''
                          }`}
                          onClick={() => {
                            markNotificationRead(n._id);
                            setShowNotifications(false);
                            navigate(`/complaints/${n.complaint?._id || n.complaint}`);
                          }}
                        >
                          <p className="text-govtext-dark mb-1 cursor-pointer font-medium">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-govtext-light">
                            {new Date(n.createdAt).toLocaleDateString()}{' '}
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-2.5 border-l border-[#1e2e4a] pl-4">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 text-white flex items-center justify-center font-bold text-xs border border-[#1e2e4a] uppercase flex-shrink-0">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name.substring(0, 2)
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-none">{user?.name}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[9px] text-white bg-slate-700 px-1.5 py-0.5 rounded-sm font-bold capitalize leading-none">
                    {user?.role}
                  </span>
                  {user?.department && (
                    <span className="text-[9px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded-sm font-semibold leading-none border border-slate-700">
                      {user.department.code || 'Staff'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-danger hover:bg-danger-light px-3 py-1.5 rounded-md font-bold transition-all border border-danger/30 hover:border-danger ml-2 bg-white"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Nav (Admin Only) */}
        {isAdmin && (
          <aside
            className={`fixed inset-y-0 left-0 w-64 bg-[#F8FAFC] border-r border-govborder z-30 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ top: '64px' }} // Account for header height
          >
            <div className="flex flex-col h-full p-4 justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-govtext-light uppercase tracking-wider block mb-2 px-3">
                    Navigation
                  </span>
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-150 border-l-2 ${
                            isActive
                              ? 'bg-blue-50 text-primary border-primary'
                              : 'text-govtext-dark hover:bg-slate-100 hover:text-primary border-transparent'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-govtext-light uppercase tracking-wider block mb-2 px-3">
                    System Security
                  </span>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-success border border-success-light bg-success-light/20 rounded-sm font-medium">
                    <Shield size={14} />
                    <span>Audit Mode Active</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-govborder">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-danger hover:bg-danger-light rounded-md transition-colors"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Content Wrapper */}
        <main className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 ${isAdmin ? 'lg:max-w-[calc(100%-16rem)]' : 'w-full'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
