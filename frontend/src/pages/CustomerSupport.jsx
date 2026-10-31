import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  LifeBuoy,
  Search,
  Filter,
  PlusCircle,
  Flame,
  Smile,
  Frown,
  Meh,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';

const CustomerSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [churnSignal, setChurnSignal] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [notification, setNotification] = useState('');

  // Create Ticket Form
  const [customerId, setCustomerId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Product Complaint');
  const [priority, setPriority] = useState('Medium');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: status !== 'all' ? status : undefined,
        sentiment: sentiment !== 'all' ? sentiment : undefined,
        churnSignal: churnSignal === 'true' ? 'true' : undefined,
      };
      const res = await api.get('/tickets', { params });
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status, sentiment, churnSignal]);

  const handleOpenCreate = async () => {
    setShowCreateModal(true);
    try {
      const res = await api.get('/customers?limit=100');
      if (res.data.success && res.data.data.length > 0) {
        setCustomers(res.data.data);
        setCustomerId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tickets', {
        customerId,
        subject,
        description,
        category,
        priority,
      });
      if (res.data.success) {
        setNotification(`Ticket #${res.data.data.ticketNumber} created! [Sentiment: ${res.data.data.sentiment}]`);
        setShowCreateModal(false);
        fetchTickets();
        setSubject('');
        setDescription('');
        setTimeout(() => setNotification(''), 4500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error filing ticket');
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/tickets/${selectedTicket._id}`, {
        status: selectedTicket.status,
        resolutionNotes: selectedTicket.resolutionNotes,
      });
      if (res.data.success) {
        setNotification(`Updated ticket #${selectedTicket.ticketNumber}`);
        setSelectedTicket(null);
        fetchTickets();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const SentimentBadge = ({ sent }) => {
    const isFrust = sent === 'Frustrated';
    const isNeg = sent === 'Negative';
    const isPos = sent === 'Positive';
    const Icon = isFrust ? Flame : isNeg ? Frown : isPos ? Smile : Meh;
    const color = isFrust
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      : isNeg
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : isPos
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : 'bg-slate-500/20 text-slate-400 border-slate-500/30';

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{sent}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-teal-400" />
            <span>Customer Support & Sentiment Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time NLP sentiment tagging, churn signal escalation, and customer complaint remediation
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log New Support Ticket</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchTickets(); }} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, subject, customer..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
            <option value="Frustrated">Frustrated</option>
          </select>

          <select
            value={churnSignal}
            onChange={(e) => setChurnSignal(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Churn Signals</option>
            <option value="true">Churn Signal Triggered</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Ticket # & Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">NLP Sentiment</th>
                <th className="px-4 py-3">Churn Warning</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900 dark:text-white block">{t.subject}</div>
                      <span className="text-[10px] font-mono text-slate-400">{t.ticketNumber} • {new Date(t.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{t.customerName}</div>
                      <span className="text-[10px] font-mono text-teal-400">{t.unifiedCustomerId}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.category}</td>
                    <td className="px-4 py-3">
                      <SentimentBadge sent={t.sentiment} />
                    </td>
                    <td className="px-4 py-3">
                      {t.churnSignalTriggered ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                          <Flame className="w-3 h-3 text-rose-500" />
                          <span>Signal Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Resolution Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket ${selectedTicket?.ticketNumber}: ${selectedTicket?.subject}`}
        subtitle={`Customer: ${selectedTicket?.customerName} (${selectedTicket?.unifiedCustomerId})`}
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Customer Complaint Description:</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedTicket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Resolution Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Agent</label>
                <input
                  type="text"
                  disabled
                  value={selectedTicket.assignedStaffName || 'David Kim'}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Resolution Notes</label>
              <textarea
                rows={3}
                value={selectedTicket.resolutionNotes || ''}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, resolutionNotes: e.target.value })}
                placeholder="Document resolution steps, retention voucher issued, or dispatch tracking..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-bold text-navy-950 bg-teal-400 hover:bg-teal-300"
              >
                Save Resolution
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Log Support Ticket"
        subtitle="AI NLP engine will analyze sentiment and trigger churn alerts if frustrated cues are detected"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.unifiedCustomerId} - {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Product Complaint">Product Complaint</option>
                <option value="Delivery Delay">Delivery Delay</option>
                <option value="Refund Inquiry">Refund Inquiry</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Order arrived damaged / sizing mismatch"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Customer Message Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste customer message. NLP engine will evaluate sentiment..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            ></textarea>
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
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerSupport;
