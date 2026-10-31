import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  RotateCcw,
  Search,
  Filter,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const ReturnsManagement = () => {
  const [returns, setReturns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        api.get('/returns', { params: { reason, status, search } }),
        api.get('/returns/analytics'),
      ]);
      if (rRes.data.success) setReturns(rRes.data.data);
      if (aRes.data.success) setAnalytics(aRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [reason, status]);

  const handleUpdateStatus = async (id, refundStatus) => {
    try {
      const res = await api.put(`/returns/${id}/status`, { refundStatus });
      if (res.data.success) {
        setNotification(`Return status updated to ${refundStatus}`);
        fetchReturns();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const reasons = [
    'all',
    'Sizing Issues',
    'Defective / Quality',
    'Item Not As Described',
    'Changed Mind',
    'Late Delivery',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-teal-400" />
          <span>Smart Return & Profit Margin Protection</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Reverse logistics root-cause attribution, margin degradation analysis, and automated product remedies
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Margin Lost to Returns</span>
          <div className="text-2xl font-black text-rose-500 mt-1">
            ${analytics?.totalMarginLost?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-400">Refunds + reverse freight logistics</span>
        </div>
        <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Customer Refunds</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${analytics?.totalRefunded?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-400">{analytics?.totalReturns || 0} claims processed</span>
        </div>
        <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Primary Return Driver</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {analytics?.reasonBreakdown?.[0]?._id || 'Sizing Issues'}
          </div>
          <span className="text-[11px] text-slate-400">
            {analytics?.reasonBreakdown?.[0]?.count || 0} claims attributed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchReturns(); }} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search return #, product, customer..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Reported Reasons' : r}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Refund Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Processed">Processed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Return # & Product</th>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Attributed Reason</th>
                <th className="px-4 py-3">Refund Amount</th>
                <th className="px-4 py-3">Net Margin Impact</th>
                <th className="px-4 py-3">Remediation Recommendation</th>
                <th className="px-4 py-3 text-right">Refund Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No return claims match the selected filters.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{r.returnNumber}</span>
                      <span className="text-[11px] text-teal-400 font-semibold">{r.productName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-slate-400">{r.unifiedCustomerId}</span>
                      <span className="text-[10px] text-slate-500 block uppercase">{r.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      ${r.refundAmount}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-rose-500">
                      -${r.impactOnMargin}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs">
                      <p className="line-clamp-2 text-[11px] italic text-teal-300 bg-teal-500/5 p-1.5 rounded">
                        {r.recommendedAction}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={r.refundStatus}
                        onChange={(e) => handleUpdateStatus(r._id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none ${
                          r.refundStatus === 'Processed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.refundStatus === 'Approved'
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                            : r.refundStatus === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Processed">Processed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnsManagement;
