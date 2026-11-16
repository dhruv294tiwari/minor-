import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative flex items-center justify-center py-1 px-3 bg-mait-navy-900 rounded-lg border border-mait-navy-800/80 shadow-sm transition-transform group-hover:scale-102">
            <img
              src="/mait-logo.png"
              alt="Maharaja Agrasen Institute of Technology Logo"
              className="h-10 sm:h-12 w-auto object-contain max-w-[160px] sm:max-w-[200px]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-mait-navy-900 tracking-tight leading-tight group-hover:text-mait-crimson-600 transition-colors">
                MAIT AI Assistant
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-mait-crimson-50 text-mait-crimson-700 border border-mait-crimson-200">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Maharaja Agrasen Institute of Technology, New Delhi
            </p>
          </div>
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">System Online</span>
          </div>

          {/* Navigation link between Student Chatbot and Admin Portal */}
          {isAdmin ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span>Student Chatbot</span>
            </Link>
          ) : (
            <Link
              to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-mait-navy-800 hover:bg-mait-navy-900 shadow-sm transition-all hover:shadow"
            >
              <Shield className="w-4 h-4 text-mait-gold-400" />
              <span>{isAuthenticated ? "Admin Portal" : "Admin Login"}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
