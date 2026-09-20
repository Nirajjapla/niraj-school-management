import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  UserCog,
  Layers,
  Award,
  User,
  Briefcase,
  Phone,
  Mail
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { indianStates } from '../services/centralData';

interface Staff {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string;
  dob: string;
  houseAddress: string;
  city: string;
  state: string;
  pinCode: string;
  emergencyContact: string;
  bloodGroup: string;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

const StaffManagement: React.FC = () => {
  const {
    staff: rawStaff,
    departments,
    designations,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addDesignation,
    updateDesignation,
    deleteDesignation
  } = useData();

  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'designations'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Department & Designation Modals/Forms
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [currentDeptId, setCurrentDeptId] = useState<string | null>(null);
  const [currentDesigId, setCurrentDesigId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [desigForm, setDesigForm] = useState({ name: '', description: '' });

  const [formData, setFormData] = useState<Partial<Staff>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    joiningDate: '',
    dob: '',
    houseAddress: '',
    city: '',
    state: '',
    pinCode: '',
    emergencyContact: '',
    bloodGroup: '',
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
      designation: s.designation,
      department: s.department,
      joiningDate: s.joiningDate,
      dob: '1985-05-20',
      houseAddress: s.address?.street || '45 Civic Center',
      city: s.address?.city || 'New Delhi',
      state: s.address?.state || 'Delhi',
      pinCode: s.address?.zip || '110001',
      emergencyContact: s.emergencyContact || '+91 98765 00000',
      bloodGroup: s.bloodGroup || 'B+'
    };
  });

  const filteredStaff = staff.filter((s) => {
    const searchMatch =
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const designationMatch = designationFilter ? s.designation === designationFilter : true;
    const departmentMatch = departmentFilter ? s.department === departmentFilter : true;
    return searchMatch && designationMatch && departmentMatch;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: designations[0]?.name || '',
      department: departments[0]?.name || '',
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1988-01-01',
      houseAddress: '',
      city: 'New Delhi',
      state: 'Delhi',
      pinCode: '110001',
      emergencyContact: '',
      bloodGroup: 'B+',
    });
    setShowModal(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setIsEditing(true);
    setCurrentStaff(staffMember);
    setFormData(staffMember);
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

    if (isEditing && currentStaff) {
      updateEmployee(currentStaff.id, {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
        address: {
          street: formData.houseAddress || '',
          city: formData.city || 'New Delhi',
          state: formData.state || 'Delhi',
          zip: formData.pinCode || '110001'
        }
      });
    } else {
      addEmployee({
        code: `ADM-${String(Math.floor(100 + Math.random() * 900))}`,
        name: fullName,
        role: (formData.department === 'Transport' || formData.department === 'Library') ? 'support' : 'admin',
        designation: formData.designation || 'Staff Officer',
        department: formData.department || 'Administration',
        phone: formData.phone || '+91 98765 43210',
        email: formData.email || `${formData.firstName?.toLowerCase()}@school.com`,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        qualification: 'Graduate',
        gender: 'Male',
        bloodGroup: formData.bloodGroup || 'B+',
        emergencyContact: formData.emergencyContact,
        address: {
          street: formData.houseAddress || '',
          city: formData.city || 'New Delhi',
          state: formData.state || 'Delhi',
          zip: formData.pinCode || '110001'
        },
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

  // Department CRUD operations
  const handleAddDept = () => {
    setDeptForm({ name: '', description: '' });
    setCurrentDeptId(null);
    setShowDeptModal(true);
  };

  const handleEditDept = (dept: { id: string; name: string; description?: string }) => {
    setDeptForm({ name: dept.name, description: dept.description || '' });
    setCurrentDeptId(dept.id);
    setShowDeptModal(true);
  };

  const handleDeleteDept = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDepartment(id);
    }
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDeptId) {
      updateDepartment(currentDeptId, deptForm);
    } else {
      addDepartment(deptForm);
    }
    setShowDeptModal(false);
  };

  // Designation CRUD operations
  const handleAddDesig = () => {
    setDesigForm({ name: '', description: '' });
    setCurrentDesigId(null);
    setShowDesigModal(true);
  };

  const handleEditDesig = (desig: { id: string; name: string; description?: string }) => {
    setDesigForm({ name: desig.name, description: desig.description || '' });
    setCurrentDesigId(desig.id);
    setShowDesigModal(true);
  };

  const handleDeleteDesig = (id: string) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      deleteDesignation(id);
    }
  };

  const handleDesigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDesigId) {
      updateDesignation(currentDesigId, desigForm);
    } else {
      addDesignation(desigForm);
    }
    setShowDesigModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff & HR Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage non-teaching staff directory, departments, and employee designations
          </p>
        </div>
        <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-[#4e74f9] shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'departments'
                ? 'bg-white dark:bg-slate-900 text-[#4e74f9] shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Departments</span>
          </button>
          <button
            onClick={() => setActiveTab('designations')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'designations'
                ? 'bg-white dark:bg-slate-900 text-[#4e74f9] shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Designations</span>
          </button>
        </div>
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Filters & Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Search Staff
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Designation
                </label>
                <select
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white text-sm"
                >
                  <option value="">All Designations</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDesignationFilter('');
                    setDepartmentFilter('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Designation</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">DOB</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredStaff.map((staffMember) => (
                    <tr key={staffMember.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{staffMember.staffId}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{`${staffMember.firstName} ${staffMember.lastName}`}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{staffMember.designation}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{staffMember.department}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{staffMember.phone}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{staffMember.dob}</td>
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
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        No staff records match the search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Departments Directory</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage administrative and functional divisions</p>
            </div>
            <button
              onClick={handleAddDept}
              className="px-4 py-2 bg-[#4e74f9] text-white rounded-xl text-sm font-medium hover:bg-[#3d5fd8] transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{dept.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{dept.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{dept.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditDept(dept)}
                          className="p-1.5 text-gray-500 hover:text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Department"
                          aria-label={`Edit ${dept.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Department"
                          aria-label={`Delete ${dept.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                      No departments found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Designations Directory</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage job roles and positions across staff</p>
            </div>
            <button
              onClick={handleAddDesig}
              className="px-4 py-2 bg-[#4e74f9] text-white rounded-xl text-sm font-medium hover:bg-[#3d5fd8] transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Designation ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{desig.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{desig.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{desig.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditDesig(desig)}
                          className="p-1.5 text-gray-500 hover:text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Designation"
                          aria-label={`Edit ${desig.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDesig(desig.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Designation"
                          aria-label={`Delete ${desig.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {designations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                      No designations found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Staff Profile' : 'Add New Staff Member'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="text-red-500 font-semibold">*</span> Indicates required field
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup || 'B+'}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>
              </FormSection>

              {/* Section 2: Role & Department */}
              <FormSection title="Role & Department" icon={Briefcase}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  >
                    <option value="">Select Designation</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>
              </FormSection>
            </form>

            {/* Fixed Footer */}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStaff.firstName} {currentStaff.lastName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Staff ID: {currentStaff.staffId} • {currentStaff.designation} ({currentStaff.department})
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              <StaffSection title="Personal Details" icon={User}>
                <StaffDetail label="First Name">{currentStaff.firstName}</StaffDetail>
                <StaffDetail label="Last Name">{currentStaff.lastName}</StaffDetail>
                <StaffDetail label="Date of Birth">{currentStaff.dob}</StaffDetail>
                <StaffDetail label="Blood Group">{currentStaff.bloodGroup}</StaffDetail>
                <StaffDetail label="Emergency Contact">{currentStaff.emergencyContact}</StaffDetail>
                <StaffDetail label="House / Street Address" fullWidth>{currentStaff.houseAddress}</StaffDetail>
                <StaffDetail label="City">{currentStaff.city}</StaffDetail>
                <StaffDetail label="State">{currentStaff.state}</StaffDetail>
                <StaffDetail label="PIN Code">{currentStaff.pinCode}</StaffDetail>
              </StaffSection>

              <StaffSection title="Role & Department" icon={Briefcase}>
                <StaffDetail label="Designation">{currentStaff.designation}</StaffDetail>
                <StaffDetail label="Department">{currentStaff.department}</StaffDetail>
                <StaffDetail label="Joining Date">{currentStaff.joiningDate}</StaffDetail>
              </StaffSection>

              <StaffSection title="Contact Information" icon={Phone}>
                <StaffDetail label="Phone Number">{currentStaff.phone}</StaffDetail>
                <StaffDetail label="Email Address">{currentStaff.email}</StaffDetail>
              </StaffSection>
            </div>

            {/* Fixed Footer */}
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

      {/* Department Modal */}
      {showDeptModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDeptId ? 'Edit Department' : 'Add Department'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="text-red-500 font-semibold">*</span> Indicates required field
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowDeptModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} id="dept-form" className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Finance, Science Dept"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Optional functional overview"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                />
              </div>
            </form>

            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="dept-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                Save Department
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Designation Modal */}
      {showDesigModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDesigId ? 'Edit Designation' : 'Add Designation'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="text-red-500 font-semibold">*</span> Indicates required field
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowDesigModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDesigSubmit} id="desig-form" className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Designation Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={desigForm.name}
                  onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })}
                  placeholder="e.g. Senior Lecturer, Registrar"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={desigForm.description}
                  onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
                  placeholder="Optional role description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                />
              </div>
            </form>

            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDesigModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="desig-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                Save Designation
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
