import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Boxes,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const CHANNEL_COLORS = {
  web: '#0D9488', // Teal
  mobile: '#6366F1', // Indigo
  store: '#F59E0B', // Amber
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/analytics/admin-kpis');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load executive KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        {error || 'Unable to load dashboard data'}
      </div>
    );
  }

  const channelData = (data.channelSales || []).map((ch) => ({
    name: ch._id.toUpperCase(),
    value: Math.round(ch.revenue),
    color: CHANNEL_COLORS[ch._id] || '#0D9488',
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Executive Enterprise Command Center</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Admin Access
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-channel aggregation across Web, Mobile App, and Flagship Retail Stores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/action-center"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Action Center</span>
          </Link>
          <Link
            to="/identity-engine"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            <span>Unified Identities</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${(data.totalRevenue || 0).toLocaleString()}`}
          change="+18.4%"
          isPositive={true}
          icon={DollarSign}
          subtitle="Net Sales"
        />
        <StatCard
          title="Total Orders"
          value={(data.totalOrders || 0).toLocaleString()}
          change="+12.2%"
          isPositive={true}
          icon={ShoppingBag}
          subtitle="Cross-channel"
        />
        <StatCard
          title="Total Customers"
          value={(data.totalCustomers || 0).toLocaleString()}
          change="+9.5%"
          isPositive={true}
          icon={Users}
          subtitle="Unified Profiles"
        />
        <StatCard
          title="Current Stock"
          value={(data.currentInventory || 0).toLocaleString()}
          icon={Boxes}
          subtitle={`${data.totalProducts || 0} active SKUs`}
        />
        <StatCard
          title="Predicted Stockouts"
          value={data.predictedStockouts || 0}
          badgeText={data.predictedStockouts > 0 ? 'Action Req' : 'Optimal'}
          badgeColor={data.predictedStockouts > 0 ? 'rose' : 'teal'}
          icon={AlertTriangle}
          subtitle="Next 7 Days"
        />
        <StatCard
          title="Return Rate"
          value={`${data.returnRate || 0}%`}
          change="-0.8%"
          isPositive={true}
          icon={RotateCcw}
          subtitle="Margin Guard"
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Revenue & Gross Profit Performance</span>
              </h3>
              <p className="text-[11px] text-slate-400">Historical trend across all retail transaction logs</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gross Profit: ${(data.totalProfit || 0).toLocaleString()}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="_id" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Omnichannel Distribution (1 col) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sales by Channel</h3>
          <p className="text-[11px] text-slate-400 mb-3">Web vs Mobile App vs Physical Stores</p>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4}>
                  {channelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${val.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-navy-800 text-center">
            {channelData.map((ch) => (
              <div key={ch.name} className="p-1.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                <div className="text-[10px] font-bold text-slate-400">{ch.name}</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">${ch.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Center Feed & Recent Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority AI Recommendations */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Business Recommendations</h3>
            </div>
            <Link to="/action-center" className="text-xs text-teal-500 hover:text-teal-400 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!data.topRecommendations || data.topRecommendations.length === 0) ? (
              <div className="text-center py-8 text-xs text-slate-400">No pending urgent recommendations.</div>
            ) : (
              data.topRecommendations.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rec.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{rec.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{rec.evidence}</p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Action: {rec.suggestedAction}</p>
                  </div>
                  <Link
                    to="/action-center"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Enterprise Operations</h3>
            </div>
            <Link to="/users" className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold flex items-center gap-1">
              <span>Audit Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(!data.recentActivities || data.recentActivities.length === 0) ? (
              <div className="text-center py-8 text-xs text-slate-400">No recent activity logged.</div>
            ) : (
              data.recentActivities.map((act) => (
                <div key={act._id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800/80 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300 truncate">{act.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-3">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
