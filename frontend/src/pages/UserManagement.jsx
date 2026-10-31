import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  UserX,
  UserCheck,
  Activity,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [notification, setNotification] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support_staff',
    department: 'Customer Experience',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        api.get('/users', { params: { search, role } }),
        api.get('/users/audit-logs'),
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (aRes.data.success) setAuditLogs(aRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', form);
      if (res.data.success) {
        setNotification(`Created account for ${form.name} (${form.role})`);
        setShowModal(false);
        fetchUsers();
        setForm({
          name: '',
          email: '',
          password: '',
          role: 'support_staff',
          department: 'Customer Experience',
          phone: '',
        });
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      if (res.data.success) {
        setNotification(`Account status updated for ${user.name}`);
        fetchUsers();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      const res = await api.delete(`/users/${user._id}`);
      if (res.data.success) {
        setNotification(`Deleted ${user.name}`);
        fetchUsers();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'analyst', label: 'Business Analyst' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>Staff Access & Identity Governance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-based authorization control, credential provisioning, and system audit trails
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Provision Staff Account</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 space-x-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Active Personnel ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operational Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff name, email..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </form>

            <div className="flex items-center gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th className="px-5 py-3">Staff Member</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.department}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                            title={u.isActive ? 'Suspend Access' : 'Activate Access'}
                          >
                            {u.isActive ? <UserX className="w-4 h-4 text-amber-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-navy-800 font-bold text-xs text-slate-900 dark:text-white">
            Live System Audit & Security Trail
          </div>
          <div className="divide-y divide-slate-100 dark:divide-navy-800 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-850">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{log.userName}</span>
                    <span className="text-slate-400 ml-1">({log.userRole}): {log.details}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Provision Staff Credential"
        subtitle="Create an internal staff profile and assign role authorizations"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Temporary Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Assign User Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="admin">System Administrator</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="support_staff">Customer Support Staff</option>
                <option value="analyst">Business Analyst</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-bold text-navy-950 bg-teal-400 hover:bg-teal-300"
            >
              Create Staff Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
