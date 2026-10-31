import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Boxes,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState('');

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Electronics',
    price: 99.99,
    costPrice: 40.0,
    stockQuantity: 50,
    lowStockThreshold: 15,
    supplierName: 'Apex Retail Supply Co.',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { search, category };
      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      sku: '',
      name: '',
      description: '',
      category: 'Electronics',
      price: 99.99,
      costPrice: 40.0,
      stockQuantity: 50,
      lowStockThreshold: 15,
      supplierName: 'Apex Retail Supply Co.',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setForm({
      sku: prod.sku,
      name: prod.name,
      description: prod.description || '',
      category: prod.category,
      price: prod.price,
      costPrice: prod.costPrice,
      stockQuantity: prod.stockQuantity,
      lowStockThreshold: prod.lowStockThreshold || 15,
      supplierName: prod.supplier?.name || 'Apex Retail Supply Co.',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, form);
        setNotification(`Updated ${form.name} successfully!`);
      } else {
        await api.post('/products', form);
        setNotification(`Added new product ${form.name}!`);
      }
      setShowModal(false);
      fetchProducts();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const categories = [
    'all',
    'Electronics',
    'Apparel',
    'Home & Living',
    'Footwear',
    'Beauty',
    'Accessories',
    'Sports & Outdoors',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            <span>Product Catalog & Merchandising</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SKU management, unit pricing, real-time stock levels, and historical return rates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add New Product SKU</span>
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
        <form onSubmit={handleSearch} className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, product name..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-teal-500 text-navy-950 font-bold'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {c === 'all' ? 'All Catalog' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Cost Price</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Return Rate</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-navy-700"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">${p.price}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">${p.costPrice}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stockQuantity <= p.lowStockThreshold
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.returnRiskLevel === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : p.returnRiskLevel === 'Medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {p.returnRate}% ({p.returnRiskLevel})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add New Product SKU'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">SKU Code</label>
              <input
                type="text"
                required
                disabled={!!editingProduct}
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. ELEC-109"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Product Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              >
                {categories.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold mb-1">Retail Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Stock Units</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Low Threshold</label>
              <input
                type="number"
                required
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
