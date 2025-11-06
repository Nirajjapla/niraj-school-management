import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { mockStudents as initialStudents } from '../services/mockData';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  // address broken into parts
  houseAddress: string;
  city: string;
  state: string;
  pinCode: string;
  // new fields
  emergencyContact?: string;
  bloodGroup?: string;
  // teacher info
  classTeacher?: string;
  associateTeacher?: string;
}

const classOptions = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const sectionOptions = ['A','B','C','D','E'];
const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents as unknown as Student[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    class: '',
    section: '',
    rollNumber: '',
    admissionDate: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    houseAddress: '',
    city: '',
    state: '',
    pinCode: '',
    emergencyContact: '',
    bloodGroup: '',
    classTeacher: '',
    associateTeacher: ''
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = [student.firstName, student.lastName, student.studentId, student.class]
      .join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? student.class === filterClass : true;
    const matchesSection = filterSection ? student.section === filterSection : true;
    return matchesSearch && matchesClass && matchesSection;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      class: '',
      section: '',
      rollNumber: '',
      admissionDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      houseAddress: '',
      city: '',
      state: '',
      pinCode: '',
      emergencyContact: '',
      bloodGroup: '',
      classTeacher: '',
      associateTeacher: ''
    });
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setIsEditing(true);
    setCurrentStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  const handleView = (student: Student) => {
    setCurrentStudent(student);
    setShowViewModal(true);
  };

  const confirmDelete = (id: string) => {
    setToDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    if (!toDeleteId) return;
    setStudents(students.filter(s => s.id !== toDeleteId));
    setShowConfirm(false);
    setToDeleteId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation for mandatory fields
    const required = ['firstName','lastName','dateOfBirth','class','section','rollNumber','admissionDate','parentName','parentPhone'];
    for (const key of required) {
      // @ts-ignore
      if (!formData[key]) {
        alert(`Please fill ${key}`);
        return;
      }
    }

    if (isEditing && currentStudent) {
      setStudents(students.map(s => s.id === currentStudent.id ? { ...currentStudent, ...formData } as Student : s));
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        studentId: `STU${String(students.length + 1).padStart(3, '0')}`,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || 'Male',
        class: formData.class || '',
        section: formData.section || '',
        rollNumber: formData.rollNumber || '',
        admissionDate: formData.admissionDate || '',
        parentName: formData.parentName || '',
        parentPhone: formData.parentPhone || '',
        parentEmail: formData.parentEmail || '',
        houseAddress: formData.houseAddress || '',
        city: formData.city || '',
        state: formData.state || '',
        pinCode: formData.pinCode || '',
        emergencyContact: formData.emergencyContact || '',
        bloodGroup: formData.bloodGroup || '',
        classTeacher: formData.classTeacher || '',
        associateTeacher: formData.associateTeacher || ''
      };
      setStudents([...students, newStudent]);
    }

    setShowModal(false);
    setCurrentStudent(null);
  };

  // handle excel import (uses dynamic import of xlsx so bundlers can include it)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      // Map rows to Student (expecting header names matching keys)
      const imported = json.map((row, idx) => ({
        id: Date.now().toString() + idx,
        studentId: row.studentId || `IMP${String(students.length + idx + 1).padStart(3,'0')}`,
        firstName: row.firstName || row.FirstName || '',
        lastName: row.lastName || row.LastName || '',
        dateOfBirth: row.dateOfBirth || row.DateOfBirth || '',
        gender: row.gender || 'Male',
        class: String(row.class || row.Class || ''),
        section: String(row.section || row.Section || ''),
        rollNumber: String(row.rollNumber || row.RollNumber || ''),
        admissionDate: row.admissionDate || row.AdmissionDate || '',
        parentName: row.parentName || row.ParentName || '',
        parentPhone: row.parentPhone || row.ParentPhone || '',
        parentEmail: row.parentEmail || row.ParentEmail || '',
        houseAddress: row.houseAddress || row.HouseAddress || '',
        city: row.city || row.City || '',
        state: row.state || row.State || '',
        pinCode: row.pinCode || row.PinCode || '',
        emergencyContact: row.emergencyContact || row.EmergencyContact || '',
        bloodGroup: row.bloodGroup || row.BloodGroup || '',
        classTeacher: row.classTeacher || row.ClassTeacher || '',
        associateTeacher: row.associateTeacher || row.AssociateTeacher || ''
      })) as Student[];

      setStudents(prev => [...prev, ...imported]);
      // clear file input
      e.currentTarget.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to import file. Make sure xlsx library is installed and the file is a valid Excel file.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <p className="text-gray-600">Manage student information and records</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                />
              </div>

              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border rounded">
                <option value="">All Classes</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="px-3 py-2 border rounded">
                <option value="">All Sections</option>
                {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <span className="px-3 py-2 border rounded cursor-pointer">Import Excel</span>
              </label>

              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 bg-[#4e74f9] text-white px-4 py-2 rounded-lg hover:bg-[#3d5fd8] transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emergency Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.studentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{`${student.firstName} ${student.lastName}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{`${student.class}-${student.section}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.parentPhone}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.emergencyContact || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.bloodGroup || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-1 text-[#4e74f9] hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(student.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Class</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  />
                </div>

                {/* Address broken into parts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Address</label>
                  <input type="text" value={formData.houseAddress} onChange={e => setFormData({...formData, houseAddress: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                  <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input type="tel" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="">Select</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                  <input type="text" value={formData.classTeacher} onChange={e => setFormData({...formData, classTeacher: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Associate Teacher</label>
                  <input type="text" value={formData.associateTeacher} onChange={e => setFormData({...formData, associateTeacher: e.target.value})} className="w-full px-3 py-2 border rounded" />
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
                  {isEditing ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-medium text-gray-800">{currentStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">{`${currentStudent.firstName} ${currentStudent.lastName}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-800">{currentStudent.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-800">{currentStudent.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium text-gray-800">{`${currentStudent.class}-${currentStudent.section}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-medium text-gray-800">{currentStudent.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Date</p>
                  <p className="font-medium text-gray-800">{currentStudent.admissionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent Name</p>
                  <p className="font-medium text-gray-800">{currentStudent.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent Phone</p>
                  <p className="font-medium text-gray-800">{currentStudent.parentPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent Email</p>
                  <p className="font-medium text-gray-800">{currentStudent.parentEmail}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Emergency Contact</p>
                  <p className="font-medium text-gray-800">{currentStudent.emergencyContact || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-gray-800">{currentStudent.bloodGroup || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Class Teacher</p>
                  <p className="font-medium text-gray-800">{currentStudent.classTeacher || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Associate Teacher</p>
                  <p className="font-medium text-gray-800">{currentStudent.associateTeacher || '-'}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-800">{`${currentStudent.houseAddress || ''} ${currentStudent.city ? ', ' + currentStudent.city : ''} ${currentStudent.state ? ', ' + currentStudent.state : ''} ${currentStudent.pinCode ? ', ' + currentStudent.pinCode : ''}`}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal (center-aligned text + buttons) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <p className="mb-4 text-gray-800">Are you sure you want to delete this student?</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
