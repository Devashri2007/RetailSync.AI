import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  badgeText,
  badgeColor = 'teal',
  accentColor = 'teal',
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {badgeText && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              badgeColor === 'rose'
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : badgeColor === 'amber'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Bottom Row: Trend & Subtitle */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center font-bold text-xs ${
              isPositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {change}
          </span>
        )}
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
