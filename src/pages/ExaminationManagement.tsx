import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Eye,
  FileText,
  Award,
  Clock,
  Calendar,
  BookOpen,
  Users,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  GraduationCap,
  Copy,
  Wand2,
  Settings2,
  AlertCircle,
  ArrowUpDown,
  Check,
  Layers
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ExamSchedule } from '../services/centralData';

interface FormSubjectSlot {
  id?: string;
  subject_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: string;
  passing_marks: string;
  room_number: string;
}

interface ExamGroup {
  key: string;
  name: string;
  classId: string;
  className: string;
  section: string;
  slots: ExamSchedule[];
  slotCount: number;
  startDate: string;
  endDate: string;
  dateRangeStr: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

const TIME_PRESETS = [
  { label: 'Morning (09:00 - 11:30 AM)', start: '09:00 AM', end: '11:30 AM', short: 'Morning (9-11:30)' },
  { label: 'Afternoon (01:30 - 04:00 PM)', start: '01:30 PM', end: '04:00 PM', short: 'Afternoon (1:30-4)' },
  { label: '3-Hour Morning (09:00 AM - 12:00 PM)', start: '09:00 AM', end: '12:00 PM', short: '3-Hour (9-12)' },
  { label: '2-Hour Quick (10:00 AM - 12:00 PM)', start: '10:00 AM', end: '12:00 PM', short: '2-Hour (10-12)' }
];

const ROOM_SUGGESTIONS = [
  'Exam Hall A',
  'Exam Hall B',
  'Main Auditorium',
  'Room 101',
  'Room 102',
  'Room 103',
  'Computer Lab 1',
  'Computer Lab 2',
  'Physics Lab',
  'Chemistry Lab',
  'Biology Lab'
];

const SERIES_PRESETS = [
  'Mid-Term Examination 2026',
  'Unit Assessment Test - 1',
  'Unit Assessment Test - 2',
  'Periodic Assessment 1',
  'Periodic Assessment 2',
  'Half-Yearly Examination 2026',
  'Pre-Board Examination 2026',
  'Annual Final Examination 2027'
];

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
    }
  }
  return dateStr;
}

function getDayName(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }
  return '';
}

function formatDateWithDay(dateStr?: string): string {
  if (!dateStr) return '—';
  const dayName = getDayName(dateStr);
  const formatted = formatDateDisplay(dateStr);
  return dayName ? `${dayName}, ${formatted}` : formatted;
}

function getNextDateString(dateStr: string, incrementDays = 1): string {
  if (!dateStr) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + incrementDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  return dateStr;
}

