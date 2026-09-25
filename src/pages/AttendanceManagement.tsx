import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

type MainTab = 'student' | 'staff';

export const AttendanceManagement: React.FC = () => {
  const {
    students,
    classes,
    employees,
    studentAttendance,
    staffAttendance,
    overrideStudentAttendance,
    bulkMarkStudentAttendance,
    markStaffAttendance
  } = useData();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<MainTab>('student');

  // Common Date Selector (default to today: 2026-09-11)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-11');

  const handlePrevDay = () => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setSelectedDate(`${y}-${m}-${day}`);
    }
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setSelectedDate(`${y}-${m}-${day}`);
    }
  };

  const handleSetToday = () => {
    setSelectedDate('2026-09-11');
  };

  // --- Student Attendance State ---
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  // --- Staff Attendance State ---
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all'); // all | Teacher | Admin | Support
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // Filtered Student List & Attendance Resolution
  // -------------------------------------------------------------
  const availableSectionNames = useMemo(() => {
    if (selectedClass === 'all') {
      const set = new Set<string>();
      classes.forEach(c => c.sections?.forEach(s => set.add(s.name)));
      return Array.from(set).sort();
    }
    const cls = classes.find(c => (c.name || '').toLowerCase() === selectedClass.toLowerCase());
    return cls ? cls.sections.map(s => s.name) : [];
  }, [classes, selectedClass]);

  // Students belonging to the chosen class & section
  const sectionStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'all' || (s.class || '').toLowerCase() === selectedClass.toLowerCase();
      const matchSection = selectedSection === 'all' || (s.section || '').toLowerCase() === selectedSection.toLowerCase();
      return matchClass && matchSection;
    });
  }, [students, selectedClass, selectedSection]);

  // Merged Student Attendance Roster for Selected Date
  const studentRoster = useMemo(() => {
    return sectionStudents.map(stu => {
      const record = studentAttendance.find(
        a => a.studentId === stu.id && a.date === selectedDate
      );
      return {
        student: stu,
        attendance: record || {
          id: `virtual-${stu.id}`,
          studentId: stu.id,
          studentName: `${stu.firstName} ${stu.lastName}`,
          rollNumber: stu.rollNumber || '',
          class: stu.class,
          section: stu.section,
          date: selectedDate,
          status: 'Present' as const, // Default fallback
          markedBy: 'Class Teacher',
          markedByRole: 'Teacher' as const,
          markedAt: '08:00 AM',
          source: 'Teacher Mobile App' as const,
          isOverridden: false
        }
      };
    });
  }, [sectionStudents, studentAttendance, selectedDate]);

  // Filtered Student Roster by search
  const filteredStudentRoster = useMemo(() => {
    return studentRoster.filter(item => {
      const q = studentSearchQuery.toLowerCase();
      const matchSearch =
        (item.student.firstName || '').toLowerCase().includes(q) ||
        (item.student.lastName || '').toLowerCase().includes(q) ||
        (item.student.rollNumber || '').toLowerCase().includes(q) ||
        (item.student.studentId || '').toLowerCase().includes(q);

      return matchSearch;
    });
  }, [studentRoster, studentSearchQuery]);

  // Stats for current class & section: Present and Absent
  const studentStats = useMemo(() => {
    let present = 0;
    let absent = 0;

    studentRoster.forEach(({ attendance }) => {
      if (attendance.status === 'Present') present++;
      else if (attendance.status === 'Absent') absent++;
    });

    return { present, absent };
  }, [studentRoster]);

  // Quick One-Click Student Status Setter
  const handleQuickStatusChange = (studentId: string, newStatus: 'Present' | 'Absent') => {
    const stu = students.find(s => s.id === studentId);
    overrideStudentAttendance(studentId, selectedDate, newStatus, 'Quick update by Admin', 'Admin');
    showToast(`Attendance updated to "${newStatus}" for ${stu?.firstName} ${stu?.lastName}`);
  };

  // Bulk Mark Student Action
  const handleBulkMarkStudents = (statusToSet: 'Present' | 'Absent') => {
    const records = filteredStudentRoster.map(({ student }) => ({
      studentId: student.id,
      status: statusToSet
    }));
    bulkMarkStudentAttendance(records, selectedClass, selectedSection, selectedDate, 'School Admin');
    showToast(`Bulk marked all ${records.length} students as "${statusToSet}".`);
  };

  // Export Student CSV
  const handleExportStudentCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Admission No', 'Class', 'Section', 'Date', 'Status'];
    const rows = filteredStudentRoster.map(r => [
      r.student.rollNumber || '',
      `"${r.student.firstName} ${r.student.lastName}"`,
      r.student.studentId || '',
      r.student.class || '',
      r.student.section || '',
      selectedDate,
      r.attendance.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Attendance_${selectedClass}_${selectedSection}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report CSV downloaded successfully.');
  };

  // -------------------------------------------------------------
  // Staff Attendance Resolution & Handlers
  // -------------------------------------------------------------
  // Staff Roster for Selected Date
  const staffRoster = useMemo(() => {
    return employees.map(emp => {
      const record = staffAttendance.find(
        a => a.employeeId === emp.id && a.date === selectedDate
      );
      return {
        employee: emp,
        attendance: record || {
          id: `virtual-stf-${emp.id}`,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeId,
          role: emp.role,
          department: emp.department,
          designation: emp.designation,
          date: selectedDate,
          status: 'Present' as const,
          checkInTime: '08:00 AM',
          checkOutTime: '03:30 PM',
          markedBy: 'Admin',
          markedAt: '08:00 AM',
          remarks: ''
        }
      };
    });
  }, [employees, staffAttendance, selectedDate]);

  // Filtered Staff Roster
  const filteredStaffRoster = useMemo(() => {
    return staffRoster.filter(item => {
      const q = staffSearchQuery.toLowerCase();
      const matchSearch =
        (item.employee.firstName || '').toLowerCase().includes(q) ||
        (item.employee.lastName || '').toLowerCase().includes(q) ||
        (item.employee.employeeId || '').toLowerCase().includes(q) ||
        (item.employee.department || '').toLowerCase().includes(q) ||
        (item.employee.designation || '').toLowerCase().includes(q);

      const matchRole =
        staffRoleFilter === 'all'
          ? true
          : (item.employee.role || '').toLowerCase() === staffRoleFilter.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [staffRoster, staffSearchQuery, staffRoleFilter]);

  // Staff Stats: Present and Absent
  const staffStats = useMemo(() => {
    let present = 0;
    let absent = 0;

    staffRoster.forEach(({ attendance }) => {
      if (attendance.status === 'Present') present++;
      else if (attendance.status === 'Absent') absent++;
    });

    return { present, absent };
  }, [staffRoster]);

  // Quick Staff Status Setter
  const handleQuickStaffStatus = (empId: string, status: 'Present' | 'Absent') => {
    const emp = employees.find(e => e.id === empId);
    markStaffAttendance(
      empId,
      selectedDate,
      status,
      status === 'Present' ? '08:00 AM' : undefined,
      status === 'Present' ? '03:30 PM' : undefined,
      'Status updated by Admin'
    );
    showToast(`Attendance updated to "${status}" for ${emp?.firstName} ${emp?.lastName}`);
  };

  // Bulk Mark Staff
  const handleBulkMarkStaff = (status: 'Present' | 'Absent') => {
    const activeStaff = filteredStaffRoster.filter(r => r.attendance.status !== 'On Leave');
    activeStaff.forEach(r => {
      markStaffAttendance(r.employee.id, selectedDate, status);
    });
    showToast(`Bulk marked ${activeStaff.length} staff members as "${status}".`);
  };

  // Export Staff CSV
  const handleExportStaffCSV = () => {
    const headers = ['Staff Name', 'Employee ID', 'Role', 'Department', 'Date', 'Status'];
    const rows = filteredStaffRoster.map(r => [
      `"${r.employee.firstName} ${r.employee.lastName}"`,
      r.employee.employeeId || '',
      r.employee.role || '',
      r.employee.department || '',
      selectedDate,
      r.attendance.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Staff attendance report CSV downloaded successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Track and manage daily student and staff attendance records
          </p>
        </div>

        {/* Date Selector with Previous/Next Quick Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={handlePrevDay}
            title="Previous Day"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            title="Next Day"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== '2026-09-11' && (
            <button
              type="button"
              onClick={handleSetToday}
              className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800/60 transition-all ml-1"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Navigation Pillar Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'student'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Attendance Hub</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-t-lg'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teacher & Staff Attendance</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {employees.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDENT ATTENDANCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar: Present & Absent only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {studentStats.present}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
                <XCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
                {studentStats.absent}
              </p>
            </div>
          </div>

          {/* Action Toolbar with Inline Class & Section Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class Dropdown */}
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('all');
                }}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    Class {c.name}
                  </option>
                ))}
              </select>

              {/* Section Dropdown */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
              >
                <option value="all">All Sections</option>
                {availableSectionNames.map(s => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => handleBulkMarkStudents('Present')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Mark All Present
              </button>

              <button
                onClick={handleExportStudentCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Student Attendance Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-base">
                Attendance register
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Roll Number</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredStudentRoster.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentRoster.map(({ student, attendance }) => {
                      const isPresent = attendance.status === 'Present';
                      const isAbsent = attendance.status === 'Absent';

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition"
                        >
                          {/* Name */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            {student.firstName} {student.lastName}
                          </td>

                          {/* Roll Number */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            {student.rollNumber || '—'}
                          </td>

                          {/* Attendance Status */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(student.id, 'Present')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(student.id, 'Absent')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHER & STAFF ATTENDANCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar: Present & Absent only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {staffStats.present}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
                <XCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
                {staffStats.absent}
              </p>
            </div>
          </div>

          {/* Action Toolbar with Inline Staff Role Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name, ID, or department..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Staff Role Dropdown */}
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[150px]"
              >
                <option value="all">All Roles</option>
                <option value="Teacher">Teachers</option>
                <option value="Admin">Admin</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => handleBulkMarkStaff('Present')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Mark All Present
              </button>

              <button
                onClick={handleExportStaffCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Teacher & Staff Attendance Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-base">
                Attendance register
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredStaffRoster.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No staff members found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffRoster.map(({ employee, attendance }) => {
                      const isPresent = attendance.status === 'Present';
                      const isAbsent = attendance.status === 'Absent';
                      const isOnLeave = attendance.status === 'On Leave';

                      return (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition"
                        >
                          {/* Staff Name */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            {employee.firstName} {employee.lastName}
                          </td>

                          {/* Department */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            {employee.department || 'General'}
                          </td>

                          {/* Attendance Toggle */}
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                            {isOnLeave ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                On Leave
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleQuickStaffStatus(employee.id, 'Present')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    isPresent
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStaffStatus(employee.id, 'Absent')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    isAbsent
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                                  }`}
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
