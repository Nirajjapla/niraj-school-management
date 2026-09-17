import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowRightLeft,
  UserCheck,
  Clock,
  Building,
  CheckCircle2,
  X,
  Phone,
  ChevronRight,
  Calendar,
  Download,
  Printer,
  Sparkles
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AcademicSubject, ClassSection, SchoolClass, Student, Employee } from '../services/centralData';

type MainPillarTab = 'class_mgmt' | 'student_assignment' | 'teacher_assignment' | 'timetable';
type TeacherSubTab = 'class_teachers' | 'subject_matrix' | 'workload_monitor';

export interface TimetableSlotData {
  subjectName: string;
  teacherName: string;
  roomNumber: string;
  subjectType?: string;
}

const AcademicManagement: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    addSection,
    updateSection,
    deleteSection,
    students,
    bulkAssignStudents,
    assignStudentSection,
    subjects: allSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    teachers
  } = useData();

  // Active Main Pillar Tab
  const [activePillar, setActivePillar] = useState<MainPillarTab>('class_mgmt');

  // Teacher Sub-Tab
  const [teacherSubTab, setTeacherSubTab] = useState<TeacherSubTab>('class_teachers');

  // Selected Class & Section filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c-10');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState<string>('');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showBulkTransferModal, setShowBulkTransferModal] = useState(false);
  const [showChangeClassTeacherModal, setShowChangeClassTeacherModal] = useState(false);
  const [showChangeAssistantTeacherModal, setShowChangeAssistantTeacherModal] = useState(false);
  const [showAssignSubjectTeacherModal, setShowAssignSubjectTeacherModal] = useState(false);
  const [showEditTimetableSlotModal, setShowEditTimetableSlotModal] = useState(false);

  // Form states for Class
  const [classFormName, setClassFormName] = useState('');
  const [classFormStage, setClassFormStage] = useState<'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary'>('Secondary');
  const [classFormStream, setClassFormStream] = useState<'Science' | 'Commerce' | 'Arts / Humanities' | 'General'>('Science');
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Form states for Section
  const [sectionFormName, setSectionFormName] = useState('');
  const [sectionFormCapacity, setSectionFormCapacity] = useState<number>(40);
  const [sectionFormRoom, setSectionFormRoom] = useState('');
  const [sectionFormTeacherId, setSectionFormTeacherId] = useState('');
  const [sectionFormAssistantTeacherId, setSectionFormAssistantTeacherId] = useState('');
  const [sectionFormStream, setSectionFormStream] = useState<'Science' | 'Commerce' | 'Arts / Humanities' | 'General'>('Science');
  const [editingSection, setEditingSection] = useState<ClassSection | null>(null);

  // Form states for Subject
  const [subjectFormName, setSubjectFormName] = useState('');
  const [subjectFormCode, setSubjectFormCode] = useState('');
  const [subjectFormType, setSubjectFormType] = useState<'Core' | 'Elective' | 'Language' | 'Practical' | 'Co-Scholastic'>('Core');
  const [subjectFormSection, setSubjectFormSection] = useState('All');
  const [subjectFormHours, setSubjectFormHours] = useState<number>(4);
  const [subjectFormMaxMarks, setSubjectFormMaxMarks] = useState<number>(100);
  const [subjectFormPrimaryTeacherId, setSubjectFormPrimaryTeacherId] = useState('');
  const [subjectFormCoTeacherId, setSubjectFormCoTeacherId] = useState('');
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);

  // Form state for Changing Class / Assistant Teacher
  const [targetClassForTeacher, setTargetClassForTeacher] = useState<SchoolClass | null>(null);
  const [targetSectionForTeacher, setTargetSectionForTeacher] = useState<ClassSection | null>(null);
  const [newClassTeacherId, setNewClassTeacherId] = useState<string>('');
  const [newAssistantTeacherId, setNewAssistantTeacherId] = useState<string>('');

  // Timetable State & Form
  const [timetableSectionFilter, setTimetableSectionFilter] = useState<string>('A');
  const [timetableCustomSlots, setTimetableCustomSlots] = useState<Record<string, TimetableSlotData>>({});
  const [editingSlotKey, setEditingSlotKey] = useState<string>('');
  const [editingSlotDay, setEditingSlotDay] = useState<string>('');
  const [editingSlotPeriod, setEditingSlotPeriod] = useState<string>('');
  const [slotSubjectName, setSlotSubjectName] = useState<string>('');
  const [slotTeacherName, setSlotTeacherName] = useState<string>('');
  const [slotRoomNumber, setSlotRoomNumber] = useState<string>('');

  // Selection state for Student Allocation
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [targetTransferClass, setTargetTransferClass] = useState('');
  const [targetTransferSection, setTargetTransferSection] = useState('');

  // Feedback banner
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Helper getters
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classSections = selectedClass?.sections || [];

  // Students belonging to selected class
  const classStudents = students.filter(s => s.class === selectedClass?.name || s.class === selectedClassId);
  const filteredStudents = classStudents.filter(s => {
    const matchesSection = selectedSectionFilter === 'all' || s.section.toUpperCase() === selectedSectionFilter.toUpperCase();
    const matchesSearch = !searchQuery ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Filtered classes by stage
  const filteredClasses = classes.filter(c => {
    if (stageFilter === 'All') return true;
    return c.stage.toLowerCase() === stageFilter.toLowerCase();
  });

  // Subjects belonging to selected class
  const classSubjects = allSubjects.filter(s => s.classId === selectedClass?.id || s.className === selectedClass?.name);

  // Section occupancy helper
  const getSectionStudentCount = (className: string, sectionName: string) => {
    return students.filter(s => s.class === className && s.section.toUpperCase() === sectionName.toUpperCase()).length;
  };

  // Teacher teaching load calculation
  const getTeacherWeeklyLoad = (teacherId: string) => {
    return allSubjects
      .filter(s => s.teacherId === teacherId || s.coTeacherId === teacherId)
      .reduce((acc, curr) => acc + (curr.weeklyHours || 0), 0);
  };

  const getTeacherAssignedSubjects = (teacherId: string) => {
    return allSubjects.filter(s => s.teacherId === teacherId || s.coTeacherId === teacherId);
  };

  const getTeacherAssignedClassSections = (teacherId: string) => {
    const result: { className: string; sectionName: string; roomNumber?: string }[] = [];
    classes.forEach(c => {
      c.sections.forEach(sec => {
        if (sec.classTeacherId === teacherId) {
          result.push({ className: c.name, sectionName: sec.name, roomNumber: sec.roomNumber });
        }
      });
    });
    return result;
  };

  // ---------------- Handlers for Class ----------------
  const handleOpenAddClass = () => {
    setClassFormName('');
    setClassFormStage('Secondary');
    setClassFormStream('Science');
    setShowAddClassModal(true);
  };

  const handleSaveAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormName.trim()) return;
    const streamToSave = classFormStage === 'Senior Secondary' || ['11', '12'].includes(classFormName.trim()) ? classFormStream : undefined;
    addClass(classFormName.trim(), classFormStage, streamToSave);
    showToast(`Class "${classFormName.trim()}" created successfully!`);
    setShowAddClassModal(false);
  };

  const handleOpenEditClass = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassFormName(cls.name);
    setClassFormStage(cls.stage);
    setClassFormStream(cls.stream || 'Science');
    setShowEditClassModal(true);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !classFormName.trim()) return;
    const streamToSave = classFormStage === 'Senior Secondary' || ['11', '12'].includes(classFormName.trim()) ? classFormStream : undefined;
    updateClass(editingClass.id, classFormName.trim(), classFormStage, streamToSave);
    showToast(`Class updated to "${classFormName.trim()}"`);
    setShowEditClassModal(false);
  };

  const handleDeleteClassConfirm = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? All associated sections will be affected.')) {
      deleteClass(id);
      showToast('Class deleted.');
      if (selectedClassId === id) {
        const remaining = classes.filter(c => c.id !== id);
        if (remaining.length > 0) setSelectedClassId(remaining[0].id);
      }
    }
  };

  // ---------------- Handlers for Section ----------------
  const handleOpenAddSection = () => {
    if (!selectedClass) return;
    setSectionFormName('');
    setSectionFormCapacity(40);
    setSectionFormRoom(`Room ${selectedClass.name}-`);
    setSectionFormTeacherId('');
    setSectionFormAssistantTeacherId('');
    setSectionFormStream(selectedClass.stream || 'Science');
    setShowAddSectionModal(true);
  };

  const handleSaveAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !sectionFormName.trim()) return;
    const teacherObj = teachers.find(t => t.id === sectionFormTeacherId);
    const assistantObj = teachers.find(t => t.id === sectionFormAssistantTeacherId);
    const streamToSave = selectedClass.stage === 'Senior Secondary' || ['11', '12'].includes(selectedClass.name) ? sectionFormStream : undefined;

    addSection(selectedClass.id, sectionFormName.trim().toUpperCase(), {
      capacity: Number(sectionFormCapacity) || 40,
      roomNumber: sectionFormRoom.trim() || `Room ${selectedClass.name}-${sectionFormName.trim().toUpperCase()}`,
      classTeacherId: sectionFormTeacherId || undefined,
      classTeacherName: teacherObj ? teacherObj.name : undefined,
      assistantTeacherId: sectionFormAssistantTeacherId || undefined,
      assistantTeacherName: assistantObj ? assistantObj.name : undefined,
      stream: streamToSave
    });
    showToast(`Section ${sectionFormName.trim().toUpperCase()} added to Class ${selectedClass.name}`);
    setShowAddSectionModal(false);
  };

  const handleOpenEditSection = (sec: ClassSection) => {
    setEditingSection(sec);
    setSectionFormName(sec.name);
    setSectionFormCapacity(sec.capacity || 40);
    setSectionFormRoom(sec.roomNumber || `Room ${selectedClass?.name}-${sec.name}`);
    setSectionFormTeacherId(sec.classTeacherId || '');
    setSectionFormAssistantTeacherId(sec.assistantTeacherId || '');
    setSectionFormStream(sec.stream || selectedClass?.stream || 'Science');
    setShowEditSectionModal(true);
  };

  const handleSaveEditSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !sectionFormName.trim()) return;
    const teacherObj = teachers.find(t => t.id === sectionFormTeacherId);
    const assistantObj = teachers.find(t => t.id === sectionFormAssistantTeacherId);
    const streamToSave = selectedClass?.stage === 'Senior Secondary' || ['11', '12'].includes(selectedClass?.name || '') ? sectionFormStream : undefined;

    updateSection(editingSection.id, sectionFormName.trim().toUpperCase(), {
      capacity: Number(sectionFormCapacity) || 40,
      roomNumber: sectionFormRoom.trim(),
      classTeacherId: sectionFormTeacherId || undefined,
      classTeacherName: teacherObj ? teacherObj.name : undefined,
      assistantTeacherId: sectionFormAssistantTeacherId || undefined,
      assistantTeacherName: assistantObj ? assistantObj.name : undefined,
      stream: streamToSave
    });
    showToast(`Section ${sectionFormName.trim().toUpperCase()} settings updated`);
    setShowEditSectionModal(false);
  };

  const handleDeleteSectionConfirm = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteSection(sectionId);
      showToast('Section deleted.');
    }
  };

  // ---------------- Handlers for Assistant Teacher ----------------
  const handleOpenChangeAssistantTeacher = (cls: SchoolClass, sec: ClassSection) => {
    setTargetClassForTeacher(cls);
    setTargetSectionForTeacher(sec);
    setNewAssistantTeacherId(sec.assistantTeacherId || '');
    setShowChangeAssistantTeacherModal(true);
  };

  const handleSaveChangeAssistantTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForTeacher || !targetSectionForTeacher) return;
    const teacherObj = teachers.find(t => t.id === newAssistantTeacherId);
    updateSection(targetSectionForTeacher.id, targetSectionForTeacher.name, {
      capacity: targetSectionForTeacher.capacity,
      roomNumber: targetSectionForTeacher.roomNumber,
      classTeacherId: targetSectionForTeacher.classTeacherId,
      classTeacherName: targetSectionForTeacher.classTeacherName,
      assistantTeacherId: newAssistantTeacherId || undefined,
      assistantTeacherName: teacherObj ? teacherObj.name : undefined,
      stream: targetSectionForTeacher.stream
    });
    showToast(`Assistant Teacher for ${targetClassForTeacher.name}-${targetSectionForTeacher.name} updated to ${teacherObj ? teacherObj.name : 'Unassigned'}`);
    setShowChangeAssistantTeacherModal(false);
  };

  // ---------------- Timetable Slot Handlers ----------------
  const timetableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timetablePeriods = [
    { period: 'P1', time: '08:30 - 09:15', label: 'Period 1' },
    { period: 'P2', time: '09:15 - 10:00', label: 'Period 2' },
    { period: 'P3', time: '10:00 - 10:45', label: 'Period 3' },
    { period: 'P4', time: '10:45 - 11:30', label: 'Period 4' },
    { period: 'Break', time: '11:30 - 12:00', label: 'Recess / Lunch', isBreak: true },
    { period: 'P5', time: '12:00 - 12:45', label: 'Period 5' },
    { period: 'P6', time: '12:45 - 01:30', label: 'Period 6' },
    { period: 'P7', time: '01:30 - 02:15', label: 'Period 7' },
    { period: 'P8', time: '02:15 - 03:00', label: 'Period 8' }
  ];

  const getTimetableSlot = (classId: string, sectionName: string, day: string, periodIndex: number): TimetableSlotData => {
    const key = `${classId}-${sectionName}-${day}-${periodIndex}`;
    if (timetableCustomSlots[key]) {
      return timetableCustomSlots[key];
    }
    // Dynamic deterministic fallback based on class subjects
    const subjectsForClass = allSubjects.filter(s => s.classId === classId || s.className === selectedClass?.name);
    if (subjectsForClass.length === 0) {
      return {
        subjectName: 'Self Study / Activity',
        teacherName: 'Class Mentor',
        roomNumber: `Room ${selectedClass?.name || '10'}-${sectionName}`
      };
    }
    const dayIndex = timetableDays.indexOf(day);
    const subIdx = (dayIndex * 3 + periodIndex) % subjectsForClass.length;
    const sub = subjectsForClass[subIdx];
    return {
      subjectName: sub.name,
      teacherName: sub.teacherName || 'Faculty',
      roomNumber: `Room ${selectedClass?.name || '10'}-${sectionName}`,
      subjectType: sub.subjectType
    };
  };

  const handleOpenEditSlot = (day: string, periodIndex: number, periodLabel: string) => {
    const current = getTimetableSlot(selectedClassId, timetableSectionFilter, day, periodIndex);
    const key = `${selectedClassId}-${timetableSectionFilter}-${day}-${periodIndex}`;
    setEditingSlotKey(key);
    setEditingSlotDay(day);
    setEditingSlotPeriod(periodLabel);
    setSlotSubjectName(current.subjectName);
    setSlotTeacherName(current.teacherName);
    setSlotRoomNumber(current.roomNumber);
    setShowEditTimetableSlotModal(true);
  };

  const handleSaveTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlotKey) return;
    setTimetableCustomSlots(prev => ({
      ...prev,
      [editingSlotKey]: {
        subjectName: slotSubjectName.trim() || 'Period Slot',
        teacherName: slotTeacherName.trim() || 'Assigned Faculty',
        roomNumber: slotRoomNumber.trim() || `Room ${selectedClass?.name}-${timetableSectionFilter}`
      }
    }));
    showToast(`Timetable slot updated for ${editingSlotDay} - ${editingSlotPeriod}`);
    setShowEditTimetableSlotModal(false);
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  // ---------------- Handlers for Student Allocation ----------------
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleInlineSectionChange = (student: Student, newSec: string) => {
    assignStudentSection(student.id, student.class, newSec);
    showToast(`${student.firstName} ${student.lastName} moved to Section ${newSec}`);
  };

  const handleOpenBulkTransfer = () => {
    if (selectedStudentIds.length === 0) return;
    setTargetTransferClass(selectedClass?.name || '10');
    setTargetTransferSection(classSections[0]?.name || 'A');
    setShowBulkTransferModal(true);
  };

  const handleSaveBulkTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTransferClass || !targetTransferSection) return;
    bulkAssignStudents(selectedStudentIds, targetTransferClass, targetTransferSection);
    showToast(`Successfully transferred ${selectedStudentIds.length} students to Class ${targetTransferClass} - Sec ${targetTransferSection}`);
    setSelectedStudentIds([]);
    setShowBulkTransferModal(false);
  };

  // ---------------- Handlers for Subjects ----------------
  const handleOpenAddSubject = () => {
    if (!selectedClass) return;
    setSubjectFormName('');
    setSubjectFormCode('');
    setSubjectFormType('Core');
    setSubjectFormSection('All');
    setSubjectFormHours(4);
    setSubjectFormMaxMarks(100);
    setSubjectFormPrimaryTeacherId('');
    setSubjectFormCoTeacherId('');
    setShowAddSubjectModal(true);
  };

  const handleSaveAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !subjectFormName.trim()) return;

    const codeGenerated = subjectFormCode.trim() || `${subjectFormName.trim().slice(0, 4).toUpperCase()}-${selectedClass.name}`;
    const primaryTeacher = teachers.find(t => t.id === subjectFormPrimaryTeacherId);
    const coTeacher = teachers.find(t => t.id === subjectFormCoTeacherId);

    addSubject({
      name: subjectFormName.trim(),
      code: codeGenerated,
      classId: selectedClass.id,
      className: selectedClass.name,
      sectionName: subjectFormSection === 'All' ? undefined : subjectFormSection,
      teacherId: subjectFormPrimaryTeacherId || undefined,
      teacherName: primaryTeacher ? primaryTeacher.name : undefined,
      coTeacherId: subjectFormCoTeacherId || undefined,
      coTeacherName: coTeacher ? coTeacher.name : undefined,
      weeklyHours: Number(subjectFormHours) || 4,
      subjectType: subjectFormType,
      maxMarks: Number(subjectFormMaxMarks) || 100
    });

    showToast(`Subject "${subjectFormName.trim()}" added to Class ${selectedClass.name}`);
    setShowAddSubjectModal(false);
  };

  const handleOpenEditSubject = (sub: AcademicSubject) => {
    setEditingSubject(sub);
    setSubjectFormName(sub.name);
    setSubjectFormCode(sub.code);
    setSubjectFormType(sub.subjectType || 'Core');
    setSubjectFormSection(sub.sectionName || 'All');
    setSubjectFormHours(sub.weeklyHours || 4);
    setSubjectFormMaxMarks(sub.maxMarks || 100);
    setSubjectFormPrimaryTeacherId(sub.teacherId || '');
    setSubjectFormCoTeacherId(sub.coTeacherId || '');
    setShowEditSubjectModal(true);
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !subjectFormName.trim() || !selectedClass) return;

    const primaryTeacher = teachers.find(t => t.id === subjectFormPrimaryTeacherId);
    const coTeacher = teachers.find(t => t.id === subjectFormCoTeacherId);

    updateSubject(editingSubject.id, {
      name: subjectFormName.trim(),
      code: subjectFormCode.trim() || editingSubject.code,
      subjectType: subjectFormType,
      sectionName: subjectFormSection === 'All' ? undefined : subjectFormSection,
      weeklyHours: Number(subjectFormHours) || 4,
      maxMarks: Number(subjectFormMaxMarks) || 100,
      teacherId: subjectFormPrimaryTeacherId || undefined,
      teacherName: primaryTeacher ? primaryTeacher.name : undefined,
      coTeacherId: subjectFormCoTeacherId || undefined,
      coTeacherName: coTeacher ? coTeacher.name : undefined
    });

    showToast(`Subject "${subjectFormName.trim()}" updated`);
    setShowEditSubjectModal(false);
  };

  const handleDeleteSubjectConfirm = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteSubject(id);
      showToast('Subject deleted.');
    }
  };

  // ---------------- Handlers for Teacher Allocations ----------------
  const handleOpenChangeClassTeacher = (cls: SchoolClass, sec: ClassSection) => {
    setTargetClassForTeacher(cls);
    setTargetSectionForTeacher(sec);
    setNewClassTeacherId(sec.classTeacherId || '');
    setShowChangeClassTeacherModal(true);
  };

  const handleSaveChangeClassTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForTeacher || !targetSectionForTeacher) return;
    const teacherObj = teachers.find(t => t.id === newClassTeacherId);
    updateSection(targetSectionForTeacher.id, targetSectionForTeacher.name, {
      capacity: targetSectionForTeacher.capacity,
      roomNumber: targetSectionForTeacher.roomNumber,
      classTeacherId: newClassTeacherId || undefined,
      classTeacherName: teacherObj ? teacherObj.name : undefined
    });
    showToast(`Class Teacher for ${targetClassForTeacher.name}-${targetSectionForTeacher.name} updated to ${teacherObj ? teacherObj.name : 'Unassigned'}`);
    setShowChangeClassTeacherModal(false);
  };

  const handleOpenAssignSubjectTeacher = (sub: AcademicSubject) => {
    setEditingSubject(sub);
    setSubjectFormPrimaryTeacherId(sub.teacherId || '');
    setSubjectFormCoTeacherId(sub.coTeacherId || '');
    setShowAssignSubjectTeacherModal(true);
  };

  const handleSaveAssignSubjectTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const primaryTeacher = teachers.find(t => t.id === subjectFormPrimaryTeacherId);
    const coTeacher = teachers.find(t => t.id === subjectFormCoTeacherId);

    updateSubject(editingSubject.id, {
      teacherId: subjectFormPrimaryTeacherId || undefined,
      teacherName: primaryTeacher ? primaryTeacher.name : undefined,
      coTeacherId: subjectFormCoTeacherId || undefined,
      coTeacherName: coTeacher ? coTeacher.name : undefined
    });

    showToast(`Faculty assigned for ${editingSubject.name}`);
    setShowAssignSubjectTeacherModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{feedbackMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/80 rounded-xl text-[#4e74f9] border border-blue-200 dark:border-blue-900/50">
              <BookOpen className="w-6 h-6" />
            </div>
            <span>Academic Management Hub</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Centrally organize school grade structures, student class allocations, and faculty assignments.
          </p>
        </div>

        {/* Global Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-right shadow-sm hidden md:block">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Total Classes</span>
            <span className="text-base font-black text-gray-900 dark:text-white">{classes.length} Grades</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-right shadow-sm hidden md:block">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Active Students</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">{students.length} Enrolled</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-right shadow-sm hidden md:block">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Teaching Staff</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{teachers.length} Faculty</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4-PILLAR SEGMENTED HERO NAVIGATION SWITCHER */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Class Management */}
        <button
          onClick={() => setActivePillar('class_mgmt')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activePillar === 'class_mgmt'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${activePillar === 'class_mgmt' ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950 text-[#4e74f9]'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
              activePillar === 'class_mgmt' ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950 text-[#4e74f9]'
            }`}>
              {classes.length} Classes
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">1. Class Management</h2>
            <p className={`text-xs mt-1 leading-relaxed ${activePillar === 'class_mgmt' ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'}`}>
              Grades, streams (Sci/Com/Arts), sections & curriculum catalog
            </p>
          </div>
        </button>

        {/* Pillar 2: Student Assignment Management */}
        <button
          onClick={() => setActivePillar('student_assignment')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activePillar === 'student_assignment'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${activePillar === 'student_assignment' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
              activePillar === 'student_assignment' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
            }`}>
              {students.length} Students
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">2. Student Assignment</h2>
            <p className={`text-xs mt-1 leading-relaxed ${activePillar === 'student_assignment' ? 'text-emerald-100' : 'text-gray-500 dark:text-slate-400'}`}>
              Assign students to sections & bulk batch transfers
            </p>
          </div>
        </button>

        {/* Pillar 3: Teacher Assignment Management */}
        <button
          onClick={() => setActivePillar('teacher_assignment')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activePillar === 'teacher_assignment'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-600 shadow-lg shadow-purple-500/25 ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${activePillar === 'teacher_assignment' ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-950 text-purple-600'}`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
              activePillar === 'teacher_assignment' ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-950 text-purple-600'
            }`}>
              {teachers.length} Faculty
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">3. Teacher Allocation</h2>
            <p className={`text-xs mt-1 leading-relaxed ${activePillar === 'teacher_assignment' ? 'text-purple-100' : 'text-gray-500 dark:text-slate-400'}`}>
              Class & Assistant Teachers, multi-subject faculty & load
            </p>
          </div>
        </button>

        {/* Pillar 4: Weekly Class Timetable */}
        <button
          onClick={() => setActivePillar('timetable')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activePillar === 'timetable'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${activePillar === 'timetable' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-600'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
              activePillar === 'timetable' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-600'
            }`}>
              Weekly Grid
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">4. Weekly Timetable</h2>
            <p className={`text-xs mt-1 leading-relaxed ${activePillar === 'timetable' ? 'text-amber-100' : 'text-gray-500 dark:text-slate-400'}`}>
              Interactive period slots, faculty mapping & schedule print
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* PILLAR 1: CLASS MANAGEMENT CANVAS */}
      {/* ========================================================= */}
      {activePillar === 'class_mgmt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Class Directory */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#4e74f9]" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Classes Directory</h3>
                </div>
                <button
                  onClick={handleOpenAddClass}
                  className="px-2.5 py-1.5 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class</span>
                </button>
              </div>

              {/* Stage Filter */}
              <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-gray-100 dark:border-slate-800">
                {['All', 'Pre-Primary', 'Primary', 'Secondary', 'Senior Secondary'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStageFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                      stageFilter === st
                        ? 'bg-blue-100 dark:bg-blue-950 text-[#4e74f9]'
                        : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Classes List */}
              <div className="space-y-2 pt-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredClasses.map(cls => {
                  const isSelected = selectedClassId === cls.id;
                  const totalStudentsInClass = students.filter(s => s.class === cls.name || s.class === cls.id).length;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setSelectedSectionFilter('all');
                      }}
                      className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#4e74f9] shadow-sm'
                          : 'bg-gray-50/70 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">Class {cls.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cls.stage === 'Pre-Primary' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                            cls.stage === 'Primary' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                            cls.stage === 'Secondary' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                            'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}>
                            {cls.stage}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                          {cls.sections.length} Sections • {totalStudentsInClass} Enrolled Students
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditClass(cls);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition"
                          title="Edit Class"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClassConfirm(cls.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Canvas: Selected Class Sections & Subjects */}
            <div className="lg:col-span-8 space-y-6">
              {/* Selected Class Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-black text-gray-900 dark:text-white">Class {selectedClass?.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-[#4e74f9]">
                      {selectedClass?.stage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Configuring {selectedClass?.sections.length} sections and {classSubjects.length} subjects for this academic standard
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddSection}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                  <button
                    onClick={handleOpenAddSubject}
                    className="px-3 py-2 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {/* Sub-Card 1: Sections & Classrooms */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Sections & Classrooms ({classSections.length})
                    </h3>
                  </div>
                </div>

                {classSections.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-gray-500">No sections found for this class.</p>
                    <button
                      onClick={handleOpenAddSection}
                      className="mt-2 text-xs font-bold text-[#4e74f9] hover:underline"
                    >
                      + Create Section A
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classSections.map(sec => {
                      const enrolledCount = getSectionStudentCount(selectedClass.name, sec.name);
                      const capacity = sec.capacity || 40;
                      const occupancyPercent = Math.min(100, Math.round((enrolledCount / capacity) * 100));

                      return (
                        <div
                          key={sec.id}
                          className="bg-gray-50/70 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/60 p-4 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center">
                                  {sec.name}
                                </span>
                                <div>
                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Section {sec.name}</h4>
                                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                    {sec.roomNumber || 'No Room Assigned'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditSection(sec)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded-lg transition"
                                  title="Edit Section"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSectionConfirm(sec.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Class Teacher */}
                            <div className="my-2.5 p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                                <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                                  {sec.classTeacherName ? `Teacher: ${sec.classTeacherName}` : 'No Class Teacher Assigned'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleOpenChangeClassTeacher(selectedClass, sec)}
                                className="text-[10px] font-bold text-[#4e74f9] hover:underline"
                              >
                                Change
                              </button>
                            </div>

                            {/* Occupancy bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">Student Occupancy</span>
                                <span className="font-bold text-gray-800 dark:text-slate-200">
                                  {enrolledCount} / {capacity} ({occupancyPercent}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    occupancyPercent >= 90 ? 'bg-rose-500' :
                                    occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${occupancyPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedSectionFilter(sec.name);
                              setActivePillar('student_assignment');
                            }}
                            className="mt-3 w-full py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>View Section {sec.name} Students</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sub-Card 2: Curriculum & Subjects */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Class Subjects & Curriculum ({classSubjects.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleOpenAddSubject}
                    className="text-xs font-bold text-[#4e74f9] hover:underline"
                  >
                    + Add Subject
                  </button>
                </div>

                {classSubjects.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-gray-500">No subjects configured for this class yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 uppercase font-bold text-[10px]">
                          <th className="py-2.5 px-3">Subject Name & Code</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Applicable Section</th>
                          <th className="py-2.5 px-3">Weekly Hours</th>
                          <th className="py-2.5 px-3">Max Marks</th>
                          <th className="py-2.5 px-3">Primary Faculty</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {classSubjects.map(sub => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-gray-900 dark:text-white block">{sub.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{sub.code}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                sub.subjectType === 'Core' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                                sub.subjectType === 'Practical' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                                sub.subjectType === 'Language' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                                'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              }`}>
                                {sub.subjectType || 'Core'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-slate-300 font-semibold">
                              {sub.sectionName ? `Sec ${sub.sectionName}` : 'All Sections'}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-slate-300">
                              {sub.weeklyHours || 4} hrs/wk
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-slate-300 font-semibold">
                              {sub.maxMarks || 100} M
                            </td>
                            <td className="py-3 px-3">
                              {sub.teacherName ? (
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                  {sub.teacherName}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Not Assigned</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditSubject(sub)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition"
                                  title="Edit Subject"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubjectConfirm(sub.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                                  title="Delete Subject"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PILLAR 2: STUDENT ASSIGNMENT MANAGEMENT CANVAS */}
      {/* ========================================================= */}
      {activePillar === 'student_assignment' && (
        <div className="space-y-5">
          {/* Class & Section Switcher Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Class Pill Picker */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Class:</span>
              {classes.map(c => {
                const isSelected = selectedClassId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClassId(c.id);
                      setSelectedSectionFilter('all');
                      setSelectedStudentIds([]);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                    }`}>
                      {c.sections.length} Sec
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section Tabs & Metrics Row */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedSectionFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedSectionFilter === 'all'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                All Sections ({classStudents.length})
              </button>

              {classSections.map(sec => {
                const count = getSectionStudentCount(selectedClass.name, sec.name);
                const isSelected = selectedSectionFilter.toUpperCase() === sec.name.toUpperCase();
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionFilter(sec.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Section {sec.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Summary Pill Chips */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg">
                Normal: {filteredStudents.filter(s => s.category === 'normal').length}
              </span>
              <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg">
                Reservation: {filteredStudents.filter(s => s.category === 'reservation').length}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg">
                Boys: {filteredStudents.filter(s => s.gender === 'Male').length} • Girls: {filteredStudents.filter(s => s.gender === 'Female').length}
              </span>
            </div>
          </div>

          {/* Bulk Action Banner */}
          {selectedStudentIds.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                  {selectedStudentIds.length} student(s) selected for bulk reallocation
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:underline"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleOpenBulkTransfer}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transfer Selected ({selectedStudentIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Student Assignment Roster Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                        onChange={handleSelectAllStudents}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Roll No & ID</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Current Class</th>
                    <th className="py-3 px-3">Assigned Section (Quick Move)</th>
                    <th className="py-3 px-3">Class Teacher</th>
                    <th className="py-3 px-3">Parent Phone</th>
                    <th className="py-3 px-3">Transport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                        No students found matching current filters in Class {selectedClass?.name}.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(stu => {
                      const isSelected = selectedStudentIds.includes(stu.id);
                      return (
                        <tr
                          key={stu.id}
                          className={`transition ${
                            isSelected
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'hover:bg-gray-50/70 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectStudent(stu.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">
                            <span>#{stu.rollNumber}</span>
                            <span className="text-[10px] text-gray-400 block font-normal">{stu.studentId}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-[#4e74f9] font-black text-xs flex items-center justify-center">
                                {stu.firstName[0]}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">
                                  {stu.firstName} {stu.lastName}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {stu.gender} • DOB: {stu.dateOfBirth}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              stu.category === 'reservation'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                            }`}>
                              {stu.category === 'reservation' ? 'Reservation' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-800 dark:text-slate-200">
                            Class {stu.class}
                          </td>
                          <td className="py-3 px-3">
                            {/* Live Interactive Section Switcher */}
                            <select
                              value={stu.section.toUpperCase()}
                              onChange={(e) => handleInlineSectionChange(stu, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                            >
                              {classSections.map(sec => (
                                <option key={sec.id} value={sec.name}>
                                  Section {sec.name} ({sec.roomNumber || 'Room'})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-slate-300 font-medium">
                            {stu.classTeacher || 'Sunita Patel'}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-600 dark:text-slate-400">
                            {stu.parentPhone}
                          </td>
                          <td className="py-3 px-3">
                            {stu.busRouteId ? (
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                Bus {stu.busRouteId}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">Self Transit</span>
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

      {/* ========================================================= */}
      {/* PILLAR 3: TEACHER ASSIGNMENT MANAGEMENT CANVAS */}
      {/* ========================================================= */}
      {activePillar === 'teacher_assignment' && (
        <div className="space-y-6">
          {/* Sub-Tabs Switcher */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 gap-4">
            <button
              onClick={() => setTeacherSubTab('class_teachers')}
              className={`pb-3 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
                teacherSubTab === 'class_teachers'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>1. Class Teacher Assignments</span>
            </button>

            <button
              onClick={() => setTeacherSubTab('subject_matrix')}
              className={`pb-3 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
                teacherSubTab === 'subject_matrix'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. Subject Faculty Allocation Matrix</span>
            </button>

            <button
              onClick={() => setTeacherSubTab('workload_monitor')}
              className={`pb-3 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
                teacherSubTab === 'workload_monitor'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>3. Faculty Workload & Schedule Monitor</span>
            </button>
          </div>

          {/* Sub-View 1: Class Teacher Allocations */}
          {teacherSubTab === 'class_teachers' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Designated Class Teachers</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Assign and oversee primary mentors for each grade section
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.flatMap(cls =>
                  cls.sections.map(sec => {
                    const enrolled = getSectionStudentCount(cls.name, sec.name);
                    const teacherObj = teachers.find(t => t.id === sec.classTeacherId || t.name === sec.classTeacherName);
                    const assistantObj = teachers.find(t => t.id === sec.assistantTeacherId || t.name === sec.assistantTeacherName);

                    return (
                      <div
                        key={`${cls.id}-${sec.id}`}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                  Class {cls.name} - Sec {sec.name}
                                </span>
                                {(sec.stream || cls.stream) && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                    {sec.stream || cls.stream}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 block font-medium mt-0.5">
                                {sec.roomNumber || 'No Room Assigned'} • {enrolled} Students
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600">
                              {cls.stage}
                            </span>
                          </div>

                          {/* Class Teacher */}
                          <div className="py-2.5 flex items-center justify-between border-b border-gray-50 dark:border-slate-800/60">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                                {sec.classTeacherName ? sec.classTeacherName[0] : '?'}
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Class Teacher</span>
                                <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                  {sec.classTeacherName || 'Unassigned'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenChangeClassTeacher(cls, sec)}
                              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              Reassign
                            </button>
                          </div>

                          {/* Assistant Teacher */}
                          <div className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                                {sec.assistantTeacherName ? sec.assistantTeacherName[0] : '—'}
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Assistant / Co-Teacher</span>
                                <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                  {sec.assistantTeacherName || 'None Assigned'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenChangeAssistantTeacher(cls, sec)}
                              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              Reassign
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                          <span>Max: {sec.capacity || 40} Seats</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {enrolled} Enrolled
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Sub-View 2: Subject Faculty Matrix */}
          {teacherSubTab === 'subject_matrix' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Subject Faculty Allocation Matrix</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Map subject curriculum per section with designated subject leads and co-teachers
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-gray-400 uppercase">Filter Class:</span>
                  {classes.slice(0, 6).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedClassId === c.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3">Class & Section</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Primary Teacher</th>
                      <th className="py-3 px-3">Assistant / Co-Teacher</th>
                      <th className="py-3 px-3">Weekly Hours</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                    {allSubjects
                      .filter(s => s.classId === selectedClassId || s.className === selectedClass?.name)
                      .map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            {sub.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-500">
                            {sub.code}
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-700 dark:text-slate-300">
                            Class {sub.className} • {sub.sectionName ? `Sec ${sub.sectionName}` : 'All Sec'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                              {sub.subjectType || 'Core'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {sub.teacherName ? (
                              <span className="font-bold text-purple-600 dark:text-purple-400">
                                {sub.teacherName}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            {sub.coTeacherName || '—'}
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-800 dark:text-slate-200">
                            {sub.weeklyHours || 4} hrs/wk
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenAssignSubjectTeacher(sub)}
                              className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg text-xs font-bold transition"
                            >
                              Assign Faculty
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View 3: Faculty Workload Monitor */}
          {teacherSubTab === 'workload_monitor' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Faculty Weekly Workload Monitor</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Analyze weekly teaching periods, classroom allocations, and workload balance
                  </p>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={teacherSearchQuery}
                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers
                  .filter(t => !teacherSearchQuery || t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                  .map(tch => {
                    const totalHours = getTeacherWeeklyLoad(tch.id);
                    const assignedSubjects = getTeacherAssignedSubjects(tch.id);
                    const classSecs = getTeacherAssignedClassSections(tch.id);

                    const workloadStatus = totalHours > 24 ? 'Heavy Load' : totalHours >= 16 ? 'Optimal' : 'Light Load';

                    return (
                      <div
                        key={tch.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-sm">
                                {tch.name[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{tch.name}</h4>
                                <span className="text-[11px] text-gray-400 block">{tch.designation}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              workloadStatus === 'Heavy Load' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' :
                              workloadStatus === 'Optimal' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                              'bg-blue-100 dark:bg-blue-950 text-blue-600'
                            }`}>
                              {workloadStatus}
                            </span>
                          </div>

                          {/* Workload Metric */}
                          <div className="py-3.5 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-slate-400 font-medium">Weekly Teaching Load</span>
                              <span className="font-extrabold text-gray-900 dark:text-white">
                                {totalHours} hrs / week
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  totalHours > 24 ? 'bg-rose-500' :
                                  totalHours >= 16 ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(100, (totalHours / 30) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Assigned Classes */}
                          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-gray-400 font-medium">Class Teacher Roles:</span>
                              <span className="font-bold text-gray-800 dark:text-slate-200">
                                {classSecs.length > 0
                                  ? classSecs.map(cs => `${cs.className}-${cs.sectionName}`).join(', ')
                                  : 'None'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-gray-400 font-medium">Subjects Taught:</span>
                              <span className="font-bold text-purple-600 dark:text-purple-400">
                                {assignedSubjects.length} subjects
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {tch.phone}
                          </span>
                          <span className="font-mono">{tch.code}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PILLAR 4: WEEKLY CLASS TIMETABLE MATRIX CANVAS */}
      {/* ========================================================= */}
      {activePillar === 'timetable' && (
        <div className="space-y-6">
          {/* Timetable Header & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Class {selectedClass?.name} - Section {timetableSectionFilter} Master Timetable
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Academic Year 2026-27 • 6 Days (Mon - Sat) • 8 Instructional Periods & Lunch Break
              </p>
            </div>

            {/* Quick Actions & Print */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Section Switcher Pills */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-gray-400 px-2">Section:</span>
                {classSections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setTimetableSectionFilter(sec.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      timetableSectionFilter === sec.name
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:text-slate-400'
                    }`}
                  >
                    Sec {sec.name}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePrintTimetable}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Timetable</span>
              </button>
            </div>
          </div>

          {/* Class Switcher Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 whitespace-nowrap">
              Select Grade:
            </span>
            {classes.map(c => {
              const isSelected = selectedClassId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClassId(c.id);
                    setTimetableSectionFilter(c.sections[0]?.name || 'A');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Class {c.name}</span>
                  {c.stream && (
                    <span className="text-[10px] opacity-90 px-1 py-0.2 rounded bg-black/10">
                      {c.stream}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Weekly Matrix Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4 border-r border-gray-200 dark:border-slate-800 min-w-[100px] sticky left-0 bg-slate-50 dark:bg-slate-800">
                      Day / Period
                    </th>
                    {timetablePeriods.map((p, idx) => (
                      <th
                        key={idx}
                        className={`py-3 px-3 text-center border-r border-gray-200 dark:border-slate-800 ${
                          p.isBreak ? 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 min-w-[80px]' : 'min-w-[135px]'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{p.label}</div>
                        <div className="text-[10px] font-mono text-gray-400 lowercase">{p.time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {timetableDays.map((day) => (
                    <tr key={day} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition">
                      {/* Day Label Sticky Column */}
                      <td className="py-3.5 px-4 font-black text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/90 sticky left-0">
                        {day}
                      </td>

                      {/* Period Slots */}
                      {timetablePeriods.map((periodObj, pIdx) => {
                        if (periodObj.isBreak) {
                          return (
                            <td
                              key={pIdx}
                              className="py-3 px-2 text-center border-r border-gray-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider"
                            >
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/50">☕</span>
                                <span>Recess</span>
                              </div>
                            </td>
                          );
                        }

                        const slotData = getTimetableSlot(selectedClassId, timetableSectionFilter, day, pIdx);

                        return (
                          <td
                            key={pIdx}
                            onClick={() => handleOpenEditSlot(day, pIdx, periodObj.label)}
                            className="py-2.5 px-2.5 border-r border-gray-100 dark:border-slate-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 cursor-pointer transition group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition">
                                  {slotData.subjectName}
                                </span>
                                <Edit className="w-3 h-3 text-gray-300 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition" />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                                <span className="truncate max-w-[85px]">{slotData.teacherName}</span>
                                <span className="font-mono text-[9px] text-gray-400">{slotData.roomNumber}</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Academic Class</h3>
              <button onClick={() => setShowAddClassModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Class Name / Standard (e.g. 10, Nursery, 11)
                </label>
                <input
                  type="text"
                  required
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  placeholder="e.g. 10, 11, Nursery"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Educational Stage
                </label>
                <select
                  value={classFormStage}
                  onChange={(e) => setClassFormStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="Pre-Primary">Pre-Primary (Nursery, LKG, UKG)</option>
                  <option value="Primary">Primary (Classes 1 - 5)</option>
                  <option value="Secondary">Secondary (Classes 6 - 10)</option>
                  <option value="Senior Secondary">Senior Secondary (Classes 11 - 12)</option>
                </select>
              </div>

              {/* Stream selector for Senior Secondary classes */}
              {(classFormStage === 'Senior Secondary' || ['11', '12'].includes(classFormName.trim())) && (
                <div>
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                    Senior Secondary Academic Stream
                  </label>
                  <select
                    value={classFormStream}
                    onChange={(e) => setClassFormStream(e.target.value as any)}
                    className="w-full px-3 py-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Science">Science (Physics, Chemistry, Math / Bio)</option>
                    <option value="Commerce">Commerce (Accountancy, Economics, Business Studies)</option>
                    <option value="Arts / Humanities">Arts / Humanities (History, Pol Sci, Psychology)</option>
                    <option value="General">General Academic Curriculum</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Class Modal */}
      {showEditClassModal && editingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Edit Class {editingClass.name}</h3>
              <button onClick={() => setShowEditClassModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveEditClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Educational Stage
                </label>
                <select
                  value={classFormStage}
                  onChange={(e) => setClassFormStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Senior Secondary">Senior Secondary</option>
                </select>
              </div>

              {/* Stream selector for Senior Secondary */}
              {(classFormStage === 'Senior Secondary' || ['11', '12'].includes(classFormName.trim())) && (
                <div>
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                    Senior Secondary Academic Stream
                  </label>
                  <select
                    value={classFormStream}
                    onChange={(e) => setClassFormStream(e.target.value as any)}
                    className="w-full px-3 py-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Science">Science (Physics, Chemistry, Math / Bio)</option>
                    <option value="Commerce">Commerce (Accountancy, Economics, Business Studies)</option>
                    <option value="Arts / Humanities">Arts / Humanities (History, Pol Sci, Psychology)</option>
                    <option value="General">General Academic Curriculum</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Section Modal */}
      {showAddSectionModal && selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Add Section to Class {selectedClass.name}
                </h3>
                <p className="text-xs text-gray-500">Configure classroom quotas, stream, faculty and linked subjects</p>
              </div>
              <button onClick={() => setShowAddSectionModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveAddSection} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Section Name (e.g. A, B, C)
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionFormName}
                    onChange={(e) => setSectionFormName(e.target.value)}
                    placeholder="e.g. A or B"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    required
                    value={sectionFormCapacity}
                    onChange={(e) => setSectionFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Room Number / Physical Location
                </label>
                <input
                  type="text"
                  value={sectionFormRoom}
                  onChange={(e) => setSectionFormRoom(e.target.value)}
                  placeholder="e.g. Room 102 (Block A)"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Stream selector if Senior Secondary */}
              {(selectedClass.stage === 'Senior Secondary' || ['11', '12'].includes(selectedClass.name)) && (
                <div>
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                    Section Stream
                  </label>
                  <select
                    value={sectionFormStream}
                    onChange={(e) => setSectionFormStream(e.target.value as any)}
                    className="w-full px-3 py-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Science">Science Stream</option>
                    <option value="Commerce">Commerce Stream</option>
                    <option value="Arts / Humanities">Arts / Humanities Stream</option>
                    <option value="General">General Academic Curriculum</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Class Teacher (Primary)
                  </label>
                  <select
                    value={sectionFormTeacherId}
                    onChange={(e) => setSectionFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Class Teacher --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Assistant Teacher
                  </label>
                  <select
                    value={sectionFormAssistantTeacherId}
                    onChange={(e) => setSectionFormAssistantTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Assistant Teacher --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show subjects linked to this class */}
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">
                  Curriculum Subjects Linked to Class {selectedClass.name} ({classSubjects.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {classSubjects.map(sub => (
                    <span key={sub.id} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                      {sub.name} ({sub.code})
                    </span>
                  ))}
                  {classSubjects.length === 0 && (
                    <span className="text-[11px] text-gray-400 italic">No subjects added yet.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 5. Add Subject Modal */}
      {showAddSubjectModal && selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Add Subject to Class {selectedClass.name}
              </h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveAddSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectFormName}
                    onChange={(e) => setSubjectFormName(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectFormCode}
                    onChange={(e) => setSubjectFormCode(e.target.value)}
                    placeholder="e.g. MATH-10"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Type
                  </label>
                  <select
                    value={subjectFormType}
                    onChange={(e) => setSubjectFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="Core">Core</option>
                    <option value="Language">Language</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Co-Scholastic">Co-Scholastic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Applicable Section
                  </label>
                  <select
                    value={subjectFormSection}
                    onChange={(e) => setSubjectFormSection(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="All">All Sections</option>
                    {classSections.map(s => (
                      <option key={s.id} value={s.name}>Section {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Weekly Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={subjectFormHours}
                    onChange={(e) => setSubjectFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Primary Faculty Assigned
                </label>
                <select
                  value={subjectFormPrimaryTeacherId}
                  onChange={(e) => setSubjectFormPrimaryTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department} - {t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Subject Modal */}
      {showEditSubjectModal && editingSubject && selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Edit Subject: {editingSubject.name}
              </h3>
              <button onClick={() => setShowEditSubjectModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectFormName}
                    onChange={(e) => setSubjectFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectFormCode}
                    onChange={(e) => setSubjectFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Subject Type
                  </label>
                  <select
                    value={subjectFormType}
                    onChange={(e) => setSubjectFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="Core">Core</option>
                    <option value="Language">Language</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Co-Scholastic">Co-Scholastic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Applicable Section
                  </label>
                  <select
                    value={subjectFormSection}
                    onChange={(e) => setSubjectFormSection(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="All">All Sections</option>
                    {classSections.map(s => (
                      <option key={s.id} value={s.name}>Section {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Weekly Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={subjectFormHours}
                    onChange={(e) => setSubjectFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Primary Faculty Assigned
                </label>
                <select
                  value={subjectFormPrimaryTeacherId}
                  onChange={(e) => setSubjectFormPrimaryTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department} - {t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditSubjectModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Bulk Transfer Modal */}
      {showBulkTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
                <span>Batch Reallocate Students ({selectedStudentIds.length})</span>
              </h3>
              <button onClick={() => setShowBulkTransferModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveBulkTransfer} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-900 dark:text-emerald-200">
                  You are about to transfer <strong>{selectedStudentIds.length}</strong> selected students to a new standard/section.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Destination Class
                </label>
                <select
                  value={targetTransferClass}
                  onChange={(e) => setTargetTransferClass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>Class {c.name} ({c.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Destination Section
                </label>
                <select
                  value={targetTransferSection}
                  onChange={(e) => setTargetTransferSection(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(classes.find(c => c.name === targetTransferClass)?.sections || [{ name: 'A' }, { name: 'B' }, { name: 'C' }]).map(sec => (
                    <option key={sec.name} value={sec.name}>Section {sec.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBulkTransferModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Execute Batch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Change Class Teacher Modal */}
      {showChangeClassTeacherModal && targetClassForTeacher && targetSectionForTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Designate Class Teacher for {targetClassForTeacher.name}-{targetSectionForTeacher.name}
              </h3>
              <button onClick={() => setShowChangeClassTeacherModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveChangeClassTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Select Faculty
                </label>
                <select
                  value={newClassTeacherId}
                  onChange={(e) => setNewClassTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department} - {t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangeClassTeacherModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Class Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Assign Subject Teacher Modal */}
      {showAssignSubjectTeacherModal && editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Assign Faculty for {editingSubject.name} ({editingSubject.code})
              </h3>
              <button onClick={() => setShowAssignSubjectTeacherModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveAssignSubjectTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Primary Teacher
                </label>
                <select
                  value={subjectFormPrimaryTeacherId}
                  onChange={(e) => setSubjectFormPrimaryTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department} - {t.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Assistant / Co-Teacher (Optional)
                </label>
                <select
                  value={subjectFormCoTeacherId}
                  onChange={(e) => setSubjectFormCoTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- None --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignSubjectTeacherModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Change Assistant Teacher Modal */}
      {showChangeAssistantTeacherModal && targetClassForTeacher && targetSectionForTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Designate Assistant Teacher for {targetClassForTeacher.name}-{targetSectionForTeacher.name}
              </h3>
              <button onClick={() => setShowChangeAssistantTeacherModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveChangeAssistantTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Select Assistant Faculty
                </label>
                <select
                  value={newAssistantTeacherId}
                  onChange={(e) => setNewAssistantTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Unassigned / None --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department} - {t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangeAssistantTeacherModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Assistant Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Edit Timetable Slot Modal */}
      {showEditTimetableSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Edit Timetable Slot
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  {editingSlotDay} • {editingSlotPeriod} (Class {selectedClass?.name}-{timetableSectionFilter})
                </p>
              </div>
              <button onClick={() => setShowEditTimetableSlotModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveTimetableSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={slotSubjectName}
                  onChange={(e) => setSlotSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics / Physics / Science"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Assigned Faculty
                </label>
                <input
                  type="text"
                  required
                  value={slotTeacherName}
                  onChange={(e) => setSlotTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Room / Lab
                </label>
                <input
                  type="text"
                  value={slotRoomNumber}
                  onChange={(e) => setSlotRoomNumber(e.target.value)}
                  placeholder="e.g. Room 101 / Physics Lab"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditTimetableSlotModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicManagement;
