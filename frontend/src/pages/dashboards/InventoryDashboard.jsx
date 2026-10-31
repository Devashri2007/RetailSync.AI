import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import {
  Boxes,
  AlertTriangle,
  Clock,
  Truck,
  PlusCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';

const InventoryDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState(60);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/analytics/inventory-kpis');
      if (res.data.success) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleOpenRestock = (item) => {
    setSelectedItem(item);
    setRestockQty(item.reorderQuantity || 60);
    setRestockSupplier(item.supplierName || 'Apex Retail Supply Co.');
  };

  const handleExecuteRestock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setRestocking(true);

    try {
      const res = await api.post(`/inventory/${selectedItem._id}/restock`, {
        quantity: restockQty,
        supplier: restockSupplier,
        notes: 'Replenished via Inventory Manager Dashboard',
      });
      if (res.data.success) {
        setNotification(`Restocked ${restockQty} units of ${selectedItem.productName}!`);
        setSelectedItem(null);
        fetchKPIs();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Restock failed');
    } finally {
      setRestocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const criticalItems = kpis?.criticalItems || [];
  const lowStockCount = criticalItems.filter((i) => i.currentStock <= i.reorderPoint).length;
  const imminentCount = criticalItems.filter(
    (i) => i.predictedStockoutDays !== null && i.predictedStockoutDays <= 7
  ).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Inventory & Supply Chain Center</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Inventory Role
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive stock-out mitigation, supplier lead times, and automated restocking approvals
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Catalog SKUs"
          value={kpis?.totalProducts || 0}
          icon={Package}
          subtitle="Monitored Products"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          badgeText={lowStockCount > 0 ? 'Warning' : 'Normal'}
          badgeColor={lowStockCount > 0 ? 'amber' : 'teal'}
          icon={AlertTriangle}
          subtitle="Below Reorder Threshold"
        />
        <StatCard
          title="Imminent Stock-Outs"
          value={imminentCount}
          badgeText={imminentCount > 0 ? 'Critical' : 'Safe'}
          badgeColor={imminentCount > 0 ? 'rose' : 'teal'}
          icon={Clock}
          subtitle="Projected Depletion <= 7d"
        />
        <StatCard
          title="Restock Requisitions"
          value={(kpis?.restockRecommendations || []).length}
          badgeText="Pending"
          badgeColor="teal"
          icon={Truck}
          subtitle="AI Action Queue"
        />
      </div>

      {/* Imminent Stockout & Low Stock Alert Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              High-Risk Stock-Out Countdown Radar
            </h2>
            <p className="text-[11px] text-slate-400">
              Products anticipated to run out of stock before supplier replenishment lead time
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Reorder Point</th>
                <th className="px-4 py-3">Predicted Stockout</th>
                <th className="px-4 py-3">Supplier Lead Time</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {criticalItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    All product inventories are well-balanced above reorder thresholds.
                  </td>
                </tr>
              ) : (
                criticalItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.product?.category || 'General'}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      <span className={`px-2 py-0.5 rounded ${item.currentStock <= item.reorderPoint ? 'bg-rose-500/10 text-rose-500 font-bold' : ''}`}>
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.reorderPoint} units</td>
                    <td className="px-4 py-3">
                      {item.predictedStockoutDays !== null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <Clock className="w-3 h-3" />
                          <span>~{item.predictedStockoutDays} days remaining</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">No stockout predicted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.supplierLeadTime || 5} days ({item.supplierName})
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenRestock(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Restock: ${selectedItem?.productName}`}
        subtitle={`SKU: ${selectedItem?.sku} | Current Stock: ${selectedItem?.currentStock} units`}
      >
        <form onSubmit={handleExecuteRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Replenishment Quantity (Units)
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supplier
            </label>
            <input
              type="text"
              required
              value={restockSupplier}
              onChange={(e) => setRestockSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={restocking}
              className="px-4 py-2 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50"
            >
              {restocking ? 'Replenishing...' : 'Confirm Replenishment Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;
