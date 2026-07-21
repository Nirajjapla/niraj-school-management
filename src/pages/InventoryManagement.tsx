import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Plus, X } from 'lucide-react';
import { libraryApi } from '../services/api';
import { mockInventory } from '../services/mockData';

const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'General',
    quantity: 1,
    rack_number: ''
  });

  const fetchBooks = async () => {
    try {
      const data = await libraryApi.getBooks(searchTerm);
      if (Array.isArray(data) && data.length > 0) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Error fetching library books:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await libraryApi.createBook(newBook);
      fetchBooks();
      setShowAddModal(false);
      setNewBook({ title: '', author: '', category: 'General', quantity: 1, rack_number: '' });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add book');
    }
  };

  const displayedItems = books.length > 0 ? books : mockInventory;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Library & Asset Catalog</h1>
          <p className="text-gray-600">Manage library books, rack locations, and school assets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Library Book</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search library catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title / Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author / Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location / Rack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.title || item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.author || item.condition || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 capitalize">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {item.available_quantity !== undefined ? item.available_quantity : item.quantity} available
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.rack_number || item.location || 'Rack 1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Add Book to Library Catalog</h2>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.quantity}
                    onChange={e => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={newBook.rack_number}
                    onChange={e => setNewBook({ ...newBook, rack_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    placeholder="e.g. Rack B-4"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3b5ccc]"
                >
                  Add Book
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

