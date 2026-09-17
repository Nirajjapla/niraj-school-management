import React, { useState } from 'react';
import { Search, Plus, X, Trash2, Edit, BookOpen, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { InventoryItem } from '../services/centralData';

const InventoryManagement: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Library & Asset Catalog</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage library books, lab equipment, sports gear, and classroom IT assets</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Asset / Book</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, rack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none"
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
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Title / Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Author / Specs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Total Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Available Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Rack / Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4e74f9]" />
                    <span>{item.title}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{item.author || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full">
                      {item.availableQuantity} available
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{item.rackNumber}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-gray-400 hover:text-blue-600 transition"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No books or assets match the selected search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 dark:border-slate-800 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingItem ? 'Edit Asset / Book' : 'Add New Asset / Book'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Title / Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. NCERT Mathematics Class 10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Author / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Dr. H.C. Verma"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="Library">Library</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Sports">Sports</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1, availableQuantity: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.quantity}
                    value={form.availableQuantity}
                    onChange={(e) => setForm({ ...form, availableQuantity: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Rack / Shelf / Room Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.rackNumber}
                  onChange={(e) => setForm({ ...form, rackNumber: e.target.value })}
                  placeholder="e.g. Rack-B-04 or Bio Lab 1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white font-medium rounded-lg transition"
                >
                  {editingItem ? 'Update Asset' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
