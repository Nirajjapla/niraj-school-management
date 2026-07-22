import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Eye, FileText, Award } from 'lucide-react';
import { examApi, classApi, subjectApi, studentApi } from '../services/api';

interface ExamItem {
  id: string;
  name: string;
  classId: string;
  className: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ResultItem {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
}

const ExaminationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [_loading, setLoading] = useState(false);

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Exam Form Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    class_id: '',
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

  const fetchData = async () => {
    try {
      setLoading(true);
      // Load classes, subjects, students
      const [clsData, subData, stuData] = await Promise.all([
        classApi.getClasses().catch(() => []),
        subjectApi.getSubjects().catch(() => []),
        studentApi.getStudents().catch(() => [])
      ]);

      setClasses(clsData || []);
      setSubjects(subData || []);
      setStudents(stuData || []);

      // Load exams
      const dbExams = await examApi.getExams();
      const mappedExams: ExamItem[] = (dbExams || []).map((e: any) => {
        const clsName = e.class?.name || (clsData || []).find((c: any) => String(c.id) === String(e.class_id))?.name || 'All Classes';

        let status = 'scheduled';
        if (e.start_date && e.end_date) {
          const now = new Date();
          const start = new Date(e.start_date);
          const end = new Date(e.end_date);
          if (now > end) status = 'completed';
          else if (now >= start && now <= end) status = 'ongoing';
        }

        return {
          id: String(e.id),
          name: e.name,
          classId: String(e.class_id || ''),
          className: clsName,
          startDate: e.start_date || '',
          endDate: e.end_date || '',
          status
        };
      });
      setExams(mappedExams);

      // Load marks for the first available exam if any
      if (mappedExams.length > 0) {
        await fetchResultsForExam(mappedExams[0].id, subData, stuData, mappedExams);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error fetching examination data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsForExam = async (examId: string, subList = subjects, stuList = students, examList = exams) => {
    try {
      const marksData = await examApi.getMarks(examId);
      const targetExam = examList.find(e => String(e.id) === String(examId));

      const mappedResults: ResultItem[] = (marksData || []).map((m: any) => {
        const obtained = Number(m.marks_obtained || 0);
        const max = Number(m.max_marks || 100);
        const pct = max > 0 ? (obtained / max) * 100 : 0;

        let grade = 'F';
        if (pct >= 85) grade = 'A';
        else if (pct >= 70) grade = 'B';
        else if (pct >= 50) grade = 'C';
        else if (pct >= 35) grade = 'D';

        const studentName = m.student?.user?.name || stuList.find(s => String(s.id) === String(m.student_id))?.user?.name || `Student #${m.student_id}`;
        const subjectName = m.subject?.name || subList.find(s => String(s.id) === String(m.subject_id))?.name || `Subject #${m.subject_id}`;

        return {
          id: String(m.id),
          examId: String(m.exam_id),
          examName: targetExam ? targetExam.name : `Exam #${m.exam_id}`,
          studentId: String(m.student_id),
          studentName,
          subjectId: String(m.subject_id),
          subjectName,
          marksObtained: obtained,
          maxMarks: max,
          percentage: Number(pct.toFixed(2)),
          grade
        };
      });

      setResults(mappedResults);
    } catch (err) {
      console.error(`Error fetching marks for exam ${examId}:`, err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for Creating Exam
  const handleOpenCreateExamModal = () => {
    setEditingExam(null);
    setExamForm({
      name: '',
      class_id: classes.length > 0 ? String(classes[0].id) : '',
      start_date: '',
      end_date: ''
    });
    setShowExamModal(true);
  };

  // Open modal for Editing Exam
  const handleOpenEditExamModal = (exam: ExamItem) => {
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
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name || !examForm.class_id) {
      alert('Please fill in exam name and select a class.');
      return;
    }

    try {
      const payload = {
        name: examForm.name,
        class_id: Number(examForm.class_id),
        start_date: examForm.start_date || undefined,
        end_date: examForm.end_date || undefined
      };

      if (editingExam) {
        await examApi.updateExam(editingExam.id, payload);
      } else {
        await examApi.createExam(payload);
      }

      setShowExamModal(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to save exam:', err);
      alert(err.message || 'Error saving examination');
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Are you sure you want to delete this examination? All associated marks will also be deleted.')) {
      return;
    }

    try {
      await examApi.deleteExam(examId);
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete exam:', err);
      alert(err.message || 'Error deleting examination');
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
    setSelectedClassId(defaultExam.classId || (classes[0] ? String(classes[0].id) : ''));
    setSelectedSubjectId(subjects.length > 0 ? String(subjects[0].id) : '');

    setShowMarksModal(true);
  };

  // Update inputs when Class / Exam selected in Marks modal
  useEffect(() => {
    if (!showMarksModal) return;

    // Filter students belonging to selectedClassId (or all if not selected)
    const filteredStudents = selectedClassId
      ? students.filter(s => String(s.class_id) === String(selectedClassId))
      : students;

    const initialInputs: Record<string, { marks_obtained: string; max_marks: string }> = {};
    filteredStudents.forEach(s => {
      initialInputs[String(s.id)] = {
        marks_obtained: '0',
        max_marks: '100'
      };
    });
    setMarksInputs(initialInputs);
  }, [showMarksModal, selectedClassId, students]);

  // Save Recorded Marks
  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedSubjectId) {
      alert('Please select an Examination and a Subject.');
      return;
    }

    const records = Object.entries(marksInputs).map(([student_id, val]) => ({
      student_id: Number(student_id),
      marks_obtained: Number(val.marks_obtained) || 0,
      max_marks: Number(val.max_marks) || 100
    }));

    if (records.length === 0) {
      alert('No student records found to submit.');
      return;
    }

    try {
      await examApi.recordMarks(selectedExamId, {
        subject_id: Number(selectedSubjectId),
        records
      });

      setShowMarksModal(false);
      fetchResultsForExam(selectedExamId);
    } catch (err: any) {
      console.error('Failed to record marks:', err);
      alert(err.message || 'Error recording marks');
    }
  };

  // View Student Report Card
  const handleViewReportCard = async (examId: string, studentId: string) => {
    try {
      const card = await examApi.getReportCard(examId, studentId);
      setReportCardData(card);
      setShowReportCardModal(true);
    } catch (err: any) {
      console.error('Failed to load report card:', err);
      alert(err.message || 'Unable to fetch report card');
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(result =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Examination & Results</h1>
          <p className="text-gray-600">Create examinations, record student marks, and generate report cards</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'exams' ? (
            <button
              onClick={handleOpenCreateExamModal}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create Exam</span>
            </button>
          ) : (
            <button
              onClick={handleOpenMarksModal}
              className="flex items-center space-x-2 bg-[#4e74f9] hover:bg-[#3b5ccc] text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Record Marks</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium ${activeTab === 'exams'
                  ? 'border-b-2 border-[#4e74f9] text-[#4e74f9]'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Examinations</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium ${activeTab === 'results'
                  ? 'border-b-2 border-[#4e74f9] text-[#4e74f9]'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Award className="w-4 h-4" />
              <span>Results & Marks</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>

          {activeTab === 'results' && exams.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter Exam:</label>
              <select
                onChange={(e) => fetchResultsForExam(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4e74f9]"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.className})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'exams' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-[#4e74f9] text-right text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{exam.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.startDate || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.endDate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${exam.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : exam.status === 'ongoing'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditExamModal(exam)}
                        className="text-gray-500 hover:text-blue-600 transition"
                        title="Edit Exam"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-gray-500 hover:text-red-600 transition"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No examinations scheduled. Click "Create Exam" to schedule an examination.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{result.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.examName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.subjectName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{result.marksObtained}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{result.maxMarks}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.percentage}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${result.grade === 'A' ? 'bg-green-100 text-green-700' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                        }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewReportCard(result.examId, result.studentId)}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-[#4e74f9] hover:text-[#3b5ccc] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No results recorded yet. Click "Record Marks" to enter marks for students.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReportCardModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 border-b border-gray-200 pb-4">
              <div className="w-12 h-12 bg-blue-100 text-[#4e74f9] rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{reportCardData.exam?.name || 'Student Report Card'}</h2>
              <p className="text-sm text-gray-600 mt-1">Student: <span className="font-semibold text-gray-800">{reportCardData.student?.user?.name || 'N/A'}</span></p>
              <p className="text-xs text-gray-500">Roll No: {reportCardData.student?.roll_number || 'N/A'} | Class: {reportCardData.student?.class?.name || 'N/A'}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Subject Breakdown</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Marks</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(reportCardData.marks || []).map((m: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{m.subject?.name || 'Subject'}</td>
                        <td className="px-4 py-2.5 text-center text-gray-800 font-semibold">{m.marks_obtained}</td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{m.max_marks}</td>
                      </tr>
                    ))}
                    {(reportCardData.marks || []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No subject marks available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase">Overall Percentage</p>
                  <p className="text-xl font-bold text-blue-900">{reportCardData.summary?.percentage || '0'}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-blue-700 uppercase">Overall Grade</p>
                  <span className="px-3 py-1 text-sm font-bold bg-[#4e74f9] text-white rounded-md inline-block mt-0.5">
                    {reportCardData.summary?.grade || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowReportCardModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm transition"
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
