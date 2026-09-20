import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  GraduationCap,
  Briefcase,
  User,
  Users,
  MapPin,
  Heart
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

const FormSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </section>
);

const TeacherSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
  </section>
);

const TeacherDetail: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? 'sm:col-span-2' : undefined}>
    <dt className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-white break-words">{children || '—'}</dd>
  </div>
);

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
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Teacher ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Faculty Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class & Sec</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Experience</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    {teacher.teacherId}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    {teacher.firstName} {teacher.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    {teacher.subject}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    Class {teacher.className} ({teacher.section})
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    {teacher.experienceYears}y {teacher.experienceMonths}m
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                    {teacher.phone}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleView(teacher)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="View Full Profile"
                        aria-label={`View details for ${teacher.firstName} ${teacher.lastName}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-1.5 text-gray-500 hover:text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit Teacher"
                        aria-label={`Edit ${teacher.firstName} ${teacher.lastName}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Delete Teacher"
                        aria-label={`Delete ${teacher.firstName} ${teacher.lastName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No teacher records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Teacher Profile' : 'Add New Teacher'}
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
            <form onSubmit={handleSubmit} id="teacher-form" className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
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
                    Gender
                  </label>
                  <select
                    value={formData.gender || 'Female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.maritalStatus || 'Single'}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  >
                    {maritalStatuses.map(ms => (
                      <option key={ms} value={ms}>{ms}</option>
                    ))}
                  </select>
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
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
                    Street Address <span className="text-red-500">*</span>
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
                    value={formData.address?.city || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, city: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.address?.state || 'Delhi'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, state: e.target.value }
                      })
                    }
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
                    ZIP / PIN Code <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>
              </FormSection>

              {/* Section 2: Professional & Academic Details */}
              <FormSection title="Professional & Academic Details" icon={GraduationCap}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  >
                    <option value="">Select Subject</option>
                    {Array.from(new Set(dbSubjects.map(s => s.name))).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. (Physics), B.Ed."
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate || ''}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={formData.experienceYears ?? 0}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Experience (Months)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={formData.experienceMonths ?? 0}
                    onChange={(e) => setFormData({ ...formData, experienceMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>
              </FormSection>

              {/* Section 3: Family & Background Details */}
              <FormSection title="Family & Background Details" icon={Users}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Father's full name"
                    value={formData.fatherName || ''}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Spouse's Name (If Married)
                  </label>
                  <input
                    type="text"
                    placeholder="Spouse name"
                    value={formData.spouseName || ''}
                    onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  />
                </div>
              </FormSection>

              {/* Section 4: Class Assignment */}
              <FormSection title="Class Assignment" icon={Briefcase}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Assigned Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.className || ''}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value, section: 'A' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  >
                    <option value="">Select Class</option>
                    {dbClasses.map((cls) => (
                      <option key={cls.id} value={cls.name}>Class {cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Assigned Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.section || 'A'}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
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
                form="teacher-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                {isEditing ? 'Save Changes' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View Modal */}
      {showViewModal && currentTeacher && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentTeacher.firstName} {currentTeacher.lastName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Teacher ID: {currentTeacher.teacherId} • {currentTeacher.subject} Teacher
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
              <TeacherSection title="Personal Details" icon={User}>
                <TeacherDetail label="First Name">{currentTeacher.firstName}</TeacherDetail>
                <TeacherDetail label="Last Name">{currentTeacher.lastName}</TeacherDetail>
                <TeacherDetail label="Date of Birth">{currentTeacher.dob}</TeacherDetail>
                <TeacherDetail label="Gender">{currentTeacher.gender}</TeacherDetail>
                <TeacherDetail label="Marital Status">{currentTeacher.maritalStatus}</TeacherDetail>
                <TeacherDetail label="Blood Group">{currentTeacher.bloodGroup}</TeacherDetail>
                <TeacherDetail label="Phone">{currentTeacher.phone}</TeacherDetail>
                <TeacherDetail label="Email">{currentTeacher.email}</TeacherDetail>
                <TeacherDetail label="Emergency Phone">{currentTeacher.emergencyContact}</TeacherDetail>
                <TeacherDetail label="Street Address" fullWidth>{currentTeacher.address?.street}</TeacherDetail>
                <TeacherDetail label="City">{currentTeacher.address?.city}</TeacherDetail>
                <TeacherDetail label="State">{currentTeacher.address?.state}</TeacherDetail>
                <TeacherDetail label="ZIP / PIN Code">{currentTeacher.address?.zip}</TeacherDetail>
              </TeacherSection>

              <TeacherSection title="Professional & Academic Details" icon={GraduationCap}>
                <TeacherDetail label="Subject Specialization">{currentTeacher.subject}</TeacherDetail>
                <TeacherDetail label="Qualifications">{currentTeacher.qualification}</TeacherDetail>
                <TeacherDetail label="Joining Date">{currentTeacher.joiningDate}</TeacherDetail>
                <TeacherDetail label="Total Experience">{currentTeacher.experienceYears} Years {currentTeacher.experienceMonths} Months</TeacherDetail>
              </TeacherSection>

              <TeacherSection title="Family & Background Details" icon={Users}>
                <TeacherDetail label="Father's Name">{currentTeacher.fatherName}</TeacherDetail>
                <TeacherDetail label="Spouse's Name">{currentTeacher.spouseName}</TeacherDetail>
              </TeacherSection>

              <TeacherSection title="Class Assignment" icon={Briefcase}>
                <TeacherDetail label="Assigned Class">Class {currentTeacher.className}</TeacherDetail>
                <TeacherDetail label="Assigned Section">Section {currentTeacher.section}</TeacherDetail>
              </TeacherSection>
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
    </div>
  );
};

export default TeacherManagement;

