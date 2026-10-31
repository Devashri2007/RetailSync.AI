import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  ShoppingBag,
  Search,
  Filter,
  PlusCircle,
  Globe,
  Smartphone,
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState('');

  // New Order State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderChannel, setOrderChannel] = useState('web');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { search, channel, status };
      const res = await api.get('/orders', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [channel, status]);

  const handleOpenCreate = async () => {
    setShowCreateModal(true);
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/products?limit=100'),
      ]);
      if (cRes.data.success) setCustomers(cRes.data.data);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (cRes.data.data.length > 0) setSelectedCustomer(cRes.data.data[0]._id);
      if (pRes.data.data.length > 0) setOrderItems([{ productId: pRes.data.data[0]._id, quantity: 1 }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders', {
        customerId: selectedCustomer,
        channel: orderChannel,
        items: orderItems,
      });
      if (res.data.success) {
        setNotification(`Order #${res.data.data.orderNumber} successfully created!`);
        setShowCreateModal(false);
        fetchOrders();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  const ChannelBadge = ({ ch }) => {
    const isWeb = ch === 'web';
    const isMobile = ch === 'mobile';
    const Icon = isWeb ? Globe : isMobile ? Smartphone : Store;
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300">
        <Icon className="w-3 h-3 text-teal-400" />
        <span>{ch}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <span>Omnichannel Sales & Order Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-channel order fulfillment, real-time inventory adjustments, and return risk tagging
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New Order</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer ID..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="web">Web Storefront</option>
            <option value="mobile">Mobile App</option>
            <option value="store">Physical Store</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Order Number & Date</th>
                <th className="px-4 py-3">Unified Customer</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Order Total</th>
                <th className="px-4 py-3">Fulfillment Status</th>
                <th className="px-4 py-3">Predicted Return Risk</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No orders found matching parameters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{o.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Guest Customer'}
                      </span>
                      <span className="text-[10px] text-teal-400 font-mono">{o.unifiedCustomerId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ChannelBadge ch={o.channel} />
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      ${o.finalAmount}
                      <span className="text-[10px] text-slate-400 block font-normal">{o.items.length} item(s)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : o.orderStatus === 'Returned'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.predictedReturnRisk === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : o.predictedReturnRisk === 'Medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {o.predictedReturnRisk} Risk ({o.returnRiskScore || 20}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        subtitle={`Channel: ${selectedOrder?.channel.toUpperCase()} | Customer: ${selectedOrder?.unifiedCustomerId}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Payment Details</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Invoiced</span>
                <span className="font-extrabold text-teal-400 text-sm">${selectedOrder.finalAmount}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Order Line Items</span>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-navy-950 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{item.productName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{item.sku} • Qty: {item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">${item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Omnichannel Transaction"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.unifiedCustomerId} - {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Sales Channel</label>
            <select
              value={orderChannel}
              onChange={(e) => setOrderChannel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="web">Web Online Store</option>
              <option value="mobile">Mobile Application</option>
              <option value="store">Physical Flagship Store</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Item</label>
            <div className="flex gap-2">
              <select
                value={orderItems[0].productId}
                onChange={(e) => setOrderItems([{ ...orderItems[0], productId: e.target.value }])}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (${p.price} | Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={orderItems[0].quantity}
                onChange={(e) => setOrderItems([{ ...orderItems[0], quantity: Number(e.target.value) }])}
                className="w-20 px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-bold text-navy-950 bg-teal-400 hover:bg-teal-300"
            >
              Confirm & Book Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderManagement;
