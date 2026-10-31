import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  BrainCircuit,
  Sliders,
  Download,
  PieChart as PieIcon,
  RotateCcw,
  Users,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
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

const SEGMENT_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

const AnalystDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get('/analytics/analyst-kpis');
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

  const customerSegments = (data?.customerSegments || []).map((seg) => ({
    name: seg._id,
    count: seg.count,
    spend: Math.round(seg.totalSpent),
    churnRisk: Math.round(seg.avgChurnScore),
  }));

  const churnDistribution = (data?.churnDistribution || []).map((ch) => ({
    name: `${ch._id} Churn Risk`,
    count: ch.count,
  }));

  const returnImpact = data?.returnImpact || [];
  const totalMarginErosion = returnImpact.reduce((acc, r) => acc + (r.marginLost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Predictive Intelligence & Decision Support</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
              Analyst Role
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Machine Learning insights, RFM customer clustering, margin degradation, and scenario simulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/what-if-simulator"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch What-If Simulator</span>
          </Link>
          <button
            onClick={() => alert('Executive Intelligence Report exported as PDF/CSV')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Customer Segments"
          value={customerSegments.length}
          icon={Layers}
          subtitle="VIP, Loyal, At-Risk, Occasional, New"
        />
        <StatCard
          title="Total Margin Lost to Returns"
          value={`$${totalMarginErosion.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          badgeText="Erosion"
          badgeColor="rose"
          icon={TrendingDown}
          subtitle="Reverse Logistics & Refunds"
        />
        <StatCard
          title="Predictive Models Active"
          value="4 Models"
          isPositive={true}
          badgeText="Joblib Live"
          badgeColor="teal"
          icon={BrainCircuit}
          subtitle="Demand, Churn, Return, NLP"
        />
      </div>

      {/* Customer Segmentation & Churn Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments Spend & Count */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Customer Segmentation & Revenue</h3>
          <p className="text-[11px] text-slate-400 mb-4">Cumulative spend distribution by customer loyalty cohort</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSegments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val, name) => [name === 'spend' ? `$${val.toLocaleString()}` : val, name === 'spend' ? 'Total Spend' : 'Customers']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Bar dataKey="spend" fill="#0D9488" radius={[4, 4, 0, 0]} name="Total Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Probability Clustering */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Churn Risk Level Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-4">Classified by Random Forest Early Warning Classifier</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={churnDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4}>
                  <Cell fill="#10B981" /> {/* Low */}
                  <Cell fill="#F59E0B" /> {/* Medium */}
                  <Cell fill="#EF4444" /> {/* High */}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Return Root Causes & Financial Degradation */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Product Return Reasons & Financial Erosion
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Direct reverse logistics cost and revenue deductions by return categorization
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {returnImpact.map((r) => (
            <div key={r._id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1 truncate">{r._id}</span>
              <div className="text-lg font-black text-rose-500">${r.marginLost?.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400">{r.count} return incidents</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
