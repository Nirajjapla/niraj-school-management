import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { transportApi } from '../services/api';
import { mockTransportation as initialTransport } from '../services/mockData';

interface Transport {
  id: string | number;
  routeName?: string;
  route_name?: string;
  vehicleNumber?: string;
  vehicle_number?: string;
  driverName?: string;
  driver_name?: string;
  driverPhone?: string;
  driver_phone?: string;
  capacity?: number;
  status: string;
}

const TransportManagement: React.FC = () => {
  const [transport, setTransport] = useState<Transport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTransport, setCurrentTransport] = useState<Transport | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<Transport>>({
    routeName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    capacity: 40,
    status: 'active'
  });

  const fetchRoutes = async () => {
    try {
      const data = await transportApi.getRoutes();
      if (Array.isArray(data) && data.length > 0) {
        setTransport(data);
      } else {
        setTransport(initialTransport);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setTransport(initialTransport);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const filteredTransport = transport.filter(t => {
    const name = t.route_name || t.routeName || '';
    const vehicle = t.vehicle_number || t.vehicleNumber || '';
    const driver = t.driver_name || t.driverName || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      routeName: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      capacity: 40,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (item: Transport) => {
    setIsEditing(true);
    setCurrentTransport(item);
    setFormData({
      routeName: item.route_name || item.routeName || '',
      vehicleNumber: item.vehicle_number || item.vehicleNumber || '',
      driverName: item.driver_name || item.driverName || '',
      driverPhone: item.driver_phone || item.driverPhone || '',
      capacity: item.capacity || 40,
      status: item.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this transport?')) {
      setTransport(transport.filter(t => t.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await transportApi.createRoute({
        route_name: formData.routeName || formData.route_name,
        vehicle_number: formData.vehicleNumber || formData.vehicle_number,
        driver_name: formData.driverName || formData.driver_name,
        driver_phone: formData.driverPhone || formData.driver_phone
      });
      fetchRoutes();
      setShowModal(false);
      setCurrentTransport(null);
    } catch (err: any) {
      console.error('Error creating route:', err);
      alert(err.message || 'Failed to save route');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transportation Management</h1>
        <p className="text-gray-600">Manage school buses and routes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Route</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransport.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.route_name || item.routeName}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.vehicle_number || item.vehicleNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.driver_name || item.driverName}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.driver_phone || item.driverPhone}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.capacity || 40}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'active' || item.status === 'on_route' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Route' : 'Add New Route'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                  <input
                    type="text"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
                  <input
                    type="tel"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                  {isEditing ? 'Update' : 'Add'} Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagement;
