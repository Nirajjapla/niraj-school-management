import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  User,
  Briefcase,
  Phone,
  UserCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { indianStates } from '../services/centralData';

const STAFF_DESIGNATIONS = ['Administration', 'Accounts', 'Others'] as const;
type StaffDesignation = typeof STAFF_DESIGNATIONS[number];

interface Staff {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: StaffDesignation;
  joiningDate: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  houseAddress: string;
  city: string;
  state: string;
  pinCode: string;
  emergencyContact: string;
  bloodGroup: string;
  paidLeaveQuota: number;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeDesignation(desig?: string): StaffDesignation {
  if (!desig) return 'Administration';
  const lower = desig.toLowerCase();
  if (lower.includes('account') || lower.includes('finance')) return 'Accounts';
  if (lower.includes('admin') || lower.includes('principal') || lower.includes('office') || lower.includes('clerk') || lower.includes('hr')) return 'Administration';
  if (desig === 'Administration' || desig === 'Accounts' || desig === 'Others') return desig;
  return 'Others';
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
    }
  }
  return dateStr;
}

const FormSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </section>
);

const StaffSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
  </section>
);

const StaffDetail: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? 'sm:col-span-2' : undefined}>
    <dt className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-white break-words">{children || '—'}</dd>
  </div>
);

