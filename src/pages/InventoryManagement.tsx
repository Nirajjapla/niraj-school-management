import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, X, Trash2, Edit, BookOpen, Filter, Package, MapPin, Tag, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { InventoryItem } from '../services/centralData';

const InventoryManagement: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    title: '',
    author: '',
    category: 'Library' as 'Library' | 'Laboratory' | 'Sports' | 'IT Equipment' | 'Stationery',
    quantity: 1,
    availableQuantity: 1,
    rackNumber: '',
    condition: 'New' as 'New' | 'Good' | 'Fair' | 'Maintenance',
    unitPrice: 0
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: '',
      author: '',
      category: 'Library',
      quantity: 10,
      availableQuantity: 10,
      rackNumber: 'Rack-A-01',
      condition: 'New',
      unitPrice: 250
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      author: item.author || '',
      category: item.category,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      rackNumber: item.rackNumber,
      condition: item.condition,
      unitPrice: item.unitPrice || 0
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      deleteInventoryItem(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        title: form.title.trim(),
        author: form.author.trim() || undefined,
        category: form.category,
        quantity: Number(form.quantity),
        availableQuantity: Number(form.availableQuantity),
        rackNumber: form.rackNumber.trim(),
        condition: form.condition,
        unitPrice: Number(form.unitPrice)
      });
    } else {
      addInventoryItem({
        title: form.title.trim(),
        author: form.author.trim() || undefined,
        category: form.category,
        quantity: Number(form.quantity),
        availableQuantity: Number(form.availableQuantity),
        rackNumber: form.rackNumber.trim() || 'General Rack',
        condition: form.condition,
        unitPrice: Number(form.unitPrice)
      });
    }

    setShowAddModal(false);
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.rackNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Library':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'Laboratory':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'Sports':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'IT Equipment':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'Stationery':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'Good':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'Fair':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'Maintenance':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Library & Asset Catalog</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">Manage library books, lab equipment, sports gear, and classroom IT assets</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Asset / Book</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, rack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
            >
              <option value="">All Categories</option>
              <option value="Library">Library Books</option>
              <option value="Laboratory">Laboratory Equipment</option>
              <option value="Sports">Sports Gear</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Stationery">Stationery</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title / Item</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Author / Specs</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Qty</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Available Stock</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rack / Location</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#4e74f9] shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    {item.author || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.availableQuantity} available
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    {item.rackNumber}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionBadgeClass(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                    No books or assets match the selected search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#4e74f9]">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {editingItem ? 'Edit Asset / Book' : 'Add New Asset / Book'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {editingItem ? 'Update item details and stock information' : 'Register a new resource into the catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
                <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Required fields are marked with an asterisk (<span className="text-red-500">*</span>)
                  </p>

                  {/* Section 1: Item & Classification */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800 pb-2">
                      <Tag className="w-4 h-4 text-[#4e74f9]" />
                      <span>Item & Classification</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Title / Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="e.g. NCERT Mathematics Class 10"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Author / Manufacturer / Specs
                        </label>
                        <input
                          type="text"
                          value={form.author}
                          onChange={(e) => setForm({ ...form, author: e.target.value })}
                          placeholder="e.g. Dr. H.C. Verma"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        >
                          <option value="Library">Library</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Sports">Sports</option>
                          <option value="IT Equipment">IT Equipment</option>
                          <option value="Stationery">Stationery</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Condition <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.condition}
                          onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        >
                          <option value="New">New</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Unit Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.unitPrice}
                          onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 250"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Stock & Location Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800 pb-2">
                      <MapPin className="w-4 h-4 text-[#4e74f9]" />
                      <span>Stock & Location Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Total Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={form.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setForm({
                              ...form,
                              quantity: val,
                              availableQuantity: form.availableQuantity > val ? val : form.availableQuantity
                            });
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Available Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={form.quantity}
                          value={form.availableQuantity}
                          onChange={(e) => setForm({ ...form, availableQuantity: parseInt(e.target.value) || 0 })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Rack / Shelf / Room Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.rackNumber}
                          onChange={(e) => setForm({ ...form, rackNumber: e.target.value })}
                          placeholder="e.g. Rack-B-04 or Bio Lab 1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white text-sm font-medium rounded-lg transition shadow-sm"
                  >
                    {editingItem ? 'Update Asset' : 'Save to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* View Item Details Modal */}
      {viewingItem &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#4e74f9]">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {viewingItem.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(viewingItem.category)}`}>
                        {viewingItem.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionBadgeClass(viewingItem.condition)}`}>
                        {viewingItem.condition} Condition
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
                {/* Section 1: Item & Classification */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Tag className="w-4 h-4 text-[#4e74f9]" />
                    <span>Item & Classification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Title / Item Name</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{viewingItem.title}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Author / Manufacturer / Specs</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">{viewingItem.author || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Category</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">{viewingItem.category}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Condition</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">{viewingItem.condition}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Unit Price</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">₹{viewingItem.unitPrice?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Stock & Location Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <MapPin className="w-4 h-4 text-[#4e74f9]" />
                    <span>Stock & Location Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Total Quantity</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{viewingItem.quantity} units</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Available Stock</label>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{viewingItem.availableQuantity} units</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Issued / In-Use Stock</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">{Math.max(0, viewingItem.quantity - viewingItem.availableQuantity)} units</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Rack / Shelf / Room Location</label>
                      <p className="text-sm font-normal text-gray-800 dark:text-slate-200 mt-0.5">{viewingItem.rackNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    handleOpenEdit(item);
                  }}
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default InventoryManagement;

