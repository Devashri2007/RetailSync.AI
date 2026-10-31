import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, role, logout, login, getDashboardPath } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { alerts, clearAlert } = useSocket();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();

  const demoRoles = [
    { role: 'admin', email: 'admin@retailsync.ai', label: 'Admin (Full Access)' },
    { role: 'inventory_manager', email: 'inventory@retailsync.ai', label: 'Inventory Manager' },
    { role: 'sales_manager', email: 'sales@retailsync.ai', label: 'Sales Manager' },
    { role: 'support_staff', email: 'support@retailsync.ai', label: 'Support Staff' },
    { role: 'analyst', email: 'analyst@retailsync.ai', label: 'Business Analyst' },
  ];

  const handleRoleSwitch = async (email) => {
    setShowRoleSwitcher(false);
    const res = await login(email, 'Password@123');
    if (res.success) {
      navigate(getDashboardPath(res.user.role));
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between sticky top-0 z-10 transition-colors">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, customers, orders, SKU..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-500/20 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Switch Role: {ROLE_LABELS[role]?.split(' ')[0] || 'Role'}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-xl py-2 z-30">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-navy-800">
                1-Click Demo Role Switcher
              </div>
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => handleRoleSwitch(dr.email)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors ${
                    role === dr.role ? 'text-teal-500 font-bold bg-teal-500/5' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{dr.label}</span>
                  {role === dr.role && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 relative transition-colors"
            title="Real-time Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping"></span>
            )}
            {alerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-xl py-2 z-30">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Real-Time System Alerts</span>
                <span className="text-[10px] text-teal-500 font-medium">{alerts.length} active</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
                {alerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                    All systems operating nominally
                  </div>
                ) : (
                  alerts.map((al, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{al.title || 'Alert'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{al.message}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => clearAlert(idx)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs transition-colors ml-1"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
