import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  Fingerprint,
  TrendingUp,
  Users,
  Package,
  Boxes,
  ShoppingBag,
  RotateCcw,
  LifeBuoy,
  Sliders,
  ShieldCheck,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, role, getDashboardPath, roleLabel } = useAuth();

  const navItems = [
    {
      name: 'Role Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
      roles: ['admin', 'inventory_manager', 'sales_manager', 'support_staff', 'analyst'],
      badge: 'Live',
    },
    {
      name: 'AI Action Center',
      path: '/action-center',
      icon: Sparkles,
      roles: ['admin', 'inventory_manager', 'sales_manager', 'support_staff', 'analyst'],
      highlight: true,
      badge: 'AI Core',
    },
    {
      name: 'Unified Identity Engine',
      path: '/identity-engine',
      icon: Fingerprint,
      roles: ['admin', 'sales_manager', 'support_staff', 'analyst'],
      badge: 'Novel',
    },
    {
      name: 'AI Predictions',
      path: '/predictions',
      icon: BrainCircuit,
      roles: ['admin', 'inventory_manager', 'sales_manager', 'analyst'],
    },
    {
      name: 'Customer Intelligence',
      path: '/customers',
      icon: Users,
      roles: ['admin', 'sales_manager', 'support_staff', 'analyst'],
    },
    {
      name: 'Product Catalog',
      path: '/products',
      icon: Package,
      roles: ['admin', 'inventory_manager', 'sales_manager'],
    },
    {
      name: 'Inventory & Stock',
      path: '/inventory',
      icon: Boxes,
      roles: ['admin', 'inventory_manager', 'analyst'],
    },
    {
      name: 'Omnichannel Orders',
      path: '/orders',
      icon: ShoppingBag,
      roles: ['admin', 'sales_manager', 'support_staff', 'analyst'],
    },
    {
      name: 'Returns & Margins',
      path: '/returns',
      icon: RotateCcw,
      roles: ['admin', 'sales_manager', 'inventory_manager', 'analyst'],
    },
    {
      name: 'Customer Support',
      path: '/support-tickets',
      icon: LifeBuoy,
      roles: ['admin', 'support_staff', 'sales_manager'],
    },
    {
      name: 'What-If Simulator',
      path: '/what-if-simulator',
      icon: Sliders,
      roles: ['admin', 'inventory_manager', 'sales_manager', 'analyst'],
      badge: 'Sim',
    },
    {
      name: 'User Management',
      path: '/users',
      icon: ShieldCheck,
      roles: ['admin'],
    },
    {
      name: 'Platform Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'inventory_manager', 'sales_manager', 'support_staff', 'analyst'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role || 'admin'));

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-navy-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-navy-950 font-black shadow-md shadow-teal-500/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            RetailSync <span className="text-teal-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-500/30">AI</span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium">Demand & Channel Engine</p>
        </div>
      </div>

      {/* Role Banner */}
      <div className="px-4 py-3 bg-navy-950/60 border-b border-navy-800/80">
        <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400 mb-0.5">Active Role Mode</div>
        <div className="text-xs font-semibold text-white truncate">{roleLabel || 'Administrator'}</div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-4 border-teal-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                } ${item.highlight ? 'ring-1 ring-teal-500/30 bg-teal-950/20' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${item.highlight ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === 'AI Core'
                      ? 'bg-teal-500 text-navy-950 animate-pulse'
                      : item.badge === 'Novel'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-navy-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-navy-850">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user?.name || 'Staff User'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || 'user@retailsync.ai'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
