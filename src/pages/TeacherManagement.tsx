import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, GraduationCap, Briefcase, User, MapPin, Heart } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { indianStates } from '../services/centralData';

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
  email: string;
  subject: string;
  qualification: string;
  joiningDate: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  fatherName: string;
  spouseName: string;
  experienceYears: number;
  experienceMonths: number;
  address: Address;
  emergencyContact: string;
  bloodGroup: string;
  className: string;
  section: string;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'] as const;

const TeacherManagement: React.FC = () => {
  const { teachers: rawTeachers, classes: dbClasses, subjects: dbSubjects, addEmployee, updateEmployee, deleteEmployee } = useData();

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
    email: '',
    subject: '',
    qualification: '',
    joiningDate: '',
    dob: '',
    gender: 'Female',
    maritalStatus: 'Married',
    fatherName: '',
    spouseName: '',
    experienceYears: 4,
    experienceMonths: 6,
    address: { street: '', city: 'New Delhi', state: 'Delhi', zip: '110001' },
    emergencyContact: '',
    bloodGroup: 'B+',
    className: '',
    section: 'A',
  });

  const teachers: Teacher[] = rawTeachers.map(t => {
    const nameParts = (t.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return {
      id: t.id,
      teacherId: t.code || t.id,
      firstName,
      lastName,
      phone: t.phone || '+91 98765 43210',
      email: t.email || `${firstName.toLowerCase()}@school.com`,
      subject: t.subject || t.department || 'Mathematics',
      qualification: t.qualification || 'M.Sc., B.Ed.',
      joiningDate: t.joiningDate || '2021-06-15',
      dob: '1988-04-12',
      gender: (t.gender as any) || 'Female',
      maritalStatus: t.maritalStatus || 'Married',
      fatherName: t.fatherName || 'R. C. Sharma',
      spouseName: t.spouseName || (t.maritalStatus === 'Married' ? 'V. Sharma' : ''),
      experienceYears: t.experienceYears ?? 5,
      experienceMonths: t.experienceMonths ?? 4,
      address: t.address || { street: '12 School Lane', city: 'New Delhi', state: 'Delhi', zip: '110001' },
      emergencyContact: t.emergencyContact || '+91 98765 00000',
      bloodGroup: t.bloodGroup || 'B+',
      className: t.className || '10',
      section: t.section || 'A'
    };
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject ? teacher.subject.toLowerCase().includes(filterSubject.toLowerCase()) : true;
    const matchesClass = filterClass ? teacher.className === filterClass : true;
    return matchesSearch && matchesSubject && matchesClass;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      subject: dbSubjects[0]?.name || 'Mathematics',
      qualification: 'M.Sc., B.Ed.',
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1990-01-01',
      gender: 'Female',
      maritalStatus: 'Single',
      fatherName: '',
      spouseName: '',
      experienceYears: 3,
      experienceMonths: 0,
      address: { street: '', city: 'New Delhi', state: 'Delhi', zip: '110001' },
      emergencyContact: '',
      bloodGroup: 'B+',
      className: dbClasses[0]?.name || '10',
      section: 'A',
    });
    setShowModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setIsEditing(true);
    setCurrentTeacher(teacher);
    setFormData({
      ...teacher,
      address: teacher.address || { street: '', city: 'New Delhi', state: 'Delhi', zip: '110001' }
    });
    setShowModal(true);
  };

  const handleView = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher record?')) {
      deleteEmployee(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    const email = formData.email || `${formData.firstName?.toLowerCase()}.${formData.lastName?.toLowerCase()}@school.com`;

    if (isEditing && currentTeacher) {
      updateEmployee(currentTeacher.id, {
        name: fullName,
        email,
        phone: formData.phone,
        qualification: formData.qualification,
        subject: formData.subject,
        className: formData.className,
        section: formData.section,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender as any,
        maritalStatus: formData.maritalStatus,
        fatherName: formData.fatherName,
        spouseName: formData.spouseName,
        experienceYears: Number(formData.experienceYears) || 0,
        experienceMonths: Number(formData.experienceMonths) || 0,
        emergencyContact: formData.emergencyContact,
        address: formData.address
      });
    } else {
      addEmployee({
        code: `TCH-${String(Math.floor(100 + Math.random() * 900))}`,
        name: fullName,
        role: 'teacher',
        designation: `${formData.subject || 'Subject'} Teacher`,
        department: formData.subject || 'Academics',
        phone: formData.phone || '+91 98765 43210',
        email,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        qualification: formData.qualification || 'M.Sc., B.Ed.',
        gender: (formData.gender as any) || 'Female',
        bloodGroup: formData.bloodGroup || 'B+',
        maritalStatus: formData.maritalStatus,
        fatherName: formData.fatherName,
        spouseName: formData.spouseName,
        experienceYears: Number(formData.experienceYears) || 0,
        experienceMonths: Number(formData.experienceMonths) || 0,
        subject: formData.subject,
        className: formData.className,
        section: formData.section,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        leaveBalance: {
          casual: { total: 12, taken: 0 },
          sick: { total: 10, taken: 0 },
          earned: { total: 15, taken: 0 }
        }
      });
    }

    setShowModal(false);
    setCurrentTeacher(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage faculty profiles, qualifications, experience, personal details, and class assignments
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, ID, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Filter by Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Subjects</option>
              {Array.from(new Set(dbSubjects.map(s => s.name))).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Filter by Assigned Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Classes</option>
              {dbClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>Class {cls.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('');
                setFilterClass('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Teacher ID</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Faculty Name</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Subject</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Class & Sec</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Experience</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Phone</th>
                <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 font-mono font-medium text-xs text-blue-600 dark:text-blue-400">
                    {teacher.teacherId}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#4e74f9] flex items-center justify-center font-bold text-xs">
                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-slate-400 block">
                          {teacher.qualification}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-800 dark:text-slate-200 font-medium">
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
                      {teacher.subject}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300">
                    Class {teacher.className} ({teacher.section})
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300 text-xs">
                    {teacher.experienceYears}y {teacher.experienceMonths}m
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300 font-mono text-xs">
                    {teacher.phone}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleView(teacher)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-1.5 text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                        title="Edit Teacher"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
                        title="Delete Teacher"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Teacher Profile' : 'Add New Teacher'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Academic assignments, marital status, experience, and contact details
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic & Academic Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Faculty & Academic Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Subject Specialization *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      <option value="">Select Subject</option>
                      {Array.from(new Set(dbSubjects.map(s => s.name))).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Assigned Class *
                    </label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value, section: 'A' })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      <option value="">Select Class</option>
                      {dbClasses.map((cls) => (
                        <option key={cls.id} value={cls.name}>Class {cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Assigned Section *
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      {formData.className ? (
                        (dbClasses.find(c => c.name === formData.className)?.sections || []).map((sec) => (
                          <option key={sec.id} value={sec.name}>Section {sec.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Qualifications
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. M.Sc. (Physics), B.Ed., CTET"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Family Details */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  Personal, Marital & Family Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Marital Status *
                    </label>
                    <select
                      value={formData.maritalStatus || 'Single'}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      {maritalStatuses.map(ms => (
                        <option key={ms} value={ms}>{ms}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      placeholder="Father's full name"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Spouse's Name (If Married)
                    </label>
                    <input
                      type="text"
                      placeholder="Spouse name"
                      value={formData.spouseName}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Experience & Joining */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  Teaching Experience & Date of Joining
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Experience (Months)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={formData.experienceMonths}
                      onChange={(e) => setFormData({ ...formData, experienceMonths: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Complete Address */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Contact Details & Residential Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      placeholder="House/Apartment number, street name"
                      value={formData.address?.street || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, street: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, city: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      State (Indian State Dropdown) *
                    </label>
                    <select
                      value={formData.address?.state || 'Delhi'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, state: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      {indianStates.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      ZIP / PIN Code *
                    </label>
                    <input
                      type="text"
                      value={formData.address?.zip || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, zip: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  {isEditing ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#4e74f9] flex items-center justify-center font-bold text-base">
                  {currentTeacher.firstName.charAt(0)}{currentTeacher.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentTeacher.firstName} {currentTeacher.lastName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    ID: {currentTeacher.teacherId} • {currentTeacher.subject} Teacher
                  </p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Academic Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] uppercase text-gray-500 dark:text-slate-400 block">Assigned Class</span>
                  <span className="font-bold text-gray-900 dark:text-white">Class {currentTeacher.className} ({currentTeacher.section})</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 dark:text-slate-400 block">Specialization</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{currentTeacher.subject}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 dark:text-slate-400 block">Experience</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {currentTeacher.experienceYears} Years {currentTeacher.experienceMonths} Months
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 dark:text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{currentTeacher.bloodGroup}</span>
                </div>
              </div>

              {/* Personal & Family Information */}
              <div className="p-4 border border-gray-200 dark:border-slate-800 rounded-xl space-y-3">
                <p className="text-xs font-bold uppercase text-gray-500 dark:text-slate-400">Personal & Family Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Marital Status:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{currentTeacher.maritalStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Father's Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{currentTeacher.fatherName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Spouse's Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{currentTeacher.spouseName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Date of Birth:</span>
                    <span className="font-medium text-gray-800 dark:text-slate-200">{currentTeacher.dob}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Joining Date:</span>
                    <span className="font-medium text-gray-800 dark:text-slate-200">{currentTeacher.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 block">Qualifications:</span>
                    <span className="font-medium text-gray-800 dark:text-slate-200">{currentTeacher.qualification}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                <p className="font-bold uppercase text-gray-500 dark:text-slate-400">Contact & Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p><strong>Phone:</strong> {currentTeacher.phone}</p>
                  <p><strong>Email:</strong> {currentTeacher.email}</p>
                  <p><strong>Emergency Contact:</strong> {currentTeacher.emergencyContact}</p>
                  <p><strong>Address:</strong> {currentTeacher.address.street}, {currentTeacher.address.city}, {currentTeacher.address.state} - {currentTeacher.address.zip}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800 mt-5">
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

export default TeacherManagement;
