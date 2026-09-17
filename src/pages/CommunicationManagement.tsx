import React, { useState } from 'react';
import {
  Plus,
  Search,
  X,
  Download,
  Eye,
  Trash2,
  Paperclip
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CircularItem } from '../services/centralData';

const CommunicationManagement: React.FC = () => {
  const { circulars, addCircular, deleteCircular } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCircular, setSelectedCircular] = useState<CircularItem | null>(null);
  const [showAllCirculars, setShowAllCirculars] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    targetAudience: 'All' as 'All' | 'Students' | 'Teachers',
    priority: 'Normal' as 'Normal' | 'Urgent',
    author: 'Principal Office',
    attachmentName: '',
    attachmentSize: '',
    attachmentType: ''
  });

  const filteredCirculars = circulars.filter(circular => {
    const matchesSearch = circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circular.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circular.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAudience = !filterAudience || circular.targetAudience === filterAudience;

    return matchesSearch && matchesAudience;
  });

  // Display limited latest circulars unless "View All" is toggled (Requirement 5)
  const displayedCirculars = showAllCirculars ? filteredCirculars : filteredCirculars.slice(0, 3);

  const handleOpenView = (circular: CircularItem) => {
    setSelectedCircular(circular);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this circular?')) {
      deleteCircular(id);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachmentName: file.name,
        attachmentSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        attachmentType: file.type || 'application/pdf'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill title and content.');
      return;
    }

    addCircular({
      title: formData.title,
      content: formData.content,
      date: formData.date,
      targetAudience: formData.targetAudience,
      priority: formData.priority,
      author: formData.author,
      attachment: formData.attachmentName
        ? {
            name: formData.attachmentName,
            size: formData.attachmentSize || '1.2 MB',
            type: formData.attachmentType || 'application/pdf'
          }
        : undefined
    });

    setShowModal(false);
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      targetAudience: 'All',
      priority: 'Normal',
      author: 'Principal Office',
      attachmentName: '',
      attachmentSize: '',
      attachmentType: ''
    });
  };

  const handleDownloadAttachment = (circ: CircularItem) => {
    if (!circ.attachment) return;
    const content = `
CIRCULAR DOCUMENT
=============================================
Title: ${circ.title}
Date: ${circ.date}
Target Audience: ${circ.targetAudience}
Priority: ${circ.priority}
Issued by: ${circ.author}

CIRCULAR CONTENT:
${circ.content}

=============================================
Official Notice - School Administration
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', circ.attachment.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Circulars & Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Publish school notices, upload document attachments, and notify students & teachers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Circular
        </button>
      </div>

      {/* Filters & View All Toggle Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search circulars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>

            {/* Audience List with 3 options: All, Students, Teachers */}
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Audiences</option>
              <option value="All">All</option>
              <option value="Students">Students</option>
              <option value="Teachers">Teachers</option>
            </select>
          </div>

          {/* Toggle between Latest & View All */}
          <button
            onClick={() => setShowAllCirculars(!showAllCirculars)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            {showAllCirculars ? 'Show Latest Only (Top 3)' : `View All Circulars (${filteredCirculars.length})`}
          </button>
        </div>
      </div>

      {/* Circulars Table View (Requirement 1: Single Date, Table View) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Date</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Title & Content</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Target Audience</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Priority</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Attachment</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Author</th>
                <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {displayedCirculars.map((circ) => (
                <tr key={circ.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 text-xs font-semibold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    {circ.date}
                  </td>

                  <td className="px-5 py-4 max-w-md">
                    <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                      {circ.title}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                      {circ.content}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        circ.targetAudience === 'All'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : circ.targetAudience === 'Teachers'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {circ.targetAudience}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        circ.priority === 'Urgent'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {circ.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs">
                    {circ.attachment ? (
                      <button
                        onClick={() => handleDownloadAttachment(circ)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4e74f9] hover:bg-indigo-100 font-medium transition"
                        title="Download Attachment"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{circ.attachment.name}</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">None</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-700 dark:text-slate-300 font-medium">
                    {circ.author}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenView(circ)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                        title="View Full Notice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(circ.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition"
                        title="Delete Circular"
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

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Showing {displayedCirculars.length} of {filteredCirculars.length} circulars</span>
          {!showAllCirculars && filteredCirculars.length > 3 && (
            <button
              onClick={() => setShowAllCirculars(true)}
              className="text-[#4e74f9] font-bold hover:underline"
            >
              + {filteredCirculars.length - 3} more circulars available. Click to View All
            </button>
          )}
        </div>
      </div>

      {/* New Circular Modal with File Attachment Option */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="p-1 border-b border-gray-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Official Circular</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Publish notices with target audience and attachments</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Examination Schedule & Guidelines 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                  Notice Content *
                </label>
                <textarea
                  placeholder="Type the detailed circular information here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Target Audience: All, Students, Teachers */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Target Audience (3 Options) *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm font-medium"
                  >
                    <option value="All">All (Campus Wide)</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers</option>
                  </select>
                </div>

                {/* Priority: Normal | Urgent */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm font-medium"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Date of Issue *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* File Attachment Option (Requirement 3) */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-200">
                  File Attachment (PDF, DOCX, Images)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer hover:bg-gray-100 transition flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileAttach}
                      className="hidden"
                    />
                  </label>
                  {formData.attachmentName ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Attached: {formData.attachmentName} ({formData.attachmentSize})
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">No file selected</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Circular Details Modal (Requirement 4) */}
      {showViewModal && selectedCircular && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-xs text-gray-400 dark:text-slate-500 block mb-1">
                  Issued on: {selectedCircular.date} | By: {selectedCircular.author}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCircular.title}
                </h2>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedCircular.priority === 'Urgent'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}
              >
                {selectedCircular.priority}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-slate-400">Audience:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200">
                  {selectedCircular.targetAudience}
                </span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl leading-relaxed text-gray-800 dark:text-slate-200 text-sm whitespace-pre-wrap">
                {selectedCircular.content}
              </div>

              {selectedCircular.attachment && (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold">{selectedCircular.attachment.name}</p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">{selectedCircular.attachment.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(selectedCircular)}
                    className="px-3 py-1.5 bg-[#4e74f9] text-white rounded-lg text-xs font-semibold hover:bg-[#3d5fd8] transition flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationManagement;
