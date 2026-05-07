import React, { useState } from 'react';
import { LogOut, Cpu, Menu, X, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

/**
 * Navbar Component
 * Top navigation bar with branding, user info, and logout.
 * Includes mobile hamburger menu for responsive design.
 */
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                AI Task<span className="text-primary-400">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">
                Processing Platform
              </p>
            </div>
          </div>

          {/* Desktop: User Info + Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-sm">
                <span className="text-slate-300 font-medium">
                  {currentUser?.name || 'User'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile: Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-slate-300 font-medium">
                {currentUser?.name || 'User'}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
