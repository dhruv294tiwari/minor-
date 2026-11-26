import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  MessageSquareText,
  ThumbsUp,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminSettingsModal } from '../components/AdminSettingsModal';

export const AdminLayout = () => {
  const { admin, isAuthenticated, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <div className="w-5 h-5 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/queries', label: 'Query Logs', icon: MessageSquareText },
    { to: '/admin/feedback', label: 'Feedback Reviews', icon: ThumbsUp },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-mait-navy-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <img src="/mait-logo.png" alt="MAIT" className="h-8 w-auto bg-mait-navy-950 p-1 px-2 rounded border border-mait-navy-800" />
          <span className="font-bold text-sm tracking-tight">MAIT Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-mait-navy-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-mait-navy-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-mait-navy-800 flex items-center gap-3">
          <div className="py-1 px-3 bg-mait-navy-950 rounded-lg shadow-xs border border-mait-navy-800">
            <img src="/mait-logo.png" alt="MAIT Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight leading-tight">
              MAIT Admin
            </h1>
            <p className="text-[11px] text-slate-400">Knowledge Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-mait-crimson-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-mait-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-mait-navy-800 bg-mait-navy-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-mait-navy-700 flex items-center justify-center text-mait-gold-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">
                {admin?.username || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {admin?.email || 'admin@mait.ac.in'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-mait-navy-800 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-mait-gold-400" />
              <span>Change Password / Profile</span>
            </button>

            <Link
              to="/"
              onClick={() => logout()}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-mait-navy-800 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Student View</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 hidden md:flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-mait-navy-800" />
            <h2 className="text-sm font-semibold text-slate-700">
              Institutional Admin Portal
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Change Password</span>
            </button>
            <Link
              to="/"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Student Chatbot</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};
