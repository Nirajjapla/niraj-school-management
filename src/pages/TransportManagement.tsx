import React, { useState } from 'react';
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
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Route</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Vehicle & Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Driver & Co-Driver</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Bus Timings (Morning & Evening)</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Capacity</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Status</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-mono">
                            {route.routeNumber}
                          </span>
                          <span>{route.routeTitle}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xs">
                          {route.descriptionString}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white block">{route.vehicleNumber}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-slate-400">{route.vehicleType}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              route.isAC
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                            }`}
                          >
                            {route.isAC ? 'AC' : 'Non-AC'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
                          <span>{route.driverName}</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {route.driverPhone}
                        </p>
                        {route.coDriverName && (
                          <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-slate-800/60 text-[11px] text-gray-500 dark:text-slate-400">
                            <span>Co-Driver: {route.coDriverName}</span>
                            <span className="block font-mono text-gray-600 dark:text-slate-300">{route.coDriverPhone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="space-y-1">
                          <p className="text-gray-800 dark:text-slate-200">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Pickup:</span> {route.morningPickupSchedule}
                          </p>
                          <p className="text-gray-800 dark:text-slate-200">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Drop:</span> {route.eveningDropDuration}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">{route.assignedStudentsCount || 0}</span>
                        <span className="text-gray-500 dark:text-slate-400 text-xs"> / {route.capacity} Seats</span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
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
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-base text-gray-900 dark:text-white block">{route.vehicleNumber}</span>
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

                <div className="space-y-2.5 text-xs pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Fitness Expiry:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{route.assetDetails.fitnessExpiry}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> Insurance Expiry:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{route.assetDetails.insuranceExpiry}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-purple-500" /> Next Service Due:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{route.assetDetails.serviceDueDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-500" /> GPS Tracking:
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{route.assetDetails.gpsStatus}</span>
                  </div>
                </div>

                {route.assetDetails.ownership === 'Leased / Vendor' && route.assetDetails.vendorName && (
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Vendor Information:
                    </div>
                    <p>{route.assetDetails.vendorName}</p>
                    <p className="font-mono text-[11px]">{route.assetDetails.vendorPhone}</p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">{route.assetDetails.vendorAddress}</p>
                  </div>
                )}

                <button
                  onClick={() => handleView(route)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
                >
                  View Full Asset Specs
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Route & Vehicle' : 'Add New Route & Vehicle'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Multi-route schedule timing, driver alignment, vehicle specifications & asset details
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Route & Timing details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Route Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R-101"
                    value={formData.routeNumber}
                    onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Route Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North City Express, South Campus Line"
                    value={formData.routeTitle}
                    onChange={(e) => setFormData({ ...formData, routeTitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Route Description (Stops list) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Railway Station -> Gandhi Chowk -> Civil Lines -> Campus"
                    value={formData.descriptionString}
                    onChange={(e) => setFormData({ ...formData, descriptionString: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Morning Pickup Schedule *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:15 AM - 08:00 AM"
                    value={formData.morningPickupSchedule}
                    onChange={(e) => setFormData({ ...formData, morningPickupSchedule: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Evening Drop Duration *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 02:30 PM - 03:30 PM"
                    value={formData.eveningDropDuration}
                    onChange={(e) => setFormData({ ...formData, eveningDropDuration: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                    Route Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Vehicle & AC Specs */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                  Vehicle Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Vehicle Reg Number *
                    </label>
                    <input
                      type="text"
                      placeholder="DL-01-AB-1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="Bus">Bus</option>
                      <option value="Mini Bus">Mini Bus</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      AC / Non-AC *
                    </label>
                    <select
                      value={formData.isAC ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isAC: e.target.value === 'true' })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="true">AC (Air Conditioned)</option>
                      <option value="false">Non-AC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Passenger Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Driver & Co-Driver Auto Alignment */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                  Driver & Co-Driver Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Driver */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-200">
                      Primary Driver *
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => handleDriverChange(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                      ))}
                    </select>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400 block mb-1">Auto-Aligned Driver Phone:</span>
                      <input
                        type="text"
                        value={formData.driverPhone || ''}
                        readOnly
                        className="w-full px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>

                  {/* Co-Driver */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-slate-200">
                      Co-Driver / Attendant (Optional)
                    </label>
                    <select
                      value={formData.coDriverId || ''}
                      onChange={(e) => handleCoDriverChange(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="">No Co-Driver</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                      ))}
                    </select>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400 block mb-1">Auto-Aligned Co-Driver Phone:</span>
                      <input
                        type="text"
                        value={formData.coDriverPhone || 'None'}
                        readOnly
                        className="w-full px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Management Specs */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                  Fleet Asset Management & Expiry Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Fitness Certificate Expiry *
                    </label>
                    <input
                      type="date"
                      value={formData.assetDetails?.fitnessExpiry}
                      onChange={(e) => setFormData({
                        ...formData,
                        assetDetails: { ...(formData.assetDetails as any), fitnessExpiry: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Insurance Expiry *
                    </label>
                    <input
                      type="date"
                      value={formData.assetDetails?.insuranceExpiry}
                      onChange={(e) => setFormData({
                        ...formData,
                        assetDetails: { ...(formData.assetDetails as any), insuranceExpiry: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Service Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.assetDetails?.serviceDueDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        assetDetails: { ...(formData.assetDetails as any), serviceDueDate: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Ownership Type *
                    </label>
                    <select
                      value={formData.assetDetails?.ownership}
                      onChange={(e) => setFormData({
                        ...formData,
                        assetDetails: { ...(formData.assetDetails as any), ownership: e.target.value as any }
                      })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="Owned">School Owned</option>
                      <option value="Leased / Vendor">Leased / Vendor Owned</option>
                    </select>
                  </div>

                  {formData.assetDetails?.ownership === 'Leased / Vendor' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                          Vendor Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SafeTravels Pvt Ltd"
                          value={formData.assetDetails?.vendorName || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            assetDetails: { ...(formData.assetDetails as any), vendorName: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                          Vendor Phone *
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98111 22334"
                          value={formData.assetDetails?.vendorPhone || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            assetDetails: { ...(formData.assetDetails as any), vendorPhone: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                          Vendor Address *
                        </label>
                        <input
                          type="text"
                          placeholder="Transport Hub, Sector 18, City"
                          value={formData.assetDetails?.vendorAddress || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            assetDetails: { ...(formData.assetDetails as any), vendorAddress: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
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
                  {isEditing ? 'Save Route Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Route Details Modal */}
      {showViewModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-mono">
                    {selectedRoute.routeNumber}
                  </span>
                  <span>{selectedRoute.routeTitle}</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Vehicle: {selectedRoute.vehicleNumber}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedRoute.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {selectedRoute.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700/60">
                <div className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4e74f9]" /> Route Stops
                </div>
                <p className="text-gray-700 dark:text-slate-300 text-xs">{selectedRoute.descriptionString}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Morning Pickup</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedRoute.morningPickupSchedule}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Evening Drop</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedRoute.eveningDropDuration}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Vehicle Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedRoute.vehicleType} ({selectedRoute.isAC ? 'AC' : 'Non-AC'})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Assigned Driver</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedRoute.driverName}</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 block font-mono">{selectedRoute.driverPhone}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Co-Driver / Attendant</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedRoute.coDriverName || 'None'}</span>
                  {selectedRoute.coDriverPhone && (
                    <span className="text-xs text-gray-600 dark:text-slate-400 block font-mono">{selectedRoute.coDriverPhone}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block">Seating Capacity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedRoute.assignedStudentsCount} / {selectedRoute.capacity}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-3">
                <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-slate-400 mb-2">
                  Asset Compliance & Expirations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Fitness Expiry</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedRoute.assetDetails.fitnessExpiry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Insurance Expiry</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedRoute.assetDetails.insuranceExpiry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Next Service</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedRoute.assetDetails.serviceDueDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Ownership</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedRoute.assetDetails.ownership}</span>
                  </div>
                </div>

                {selectedRoute.assetDetails.ownership === 'Leased / Vendor' && selectedRoute.assetDetails.vendorName && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-1">
                    <p className="font-bold">Vendor: {selectedRoute.assetDetails.vendorName} ({selectedRoute.assetDetails.vendorPhone})</p>
                    <p className="text-purple-700 dark:text-purple-300">{selectedRoute.assetDetails.vendorAddress}</p>
                  </div>
                )}
              </div>
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

export default TransportManagement;
