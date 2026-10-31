import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BrainCircuit,
  TrendingUp,
  Flame,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const AIPredictions = () => {
  const [activeTab, setActiveTab] = useState('demand');
  const [demandData, setDemandData] = useState([]);
  const [churnData, setChurnData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const [demandRes, churnRes, returnRes] = await Promise.all([
          api.get('/ai/demand-forecast'),
          api.get('/ai/churn-risk'),
          api.get('/ai/return-risk'),
        ]);

        if (demandRes.data.success) setDemandData(demandRes.data.data);
        if (churnRes.data.success) setChurnData(churnRes.data.data);
        if (returnRes.data.success) setReturnData(returnRes.data.data);

        // Fetch sample personalized recommendations for first churn customer
        if (churnRes.data.data.length > 0) {
          const recRes = await api.get(`/ai/recommendations/${churnRes.data.data[0].customer_id}`);
          if (recRes.data.success) setRecommendations(recRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching ML predictions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const tabs = [
    { id: 'demand', label: 'AI Demand Forecasting', icon: TrendingUp },
    { id: 'churn', label: 'Churn Early Warning & XAI', icon: Flame },
    { id: 'returns', label: 'Return & Margin Protection', icon: RotateCcw },
    { id: 'recommendations', label: 'Personalized Cross-Sell', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-teal-400" />
          <span>Machine Learning Predictive Intelligence</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Trained Scikit-Learn models deployed via Python FastAPI microservice
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-400 text-teal-500 dark:text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: Demand Forecasting */}
          {activeTab === 'demand' && (
            <div className="space-y-6">
              {/* Forecast Visual Chart */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Multi-Horizon Demand Forecast (7 vs 15 vs 30 Days)
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  GradientBoostingRegressor estimations based on sales velocity and seasonal indicators
                </p>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandData.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="sku" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="demand_7d" fill="#0D9488" name="7-Day Demand" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="demand_15d" fill="#6366F1" name="15-Day Demand" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="demand_30d" fill="#F59E0B" name="30-Day Demand" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Demand Predictions Table */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-navy-800 font-bold text-xs text-slate-900 dark:text-white">
                  SKU Demand & Stockout Estimations
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
                      <tr>
                        <th className="px-5 py-3">Product Name</th>
                        <th className="px-4 py-3">Current Stock</th>
                        <th className="px-4 py-3">Daily Run Rate</th>
                        <th className="px-4 py-3">7-Day Demand</th>
                        <th className="px-4 py-3">30-Day Demand</th>
                        <th className="px-4 py-3">Stockout Timeline</th>
                        <th className="px-4 py-3 text-right">Rec. Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {demandData.map((d) => (
                        <tr key={d.sku} className="hover:bg-slate-50 dark:hover:bg-navy-850">
                          <td className="px-5 py-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{d.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{d.sku}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold">{d.current_stock} units</td>
                          <td className="px-4 py-3 text-slate-500">{d.daily_run_rate} units/day</td>
                          <td className="px-4 py-3 font-bold text-teal-400">{d.demand_7d}</td>
                          <td className="px-4 py-3 text-slate-400">{d.demand_30d}</td>
                          <td className="px-4 py-3">
                            {d.predicted_stockout_days !== null ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                Stockout in {d.predicted_stockout_days} days
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400">Sufficient Stock</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-teal-400">
                            {d.recommended_restock_qty > 0 ? `+${d.recommended_restock_qty} units` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Churn Early Warning & Explainable AI */}
          {activeTab === 'churn' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">High Churn Risk Cohort</span>
                  <div className="text-2xl font-black text-rose-500 mt-1">
                    {churnData.filter((c) => c.churn_risk_level === 'High').length} Customers
                  </div>
                  <span className="text-[11px] text-slate-400">Immediate win-back action recommended</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Moderate Risk</span>
                  <div className="text-2xl font-black text-amber-500 mt-1">
                    {churnData.filter((c) => c.churn_risk_level === 'Medium').length} Customers
                  </div>
                  <span className="text-[11px] text-slate-400">Declining purchase frequency detected</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Stable & Loyal</span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">
                    {churnData.filter((c) => c.churn_risk_level === 'Low').length} Customers
                  </div>
                  <span className="text-[11px] text-slate-400">Active engagement with low friction</span>
                </div>
              </div>

              {/* Explainable AI Customer Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Explainable AI (XAI) Contributing Factors Breakdown
                </h3>
                {churnData.slice(0, 8).map((c) => (
                  <div
                    key={c.customer_id}
                    className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">({c.unified_id})</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            c.churn_risk_level === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : c.churn_risk_level === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {c.churn_risk_level} Risk ({c.churn_risk_score}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total Spent: ${c.total_spent} • Orders: {c.order_count} • Primary Channel: {c.channel.toUpperCase()}
                      </div>

                      {/* XAI Factors list */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.factors.map((f, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {f.factor} ({f.impact})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block mb-1">Recommended Retention Protocol</span>
                      <span className="text-xs font-semibold text-teal-400 block max-w-xs">{c.retention_strategy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Return & Margin Protection */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Product Return Probability & Root-Cause Remediation
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  GradientBoostingClassifier evaluating category sizing traits and historical return patterns
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {returnData.map((r) => (
                    <div
                      key={r.sku}
                      className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{r.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.return_risk_level === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {r.return_risk_level} Risk ({r.return_risk_score}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Category: {r.category} | Price: ${r.price} | Return Rate: {r.return_rate}%
                      </div>
                      <div className="text-[11px] text-rose-400 font-medium">
                        Primary Driver: {r.primary_risk_driver}
                      </div>
                      <div className="text-[11px] text-teal-300 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                        <strong>Remediation:</strong> {r.recommended_remediation || r.recommended_prevention}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Personalized Recommendations */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Collaborative & Content-Based Personalization Engine
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  "Frequently Purchased Together" cross-sell affinities based on transactional co-occurrence
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl space-y-3"
                    >
                      <img
                        src={rec.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                        alt={rec.product?.name}
                        className="w-full h-36 object-cover rounded-lg"
                      />
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-teal-400">{rec.matchScore}% Match Score</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">${rec.product?.price}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{rec.product?.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 italic leading-snug">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIPredictions;
