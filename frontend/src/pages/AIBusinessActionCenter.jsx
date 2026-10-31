import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Check,
  Filter,
  Boxes,
  Users,
  ShieldAlert,
} from 'lucide-react';

const AIBusinessActionCenter = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionNotice, setActionNotice] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await api.get('/action-center', { params });
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory, selectedStatus]);

  const handleExecute = async (id) => {
    try {
      const res = await api.post(`/action-center/${id}/execute`);
      if (res.data.success) {
        setActionNotice(res.data.message);
        fetchRecommendations();
        setTimeout(() => setActionNotice(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute action');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/action-center/${id}/status`, { status });
      if (res.data.success) {
        fetchRecommendations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleGenerateFresh = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/action-center/generate');
      if (res.data.success) {
        setActionNotice(res.data.message);
        fetchRecommendations();
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const categories = ['all', 'Restock', 'Retention', 'Quality Remediation', 'Promotion', 'Cross-Sell'];
  const statuses = ['all', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span>AI Business Action Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Converting predictive machine learning signals into prioritized, one-click commercial actions
          </p>
        </div>

        <button
          onClick={handleGenerateFresh}
          disabled={generating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Scanning ML Models...' : 'Scan & Generate Fresh Actions'}</span>
        </button>
      </div>

      {/* Notice Banner */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-navy-950 font-bold'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Intelligence' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-navy-800 text-white font-bold'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">All Business Actions Completed!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No pending action recommendations match the current filters. Click "Scan & Generate Fresh Actions" to evaluate new ML predictions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isCritical = rec.priority === 'Critical';
            const isHigh = rec.priority === 'High';
            const isCompleted = rec.status === 'Completed';

            const CategoryIcon =
              rec.category === 'Restock' ? Boxes : rec.category === 'Retention' ? Users : ShieldAlert;

            return (
              <div
                key={rec._id}
                className={`bg-white dark:bg-navy-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-slate-200 dark:border-navy-800 opacity-75'
                    : isCritical
                    ? 'border-rose-500/40 dark:border-rose-500/30 ring-1 ring-rose-500/20'
                    : isHigh
                    ? 'border-amber-500/40 dark:border-amber-500/30'
                    : 'border-slate-200 dark:border-navy-800'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-teal-500/10 text-teal-500 border-teal-500/30'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.category}</span>
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={rec.status}
                      onChange={(e) => handleUpdateStatus(rec._id, e.target.value)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Title & Target */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
                    Target {rec.relatedEntityType}: <strong className="text-slate-800 dark:text-slate-200">{rec.relatedEntityName}</strong>
                  </div>

                  {/* Supporting Evidence */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Supporting Evidence & ML Signal:
                    </div>
                    <p className="text-[11px] font-mono leading-relaxed">{rec.evidence}</p>
                  </div>

                  {/* Suggested Business Action */}
                  <div className="mt-3 text-xs">
                    <span className="text-[10px] uppercase font-bold text-teal-500 tracking-wider block mb-0.5">
                      Recommended Strategic Action:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{rec.suggestedAction}</p>
                  </div>

                  {rec.resolutionNote && (
                    <div className="mt-2 text-[11px] text-emerald-400 italic">
                      Resolution: {rec.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Created {new Date(rec.createdAt).toLocaleDateString()}
                  </span>

                  {!isCompleted ? (
                    <button
                      onClick={() => handleExecute(rec._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Action</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Action Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIBusinessActionCenter;
