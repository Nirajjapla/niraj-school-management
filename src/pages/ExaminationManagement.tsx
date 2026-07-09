import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { examApi, classApi } from '../services/api';

interface Exam {
  id: string;
  examName: string;
  examType: string;
  class: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Result {
  id: string;
  examId: string;
  studentName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

const ExaminationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const fetchExamsAndResults = async () => {
    try {
      // 1. Get classes
      let classes = await classApi.getClasses();
      if (classes.length === 0) {
        await classApi.createClass('10');
        classes = await classApi.getClasses();
      }
      const classObj = classes[0];

      // 2. Fetch Exams
      let dbExams = await examApi.getExams();
      if (dbExams.length === 0 && classObj) {
        await examApi.createExam({
          name: 'Mid-Term Examination',
          class_id: classObj.id,
          start_date: '2025-11-15',
          end_date: '2025-11-25'
        });
        await examApi.createExam({
          name: 'Final Examination',
          class_id: classObj.id,
          start_date: '2026-03-01',
          end_date: '2026-03-15'
        });
        dbExams = await examApi.getExams();
      }

      const mappedExams = dbExams.map((e: any) => ({
        id: String(e.id),
        examName: e.name,
        examType: e.name.toLowerCase().includes('mid') ? 'midterm' : 'final',
        class: e.class?.name || '10',
        startDate: e.start_date || '',
        endDate: e.end_date || '',
        status: new Date(e.end_date) < new Date() ? 'completed' : 'scheduled'
      }));
      setExams(mappedExams);

      // 3. Fetch marks
      if (dbExams.length > 0) {
        const firstExamId = dbExams[0].id;
        const marks = await examApi.getMarks(firstExamId);
        
        const mappedResults = marks.map((m: any) => {
          const pct = m.max_marks > 0 ? (m.marks_obtained / m.max_marks) * 100 : 0;
          let grade = 'F';
          if (pct >= 85) grade = 'A';
          else if (pct >= 70) grade = 'B';
          else if (pct >= 50) grade = 'C';

          return {
            id: String(m.id),
            examId: String(m.exam_id),
            studentName: m.student?.user?.name || 'Unknown Student',
            subject: m.subject?.name || 'Mathematics',
            marksObtained: Number(m.marks_obtained),
            totalMarks: Number(m.max_marks),
            grade
          };
        });
        
        if (mappedResults.length === 0) {
          setResults([
            {
              id: '1',
              examId: String(firstExamId),
              studentName: 'John Doe',
              subject: 'Mathematics',
              marksObtained: 85,
              totalMarks: 100,
              grade: 'A'
            },
            {
              id: '2',
              examId: String(firstExamId),
              studentName: 'Jane Smith',
              subject: 'Science',
              marksObtained: 78,
              totalMarks: 100,
              grade: 'B'
            }
          ]);
        } else {
          setResults(mappedResults);
        }
      }
    } catch (err) {
      console.error('Error fetching exams and results:', err);
    }
  };

  useEffect(() => {
    fetchExamsAndResults();
  }, []);

  const filteredExams = exams.filter(exam =>
    exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(result =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Examination & Results</h1>
        <p className="text-gray-600">Manage examinations and student results</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'exams'
                  ? 'border-b-2 border-[#4e74f9] text-[#4e74f9]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Examinations
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'results'
                  ? 'border-b-2 border-[#4e74f9] text-[#4e74f9]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {activeTab === 'exams' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{exam.examName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 capitalize">{exam.examType}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.startDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{exam.endDate}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{result.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.marksObtained}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{result.totalMarks}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {((result.marksObtained / result.totalMarks) * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.grade === 'A' ? 'bg-green-100 text-green-700' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationManagement;
