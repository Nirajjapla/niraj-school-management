import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Eye, FileText, Award } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ExamSchedule, ExamResultRecord } from '../services/centralData';

const ExaminationManagement: React.FC = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilterId, setSelectedExamFilterId] = useState<string>('');

  // Exam Form Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    class_id: classes[0]?.id || '',
    start_date: '',
    end_date: ''
  });

  // Marks Recording Modal State
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [marksInputs, setMarksInputs] = useState<Record<string, { marks_obtained: string; max_marks: string }>>({});

  // Report Card View Modal State
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardData, setReportCardData] = useState<any | null>(null);

  // Open modal for Creating Exam
  const handleOpenCreateExamModal = () => {
    setEditingExam(null);
    setExamForm({
      name: '',
      class_id: classes.length > 0 ? classes[0].id : '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    });
    setShowExamModal(true);
  };

  // Open modal for Editing Exam
  const handleOpenEditExamModal = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      class_id: exam.classId,
      start_date: exam.startDate,
      end_date: exam.endDate
    });
    setShowExamModal(true);
  };

  // Save Exam (Create / Update)
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name || !examForm.class_id) {
      alert('Please fill in exam name and select a class.');
      return;
    }

    const cls = classes.find(c => c.id === examForm.class_id);
    const className = cls ? cls.name : '10';

    if (editingExam) {
      updateExam(editingExam.id, {
        name: examForm.name,
        classId: examForm.class_id,
        className,
        startDate: examForm.start_date,
        endDate: examForm.end_date
      });
    } else {
      addExam({
        name: examForm.name,
        academicYear: '2026-2027',
        classId: examForm.class_id,
        className,
        startDate: examForm.start_date,
        endDate: examForm.end_date,
        status: 'scheduled'
      });
    }

    setShowExamModal(false);
  };

  // Delete Exam
  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this examination? All associated marks will also be deleted.')) {
      deleteExam(examId);
    }
  };

  // Open Marks Recording Modal
  const handleOpenMarksModal = () => {
    if (exams.length === 0) {
      alert('Please create an examination first before recording marks.');
      return;
    }

    const defaultExam = exams[0];
    setSelectedExamId(defaultExam.id);
    setSelectedClassId(defaultExam.classId || classes[0]?.id || '');
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : '');

    setShowMarksModal(true);
  };

  // Update inputs when Class / Exam selected in Marks modal
  useEffect(() => {
    if (!showMarksModal) return;

    const cls = classes.find(c => c.id === selectedClassId);
    const clsName = cls ? cls.name : '';

    const filteredStudents = clsName
      ? students.filter(s => s.class === clsName)
      : students;

    const initialInputs: Record<string, { marks_obtained: string; max_marks: string }> = {};
    filteredStudents.forEach(s => {
      const existing = examResults.find(r => r.examId === selectedExamId && r.studentId === s.id && r.subjectId === selectedSubjectId);
      initialInputs[s.id] = {
        marks_obtained: existing ? String(existing.marksObtained) : '85',
        max_marks: existing ? String(existing.maxMarks) : '100'
      };
    });
    setMarksInputs(initialInputs);
  }, [showMarksModal, selectedClassId, selectedExamId, selectedSubjectId, students, classes, examResults]);

  // Save Recorded Marks
  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedSubjectId) {
      alert('Please select an Examination and a Subject.');
      return;
    }

    const targetExam = exams.find(ex => ex.id === selectedExamId);
    const targetSubject = subjects.find(sub => sub.id === selectedSubjectId);

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

      const existing = examResults.find(r => r.examId === selectedExamId && r.studentId === student_id && r.subjectId === selectedSubjectId);
      if (existing) {
        updateExamResult(existing.id, {
          marksObtained: obtained,
          maxMarks: max,
          percentage: Number(pct.toFixed(1)),
          grade
        });
      } else {
        addExamResult({
          examId: selectedExamId,
          examName: targetExam?.name || 'Examination',
          studentId: student_id,
          studentName: stu ? `${stu.firstName} ${stu.lastName}` : 'Student',
          class: stu?.class || '10',
          section: stu?.section || 'A',
          rollNumber: stu?.rollNumber || '01',
          subjectId: selectedSubjectId,
          subjectName: targetSubject?.name || 'Subject',
          marksObtained: obtained,
          maxMarks: max,
          percentage: Number(pct.toFixed(1)),
          grade
        });
      }
    });

    setShowMarksModal(false);
  };

  // View Student Report Card
  const handleViewReportCard = (examId: string, studentId: string) => {
    const stu = students.find(s => s.id === studentId);
    const ex = exams.find(e => e.id === examId);
    const marks = examResults.filter(r => r.examId === examId && r.studentId === studentId);

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

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedResults = selectedExamFilterId
    ? examResults.filter(r => r.examId === selectedExamFilterId)
    : examResults;

  const filteredResults = displayedResults.filter(result =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examination & Results</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Schedule examinations and view student results uploaded by faculty
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'exams' ? (
            <button
              onClick={handleOpenCreateExamModal}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm">
              <Award className="w-4 h-4" />
              <span>Teacher App Uploads • View-Only Repository</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Pillar Tabs */}
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
              {exams.length}
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

      {/* Tab 1: Exams Schedule */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Action / Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search exams by name or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Examinations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Exam Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Start Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">End Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">{exam.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{exam.className}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{exam.startDate || '-'}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{exam.endDate || '-'}</td>
                      <td className="px-5 py-4 text-sm font-normal">
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
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditExamModal(exam)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                            title="Edit Exam"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                        No examinations scheduled. Click "Create Exam" to schedule an examination.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Results & Marks */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Action / Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search results by student, subject, or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {exams.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Exam:</label>
                <select
                  value={selectedExamFilterId}
                  onChange={(e) => setSelectedExamFilterId(e.target.value)}
                  className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[160px]"
                >
                  <option value="">All Exams</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.className})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Exam</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Marks</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Max Marks</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Percentage</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {result.studentName}
                        <span className="block text-xs font-normal text-gray-500 dark:text-slate-400">Roll #{result.rollNumber || '01'} • Class {result.class}-{result.section}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{result.examName}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{result.subjectName}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{result.marksObtained}</td>
                      <td className="px-5 py-4 text-right text-sm text-gray-500 dark:text-slate-400 font-normal">{result.maxMarks}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{result.percentage}%</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          result.grade.startsWith('A')
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : result.grade.startsWith('B')
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : result.grade.startsWith('C')
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleViewReportCard(result.examId, result.studentId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Card</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                        No results uploaded yet by faculty for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EXAM MODAL */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setShowExamModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingExam ? 'Edit Examination' : 'Create New Examination'}
            </h2>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Class *</label>
                <select
                  required
                  value={examForm.class_id}
                  onChange={(e) => setExamForm({ ...examForm, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>Class {cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={examForm.start_date}
                    onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.end_date}
                    onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white font-medium rounded-lg transition"
                >
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MARKS MODAL */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMarksModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Record Marks for Students</h2>

            <form onSubmit={handleSaveMarks} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Exam *</label>
                  <select
                    required
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      const ex = exams.find(x => String(x.id) === e.target.value);
                      if (ex) setSelectedClassId(ex.classId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name} ({ex.className})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Subject *</label>
                  <select
                    required
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>Class {cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Marks Table</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Student Name</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Marks Obtained</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(marksInputs).map((student_id) => {
                        const stu = students.find(s => String(s.id) === String(student_id));
                        const stuName = stu?.user?.name || `Student #${student_id}`;
                        const inputVal = marksInputs[student_id] || { marks_obtained: '0', max_marks: '100' };

                        return (
                          <tr key={student_id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{stuName}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={inputVal.max_marks}
                                value={inputVal.marks_obtained}
                                onChange={(e) => setMarksInputs({
                                  ...marksInputs,
                                  [student_id]: { ...inputVal, marks_obtained: e.target.value }
                                })}
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={inputVal.max_marks}
                                onChange={(e) => setMarksInputs({
                                  ...marksInputs,
                                  [student_id]: { ...inputVal, max_marks: e.target.value }
                                })}
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {Object.keys(marksInputs).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-gray-500 text-sm">
                            No students found for the selected class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMarksModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(marksInputs).length === 0}
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3b5ccc] disabled:opacity-50 text-white font-medium rounded-lg transition"
                >
                  Save Recorded Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT CARD MODAL */}
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
