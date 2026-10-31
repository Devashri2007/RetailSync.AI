import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  Boxes,
  Search,
  AlertTriangle,
  Clock,
  PlusCircle,
  Truck,
  CheckCircle2,
  History,
} from 'lucide-react';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [restockCost, setRestockCost] = useState(25);
  const [restockNotes, setRestockNotes] = useState('Periodic supply replenishment');
  const [notification, setNotification] = useState('');
  const [viewHistoryItem, setViewHistoryItem] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = { status, search };
      const res = await api.get('/inventory', { params });
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenRestock = (item) => {
    setSelectedItem(item);
    setRestockQty(item.reorderQuantity || 50);
    setRestockCost(Math.round((item.product?.costPrice || 20) * (item.reorderQuantity || 50)));
  };

  const handleExecuteRestock = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/inventory/${selectedItem._id}/restock`, {
        quantity: restockQty,
        cost: restockCost,
        notes: restockNotes,
      });
      if (res.data.success) {
        setNotification(`Restocked ${restockQty} units of ${selectedItem.productName}!`);
        setSelectedItem(null);
        fetchInventory();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Restock failed');
    }
  };

  const statuses = ['all', 'In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-400" />
            <span>Inventory Control & Stock Operations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time warehouse tracking, automated reorder thresholds, and restocking replenishment
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Status Filter */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, supplier..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                status === st
                  ? 'bg-teal-500 text-navy-950 font-bold'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Inventory' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Product SKU & Name</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Stock Status</th>
                <th className="px-4 py-3">Reorder Threshold</th>
                <th className="px-4 py-3">Predicted Stockout</th>
                <th className="px-4 py-3">Supplier & Location</th>
                <th className="px-4 py-3 text-right">Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No inventory records match criteria.
                  </td>
                </tr>
              ) : (
                inventory.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{inv.productName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{inv.sku}</span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      {inv.currentStock} units
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.stockStatus === 'Out of Stock'
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : inv.stockStatus === 'Low Stock'
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : inv.stockStatus === 'Overstocked'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {inv.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{inv.reorderPoint} units</td>
                    <td className="px-4 py-3">
                      {inv.predictedStockoutDays !== null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <Clock className="w-3 h-3" />
                          <span>~{inv.predictedStockoutDays} days</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Safe</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{inv.supplierName}</div>
                      <div className="text-[10px] text-slate-400">{inv.warehouseLocation}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.restockHistory?.length > 0 && (
                          <button
                            onClick={() => setViewHistoryItem(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
                            title="Restock Log"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenRestock(inv)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                      </div>
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
        title={`Restock Requisition: ${selectedItem?.productName}`}
        subtitle={`SKU: ${selectedItem?.sku} | Current Stock: ${selectedItem?.currentStock} units`}
      >
        <form onSubmit={handleExecuteRestock} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Restock Quantity (Units)</label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Purchase Order Cost ($)</label>
            <input
              type="number"
              min="0"
              value={restockCost}
              onChange={(e) => setRestockCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Log Notes / PO Reference</label>
            <input
              type="text"
              value={restockNotes}
              onChange={(e) => setRestockNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-bold text-navy-950 bg-teal-400 hover:bg-teal-300"
            >
              Confirm Replenishment
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={!!viewHistoryItem}
        onClose={() => setViewHistoryItem(null)}
        title={`Restocking Audit Trail: ${viewHistoryItem?.productName}`}
      >
        <div className="space-y-2 text-xs">
          {viewHistoryItem?.restockHistory?.map((h, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-lg border border-slate-200 dark:border-navy-800 flex justify-between">
              <div>
                <span className="font-bold text-teal-400 block">+{h.quantity} units</span>
                <span className="text-[11px] text-slate-400">{h.notes}</span>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>{new Date(h.restockedAt).toLocaleDateString()}</div>
                <div>By: {h.restockedBy}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
