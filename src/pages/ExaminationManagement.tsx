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
  Layers,
  Sparkles
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ExamSchedule, ExamResultRecord } from '../services/centralData';

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

  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedExamResultFilterId, setSelectedExamResultFilterId] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Exam Form Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    class_id: classes[0]?.id || '',
    section: 'All',
    subject_id: subjects[0]?.id || '',
    exam_date: new Date().toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '11:30 AM',
    max_marks: '100',
    passing_marks: '35',
    room_number: 'Exam Hall A',
    status: 'scheduled' as 'scheduled' | 'ongoing' | 'completed'
  });

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

  // Available unique exam series/titles
  const availableSeries = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => {
      if (e.name) set.add(e.name);
    });
    return Array.from(set).sort();
  }, [exams]);

  // Available unique dates
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => {
      const d = e.examDate || e.startDate;
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [exams]);

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
    const cls = classes.find(c => c.id === examForm.class_id);
    return cls ? cls.sections.map(s => s.name) : [];
  }, [classes, examForm.class_id]);

  // Available subjects for modal class
  const availableModalSubjects = useMemo(() => {
    const cls = classes.find(c => c.id === examForm.class_id);
    if (!cls) return subjects;
    const clsSubjects = subjects.filter(s => s.classId === cls.id || s.className === cls.name);
    return clsSubjects.length > 0 ? clsSubjects : subjects;
  }, [classes, subjects, examForm.class_id]);

  // Open modal for Creating Exam
  const handleOpenCreateExamModal = () => {
    setEditingExam(null);
    const defaultClass = classes[0] || { id: 'c-10', name: '10' };
    const classSubjects = subjects.filter(s => s.classId === defaultClass.id || s.className === defaultClass.name);
    const defaultSubject = classSubjects[0] || subjects[0] || { id: 'sub-1', name: 'Mathematics' };

    setExamForm({
      name: availableSeries[0] || 'Mid-Term Examination 2026',
      class_id: defaultClass.id,
      section: 'A',
      subject_id: defaultSubject.id,
      exam_date: '2026-09-25',
      start_time: '09:00 AM',
      end_time: '11:30 AM',
      max_marks: '100',
      passing_marks: '35',
      room_number: 'Exam Hall A',
      status: 'scheduled'
    });
    setShowExamModal(true);
  };

  // Open modal for Editing Exam
  const handleOpenEditExamModal = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      class_id: exam.classId,
      section: exam.section || 'All',
      subject_id: exam.subjectId || subjects[0]?.id || '',
      exam_date: exam.examDate || exam.startDate || '',
      start_time: exam.startTime || '09:00 AM',
      end_time: exam.endTime || '11:30 AM',
      max_marks: String(exam.maxMarks ?? 100),
      passing_marks: String(exam.passingMarks ?? 35),
      room_number: exam.roomNumber || '',
      status: exam.status
    });
    setShowExamModal(true);
  };

  // Save Exam (Create / Update)
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name || !examForm.class_id || !examForm.subject_id || !examForm.exam_date) {
      alert('Please fill in Exam Name, Class, Subject, and Exam Date.');
      return;
    }

    const cls = classes.find(c => c.id === examForm.class_id);
    const className = cls ? cls.name : '10';
    const sub = subjects.find(s => s.id === examForm.subject_id);
    const subjectName = sub ? sub.name : 'Subject';
    const subjectCode = sub ? sub.code : '';

    const startTime = examForm.start_time.trim() || '09:00 AM';
    const endTime = examForm.end_time.trim() || '11:30 AM';
    const timeRange = `${startTime} - ${endTime}`;

    const payload: Omit<ExamSchedule, 'id'> = {
      name: examForm.name.trim(),
      academicYear: '2026-2027',
      classId: examForm.class_id,
      className,
      section: examForm.section || 'All',
      subjectId: examForm.subject_id,
      subjectName,
      subjectCode,
      examDate: examForm.exam_date,
      startTime,
      endTime,
      timeRange,
      maxMarks: Number(examForm.max_marks) || 100,
      passingMarks: Number(examForm.passing_marks) || 35,
      roomNumber: examForm.room_number.trim(),
      status: examForm.status,
      startDate: examForm.exam_date,
      endDate: examForm.exam_date
    };

    if (editingExam) {
      updateExam(editingExam.id, payload);
      showToast(`Updated examination slot: ${subjectName} (${className}-${examForm.section})`);
    } else {
      addExam(payload);
      showToast(`Scheduled new exam: ${subjectName} (${className}-${examForm.section}) on ${examForm.exam_date}`);
    }

    setShowExamModal(false);
  };

  // Delete Exam
  const handleDeleteExam = (examId: string) => {
    const ex = exams.find(e => e.id === examId);
    if (window.confirm(`Are you sure you want to delete "${ex?.subjectName || ex?.name}" exam schedule?`)) {
      deleteExam(examId);
      showToast(`Exam deleted successfully.`);
    }
  };

  // Open Marks Recording Modal for a specific slot or general
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

  // Filtered & Chronologically Sorted Exams Schedule
  const filteredExams = useMemo(() => {
    return exams
      .filter(exam => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          (exam.name || '').toLowerCase().includes(q) ||
          (exam.subjectName || '').toLowerCase().includes(q) ||
          (exam.subjectCode || '').toLowerCase().includes(q) ||
          (exam.className || '').toLowerCase().includes(q) ||
          (exam.section || '').toLowerCase().includes(q) ||
          (exam.roomNumber || '').toLowerCase().includes(q);

        const matchClass =
          selectedClassFilter === 'all' ||
          exam.classId === selectedClassFilter ||
          (exam.className || '').toLowerCase() === selectedClassFilter.toLowerCase();

        const matchSection =
          selectedSectionFilter === 'all' ||
          (exam.section || '').toLowerCase() === selectedSectionFilter.toLowerCase() ||
          exam.section === 'All';

        const matchSeries =
          selectedSeriesFilter === 'all' || exam.name === selectedSeriesFilter;

        const matchDate =
          selectedDateFilter === 'all' ||
          (exam.examDate || exam.startDate) === selectedDateFilter;

        return matchSearch && matchClass && matchSection && matchSeries && matchDate;
      })
      .sort((a, b) => {
        const dateA = a.examDate || a.startDate || '';
        const dateB = b.examDate || b.startDate || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [exams, searchTerm, selectedClassFilter, selectedSectionFilter, selectedSeriesFilter, selectedDateFilter]);

  // Detection of dates with multiple exams for the same class/section
  const multiExamDatesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredExams.forEach(e => {
      const key = `${e.examDate || e.startDate}_${e.className}_${e.section || 'All'}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.values(counts).filter(c => c > 1).length;
  }, [filteredExams]);

  // Filtered Results
  const displayedResults = useMemo(() => {
    return selectedExamResultFilterId
      ? examResults.filter(r => r.examId === selectedExamResultFilterId)
      : examResults;
  }, [examResults, selectedExamResultFilterId]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examination & Results</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Define granular subject exam timetables with time ranges, class & section flexibility, and manage student scorecards
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'exams' ? (
            <button
              onClick={handleOpenCreateExamModal}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam Slot</span>
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

      {/* Uniform Tab Navigation Pills */}
      <div className="bg-gray-100 dark:bg-slate-800/60 p-1 rounded-xl flex gap-1 w-fit border border-gray-200/50 dark:border-slate-700/50">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm font-semibold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Examinations Schedule</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'exams'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
          }`}>
            {exams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'results'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm font-semibold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Results & Marks</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'results'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
          }`}>
            {examResults.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GRANULAR EXAMINATIONS SCHEDULE */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by subject, series, code, class, room..."
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
                className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Exam Series</option>
                {availableSeries.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Exam Dates</option>
                {availableDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {multiExamDatesCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-exam days active</span>
              </div>
            )}
          </div>

          {/* Granular Examinations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject & Exam Series</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class & Section</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Exam Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Time Range</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Max Marks</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Room / Hall</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredExams.map((exam) => {
                    const examDateStr = exam.examDate || exam.startDate || '—';
                    const timeRangeStr = exam.timeRange || (exam.startTime && exam.endTime ? `${exam.startTime} - ${exam.endTime}` : '09:00 AM - 11:30 AM');

                    return (
                      <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                        {/* Subject & Exam Series */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {exam.subjectName || exam.name}
                              </span>
                              {exam.subjectCode && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded text-xs font-mono font-medium">
                                  {exam.subjectCode}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                              {exam.name}
                            </span>
                          </div>
                        </td>

                        {/* Class & Section */}
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-medium">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                            Class {exam.className} {exam.section && exam.section !== 'All' ? `• Sec ${exam.section}` : '(All)'}
                          </span>
                        </td>

                        {/* Exam Date */}
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{examDateStr}</span>
                          </div>
                        </td>

                        {/* Time Range */}
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{timeRangeStr}</span>
                          </div>
                        </td>

                        {/* Max Marks */}
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                          <span className="font-semibold text-gray-900 dark:text-white">{exam.maxMarks ?? 100}</span>
                          {exam.passingMarks !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Min: {exam.passingMarks}</span>
                          )}
                        </td>

                        {/* Room / Hall */}
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {exam.roomNumber || '—'}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-sm font-normal whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                            exam.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : exam.status === 'ongoing'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {exam.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenMarksModal(exam)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1"
                              title="Record marks for this slot"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Marks</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditExamModal(exam)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                              title="Edit Exam"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                              title="Delete Exam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        No examinations match the selected filters. Click "Schedule Exam Slot" to add an exam.
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
                value={selectedExamResultFilterId}
                onChange={(e) => setSelectedExamResultFilterId(e.target.value)}
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
      {/* CREATE / EDIT GRANULAR EXAM MODAL */}
      {/* ========================================================================= */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowExamModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingExam ? 'Edit Examination Slot' : 'Schedule New Examination Slot'}
            </h2>

            <form onSubmit={handleSaveExam} className="space-y-4">
              {/* Exam Title / Series */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                  Examination Series / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026, Unit Assessment Test - 1"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  list="exam-series-list"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
                <datalist id="exam-series-list">
                  <option value="Mid-Term Examination 2026" />
                  <option value="Unit Assessment Test - 1" />
                  <option value="Periodic Assessment 2" />
                  <option value="Pre-Board Examination 2026" />
                  <option value="Annual Final Examination 2027" />
                </datalist>
              </div>

              {/* Class & Section (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Target Class *
                  </label>
                  <select
                    required
                    value={examForm.class_id}
                    onChange={(e) => {
                      const newClassId = e.target.value;
                      const cls = classes.find(c => c.id === newClassId);
                      const clsSubjects = subjects.filter(s => s.classId === newClassId || (cls && s.className === cls.name));
                      setExamForm({
                        ...examForm,
                        class_id: newClassId,
                        section: cls?.sections[0]?.name || 'A',
                        subject_id: clsSubjects[0]?.id || subjects[0]?.id || ''
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>Class {cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Section *
                  </label>
                  <select
                    required
                    value={examForm.section}
                    onChange={(e) => setExamForm({ ...examForm, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="All">All Sections</option>
                    {availableModalSections.map((sec) => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={examForm.subject_id}
                  onChange={(e) => setExamForm({ ...examForm, subject_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  {availableModalSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Range (3 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={examForm.start_time}
                    onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={examForm.end_time}
                    onChange={(e) => setExamForm({ ...examForm, end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">Quick timing presets:</span>
                <button
                  type="button"
                  onClick={() => setExamForm({ ...examForm, start_time: '09:00 AM', end_time: '11:30 AM' })}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Morning (09:00 AM - 11:30 AM)
                </button>
                <button
                  type="button"
                  onClick={() => setExamForm({ ...examForm, start_time: '01:30 PM', end_time: '03:30 PM' })}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Afternoon (01:30 PM - 03:30 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setExamForm({ ...examForm, start_time: '09:00 AM', end_time: '12:00 PM' })}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  3 Hours (09:00 AM - 12:00 PM)
                </button>
              </div>

              {/* Max Marks, Passing Marks & Room No. (3 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={examForm.max_marks}
                    onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={examForm.passing_marks}
                    onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                    Room / Hall No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam Hall A, Room 102"
                    value={examForm.room_number}
                    onChange={(e) => setExamForm({ ...examForm, room_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={examForm.status}
                  onChange={(e) => setExamForm({ ...examForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white font-semibold rounded-xl transition text-sm shadow-md shadow-blue-500/20"
                >
                  {editingExam ? 'Update Slot' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD MARKS MODAL */}
      {/* ========================================================================= */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
      {/* REPORT CARD MODAL */}
      {/* ========================================================================= */}
      {showReportCardModal && reportCardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
