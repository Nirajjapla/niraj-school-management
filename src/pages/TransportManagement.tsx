import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Bus,
  Phone,
  Clock,
  ShieldAlert,
  Wrench,
  Building2,
  CheckCircle2,
  X,
  Radio,
  MapPin
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { TransportRoute } from '../services/centralData';

const TransportManagement: React.FC = () => {
  const { transportRoutes, drivers, addTransportRoute, updateTransportRoute, deleteTransportRoute } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'routes' | 'assets'>('routes');

  const [formData, setFormData] = useState<Partial<TransportRoute>>({
    routeNumber: 'R-105',
    routeTitle: '',
    descriptionString: '',
    morningPickupSchedule: '07:15 AM - 08:00 AM',
    eveningDropDuration: '02:30 PM - 03:30 PM',
    vehicleNumber: 'DL-01-XX-0000',
    vehicleType: 'Bus',
    isAC: true,
    driverId: 'drv-1',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    coDriverId: '',
    coDriverName: '',
    coDriverPhone: '',
    capacity: 40,
    assignedStudentsCount: 0,
    status: 'active',
    assetDetails: {
      fitnessExpiry: '2027-06-30',
      insuranceExpiry: '2026-12-31',
      serviceDueDate: '2026-11-15',
      gpsStatus: 'Active',
      ownership: 'Owned',
      vendorName: '',
      vendorPhone: '',
      vendorAddress: ''
    }
  });

  const filteredRoutes = transportRoutes.filter(route => {
    const matchesSearch = [
      route.routeNumber,
      route.routeTitle,
      route.descriptionString,
      route.vehicleNumber,
      route.driverName,
      route.driverPhone
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = !filterType || route.vehicleType === filterType;

    return matchesSearch && matchesType;
  });

  const handleDriverChange = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setFormData(prev => ({
        ...prev,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        driverId: '',
        driverName: '',
        driverPhone: ''
      }));
    }
  };

  const handleCoDriverChange = (coDriverId: string) => {
    if (!coDriverId) {
      setFormData(prev => ({
        ...prev,
        coDriverId: undefined,
        coDriverName: undefined,
        coDriverPhone: undefined
      }));
      return;
    }
    const coDriver = drivers.find(d => d.id === coDriverId);
    if (coDriver) {
      setFormData(prev => ({
        ...prev,
        coDriverId: coDriver.id,
        coDriverName: coDriver.name,
        coDriverPhone: coDriver.phone
      }));
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    const defDriver = drivers[0];
    setFormData({
      routeNumber: `R-10${transportRoutes.length + 1}`,
      routeTitle: '',
      descriptionString: '',
      morningPickupSchedule: '07:15 AM - 08:00 AM',
      eveningDropDuration: '02:30 PM - 03:30 PM',
      vehicleNumber: 'DL-01-AB-9999',
      vehicleType: 'Bus',
      isAC: true,
      driverId: defDriver.id,
      driverName: defDriver.name,
      driverPhone: defDriver.phone,
      coDriverId: '',
      coDriverName: '',
      coDriverPhone: '',
      capacity: 40,
      assignedStudentsCount: 0,
      status: 'active',
      assetDetails: {
        fitnessExpiry: '2027-05-30',
        insuranceExpiry: '2026-12-31',
        serviceDueDate: '2026-11-15',
        gpsStatus: 'Active',
        ownership: 'Owned',
        vendorName: '',
        vendorPhone: '',
        vendorAddress: ''
      }
    });
    setShowModal(true);
  };

  const handleEdit = (route: TransportRoute) => {
    setIsEditing(true);
    setSelectedRoute(route);
    setFormData(route);
    setShowModal(true);
  };

  const handleView = (route: TransportRoute) => {
    setSelectedRoute(route);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteTransportRoute(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.routeNumber || !formData.routeTitle || !formData.driverName) {
      alert('Please fill all mandatory route fields');
      return;
    }

    if (isEditing && selectedRoute) {
      updateTransportRoute(selectedRoute.id, formData);
    } else {
      addTransportRoute(formData as any);
    }

    setShowModal(false);
    setSelectedRoute(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transportation Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Multi-route schedule timing, vehicle fleet assets, driver & co-driver management
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add New Route & Vehicle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('routes')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'routes'
              ? 'text-[#4e74f9] border-b-2 border-[#4e74f9] font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
          }`}
        >
          <Bus className="w-4 h-4" />
          Transport Routes & Timings ({transportRoutes.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'text-[#4e74f9] border-b-2 border-[#4e74f9] font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Fleet Asset Management & Compliance
        </button>
      </div>

      {/* Routes View */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Search Routes & Drivers
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by route number, title, stops, driver, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Vehicle Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                >
                  <option value="">All Vehicle Types</option>
                  <option value="Bus">Bus</option>
                  <option value="Mini Bus">Mini Bus</option>
                  <option value="Van">Van</option>
                </select>
              </div>
            </div>
          </div>

          {/* Routes Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vehicle & Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Driver & Co-Driver</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Bus Timings</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                        <div>
                          <span className="text-gray-900 dark:text-white block">{route.routeNumber} - {route.routeTitle}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block line-clamp-1 max-w-xs">{route.descriptionString}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                        <div>
                          <span className="text-gray-900 dark:text-white block">{route.vehicleNumber}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {route.vehicleType} • {route.isAC ? 'AC' : 'Non-AC'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                        <div>
                          <span className="text-gray-900 dark:text-white block">{route.driverName}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block">{route.driverPhone}</span>
                          {route.coDriverName && (
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Co-Driver: {route.coDriverName}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 text-xs">
                        <div className="space-y-0.5">
                          <p><span className="text-gray-500 dark:text-slate-400">Pickup:</span> {route.morningPickupSchedule}</p>
                          <p><span className="text-gray-500 dark:text-slate-400">Drop:</span> {route.eveningDropDuration}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                        {route.assignedStudentsCount || 0} / {route.capacity} Seats
                      </td>

                      <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            route.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : route.status === 'maintenance'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {route.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleView(route)}
                            className="p-1.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="View Route Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(route)}
                            className="p-1.5 text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                            title="Edit Route"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
                            title="Delete Route"
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

      {/* Asset Management View */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {transportRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-base text-gray-900 dark:text-white block">{route.vehicleNumber}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {route.routeNumber} - {route.routeTitle} ({route.vehicleType})
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      route.assetDetails.ownership === 'Owned'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {route.assetDetails.ownership}
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400">Fitness Expiry:</span>
                    <span className="text-gray-800 dark:text-slate-200">{route.assetDetails.fitnessExpiry}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400">Insurance Expiry:</span>
                    <span className="text-gray-800 dark:text-slate-200">{route.assetDetails.insuranceExpiry}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400">Next Service Due:</span>
                    <span className="text-gray-800 dark:text-slate-200">{route.assetDetails.serviceDueDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400">GPS Tracking:</span>
                    <span className="text-gray-800 dark:text-slate-200">{route.assetDetails.gpsStatus}</span>
                  </div>
                </div>

                {route.assetDetails.ownership === 'Leased / Vendor' && route.assetDetails.vendorName && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 text-xs text-gray-700 dark:text-slate-300 space-y-1">
                    <div className="font-semibold">Vendor: {route.assetDetails.vendorName}</div>
                    <p className="text-gray-500 dark:text-slate-400">{route.assetDetails.vendorPhone}</p>
                    <p className="text-gray-500 dark:text-slate-400">{route.assetDetails.vendorAddress}</p>
                  </div>
                )}

                <button
                  onClick={() => handleView(route)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-medium rounded-xl border border-gray-200 dark:border-slate-700 transition"
                >
                  View Route & Asset Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Route Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Route & Vehicle' : 'Add New Route & Vehicle'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Multi-route schedule timing, driver alignment, vehicle specifications & asset details
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                  Required fields are marked with an asterisk (<span className="text-red-500">*</span>)
                </p>

                {/* Section 1: Route & Schedule Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Bus className="w-3.5 h-3.5 text-gray-400" />
                    <span>Route & Schedule Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Route Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. R-101"
                        value={formData.routeNumber}
                        onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Route Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. North City Express"
                        value={formData.routeTitle}
                        onChange={(e) => setFormData({ ...formData, routeTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Route Description (Stops list) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Railway Station -> Gandhi Chowk -> Civil Lines -> Campus"
                        value={formData.descriptionString}
                        onChange={(e) => setFormData({ ...formData, descriptionString: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Morning Pickup Schedule <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 07:15 AM - 08:00 AM"
                        value={formData.morningPickupSchedule}
                        onChange={(e) => setFormData({ ...formData, morningPickupSchedule: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Evening Drop Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 02:30 PM - 03:30 PM"
                        value={formData.eveningDropDuration}
                        onChange={(e) => setFormData({ ...formData, eveningDropDuration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Route Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Vehicle Specifications */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Wrench className="w-3.5 h-3.5 text-gray-400" />
                    <span>Vehicle Specifications</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Vehicle Reg Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="DL-01-AB-1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        <option value="Bus">Bus</option>
                        <option value="Mini Bus">Mini Bus</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Air Conditioning <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.isAC ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, isAC: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        <option value="true">AC (Air Conditioned)</option>
                        <option value="false">Non-AC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Passenger Capacity (Seats) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Driver & Crew Assignment */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>Driver & Crew Assignment</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Primary Driver <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.driverId}
                        onChange={(e) => handleDriverChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Co-Driver / Attendant (Optional)
                      </label>
                      <select
                        value={formData.coDriverId || ''}
                        onChange={(e) => handleCoDriverChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        <option value="">No Co-Driver</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Fleet Compliance & Ownership */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                    <span>Fleet Compliance & Ownership</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Fitness Certificate Expiry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.assetDetails?.fitnessExpiry}
                        onChange={(e) => setFormData({
                          ...formData,
                          assetDetails: { ...(formData.assetDetails as any), fitnessExpiry: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Insurance Expiry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.assetDetails?.insuranceExpiry}
                        onChange={(e) => setFormData({
                          ...formData,
                          assetDetails: { ...(formData.assetDetails as any), insuranceExpiry: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Next Service Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.assetDetails?.serviceDueDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          assetDetails: { ...(formData.assetDetails as any), serviceDueDate: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Ownership Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.assetDetails?.ownership}
                        onChange={(e) => setFormData({
                          ...formData,
                          assetDetails: { ...(formData.assetDetails as any), ownership: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      >
                        <option value="Owned">School Owned</option>
                        <option value="Leased / Vendor">Leased / Vendor Owned</option>
                      </select>
                    </div>

                    {formData.assetDetails?.ownership === 'Leased / Vendor' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Vendor Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SafeTravels Pvt Ltd"
                            value={formData.assetDetails?.vendorName || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              assetDetails: { ...(formData.assetDetails as any), vendorName: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Vendor Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98111 22334"
                            value={formData.assetDetails?.vendorPhone || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              assetDetails: { ...(formData.assetDetails as any), vendorPhone: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Vendor Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Transport Hub, Sector 18, City"
                            value={formData.assetDetails?.vendorAddress || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              assetDetails: { ...(formData.assetDetails as any), vendorAddress: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  {isEditing ? 'Save Route Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Route Details Modal */}
      {showViewModal && selectedRoute && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Route Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {selectedRoute.routeNumber} - {selectedRoute.routeTitle}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
              {/* Section 1: Route & Schedule Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <Bus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Route & Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Route Number:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.routeNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Route Title:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.routeTitle}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 dark:text-slate-400 block">Route Stops:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.descriptionString}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Morning Pickup:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.morningPickupSchedule}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Evening Drop:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.eveningDropDuration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Status:</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {selectedRoute.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Vehicle Specifications */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <Wrench className="w-3.5 h-3.5 text-gray-400" />
                  <span>Vehicle Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Vehicle Reg Number:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Vehicle Type:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Air Conditioning:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.isAC ? 'AC' : 'Non-AC'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Seating Capacity:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.assignedStudentsCount || 0} / {selectedRoute.capacity} Seats</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Driver & Crew Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>Driver & Crew</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Primary Driver:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.driverName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Driver Phone:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.driverPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Co-Driver / Attendant:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.coDriverName || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Co-Driver Phone:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.coDriverPhone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Asset Compliance & Ownership */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                  <span>Compliance & Ownership</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Fitness Certificate Expiry:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.assetDetails.fitnessExpiry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Insurance Expiry:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.assetDetails.insuranceExpiry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Next Service Due:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.assetDetails.serviceDueDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Ownership:</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{selectedRoute.assetDetails.ownership}</span>
                  </div>
                  {selectedRoute.assetDetails.ownership === 'Leased / Vendor' && selectedRoute.assetDetails.vendorName && (
                    <div className="sm:col-span-2 pt-1">
                      <span className="text-gray-500 dark:text-slate-400 block">Vendor Details:</span>
                      <span className="text-gray-800 dark:text-slate-200 font-medium">
                        {selectedRoute.assetDetails.vendorName} ({selectedRoute.assetDetails.vendorPhone}) - {selectedRoute.assetDetails.vendorAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TransportManagement;
