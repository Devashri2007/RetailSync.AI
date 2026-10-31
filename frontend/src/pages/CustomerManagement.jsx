import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Clock,
  ShoppingBag,
  RotateCcw,
  LifeBuoy,
  GitMerge,
  ChevronRight,
  Globe,
  Smartphone,
  Store,
} from 'lucide-react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [channel, setChannel] = useState('all');
  const [churnRisk, setChurnRisk] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Customer Form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    channel: 'web',
    segment: 'New',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { search, segment, channel, churnRiskLevel: churnRisk };
      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [segment, channel, churnRisk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setDetailLoading(true);
    try {
      const res = await api.get(`/customers/${cust._id}`);
      if (res.data.success) {
        setCustomerDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', {
        ...formData,
        address: { city: formData.city, state: formData.state, zipCode: formData.zipCode },
      });
      if (res.data.success) {
        setShowCreateModal(false);
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating customer');
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
      {/* Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <span>Customer Intelligence Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Omnichannel profiles, unified purchase timelines, and early churn risk classifications
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, ID..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Filter */}
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Segments</option>
            <option value="VIP">VIP</option>
            <option value="Loyal">Loyal</option>
            <option value="At-Risk">At-Risk</option>
            <option value="Occasional">Occasional</option>
            <option value="New">New</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile App</option>
            <option value="store">Physical Store</option>
          </select>

          {/* Churn Risk Filter */}
          <select
            value={churnRisk}
            onChange={(e) => setChurnRisk(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Churn Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Unified ID & Name</th>
                <th className="px-4 py-3">Channel & Contact</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Churn Risk</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => handleViewCustomer(c)}
                    className="hover:bg-slate-50 dark:hover:bg-navy-850 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{c.firstName} {c.lastName}</span>
                        {c.mergeHistory?.length > 0 && (
                          <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.2 rounded font-mono">
                            Merged
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-teal-500 font-mono">{c.unifiedCustomerId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <ChannelBadge ch={c.channel} />
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{c.email}</div>
                      <div className="text-slate-400 text-[10px]">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300">
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      ${c.totalSpent?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {c.orderCount} orders
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.churnRiskLevel === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : c.churnRiskLevel === 'Medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {c.churnRiskLevel} ({c.churnRiskScore}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Combined Timeline Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerDetail(null);
        }}
        title={`Unified Customer Profile: ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
        subtitle={`Unified Customer ID: ${selectedCustomer?.unifiedCustomerId} | Segment: ${selectedCustomer?.segment}`}
        maxWidth="max-w-4xl"
      >
        {detailLoading || !customerDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Lifetime Spend</span>
                <span className="text-base font-extrabold text-emerald-500">${customerDetail.customer.totalSpent}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Orders</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{customerDetail.customer.orderCount}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Basket Value</span>
                <span className="text-base font-extrabold text-teal-400">${customerDetail.customer.avgOrderValue}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block uppercase">Churn Risk Score</span>
                <span className={`text-base font-extrabold ${customerDetail.customer.churnRiskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {customerDetail.customer.churnRiskScore}% ({customerDetail.customer.churnRiskLevel})
                </span>
              </div>
            </div>

            {/* Unified Omnichannel Activity Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                Unified Omnichannel Activity Timeline ({customerDetail.timeline?.length} events)
              </h3>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {customerDetail.timeline?.map((evt, idx) => {
                  const Icon =
                    evt.type === 'ORDER'
                      ? ShoppingBag
                      : evt.type === 'RETURN'
                      ? RotateCcw
                      : evt.type === 'TICKET'
                      ? LifeBuoy
                      : GitMerge;

                  const color =
                    evt.type === 'ORDER'
                      ? 'text-teal-400 bg-teal-500/10'
                      : evt.type === 'RETURN'
                      ? 'text-rose-400 bg-rose-500/10'
                      : evt.type === 'TICKET'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-indigo-400 bg-indigo-500/10';

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-3 text-xs"
                    >
                      <div className={`p-2 rounded-lg ${color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{evt.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(evt.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{evt.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Customer Profile"
        subtitle="Customer will be issued a system-wide unified customer ID"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Primary Acquisition Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="web">Web Storefront</option>
                <option value="mobile">Mobile Application</option>
                <option value="store">Physical Flagship Store</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Initial Segment</label>
              <select
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="New">New</option>
                <option value="Occasional">Occasional</option>
                <option value="Loyal">Loyal</option>
                <option value="VIP">VIP</option>
              </select>
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
