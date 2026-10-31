import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  ShoppingBag,
  DollarSign,
  Globe,
  Smartphone,
  Store,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const SalesDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get('/analytics/sales-kpis');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const channelMetrics = data?.channelMetrics || [];
  const topSelling = data?.topSelling || [];
  const returnRateByCategory = data?.returnRateByCategory || [];

  const totalSalesRevenue = channelMetrics.reduce((acc, c) => acc + (c.totalRevenue || 0), 0);
  const totalOrders = channelMetrics.reduce((acc, c) => acc + (c.orderCount || 0), 0);
  const globalAOV = totalOrders > 0 ? (totalSalesRevenue / totalOrders).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Omnichannel Sales Intelligence</span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Sales Role
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time performance across Web Storefront, Mobile App, and Brick-and-Mortar Outlets
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Omnichannel Sales"
          value={`$${totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+14.2%"
          isPositive={true}
          icon={DollarSign}
          subtitle="All Active Channels"
        />
        <StatCard
          title="Total Completed Orders"
          value={totalOrders}
          change="+8.9%"
          isPositive={true}
          icon={ShoppingBag}
          subtitle="Processed Orders"
        />
        <StatCard
          title="Average Order Value (AOV)"
          value={`$${globalAOV}`}
          change="+4.1%"
          isPositive={true}
          icon={TrendingUp}
          subtitle="Basket Size"
        />
      </div>

      {/* Channel Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channelMetrics.map((ch) => {
          const Icon = ch._id === 'web' ? Globe : ch._id === 'mobile' ? Smartphone : Store;
          const label = ch._id === 'web' ? 'Online E-Commerce' : ch._id === 'mobile' ? 'Mobile App Shopping' : 'Physical Retail Outlets';
          const badgeBg = ch._id === 'web' ? 'bg-teal-500/10 text-teal-400' : ch._id === 'mobile' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400';

          return (
            <div key={ch._id} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeBg}`}>
                  {ch._id.toUpperCase()} CHANNEL
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ${ch.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                <span>Orders: {ch.orderCount}</span>
                <span>AOV: ${ch.avgOrderValue?.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Top Revenue Generators</h3>
          <p className="text-[11px] text-slate-400 mb-4">Leading products by gross transactional volume</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSelling} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748B" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="_id" type="category" stroke="#64748B" fontSize={10} width={120} tickLine={false} />
                <Tooltip
                  formatter={(val) => `$${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#0D9488" radius={[0, 4, 4, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Returns Impact by Category */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Return Volume by Category</h3>
            <span className="text-[10px] text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10">Margin Risk</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">Refund distribution affecting merchandising margins</p>

          <div className="space-y-3">
            {returnRateByCategory.map((cat) => (
              <div key={cat._id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{cat._id}</span>
                  <span className="text-[10px] text-slate-400 block">{cat.returns} return requests filed</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-rose-500">${cat.refundTotal?.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Refunds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
