import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  Bus,
  Users,
  User,
  GraduationCap,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Student, indianStates } from '../services/centralData';

const prePrimaryClasses = ['Nursery', 'LKG', 'UKG'];
const primaryAndSecClasses = Array.from({ length: 12 }, (_, i) => String(i + 1));
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const sectionOptions = ['A', 'B', 'C', 'D'];

const StudentSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-2.5">
    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </section>
);

const StudentDetail: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? 'sm:col-span-2' : undefined}>
    <dt className="text-sm text-gray-500 dark:text-slate-400 mb-1">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-white break-words">{children || '—'}</dd>
  </div>
);

const StudentManagement: React.FC = () => {
  const { students, transportRoutes, addStudent, updateStudent, deleteStudent } = useData();

  const currentTransportRoute = transportRoutes.find(route => route.id === currentStudent?.busRouteId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState('');
  const [parsedCsvData, setParsedCsvData] = useState<Array<Partial<Student>>>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    class: 'Nursery',
    section: 'A',
    category: 'normal',
    rollNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    motherPhone: '',
    houseAddress: '',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    emergencyContact: '',
    bloodGroup: 'B+',
    classTeacher: '',
    busRouteId: '',
    isAvailingTransport: false
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = [
      student.firstName,
      student.lastName,
      student.studentId,
      student.class,
      student.parentName,
      student.fatherName,
      student.motherName
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesClass = !filterClass || student.class === filterClass;
    const matchesCategory = !filterCategory || student.category === filterCategory;

    return matchesSearch && matchesClass && matchesCategory;
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '2019-05-15',
      gender: 'Male',
      class: 'Nursery',
      section: 'A',
      category: 'normal',
      rollNumber: String(students.length + 1).padStart(2, '0'),
      admissionDate: new Date().toISOString().split('T')[0],
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      fatherName: '',
      motherName: '',
      fatherPhone: '',
      motherPhone: '',
      houseAddress: '',
      city: 'New Delhi',
      state: 'Delhi',
      pinCode: '110001',
      emergencyContact: '',
      bloodGroup: 'B+',
      classTeacher: '',
      busRouteId: '',
      isAvailingTransport: false
    });
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setIsEditing(true);
    setCurrentStudent(student);
    setFormData({
      ...student,
      fatherName: student.fatherName || student.parentName || '',
      motherName: student.motherName || '',
      fatherPhone: student.fatherPhone || student.parentPhone || '',
      motherPhone: student.motherPhone || '',
      state: student.state || 'Delhi'
    });
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
    deleteStudent(toDeleteId);
    setShowConfirm(false);
    setToDeleteId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.class) {
      alert('Please fill all mandatory fields (First Name, Last Name, Class)');
      return;
    }

    const parentName = formData.parentName || formData.fatherName || formData.motherName || 'Parent';
    const parentPhone = formData.parentPhone || formData.fatherPhone || formData.motherPhone || '9876543210';
    const parentEmail = formData.parentEmail || `${formData.firstName?.toLowerCase()}@example.com`;

    if (isEditing && currentStudent) {
      updateStudent(currentStudent.id, {
        ...formData,
        parentName,
        parentPhone,
        parentEmail
      });
    } else {
      addStudent({
        studentId: formData.studentId || `STU2026${String(students.length + 1).padStart(3, '0')}`,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        dateOfBirth: formData.dateOfBirth || '2018-01-01',
        gender: formData.gender || 'Male',
        class: formData.class || 'Nursery',
        section: formData.section || 'A',
        category: formData.category || 'normal',
        rollNumber: formData.rollNumber || '01',
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
        parentName,
        parentPhone,
        parentEmail,
        fatherName: formData.fatherName || parentName,
        motherName: formData.motherName || '',
        fatherPhone: formData.fatherPhone || parentPhone,
        motherPhone: formData.motherPhone || '',
        houseAddress: formData.houseAddress || '',
        city: formData.city || 'New Delhi',
        state: formData.state || 'Delhi',
        pinCode: formData.pinCode || '110001',
        emergencyContact: formData.emergencyContact || parentPhone,
        bloodGroup: formData.bloodGroup || 'B+',
        classTeacher: formData.classTeacher,
        busRouteId: formData.busRouteId,
        isAvailingTransport: formData.isAvailingTransport || false
      });
    }

    setShowModal(false);
    setCurrentStudent(null);
  };

  // CSV Template Generation
  const sampleCsvContent = `studentId,firstName,lastName,dateOfBirth,gender,class,section,category,rollNumber,fatherName,motherName,fatherPhone,motherPhone,houseAddress,city,state,pinCode,bloodGroup,isAvailingTransport,busRouteId
STU2026801,Aarav,Kapoor,2017-04-12,Male,5,A,normal,21,Rajesh Kapoor,Sunita Kapoor,+91 9876543211,+91 9876543212,Flat 402 Palm Heights,New Delhi,Delhi,110001,B+,true,tr-1
STU2026802,Ananya,Sharma,2016-08-25,Female,6,B,reservation,14,Vikas Sharma,Pooja Sharma,+91 9876543213,+91 9876543214,H-24 Green Park,New Delhi,Delhi,110016,O+,false,`;

  const handleDownloadSampleCsv = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(sampleCsvContent));
    element.setAttribute('download', 'student_bulk_import_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setImportErrors(['CSV file must contain at least a header row and one data row.']);
      setParsedCsvData([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const results: Array<Partial<Student>> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 3) continue;

      const rowData: any = {};
      headers.forEach((h, idx) => {
        rowData[h] = values[idx] || '';
      });

      if (!rowData.firstName || !rowData.lastName) {
        errors.push(`Row ${i + 1}: Missing required firstName or lastName.`);
        continue;
      }

      const parentName = rowData.parentName || rowData.fatherName || rowData.motherName || 'Parent';
      const parentPhone = rowData.parentPhone || rowData.fatherPhone || rowData.motherPhone || '+91 9876543210';
      const isAvailingTransport = String(rowData.isAvailingTransport).toLowerCase() === 'true' || String(rowData.isAvailingTransport).toLowerCase() === 'yes';

      results.push({
        studentId: rowData.studentId || `STU2026${String(students.length + results.length + 1).padStart(3, '0')}`,
        firstName: rowData.firstName,
        lastName: rowData.lastName,
        dateOfBirth: rowData.dateOfBirth || '2017-01-01',
        gender: (rowData.gender as any) || 'Male',
        class: rowData.class || '1',
        section: rowData.section || 'A',
        category: rowData.category === 'reservation' ? 'reservation' : 'normal',
        rollNumber: rowData.rollNumber || String(results.length + 1),
        admissionDate: rowData.admissionDate || new Date().toISOString().split('T')[0],
        parentName,
        parentPhone,
        parentEmail: rowData.parentEmail || `${rowData.firstName.toLowerCase()}@example.com`,
        fatherName: rowData.fatherName || parentName,
        motherName: rowData.motherName || '',
        fatherPhone: rowData.fatherPhone || parentPhone,
        motherPhone: rowData.motherPhone || '',
        houseAddress: rowData.houseAddress || '',
        city: rowData.city || 'New Delhi',
        state: rowData.state || 'Delhi',
        pinCode: rowData.pinCode || '110001',
        emergencyContact: rowData.emergencyContact || parentPhone,
        bloodGroup: rowData.bloodGroup || 'B+',
        busRouteId: rowData.busRouteId || '',
        isAvailingTransport
      });
    }

    setImportErrors(errors);
    setParsedCsvData(results);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedCsvData.length === 0) {
      alert('No valid rows found to import.');
      return;
    }

    parsedCsvData.forEach(student => {
      addStudent({
        studentId: student.studentId!,
        firstName: student.firstName!,
        lastName: student.lastName!,
        dateOfBirth: student.dateOfBirth || '2017-01-01',
        gender: student.gender || 'Male',
        class: student.class || '1',
        section: student.section || 'A',
        category: student.category || 'normal',
        rollNumber: student.rollNumber || '01',
        admissionDate: student.admissionDate || new Date().toISOString().split('T')[0],
        parentName: student.parentName || 'Parent',
        parentPhone: student.parentPhone || '+91 9876543210',
        parentEmail: student.parentEmail || 'parent@example.com',
        fatherName: student.fatherName,
        motherName: student.motherName,
        fatherPhone: student.fatherPhone,
        motherPhone: student.motherPhone,
        houseAddress: student.houseAddress || '',
        city: student.city || 'New Delhi',
        state: student.state || 'Delhi',
        pinCode: student.pinCode || '110001',
        emergencyContact: student.emergencyContact || '+91 9876543210',
        bloodGroup: student.bloodGroup || 'B+',
        busRouteId: student.busRouteId,
        isAvailingTransport: student.isAvailingTransport || false
      });
    });

    setImportSuccessMsg(`Successfully imported ${parsedCsvData.length} students into the school registry.`);
    setTimeout(() => {
      setShowImportModal(false);
      setParsedCsvData([]);
      setCsvText('');
      setImportSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage student enrollments, detailed parent profiles, reservation status, transport routes, and CSV bulk import
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCsvText('');
              setParsedCsvData([]);
              setImportErrors([]);
              setImportSuccessMsg(null);
              setShowImportModal(true);
            }}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Import CSV (Bulk)
          </button>

          <button
            onClick={handleAdd}
            className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search by name, ID, parent, roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Filter by Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Classes (Pre-Primary & 1-12)</option>
              <optgroup label="Pre-Primary">
                {prePrimaryClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </optgroup>
              <optgroup label="Classes 1 to 12">
                {primaryAndSecClasses.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Student Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="normal">Normal Student</option>
              <option value="reservation">Reservation / Concession</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterClass('');
                setFilterCategory('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Student ID</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Name</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Class & Sec</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Category</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Roll No</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Parents</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Transport</th>
                <th className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 font-mono font-medium text-xs text-blue-600 dark:text-blue-400">
                    {student.studentId}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300 font-medium">
                    {student.class} - {student.section}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        student.category === 'reservation'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {student.category === 'reservation' ? 'Reservation' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300 font-mono">{student.rollNumber}</td>
                  <td className="px-5 py-4 text-gray-700 dark:text-slate-300">
                    <div className="text-xs">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {student.fatherName || student.parentName}
                      </span>
                      {student.motherName && (
                        <span className="text-gray-500 dark:text-slate-400 block">
                          Mother: {student.motherName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        student.isAvailingTransport
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      <Bus className="w-3 h-3" />
                      {student.isAvailingTransport ? 'Bus Service' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleView(student)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-1.5 text-[#4e74f9] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(student.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
                        title="Delete Student"
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

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Students (CSV Bulk)</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Upload or paste CSV with student personal, parent, category and transport details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {importSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* Sample Template & Upload Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Need a sample file?</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Download the pre-formatted CSV template with all parent, address, and transport headers.
                  </p>
                </div>
                <button
                  onClick={handleDownloadSampleCsv}
                  className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-600 transition flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Download Sample CSV
                </button>
              </div>

              {/* File Upload / Paste Box */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-slate-300 mb-2">
                  Upload .CSV File or Paste Content
                </label>
                <div className="flex gap-3 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose .CSV File
                  </button>
                  <span className="text-xs text-gray-400 self-center">or paste raw CSV text below:</span>
                </div>

                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCsvText(e.target.value);
                  }}
                  placeholder="Paste comma-separated student records here..."
                  className="w-full font-mono text-xs p-3.5 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              {/* Error messages */}
              {importErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>CSV Validation Warnings:</span>
                  </div>
                  {importErrors.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}

              {/* Data Preview Table */}
              {parsedCsvData.length > 0 && (
                <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-800/80 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Parsed Preview: {parsedCsvData.length} valid record(s) ready to import
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Valid format
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100/50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2 text-left">ID</th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Class-Sec</th>
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">Father</th>
                          <th className="p-2 text-left">Mother</th>
                          <th className="p-2 text-left">Phone</th>
                          <th className="p-2 text-left">Transport</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {parsedCsvData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                            <td className="p-2 font-mono text-blue-600">{row.studentId}</td>
                            <td className="p-2 font-semibold">{row.firstName} {row.lastName}</td>
                            <td className="p-2">{row.class} - {row.section}</td>
                            <td className="p-2 capitalize">{row.category}</td>
                            <td className="p-2">{row.fatherName || '-'}</td>
                            <td className="p-2">{row.motherName || '-'}</td>
                            <td className="p-2">{row.fatherPhone || row.parentPhone}</td>
                            <td className="p-2">{row.isAvailingTransport ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={parsedCsvData.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Import {parsedCsvData.length > 0 ? `${parsedCsvData.length} Students` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Student Profile' : 'Enroll New Student'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Complete personal, academic, parental, and transport profile
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category / Reservation Section */}
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                      Admission Category / Reservation Quota
                    </span>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Select if this student qualifies for RTE / government quota / concession fee structure.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 text-xs font-semibold text-purple-900 dark:text-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.category === 'reservation'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.checked ? 'reservation' : 'normal'
                      })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Reservation Student</span>
                </label>
              </div>

              {/* Student Basic Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                  Academic & Personal Information
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
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Class *
                    </label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      <optgroup label="Pre-Primary">
                        {prePrimaryClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      </optgroup>
                      <optgroup label="Classes 1 to 12">
                        {primaryAndSecClasses.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Section *
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    >
                      {sectionOptions.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      required
                    />
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
                      {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Transportation Options */}
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Bus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        School Transportation Facility
                      </span>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Enable if student avails school bus service; automatically updates transport fee ledger.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-semibold text-amber-900 dark:text-amber-200 shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.isAvailingTransport || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAvailingTransport: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span>Avail Transport</span>
                  </label>
                </div>

                {formData.isAvailingTransport && (
                  <div className="pt-3 border-t border-amber-200/60 dark:border-amber-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-amber-900 dark:text-amber-200 mb-1">
                        Select Bus Route
                      </label>
                      <select
                        value={formData.busRouteId || ''}
                        onChange={(e) => setFormData({ ...formData, busRouteId: e.target.value })}
                        className="w-full px-3.5 py-2 border border-amber-300 dark:border-amber-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none text-sm"
                      >
                        <option value="">-- Choose Assigned Route --</option>
                        {transportRoutes.map(tr => (
                          <option key={tr.id} value={tr.id}>
                            {tr.routeNumber} - {tr.routeTitle} ({tr.vehicleType})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-amber-900 dark:text-amber-200 mb-1">
                        Pickup / Drop Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sector 14 main gate stop"
                        className="w-full px-3.5 py-2 border border-amber-300 dark:border-amber-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Parents & Guardians Detailed Information */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Parents / Guardian Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Father Details */}
                  <div className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/60 space-y-3">
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200">Father's Information</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value, parentName: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                        Father's Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value, parentPhone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Mother Details */}
                  <div className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/60 space-y-3">
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200">Mother's Information</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                        Mother's Name
                      </label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="e.g. Sunita Sharma"
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                        Mother's Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                        placeholder="+91 9876543211"
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Email & Emergency */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Parent Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="+91 9876500000"
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Residential Address Details */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Residential Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      House / Flat / Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="Flat 402, Block B, Green Valley Apartments"
                      value={formData.houseAddress}
                      onChange={(e) => setFormData({ ...formData, houseAddress: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      State / UT (Dropdown)
                    </label>
                    <select
                      value={formData.state || 'Delhi'}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    >
                      {indianStates.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-300 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      placeholder="110001"
                      className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                    />
                  </div>
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
                  {isEditing ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && currentStudent && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="shrink-0 flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStudent.firstName} {currentStudent.lastName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Student ID: {currentStudent.studentId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    currentStudent.category === 'reservation'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {currentStudent.category === 'reservation' ? 'Reservation / Concession' : 'Normal Student'}
                </span>
                <button
                  aria-label="Close student details"
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              <StudentSection title="Personal Details" icon={User}>
                <StudentDetail label="First Name">{currentStudent.firstName}</StudentDetail>
                <StudentDetail label="Last Name">{currentStudent.lastName}</StudentDetail>
                <StudentDetail label="Date of Birth">{currentStudent.dateOfBirth}</StudentDetail>
                <StudentDetail label="Gender">{currentStudent.gender}</StudentDetail>
                <StudentDetail label="Blood Group">{currentStudent.bloodGroup}</StudentDetail>
              </StudentSection>

              <StudentSection title="Academic Details" icon={GraduationCap}>
                <StudentDetail label="Class">{currentStudent.class}</StudentDetail>
                <StudentDetail label="Section">{currentStudent.section}</StudentDetail>
                <StudentDetail label="Roll Number">{currentStudent.rollNumber}</StudentDetail>
                <StudentDetail label="Admission Category">{currentStudent.category === 'reservation' ? 'Reservation / Concession' : 'Normal Student'}</StudentDetail>
                <StudentDetail label="Admission Date">{currentStudent.admissionDate}</StudentDetail>
              </StudentSection>

              <StudentSection title="Parent / Guardian Details" icon={Users}>
                <StudentDetail label="Parent / Guardian Name">{currentStudent.parentName}</StudentDetail>
                <StudentDetail label="Parent Phone">{currentStudent.parentPhone}</StudentDetail>
                <StudentDetail label="Father Name">{currentStudent.fatherName}</StudentDetail>
                <StudentDetail label="Father Phone">{currentStudent.fatherPhone}</StudentDetail>
                <StudentDetail label="Mother Name">{currentStudent.motherName}</StudentDetail>
                <StudentDetail label="Mother Phone">{currentStudent.motherPhone}</StudentDetail>
                <StudentDetail label="Parent Email">{currentStudent.parentEmail}</StudentDetail>
                <StudentDetail label="Emergency Phone">{currentStudent.emergencyContact}</StudentDetail>
              </StudentSection>

              <StudentSection title="Transport & Location" icon={Bus}>
                <StudentDetail label="Transport Status">
                  {currentStudent.isAvailingTransport ? 'Availing School Transport' : 'Self Commute / Private Transport'}
                </StudentDetail>
                <StudentDetail label="Transport Route">
                  {currentTransportRoute ? `${currentTransportRoute.routeNumber} - ${currentTransportRoute.routeTitle}` : currentStudent.busRouteId ? `Route ID: ${currentStudent.busRouteId}` : 'No School Transport'}
                </StudentDetail>
                <StudentDetail label="Residential Address" fullWidth>
                  {[currentStudent.houseAddress, currentStudent.city, currentStudent.state, currentStudent.pinCode].filter(Boolean).join(', ')}
                </StudentDetail>
              </StudentSection>
            </div>

            <div className="shrink-0 flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Student?</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              This action will delete the student and their associated fee ledger record.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentManagement;
