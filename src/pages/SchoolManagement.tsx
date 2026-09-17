import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, School, MapPin, Phone, Mail, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { SchoolProfile } from '../services/centralData';

const SchoolManagement: React.FC = () => {
  const { schools, addSchool, updateSchool, deleteSchool } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<SchoolProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<SchoolProfile>>({
    name: '',
    code: '',
    affiliationNo: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    principalName: '',
    establishedYear: 2000,
    status: 'Active',
    logo_url: ''
  });

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentSchool(null);
    setFormData({
      name: '',
      code: `SCH-0${schools.length + 1}`,
      affiliationNo: 'CBSE-AFF/2026/0000',
      address: '',
      city: 'New Delhi',
      state: 'Delhi',
      phone: '',
      email: '',
      principalName: '',
      establishedYear: 2010,
      status: 'Active',
      logo_url: ''
    });
    setShowModal(true);
  };

  const handleEdit = (school: SchoolProfile) => {
    setIsEditing(true);
    setCurrentSchool(school);
    setFormData(school);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      deleteSchool(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (isEditing && currentSchool) {
      updateSchool(currentSchool.id, formData);
    } else {
      addSchool({
        name: formData.name.trim(),
        code: formData.code || `SCH-${Date.now().toString().slice(-4)}`,
        affiliationNo: formData.affiliationNo || 'CBSE-AFF/2026/0000',
        address: formData.address || '',
        city: formData.city || 'New Delhi',
        state: formData.state || 'Delhi',
        phone: formData.phone || '',
        email: formData.email || '',
        principalName: formData.principalName || 'Principal',
        establishedYear: formData.establishedYear || 2015,
        status: formData.status || 'Active',
        logo_url: formData.logo_url || ''
      });
    }

    setShowModal(false);
    setCurrentSchool(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Management</h1>
          <p className="text-gray-600">Register and manage campus details for the ERP system</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add School</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map(school => (
            <div key={school.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <School className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{school.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{school.address || 'No address specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{school.phone || 'No phone specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{school.email || 'No email specified'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-2 border-t border-gray-200/60 pt-4">
                <button
                  onClick={() => handleEdit(school)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(school.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredSchools.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No school registered yet. Click "Add School" to create one.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {isEditing ? 'Edit School Details' : 'Register New School'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  placeholder="e.g. Oakridge High School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  placeholder="Street name, City, State"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    placeholder="contact@school.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white rounded-lg transition shadow-sm"
                >
                  {isEditing ? 'Save Changes' : 'Register School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;
