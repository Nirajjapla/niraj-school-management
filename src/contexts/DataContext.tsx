import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Employee,
  SchoolClass,
  ClassSection,
  FeeComponent,
  FeeStructure,
  StudentFeeRecord,
  TransportRoute,
  LeaveRequest,
  CircularItem,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  SchoolProfile,
  DepartmentItem,
  DesignationItem,
  AcademicSubject,
  ExamSchedule,
  ExamResultRecord,
  InventoryItem,
  initialStudents,
  initialEmployees,
  initialClasses,
  initialFeeStructures,
  initialFeeRecords,
  initialTransportRoutes,
  initialLeaves,
  initialCirculars,
  initialNotifications,
  initialConversations,
  initialMessages,
  initialDrivers,
  initialSchools,
  initialDepartments,
  initialDesignations,
  initialSubjects,
  initialExams,
  initialExamResults,
  initialInventory,
  StudentAttendanceRecord,
  StaffAttendanceRecord,
  initialStudentAttendance,
  initialStaffAttendance
} from '../services/centralData';

interface DataContextType {
  // Attendance Management
  studentAttendance: StudentAttendanceRecord[];
  staffAttendance: StaffAttendanceRecord[];
  overrideStudentAttendance: (
    studentId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused',
    remarks?: string,
    overrideBy?: string
  ) => void;
  bulkMarkStudentAttendance: (
    records: Array<{ studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused' }>,
    className: string,
    sectionName: string,
    date: string,
    markedBy?: string
  ) => void;
  markStaffAttendance: (
    employeeId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave',
    checkInTime?: string,
    checkOutTime?: string,
    remarks?: string
  ) => void;
  bulkMarkStaffAttendance: (
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave'
  ) => void;
  // Classes & Sections
  classes: SchoolClass[];
  addClass: (name: string, stage?: 'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary', stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General') => void;
  updateClass: (id: string, name: string, stage?: 'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary', stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General') => void;
  deleteClass: (id: string) => void;
  addSection: (classId: string, name: string, options?: { capacity?: number; roomNumber?: string; classTeacherId?: string; classTeacherName?: string; assistantTeacherId?: string; assistantTeacherName?: string; stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General' }) => void;
  updateSection: (sectionId: string, name: string, options?: { capacity?: number; roomNumber?: string; classTeacherId?: string; classTeacherName?: string; assistantTeacherId?: string; assistantTeacherName?: string; stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General' }) => void;
  deleteSection: (sectionId: string) => void;

  // Student Section Allocation
  bulkAssignStudents: (studentIds: string[], targetClass: string, targetSection: string) => void;
  assignStudentSection: (studentId: string, targetClass: string, targetSection: string) => void;

  // Subjects
  subjects: AcademicSubject[];
  addSubject: (subject: Omit<AcademicSubject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<AcademicSubject>) => void;
  deleteSubject: (id: string) => void;

  // Exams & Results
  exams: ExamSchedule[];
  addExam: (exam: Omit<ExamSchedule, 'id'>) => void;
  updateExam: (id: string, exam: Partial<ExamSchedule>) => void;
  deleteExam: (id: string) => void;
  examResults: ExamResultRecord[];
  addExamResult: (result: Omit<ExamResultRecord, 'id'>) => void;
  updateExamResult: (id: string, result: Partial<ExamResultRecord>) => void;

  // Inventory & Library Assets
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Schools / Branches
  schools: SchoolProfile[];
  addSchool: (school: Omit<SchoolProfile, 'id'>) => void;
  updateSchool: (id: string, school: Partial<SchoolProfile>) => void;
  deleteSchool: (id: string) => void;

  // Departments & Designations
  departments: DepartmentItem[];
  addDepartment: (dept: Omit<DepartmentItem, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => void;
  designations: DesignationItem[];
  addDesignation: (desig: Omit<DesignationItem, 'id'>) => void;
  updateDesignation: (id: string, desig: Partial<DesignationItem>) => void;
  deleteDesignation: (id: string) => void;
  
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Employees (Teachers & Staff)
  employees: Employee[];
  teachers: Employee[];
  staff: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Fee Structures & Records
  feeStructures: FeeStructure[];
  updateFeeStructure: (fs: FeeStructure) => void;
  addFeeStructure: (fs: Omit<FeeStructure, 'id'>) => void;
  feeRecords: StudentFeeRecord[];
  recordPayment: (feeId: string, amount: number, remarks?: string) => void;
  overrideStudentFee: (studentId: string, overrideAmount: number, remarks: string) => void;
  syncFeeRecordForStudent: (student: Student) => StudentFeeRecord;
  computeCompositeFee: (
    components: FeeComponent[],
    frequency?: 'Monthly' | 'Quarterly' | 'Annually'
  ) => {
    monthly: number;
    quarterly: number;
    annual: number;
    baseComposite: number;
  };

  // Transportation
  transportRoutes: TransportRoute[];
  drivers: Array<{ id: string; name: string; phone: string }>;
  addTransportRoute: (route: Omit<TransportRoute, 'id'>) => void;
  updateTransportRoute: (id: string, route: Partial<TransportRoute>) => void;
  deleteTransportRoute: (id: string) => void;

  // Leaves
  leaves: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  approveLeave: (leaveId: string, approvedBy?: string) => void;
  rejectLeave: (leaveId: string, reason: string) => void;

  // Circulars
  circulars: CircularItem[];
  addCircular: (circular: Omit<CircularItem, 'id'>) => void;
  deleteCircular: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Messages (Chat)
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;
  createConversation: (participantId: string, participantName: string, participantRole: 'Teacher' | 'Student', participantClass?: string, initialMessage?: string) => string;
}

function loadAndMerge<T extends { id: string }>(key: string, initialList: T[]): T[] {
  const local = localStorage.getItem(key);
  if (!local) return initialList;
  try {
    const parsed: T[] = JSON.parse(local);
    if (!Array.isArray(parsed)) return initialList;
    const existingIds = new Set(parsed.map(item => item.id));
    const missingItems = initialList.filter(item => !existingIds.has(item.id));
    return [...parsed, ...missingItems];
  } catch {
    return initialList;
  }
}

export function computeComponentMonthlyAmount(comp: FeeComponent): number {
  switch (comp.frequency) {
    case 'Monthly':
      return comp.amount;
    case 'Quarterly':
      return comp.amount / 3;
    case 'Half yearly':
      return comp.amount / 6;
    case 'Yearly':
      return comp.amount / 12;
    default:
      return comp.amount;
  }
}

export function computeCompositeFee(
  components: FeeComponent[],
  frequency: 'Monthly' | 'Quarterly' | 'Annually' = 'Monthly'
): {
  monthly: number;
  quarterly: number;
  annual: number;
  baseComposite: number;
} {
  const mandatoryComps = components.filter(c => !c.isOptional);
  const monthlyMandatory = mandatoryComps.reduce(
    (sum, c) => sum + computeComponentMonthlyAmount(c),
    0
  );

  const monthly = Math.round(monthlyMandatory);
  const quarterly = Math.round(monthlyMandatory * 3);
  const annual = Math.round(monthlyMandatory * 12);

  const baseComposite =
    frequency === 'Monthly'
      ? monthly
      : frequency === 'Quarterly'
      ? quarterly
      : annual;

  return {
    monthly,
    quarterly,
    annual,
    baseComposite
  };
}

export function computeFeeStructureTotals(structure: FeeStructure) {
  const comp = computeCompositeFee(structure.components, structure.collectionFrequency);
  const optionalComps = structure.components.filter(c => c.isOptional);
  const monthlyOptional = optionalComps.reduce(
    (sum, c) => sum + computeComponentMonthlyAmount(c),
    0
  );

  return {
    monthlyComposite: comp.monthly,
    quarterlyComposite: comp.quarterly,
    annualComposite: comp.annual,
    baseComposite: comp.baseComposite,
    monthlyOptional: Math.round(monthlyOptional),
    quarterlyOptional: Math.round(monthlyOptional * 3),
    annualOptional: Math.round(monthlyOptional * 12)
  };
}

export function syncFeeRecordForStudent(
  student: Student,
  existingRecord?: StudentFeeRecord,
  currentFeeStructures: FeeStructure[] = initialFeeStructures,
  currentRoutes: TransportRoute[] = initialTransportRoutes
): StudentFeeRecord {
  // 1. Locate fee structure for student class and category
  let fs = currentFeeStructures.find(
    s => s.className.toLowerCase() === student.class.toLowerCase() && s.category === student.category
  );
  if (!fs) {
    fs = initialFeeStructures.find(
      s => s.className.toLowerCase() === student.class.toLowerCase() && s.category === student.category
    ) || currentFeeStructures[0] || initialFeeStructures[0];
  }

  // 2. Compute base mandatory composite totals
  const totals = computeFeeStructureTotals(fs);

  // 3. Transport Fee Evaluation
  const isAvailing =
    student.isAvailingTransport === true ||
    (student.isAvailingTransport !== false && Boolean(student.busRouteId));

  const route = isAvailing && student.busRouteId
    ? currentRoutes.find(r => r.id === student.busRouteId)
    : undefined;

  const transComp = fs.components.find(
    c => c.code === 'TRANSPORT' || c.name.toLowerCase().includes('transport') || c.id.includes('trans')
  );

  let transportMonthly = 0;
  if (isAvailing) {
    if (route && typeof route.monthlyFare === 'number') {
      transportMonthly =
        student.category === 'reservation'
          ? Math.round(route.monthlyFare * 0.6)
          : route.monthlyFare;
    } else if (transComp) {
      transportMonthly = computeComponentMonthlyAmount(transComp);
    } else {
      transportMonthly = student.category === 'reservation' ? 900 : 1500;
    }
  }

  // 4. Update selectedOptionalComponents list
  let optionalComponents = existingRecord?.selectedOptionalComponents
    ? [...existingRecord.selectedOptionalComponents]
    : [];

  if (isAvailing) {
    if (transComp && !optionalComponents.includes(transComp.id)) {
      optionalComponents.push(transComp.id);
    }
  } else {
    optionalComponents = optionalComponents.filter(id => {
      if (transComp && id === transComp.id) return false;
      if (id.toLowerCase().includes('trans')) return false;
      const comp = fs.components.find(c => c.id === id) ||
        initialFeeStructures.flatMap(s => s.components).find(c => c.id === id);
      if (comp && (comp.code === 'TRANSPORT' || comp.name.toLowerCase().includes('transport'))) {
        return false;
      }
      return true;
    });
  }

  // 5. Determine collection frequency and totals
  const freq =
    existingRecord?.collectionFrequency ||
    fs.collectionFrequency ||
    (['Nursery', 'LKG', 'UKG'].includes(student.class) ? 'Monthly' : 'Quarterly');

  const totalMonthly = totals.monthlyComposite + transportMonthly;
  const totalQuarterly = totals.quarterlyComposite + transportMonthly * 3;
  const totalAnnual = totals.annualComposite + transportMonthly * 12;

  const basePeriodTotal =
    freq === 'Monthly'
      ? totalMonthly
      : freq === 'Quarterly'
      ? totalQuarterly
      : totalAnnual;

  const hasOverride = existingRecord?.overrideAmount !== undefined;
  const totalAmount = hasOverride ? existingRecord!.overrideAmount! : basePeriodTotal;
  const paidAmount = existingRecord?.paidAmount || 0;

  let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
  if (totalAmount > 0 && paidAmount >= totalAmount) {
    status = 'paid';
  } else if (paidAmount > 0) {
    status = 'partial';
  } else if (existingRecord?.status === 'overdue') {
    status = 'overdue';
  } else {
    status = 'pending';
  }

  return {
    id: existingRecord?.id || `fee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    class: student.class,
    section: student.section,
    category: student.category,
    feeType: 'Composite Fee',
    collectionFrequency: freq,
    monthlyFee: totalMonthly,
    quarterlyFee: totalQuarterly,
    annualFee: totalAnnual,
    totalAmount,
    paidAmount,
    dueDate: existingRecord?.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paidDate: existingRecord?.paidDate || null,
    status,
    overrideAmount: existingRecord?.overrideAmount,
    overrideRemarks: existingRecord?.overrideRemarks,
    selectedOptionalComponents: optionalComponents,
    transportRouteId: isAvailing ? student.busRouteId : undefined,
    transportMonthlyFare: isAvailing ? transportMonthly : undefined
  };
}

function loadAndMergeFeeStructures(key: string, initialList: FeeStructure[]): FeeStructure[] {
  const local = localStorage.getItem(key);
  if (!local) return initialList;
  try {
    const parsed: FeeStructure[] = JSON.parse(local);
    if (!Array.isArray(parsed)) return initialList;

    const initialMap = new Map(initialList.map(s => [s.id, s]));
    const initialClassCatMap = new Map(initialList.map(s => [`${s.className}_${s.category}`, s]));

    const upgraded = parsed.map(item => {
      const canonical = initialMap.get(item.id) || initialClassCatMap.get(`${item.className}_${item.category}`);
      if (!canonical) return item;
      // If legacy structure has < 8 components or lacks standard codes, upgrade to canonical
      if (!item.components || item.components.length < 8 || !item.components.some(c => c.code === 'TUITION')) {
        return {
          ...canonical,
          ...item,
          components: canonical.components,
          compositeFee: canonical.compositeFee,
          graceDays: item.graceDays || canonical.graceDays
        };
      }
      return item;
    });

    const existingIds = new Set(upgraded.map(item => item.id));
    const missingItems = initialList.filter(item => !existingIds.has(item.id));
    return [...upgraded, ...missingItems];
  } catch {
    return initialList;
  }
}

function loadAndMergeTransportRoutes(key: string, initialList: TransportRoute[]): TransportRoute[] {
  const local = localStorage.getItem(key);
  if (!local) return initialList;
  try {
    const parsed: TransportRoute[] = JSON.parse(local);
    if (!Array.isArray(parsed)) return initialList;
    const initialMap = new Map(initialList.map(r => [r.id, r]));
    const upgraded = parsed.map(item => {
      const canonical = initialMap.get(item.id);
      if (canonical && item.monthlyFare === undefined) {
        return { ...item, monthlyFare: canonical.monthlyFare };
      }
      return item;
    });
    const existingIds = new Set(upgraded.map(item => item.id));
    const missingItems = initialList.filter(item => !existingIds.has(item.id));
    return [...upgraded, ...missingItems];
  } catch {
    return initialList;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadAndMerge('erp_classes', initialClasses));
  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => loadAndMerge('erp_subjects', initialSubjects));
  const [exams, setExams] = useState<ExamSchedule[]>(() => loadAndMerge('erp_exams', initialExams));
  const [examResults, setExamResults] = useState<ExamResultRecord[]>(() => loadAndMerge('erp_exam_results', initialExamResults));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadAndMerge('erp_inventory', initialInventory));
  const [schools, setSchools] = useState<SchoolProfile[]>(() => loadAndMerge('erp_schools', initialSchools));
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => loadAndMerge('erp_departments', initialDepartments));
  const [designations, setDesignations] = useState<DesignationItem[]>(() => loadAndMerge('erp_designations', initialDesignations));
  const [students, setStudents] = useState<Student[]>(() => loadAndMerge('erp_students', initialStudents));
  const [employees, setEmployees] = useState<Employee[]>(() => loadAndMerge('erp_employees', initialEmployees));
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => loadAndMergeFeeStructures('erp_fee_structures', initialFeeStructures));
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>(() => loadAndMerge('erp_fee_records', initialFeeRecords));
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(() => loadAndMergeTransportRoutes('erp_transport_routes', initialTransportRoutes));
  const [drivers] = useState(() => initialDrivers);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadAndMerge('erp_leaves', initialLeaves));
  const [circulars, setCirculars] = useState<CircularItem[]>(() => loadAndMerge('erp_circulars', initialCirculars));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadAndMerge('erp_notifications', initialNotifications));
  const [conversations, setConversations] = useState<ChatConversation[]>(() => loadAndMerge('erp_conversations', initialConversations));
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const local = localStorage.getItem('erp_messages');
    if (!local) return initialMessages;
    try {
      const parsed = JSON.parse(local);
      return typeof parsed === 'object' && parsed !== null ? parsed : initialMessages;
    } catch {
      return initialMessages;
    }
  });
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>(() =>
    loadAndMerge('erp_student_attendance', initialStudentAttendance)
  );
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>(() =>
    loadAndMerge('erp_staff_attendance', initialStaffAttendance)
  );

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('erp_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('erp_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('erp_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('erp_exam_results', JSON.stringify(examResults)); }, [examResults]);
  useEffect(() => { localStorage.setItem('erp_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('erp_schools', JSON.stringify(schools)); }, [schools]);
  useEffect(() => { localStorage.setItem('erp_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('erp_designations', JSON.stringify(designations)); }, [designations]);
  useEffect(() => { localStorage.setItem('erp_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('erp_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('erp_fee_structures', JSON.stringify(feeStructures)); }, [feeStructures]);
  useEffect(() => { localStorage.setItem('erp_fee_records', JSON.stringify(feeRecords)); }, [feeRecords]);
  useEffect(() => { localStorage.setItem('erp_transport_routes', JSON.stringify(transportRoutes)); }, [transportRoutes]);
  useEffect(() => { localStorage.setItem('erp_leaves', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem('erp_circulars', JSON.stringify(circulars)); }, [circulars]);
  useEffect(() => { localStorage.setItem('erp_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('erp_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('erp_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('erp_student_attendance', JSON.stringify(studentAttendance)); }, [studentAttendance]);
  useEffect(() => { localStorage.setItem('erp_staff_attendance', JSON.stringify(staffAttendance)); }, [staffAttendance]);

  // Sync Fee Record helper
  const syncFeeRecord = (student: Student) => {
    const existing = feeRecords.find(f => f.studentId === student.id);
    const synced = syncFeeRecordForStudent(student, existing, feeStructures, transportRoutes);
    setFeeRecords(prev => {
      const idx = prev.findIndex(f => f.studentId === student.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = synced;
        return next;
      }
      return [synced, ...prev];
    });
    return synced;
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      isAvailingTransport:
        studentData.isAvailingTransport !== undefined
          ? studentData.isAvailingTransport
          : Boolean(studentData.busRouteId)
    };
    setStudents(prev => [newStudent, ...prev]);

    // Automatically create synchronized fee record based on class, category, and transport
    const newFeeRecord = syncFeeRecordForStudent(newStudent, undefined, feeStructures, transportRoutes);
    setFeeRecords(prev => [newFeeRecord, ...prev]);

    // Update transport route student count if bus route assigned and availing
    if (newStudent.busRouteId && newStudent.isAvailingTransport !== false) {
      setTransportRoutes(prev =>
        prev.map(r =>
          r.id === newStudent.busRouteId
            ? { ...r, assignedStudentsCount: (r.assignedStudentsCount || 0) + 1 }
            : r
        )
      );
    }
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    const currentStudent = students.find(s => s.id === id);
    if (!currentStudent) return;

    const mergedStudent: Student = {
      ...currentStudent,
      ...updated,
      isAvailingTransport:
        updated.isAvailingTransport !== undefined
          ? updated.isAvailingTransport
          : updated.busRouteId !== undefined
          ? Boolean(updated.busRouteId)
          : currentStudent.isAvailingTransport
    };

    setStudents(prev => prev.map(s => (s.id === id ? mergedStudent : s)));

    // Re-sync fee record for the student, preserving payments and overrides
    setFeeRecords(prev => {
      const existing = prev.find(f => f.studentId === id);
      const synced = syncFeeRecordForStudent(mergedStudent, existing, feeStructures, transportRoutes);
      if (existing) {
        return prev.map(f => (f.studentId === id ? synced : f));
      }
      return [synced, ...prev];
    });

    // Handle bus route passenger count updates
    const prevRoute = (currentStudent.isAvailingTransport !== false) ? currentStudent.busRouteId : undefined;
    const newRoute = (mergedStudent.isAvailingTransport !== false) ? mergedStudent.busRouteId : undefined;

    if (prevRoute !== newRoute) {
      setTransportRoutes(prev =>
        prev.map(r => {
          if (r.id === prevRoute) {
            return { ...r, assignedStudentsCount: Math.max(0, (r.assignedStudentsCount || 0) - 1) };
          }
          if (r.id === newRoute) {
            return { ...r, assignedStudentsCount: (r.assignedStudentsCount || 0) + 1 };
          }
          return r;
        })
      );
    }
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setFeeRecords(prev => prev.filter(f => f.studentId !== id));
  };

  // Employee CRUD
  const teachers = employees.filter(e => e.role === 'teacher');
  const staff = employees.filter(e => e.role !== 'teacher');

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: `emp-${Date.now()}` };
    setEmployees(prev => [newEmp, ...prev]);
  };

  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Fee Structure & Override
  const updateFeeStructure = (fs: FeeStructure) => {
    const totals = computeFeeStructureTotals(fs);
    const updatedStructure: FeeStructure = {
      ...fs,
      compositeFee:
        fs.collectionFrequency === 'Monthly'
          ? totals.monthlyComposite
          : fs.collectionFrequency === 'Quarterly'
          ? totals.quarterlyComposite
          : totals.annualComposite
    };

    const nextStructures = feeStructures.map(item => (item.id === fs.id ? updatedStructure : item));
    setFeeStructures(nextStructures);

    // Propagate updated fee structure to students of this class & category (unless manually overridden)
    setFeeRecords(prev =>
      prev.map(rec => {
        if (
          rec.class.toLowerCase() === fs.className.toLowerCase() &&
          rec.category === fs.category &&
          rec.overrideAmount === undefined
        ) {
          const student = students.find(s => s.id === rec.studentId);
          if (student) {
            return syncFeeRecordForStudent(student, rec, nextStructures, transportRoutes);
          }
        }
        return rec;
      })
    );
  };

  const addFeeStructure = (fsData: Omit<FeeStructure, 'id'>) => {
    const newFs: FeeStructure = { ...fsData, id: `fs-${Date.now()}` };
    setFeeStructures(prev => [...prev, newFs]);
  };

  const recordPayment = (feeId: string, amount: number) => {
    setFeeRecords(prev => prev.map(record => {
      if (record.id === feeId) {
        const newPaid = record.paidAmount + amount;
        const newStatus: 'paid' | 'partial' | 'pending' | 'overdue' =
          newPaid >= record.totalAmount ? 'paid' : newPaid > 0 ? 'partial' : record.status;
        return {
          ...record,
          paidAmount: newPaid,
          status: newStatus,
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return record;
    }));
  };

  const overrideStudentFee = (studentId: string, overrideAmount: number, remarks: string) => {
    setFeeRecords(prev => prev.map(record => {
      if (record.studentId === studentId) {
        return {
          ...record,
          totalAmount: overrideAmount,
          overrideAmount,
          overrideRemarks: remarks,
          status: record.paidAmount >= overrideAmount ? 'paid' : record.paidAmount > 0 ? 'partial' : 'pending'
        };
      }
      return record;
    }));
  };

  // Transport
  const addTransportRoute = (routeData: Omit<TransportRoute, 'id'>) => {
    const newRoute: TransportRoute = { ...routeData, id: `tr-${Date.now()}` };
    setTransportRoutes(prev => [newRoute, ...prev]);
  };

  const updateTransportRoute = (id: string, routeData: Partial<TransportRoute>) => {
    setTransportRoutes(prev => prev.map(r => r.id === id ? { ...r, ...routeData } : r));
  };

  const deleteTransportRoute = (id: string) => {
    setTransportRoutes(prev => prev.filter(r => r.id !== id));
  };

  // Leaves
  const applyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setLeaves(prev => [newLeave, ...prev]);

    // Also add notification for admin
    addNotification({
      type: 'teacher_leave',
      title: 'New Leave Application',
      message: `${leaveData.employeeName} (${leaveData.leaveType}) requested leave for ${leaveData.daysCount} day(s).`,
      priority: 'High',
      actionUrl: 'leaves'
    });
  };

  const approveLeave = (leaveId: string, approvedBy = 'Admin') => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: 'approved', approvedBy };
      }
      return l;
    }));
  };

  const rejectLeave = (leaveId: string, reason: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: 'rejected', rejectionReason: reason, approvedBy: 'Admin' };
      }
      return l;
    }));
  };

  // Circulars
  const addCircular = (circularData: Omit<CircularItem, 'id'>) => {
    const newCirc: CircularItem = { ...circularData, id: `circ-${Date.now()}` };
    setCirculars(prev => [newCirc, ...prev]);

    addNotification({
      type: 'system_circular',
      title: `Circular: ${circularData.title}`,
      message: `Audience: ${circularData.targetAudience} | Priority: ${circularData.priority}`,
      priority: circularData.priority === 'Urgent' ? 'Urgent' : 'Normal',
      actionUrl: 'circulars'
    });
  };

  const deleteCircular = (id: string) => {
    setCirculars(prev => prev.filter(c => c.id !== id));
  };

  // Notifications
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Messages (Chat)
  const sendMessage = (conversationId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: 'admin',
      senderName: 'Admin',
      senderRole: 'admin',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp
        };
      }
      return conv;
    }));
  };

  const markConversationRead = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    setMessages(prev => {
      const convMsgs = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: convMsgs.map(m => ({ ...m, isRead: true }))
      };
    });
  };

  const createConversation = (
    participantId: string,
    participantName: string,
    participantRole: 'Teacher' | 'Student',
    participantClass?: string,
    initialMessage?: string
  ): string => {
    // Check if a conversation already exists
    const existing = conversations.find(c => c.participantId === participantId || c.participantName.toLowerCase() === participantName.toLowerCase());
    if (existing) {
      if (initialMessage && initialMessage.trim()) {
        sendMessage(existing.id, initialMessage.trim());
      }
      return existing.id;
    }

    const newConvId = `conv-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newConv: ChatConversation = {
      id: newConvId,
      participantId,
      participantName,
      participantRole,
      participantClass,
      lastMessage: initialMessage || 'Conversation started',
      lastMessageTime: timestamp,
      unreadCount: 0,
      onlineStatus: true
    };

    setConversations(prev => [newConv, ...prev]);

    if (initialMessage && initialMessage.trim()) {
      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        conversationId: newConvId,
        senderId: 'admin',
        senderName: 'Admin',
        senderRole: 'admin',
        text: initialMessage.trim(),
        timestamp,
        isRead: true
      };
      setMessages(prev => ({
        ...prev,
        [newConvId]: [newMsg]
      }));
    } else {
      setMessages(prev => ({
        ...prev,
        [newConvId]: []
      }));
    }

    return newConvId;
  };

  // Class & Section CRUD
  const addClass = (
    name: string,
    stage: 'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary' = 'Secondary',
    stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General'
  ) => {
    const newId = `c-${Date.now()}`;
    const newClass: SchoolClass = {
      id: newId,
      name,
      stage,
      stream,
      sections: [{
        id: `s-${newId}-a`,
        name: 'A',
        class_id: newId,
        capacity: 40,
        roomNumber: `Room ${name}-A`,
        stream
      }]
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (
    id: string,
    name: string,
    stage?: 'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary',
    stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General'
  ) => {
    setClasses(prev => prev.map(c => c.id === id ? {
      ...c,
      name: name || c.name,
      stage: stage || c.stage,
      stream: stream !== undefined ? stream : c.stream
    } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const addSection = (
    classId: string,
    name: string,
    options?: {
      capacity?: number;
      roomNumber?: string;
      classTeacherId?: string;
      classTeacherName?: string;
      assistantTeacherId?: string;
      assistantTeacherName?: string;
      stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General';
    }
  ) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const newSec: ClassSection = {
          id: `s-${classId}-${name.toLowerCase()}-${Date.now()}`,
          name,
          class_id: classId,
          capacity: options?.capacity || 40,
          roomNumber: options?.roomNumber || `Room ${c.name}-${name}`,
          classTeacherId: options?.classTeacherId,
          classTeacherName: options?.classTeacherName,
          assistantTeacherId: options?.assistantTeacherId,
          assistantTeacherName: options?.assistantTeacherName,
          stream: options?.stream || c.stream
        };
        return { ...c, sections: [...c.sections, newSec] };
      }
      return c;
    }));
  };

  const updateSection = (
    sectionId: string,
    name: string,
    options?: {
      capacity?: number;
      roomNumber?: string;
      classTeacherId?: string;
      classTeacherName?: string;
      assistantTeacherId?: string;
      assistantTeacherName?: string;
      stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General';
    }
  ) => {
    setClasses(prev => prev.map(c => ({
      ...c,
      sections: c.sections.map(s => s.id === sectionId ? {
        ...s,
        name: name || s.name,
        capacity: options?.capacity !== undefined ? options.capacity : s.capacity,
        roomNumber: options?.roomNumber !== undefined ? options.roomNumber : s.roomNumber,
        classTeacherId: options?.classTeacherId !== undefined ? options.classTeacherId : s.classTeacherId,
        classTeacherName: options?.classTeacherName !== undefined ? options.classTeacherName : s.classTeacherName,
        assistantTeacherId: options?.assistantTeacherId !== undefined ? options.assistantTeacherId : s.assistantTeacherId,
        assistantTeacherName: options?.assistantTeacherName !== undefined ? options.assistantTeacherName : s.assistantTeacherName,
        stream: options?.stream !== undefined ? options.stream : s.stream
      } : s)
    })));
  };

  const deleteSection = (sectionId: string) => {
    setClasses(prev => prev.map(c => ({
      ...c,
      sections: c.sections.filter(s => s.id !== sectionId)
    })));
  };

  // Student Section Allocation
  const bulkAssignStudents = (studentIds: string[], targetClass: string, targetSection: string) => {
    setStudents(prev => prev.map(s => {
      if (studentIds.includes(s.id)) {
        return { ...s, class: targetClass, section: targetSection };
      }
      return s;
    }));
    setFeeRecords(prev => prev.map(f => {
      if (studentIds.includes(f.studentId)) {
        return { ...f, class: targetClass, section: targetSection };
      }
      return f;
    }));
  };

  const assignStudentSection = (studentId: string, targetClass: string, targetSection: string) => {
    bulkAssignStudents([studentId], targetClass, targetSection);
  };

  // Subjects CRUD
  const addSubject = (subjectData: Omit<AcademicSubject, 'id'>) => {
    const newSub: AcademicSubject = { ...subjectData, id: `sub-${Date.now()}` };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (id: string, subjectData: Partial<AcademicSubject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...subjectData } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Exams & Results CRUD
  const addExam = (examData: Omit<ExamSchedule, 'id'>) => {
    const newExam: ExamSchedule = { ...examData, id: `exam-${Date.now()}` };
    setExams(prev => [newExam, ...prev]);
  };

  const updateExam = (id: string, examData: Partial<ExamSchedule>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...examData } : e));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const addExamResult = (resultData: Omit<ExamResultRecord, 'id'>) => {
    const newResult: ExamResultRecord = { ...resultData, id: `res-${Date.now()}` };
    setExamResults(prev => [newResult, ...prev]);
  };

  const updateExamResult = (id: string, resultData: Partial<ExamResultRecord>) => {
    setExamResults(prev => prev.map(r => r.id === id ? { ...r, ...resultData } : r));
  };

  // Inventory CRUD
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...itemData, id: `inv-${Date.now()}` };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...itemData } : i));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  // Schools CRUD
  const addSchool = (schoolData: Omit<SchoolProfile, 'id'>) => {
    const newSchool: SchoolProfile = { ...schoolData, id: `sch-${Date.now()}` };
    setSchools(prev => [...prev, newSchool]);
  };

  const updateSchool = (id: string, schoolData: Partial<SchoolProfile>) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, ...schoolData } : s));
  };

  const deleteSchool = (id: string) => {
    setSchools(prev => prev.filter(s => s.id !== id));
  };

  // Departments CRUD
  const addDepartment = (deptData: Omit<DepartmentItem, 'id'>) => {
    const newDept: DepartmentItem = { ...deptData, id: `dept-${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id: string, deptData: Partial<DepartmentItem>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...deptData } : d));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Designations CRUD
  const addDesignation = (desigData: Omit<DesignationItem, 'id'>) => {
    const newDesig: DesignationItem = { ...desigData, id: `desig-${Date.now()}` };
    setDesignations(prev => [...prev, newDesig]);
  };

  const updateDesignation = (id: string, desigData: Partial<DesignationItem>) => {
    setDesignations(prev => prev.map(d => d.id === id ? { ...d, ...desigData } : d));
  };

  const deleteDesignation = (id: string) => {
    setDesignations(prev => prev.filter(d => d.id !== id));
  };

  // Attendance Handlers
  const overrideStudentAttendance = (
    studentId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused',
    remarks?: string,
    overrideBy?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudentAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status,
          isOverridden: true,
          overrideRemarks: remarks || 'Admin manual override',
          overrideBy: overrideBy || 'Admin',
          overrideAt: timeStr,
          source: 'Admin Portal'
        };
        return updated;
      } else {
        const student = students.find(s => s.id === studentId);
        const newRecord: StudentAttendanceRecord = {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
          rollNumber: student?.rollNumber || '',
          class: student?.class || '',
          section: student?.section || '',
          date,
          status,
          markedBy: overrideBy || 'Admin',
          markedByRole: 'Admin',
          markedAt: timeStr,
          source: 'Admin Portal',
          isOverridden: true,
          overrideRemarks: remarks || 'Admin manual entry',
          overrideBy: overrideBy || 'Admin',
          overrideAt: timeStr
        };
        return [newRecord, ...prev];
      }
    });
  };

  const bulkMarkStudentAttendance = (
    records: Array<{ studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused' }>,
    className: string,
    sectionName: string,
    date: string,
    markedBy: string = 'Admin'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudentAttendance(prev => {
      const updated = [...prev];
      records.forEach(rec => {
        const idx = updated.findIndex(a => a.studentId === rec.studentId && a.date === date);
        const stu = students.find(s => s.id === rec.studentId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            status: rec.status,
            isOverridden: true,
            overrideRemarks: 'Bulk updated by Admin',
            overrideBy: markedBy,
            overrideAt: timeStr
          };
        } else {
          updated.unshift({
            id: `att-${Date.now()}-${rec.studentId}`,
            studentId: rec.studentId,
            studentName: stu ? `${stu.firstName} ${stu.lastName}` : 'Student',
            rollNumber: stu?.rollNumber || '',
            class: className,
            section: sectionName,
            date,
            status: rec.status,
            markedBy,
            markedByRole: 'Admin',
            markedAt: timeStr,
            source: 'Admin Portal',
            isOverridden: true,
            overrideRemarks: 'Bulk marked by Admin',
            overrideBy: markedBy,
            overrideAt: timeStr
          });
        }
      });
      return updated;
    });
  };

  const markStaffAttendance = (
    employeeId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave',
    checkInTime?: string,
    checkOutTime?: string,
    remarks?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffAttendance(prev => {
      const idx = prev.findIndex(a => a.employeeId === employeeId && a.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status,
          checkInTime: checkInTime !== undefined ? checkInTime : updated[idx].checkInTime,
          checkOutTime: checkOutTime !== undefined ? checkOutTime : updated[idx].checkOutTime,
          remarks: remarks !== undefined ? remarks : updated[idx].remarks,
          markedBy: 'Admin Portal',
          markedAt: timeStr
        };
        return updated;
      } else {
        const emp = employees.find(e => e.id === employeeId);
        const newRecord: StaffAttendanceRecord = {
          id: `stf-att-${Date.now()}-${employeeId}`,
          employeeId,
          employeeName: emp ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee') : 'Employee',
          employeeCode: emp?.code || emp?.employeeId || 'EMP',
          role: emp?.role || 'teacher',
          department: emp?.department || '',
          designation: emp?.designation || '',
          date,
          status,
          checkInTime: checkInTime || (status === 'Present' ? '08:00 AM' : undefined),
          checkOutTime: checkOutTime || (status === 'Present' ? '03:30 PM' : undefined),
          markedBy: 'Admin Portal',
          markedAt: timeStr,
          remarks
        };
        return [newRecord, ...prev];
      }
    });
  };

  const bulkMarkStaffAttendance = (
    date: string,
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffAttendance(prev => {
      const updated = [...prev];
      employees.forEach(emp => {
        const idx = updated.findIndex(a => a.employeeId === emp.id && a.date === date);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            status,
            checkInTime: status === 'Present' ? (updated[idx].checkInTime || '08:00 AM') : updated[idx].checkInTime,
            checkOutTime: status === 'Present' ? (updated[idx].checkOutTime || '03:30 PM') : updated[idx].checkOutTime,
            markedBy: 'Admin Bulk Action',
            markedAt: timeStr
          };
        } else {
          updated.unshift({
            id: `stf-att-${Date.now()}-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
            employeeCode: emp.code || emp.employeeId || 'EMP',
            role: emp.role,
            department: emp.department,
            designation: emp.designation,
            date,
            status,
            checkInTime: status === 'Present' ? '08:00 AM' : undefined,
            checkOutTime: status === 'Present' ? '03:30 PM' : undefined,
            markedBy: 'Admin Bulk Action',
            markedAt: timeStr
          });
        }
      });
      return updated;
    });
  };

  return (
    <DataContext.Provider
      value={{
        studentAttendance,
        staffAttendance,
        overrideStudentAttendance,
        bulkMarkStudentAttendance,
        markStaffAttendance,
        bulkMarkStaffAttendance,
        classes,
        addClass,
        updateClass,
        deleteClass,
        addSection,
        updateSection,
        deleteSection,
        bulkAssignStudents,
        assignStudentSection,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        exams,
        addExam,
        updateExam,
        deleteExam,
        examResults,
        addExamResult,
        updateExamResult,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        schools,
        addSchool,
        updateSchool,
        deleteSchool,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        designations,
        addDesignation,
        updateDesignation,
        deleteDesignation,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        employees,
        teachers,
        staff,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        feeStructures,
        updateFeeStructure,
        addFeeStructure,
        feeRecords,
        recordPayment,
        overrideStudentFee,
        syncFeeRecordForStudent: syncFeeRecord,
        computeCompositeFee,
        transportRoutes,
        drivers,
        addTransportRoute,
        updateTransportRoute,
        deleteTransportRoute,
        leaves,
        applyLeave,
        approveLeave,
        rejectLeave,
        circulars,
        addCircular,
        deleteCircular,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        conversations,
        messages,
        sendMessage,
        markConversationRead,
        createConversation
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