export const StaffManagement: React.FC = () => {
  const {
    staff: rawStaff,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<Staff>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: 'Administration',
    joiningDate: '',
    dob: '',
    gender: 'Male',
    houseAddress: '',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    emergencyContact: '',
    bloodGroup: 'B+',
    paidLeaveQuota: 15,
  });

  const staff: Staff[] = rawStaff.map(s => {
    const parts = (s.name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return {
      id: s.id,
      staffId: s.code || s.id,
      firstName,
      lastName,
      email: s.email,
      phone: s.phone,
      designation: normalizeDesignation(s.designation),
      joiningDate: s.joiningDate,
      dob: '1985-05-20',
      gender: (s.gender as any) || 'Male',
      houseAddress: s.address?.street || '45 Civic Center',
      city: s.address?.city || 'New Delhi',
      state: s.address?.state || 'Delhi',
      pinCode: s.address?.zip || '110001',
      emergencyContact: s.emergencyContact || '+91 98765 00000',
      bloodGroup: s.bloodGroup || 'B+',
      paidLeaveQuota: s.paidLeaveQuota ?? 15
    };
  });

  const filteredStaff = staff.filter((s) => {
    const searchMatch =
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const designationMatch = designationFilter ? s.designation === designationFilter : true;
    return searchMatch && designationMatch;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: 'Administration',
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1988-01-01',
      gender: 'Male',
      houseAddress: '',
      city: 'New Delhi',
      state: 'Delhi',
      pinCode: '110001',
      emergencyContact: '',
      bloodGroup: 'B+',
      paidLeaveQuota: 15,
    });
    setShowModal(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setIsEditing(true);
    setCurrentStaff(staffMember);
    setFormData({
      ...staffMember,
      paidLeaveQuota: staffMember.paidLeaveQuota ?? 15
    });
    setShowModal(true);
  };

  const handleView = (staffMember: Staff) => {
    setCurrentStaff(staffMember);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteEmployee(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    const desig = formData.designation || 'Administration';

    if (isEditing && currentStaff) {
      updateEmployee(currentStaff.id, {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        designation: desig,
        department: desig,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
        address: {
          street: formData.houseAddress || '',
          city: formData.city || 'New Delhi',
          state: formData.state || 'Delhi',
          zip: formData.pinCode || '110001'
        },
        paidLeaveQuota: Number(formData.paidLeaveQuota) || 15
      });
    } else {
      addEmployee({
        code: `ADM-${String(Math.floor(100 + Math.random() * 900))}`,
        name: fullName,
        role: 'admin',
        designation: desig,
        department: desig,
        phone: formData.phone || '+91 98765 43210',
        email: formData.email || `${formData.firstName?.toLowerCase() || 'staff'}@school.com`,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        qualification: 'Graduate',
        gender: formData.gender || 'Male',
        bloodGroup: formData.bloodGroup || 'B+',
        emergencyContact: formData.emergencyContact,
        address: {
          street: formData.houseAddress || '',
          city: formData.city || 'New Delhi',
          state: formData.state || 'Delhi',
          zip: formData.pinCode || '110001'
        },
        paidLeaveQuota: Number(formData.paidLeaveQuota) || 15,
        leaveBalance: {
          casual: { total: 15, taken: 0 },
          sick: { total: 12, taken: 0 },
          earned: { total: 20, taken: 0 }
        }
      });
    }

    setShowModal(false);
    setCurrentStaff(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage non-teaching personnel and administrative staff directory
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff by ID, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Designation Dropdown Filter */}
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[190px]"
          >
            <option value="">All Designations</option>
            {STAFF_DESIGNATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(designationFilter || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDesignationFilter('');
              }}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Designation</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joining Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Leave Quota</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{staffMember.staffId}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {staffMember.firstName} {staffMember.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                      staffMember.designation === 'Administration'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : staffMember.designation === 'Accounts'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    }`}>
                      {staffMember.designation}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">{staffMember.phone}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">{formatDateDisplay(staffMember.joiningDate)}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-semibold">
                      {staffMember.paidLeaveQuota ?? 15} Days
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleView(staffMember)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="View Staff Profile"
                        aria-label={`View details for ${staffMember.firstName} ${staffMember.lastName}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="p-1.5 text-gray-500 hover:text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit Staff Member"
                        aria-label={`Edit ${staffMember.firstName} ${staffMember.lastName}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Delete Staff Member"
                        aria-label={`Delete ${staffMember.firstName} ${staffMember.lastName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500 dark:text-slate-400">
                    No staff records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Staff Profile' : 'Add New Staff Member'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isEditing ? 'Update personnel information and designation' : 'Register a new administrative or accounts staff member'}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} id="staff-form" className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              {/* Section 1: Personal Details */}
              <FormSection title="Personal Details" icon={User}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup || 'B+'}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    House / Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="House/Apartment number, street name"
                    value={formData.houseAddress || ''}
                    onChange={(e) => setFormData({ ...formData, houseAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state || 'Delhi'}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  >
                    {indianStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode || ''}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>
              </FormSection>

              {/* Section 2: Role & Designation */}
              <FormSection title="Role & Employment" icon={Briefcase}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.designation || 'Administration'}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as StaffDesignation })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  >
                    {STAFF_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate || ''}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Annual Paid Leave Quota (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.paidLeaveQuota ?? 15}
                    onChange={(e) => setFormData({ ...formData, paidLeaveQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </FormSection>

              {/* Section 3: Contact Details */}
              <FormSection title="Contact Information" icon={Phone}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>
              </FormSection>
            </form>

            {/* Modal Footer */}
            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="staff-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                {isEditing ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Staff View Modal */}
      {showViewModal && currentStaff && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentStaff.firstName} {currentStaff.lastName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Staff ID: {currentStaff.staffId} • {currentStaff.designation}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              <StaffSection title="Personal Details" icon={User}>
                <StaffDetail label="First Name">{currentStaff.firstName}</StaffDetail>
                <StaffDetail label="Last Name">{currentStaff.lastName}</StaffDetail>
                <StaffDetail label="Date of Birth">{formatDateDisplay(currentStaff.dob)}</StaffDetail>
                <StaffDetail label="Gender">{currentStaff.gender}</StaffDetail>
                <StaffDetail label="Blood Group">{currentStaff.bloodGroup}</StaffDetail>
                <StaffDetail label="Emergency Contact">{currentStaff.emergencyContact}</StaffDetail>
                <StaffDetail label="House / Street Address" fullWidth>{currentStaff.houseAddress}</StaffDetail>
                <StaffDetail label="City">{currentStaff.city}</StaffDetail>
                <StaffDetail label="State">{currentStaff.state}</StaffDetail>
                <StaffDetail label="PIN Code">{currentStaff.pinCode}</StaffDetail>
              </StaffSection>

              <StaffSection title="Role & Employment" icon={Briefcase}>
                <StaffDetail label="Designation">{currentStaff.designation}</StaffDetail>
                <StaffDetail label="Joining Date">{formatDateDisplay(currentStaff.joiningDate)}</StaffDetail>
                <StaffDetail label="Annual Paid Leave Quota">{currentStaff.paidLeaveQuota ?? 15} Days / Year</StaffDetail>
              </StaffSection>

              <StaffSection title="Contact Information" icon={Phone}>
                <StaffDetail label="Phone Number">{currentStaff.phone}</StaffDetail>
                <StaffDetail label="Email Address">{currentStaff.email}</StaffDetail>
              </StaffSection>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
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

export default StaffManagement;
