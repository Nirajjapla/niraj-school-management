import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, UserCog, Layers, Award } from 'lucide-react';
import { designationApi, departmentApi } from '../services/api';

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

interface Designation {
  id: number;
  name: string;
  description: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

const StaffManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'designations'>('staff');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Designation & Department States
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  // Department & Designation Modals/Forms
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  const [currentDesig, setCurrentDesig] = useState<Designation | null>(null);
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

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      setIsLoading(true);
      const [desigsData, deptsData] = await Promise.all([
        designationApi.getDesignations(),
        departmentApi.getDepartments()
      ]);
      setDesignations(desigsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error('Failed to load designations/departments', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentStaff) {
      setStaff(staff.map((s) => (s.id === currentStaff.id ? { ...currentStaff, ...formData } : s)));
    } else {
      const newStaff: Staff = {
        ...(formData as Staff),
        id: Date.now().toString(),
        staffId: `STF${String(staff.length + 1).padStart(3, '0')}`,
      };
      setStaff([...staff, newStaff]);
    }

    setShowModal(false);
    setCurrentStaff(null);
  };

  // Department CRUD operations
  const handleAddDept = () => {
    setDeptForm({ name: '', description: '' });
    setCurrentDept(null);
    setShowDeptModal(true);
  };

  const handleEditDept = (dept: Department) => {
    setCurrentDept(dept);
    setDeptForm({ name: dept.name, description: dept.description || '' });
    setShowDeptModal(true);
  };

  const handleDeleteDept = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.deleteDepartment(id);
        fetchMeta();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete department');
      }
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentDept) {
        await departmentApi.updateDepartment(currentDept.id, deptForm.name, deptForm.description);
      } else {
        await departmentApi.createDepartment(deptForm.name, deptForm.description);
      }
      setShowDeptModal(false);
      fetchMeta();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save department');
    }
  };

  // Designation CRUD operations
  const handleAddDesig = () => {
    setDesigForm({ name: '', description: '' });
    setCurrentDesig(null);
    setShowDesigModal(true);
  };

  const handleEditDesig = (desig: Designation) => {
    setCurrentDesig(desig);
    setDesigForm({ name: desig.name, description: desig.description || '' });
    setShowDesigModal(true);
  };

  const handleDeleteDesig = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await designationApi.deleteDesignation(id);
        fetchMeta();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete designation');
      }
    }
  };

  const handleDesigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentDesig) {
        await designationApi.updateDesignation(currentDesig.id, desigForm.name, desigForm.description);
      } else {
        await designationApi.createDesignation(desigForm.name, desigForm.description);
      }
      setShowDesigModal(false);
      fetchMeta();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save designation');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff & HR Management</h1>
          <p className="text-gray-600">Manage non-teaching staff, departments, and designations</p>
        </div>
        <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'staff'
                ? 'bg-white text-[#4e74f9] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'departments'
                ? 'bg-white text-[#4e74f9] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Departments</span>
          </button>
          <button
            onClick={() => setActiveTab('designations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'designations'
                ? 'bg-white text-[#4e74f9] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Designations</span>
          </button>
        </div>
      </div>

      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ID or Name..."
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
                <span>Add Staff</span>
              </button>
            </div>

            <div className="flex space-x-4">
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
              >
                <option value="">All Designations</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{staffMember.staffId}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{`${staffMember.firstName} ${staffMember.lastName}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{staffMember.designation}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{staffMember.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{staffMember.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{staffMember.dob}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleView(staffMember)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(staffMember)} className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(staffMember.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
      )}

      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
            <button
              onClick={handleAddDept}
              className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Department</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{dept.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.description || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditDept(dept)} className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteDept(dept.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No departments found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Designations</h2>
            <button
              onClick={handleAddDesig}
              className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Designation</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{desig.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{desig.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{desig.description || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditDesig(desig)} className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteDesig(desig.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {designations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No designations found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Staff' : 'Add New Staff'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'First Name', name: 'firstName', type: 'text' },
                { label: 'Last Name', name: 'lastName', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Phone', name: 'phone', type: 'tel' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(formData as any)[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              {/* Address Fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Street"
                    value={formData.houseAddress || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        houseAddress: e.target.value,
                      })
                    }
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state: e.target.value,
                      })
                    }
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={formData.pinCode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pinCode: e.target.value,
                      })
                    }
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    required
                  />
                </div>
              </div>
              <div className="col-span-2 flex justify-end space-x-3 mt-6">
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
                  {isEditing ? 'Update' : 'Add'} Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff View Modal */}
      {showViewModal && currentStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Staff Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm text-gray-800">
              <p><b>Staff ID:</b> {currentStaff.staffId}</p>
              <p><b>Name:</b> {currentStaff.firstName} {currentStaff.lastName}</p>
              <p><b>Email:</b> {currentStaff.email}</p>
              <p><b>Phone:</b> {currentStaff.phone}</p>
              <p><b>Designation:</b> {currentStaff.designation}</p>
              <p><b>Department:</b> {currentStaff.department}</p>
              <p><b>DOB:</b> {currentStaff.dob}</p>
              <p><b>Joining Date:</b> {currentStaff.joiningDate}</p>
              <p><b>Address:</b> {`${currentStaff.houseAddress}, ${currentStaff.city}, ${currentStaff.state} - ${currentStaff.pinCode}`}</p>
              <p><b>Emergency Contact:</b> {currentStaff.emergencyContact}</p>
              <p><b>Blood Group:</b> {currentStaff.bloodGroup}</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{currentDept ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Finance, Science Dept"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3d5fd8] transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{currentDesig ? 'Edit Designation' : 'Add Designation'}</h2>
              <button onClick={() => setShowDesigModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDesigSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation Title</label>
                <input
                  type="text"
                  required
                  value={desigForm.name}
                  onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })}
                  placeholder="e.g. Senior Lecturer, Registrar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={desigForm.description}
                  onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDesigModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3d5fd8] transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
