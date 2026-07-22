import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { announcementApi } from '../services/api';

interface Circular {
  id: string | number;
  title: string;
  content: string;
  targetAudience?: string;
  target_role?: string;
  priority?: string;
  createdBy?: string;
  author?: { name: string };
  createdAt?: string;
  created_at?: string;
}

const CommunicationManagement: React.FC = () => {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'medium'
  });

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementApi.getAnnouncements();
      setCirculars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setCirculars([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredCirculars = circulars.filter(circular =>
    circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circular.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await announcementApi.createAnnouncement({
        title: formData.title,
        content: formData.content,
        target_role: formData.targetAudience === 'students' ? 'student' : formData.targetAudience === 'teachers' ? 'teacher' : formData.targetAudience === 'parents' ? 'parent' : 'all'
      });
      fetchAnnouncements();
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        targetAudience: 'all',
        priority: 'medium'
      });
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      alert(err.message || 'Failed to send announcement');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Communication & Circulars</h1>
        <p className="text-gray-600">Send announcements and notifications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search circulars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Circular</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {filteredCirculars.map((circular) => (
              <div key={circular.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{circular.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    (circular.priority || 'medium') === 'high'
                      ? 'bg-red-100 text-red-700'
                      : (circular.priority || 'medium') === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {circular.priority || 'medium'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{circular.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    To: <span className="capitalize font-medium">{circular.target_role || circular.targetAudience || 'all'}</span>
                  </span>
                  <span className="text-gray-500">
                    By: {circular.author?.name || circular.createdBy || 'Admin'} | {circular.created_at ? circular.created_at.split('T')[0] : circular.createdAt || new Date().toISOString().split('T')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">New Circular</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                      <option value="staff">Staff</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3d5fd8] transition"
                >
                  Send Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationManagement;
