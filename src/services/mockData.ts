import {
  initialStudents,
  initialEmployees,
  initialFeeRecords,
  initialTransportRoutes,
  initialLeaves,
  initialCirculars,
  initialNotifications,
  initialConversations,
  initialClasses,
  initialFeeStructures
} from './centralData';

export const mockStudents = initialStudents;
export const mockTeachers = initialEmployees.filter(e => e.role === 'teacher');
export const mockStaff = initialEmployees.filter(e => e.role !== 'teacher');
export const mockFees = initialFeeRecords;
export const mockTransportation = initialTransportRoutes;
export const mockLeaves = initialLeaves;
export const mockCirculars = initialCirculars;
export const mockNotifications = initialNotifications;
export const mockConversations = initialConversations;
export const mockClasses = initialClasses;
export const mockFeeStructures = initialFeeStructures;

export const mockExaminations = [
  { id: '1', name: 'Mid-Term Examination 2026', class: '10', startDate: '2026-09-25', endDate: '2026-10-05', totalMarks: 100 },
  { id: '2', name: 'Unit Test 2', class: 'Nursery', startDate: '2026-09-22', endDate: '2026-09-24', totalMarks: 50 },
  { id: '3', name: 'Half Yearly Assessment', class: 'UKG', startDate: '2026-09-28', endDate: '2026-10-03', totalMarks: 50 }
];

export const mockResults = [
  { id: '1', examId: '1', studentId: 'stu-4', studentName: 'Ananya Iyer', subject: 'Mathematics', marksObtained: 92, totalMarks: 100, grade: 'A+' },
  { id: '2', examId: '1', studentId: 'stu-5', studentName: 'Kabir Khan', subject: 'Science', marksObtained: 84, totalMarks: 100, grade: 'A' },
  { id: '3', examId: '1', studentId: 'stu-6', studentName: 'Ishaan Gupta', subject: 'English', marksObtained: 88, totalMarks: 100, grade: 'A' }
];

export const mockInventory = [
  { id: '1', itemName: 'Smart Interactive Panel 75"', category: 'electronics', quantity: 12, purchaseDate: '2026-01-15', purchasePrice: 145000, condition: 'good', location: 'Classrooms' },
  { id: '2', itemName: 'Physics Lab Optics Kit', category: 'laboratory', quantity: 20, purchaseDate: '2025-08-10', purchasePrice: 45000, condition: 'good', location: 'Physics Lab' },
  { id: '3', itemName: 'School Bus First Aid Kit', category: 'medical', quantity: 15, purchaseDate: '2026-03-01', purchasePrice: 12000, condition: 'good', location: 'Transport Bay' }
];

export const mockAcademicCalendar = [
  { id: '1', eventType: 'holiday', title: 'Gandhi Jayanti', description: 'National Holiday', startDate: '2026-10-02', endDate: '2026-10-02' },
  { id: '2', eventType: 'exam', title: 'Mid-Term Examinations', description: 'Examinations for all classes', startDate: '2026-09-25', endDate: '2026-10-05' },
  { id: '3', eventType: 'event', title: 'Annual Cultural Fest & Science Exhibition', description: 'Parent & student open house', startDate: '2026-11-14', endDate: '2026-11-15' }
];

export const mockAttendance = [
  { id: '1', studentId: 'stu-1', date: '2026-09-11', status: 'present', remarks: 'On time' },
  { id: '2', studentId: 'stu-2', date: '2026-09-11', status: 'present', remarks: 'On time' },
  { id: '3', studentId: 'stu-3', date: '2026-09-11', status: 'absent', remarks: 'Parent informed' },
  { id: '4', studentId: 'stu-4', date: '2026-09-11', status: 'present', remarks: 'On time' },
  { id: '5', studentId: 'stu-5', date: '2026-09-11', status: 'present', remarks: 'On time' },
  { id: '6', studentId: 'stu-6', date: '2026-09-11', status: 'present', remarks: 'On time' }
];
