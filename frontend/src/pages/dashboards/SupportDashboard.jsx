import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  LifeBuoy,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Flame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get('/analytics/support-kpis');
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

  const churnRiskTickets = data?.churnRiskTickets || [];
  const sentimentOverview = data?.sentimentOverview || [];
  const ticketStats = data?.ticketStats || [];

  const openCount = ticketStats.find((s) => s._id === 'Open')?.count || 0;
  const inProgressCount = ticketStats.find((s) => s._id === 'In Progress')?.count || 0;
  const resolvedCount = ticketStats.find((s) => s._id === 'Resolved')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Customer Experience & Retention Center</span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Support Role
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Proactive Churn Signal Interception: Connecting dissatisfied support tickets to retention actions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Open Ticket Queue"
          value={openCount}
          badgeText="Active"
          badgeColor="amber"
          icon={LifeBuoy}
          subtitle="Awaiting Agent Response"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={LifeBuoy}
          subtitle="Under Investigation"
        />
        <StatCard
          title="Resolved Tickets"
          value={resolvedCount}
          isPositive={true}
          icon={CheckCircle2}
          subtitle="Closed Cases"
        />
        <StatCard
          title="Churn Risk Triggers"
          value={churnRiskTickets.length}
          badgeText="Critical"
          badgeColor="rose"
          icon={Flame}
          subtitle="Escalated to Retention"
        />
      </div>

      {/* Churn Signals Section */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Customer Churn Early Warning Signals
              </h2>
              <p className="text-[11px] text-slate-400">
                Support tickets flagged by AI sentiment analysis indicating high probability of customer abandonment
              </p>
            </div>
          </div>
          <Link
            to="/support-tickets"
            className="text-xs text-teal-500 hover:text-teal-400 font-semibold flex items-center gap-1"
          >
            <span>Full Ticket Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {churnRiskTickets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No active tickets triggered churn signals.
            </div>
          ) : (
            churnRiskTickets.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{t.ticketNumber}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {t.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{t.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Customer: <strong className="text-slate-200">{t.customerName}</strong></span>
                    <span>Lifetime Spend: <strong className="text-emerald-400">${t.customer?.totalSpent || 0}</strong></span>
                    <span>Churn Risk: <strong className="text-rose-400">{t.customer?.churnRiskScore || 85}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/customers/${t.customer?._id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-navy-800 hover:bg-navy-750 transition-colors"
                  >
                    View LTV Profile
                  </Link>
                  <Link
                    to="/action-center"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
                  >
                    Deploy Retention Offer
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sentimentOverview.map((item) => {
          const isPos = item._id === 'Positive';
          const isFrust = item._id === 'Frustrated';
          const isNeg = item._id === 'Negative';
          const Icon = isPos ? Smile : isFrust ? Flame : isNeg ? Frown : Meh;
          const colorClass = isPos
            ? 'text-emerald-500'
            : isFrust
            ? 'text-rose-500'
            : isNeg
            ? 'text-amber-500'
            : 'text-slate-400';

          return (
            <div key={item._id} className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{item._id} Sentiment</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{item.count} tickets</span>
              </div>
              <Icon className={`w-7 h-7 ${colorClass}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupportDashboard;