export const ExaminationManagement: React.FC = () => {
  const {
    exams,
    addExam,
    updateExam,
    deleteExam,
    examResults,
    addExamResult,
    updateExamResult,
    classes,
    subjects,
    students
  } = useData();

  // Navigation Tabs: 'exams' | 'results'
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('all');
  const [selectedResultSlotFilterId, setSelectedResultSlotFilterId] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // View Schedule Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<ExamGroup | null>(null);

  // Multi-Subject Create / Edit Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [examFormHeader, setExamFormHeader] = useState({
    name: 'Mid-Term Examination 2026',
    class_id: classes[0]?.id || '',
    section: 'A',
    status: 'scheduled' as 'scheduled' | 'ongoing' | 'completed'
  });
  const [formSlots, setFormSlots] = useState<FormSubjectSlot[]>([]);

  // Bulk Apply Settings Panel State
  const [showBulkSettings, setShowBulkSettings] = useState(false);
  const [bulkTimePreset, setBulkTimePreset] = useState('09:00 AM - 11:30 AM');
  const [bulkRoom, setBulkRoom] = useState('Exam Hall A');
  const [bulkMaxMarks, setBulkMaxMarks] = useState('100');
  const [bulkPassingMarks, setBulkPassingMarks] = useState('35');

  // Marks Recording Modal State
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedExamSlotId, setSelectedExamSlotId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('All');
  const [marksInputs, setMarksInputs] = useState<Record<string, { marks_obtained: string; max_marks: string }>>({});

  // Report Card View Modal State
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardData, setReportCardData] = useState<any | null>(null);

  // Grouped Exam Schedules for Class & Section Table View
  const examGroups = useMemo<ExamGroup[]>(() => {
    const map = new Map<string, ExamSchedule[]>();

    exams.forEach(slot => {
      const key = `${slot.name || 'Examination'}_${slot.classId || slot.className}_${slot.section || 'All'}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(slot);
    });

    const groups: ExamGroup[] = [];
    map.forEach((slots, key) => {
      // Sort slots chronologically
      slots.sort((a, b) => {
        const dateA = a.examDate || a.startDate || '';
        const dateB = b.examDate || b.startDate || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.startTime || '').localeCompare(b.startTime || '');
      });

      const first = slots[0];
      const dates = slots.map(s => s.examDate || s.startDate || '').filter(Boolean).sort();
      const startDate = dates[0] || '';
      const endDate = dates[dates.length - 1] || startDate;

      let dateRangeStr = '—';
      if (startDate && endDate) {
        dateRangeStr = startDate === endDate
          ? formatDateDisplay(startDate)
          : `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)}`;
      }

      // Group status
      let status: 'scheduled' | 'ongoing' | 'completed' = 'scheduled';
      if (slots.some(s => s.status === 'ongoing')) status = 'ongoing';
      else if (slots.every(s => s.status === 'completed')) status = 'completed';

      groups.push({
        key,
        name: first.name,
        classId: first.classId,
        className: first.className,
        section: first.section || 'All',
        slots,
        slotCount: slots.length,
        startDate,
        endDate,
        dateRangeStr,
        status
      });
    });

    return groups.sort((a, b) => {
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      return a.name.localeCompare(b.name);
    });
  }, [exams]);

  // Available unique exam series/titles for filters
  const availableSeries = useMemo(() => {
    const set = new Set<string>();
    examGroups.forEach(g => {
      if (g.name) set.add(g.name);
    });
    return Array.from(set).sort();
  }, [examGroups]);

  // Available sections for the selected filter class
  const availableFilterSections = useMemo(() => {
    if (selectedClassFilter === 'all') {
      const set = new Set<string>();
      classes.forEach(c => c.sections?.forEach(s => set.add(s.name)));
      return Array.from(set).sort();
    }
    const cls = classes.find(c => c.id === selectedClassFilter || c.name === selectedClassFilter);
    return cls ? cls.sections.map(s => s.name) : [];
  }, [classes, selectedClassFilter]);

  // Available sections for modal class
  const availableModalSections = useMemo(() => {
    const cls = classes.find(c => c.id === examFormHeader.class_id);
    return cls ? cls.sections.map(s => s.name) : [];
  }, [classes, examFormHeader.class_id]);

  // Available subjects for modal class
  const availableModalSubjects = useMemo(() => {
    const cls = classes.find(c => c.id === examFormHeader.class_id);
    if (!cls) return subjects;
    const clsSubjects = subjects.filter(s => s.classId === cls.id || s.className === cls.name);
    return clsSubjects.length > 0 ? clsSubjects : subjects;
  }, [classes, subjects, examFormHeader.class_id]);

  // Timetable Analysis & Validation Metrics
  const timetableMetrics = useMemo(() => {
    const dates = formSlots.map(s => s.exam_date).filter(Boolean).sort();
    const startDate = dates[0] || '';
    const endDate = dates[dates.length - 1] || startDate;

    const dateRangeDisplay = startDate && endDate
      ? (startDate === endDate ? formatDateWithDay(startDate) : `${formatDateWithDay(startDate)} – ${formatDateWithDay(endDate)}`)
      : 'No dates set';

    // Same day paper counts
    const dateCounts: Record<string, number> = {};
    formSlots.forEach(s => {
      if (s.exam_date) {
        dateCounts[s.exam_date] = (dateCounts[s.exam_date] || 0) + 1;
      }
    });

    // Duplicate subjects check
    const subjectCounts: Record<string, number> = {};
    formSlots.forEach(s => {
      if (s.subject_id) {
        subjectCounts[s.subject_id] = (subjectCounts[s.subject_id] || 0) + 1;
      }
    });

    const duplicateSubjects = Object.entries(subjectCounts)
      .filter(([_, count]) => count > 1)
      .map(([id]) => subjects.find(s => s.id === id)?.name || 'Subject');

    // Unique rooms
    const uniqueRooms = Array.from(new Set(formSlots.map(s => s.room_number).filter(Boolean)));

    return {
      totalPapers: formSlots.length,
      startDate,
      endDate,
      dateRangeDisplay,
      dateCounts,
      duplicateSubjects,
      uniqueRooms
    };
  }, [formSlots, subjects]);

  // Filtered Exam Groups for the Main Table
  const filteredExamGroups = useMemo(() => {
    return examGroups.filter(g => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (g.name || '').toLowerCase().includes(q) ||
        (g.className || '').toLowerCase().includes(q) ||
        (g.section || '').toLowerCase().includes(q) ||
        g.slots.some(s => (s.subjectName || '').toLowerCase().includes(q) || (s.subjectCode || '').toLowerCase().includes(q));

      const matchClass =
        selectedClassFilter === 'all' ||
        g.classId === selectedClassFilter ||
        (g.className || '').toLowerCase() === selectedClassFilter.toLowerCase();

      const matchSection =
        selectedSectionFilter === 'all' ||
        (g.section || '').toLowerCase() === selectedSectionFilter.toLowerCase() ||
        g.section === 'All';

      const matchSeries =
        selectedSeriesFilter === 'all' || g.name === selectedSeriesFilter;

      return matchSearch && matchClass && matchSection && matchSeries;
    });
  }, [examGroups, searchTerm, selectedClassFilter, selectedSectionFilter, selectedSeriesFilter]);

  // Open "View Details" Schedule Modal
  const handleOpenViewModal = (group: ExamGroup) => {
    setViewingGroup(group);
    setShowViewModal(true);
  };

  // Open modal for Creating Exam Schedule (Multi-Subject)
  const handleOpenCreateExamModal = () => {
    setEditingGroupKey(null);
    setShowBulkSettings(false);
    const defaultClass = classes[0] || { id: 'c-10', name: '10' };
    const classSubjects = subjects.filter(s => s.classId === defaultClass.id || s.className === defaultClass.name);
    const sub1 = classSubjects[0] || subjects[0] || { id: 'sub-1', name: 'Mathematics' };
    const sub2 = classSubjects[1] || subjects[1] || { id: 'sub-2', name: 'Physics' };

    setExamFormHeader({
      name: availableSeries[0] || 'Mid-Term Examination 2026',
      class_id: defaultClass.id,
      section: 'A',
      status: 'scheduled'
    });

    // Provide initial 2 subject slots for quick convenience
    setFormSlots([
      {
        subject_id: sub1.id,
        exam_date: '2026-09-25',
        start_time: '09:00 AM',
        end_time: '11:30 AM',
        max_marks: '100',
        passing_marks: '35',
        room_number: 'Exam Hall A'
      },
      {
        subject_id: sub2.id,
        exam_date: '2026-09-26',
        start_time: '09:00 AM',
        end_time: '12:00 PM',
        max_marks: '100',
        passing_marks: '35',
        room_number: 'Exam Hall A'
      }
    ]);

    setShowExamModal(true);
  };

  // Open modal for Editing Exam Schedule (Multi-Subject)
  const handleOpenEditExamModal = (group: ExamGroup) => {
    setEditingGroupKey(group.key);
    setShowBulkSettings(false);
    setExamFormHeader({
      name: group.name,
      class_id: group.classId,
      section: group.section || 'All',
      status: group.status
    });

    setFormSlots(
      group.slots.map(s => ({
        id: s.id,
        subject_id: s.subjectId || subjects[0]?.id || '',
        exam_date: s.examDate || s.startDate || '',
        start_time: s.startTime || '09:00 AM',
        end_time: s.endTime || '11:30 AM',
        max_marks: String(s.maxMarks ?? 100),
        passing_marks: String(s.passingMarks ?? 35),
        room_number: s.roomNumber || 'Exam Hall A'
      }))
    );

    setShowExamModal(true);
  };

  // Add a new Subject Slot Row in the Modal with Smart Date Progression
  const handleAddSubjectSlot = () => {
    const lastSlot = formSlots[formSlots.length - 1];
    const unusedSubject = availableModalSubjects.find(
      s => !formSlots.some(slot => slot.subject_id === s.id)
    );
    const subToPick = unusedSubject || availableModalSubjects[0] || subjects[0];

    const nextDate = lastSlot?.exam_date ? getNextDateString(lastSlot.exam_date, 1) : '2026-09-27';

    setFormSlots([
      ...formSlots,
      {
        subject_id: subToPick?.id || '',
        exam_date: nextDate,
        start_time: lastSlot?.start_time || '09:00 AM',
        end_time: lastSlot?.end_time || '11:30 AM',
        max_marks: lastSlot?.max_marks || '100',
        passing_marks: lastSlot?.passing_marks || '35',
        room_number: lastSlot?.room_number || 'Exam Hall A'
      }
    ]);
  };

  // Duplicate a specific Subject Slot (e.g. for afternoon session or next day)
  const handleDuplicateSubjectSlot = (index: number) => {
    const target = formSlots[index];
    if (!target) return;

    // Next time or next date
    const isMorning = (target.start_time || '').includes('09:00') || (target.start_time || '').includes('AM');
    const newStartTime = isMorning ? '01:30 PM' : target.start_time;
    const newEndTime = isMorning ? '04:00 PM' : target.end_time;

    const clonedSlot: FormSubjectSlot = {
      subject_id: target.subject_id,
      exam_date: target.exam_date,
      start_time: newStartTime,
      end_time: newEndTime,
      max_marks: target.max_marks,
      passing_marks: target.passing_marks,
      room_number: target.room_number
    };

    const updated = [...formSlots];
    updated.splice(index + 1, 0, clonedSlot);
    setFormSlots(updated);
    showToast(`Duplicated Paper #${index + 1} as second session/paper.`);
  };

  // 1-Click Auto-Fill All Class Subjects
  const handleAutoFillAllSubjects = () => {
    if (availableModalSubjects.length === 0) {
      alert('No subjects configured for the selected class.');
      return;
    }

    const startDate = formSlots[0]?.exam_date || '2026-09-25';
    let currentDate = startDate;

    const generatedSlots: FormSubjectSlot[] = availableModalSubjects.map((sub, idx) => {
      if (idx > 0) {
        currentDate = getNextDateString(currentDate, 1);
      }
      return {
        subject_id: sub.id,
        exam_date: currentDate,
        start_time: '09:00 AM',
        end_time: '11:30 AM',
        max_marks: sub.maxMarks ? String(sub.maxMarks) : '100',
        passing_marks: '35',
        room_number: formSlots[0]?.room_number || 'Exam Hall A'
      };
    });

    setFormSlots(generatedSlots);
    showToast(`⚡ Automatically loaded ${availableModalSubjects.length} subjects with sequential timetable dates.`);
  };

  // Sort Subject Slots Chronologically by Date and Time
  const handleSortSlotsChronologically = () => {
    const sorted = [...formSlots].sort((a, b) => {
      if (a.exam_date !== b.exam_date) return a.exam_date.localeCompare(b.exam_date);
      return a.start_time.localeCompare(b.start_time);
    });
    setFormSlots(sorted);
    showToast('Sorted papers chronologically by date and start time.');
  };

  // Apply Bulk Settings across all subject papers
  const handleApplyBulkSettings = () => {
    let startTime = '09:00 AM';
    let endTime = '11:30 AM';

    if (bulkTimePreset.includes('-')) {
      const parts = bulkTimePreset.split('-');
      startTime = parts[0].trim();
      endTime = parts[1].trim();
    }

    const updated = formSlots.map(slot => ({
      ...slot,
      start_time: startTime,
      end_time: endTime,
      room_number: bulkRoom.trim() || slot.room_number,
      max_marks: bulkMaxMarks || slot.max_marks,
      passing_marks: bulkPassingMarks || slot.passing_marks
    }));

    setFormSlots(updated);
    setShowBulkSettings(false);
    showToast(`Applied bulk settings across all ${formSlots.length} papers.`);
  };

  // Remove a Subject Slot Row
  const handleRemoveSubjectSlot = (index: number) => {
    if (formSlots.length === 1) {
      alert('An examination schedule must include at least one subject paper.');
      return;
    }
    setFormSlots(formSlots.filter((_, idx) => idx !== index));
  };

  // Update a field in a specific Subject Slot
  const handleSlotChange = (index: number, field: keyof FormSubjectSlot, value: string) => {
    const updated = [...formSlots];
    updated[index] = { ...updated[index], [field]: value };
    setFormSlots(updated);
  };

  // Quick Preset Helper for a single slot
  const handleApplyPresetToSlot = (index: number, preset: { start: string; end: string }) => {
    const updated = [...formSlots];
    updated[index] = {
      ...updated[index],
      start_time: preset.start,
      end_time: preset.end
    };
    setFormSlots(updated);
  };

  // Save the entire Multi-Subject Exam Schedule
  const handleSaveMultiSubjectExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormHeader.name.trim() || !examFormHeader.class_id) {
      alert('Please provide an Examination Name and Target Class.');
      return;
    }

    if (formSlots.length === 0) {
      alert('Please add at least one subject schedule slot.');
      return;
    }

    // Validate slot rows
    for (let i = 0; i < formSlots.length; i++) {
      const slot = formSlots[i];
      if (!slot.subject_id || !slot.exam_date || !slot.start_time || !slot.end_time) {
        alert(`Please complete the Subject, Date, and Time Range for Paper #${i + 1}.`);
        return;
      }
    }

    const cls = classes.find(c => c.id === examFormHeader.class_id);
    const className = cls ? cls.name : '10';

    if (editingGroupKey) {
      // Find old group
      const oldGroup = examGroups.find(g => g.key === editingGroupKey);
      if (oldGroup) {
        // Delete old slots that are no longer present
        const currentSlotIds = new Set(formSlots.map(s => s.id).filter(Boolean));
        oldGroup.slots.forEach(s => {
          if (!currentSlotIds.has(s.id)) {
            deleteExam(s.id);
          }
        });
      }
    }

    // Save/Update each slot
    formSlots.forEach(slot => {
      const sub = subjects.find(s => s.id === slot.subject_id);
      const subjectName = sub ? sub.name : 'Subject';
      const subjectCode = sub ? sub.code : '';
      const startTime = slot.start_time.trim() || '09:00 AM';
      const endTime = slot.end_time.trim() || '11:30 AM';
      const timeRange = `${startTime} - ${endTime}`;

      const payload: Omit<ExamSchedule, 'id'> = {
        name: examFormHeader.name.trim(),
        academicYear: '2026-2027',
        classId: examFormHeader.class_id,
        className,
        section: examFormHeader.section || 'All',
        subjectId: slot.subject_id,
        subjectName,
        subjectCode,
        examDate: slot.exam_date,
        startTime,
        endTime,
        timeRange,
        maxMarks: Number(slot.max_marks) || 100,
        passingMarks: Number(slot.passing_marks) || 35,
        roomNumber: slot.room_number.trim() || 'Exam Hall A',
        status: examFormHeader.status,
        startDate: slot.exam_date,
        endDate: slot.exam_date
      };

      if (slot.id && editingGroupKey) {
        updateExam(slot.id, payload);
      } else {
        addExam(payload);
      }
    });

    showToast(`Successfully saved schedule for Class ${className}-${examFormHeader.section} (${formSlots.length} subjects).`);
    setShowExamModal(false);
  };

  // Delete all slots in an Exam Group
  const handleDeleteGroup = (group: ExamGroup) => {
    if (window.confirm(`Are you sure you want to delete the schedule for "${group.name} - Class ${group.className} (${group.section})"? All ${group.slotCount} subject papers will be removed.`)) {
      group.slots.forEach(s => deleteExam(s.id));
      showToast(`Deleted examination schedule.`);
    }
  };

  // Open Marks Recording Modal for a specific slot
  const handleOpenMarksModal = (slot?: ExamSchedule) => {
    if (exams.length === 0) {
      alert('Please schedule an examination first before recording marks.');
      return;
    }

    const targetSlot = slot || exams[0];
    setSelectedExamSlotId(targetSlot.id);
    setSelectedClassId(targetSlot.classId);
    setSelectedSectionName(targetSlot.section || 'All');
    setSelectedSubjectId(targetSlot.subjectId || subjects[0]?.id || '');

    setShowMarksModal(true);
  };

  // Update inputs when Class / Exam / Subject selected in Marks modal
  useEffect(() => {
    if (!showMarksModal) return;

    const slot = exams.find(e => e.id === selectedExamSlotId);
    const cls = classes.find(c => c.id === selectedClassId);
    const clsName = cls ? cls.name : slot?.className || '';
    const sectionName = selectedSectionName;

    const filteredStudents = students.filter(s => {
      const matchClass = !clsName || (s.class || '').toLowerCase() === clsName.toLowerCase();
      const matchSection = !sectionName || sectionName === 'All' || (s.section || '').toLowerCase() === sectionName.toLowerCase();
      return matchClass && matchSection;
    });

    const maxMarksVal = slot?.maxMarks ? String(slot.maxMarks) : '100';
    const initialInputs: Record<string, { marks_obtained: string; max_marks: string }> = {};
    filteredStudents.forEach(s => {
      const existing = examResults.find(
        r => r.examId === selectedExamSlotId && r.studentId === s.id && (r.subjectId === selectedSubjectId || !selectedSubjectId)
      );
      initialInputs[s.id] = {
        marks_obtained: existing ? String(existing.marksObtained) : '85',
        max_marks: existing ? String(existing.maxMarks) : maxMarksVal
      };
    });
    setMarksInputs(initialInputs);
  }, [showMarksModal, selectedExamSlotId, selectedClassId, selectedSectionName, selectedSubjectId, students, classes, examResults, exams]);

  // Save Recorded Marks
  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamSlotId) {
      alert('Please select an Examination Slot.');
      return;
    }

    const targetSlot = exams.find(ex => ex.id === selectedExamSlotId);
    const targetSubject = subjects.find(sub => sub.id === (targetSlot?.subjectId || selectedSubjectId));

    Object.entries(marksInputs).forEach(([student_id, val]) => {
      const stu = students.find(s => s.id === student_id);
      const obtained = Number(val.marks_obtained) || 0;
      const max = Number(val.max_marks) || 100;
      const pct = max > 0 ? (obtained / max) * 100 : 0;

      let grade = 'F';
      if (pct >= 90) grade = 'A1';
      else if (pct >= 80) grade = 'A2';
      else if (pct >= 70) grade = 'B1';
      else if (pct >= 60) grade = 'B2';
      else if (pct >= 50) grade = 'C';
      else if (pct >= 35) grade = 'D';

      const existing = examResults.find(
        r => r.examId === selectedExamSlotId && r.studentId === student_id && r.subjectId === (targetSlot?.subjectId || selectedSubjectId)
      );

      if (existing) {
        updateExamResult(existing.id, {
          marksObtained: obtained,
          maxMarks: max,
          percentage: Number(pct.toFixed(1)),
          grade
        });
      } else {
        addExamResult({
          examId: selectedExamSlotId,
          examName: targetSlot?.name || 'Examination',
          studentId: student_id,
          studentName: stu ? `${stu.firstName} ${stu.lastName}` : 'Student',
          class: stu?.class || targetSlot?.className || '10',
          section: stu?.section || targetSlot?.section || 'A',
          rollNumber: stu?.rollNumber || '01',
          subjectId: targetSlot?.subjectId || selectedSubjectId,
          subjectName: targetSlot?.subjectName || targetSubject?.name || 'Subject',
          marksObtained: obtained,
          maxMarks: max,
          percentage: Number(pct.toFixed(1)),
          grade
        });
      }
    });

    showToast('Student marks recorded successfully.');
    setShowMarksModal(false);
  };

  // View Student Report Card
  const handleViewReportCard = (examId: string, studentId: string) => {
    const stu = students.find(s => s.id === studentId);
    const ex = exams.find(e => e.id === examId);
    const marks = examResults.filter(r => (r.examId === examId || (ex && r.examName === ex.name)) && r.studentId === studentId);

    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A1';
    else if (percentage >= 80) overallGrade = 'A2';
    else if (percentage >= 70) overallGrade = 'B1';
    else if (percentage >= 60) overallGrade = 'B2';
    else if (percentage >= 50) overallGrade = 'C';
    else if (percentage >= 35) overallGrade = 'D';

    setReportCardData({
      exam: { name: ex?.name || 'Academic Examination' },
      student: {
        user: { name: stu ? `${stu.firstName} ${stu.lastName}` : 'Student' },
        roll_number: stu?.rollNumber || '12',
        class: { name: stu ? `Class ${stu.class}-${stu.section}` : 'Class 10' }
      },
      marks: marks.map(m => ({
        subject: { name: m.subjectName },
        marks_obtained: m.marksObtained,
        max_marks: m.maxMarks
      })),
      summary: {
        percentage: percentage.toFixed(1),
        grade: overallGrade
      }
    });
    setShowReportCardModal(true);
  };

  // Filtered Results
  const displayedResults = useMemo(() => {
    return selectedResultSlotFilterId
      ? examResults.filter(r => r.examId === selectedResultSlotFilterId)
      : examResults;
  }, [examResults, selectedResultSlotFilterId]);

  const filteredResults = useMemo(() => {
    return displayedResults.filter(result => {
      const q = searchTerm.toLowerCase();
      return (
        (result.studentName || '').toLowerCase().includes(q) ||
        (result.subjectName || '').toLowerCase().includes(q) ||
        (result.examName || '').toLowerCase().includes(q) ||
        (result.class || '').toLowerCase().includes(q) ||
        (result.section || '').toLowerCase().includes(q)
      );
    });
  }, [displayedResults, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-800 text-sm font-medium flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examination Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Schedule class & section exam timetables with multi-subject flexibility and manage student scorecards
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'exams' ? (
            <button
              onClick={handleOpenCreateExamModal}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam Schedule</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenMarksModal()}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Marks</span>
            </button>
          )}
        </div>
      </div>

      {/* Common Structure Navigation Pillar Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'exams'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Examinations Schedule</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'exams'
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
            }`}>
              {examGroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Results & Marks</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === 'results'
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
            }`}>
              {examResults.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXAMINATIONS SCHEDULE (CLEAN TABLE + VIEW DETAILS MODAL) */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Action / Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search exam series, class, section, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  setSelectedClassFilter(e.target.value);
                  setSelectedSectionFilter('all');
                }}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Class {c.name}</option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[130px]"
              >
                <option value="all">All Sections</option>
                {availableFilterSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>

              {/* Exam Series Filter */}
              <select
                value={selectedSeriesFilter}
                onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[170px]"
              >
                <option value="all">All Exam Series</option>
                {availableSeries.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Examinations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Exam Series</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class & Section</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Schedule Period</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject Papers</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredExamGroups.map((group) => (
                    <tr key={group.key} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      {/* Exam Series Name */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                          {group.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          Academic Year 2026-2027
                        </span>
                      </td>

                      {/* Class & Section */}
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-medium">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          Class {group.className} {group.section && group.section !== 'All' ? `• Sec ${group.section}` : '(All)'}
                        </span>
                      </td>

                      {/* Schedule Period / Date Range */}
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{group.dateRangeStr}</span>
                        </div>
                      </td>

                      {/* Subject Papers Count */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{group.slotCount} {group.slotCount === 1 ? 'Paper' : 'Papers'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-sm font-normal whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                          group.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : group.status === 'ongoing'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {group.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(group)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-gray-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 transition flex items-center gap-1.5 shadow-sm"
                            title="View granular subject timetable"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditExamModal(group)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                            title="Edit Exam Schedule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredExamGroups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No examination schedules found. Click "Create Exam Schedule" to define subject timetables.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESULTS & MARKS */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Results Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search results by student, subject, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Slot Filter:</label>
              <select
                value={selectedResultSlotFilterId}
                onChange={(e) => setSelectedResultSlotFilterId(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
              >
                <option value="">All Examinations & Slots</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} • {e.subjectName || 'Subject'} (Class {e.className}-{e.section || 'A'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class & Roll</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Examination & Subject</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Marks</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Percentage</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {result.studentName}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                        Class {result.class}-{result.section} • Roll #{result.rollNumber}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                        <span className="font-semibold text-gray-900 dark:text-white block">{result.subjectName}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{result.examName}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-center font-bold text-gray-900 dark:text-white">
                        {result.marksObtained} <span className="text-gray-400 font-normal">/ {result.maxMarks}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                        {result.percentage}%
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          result.grade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : result.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : result.grade === 'C'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleViewReportCard(result.examId, result.studentId)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="View Scorecard"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No examination results found. Click "Record Marks" to input scores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW GRANULAR SCHEDULE DETAILS */}
      {/* ========================================================================= */}
      {showViewModal && viewingGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {viewingGroup.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      Class {viewingGroup.className} • Section {viewingGroup.section}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {viewingGroup.slotCount} Subject Papers Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Timetable & Paper Details
                </h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Supports multiple exams per day</span>
                </span>
              </div>

              <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Exam Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Time Range</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Max Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Room</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {viewingGroup.slots.map((slot) => {
                      const timeRangeStr = slot.timeRange || (slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : '09:00 AM - 11:30 AM');

                      return (
                        <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          {/* Subject */}
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              {slot.subjectName}
                            </span>
                            {slot.subjectCode && (
                              <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                                {slot.subjectCode}
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">{formatDateWithDay(slot.examDate || slot.startDate)}</span>
                            </div>
                          </td>

                          {/* Time Range */}
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-semibold text-gray-800 dark:text-slate-200">{timeRangeStr}</span>
                            </div>
                          </td>

                          {/* Max Marks */}
                          <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                            {slot.maxMarks ?? 100}
                            {slot.passingMarks !== undefined && (
                              <span className="text-xs text-gray-400 block font-normal">Pass: {slot.passingMarks}</span>
                            )}
                          </td>

                          {/* Room */}
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                            {slot.roomNumber || '—'}
                          </td>

                          {/* Quick Marks Action */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setShowViewModal(false);
                                handleOpenMarksModal(slot);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition"
                            >
                              Marks
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEditExamModal(viewingGroup);
                }}
                className="px-4 py-2 border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit This Timetable</span>
              </button>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OPTIMIZED MULTI-SUBJECT EXAM TIMETABLE BUILDER / EDITOR */}
      {/* ========================================================================= */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{editingGroupKey ? 'Edit Examination Timetable' : 'Create Examination Timetable'}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      Multi-Subject
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Define exam series details and timetable schedule across subjects for the target class
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExamModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSaveMultiSubjectExam} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TOP CARD: Exam Series & Class Configuration */}
              <div className="bg-gray-50/80 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                      General Examination Details
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Academic Year 2026-2027
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Exam Series Name */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Exam Series Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mid-Term Examination 2026"
                      value={examFormHeader.name}
                      onChange={(e) => setExamFormHeader({ ...examFormHeader, name: e.target.value })}
                      list="exam-series-options"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    />
                    <datalist id="exam-series-options">
                      {SERIES_PRESETS.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  {/* Target Class */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Target Class *
                    </label>
                    <select
                      required
                      value={examFormHeader.class_id}
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        const cls = classes.find(c => c.id === newClassId);
                        setExamFormHeader({
                          ...examFormHeader,
                          class_id: newClassId,
                          section: cls?.sections[0]?.name || 'A'
                        });
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>Class {cls.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Section *
                    </label>
                    <select
                      required
                      value={examFormHeader.section}
                      onChange={(e) => setExamFormHeader({ ...examFormHeader, section: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    >
                      <option value="All">All Sections</option>
                      {availableModalSections.map((sec) => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Schedule Status *
                    </label>
                    <select
                      value={examFormHeader.status}
                      onChange={(e) => setExamFormHeader({ ...examFormHeader, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TIMETABLE SECTION TOOLBAR & AUTOMATION TOOLS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 pt-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Subject Papers Timetable</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {formSlots.length} {formSlots.length === 1 ? 'Paper' : 'Papers'}
                    </span>
                  </div>

                  {/* Quick Action Tools */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Auto-Fill All Class Subjects Button */}
                    <button
                      type="button"
                      onClick={handleAutoFillAllSubjects}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      title="Automatically populate all subjects belonging to this class with sequential dates"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Auto-Fill All Class Subjects</span>
                    </button>

                    {/* Sort Chronologically Button */}
                    <button
                      type="button"
                      onClick={handleSortSlotsChronologically}
                      className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                      title="Sort papers by date and time"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Sort by Date</span>
                    </button>

                    {/* Bulk Settings Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowBulkSettings(!showBulkSettings)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                        showBulkSettings
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 dark:border-slate-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}
                      title="Configure bulk times, rooms, and marks across all papers"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Bulk Settings</span>
                    </button>

                    {/* Add Single Subject Paper */}
                    <button
                      type="button"
                      onClick={handleAddSubjectSlot}
                      className="px-3 py-1.5 rounded-xl bg-[#4e74f9] hover:bg-[#3b5ccc] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Paper</span>
                    </button>
                  </div>
                </div>

                {/* BULK SETTINGS POP-DOWN PANEL */}
                {showBulkSettings && (
                  <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                          Bulk Apply Settings Across All {formSlots.length} Papers
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBulkSettings(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Time Preset */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                          Standard Time Range
                        </label>
                        <select
                          value={bulkTimePreset}
                          onChange={(e) => setBulkTimePreset(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="09:00 AM - 11:30 AM">Morning (09:00 - 11:30 AM)</option>
                          <option value="01:30 PM - 04:00 PM">Afternoon (01:30 - 04:00 PM)</option>
                          <option value="09:00 AM - 12:00 PM">3-Hour Morning (09:00 - 12:00 PM)</option>
                          <option value="10:00 AM - 12:00 PM">2-Hour Test (10:00 - 12:00 PM)</option>
                        </select>
                      </div>

                      {/* Default Room */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                          Exam Hall / Room
                        </label>
                        <input
                          type="text"
                          value={bulkRoom}
                          onChange={(e) => setBulkRoom(e.target.value)}
                          placeholder="e.g. Exam Hall A"
                          list="bulk-room-suggestions"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <datalist id="bulk-room-suggestions">
                          {ROOM_SUGGESTIONS.map(r => (
                            <option key={r} value={r} />
                          ))}
                        </datalist>
                      </div>

                      {/* Max Marks */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                          Max Marks
                        </label>
                        <input
                          type="number"
                          value={bulkMaxMarks}
                          onChange={(e) => setBulkMaxMarks(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Passing Marks */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                          Passing Marks
                        </label>
                        <input
                          type="number"
                          value={bulkPassingMarks}
                          onChange={(e) => setBulkPassingMarks(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleApplyBulkSettings}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply to All {formSlots.length} Papers</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TIMETABLE SUBJECT PAPER SLOTS CARDS */}
                <div className="space-y-3.5">
                  {formSlots.map((slot, idx) => {
                    const isMultipleOnSameDate = (timetableMetrics.dateCounts[slot.exam_date] || 0) > 1;
                    const dayName = getDayName(slot.exam_date);

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-gray-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-900 shadow-sm space-y-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition"
                      >
                        {/* Slot Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                              Paper #{idx + 1}
                            </span>

                            {/* Date Badge */}
                            {slot.exam_date && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-medium">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{dayName ? `${dayName}, ` : ''}{formatDateDisplay(slot.exam_date)}</span>
                              </span>
                            )}

                            {/* Same Day Multi-Exam Session Badge */}
                            {isMultipleOnSameDate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200/60 dark:border-amber-900/60">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Multi-Session Day</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Actions for this Paper */}
                          <div className="flex items-center gap-1.5">
                            {/* Quick Presets Dropdown */}
                            <div className="hidden sm:flex items-center gap-1 mr-1">
                              {TIME_PRESETS.slice(0, 2).map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => handleApplyPresetToSlot(idx, preset)}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-gray-600 hover:text-blue-600 dark:text-slate-400 transition"
                                  title={`Set time to ${preset.start} - ${preset.end}`}
                                >
                                  {preset.short}
                                </button>
                              ))}
                            </div>

                            {/* Duplicate Button */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateSubjectSlot(idx)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                              title="Duplicate Paper Slot"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove Slot */}
                            {formSlots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSubjectSlot(idx)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                                title="Remove Paper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Slot Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
                          {/* Subject Selector */}
                          <div className="lg:col-span-4">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">
                              Subject *
                            </label>
                            <select
                              required
                              value={slot.subject_id}
                              onChange={(e) => handleSlotChange(idx, 'subject_id', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                            >
                              {availableModalSubjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.name} {sub.code ? `[${sub.code}]` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Exam Date */}
                          <div className="lg:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">
                              Exam Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={slot.exam_date}
                              onChange={(e) => handleSlotChange(idx, 'exam_date', e.target.value)}
                              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                            />
                          </div>

                          {/* Start Time */}
                          <div className="lg:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">
                              Start Time *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="09:00 AM"
                              value={slot.start_time}
                              onChange={(e) => handleSlotChange(idx, 'start_time', e.target.value)}
                              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                            />
                          </div>

                          {/* End Time */}
                          <div className="lg:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">
                              End Time *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="11:30 AM"
                              value={slot.end_time}
                              onChange={(e) => handleSlotChange(idx, 'end_time', e.target.value)}
                              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                            />
                          </div>

                          {/* Marks & Room */}
                          <div className="lg:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">
                              Marks & Room
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                placeholder="Max"
                                title="Maximum Marks"
                                value={slot.max_marks}
                                onChange={(e) => handleSlotChange(idx, 'max_marks', e.target.value)}
                                className="w-14 px-2 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9] text-center"
                              />
                              <input
                                type="text"
                                placeholder="Hall"
                                title="Exam Hall / Room Number"
                                value={slot.room_number}
                                list="room-options-list"
                                onChange={(e) => handleSlotChange(idx, 'room_number', e.target.value)}
                                className="flex-1 px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Datalist for Room Names */}
                <datalist id="room-options-list">
                  {ROOM_SUGGESTIONS.map((rm) => (
                    <option key={rm} value={rm} />
                  ))}
                </datalist>

                {/* Add Another Paper Dashed Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddSubjectSlot}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Subject Paper</span>
                  </button>
                </div>
              </div>

              {/* TIMETABLE SUMMARY & VALIDATION BANNER */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>
                      <strong className="font-bold text-slate-900 dark:text-white">Schedule Span:</strong> {timetableMetrics.dateRangeDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>
                      <strong className="font-bold text-slate-900 dark:text-white">Total Papers:</strong> {timetableMetrics.totalPapers} Subjects
                    </span>
                    {timetableMetrics.uniqueRooms.length > 0 && (
                      <span>
                        <strong className="font-bold text-slate-900 dark:text-white">Venues:</strong> {timetableMetrics.uniqueRooms.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duplicate Subject Warnings */}
                {timetableMetrics.duplicateSubjects.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Note: {timetableMetrics.duplicateSubjects.join(', ')} is scheduled in more than one paper.</span>
                  </div>
                )}
              </div>

              {/* Sticky Action Footer inside Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  Target: <strong className="text-gray-800 dark:text-slate-200">Class {classes.find(c => c.id === examFormHeader.class_id)?.name || '10'} ({examFormHeader.section})</strong>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowExamModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white font-bold rounded-xl transition text-xs shadow-md shadow-blue-500/20"
                  >
                    {editingGroupKey ? 'Save Changes' : 'Save Examination Schedule'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD MARKS MODAL */}
      {/* ========================================================================= */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMarksModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Record Marks for Students</h2>

            <form onSubmit={handleSaveMarks} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">
                    Select Examination Slot *
                  </label>
                  <select
                    required
                    value={selectedExamSlotId}
                    onChange={(e) => {
                      const slotId = e.target.value;
                      setSelectedExamSlotId(slotId);
                      const ex = exams.find(x => x.id === slotId);
                      if (ex) {
                        setSelectedClassId(ex.classId);
                        setSelectedSectionName(ex.section || 'All');
                        if (ex.subjectId) setSelectedSubjectId(ex.subjectId);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} • {ex.subjectName || 'Subject'} (Class {ex.className}-{ex.section || 'A'}, {ex.examDate || ex.startDate} {ex.timeRange ? `[${ex.timeRange}]` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase mb-1">Class & Section</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-slate-200 font-medium">
                    Class {classes.find(c => c.id === selectedClassId)?.name || '10'} • Section {selectedSectionName}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Student Scores</h3>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase">Student Name</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase">Marks Obtained</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {Object.keys(marksInputs).map((student_id) => {
                        const stu = students.find(s => s.id === student_id);
                        const stuName = stu ? `${stu.firstName} ${stu.lastName}` : `Student #${student_id}`;
                        const inputVal = marksInputs[student_id] || { marks_obtained: '0', max_marks: '100' };

                        return (
                          <tr key={student_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-slate-200">
                              {stuName}
                              {stu?.rollNumber && (
                                <span className="text-xs text-gray-400 block">Roll #{stu.rollNumber}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max={inputVal.max_marks}
                                value={inputVal.marks_obtained}
                                onChange={(e) => setMarksInputs({
                                  ...marksInputs,
                                  [student_id]: { ...inputVal, marks_obtained: e.target.value }
                                })}
                                className="w-24 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-center text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={inputVal.max_marks}
                                onChange={(e) => setMarksInputs({
                                  ...marksInputs,
                                  [student_id]: { ...inputVal, max_marks: e.target.value }
                                })}
                                className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-center text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {Object.keys(marksInputs).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-slate-400 text-sm">
                            No students found for the selected class & section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMarksModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(marksInputs).length === 0}
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm shadow-md shadow-blue-500/20"
                >
                  Save Recorded Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REPORT CARD MODAL */}
      {/* ========================================================================= */}
      {showReportCardModal && reportCardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReportCardModal(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-[#4e74f9] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{reportCardData.exam?.name || 'Student Report Card'}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Student: <span className="font-bold text-gray-900 dark:text-white">{reportCardData.student?.user?.name || 'N/A'}</span></p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Roll No: {reportCardData.student?.roll_number || 'N/A'} | Class: {reportCardData.student?.class?.name || 'N/A'}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Subject Breakdown</h3>
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/60 text-xs">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-600 dark:text-slate-300 uppercase">Subject</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-gray-600 dark:text-slate-300 uppercase">Marks</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-gray-600 dark:text-slate-300 uppercase">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {(reportCardData.marks || []).map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{m.subject?.name || 'Subject'}</td>
                        <td className="px-4 py-2.5 text-center text-gray-900 dark:text-white font-bold">{m.marks_obtained}</td>
                        <td className="px-4 py-2.5 text-center text-gray-500 dark:text-slate-400">{m.max_marks}</td>
                      </tr>
                    ))}
                    {(reportCardData.marks || []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-500 dark:text-slate-400">No subject marks available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Overall Percentage</p>
                  <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">{reportCardData.summary?.percentage || '0'}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Overall Grade</p>
                  <span className="px-3 py-1 text-sm font-extrabold bg-[#4e74f9] text-white rounded-lg inline-block mt-0.5 shadow-sm">
                    {reportCardData.summary?.grade || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowReportCardModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Close Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationManagement;
