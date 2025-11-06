export const mockStudents = [
  {
    id: '1',
    studentId: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2010-05-15',
    gender: 'Male',
    class: '10',
    section: 'A',
    rollNumber: '101',
    admissionDate: '2020-04-01',
    parentName: 'Robert Doe',
    parentPhone: '+1234567890',
    parentEmail: 'robert@example.com',
    address: '123 Main St, City',
    status: 'active'
  },
  {
    id: '2',
    studentId: 'STU002',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '2011-08-22',
    gender: 'Female',
    class: '9',
    section: 'B',
    rollNumber: '102',
    admissionDate: '2021-04-01',
    parentName: 'Michael Smith',
    parentPhone: '+1234567891',
    parentEmail: 'michael@example.com',
    address: '456 Oak Ave, City',
    status: 'active'
  },
  {
    id: '3',
    studentId: 'STU003',
    firstName: 'Alex',
    lastName: 'Johnson',
    dateOfBirth: '2010-11-10',
    gender: 'Male',
    class: '10',
    section: 'A',
    rollNumber: '103',
    admissionDate: '2020-04-01',
    parentName: 'David Johnson',
    parentPhone: '+1234567892',
    parentEmail: 'david@example.com',
    address: '789 Pine Rd, City',
    status: 'active'
  }
];

export const mockTeachers = [
  {
    id: '1',
    teacherId: 'TCH001',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@school.com',
    phone: '+1234567893',
    subject: 'Mathematics',
    qualification: 'M.Sc Mathematics',
    joiningDate: '2018-06-15',
    status: 'active'
  },
  {
    id: '2',
    teacherId: 'TCH002',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james@school.com',
    phone: '+1234567894',
    subject: 'Science',
    qualification: 'M.Sc Physics',
    joiningDate: '2019-07-01',
    status: 'active'
  }
];

export const mockStaff = [
  {
    id: '1',
    staffId: 'STF001',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily@school.com',
    phone: '+1234567895',
    designation: 'Librarian',
    department: 'Library',
    joiningDate: '2020-01-15',
    status: 'active'
  },
  {
    id: '2',
    staffId: 'STF002',
    firstName: 'Michael',
    lastName: 'Wilson',
    email: 'michael@school.com',
    phone: '+1234567896',
    designation: 'Lab Assistant',
    department: 'Science Lab',
    joiningDate: '2019-08-20',
    status: 'active'
  }
];

export const mockFees = [
  {
    id: '1',
    studentId: '1',
    feeType: 'tuition',
    amount: 5000,
    dueDate: '2025-11-01',
    paidAmount: 5000,
    paidDate: '2025-10-05',
    status: 'paid'
  },
  {
    id: '2',
    studentId: '2',
    feeType: 'tuition',
    amount: 5000,
    dueDate: '2025-11-01',
    paidAmount: 2500,
    paidDate: '2025-10-05',
    status: 'partial'
  },
  {
    id: '3',
    studentId: '3',
    feeType: 'tuition',
    amount: 5000,
    dueDate: '2025-11-01',
    paidAmount: 0,
    paidDate: null,
    status: 'pending'
  }
];

export const mockTransportation = [
  {
    id: '1',
    routeName: 'Route A - North',
    vehicleNumber: 'ABC-1234',
    driverName: 'Tom Harris',
    driverPhone: '+1234567897',
    capacity: 40,
    status: 'active'
  },
  {
    id: '2',
    routeName: 'Route B - South',
    vehicleNumber: 'XYZ-5678',
    driverName: 'Jack Martin',
    driverPhone: '+1234567898',
    capacity: 35,
    status: 'active'
  }
];

export const mockLeaves = [
  {
    id: '1',
    userId: '1',
    userType: 'teacher',
    userName: 'Sarah Williams',
    leaveType: 'sick',
    fromDate: '2025-10-10',
    toDate: '2025-10-12',
    reason: 'Medical reasons',
    status: 'pending',
    approvedBy: null
  },
  {
    id: '2',
    userId: '2',
    userType: 'teacher',
    userName: 'James Brown',
    leaveType: 'casual',
    fromDate: '2025-10-15',
    toDate: '2025-10-16',
    reason: 'Personal work',
    status: 'approved',
    approvedBy: 'Admin User'
  }
];

export const mockCirculars = [
  {
    id: '1',
    title: 'Annual Day Celebration',
    content: 'Annual day celebration will be held on December 15th. All parents are invited.',
    targetAudience: 'all',
    priority: 'high',
    createdBy: 'Admin User',
    createdAt: '2025-10-01'
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting',
    content: 'PTM scheduled for November 20th from 10 AM to 4 PM.',
    targetAudience: 'parents',
    priority: 'medium',
    createdBy: 'Admin User',
    createdAt: '2025-10-03'
  }
];

export const mockExaminations = [
  {
    id: '1',
    examName: 'Mid-Term Examination',
    examType: 'midterm',
    class: '10',
    startDate: '2025-11-15',
    endDate: '2025-11-25',
    status: 'scheduled'
  },
  {
    id: '2',
    examName: 'Final Examination',
    examType: 'final',
    class: '10',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    status: 'scheduled'
  }
];

export const mockResults = [
  {
    id: '1',
    examId: '1',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Mathematics',
    marksObtained: 85,
    totalMarks: 100,
    grade: 'A'
  },
  {
    id: '2',
    examId: '1',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Science',
    marksObtained: 78,
    totalMarks: 100,
    grade: 'B'
  }
];

export const mockInventory = [
  {
    id: '1',
    itemName: 'Desktop Computer',
    category: 'electronics',
    quantity: 25,
    purchaseDate: '2024-01-15',
    purchasePrice: 50000,
    condition: 'good',
    location: 'Computer Lab'
  },
  {
    id: '2',
    itemName: 'Whiteboard',
    category: 'furniture',
    quantity: 30,
    purchaseDate: '2023-06-10',
    purchasePrice: 15000,
    condition: 'good',
    location: 'Classrooms'
  }
];

export const mockAcademicCalendar = [
  {
    id: '1',
    eventType: 'holiday',
    title: 'Diwali Break',
    description: 'Festival holidays',
    startDate: '2025-11-01',
    endDate: '2025-11-05'
  },
  {
    id: '2',
    eventType: 'exam',
    title: 'Mid-Term Exams',
    description: 'Mid-term examinations for all classes',
    startDate: '2025-11-15',
    endDate: '2025-11-25'
  },
  {
    id: '3',
    eventType: 'event',
    title: 'Sports Day',
    description: 'Annual sports day event',
    startDate: '2025-12-10',
    endDate: '2025-12-10'
  }
];

export const mockAttendance = [
  {
    id: '1',
    studentId: '1',
    date: '2025-10-07',
    status: 'present',
    remarks: ''
  },
  {
    id: '2',
    studentId: '2',
    date: '2025-10-07',
    status: 'absent',
    remarks: 'Sick'
  },
  {
    id: '3',
    studentId: '3',
    date: '2025-10-07',
    status: 'present',
    remarks: ''
  }
];
