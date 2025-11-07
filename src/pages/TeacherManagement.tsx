import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { mockTeachers as initialTeachers } from '../services/mockData';

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Teacher {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  phone: string;
  subject: string;
  qualification: string;
  joiningDate: string;
  dob: string;
  address: Address;
  emergencyContact: string;
  bloodGroup: string;
  className: string;
  section: string;
}

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Computer Science',
  'Physical Education',
  'Art',
];

const classData = {
  "Class 1": ["A", "B", "C"],
  "Class 2": ["A", "B"],
  "Class 3": ["A", "B", "C", "D"],
  "Class 4": ["A", "B"],
  "Class 5": ["A", "B", "C"],
};

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers as any);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [formData, setFormData] = useState<Partial<Teacher>>({
    firstName: '',
    lastName: '',
    phone: '',
    subject: '',
    qualification: '',
    joiningDate: '',
    dob: '',
    address: { street: '', city: '', state: '', zip: '' },
    emergencyContact: '',
    bloodGroup: '',
    className: '',
    section: '',
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject ? teacher.subject === filterSubject : true;
    const matchesClass = filterClass ? teacher.className === filterClass : true;
    return matchesSearch && matchesSubject && matchesClass;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      subject: '',
      qualification: '',
      joiningDate: '',
      dob: '',
      address: { street: '', city: '', state: '', zip: '' },
      emergencyContact: '',
      bloodGroup: '',
      className: '',
      section: '',
    });
    setShowModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setIsEditing(true);
    setCurrentTeacher(teacher);
    setFormData(teacher);
    setShowModal(true);
  };

  const handleView = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentTeacher) {
      setTeachers(
        teachers.map((t) =>
          t.id === currentTeacher.id ? { ...currentTeacher, ...formData } : t
        )
      );
    } else {
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        teacherId: `TCH${String(teachers.length + 1).padStart(3, '0')}`,
        ...(formData as Teacher),
      };
      setTeachers([...teachers, newTeacher]);
    }

    setShowModal(false);
    setCurrentTeacher(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>
        <p className="text-gray-600">Manage teacher information and records</p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row gap-4 md:items-center w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filter by Class"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Teacher</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{teacher.teacherId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{`${teacher.firstName} ${teacher.lastName}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{teacher.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{teacher.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{teacher.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{teacher.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleView(teacher)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(teacher)} className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* First Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      First Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formData.firstName}
      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
    />
  </div>

  {/* Last Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Last Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formData.lastName}
      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
    />
  </div>

  {/* Subject */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Subject <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.subject}
      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
    >
      <option value="">Select Subject</option>
      {subjects.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  </div>

  {/* Class */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Class <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.className}
      onChange={(e) => {
        const selectedClass = e.target.value;
        setFormData({
          ...formData,
          className: selectedClass,
          section: '',
        });
      }}
      className="border rounded-lg px-3 py-2 w-full"
      required
    >
      <option value="">Select Class</option>
      {Object.keys(classData).map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ))}
    </select>
  </div>

  {/* Section */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Section <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.section}
      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
      disabled={!formData.className}
    >
      <option value="">Select Section</option>
      {formData.className &&
        classData[formData.className]?.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
    </select>
  </div>

  {/* DOB */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Date of Birth <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.dob}
      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
    />
  </div>

  {/* Qualification */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Qualification
    </label>
    <input
      type="text"
      value={formData.qualification}
      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>

  {/* Joining Date */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Joining Date
    </label>
    <input
      type="date"
      value={formData.joiningDate}
      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>

  {/* Phone */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Phone <span className="text-red-500">*</span>
    </label>
    <input
      type="tel"
      value={formData.phone}
      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
      required
    />
  </div>

  {/* Blood Group */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Blood Group
    </label>
    <input
      type="text"
      value={formData.bloodGroup}
      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>

  {/* Emergency Contact */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Emergency Contact
    </label>
    <input
      type="text"
      value={formData.emergencyContact}
      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>

  {/* Address */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Address <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Street"
        value={formData.address?.street || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            address: { ...formData.address!, street: e.target.value },
          })
        }
        className="border rounded-lg px-3 py-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="City"
        value={formData.address?.city || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            address: { ...formData.address!, city: e.target.value },
          })
        }
        className="border rounded-lg px-3 py-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="State"
        value={formData.address?.state || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            address: { ...formData.address!, state: e.target.value },
          })
        }
        className="border rounded-lg px-3 py-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="ZIP"
        value={formData.address?.zip || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            address: { ...formData.address!, zip: e.target.value },
          })
        }
        className="border rounded-lg px-3 py-2 w-full"
        required
      />
    </div>
  </div>

  {/* Buttons */}
  <div className="md:col-span-2 flex justify-end mt-6 space-x-3">
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
      {isEditing ? 'Update' : 'Add'} Teacher
    </button>
  </div>
</form>

          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Teacher Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <p><strong>ID:</strong> {currentTeacher.teacherId}</p>
              <p><strong>Name:</strong> {`${currentTeacher.firstName} ${currentTeacher.lastName}`}</p>
              <p><strong>Subject:</strong> {currentTeacher.subject}</p>
              <p><strong>Class:</strong> {currentTeacher.className}</p>
              <p><strong>Section:</strong> {currentTeacher.section}</p>
              <p><strong>Phone:</strong> {currentTeacher.phone}</p>
              <p><strong>DOB:</strong> {currentTeacher.dob}</p>
              <p><strong>Blood Group:</strong> {currentTeacher.bloodGroup}</p>
              <p><strong>Emergency Contact:</strong> {currentTeacher.emergencyContact}</p>
              <p><strong>Joining Date:</strong> {currentTeacher.joiningDate}</p>
              <div className="col-span-2">
                <strong>Address:</strong>
                <p>{currentTeacher.address.street}, {currentTeacher.address.city}, {currentTeacher.address.state} - {currentTeacher.address.zip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
