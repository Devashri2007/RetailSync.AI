import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
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

const WhatIfSimulator = () => {
  const [currentPrice, setCurrentPrice] = useState(120.0);
  const [newPrice, setNewPrice] = useState(135.0);
  const [baseDemand, setBaseDemand] = useState(65);
  const [currentStock, setCurrentStock] = useState(80);
  const [elasticity, setElasticity] = useState(-1.5);
  const [result, setResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/ai/what-if-simulate', {
        currentPrice,
        newPrice,
        baseDemand,
        currentStock,
        elasticity,
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [currentPrice, newPrice, baseDemand, currentStock, elasticity]);

  const chartData = result
    ? [
        {
          name: 'Demand (Units)',
          Baseline: result.current_demand,
          Simulated: result.projected_demand,
        },
        {
          name: 'Revenue ($)',
          Baseline: result.current_revenue,
          Simulated: result.projected_revenue,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-400" />
          <span>What-If Demand & Price Sensitivity Simulator</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Simulate strategic price modifications, promotion discounts, and stockout feasibility
        </p>
      </div>

      {/* Official Simulation Notice Disclaimer Banner */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong>SIMULATION ESTIMATE ONLY:</strong> What-If forecasts are generated via empirical price elasticity modeling (\(\% \Delta Q = \varepsilon \times \% \Delta P\)) to test operational scenarios without affecting live production pricing.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel (1 col) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-3">
            Scenario Parameters
          </h2>

          {/* Current Price */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Baseline Unit Price</span>
              <span className="font-bold text-teal-400">${currentPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          {/* New Simulated Price */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Simulated Target Price</span>
              <span className="font-bold text-teal-400">${newPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Price delta: {((newPrice - currentPrice) / currentPrice * 100).toFixed(1)}%
            </span>
          </div>

          {/* Baseline Demand */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Monthly Run-Rate Demand</span>
              <span className="font-bold text-slate-900 dark:text-white">{baseDemand} units</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={baseDemand}
              onChange={(e) => setBaseDemand(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          {/* Available Inventory */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Available Stock On Hand</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentStock} units</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={currentStock}
              onChange={(e) => setCurrentStock(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          {/* Price Elasticity */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Price Elasticity Coefficient</span>
              <span className="font-bold text-slate-900 dark:text-white">{elasticity}</span>
            </div>
            <input
              type="range"
              min="-3.0"
              max="-0.5"
              step="0.1"
              value={elasticity}
              onChange={(e) => setElasticity(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              -1.5: Typical retail consumer elasticity
            </span>
          </div>
        </div>

        {/* Results Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              {/* Top Outcome Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Simulated Demand</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {result.projected_demand} units
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      result.demand_change_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {result.demand_change_pct >= 0 ? `+${result.demand_change_pct}%` : `${result.demand_change_pct}%`}
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Simulated Revenue</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    ${result.projected_revenue.toLocaleString()}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      result.revenue_change_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {result.revenue_change_pct >= 0 ? `+${result.revenue_change_pct}%` : `${result.revenue_change_pct}%`}
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Stockout Feasibility</span>
                  <div className="text-xl font-bold mt-1">
                    {result.stockout_projected ? (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-5 h-5" /> Stockout Risk
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5" /> Inventory Feasible
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Demand {result.projected_demand} vs {currentStock} Stock
                  </span>
                </div>
              </div>

              {/* Comparison Visualization */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Baseline vs. Simulated Performance
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Visual comparison between current metrics and simulated scenario
                </p>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Baseline" fill="#64748B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
