import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Users,
  GraduationCap,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Smartphone,
  Shield,
  Edit3,
  RefreshCw,
  Send,
  UserCheck,
  Building,
  Check,
  X,
  FileSpreadsheet,
  BarChart3,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { StudentAttendanceRecord, StaffAttendanceRecord } from '../services/centralData';

type MainTab = 'student' | 'staff' | 'analytics';

export const AttendanceManagement: React.FC = () => {
  const {
    students,
    classes,
    employees,
    teachers,
    staff,
    studentAttendance,
    staffAttendance,
    overrideStudentAttendance,
    bulkMarkStudentAttendance,
    markStaffAttendance,
    bulkMarkStaffAttendance
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
  const [selectedClass, setSelectedClass] = useState<string>('10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');

  // Student Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideStudentId, setOverrideStudentId] = useState<string>('');
  const [overrideStudentName, setOverrideStudentName] = useState<string>('');
  const [overrideCurrentStatus, setOverrideCurrentStatus] = useState<string>('Present');
  const [overrideNewStatus, setOverrideNewStatus] = useState<'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused'>('Present');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Bulk Student Action Modal State
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<'Present' | 'Absent'>('Present');

  // --- Staff Attendance State ---
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all'); // all | teacher | admin | support
  const [staffDepartmentFilter, setStaffDepartmentFilter] = useState<string>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');

  // Staff Edit Modal State
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string>('');
  const [editingStaffName, setEditingStaffName] = useState<string>('');
  const [staffFormStatus, setStaffFormStatus] = useState<'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave'>('Present');
  const [staffFormInTime, setStaffFormInTime] = useState<string>('08:00 AM');
  const [staffFormOutTime, setStaffFormOutTime] = useState<string>('03:30 PM');
  const [staffFormRemarks, setStaffFormRemarks] = useState<string>('');

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
  const currentClassObj = useMemo(() => {
    return classes.find(c => (c.name || '').toLowerCase() === (selectedClass || '').toLowerCase()) || classes[0];
  }, [classes, selectedClass]);

  const availableSections = useMemo(() => {
    return currentClassObj?.sections || [];
  }, [currentClassObj]);

  // Ensure valid section is selected
  React.useEffect(() => {
    if (availableSections.length > 0 && !availableSections.some(s => s.name === selectedSection)) {
      setSelectedSection(availableSections[0].name);
    }
  }, [availableSections, selectedSection]);

  // Students belonging to the chosen class & section
  const sectionStudents = useMemo(() => {
    return students.filter(
      s => (s.class || '').toLowerCase() === (selectedClass || '').toLowerCase() &&
           (s.section || '').toLowerCase() === (selectedSection || '').toLowerCase()
    );
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
          markedBy: currentClassObj?.sections?.find(s => s.name === stu.section)?.classTeacherName || 'Class Teacher',
          markedByRole: 'Teacher' as const,
          markedAt: '08:00 AM',
          source: 'Teacher Mobile App' as const,
          isOverridden: false
        }
      };
    });
  }, [sectionStudents, studentAttendance, selectedDate, currentClassObj]);

  // Filtered Student Roster by search and status
  const filteredStudentRoster = useMemo(() => {
    return studentRoster.filter(item => {
      const q = studentSearchQuery.toLowerCase();
      const matchSearch =
        (item.student.firstName || '').toLowerCase().includes(q) ||
        (item.student.lastName || '').toLowerCase().includes(q) ||
        (item.student.rollNumber || '').toLowerCase().includes(q) ||
        (item.student.studentId || '').toLowerCase().includes(q);

      const matchStatus =
        studentStatusFilter === 'all'
          ? true
          : studentStatusFilter === 'overridden'
          ? item.attendance.isOverridden
          : (item.attendance.status || '').toLowerCase() === studentStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [studentRoster, studentSearchQuery, studentStatusFilter]);

  // Class Teacher of current section
  const currentSectionTeacher = useMemo(() => {
    const sec = availableSections.find(s => s.name === selectedSection);
    return sec?.classTeacherName || 'Class Teacher';
  }, [availableSections, selectedSection]);

  // Stats for current class & section
  const studentStats = useMemo(() => {
    const total = studentRoster.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let excused = 0;
    let overridden = 0;

    studentRoster.forEach(({ attendance }) => {
      if (attendance.status === 'Present') present++;
      else if (attendance.status === 'Absent') absent++;
      else if (attendance.status === 'Late') late++;
      else if (attendance.status === 'Half Day') halfDay++;
      else if (attendance.status === 'Excused') excused++;

      if (attendance.isOverridden) overridden++;
    });

    const attendancePct = total > 0 ? Math.round(((present + late + (halfDay * 0.5)) / total) * 100) : 0;

    return { total, present, absent, late, halfDay, excused, overridden, attendancePct };
  }, [studentRoster]);

  // Quick One-Click Student Status Setter
  const handleQuickStatusChange = (studentId: string, newStatus: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused') => {
    const stu = students.find(s => s.id === studentId);
    overrideStudentAttendance(studentId, selectedDate, newStatus, 'Quick update by Admin', 'Admin');
    showToast(`Attendance updated to "${newStatus}" for ${stu?.firstName} ${stu?.lastName}`);
  };

  // Trigger Student Override Modal
  const handleOpenOverrideModal = (stuId: string, stuName: string, curStatus: string, remarks?: string) => {
    setOverrideStudentId(stuId);
    setOverrideStudentName(stuName);
    setOverrideCurrentStatus(curStatus);
    setOverrideNewStatus(curStatus as any);
    setOverrideReason(remarks || '');
    setShowOverrideModal(true);
  };

  // Submit Student Override
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudentId) return;
    overrideStudentAttendance(
      overrideStudentId,
      selectedDate,
      overrideNewStatus,
      overrideReason || 'Admin administrative override',
      'School Admin'
    );
    setShowOverrideModal(false);
    showToast(`Successfully overridden attendance for ${overrideStudentName} to ${overrideNewStatus}.`);
  };

  // Bulk Mark Student Action
  const handleBulkMarkStudents = (statusToSet: 'Present' | 'Absent') => {
    const records = sectionStudents.map(s => ({
      studentId: s.id,
      status: statusToSet
    }));
    bulkMarkStudentAttendance(records, selectedClass, selectedSection, selectedDate, 'School Admin');
    setShowBulkModal(false);
    showToast(`Bulk marked all ${records.length} students of Class ${selectedClass}-${selectedSection} as "${statusToSet}".`);
  };

  // Export Student CSV
  const handleExportStudentCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Admission No', 'Class', 'Section', 'Date', 'Status', 'Marked By', 'Source', 'Overridden', 'Remarks'];
    const rows = studentRoster.map(r => [
      r.student.rollNumber,
      `"${r.student.firstName} ${r.student.lastName}"`,
      r.student.studentId,
      r.student.class,
      r.student.section,
      selectedDate,
      r.attendance.status,
      `"${r.attendance.markedBy}"`,
      `"${r.attendance.source}"`,
      r.attendance.isOverridden ? 'YES' : 'NO',
      `"${r.attendance.overrideRemarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Attendance_Class_${selectedClass}_${selectedSection}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report CSV downloaded successfully.');
  };

  // -------------------------------------------------------------
  // Staff Attendance Resolution & Handlers
  // -------------------------------------------------------------
  const allDepartments = useMemo(() => {
    const deps = new Set<string>();
    employees.forEach(e => {
      if (e.department) deps.add(e.department);
    });
    return Array.from(deps);
  }, [employees]);

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
          markedBy: 'Biometric Sync',
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
        (item.employee.designation || '').toLowerCase().includes(q);

      const matchRole =
        staffRoleFilter === 'all'
          ? true
          : (item.employee.role || '').toLowerCase() === staffRoleFilter.toLowerCase();

      const matchDepartment =
        staffDepartmentFilter === 'all'
          ? true
          : (item.employee.department || '').toLowerCase() === staffDepartmentFilter.toLowerCase();

      return matchSearch && matchRole && matchDepartment;
    });
  }, [staffRoster, staffSearchQuery, staffRoleFilter, staffDepartmentFilter]);

  // Staff Stats
  const staffStats = useMemo(() => {
    const total = staffRoster.length;
    let present = 0;
    let absent = 0;
    let onLeave = 0;
    let late = 0;
    let halfDay = 0;

    staffRoster.forEach(({ attendance }) => {
      if (attendance.status === 'Present') present++;
      else if (attendance.status === 'Absent') absent++;
      else if (attendance.status === 'On Leave') onLeave++;
      else if (attendance.status === 'Late') late++;
      else if (attendance.status === 'Half Day') halfDay++;
    });

    const attendancePct = total > 0 ? Math.round(((present + late + (halfDay * 0.5)) / total) * 100) : 0;

    return { total, present, absent, onLeave, late, halfDay, attendancePct };
  }, [staffRoster]);

  // Quick Staff Status
  const handleQuickStaffStatus = (empId: string, status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave') => {
    const emp = employees.find(e => e.id === empId);
    markStaffAttendance(
      empId,
      selectedDate,
      status,
      status === 'Present' ? '08:00 AM' : undefined,
      status === 'Present' ? '03:30 PM' : undefined,
      'Status updated by Admin'
    );
    showToast(`Updated attendance for ${emp?.firstName} ${emp?.lastName} to "${status}".`);
  };

  // Open Staff Edit Modal
  const handleOpenStaffModal = (empId: string, name: string, status: any, inTime?: string, outTime?: string, remarks?: string) => {
    setEditingStaffId(empId);
    setEditingStaffName(name);
    setStaffFormStatus(status);
    setStaffFormInTime(inTime || '08:00 AM');
    setStaffFormOutTime(outTime || '03:30 PM');
    setStaffFormRemarks(remarks || '');
    setShowStaffModal(true);
  };

  // Save Staff Modal
  const handleSaveStaffModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;
    markStaffAttendance(
      editingStaffId,
      selectedDate,
      staffFormStatus,
      staffFormInTime,
      staffFormOutTime,
      staffFormRemarks
    );
    setShowStaffModal(false);
    showToast(`Staff attendance record updated for ${editingStaffName}.`);
  };

  // Bulk Mark Staff
  const handleBulkMarkStaff = (status: 'Present' | 'Absent') => {
    bulkMarkStaffAttendance(selectedDate, status);
    showToast(`Bulk updated all staff members as "${status}" for ${selectedDate}.`);
  };

  // Sync Biometric Simulated
  const handleSyncBiometric = () => {
    showToast('Biometric terminal sync complete: 6 teacher/staff records updated.');
  };

  // -------------------------------------------------------------
  // Analytics & Defaulters Data (< 75%)
  // -------------------------------------------------------------
  const studentDefaulters = useMemo(() => {
    // Generate simulated monthly attendance metrics for all students
    return students.map((stu, index) => {
      // Deterministic simulation based on index
      const totalDays = 24;
      const missedDays = (index % 5 === 0) ? (index % 3 === 0 ? 9 : 7) : (index % 2 === 0 ? 3 : 1);
      const attendedDays = Math.max(0, totalDays - missedDays);
      const percentage = Math.round((attendedDays / totalDays) * 100);

      return {
        student: stu,
        totalDays,
        attendedDays,
        missedDays,
        percentage,
        isDefaulter: percentage < 75
      };
    });
  }, [students]);

  const defaultersList = useMemo(() => {
    return studentDefaulters.filter(s => s.isDefaulter);
  }, [studentDefaulters]);

  const classWiseAttendanceStats = useMemo(() => {
    const list = classes.map(c => {
      const classStudents = students.filter(s => (s.class || '').toLowerCase() === (c.name || '').toLowerCase());
      const total = classStudents.length;
      // Simulated monthly attendance avg
      const rate = total > 0 ? (90 - ((parseInt(c.name) || 5) % 4) * 3) : 95;
      return {
        className: c.name,
        stage: c.stage,
        studentCount: total,
        averageAttendance: rate
      };
    });
    return list;
  }, [classes, students]);

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
            Live sync of Teacher Mobile App submissions, administrative overrides, and staff biometric records
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

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30 rounded-t-lg'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monthly Register & Defaulters</span>
            {defaultersList.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                {defaultersList.length} &lt; 75%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDENT ATTENDANCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Class, Section & Teacher Submission Banner */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Class & Section Selector Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[130px]"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        Class {c.name} ({c.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Section
                  </label>
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                    {availableSections.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSection(s.name)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedSection === s.name
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        Section {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teacher App Submission Card */}
              <div className="flex items-center gap-4 p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Teacher App Submission
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mt-0.5">
                    Marked by {currentSectionTeacher} <span className="text-xs font-normal text-gray-500 dark:text-slate-400">(08:05 AM)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase">Total Students</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {studentStats.total}
              </p>
              <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                Attendance Rate: {studentStats.attendancePct}%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-medium uppercase">Present</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {studentStats.present}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                In Classroom
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-xs font-medium uppercase">Absent</span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {studentStats.absent}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Unexcused
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-medium uppercase">Late</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {studentStats.late}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                After 08:15 AM
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
                <span className="text-xs font-medium uppercase">Excused / HD</span>
                <HelpCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                {studentStats.excused + studentStats.halfDay}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Medical / Informed
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                <span className="text-xs font-medium uppercase">Admin Overridden</span>
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {studentStats.overridden}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Manual corrections
              </div>
            </div>
          </div>

          {/* Action and Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or ID..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All Students' },
                { id: 'present', label: 'Present' },
                { id: 'absent', label: 'Absent' },
                { id: 'late', label: 'Late' },
                { id: 'overridden', label: '🛡️ Overridden' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStudentStatusFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    studentStatusFilter === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-2">
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

          {/* Student Roster Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                  Class {selectedClass} - Section {selectedSection} Attendance Register
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Showing {filteredStudentRoster.length} of {studentRoster.length} students for {selectedDate}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Live Admin Override Enabled
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
                    <th className="py-3.5 px-6">Roll & Student</th>
                    <th className="py-3.5 px-4">Admission ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-center">1-Click Quick Update</th>
                    <th className="py-3.5 px-4">Source / Log</th>
                    <th className="py-3.5 px-6 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-sm">
                  {filteredStudentRoster.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-400 font-medium">No students found matching current filters.</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Try resetting the search query or section selection.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudentRoster.map(({ student, attendance }) => {
                      const isPresent = attendance.status === 'Present';
                      const isAbsent = attendance.status === 'Absent';
                      const isLate = attendance.status === 'Late';
                      const isHalfDay = attendance.status === 'Half Day';
                      const isExcused = attendance.status === 'Excused';

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Student Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {student.rollNumber || '#'}
                              </span>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-slate-100">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                  Roll No: {student.rollNumber || 'N/A'} • Parent: {student.parentName}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Admission ID */}
                          <td className="py-4 px-4 font-mono text-xs text-gray-600 dark:text-slate-400">
                            {student.studentId}
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                                student.category === 'reservation'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {student.category === 'reservation' ? 'RTE / Res' : 'General'}
                            </span>
                          </td>

                          {/* Current Status Pill */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  isPresent
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : isAbsent
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                    : isLate
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                    : isHalfDay
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                                }`}
                              >
                                {isPresent && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {isAbsent && <XCircle className="w-3.5 h-3.5" />}
                                {isLate && <Clock className="w-3.5 h-3.5" />}
                                {isHalfDay && <HelpCircle className="w-3.5 h-3.5" />}
                                {isExcused && <Check className="w-3.5 h-3.5" />}
                                {attendance.status}
                              </span>
                            </div>
                          </td>

                          {/* 1-Click Quick Update Buttons */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-lg border border-gray-200 dark:border-slate-700 w-fit mx-auto">
                              <button
                                title="Mark Present"
                                onClick={() => handleQuickStatusChange(student.id, 'Present')}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
                                }`}
                              >
                                P
                              </button>
                              <button
                                title="Mark Absent"
                                onClick={() => handleQuickStatusChange(student.id, 'Absent')}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-700'
                                }`}
                              >
                                A
                              </button>
                              <button
                                title="Mark Late"
                                onClick={() => handleQuickStatusChange(student.id, 'Late')}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  isLate
                                    ? 'bg-amber-600 text-white shadow'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-700'
                                }`}
                              >
                                L
                              </button>
                              <button
                                title="Mark Excused"
                                onClick={() => handleQuickStatusChange(student.id, 'Excused')}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  isExcused
                                    ? 'bg-sky-600 text-white shadow'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-950/60 hover:text-sky-700'
                                }`}
                              >
                                Ex
                              </button>
                            </div>
                          </td>

                          {/* Source & Marked Info */}
                          <td className="py-4 px-4 text-xs text-gray-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              {attendance.source === 'Teacher Mobile App' ? (
                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                  <Smartphone className="w-3.5 h-3.5" /> Mobile App
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                                  <Shield className="w-3.5 h-3.5" /> Admin Portal
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                              {attendance.markedBy} ({attendance.markedAt})
                            </div>
                          </td>

                          {/* Admin Override Action */}
                          <td className="py-4 px-6 text-right">
                            {attendance.isOverridden ? (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                  <Shield className="w-3 h-3" /> Overridden
                                </span>
                                {attendance.overrideRemarks && (
                                  <span className="text-[11px] text-gray-500 dark:text-slate-400 italic max-w-[180px] truncate mt-0.5" title={attendance.overrideRemarks}>
                                    "{attendance.overrideRemarks}"
                                  </span>
                                )}
                                <button
                                  onClick={() => handleOpenOverrideModal(student.id, `${student.firstName} ${student.lastName}`, attendance.status, attendance.overrideRemarks)}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                >
                                  Edit Override
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenOverrideModal(student.id, `${student.firstName} ${student.lastName}`, attendance.status)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all"
                              >
                                <Edit3 className="w-3 h-3 text-gray-500" />
                                Override
                              </button>
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

      {/* ========================================================================= */}
      {/* TAB 2: TEACHER & STAFF ATTENDANCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Top Filter & Biometric Actions Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Role Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Staff Role
                </label>
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  {[
                    { id: 'all', label: 'All Staff' },
                    { id: 'teacher', label: 'Teachers' },
                    { id: 'admin', label: 'Admin' },
                    { id: 'support', label: 'Support' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setStaffRoleFilter(r.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        staffRoleFilter === r.id
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={staffDepartmentFilter}
                  onChange={(e) => setStaffDepartmentFilter(e.target.value)}
                  className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {allDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSyncBiometric}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Biometric Terminal
              </button>

              <button
                onClick={() => handleBulkMarkStaff('Present')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Mark All Present
              </button>
            </div>
          </div>

          {/* Staff Attendance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase">Total Employees</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {staffStats.total}
              </p>
              <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                Punctuality: {staffStats.attendancePct}%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-medium uppercase">Present Today</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {staffStats.present}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                On Duty
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                <span className="text-xs font-medium uppercase">On Approved Leave</span>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {staffStats.onLeave}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Synced from Leave Portal
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-medium uppercase">Late Arrival</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {staffStats.late}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                After 08:15 AM
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-xs font-medium uppercase">Unexcused Absent</span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {staffStats.absent}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                No Notice
              </div>
            </div>
          </div>

          {/* Search Input for Staff */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty or staff by name, code, designation..."
              value={staffSearchQuery}
              onChange={(e) => setStaffSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Staff Attendance Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                  Teacher & Staff Attendance Roster
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Record of all employees for {selectedDate}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
                    <th className="py-3.5 px-6">Staff Member</th>
                    <th className="py-3.5 px-4">Role & Dept</th>
                    <th className="py-3.5 px-4">Timings (In / Out)</th>
                    <th className="py-3.5 px-4">Attendance Status</th>
                    <th className="py-3.5 px-4 text-center">Quick Toggle</th>
                    <th className="py-3.5 px-4">Punctuality / Remarks</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-sm">
                  {filteredStaffRoster.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No employees found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffRoster.map(({ employee, attendance }) => {
                      const isPresent = attendance.status === 'Present';
                      const isAbsent = attendance.status === 'Absent';
                      const isLate = attendance.status === 'Late';
                      const isOnLeave = attendance.status === 'On Leave';
                      const isHalfDay = attendance.status === 'Half Day';

                      return (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Staff Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {(employee.firstName || 'E')[0]}{(employee.lastName || '')[0] || ''}
                              </span>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-slate-100">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                                  {employee.employeeId} • {employee.designation}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Dept */}
                          <td className="py-4 px-4">
                            <div className="font-medium text-xs text-gray-800 dark:text-slate-200">
                              {employee.department || 'General'}
                            </div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                              {employee.role}
                            </span>
                          </td>

                          {/* Timings */}
                          <td className="py-4 px-4 text-xs font-mono">
                            {isPresent || isLate || isHalfDay ? (
                              <div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{attendance.checkInTime || '--:--'}</span>
                                <span className="text-gray-400 mx-1">→</span>
                                <span className="text-gray-600 dark:text-slate-400">{attendance.checkOutTime || '--:--'}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500 italic">Not Checked In</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isPresent
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isAbsent
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : isOnLeave
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                  : isLate
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {isPresent && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {isAbsent && <XCircle className="w-3.5 h-3.5" />}
                              {isOnLeave && <Calendar className="w-3.5 h-3.5" />}
                              {isLate && <Clock className="w-3.5 h-3.5" />}
                              {isHalfDay && <HelpCircle className="w-3.5 h-3.5" />}
                              {attendance.status}
                            </span>
                          </td>

                          {/* Quick Status Buttons */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 w-fit mx-auto">
                              <button
                                title="Present"
                                onClick={() => handleQuickStaffStatus(employee.id, 'Present')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isPresent ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                title="Late"
                                onClick={() => handleQuickStaffStatus(employee.id, 'Late')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isLate ? 'bg-amber-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-amber-100 hover:text-amber-700'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                title="Absent"
                                onClick={() => handleQuickStaffStatus(employee.id, 'Absent')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isAbsent ? 'bg-rose-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                title="On Leave"
                                onClick={() => handleQuickStaffStatus(employee.id, 'On Leave')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isOnLeave ? 'bg-orange-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:bg-orange-100 hover:text-orange-700'
                                }`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="py-4 px-4 text-xs text-gray-500 dark:text-slate-400">
                            {attendance.remarks ? (
                              <span className="italic text-gray-700 dark:text-slate-300">
                                {attendance.remarks}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500">
                                Marked by {attendance.markedBy}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleOpenStaffModal(employee.id, `${employee.firstName} ${employee.lastName}`, attendance.status, attendance.checkInTime, attendance.checkOutTime, attendance.remarks)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all"
                            >
                              <Edit3 className="w-3 h-3 text-gray-500" />
                              Edit Timings
                            </button>
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
      {/* TAB 3: MONTHLY REGISTER & LOW ATTENDANCE ALERT (<75%) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Low Attendance Critical Alert Card */}
          <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">
                    Mandatory CBSE/State Board Attendance Threshold Defaulters (&lt; 75%)
                  </h3>
                  <span className="px-3 py-1 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold rounded-full">
                    {defaultersList.length} Students At Risk
                  </span>
                </div>
                <p className="text-sm text-rose-800/80 dark:text-rose-300/80 mt-1">
                  The following students have fallen below the mandatory 75% aggregate attendance threshold for the current academic session. Early notifications can be dispatched directly to registered guardians.
                </p>
              </div>
            </div>
          </div>

          {/* Defaulter Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                  Low Attendance Defaulters List
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Students with aggregate attendance less than 75%
                </p>
              </div>
              <button
                onClick={() => showToast('Parent warning SMS broadcast queued for all defaulters.')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Notify All Defaulter Parents (SMS)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-4">Class & Sec</th>
                    <th className="py-3.5 px-4">Working Days</th>
                    <th className="py-3.5 px-4">Days Attended</th>
                    <th className="py-3.5 px-4">Attendance %</th>
                    <th className="py-3.5 px-4">Parent Contact</th>
                    <th className="py-3.5 px-6 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-sm">
                  {defaultersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-slate-400">
                        🎉 Excellent! No students currently fall below the 75% attendance threshold.
                      </td>
                    </tr>
                  ) : (
                    defaultersList.map(({ student, totalDays, attendedDays, percentage }) => (
                      <tr key={student.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900 dark:text-slate-100">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                            Roll No: {student.rollNumber || 'N/A'} • {student.studentId}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-gray-800 dark:text-slate-200">
                          Class {student.class}-{student.section}
                        </td>

                        <td className="py-4 px-4 text-xs font-mono text-gray-600 dark:text-slate-400">
                          {totalDays} Days
                        </td>

                        <td className="py-4 px-4 text-xs font-mono font-semibold text-gray-900 dark:text-slate-100">
                          {attendedDays} Days
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {percentage}%
                            </span>
                            <div className="w-16 bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-600 h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs text-gray-600 dark:text-slate-300">
                          <div>{student.parentName}</div>
                          <div className="text-gray-400 font-mono">{student.parentPhone}</div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => showToast(`Automated SMS warning dispatched to parent of ${student.firstName} (${student.parentPhone}).`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 rounded-lg text-xs font-semibold transition-all"
                          >
                            <Send className="w-3 h-3" />
                            Send SMS Alert
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN STUDENT OVERRIDE */}
      {/* ========================================================================= */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-base">Administrative Attendance Override</h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="p-6 space-y-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Student</div>
                <div className="font-bold text-gray-900 dark:text-slate-100 text-base mt-0.5">
                  {overrideStudentName}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Date: {selectedDate} • Current Status: <span className="font-semibold">{overrideCurrentStatus}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Override Status To
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Present', 'Absent', 'Late', 'Half Day', 'Excused'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOverrideNewStatus(status)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        overrideNewStatus === status
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrative Override Reason / Justification
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Parent called school office with doctor slip, verified bus delay on Route 4, inter-school tournament duty..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl">
                🛡️ <strong>Audit Trail Note:</strong> This change will overwrite the teacher's mobile submission and record your administrative digital signature with timestamp.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Confirm & Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STAFF ATTENDANCE EDIT */}
      {/* ========================================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5" />
                <h3 className="font-bold text-base">Update Staff Attendance & Timings</h3>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffModal} className="p-6 space-y-4">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Employee</div>
                <div className="font-bold text-gray-900 dark:text-slate-100 text-base mt-0.5">
                  {editingStaffName}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Date: {selectedDate}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Present', 'Absent', 'Late', 'Half Day', 'On Leave'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStaffFormStatus(st)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all ${
                        staffFormStatus === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Check-In Time
                  </label>
                  <input
                    type="text"
                    placeholder="08:00 AM"
                    value={staffFormInTime}
                    onChange={(e) => setStaffFormInTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Check-Out Time
                  </label>
                  <input
                    type="text"
                    placeholder="03:30 PM"
                    value={staffFormOutTime}
                    onChange={(e) => setStaffFormOutTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved outdoor academic excursion duty"
                  value={staffFormRemarks}
                  onChange={(e) => setStaffFormRemarks(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
