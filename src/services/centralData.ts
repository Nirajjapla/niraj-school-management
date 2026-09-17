// Central Interconnected Mock Data Store for School ERP Admin

export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export interface ClassSection {
  id: string;
  name: string;
  class_id: string;
  capacity?: number;
  roomNumber?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  assistantTeacherId?: string;
  assistantTeacherName?: string;
  stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General';
}

export interface SchoolClass {
  id: string;
  name: string;
  stage: 'Pre-Primary' | 'Primary' | 'Secondary' | 'Senior Secondary';
  sections: ClassSection[];
  stream?: 'Science' | 'Commerce' | 'Arts / Humanities' | 'General';
}

export interface StudentCategory {
  id: 'normal' | 'reservation';
  label: string;
  discountPercentage: number;
}

export type FeeComponentCode =
  | 'TUITION'
  | 'ANNUAL'
  | 'LAB'
  | 'LIBRARY'
  | 'SPORTS'
  | 'COMPUTER'
  | 'EXAM'
  | 'CAMPUS_DEV'
  | 'TRANSPORT'
  | 'OTHER';

export interface FeeComponent {
  id: string;
  code?: FeeComponentCode;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly';
  isOptional: boolean;
  description: string;
}

export interface FeeStructure {
  id: string;
  className: string;
  category: 'normal' | 'reservation';
  collectionFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  compositeFee: number; // Base fee per period
  components: FeeComponent[];
  lateFeeFixedAmount: number; // Fixed amount in ₹
  dueDayOfMonth: number;
  graceDays?: number;
}

export interface StudentFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  category: 'normal' | 'reservation';
  feeType: string; // "Composite Fee"
  collectionFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  monthlyFee: number;
  quarterlyFee: number;
  annualFee: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  overrideAmount?: number;
  overrideRemarks?: string;
  selectedOptionalComponents: string[];
  transportRouteId?: string;
  transportMonthlyFare?: number;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  class: string;
  section: string;
  category: 'normal' | 'reservation';
  rollNumber: string;
  admissionDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  houseAddress: string;
  city: string;
  state: string;
  pinCode: string;
  emergencyContact: string;
  bloodGroup: string;
  classTeacher?: string;
  associateTeacher?: string;
  busRouteId?: string;
  isAvailingTransport?: boolean;
  user?: any;
}

export interface StaffLeaveBalance {
  casual: { total: number; taken: number };
  sick: { total: number; taken: number };
  earned: { total: number; taken: number };
  maternity?: { total: number; taken: number };
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: 'teacher' | 'admin' | 'support';
  designation: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  qualification: string;
  gender: 'Male' | 'Female';
  bloodGroup: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  fatherName?: string;
  experienceYears?: number;
  experienceMonths?: number;
  subject?: string;
  className?: string;
  section?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact?: string;
  leaveBalance: StaffLeaveBalance;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
}

export interface TransportRoute {
  id: string;
  routeNumber: string;
  routeTitle: string;
  descriptionString: string; // Stops list
  morningPickupSchedule: string;
  eveningDropDuration: string;
  vehicleNumber: string;
  vehicleType: 'Bus' | 'Mini Bus' | 'Van';
  isAC: boolean;
  driverId: string;
  driverName: string;
  driverPhone: string;
  coDriverId?: string;
  coDriverName?: string;
  coDriverPhone?: string;
  capacity: number;
  assignedStudentsCount: number;
  status: 'active' | 'maintenance' | 'inactive';
  assetDetails: {
    fitnessExpiry: string;
    insuranceExpiry: string;
    serviceDueDate: string;
    gpsStatus: 'Active' | 'Inactive' | 'Signal Low';
    ownership: 'Owned' | 'Leased / Vendor';
    vendorName?: string;
    vendorPhone?: string;
    vendorAddress?: string;
  };
  monthlyFare?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: 'teacher' | 'admin' | 'support' | 'student';
  designation?: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave';
  isPaid: boolean;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  appliedDate: string;
  approvedBy?: string;
}

export interface CircularItem {
  id: string;
  title: string;
  content: string;
  date: string;
  targetAudience: 'All' | 'Students' | 'Teachers';
  priority: 'Normal' | 'Urgent';
  author: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface NotificationItem {
  id: string;
  type: 'teacher_leave' | 'teacher_message' | 'fee_alert' | 'transport_alert' | 'system_circular';
  title: string;
  message: string;
  timestamp: string;
  priority: 'Normal' | 'High' | 'Urgent';
  read: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'teacher' | 'student';
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'Teacher' | 'Student';
  participantClass?: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  onlineStatus: boolean;
}

export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  affiliationNo: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  principalName: string;
  establishedYear: number;
  status: 'Active' | 'Inactive';
  logo_url?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  description: string;
  headOfDepartment?: string;
  staffCount: number;
}

export interface DesignationItem {
  id: string;
  name: string;
  description: string;
  departmentId?: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  teacherId?: string;
  teacherName?: string;
  coTeacherId?: string;
  coTeacherName?: string;
  weeklyHours: number;
  subjectType?: 'Core' | 'Elective' | 'Language' | 'Practical' | 'Co-Scholastic';
  maxMarks?: number;
}

export interface ExamSchedule {
  id: string;
  name: string;
  academicYear: string;
  classId: string;
  className: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

export interface ExamResultRecord {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

export interface InventoryItem {
  id: string;
  title: string;
  author?: string;
  category: 'Library' | 'Laboratory' | 'Sports' | 'IT Equipment' | 'Stationery';
  quantity: number;
  availableQuantity: number;
  rackNumber: string;
  condition: 'New' | 'Good' | 'Fair' | 'Maintenance';
  unitPrice?: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused' | 'On Leave';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Excused';
  markedBy: string; // Class Teacher or Admin
  markedByRole: 'Teacher' | 'Admin';
  markedAt: string; // e.g. "08:15 AM"
  source: 'Teacher Mobile App' | 'Admin Portal' | 'Biometric Sync';
  isOverridden: boolean;
  overrideRemarks?: string;
  overrideBy?: string;
  overrideAt?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  role: 'teacher' | 'admin' | 'support';
  department: string;
  designation: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  checkInTime?: string;
  checkOutTime?: string;
  markedBy: string;
  markedAt: string;
  remarks?: string;
}

// Initial Data Seed
export const initialClasses: SchoolClass[] = [
  {
    id: 'c-nursery',
    name: 'Nursery',
    stage: 'Pre-Primary',
    sections: [
      { id: 's-nur-a', name: 'A', class_id: 'c-nursery', capacity: 30, roomNumber: 'Room KG-1', classTeacherId: 'emp-3', classTeacherName: 'Sunita Patel' }
    ]
  },
  {
    id: 'c-lkg',
    name: 'LKG',
    stage: 'Pre-Primary',
    sections: [
      { id: 's-lkg-a', name: 'A', class_id: 'c-lkg', capacity: 30, roomNumber: 'Room KG-2', classTeacherId: 'emp-3', classTeacherName: 'Sunita Patel' },
      { id: 's-lkg-b', name: 'B', class_id: 'c-lkg', capacity: 30, roomNumber: 'Room KG-3', classTeacherId: 'emp-3', classTeacherName: 'Sunita Patel' }
    ]
  },
  {
    id: 'c-ukg',
    name: 'UKG',
    stage: 'Pre-Primary',
    sections: [
      { id: 's-ukg-a', name: 'A', class_id: 'c-ukg', capacity: 32, roomNumber: 'Room KG-4', classTeacherId: 'emp-3', classTeacherName: 'Sunita Patel' },
      { id: 's-ukg-b', name: 'B', class_id: 'c-ukg', capacity: 32, roomNumber: 'Room KG-5', classTeacherId: 'emp-3', classTeacherName: 'Sunita Patel' }
    ]
  },
  ...Array.from({ length: 12 }, (_, i) => {
    const cNum = String(i + 1);
    const stage = i < 5 ? 'Primary' : i < 10 ? 'Secondary' : 'Senior Secondary';
    const teacherMap: Record<string, { id: string; name: string }> = {
      '1': { id: 'emp-4', name: 'Priya Joshi' },
      '5': { id: 'emp-4', name: 'Priya Joshi' },
      '9': { id: 'emp-2', name: 'Vikram Mehta' },
      '10': { id: 'emp-1', name: 'Anita Sharma' },
      '11': { id: 'emp-5', name: 'Rajesh Nair' },
      '12': { id: 'emp-1', name: 'Anita Sharma' }
    };
    const defaultTeacher = teacherMap[cNum] || { id: 'emp-1', name: 'Anita Sharma' };
    return {
      id: `c-${cNum}`,
      name: cNum,
      stage: stage as any,
      sections: [
        { id: `s-${cNum}-a`, name: 'A', class_id: `c-${cNum}`, capacity: 40, roomNumber: `Room ${100 + Number(cNum)}`, classTeacherId: defaultTeacher.id, classTeacherName: defaultTeacher.name },
        { id: `s-${cNum}-b`, name: 'B', class_id: `c-${cNum}`, capacity: 40, roomNumber: `Room ${200 + Number(cNum)}`, classTeacherId: 'emp-2', classTeacherName: 'Vikram Mehta' },
        { id: `s-${cNum}-c`, name: 'C', class_id: `c-${cNum}`, capacity: 35, roomNumber: `Room ${300 + Number(cNum)}`, classTeacherId: 'emp-5', classTeacherName: 'Rajesh Nair' }
      ]
    };
  })
];

export const ALL_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10',
  '11', '12'
];

export function generateAll30FeeStructures(): FeeStructure[] {
  const list: FeeStructure[] = [];

  for (const c of ALL_CLASSES) {
    for (const cat of ['normal', 'reservation'] as const) {
      const isRes = cat === 'reservation';
      const isPrePrimary = ['Nursery', 'LKG', 'UKG'].includes(c);
      const isSeniorSec = ['11', '12'].includes(c);
      const isSec = ['6', '7', '8', '9', '10'].includes(c);
      const isPrimary = ['1', '2', '3', '4', '5'].includes(c);

      // 1. Tuition Fee (Core Academic Instruction)
      let tuitionAmt = 2200;
      if (c === 'Nursery') tuitionAmt = 2000;
      else if (c === 'LKG') tuitionAmt = 2200;
      else if (c === 'UKG') tuitionAmt = 2400;
      else if (isPrimary) tuitionAmt = 2600 + (Number(c) - 1) * 100;
      else if (isSec) tuitionAmt = 3400 + (Number(c) - 6) * 100;
      else if (c === '11') tuitionAmt = 4600;
      else if (c === '12') tuitionAmt = 5000;

      if (isRes) tuitionAmt = Math.round(tuitionAmt * 0.5);

      // 2. Annual Function & Cultural Activity Fee
      let annualAmt = 1800;
      if (isPrePrimary) annualAmt = 1500;
      else if (isPrimary) annualAmt = 1800;
      else if (isSec) annualAmt = 2100;
      else if (isSeniorSec) annualAmt = 2400;
      if (isRes) annualAmt = Math.round(annualAmt * 0.5);

      // 3. Laboratory & Science Practical Fee (Class 6-12 strictly)
      let labAmt = 0;
      if (isSec) labAmt = 450;
      else if (isSeniorSec) labAmt = 800;
      if (isRes && labAmt > 0) labAmt = Math.round(labAmt * 0.5);

      // 4. Library & Digital E-Resource Fee
      let libAmt = isPrePrimary ? 150 : isPrimary ? 200 : isSec ? 250 : 300;
      if (isRes) libAmt = Math.round(libAmt * 0.5);

      // 5. Sports, Yoga & Physical Education Fee
      let sportsAmt = isPrePrimary ? 200 : isPrimary ? 250 : isSec ? 300 : 350;
      if (isRes) sportsAmt = Math.round(sportsAmt * 0.5);

      // 6. Computer Lab & Smart Class Tech Fee
      let compAmt = isPrePrimary ? 250 : isPrimary ? 350 : isSec ? 450 : 500;
      if (isRes) compAmt = Math.round(compAmt * 0.5);

      // 7. Examination & Periodic Assessment Fee
      let examAmt = isPrePrimary ? 200 : isPrimary ? 250 : isSec ? 300 : 350;
      if (isRes) examAmt = Math.round(examAmt * 0.5);

      // 8. Campus Development & Maintenance Fee
      let devAmt = isPrePrimary ? 300 : isPrimary ? 350 : isSec ? 400 : 450;
      if (isRes) devAmt = Math.round(devAmt * 0.5);

      // 9. Transport Fee (Optional component linked to bus routes)
      const transAmt = isRes ? 900 : 1500;

      const components: FeeComponent[] = [
        {
          id: `fc-tui-${c.toLowerCase()}-${cat}`,
          code: 'TUITION',
          name: 'Tuition Fee',
          amount: tuitionAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Core classroom academic instruction & curriculum delivery'
        },
        {
          id: `fc-ann-${c.toLowerCase()}-${cat}`,
          code: 'ANNUAL',
          name: 'Annual Function & Cultural Activity Fee',
          amount: annualAmt,
          frequency: 'Yearly',
          isOptional: false,
          description: 'Annual cultural day, sports day celebrations & stage events'
        }
      ];

      if (isSec || isSeniorSec) {
        components.push({
          id: `fc-lab-${c.toLowerCase()}-${cat}`,
          code: 'LAB',
          name: 'Laboratory & Science Practical Fee',
          amount: labAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Physics, Chemistry, Biology & STEM science laboratory apparatus'
        });
      }

      components.push(
        {
          id: `fc-lib-${c.toLowerCase()}-${cat}`,
          code: 'LIBRARY',
          name: 'Library & Digital E-Resource Fee',
          amount: libAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Physical library circulation, reading room & digital e-library access'
        },
        {
          id: `fc-spo-${c.toLowerCase()}-${cat}`,
          code: 'SPORTS',
          name: 'Sports, Yoga & Physical Education Fee',
          amount: sportsAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Physical training, yoga instruction, indoor & outdoor sports gear'
        },
        {
          id: `fc-tech-${c.toLowerCase()}-${cat}`,
          code: 'COMPUTER',
          name: 'Computer & Smart Class Tech Fee',
          amount: compAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Interactive smart class boards, campus Wi-Fi & IT laboratory'
        },
        {
          id: `fc-exam-${c.toLowerCase()}-${cat}`,
          code: 'EXAM',
          name: 'Examination & Periodic Assessment Fee',
          amount: examAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Periodic tests, question paper printing, evaluation & report cards'
        },
        {
          id: `fc-dev-${c.toLowerCase()}-${cat}`,
          code: 'CAMPUS_DEV',
          name: 'Campus Development & Maintenance Fee',
          amount: devAmt,
          frequency: 'Monthly',
          isOptional: false,
          description: 'Campus facility upgrades, security surveillance, power backup & hygiene'
        },
        {
          id: `fc-trans-${c.toLowerCase()}-${cat}`,
          code: 'TRANSPORT',
          name: isRes ? 'Transport Fee (Subsidized)' : 'Transport Fee',
          amount: transAmt,
          frequency: 'Monthly',
          isOptional: true,
          description: 'School transit bus/van service with live GPS tracking (optional)'
        }
      );

      // Compute composite sum of mandatory components
      const mandatoryMonthly = components
        .filter(comp => !comp.isOptional)
        .reduce((sum, comp) => {
          const m = comp.frequency === 'Monthly' ? comp.amount :
                    comp.frequency === 'Quarterly' ? comp.amount / 3 :
                    comp.frequency === 'Half yearly' ? comp.amount / 6 :
                    comp.amount / 12;
          return sum + m;
        }, 0);

      const collectionFrequency = isPrePrimary ? 'Monthly' : 'Quarterly';
      const compositeFee = collectionFrequency === 'Monthly'
        ? Math.round(mandatoryMonthly)
        : Math.round(mandatoryMonthly * 3);

      list.push({
        id: `fs-${c.toLowerCase()}-${cat === 'reservation' ? 'res' : 'norm'}`,
        className: c,
        category: cat,
        collectionFrequency,
        compositeFee,
        components,
        lateFeeFixedAmount: isRes ? (isPrePrimary ? 150 : 250) : (isPrePrimary ? 250 : 500),
        dueDayOfMonth: isPrePrimary ? 10 : 15,
        graceDays: 5
      });
    }
  }

  return list;
}

export const initialFeeStructures: FeeStructure[] = generateAll30FeeStructures();

export const initialDrivers = [
  { id: 'drv-1', name: 'Rajesh Kumar', phone: '+91 98765 43210' },
  { id: 'drv-2', name: 'Suresh Verma', phone: '+91 98765 43211' },
  { id: 'drv-3', name: 'Ramesh Singh', phone: '+91 98765 43212' },
  { id: 'drv-4', name: 'Anil Sharma', phone: '+91 98765 43213' },
  { id: 'drv-5', name: 'Manoj Kumar', phone: '+91 98765 43214' },
  { id: 'drv-6', name: 'Vijay Singh', phone: '+91 98765 43215' }
];

export const initialTransportRoutes: TransportRoute[] = [
  {
    id: 'tr-1',
    routeNumber: 'R-101',
    routeTitle: 'North City Express',
    descriptionString: 'Railway Station -> Gandhi Chowk -> Civil Lines -> Model Town -> School Campus',
    morningPickupSchedule: '07:15 AM - 08:00 AM',
    eveningDropDuration: '02:30 PM - 03:30 PM',
    vehicleNumber: 'DL-01-AB-1234',
    vehicleType: 'Bus',
    isAC: true,
    driverId: 'drv-1',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    coDriverId: 'drv-5',
    coDriverName: 'Manoj Kumar',
    coDriverPhone: '+91 98765 43214',
    capacity: 45,
    assignedStudentsCount: 38,
    status: 'active',
    monthlyFare: 1500,
    assetDetails: {
      fitnessExpiry: '2027-04-20',
      insuranceExpiry: '2026-12-15',
      serviceDueDate: '2026-10-30',
      gpsStatus: 'Active',
      ownership: 'Owned'
    }
  },
  {
    id: 'tr-2',
    routeNumber: 'R-102',
    routeTitle: 'South Campus Line',
    descriptionString: 'Green Park -> Hauz Khas -> Saket -> Malviya Nagar -> School Campus',
    morningPickupSchedule: '07:00 AM - 07:55 AM',
    eveningDropDuration: '02:30 PM - 03:40 PM',
    vehicleNumber: 'DL-01-CD-5678',
    vehicleType: 'Mini Bus',
    isAC: true,
    driverId: 'drv-2',
    driverName: 'Suresh Verma',
    driverPhone: '+91 98765 43211',
    coDriverId: 'drv-6',
    coDriverName: 'Vijay Singh',
    coDriverPhone: '+91 98765 43215',
    capacity: 30,
    assignedStudentsCount: 26,
    status: 'active',
    monthlyFare: 1800,
    assetDetails: {
      fitnessExpiry: '2027-02-10',
      insuranceExpiry: '2026-11-05',
      serviceDueDate: '2026-11-20',
      gpsStatus: 'Active',
      ownership: 'Leased / Vendor',
      vendorName: 'SafeTravels Transporters Pvt Ltd',
      vendorPhone: '+91 98111 22334',
      vendorAddress: 'Plot 42, Sector 18, Transport Nagar, New Delhi'
    }
  },
  {
    id: 'tr-3',
    routeNumber: 'R-103',
    routeTitle: 'East Valley Shuttle',
    descriptionString: 'Preet Vihar -> Laxmi Nagar -> Mayur Vihar Ph-1 -> School Campus',
    morningPickupSchedule: '07:20 AM - 08:05 AM',
    eveningDropDuration: '02:30 PM - 03:25 PM',
    vehicleNumber: 'DL-01-EF-9012',
    vehicleType: 'Van',
    isAC: false,
    driverId: 'drv-3',
    driverName: 'Ramesh Singh',
    driverPhone: '+91 98765 43212',
    capacity: 18,
    assignedStudentsCount: 15,
    status: 'active',
    monthlyFare: 1200,
    assetDetails: {
      fitnessExpiry: '2026-10-15',
      insuranceExpiry: '2026-09-30',
      serviceDueDate: '2026-10-05',
      gpsStatus: 'Active',
      ownership: 'Owned'
    }
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    code: 'TCH-001',
    name: 'Anita Sharma',
    role: 'teacher',
    designation: 'Senior Mathematics Teacher',
    department: 'Mathematics',
    phone: '+91 98234 56789',
    email: 'anita.sharma@school.com',
    joiningDate: '2021-06-15',
    qualification: 'M.Sc., B.Ed.',
    gender: 'Female',
    bloodGroup: 'B+',
    leaveBalance: {
      casual: { total: 12, taken: 3 },
      sick: { total: 10, taken: 2 },
      earned: { total: 15, taken: 4 },
      maternity: { total: 180, taken: 0 }
    }
  },
  {
    id: 'emp-2',
    code: 'TCH-002',
    name: 'Vikram Mehta',
    role: 'teacher',
    designation: 'Head of Science Department',
    department: 'Science',
    phone: '+91 98345 67890',
    email: 'vikram.mehta@school.com',
    joiningDate: '2019-04-10',
    qualification: 'M.Sc. Physics, M.Ed.',
    gender: 'Male',
    bloodGroup: 'O+',
    leaveBalance: {
      casual: { total: 12, taken: 5 },
      sick: { total: 10, taken: 1 },
      earned: { total: 15, taken: 2 }
    }
  },
  {
    id: 'emp-3',
    code: 'TCH-003',
    name: 'Sunita Patel',
    role: 'teacher',
    designation: 'Pre-Primary Coordinator & Teacher',
    department: 'Pre-Primary',
    phone: '+91 98456 78901',
    email: 'sunita.patel@school.com',
    joiningDate: '2022-07-01',
    qualification: 'B.A., NTT Certified',
    gender: 'Female',
    bloodGroup: 'A+',
    leaveBalance: {
      casual: { total: 12, taken: 2 },
      sick: { total: 10, taken: 0 },
      earned: { total: 15, taken: 5 }
    }
  },
  {
    id: 'emp-4',
    code: 'ADM-001',
    name: 'Rohan Deshmukh',
    role: 'admin',
    designation: 'Chief Accounts Officer',
    department: 'Finance & Accounts',
    phone: '+91 98567 89012',
    email: 'rohan.accounts@school.com',
    joiningDate: '2018-02-15',
    qualification: 'M.Com, CA Inter',
    gender: 'Male',
    bloodGroup: 'AB+',
    leaveBalance: {
      casual: { total: 15, taken: 4 },
      sick: { total: 12, taken: 1 },
      earned: { total: 20, taken: 6 }
    }
  },
  {
    id: 'emp-5',
    code: 'SUP-001',
    name: 'Dinesh Chandra',
    role: 'support',
    designation: 'Transport & Fleet Supervisor',
    department: 'Administration',
    phone: '+91 98678 90123',
    email: 'dinesh.transport@school.com',
    joiningDate: '2020-09-01',
    qualification: 'Diploma in Auto Engg',
    gender: 'Male',
    bloodGroup: 'B-',
    leaveBalance: {
      casual: { total: 10, taken: 2 },
      sick: { total: 8, taken: 0 },
      earned: { total: 10, taken: 3 }
    }
  }
];

export const initialStudents: Student[] = [
  // Nursery
  {
    id: 'stu-1',
    studentId: 'STU2026001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: '2021-05-14',
    gender: 'Male',
    class: 'Nursery',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2026-04-02',
    parentName: 'Ramesh Sharma',
    parentPhone: '+91 98123 45678',
    parentEmail: 'ramesh.sharma@example.com',
    houseAddress: 'Flat 402, Green Glen Towers',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    emergencyContact: '+91 98123 45679',
    bloodGroup: 'B+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-7',
    studentId: 'STU2026007',
    firstName: 'Mira',
    lastName: 'Rajput',
    dateOfBirth: '2021-08-20',
    gender: 'Female',
    class: 'Nursery',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2026-04-05',
    parentName: 'Gaurav Rajput',
    parentPhone: '+91 98111 22331',
    parentEmail: 'gaurav.rajput@example.com',
    houseAddress: 'B-14, Mayur Vihar Ph-1',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110091',
    emergencyContact: '+91 98111 22332',
    bloodGroup: 'O+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-8',
    studentId: 'STU2026008',
    firstName: 'Vihaan',
    lastName: 'Malhotra',
    dateOfBirth: '2021-11-12',
    gender: 'Male',
    class: 'Nursery',
    section: 'A',
    category: 'normal',
    rollNumber: '03',
    admissionDate: '2026-04-10',
    parentName: 'Rohit Malhotra',
    parentPhone: '+91 98222 33441',
    parentEmail: 'rohit.malhotra@example.com',
    houseAddress: 'C-78, Preet Vihar',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110092',
    emergencyContact: '+91 98222 33442',
    bloodGroup: 'A+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-1'
  },

  // LKG
  {
    id: 'stu-2',
    studentId: 'STU2026002',
    firstName: 'Diya',
    lastName: 'Kaur',
    dateOfBirth: '2020-09-22',
    gender: 'Female',
    class: 'LKG',
    section: 'A',
    category: 'reservation',
    rollNumber: '01',
    admissionDate: '2026-04-05',
    parentName: 'Harpreet Kaur',
    parentPhone: '+91 98234 56781',
    parentEmail: 'harpreet.k@example.com',
    houseAddress: 'H-12, Sector 15',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    emergencyContact: '+91 98234 56782',
    bloodGroup: 'O+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-9',
    studentId: 'STU2026009',
    firstName: 'Reyansh',
    lastName: 'Patil',
    dateOfBirth: '2020-04-18',
    gender: 'Male',
    class: 'LKG',
    section: 'A',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2026-04-08',
    parentName: 'Sachin Patil',
    parentPhone: '+91 98333 44551',
    parentEmail: 'sachin.patil@example.com',
    houseAddress: 'Flat 101, Galaxy Heights',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    emergencyContact: '+91 98333 44552',
    bloodGroup: 'AB+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-10',
    studentId: 'STU2026010',
    firstName: 'Avani',
    lastName: 'Deshmukh',
    dateOfBirth: '2020-07-30',
    gender: 'Female',
    class: 'LKG',
    section: 'B',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2026-04-12',
    parentName: 'Nitin Deshmukh',
    parentPhone: '+91 98444 55661',
    parentEmail: 'nitin.deshmukh@example.com',
    houseAddress: 'Plot 55, Indirapuram',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pinCode: '201014',
    emergencyContact: '+91 98444 55662',
    bloodGroup: 'B+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-11',
    studentId: 'STU2026011',
    firstName: 'Advait',
    lastName: 'Joshi',
    dateOfBirth: '2020-02-15',
    gender: 'Male',
    class: 'LKG',
    section: 'B',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2026-04-14',
    parentName: 'Manoj Joshi',
    parentPhone: '+91 98555 66771',
    parentEmail: 'manoj.joshi@example.com',
    houseAddress: 'D-33, Vasundhara',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pinCode: '201012',
    emergencyContact: '+91 98555 66772',
    bloodGroup: 'O-',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-3'
  },

  // UKG
  {
    id: 'stu-12',
    studentId: 'STU2026012',
    firstName: 'Tanvi',
    lastName: 'Nair',
    dateOfBirth: '2019-10-05',
    gender: 'Female',
    class: 'UKG',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2025-04-05',
    parentName: 'Suresh Nair',
    parentPhone: '+91 98666 77881',
    parentEmail: 'suresh.nair@example.com',
    houseAddress: 'Tower 4, DLF CyberCity',
    city: 'Gurugram',
    state: 'Haryana',
    pinCode: '122002',
    emergencyContact: '+91 98666 77882',
    bloodGroup: 'A+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-13',
    studentId: 'STU2026013',
    firstName: 'Samar',
    lastName: 'Mehra',
    dateOfBirth: '2019-06-19',
    gender: 'Male',
    class: 'UKG',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2025-04-09',
    parentName: 'Deepak Mehra',
    parentPhone: '+91 98777 88991',
    parentEmail: 'deepak.mehra@example.com',
    houseAddress: 'A-21, South Extension-2',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110049',
    emergencyContact: '+91 98777 88992',
    bloodGroup: 'B-',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-3',
    studentId: 'STU2026003',
    firstName: 'Rohan',
    lastName: 'Verma',
    dateOfBirth: '2019-11-08',
    gender: 'Male',
    class: 'UKG',
    section: 'B',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2025-04-10',
    parentName: 'Alok Verma',
    parentPhone: '+91 98345 67892',
    parentEmail: 'alok.verma@example.com',
    houseAddress: 'B-89, Preet Vihar',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110092',
    emergencyContact: '+91 98345 67893',
    bloodGroup: 'A+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-14',
    studentId: 'STU2026014',
    firstName: 'Sia',
    lastName: 'Singhania',
    dateOfBirth: '2019-08-25',
    gender: 'Female',
    class: 'UKG',
    section: 'B',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2025-04-15',
    parentName: 'Vikrant Singhania',
    parentPhone: '+91 98888 99001',
    parentEmail: 'vikrant.s@example.com',
    houseAddress: 'Flat 503, Silver Oak Apts',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110024',
    emergencyContact: '+91 98888 99002',
    bloodGroup: 'O+',
    classTeacher: 'Sunita Patel',
    busRouteId: 'tr-1'
  },

  // Class 1
  {
    id: 'stu-15',
    studentId: 'STU2026015',
    firstName: 'Aarohi',
    lastName: 'Sen',
    dateOfBirth: '2018-04-12',
    gender: 'Female',
    class: '1',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2024-04-02',
    parentName: 'Subhash Sen',
    parentPhone: '+91 98999 00112',
    parentEmail: 'subhash.sen@example.com',
    houseAddress: 'Plot 104, CR Park',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110019',
    emergencyContact: '+91 98999 00113',
    bloodGroup: 'AB-',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-16',
    studentId: 'STU2026016',
    firstName: 'Devansh',
    lastName: 'Agarwal',
    dateOfBirth: '2018-09-03',
    gender: 'Male',
    class: '1',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2024-04-06',
    parentName: 'Sunil Agarwal',
    parentPhone: '+91 98123 11223',
    parentEmail: 'sunil.agarwal@example.com',
    houseAddress: 'B-12, Model Town',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110009',
    emergencyContact: '+91 98123 11224',
    bloodGroup: 'B+',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-1'
  },

  // Class 5
  {
    id: 'stu-17',
    studentId: 'STU2026017',
    firstName: 'Pranav',
    lastName: 'Pillai',
    dateOfBirth: '2015-06-20',
    gender: 'Male',
    class: '5',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2021-04-01',
    parentName: 'Madhavan Pillai',
    parentPhone: '+91 98234 22334',
    parentEmail: 'madhavan.pillai@example.com',
    houseAddress: 'C-55, Saket',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110017',
    emergencyContact: '+91 98234 22335',
    bloodGroup: 'O+',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-18',
    studentId: 'STU2026018',
    firstName: 'Anika',
    lastName: 'Saxena',
    dateOfBirth: '2015-08-11',
    gender: 'Female',
    class: '5',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2021-04-05',
    parentName: 'Ajay Saxena',
    parentPhone: '+91 98345 33445',
    parentEmail: 'ajay.saxena@example.com',
    houseAddress: 'D-99, GK-1',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110048',
    emergencyContact: '+91 98345 33446',
    bloodGroup: 'A+',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-19',
    studentId: 'STU2026019',
    firstName: 'Shaurya',
    lastName: 'Tiwari',
    dateOfBirth: '2015-03-29',
    gender: 'Male',
    class: '5',
    section: 'B',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2021-04-10',
    parentName: 'Rajnish Tiwari',
    parentPhone: '+91 98456 44556',
    parentEmail: 'rajnish.tiwari@example.com',
    houseAddress: 'E-40, Vasant Kunj',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110070',
    emergencyContact: '+91 98456 44557',
    bloodGroup: 'B-',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-20',
    studentId: 'STU2026020',
    firstName: 'Meera',
    lastName: 'Nambiar',
    dateOfBirth: '2015-12-14',
    gender: 'Female',
    class: '5',
    section: 'B',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2021-04-15',
    parentName: 'Kishore Nambiar',
    parentPhone: '+91 98567 55667',
    parentEmail: 'kishore.nambiar@example.com',
    houseAddress: 'Flat 302, Palm Court',
    city: 'Gurugram',
    state: 'Haryana',
    pinCode: '122001',
    emergencyContact: '+91 98567 55668',
    bloodGroup: 'O+',
    classTeacher: 'Priya Joshi',
    busRouteId: 'tr-1'
  },

  // Class 9
  {
    id: 'stu-21',
    studentId: 'STU2026021',
    firstName: 'Aditya',
    lastName: 'Roy',
    dateOfBirth: '2012-05-10',
    gender: 'Male',
    class: '9',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2018-04-02',
    parentName: 'Debashis Roy',
    parentPhone: '+91 98678 66778',
    parentEmail: 'debashis.roy@example.com',
    houseAddress: 'B-18, Chittaranjan Park',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110019',
    emergencyContact: '+91 98678 66779',
    bloodGroup: 'A+',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-22',
    studentId: 'STU2026022',
    firstName: 'Riya',
    lastName: 'Banerjee',
    dateOfBirth: '2012-09-17',
    gender: 'Female',
    class: '9',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2018-04-08',
    parentName: 'Shomik Banerjee',
    parentPhone: '+91 98789 77889',
    parentEmail: 'shomik.banerjee@example.com',
    houseAddress: 'C-72, Kalkaji',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110019',
    emergencyContact: '+91 98789 77890',
    bloodGroup: 'B+',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-23',
    studentId: 'STU2026023',
    firstName: 'Neil',
    lastName: 'Chatterjee',
    dateOfBirth: '2012-01-23',
    gender: 'Male',
    class: '9',
    section: 'B',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2018-04-12',
    parentName: 'Prabir Chatterjee',
    parentPhone: '+91 98890 88990',
    parentEmail: 'prabir.c@example.com',
    houseAddress: 'Flat 801, Metro Heights',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    emergencyContact: '+91 98890 88991',
    bloodGroup: 'O+',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-24',
    studentId: 'STU2026024',
    firstName: 'Pooja',
    lastName: 'Hegde',
    dateOfBirth: '2012-11-04',
    gender: 'Female',
    class: '9',
    section: 'B',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2018-04-15',
    parentName: 'Venkatesh Hegde',
    parentPhone: '+91 98901 99001',
    parentEmail: 'venkatesh.h@example.com',
    houseAddress: 'H-90, Sector 44',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201303',
    emergencyContact: '+91 98901 99002',
    bloodGroup: 'AB+',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-2'
  },

  // Class 10
  {
    id: 'stu-4',
    studentId: 'STU2026004',
    firstName: 'Ananya',
    lastName: 'Iyer',
    dateOfBirth: '2011-03-18',
    gender: 'Female',
    class: '10',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2020-04-01',
    parentName: 'Karthik Iyer',
    parentPhone: '+91 98456 78903',
    parentEmail: 'karthik.iyer@example.com',
    houseAddress: 'Villa 14, Palm Meadows',
    city: 'Gurugram',
    state: 'Haryana',
    pinCode: '122001',
    emergencyContact: '+91 98456 78904',
    bloodGroup: 'AB+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-6',
    studentId: 'STU2026006',
    firstName: 'Ishaan',
    lastName: 'Gupta',
    dateOfBirth: '2010-12-05',
    gender: 'Male',
    class: '10',
    section: 'A',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2019-04-08',
    parentName: 'Sanjay Gupta',
    parentPhone: '+91 98678 90125',
    parentEmail: 'sanjay.gupta@example.com',
    houseAddress: 'D-22, Hauz Khas',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110016',
    emergencyContact: '+91 98678 90126',
    bloodGroup: 'B+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-25',
    studentId: 'STU2026025',
    firstName: 'Yashwardhan',
    lastName: 'Rathore',
    dateOfBirth: '2011-07-22',
    gender: 'Male',
    class: '10',
    section: 'A',
    category: 'reservation',
    rollNumber: '03',
    admissionDate: '2019-04-10',
    parentName: 'Manvendra Rathore',
    parentPhone: '+91 98012 11223',
    parentEmail: 'manvendra.r@example.com',
    houseAddress: 'A-45, Defence Colony',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110024',
    emergencyContact: '+91 98012 11224',
    bloodGroup: 'A+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-26',
    studentId: 'STU2026026',
    firstName: 'Sara',
    lastName: 'Ali',
    dateOfBirth: '2011-01-15',
    gender: 'Female',
    class: '10',
    section: 'A',
    category: 'normal',
    rollNumber: '04',
    admissionDate: '2019-04-12',
    parentName: 'Imran Ali',
    parentPhone: '+91 98123 22334',
    parentEmail: 'imran.ali@example.com',
    houseAddress: 'E-12, Nizamuddin West',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110013',
    emergencyContact: '+91 98123 22335',
    bloodGroup: 'O+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-5',
    studentId: 'STU2026005',
    firstName: 'Kabir',
    lastName: 'Khan',
    dateOfBirth: '2011-08-30',
    gender: 'Male',
    class: '10',
    section: 'B',
    category: 'reservation',
    rollNumber: '01',
    admissionDate: '2021-07-15',
    parentName: 'Zubair Khan',
    parentPhone: '+91 98567 89014',
    parentEmail: 'zubair.khan@example.com',
    houseAddress: 'C-45, Jamia Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110025',
    emergencyContact: '+91 98567 89015',
    bloodGroup: 'O-',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-27',
    studentId: 'STU2026027',
    firstName: 'Sneha',
    lastName: 'Kulkarni',
    dateOfBirth: '2011-04-28',
    gender: 'Female',
    class: '10',
    section: 'B',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2019-04-15',
    parentName: 'Prasad Kulkarni',
    parentPhone: '+91 98234 33445',
    parentEmail: 'prasad.k@example.com',
    houseAddress: 'Flat 204, Ganga Apts',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110070',
    emergencyContact: '+91 98234 33446',
    bloodGroup: 'B+',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-28',
    studentId: 'STU2026028',
    firstName: 'Aryan',
    lastName: 'Bhatt',
    dateOfBirth: '2010-10-14',
    gender: 'Male',
    class: '10',
    section: 'B',
    category: 'normal',
    rollNumber: '03',
    admissionDate: '2019-04-18',
    parentName: 'Kunal Bhatt',
    parentPhone: '+91 98345 44556',
    parentEmail: 'kunal.bhatt@example.com',
    houseAddress: 'Plot 77, Dwarka Sector 12',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110075',
    emergencyContact: '+91 98345 44557',
    bloodGroup: 'A-',
    classTeacher: 'Vikram Mehta',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-29',
    studentId: 'STU2026029',
    firstName: 'Dhruv',
    lastName: 'Pandey',
    dateOfBirth: '2011-06-03',
    gender: 'Male',
    class: '10',
    section: 'C',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2019-04-20',
    parentName: 'Brijesh Pandey',
    parentPhone: '+91 98456 55667',
    parentEmail: 'brijesh.p@example.com',
    houseAddress: 'C-102, Mayur Vihar Ph-2',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110091',
    emergencyContact: '+91 98456 55668',
    bloodGroup: 'O+',
    classTeacher: 'Rajesh Nair',
    busRouteId: 'tr-3'
  },
  {
    id: 'stu-30',
    studentId: 'STU2026030',
    firstName: 'Kriti',
    lastName: 'Varma',
    dateOfBirth: '2011-09-19',
    gender: 'Female',
    class: '10',
    section: 'C',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2019-04-22',
    parentName: 'Hemant Varma',
    parentPhone: '+91 98567 66778',
    parentEmail: 'hemant.varma@example.com',
    houseAddress: 'B-34, Anand Vihar',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110092',
    emergencyContact: '+91 98567 66779',
    bloodGroup: 'B+',
    classTeacher: 'Rajesh Nair',
    busRouteId: 'tr-1'
  },

  // Class 11 & 12
  {
    id: 'stu-31',
    studentId: 'STU2026031',
    firstName: 'Harshit',
    lastName: 'Singhal',
    dateOfBirth: '2009-03-24',
    gender: 'Male',
    class: '11',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2017-04-02',
    parentName: 'Praveen Singhal',
    parentPhone: '+91 98678 77889',
    parentEmail: 'praveen.s@example.com',
    houseAddress: 'D-88, Punjabi Bagh',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110026',
    emergencyContact: '+91 98678 77890',
    bloodGroup: 'AB+',
    classTeacher: 'Rajesh Nair',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-32',
    studentId: 'STU2026032',
    firstName: 'Radhika',
    lastName: 'Madan',
    dateOfBirth: '2009-08-14',
    gender: 'Female',
    class: '11',
    section: 'A',
    category: 'reservation',
    rollNumber: '02',
    admissionDate: '2017-04-05',
    parentName: 'Sanjay Madan',
    parentPhone: '+91 98789 88990',
    parentEmail: 'sanjay.madan@example.com',
    houseAddress: 'Flat 601, Rosewood Apts',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110018',
    emergencyContact: '+91 98789 88991',
    bloodGroup: 'O+',
    classTeacher: 'Rajesh Nair',
    busRouteId: 'tr-1'
  },
  {
    id: 'stu-33',
    studentId: 'STU2026033',
    firstName: 'Siddharth',
    lastName: 'Menon',
    dateOfBirth: '2008-05-18',
    gender: 'Male',
    class: '12',
    section: 'A',
    category: 'normal',
    rollNumber: '01',
    admissionDate: '2016-04-01',
    parentName: 'Gopal Menon',
    parentPhone: '+91 98890 99001',
    parentEmail: 'gopal.menon@example.com',
    houseAddress: 'Villa 22, Vasant Vihar',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110057',
    emergencyContact: '+91 98890 99002',
    bloodGroup: 'A+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-2'
  },
  {
    id: 'stu-34',
    studentId: 'STU2026034',
    firstName: 'Tanya',
    lastName: 'Chawla',
    dateOfBirth: '2008-11-29',
    gender: 'Female',
    class: '12',
    section: 'A',
    category: 'normal',
    rollNumber: '02',
    admissionDate: '2016-04-06',
    parentName: 'Ashok Chawla',
    parentPhone: '+91 98901 00112',
    parentEmail: 'ashok.chawla@example.com',
    houseAddress: 'B-10, Greater Kailash-2',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110048',
    emergencyContact: '+91 98901 00113',
    bloodGroup: 'B+',
    classTeacher: 'Anita Sharma',
    busRouteId: 'tr-1'
  }
];

export const initialFeeRecords: StudentFeeRecord[] = [
  // Nursery
  {
    id: 'fee-1',
    studentId: 'stu-1',
    studentName: 'Aarav Sharma',
    class: 'Nursery',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5000,
    quarterlyFee: 15000,
    annualFee: 60000,
    totalAmount: 5000,
    paidAmount: 5000,
    dueDate: '2026-09-10',
    paidDate: '2026-09-05',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-7',
    studentId: 'stu-7',
    studentName: 'Mira Rajput',
    class: 'Nursery',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 2700,
    quarterlyFee: 8100,
    annualFee: 32400,
    totalAmount: 2700,
    paidAmount: 2700,
    dueDate: '2026-09-10',
    paidDate: '2026-09-06',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-8',
    studentId: 'stu-8',
    studentName: 'Vihaan Malhotra',
    class: 'Nursery',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5000,
    quarterlyFee: 15000,
    annualFee: 60000,
    totalAmount: 5000,
    paidAmount: 0,
    dueDate: '2026-09-10',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },

  // LKG
  {
    id: 'fee-2',
    studentId: 'stu-2',
    studentName: 'Diya Kaur',
    class: 'LKG',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 2700,
    quarterlyFee: 8100,
    annualFee: 32400,
    totalAmount: 2700,
    paidAmount: 1350,
    dueDate: '2026-09-10',
    paidDate: '2026-09-08',
    status: 'partial',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-9',
    studentId: 'stu-9',
    studentName: 'Reyansh Patil',
    class: 'LKG',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5300,
    quarterlyFee: 15900,
    annualFee: 63600,
    totalAmount: 5300,
    paidAmount: 5300,
    dueDate: '2026-09-10',
    paidDate: '2026-09-04',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-10',
    studentId: 'stu-10',
    studentName: 'Avani Deshmukh',
    class: 'LKG',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5300,
    quarterlyFee: 15900,
    annualFee: 63600,
    totalAmount: 5300,
    paidAmount: 0,
    dueDate: '2026-09-10',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-11',
    studentId: 'stu-11',
    studentName: 'Advait Joshi',
    class: 'LKG',
    section: 'B',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 2700,
    quarterlyFee: 8100,
    annualFee: 32400,
    totalAmount: 2700,
    paidAmount: 2700,
    dueDate: '2026-09-10',
    paidDate: '2026-09-02',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans-res']
  },

  // UKG
  {
    id: 'fee-12',
    studentId: 'stu-12',
    studentName: 'Tanvi Nair',
    class: 'UKG',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5500,
    quarterlyFee: 16500,
    annualFee: 66000,
    totalAmount: 5500,
    paidAmount: 5500,
    dueDate: '2026-09-10',
    paidDate: '2026-09-01',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-13',
    studentId: 'stu-13',
    studentName: 'Samar Mehra',
    class: 'UKG',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 2800,
    quarterlyFee: 8400,
    annualFee: 33600,
    totalAmount: 2800,
    paidAmount: 0,
    dueDate: '2026-08-31',
    paidDate: null,
    status: 'overdue',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-3',
    studentId: 'stu-3',
    studentName: 'Rohan Verma',
    class: 'UKG',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5500,
    quarterlyFee: 16500,
    annualFee: 66000,
    totalAmount: 5500,
    paidAmount: 0,
    dueDate: '2026-09-10',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-14',
    studentId: 'stu-14',
    studentName: 'Sia Singhania',
    class: 'UKG',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 5500,
    quarterlyFee: 16500,
    annualFee: 66000,
    totalAmount: 5500,
    paidAmount: 5500,
    dueDate: '2026-09-10',
    paidDate: '2026-09-05',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },

  // Class 1
  {
    id: 'fee-15',
    studentId: 'stu-15',
    studentName: 'Aarohi Sen',
    class: '1',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 6000,
    quarterlyFee: 18000,
    annualFee: 72000,
    totalAmount: 6000,
    paidAmount: 6000,
    dueDate: '2026-09-10',
    paidDate: '2026-09-03',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-16',
    studentId: 'stu-16',
    studentName: 'Devansh Agarwal',
    class: '1',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 3200,
    quarterlyFee: 9600,
    annualFee: 38400,
    totalAmount: 3200,
    paidAmount: 1600,
    dueDate: '2026-09-10',
    paidDate: '2026-09-07',
    status: 'partial',
    selectedOptionalComponents: ['fc-trans-res']
  },

  // Class 5
  {
    id: 'fee-17',
    studentId: 'stu-17',
    studentName: 'Pranav Pillai',
    class: '5',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 6500,
    paidAmount: 6500,
    dueDate: '2026-09-10',
    paidDate: '2026-09-02',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-18',
    studentId: 'stu-18',
    studentName: 'Anika Saxena',
    class: '5',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 3500,
    quarterlyFee: 10500,
    annualFee: 42000,
    totalAmount: 3500,
    paidAmount: 3500,
    dueDate: '2026-09-10',
    paidDate: '2026-09-05',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-19',
    studentId: 'stu-19',
    studentName: 'Shaurya Tiwari',
    class: '5',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 6500,
    paidAmount: 0,
    dueDate: '2026-09-10',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-20',
    studentId: 'stu-20',
    studentName: 'Meera Nambiar',
    class: '5',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Monthly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 6500,
    paidAmount: 6500,
    dueDate: '2026-09-10',
    paidDate: '2026-09-04',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },

  // Class 9
  {
    id: 'fee-21',
    studentId: 'stu-21',
    studentName: 'Aditya Roy',
    class: '9',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6166,
    quarterlyFee: 18500,
    annualFee: 74000,
    totalAmount: 18500,
    paidAmount: 18500,
    dueDate: '2026-09-15',
    paidDate: '2026-09-03',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-22',
    studentId: 'stu-22',
    studentName: 'Riya Banerjee',
    class: '9',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 3083,
    quarterlyFee: 9250,
    annualFee: 37000,
    totalAmount: 9250,
    paidAmount: 5000,
    dueDate: '2026-09-15',
    paidDate: '2026-09-08',
    status: 'partial',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-23',
    studentId: 'stu-23',
    studentName: 'Neil Chatterjee',
    class: '9',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6166,
    quarterlyFee: 18500,
    annualFee: 74000,
    totalAmount: 18500,
    paidAmount: 0,
    dueDate: '2026-08-31',
    paidDate: null,
    status: 'overdue',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-24',
    studentId: 'stu-24',
    studentName: 'Pooja Hegde',
    class: '9',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6166,
    quarterlyFee: 18500,
    annualFee: 74000,
    totalAmount: 18500,
    paidAmount: 18500,
    dueDate: '2026-09-15',
    paidDate: '2026-09-06',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },

  // Class 10
  {
    id: 'fee-4',
    studentId: 'stu-4',
    studentName: 'Ananya Iyer',
    class: '10',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 7100,
    quarterlyFee: 21300,
    annualFee: 85200,
    totalAmount: 21300,
    paidAmount: 21300,
    dueDate: '2026-09-15',
    paidDate: '2026-09-02',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans', 'fc-lab']
  },
  {
    id: 'fee-6',
    studentId: 'stu-6',
    studentName: 'Ishaan Gupta',
    class: '10',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 19500,
    paidAmount: 10000,
    dueDate: '2026-09-15',
    paidDate: '2026-09-07',
    status: 'partial',
    overrideAmount: 19500,
    overrideRemarks: 'Sibling concession 10%',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-25',
    studentId: 'stu-25',
    studentName: 'Yashwardhan Rathore',
    class: '10',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 3250,
    quarterlyFee: 9750,
    annualFee: 39000,
    totalAmount: 9750,
    paidAmount: 9750,
    dueDate: '2026-09-15',
    paidDate: '2026-09-05',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-26',
    studentId: 'stu-26',
    studentName: 'Sara Ali',
    class: '10',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 19500,
    paidAmount: 0,
    dueDate: '2026-09-15',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-5',
    studentId: 'stu-5',
    studentName: 'Kabir Khan',
    class: '10',
    section: 'B',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 3250,
    quarterlyFee: 9750,
    annualFee: 39000,
    totalAmount: 9750,
    paidAmount: 0,
    dueDate: '2026-08-31',
    paidDate: null,
    status: 'overdue',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-27',
    studentId: 'stu-27',
    studentName: 'Sneha Kulkarni',
    class: '10',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 19500,
    paidAmount: 19500,
    dueDate: '2026-09-15',
    paidDate: '2026-09-01',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-28',
    studentId: 'stu-28',
    studentName: 'Aryan Bhatt',
    class: '10',
    section: 'B',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 19500,
    paidAmount: 19500,
    dueDate: '2026-09-15',
    paidDate: '2026-09-04',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-29',
    studentId: 'stu-29',
    studentName: 'Dhruv Pandey',
    class: '10',
    section: 'C',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 6500,
    quarterlyFee: 19500,
    annualFee: 78000,
    totalAmount: 19500,
    paidAmount: 0,
    dueDate: '2026-09-15',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-30',
    studentId: 'stu-30',
    studentName: 'Kriti Varma',
    class: '10',
    section: 'C',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 3250,
    quarterlyFee: 9750,
    annualFee: 39000,
    totalAmount: 9750,
    paidAmount: 9750,
    dueDate: '2026-09-15',
    paidDate: '2026-09-02',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans-res']
  },

  // Class 11 & 12
  {
    id: 'fee-31',
    studentId: 'stu-31',
    studentName: 'Harshit Singhal',
    class: '11',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 7500,
    quarterlyFee: 22500,
    annualFee: 90000,
    totalAmount: 22500,
    paidAmount: 22500,
    dueDate: '2026-09-15',
    paidDate: '2026-09-01',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-32',
    studentId: 'stu-32',
    studentName: 'Radhika Madan',
    class: '11',
    section: 'A',
    category: 'reservation',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 3750,
    quarterlyFee: 11250,
    annualFee: 45000,
    totalAmount: 11250,
    paidAmount: 6000,
    dueDate: '2026-09-15',
    paidDate: '2026-09-09',
    status: 'partial',
    selectedOptionalComponents: ['fc-trans-res']
  },
  {
    id: 'fee-33',
    studentId: 'stu-33',
    studentName: 'Siddharth Menon',
    class: '12',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 8000,
    quarterlyFee: 24000,
    annualFee: 96000,
    totalAmount: 24000,
    paidAmount: 24000,
    dueDate: '2026-09-15',
    paidDate: '2026-09-03',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  },
  {
    id: 'fee-34',
    studentId: 'stu-34',
    studentName: 'Tanya Chawla',
    class: '12',
    section: 'A',
    category: 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: 'Quarterly',
    monthlyFee: 8000,
    quarterlyFee: 24000,
    annualFee: 96000,
    totalAmount: 24000,
    paidAmount: 24000,
    dueDate: '2026-09-15',
    paidDate: '2026-09-06',
    status: 'paid',
    selectedOptionalComponents: ['fc-trans']
  }
];

export const initialLeaves: LeaveRequest[] = [
  {
    id: 'lv-1',
    employeeId: 'emp-1',
    employeeName: 'Anita Sharma',
    employeeRole: 'teacher',
    designation: 'Senior Mathematics Teacher',
    leaveType: 'Casual Leave',
    isPaid: true,
    startDate: '2026-09-15',
    endDate: '2026-09-16',
    daysCount: 2,
    reason: 'Family wedding ceremony at hometown',
    status: 'pending',
    appliedDate: '2026-09-10'
  },
  {
    id: 'lv-2',
    employeeId: 'emp-2',
    employeeName: 'Vikram Mehta',
    employeeRole: 'teacher',
    designation: 'Head of Science Department',
    leaveType: 'Sick Leave',
    isPaid: true,
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    daysCount: 2,
    reason: 'Viral fever and doctor consultation',
    status: 'approved',
    appliedDate: '2026-09-08',
    approvedBy: 'Admin'
  },
  {
    id: 'lv-3',
    employeeId: 'emp-4',
    employeeName: 'Rohan Deshmukh',
    employeeRole: 'admin',
    designation: 'Chief Accounts Officer',
    leaveType: 'Earned Leave',
    isPaid: true,
    startDate: '2026-09-20',
    endDate: '2026-09-25',
    daysCount: 6,
    reason: 'Annual family vacation',
    status: 'pending',
    appliedDate: '2026-09-09'
  },
  {
    id: 'lv-4',
    employeeId: 'emp-5',
    employeeName: 'Dinesh Chandra',
    employeeRole: 'support',
    designation: 'Transport & Fleet Supervisor',
    leaveType: 'Casual Leave',
    isPaid: false,
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    daysCount: 2,
    reason: 'Personal urgent work (exceeded quota)',
    status: 'rejected',
    rejectionReason: 'Transport audit scheduled on the same dates; minimum staff required.',
    appliedDate: '2026-08-20',
    approvedBy: 'Admin'
  }
];

export const initialCirculars: CircularItem[] = [
  {
    id: 'circ-1',
    title: 'Mid-Term Examination Schedule & Guidelines 2026',
    content: 'The Mid-Term Examinations for classes Nursery to 12th will commence from September 25, 2026. Detailed timetable and room seating plans are attached.',
    date: '2026-09-08',
    targetAudience: 'All',
    priority: 'Urgent',
    author: 'Principal Office',
    attachment: {
      name: 'MidTerm_Exam_Schedule_2026.pdf',
      size: '1.4 MB',
      type: 'application/pdf'
    }
  },
  {
    id: 'circ-2',
    title: 'Teacher Training Workshop on Digital Pedagogy',
    content: 'A mandatory professional development seminar on interactive smart boards and digital lesson planning will be held on Saturday, September 19, in the Auditorium.',
    date: '2026-09-06',
    targetAudience: 'Teachers',
    priority: 'Normal',
    author: 'Academic Council',
    attachment: {
      name: 'Workshop_Agenda_Sept2026.docx',
      size: '480 KB',
      type: 'application/msword'
    }
  },
  {
    id: 'circ-3',
    title: 'Annual Sports Meet Trials & Team Selections',
    content: 'Inter-house athletic trials for Track & Field, Football, Badminton, and Basketball will begin next Monday. Students should register with sports instructors.',
    date: '2026-09-02',
    targetAudience: 'Students',
    priority: 'Normal',
    author: 'Sports Department',
    attachment: {
      name: 'Sports_Trials_Schedule.pdf',
      size: '850 KB',
      type: 'application/pdf'
    }
  },
  {
    id: 'circ-4',
    title: 'Parent-Teacher Interaction Meeting (Classes 9 to 12)',
    content: 'Quarterly review meetings with subject mentors to discuss academic performance, attendance, and preparation for board examinations.',
    date: '2026-08-28',
    targetAudience: 'All',
    priority: 'Normal',
    author: 'Admin Office'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'teacher_leave',
    title: 'Teacher Leave Request',
    message: 'Anita Sharma (Mathematics) has submitted a Casual Leave request for 2 days (15 Sep - 16 Sep).',
    timestamp: '10 mins ago',
    priority: 'High',
    read: false,
    actionUrl: 'leaves'
  },
  {
    id: 'notif-2',
    type: 'teacher_message',
    title: 'Message from Vikram Mehta',
    message: '"Physics laboratory equipment checklist for Class 10 practicals has been updated."',
    timestamp: '35 mins ago',
    priority: 'Normal',
    read: false,
    actionUrl: 'messages'
  },
  {
    id: 'notif-3',
    type: 'fee_alert',
    title: 'Fee Payment Reminder',
    message: 'Kabir Khan (Class 10-B) quarterly fee is overdue by 11 days. Total outstanding: ₹9,750.',
    timestamp: '2 hours ago',
    priority: 'Urgent',
    read: false,
    actionUrl: 'fees'
  },
  {
    id: 'notif-4',
    type: 'transport_alert',
    title: 'Vehicle Fitness Certificate Due',
    message: 'Bus R-103 (DL-01-EF-9012) fitness certificate expires on 15 Oct 2026. Schedule inspection.',
    timestamp: '5 hours ago',
    priority: 'High',
    read: true,
    actionUrl: 'transportation'
  },
  {
    id: 'notif-5',
    type: 'system_circular',
    title: 'New Circular Published',
    message: 'Mid-Term Examination Schedule & Guidelines 2026 published for All users.',
    timestamp: '1 day ago',
    priority: 'Normal',
    read: true,
    actionUrl: 'circulars'
  }
];

export const initialConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    participantId: 'emp-1',
    participantName: 'Anita Sharma',
    participantRole: 'Teacher',
    lastMessage: 'Good morning Admin. Have the exam papers for Class 10 Math been printed?',
    lastMessageTime: '10:45 AM',
    unreadCount: 2,
    onlineStatus: true
  },
  {
    id: 'conv-2',
    participantId: 'emp-2',
    participantName: 'Vikram Mehta',
    participantRole: 'Teacher',
    lastMessage: 'I have approved the science lab consumables request.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    onlineStatus: false
  },
  {
    id: 'conv-3',
    participantId: 'stu-4',
    participantName: 'Ananya Iyer',
    participantRole: 'Student',
    participantClass: 'Class 10-A',
    lastMessage: 'Thank you Sir for clarifying the physics project submission date.',
    lastMessageTime: 'Sep 09',
    unreadCount: 0,
    onlineStatus: true
  },
  {
    id: 'conv-4',
    participantId: 'stu-6',
    participantName: 'Ishaan Gupta',
    participantRole: 'Student',
    participantClass: 'Class 10-A',
    lastMessage: 'Can I get the syllabus copy for the upcoming unit test?',
    lastMessageTime: 'Sep 08',
    unreadCount: 1,
    onlineStatus: false
  }
];

export const initialMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    { id: 'm-1', conversationId: 'conv-1', senderId: 'emp-1', senderName: 'Anita Sharma', senderRole: 'teacher', text: 'Good morning Admin. Hope you are well.', timestamp: '10:40 AM', isRead: true },
    { id: 'm-2', conversationId: 'conv-1', senderId: 'emp-1', senderName: 'Anita Sharma', senderRole: 'teacher', text: 'Have the exam papers for Class 10 Math been printed?', timestamp: '10:45 AM', isRead: false }
  ],
  'conv-2': [
    { id: 'm-3', conversationId: 'conv-2', senderId: 'admin', senderName: 'Admin', senderRole: 'admin', text: 'Hello Vikram, please review the lab supplies.', timestamp: 'Yesterday', isRead: true },
    { id: 'm-4', conversationId: 'conv-2', senderId: 'emp-2', senderName: 'Vikram Mehta', senderRole: 'teacher', text: 'I have approved the science lab consumables request.', timestamp: 'Yesterday', isRead: true }
  ],
  'conv-3': [
    { id: 'm-5', conversationId: 'conv-3', senderId: 'stu-4', senderName: 'Ananya Iyer', senderRole: 'student', text: 'Sir, what is the deadline for the physics seminar report?', timestamp: 'Sep 09', isRead: true },
    { id: 'm-6', conversationId: 'admin', senderId: 'admin', senderName: 'Admin', senderRole: 'admin', text: 'The deadline is next Friday at 4 PM.', timestamp: 'Sep 09', isRead: true },
    { id: 'm-7', conversationId: 'conv-3', senderId: 'stu-4', senderName: 'Ananya Iyer', senderRole: 'student', text: 'Thank you Sir for clarifying the physics project submission date.', timestamp: 'Sep 09', isRead: true }
  ],
  'conv-4': [
    { id: 'm-8', conversationId: 'conv-4', senderId: 'stu-6', senderName: 'Ishaan Gupta', senderRole: 'student', text: 'Can I get the syllabus copy for the upcoming unit test?', timestamp: 'Sep 08', isRead: false }
  ]
};

// Schools / Campuses
export const initialSchools: SchoolProfile[] = [
  {
    id: 'sch-1',
    name: 'Delhi Public Senior Secondary School - Main Campus',
    code: 'DPSS-01',
    affiliationNo: 'CBSE-AFF/2026/11092',
    address: 'Sector 14, Phase 2, Institutional Area',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91 11 2890 1234',
    email: 'info.main@dpschool.edu.in',
    principalName: 'Dr. Arvind Swaminathan',
    establishedYear: 1998,
    status: 'Active',
    logo_url: ''
  },
  {
    id: 'sch-2',
    name: 'Delhi Public School - City North Campus',
    code: 'DPSS-02',
    affiliationNo: 'CBSE-AFF/2026/11093',
    address: 'Plot 5A, Knowledge Park, GT Karnal Road',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91 11 2890 5678',
    email: 'north.campus@dpschool.edu.in',
    principalName: 'Mrs. Shweta Mukherjee',
    establishedYear: 2009,
    status: 'Active',
    logo_url: ''
  },
  {
    id: 'sch-3',
    name: 'Delhi Public International Campus - Gurugram',
    code: 'DPSS-03',
    affiliationNo: 'CBSE-AFF/2026/11094',
    address: 'Golf Course Extension Road, Sector 56',
    city: 'Gurugram',
    state: 'Haryana',
    phone: '+91 124 456 7890',
    email: 'gurugram.intl@dpschool.edu.in',
    principalName: 'Mr. Rajat Banerjee',
    establishedYear: 2016,
    status: 'Active',
    logo_url: ''
  }
];

// Departments
export const initialDepartments: DepartmentItem[] = [
  { id: 'dept-1', name: 'Mathematics', description: 'Pure & Applied Mathematics, Statistics & Vedic Math', headOfDepartment: 'Anita Sharma', staffCount: 6 },
  { id: 'dept-2', name: 'Science', description: 'Physics, Chemistry, Biology & Laboratory Sciences', headOfDepartment: 'Vikram Mehta', staffCount: 8 },
  { id: 'dept-3', name: 'Languages', description: 'English, Hindi, Sanskrit & Foreign Languages', headOfDepartment: 'Priya Joshi', staffCount: 7 },
  { id: 'dept-4', name: 'Social Studies', description: 'History, Civics, Geography & Economics', headOfDepartment: 'Ramanathan Iyer', staffCount: 5 },
  { id: 'dept-5', name: 'Computer Science & IT', description: 'Computer Applications, Artificial Intelligence & Robotics', headOfDepartment: 'Rajesh Nair', staffCount: 4 },
  { id: 'dept-6', name: 'Pre-Primary Education', description: 'Early Childhood Care, Nursery & Kindergarten', headOfDepartment: 'Sunita Patel', staffCount: 6 },
  { id: 'dept-7', name: 'Finance & Accounts', description: 'Fee billing, payroll, procurement and budgeting', headOfDepartment: 'Rohan Deshmukh', staffCount: 4 },
  { id: 'dept-8', name: 'Administration', description: 'Admissions, student records and general operations', headOfDepartment: 'Kavita Rao', staffCount: 5 },
  { id: 'dept-9', name: 'Transport & Logistics', description: 'School buses, routes, maintenance and GPS safety', headOfDepartment: 'Dinesh Chandra', staffCount: 8 },
  { id: 'dept-10', name: 'Library & Information', description: 'Books, academic periodicals and digital library archives', headOfDepartment: 'Meenakshi Sundaram', staffCount: 3 }
];

// Designations
export const initialDesignations: DesignationItem[] = [
  { id: 'desig-1', name: 'Senior PGT Teacher', description: 'Post Graduate Teacher for senior secondary classes' },
  { id: 'desig-2', name: 'TGT Teacher', description: 'Trained Graduate Teacher for secondary classes' },
  { id: 'desig-3', name: 'PRT Teacher', description: 'Primary Teacher for elementary education' },
  { id: 'desig-4', name: 'Pre-Primary Coordinator', description: 'Coordinator for Nursery, LKG & UKG' },
  { id: 'desig-5', name: 'Head of Department', description: 'Academic lead and curriculum supervisor' },
  { id: 'desig-6', name: 'Chief Accounts Officer', description: 'Head of fee accounting and financials' },
  { id: 'desig-7', name: 'Senior Registrar', description: 'Admissions and academic documentation controller' },
  { id: 'desig-8', name: 'Transport Supervisor', description: 'Fleet controller and route coordinator' },
  { id: 'desig-9', name: 'Head Librarian', description: 'Library catalog and digital resources manager' },
  { id: 'desig-10', name: 'Laboratory Assistant', description: 'Physics, Chemistry & Biology lab technician' }
];

// Academic Subjects
export const initialSubjects: AcademicSubject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-1', teacherName: 'Anita Sharma', weeklyHours: 6, subjectType: 'Core', maxMarks: 100 },
  { id: 'sub-2', name: 'Physics', code: 'PHY-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-2', teacherName: 'Vikram Mehta', weeklyHours: 5, subjectType: 'Core', maxMarks: 100 },
  { id: 'sub-3', name: 'Chemistry', code: 'CHEM-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-2', teacherName: 'Vikram Mehta', weeklyHours: 4, subjectType: 'Core', maxMarks: 100 },
  { id: 'sub-4', name: 'English Literature', code: 'ENG-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-4', teacherName: 'Priya Joshi', weeklyHours: 5, subjectType: 'Language', maxMarks: 100 },
  { id: 'sub-5', name: 'Computer Applications Lab', code: 'CS-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-5', teacherName: 'Rajesh Nair', coTeacherId: 'emp-1', coTeacherName: 'Anita Sharma', weeklyHours: 4, subjectType: 'Practical', maxMarks: 100 },
  { id: 'sub-6', name: 'Social Studies', code: 'SST-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-4', teacherName: 'Priya Joshi', weeklyHours: 4, subjectType: 'Core', maxMarks: 100 },
  { id: 'sub-7', name: 'Early Numeracy & Phonics', code: 'NUR-01', classId: 'c-nursery', className: 'Nursery', sectionName: 'A', teacherId: 'emp-3', teacherName: 'Sunita Patel', weeklyHours: 8, subjectType: 'Core', maxMarks: 50 },
  { id: 'sub-8', name: 'Foundational English & Rhymes', code: 'LKG-01', classId: 'c-lkg', className: 'LKG', sectionName: 'A', teacherId: 'emp-3', teacherName: 'Sunita Patel', weeklyHours: 8, subjectType: 'Language', maxMarks: 50 },
  { id: 'sub-9', name: 'General Science & Environment', code: 'UKG-01', classId: 'c-ukg', className: 'UKG', sectionName: 'B', teacherId: 'emp-3', teacherName: 'Sunita Patel', weeklyHours: 6, subjectType: 'Core', maxMarks: 50 },
  { id: 'sub-10', name: 'Environmental Studies', code: 'EVS-05', classId: 'c-5', className: '5', sectionName: 'A', teacherId: 'emp-4', teacherName: 'Priya Joshi', weeklyHours: 5, subjectType: 'Core', maxMarks: 100 },
  { id: 'sub-11', name: 'Art & Design', code: 'ART-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-3', teacherName: 'Sunita Patel', weeklyHours: 2, subjectType: 'Co-Scholastic', maxMarks: 50 },
  { id: 'sub-12', name: 'Physical Education & Yoga', code: 'PED-10', classId: 'c-10', className: '10', sectionName: 'A', teacherId: 'emp-5', teacherName: 'Rajesh Nair', weeklyHours: 3, subjectType: 'Co-Scholastic', maxMarks: 50 }
];

// Exams
export const initialExams: ExamSchedule[] = [
  {
    id: 'exam-1',
    name: 'Mid-Term Examination 2026',
    academicYear: '2026-2027',
    classId: 'c-10',
    className: '10',
    startDate: '2026-09-25',
    endDate: '2026-10-08',
    status: 'scheduled'
  },
  {
    id: 'exam-2',
    name: 'Unit Assessment Test - 1',
    academicYear: '2026-2027',
    classId: 'c-10',
    className: '10',
    startDate: '2026-08-10',
    endDate: '2026-08-18',
    status: 'completed'
  },
  {
    id: 'exam-3',
    name: 'Pre-Primary Term 1 Rhymes & Assessment',
    academicYear: '2026-2027',
    classId: 'c-nursery',
    className: 'Nursery',
    startDate: '2026-09-20',
    endDate: '2026-09-24',
    status: 'ongoing'
  },
  {
    id: 'exam-4',
    name: 'Class 5 Primary Foundation Exam',
    academicYear: '2026-2027',
    classId: 'c-5',
    className: '5',
    startDate: '2026-09-28',
    endDate: '2026-10-05',
    status: 'scheduled'
  }
];

// Exam Results
export const initialExamResults: ExamResultRecord[] = [
  {
    id: 'res-1',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-4',
    studentName: 'Ananya Iyer',
    class: '10',
    section: 'A',
    rollNumber: '12',
    subjectId: 'sub-1',
    subjectName: 'Mathematics',
    marksObtained: 94,
    maxMarks: 100,
    percentage: 94,
    grade: 'A1',
    remarks: 'Exceptional problem solving & analytical precision.'
  },
  {
    id: 'res-2',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-4',
    studentName: 'Ananya Iyer',
    class: '10',
    section: 'A',
    rollNumber: '12',
    subjectId: 'sub-2',
    subjectName: 'Physics',
    marksObtained: 91,
    maxMarks: 100,
    percentage: 91,
    grade: 'A1',
    remarks: 'Excellent concept clarity.'
  },
  {
    id: 'res-3',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-4',
    studentName: 'Ananya Iyer',
    class: '10',
    section: 'A',
    rollNumber: '12',
    subjectId: 'sub-4',
    subjectName: 'English Literature',
    marksObtained: 88,
    maxMarks: 100,
    percentage: 88,
    grade: 'A2',
    remarks: 'Great expression and vocabulary.'
  },
  {
    id: 'res-4',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-6',
    studentName: 'Ishaan Gupta',
    class: '10',
    section: 'A',
    rollNumber: '21',
    subjectId: 'sub-1',
    subjectName: 'Mathematics',
    marksObtained: 82,
    maxMarks: 100,
    percentage: 82,
    grade: 'A2',
    remarks: 'Very good score; review trigonometry proofs.'
  },
  {
    id: 'res-5',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-6',
    studentName: 'Ishaan Gupta',
    class: '10',
    section: 'A',
    rollNumber: '21',
    subjectId: 'sub-2',
    subjectName: 'Physics',
    marksObtained: 85,
    maxMarks: 100,
    percentage: 85,
    grade: 'A2',
    remarks: 'Strong numerical solving ability.'
  },
  {
    id: 'res-6',
    examId: 'exam-2',
    examName: 'Unit Assessment Test - 1',
    studentId: 'stu-5',
    studentName: 'Kabir Khan',
    class: '10',
    section: 'B',
    rollNumber: '18',
    subjectId: 'sub-1',
    subjectName: 'Mathematics',
    marksObtained: 76,
    maxMarks: 100,
    percentage: 76,
    grade: 'B1',
    remarks: 'Good effort; needs more practice in algebra.'
  }
];

// Inventory & Library Assets
export const initialInventory: InventoryItem[] = [
  { id: 'inv-1', title: 'NCERT Exemplar Mathematics (Class 10)', author: 'NCERT Editorial Board', category: 'Library', quantity: 45, availableQuantity: 38, rackNumber: 'Rack-A-04', condition: 'Good', unitPrice: 220 },
  { id: 'inv-2', title: 'Concepts of Physics (Vol 1 & 2)', author: 'Dr. H.C. Verma', category: 'Library', quantity: 30, availableQuantity: 24, rackNumber: 'Rack-B-02', condition: 'Good', unitPrice: 480 },
  { id: 'inv-3', title: 'Oxford Advanced Learner Dictionary (10th Ed)', author: 'Oxford University Press', category: 'Library', quantity: 20, availableQuantity: 18, rackNumber: 'Rack-C-01', condition: 'New', unitPrice: 750 },
  { id: 'inv-4', title: 'Wings of Fire: An Autobiography', author: 'Dr. A.P.J. Abdul Kalam', category: 'Library', quantity: 15, availableQuantity: 12, rackNumber: 'Rack-E-03', condition: 'Good', unitPrice: 350 },
  { id: 'inv-5', title: 'Advanced Optical Compound Microscope Set', author: 'LabScientific Instruments', category: 'Laboratory', quantity: 12, availableQuantity: 11, rackNumber: 'Lab-Bio-Cab-1', condition: 'Good', unitPrice: 8500 },
  { id: 'inv-6', title: 'Digital Spectrophotometer & Optics Kit', author: 'Apex Science Works', category: 'Laboratory', quantity: 6, availableQuantity: 6, rackNumber: 'Lab-Phy-Cab-2', condition: 'New', unitPrice: 16500 },
  { id: 'inv-7', title: 'Spalding Tournament Basketballs (Size 7)', author: 'Spalding Sports', category: 'Sports', quantity: 25, availableQuantity: 20, rackNumber: 'Sports-Locker-01', condition: 'Good', unitPrice: 1200 },
  { id: 'inv-8', title: 'Dell OptiPlex 3080 Desktop Computers', author: 'Dell Technologies', category: 'IT Equipment', quantity: 35, availableQuantity: 35, rackNumber: 'Computer Lab 2', condition: 'Good', unitPrice: 42000 },
  { id: 'inv-9', title: 'Epson Interactive Laser Classroom Projector', author: 'Epson India', category: 'IT Equipment', quantity: 8, availableQuantity: 8, rackNumber: 'Smart Rooms 1-8', condition: 'New', unitPrice: 58000 }
];

// Student Daily Attendance Records
export const initialStudentAttendance: StudentAttendanceRecord[] = [
  // Today (2026-09-11)
  { id: 'att-1', studentId: 'stu-1', studentName: 'Aarav Sharma', rollNumber: '01', class: 'Nursery', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:05 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-2', studentId: 'stu-7', studentName: 'Mira Rajput', rollNumber: '02', class: 'Nursery', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:05 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-3', studentId: 'stu-8', studentName: 'Vihaan Malhotra', rollNumber: '03', class: 'Nursery', section: 'A', date: '2026-09-11', status: 'Absent', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:05 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-4', studentId: 'stu-2', studentName: 'Diya Kaur', rollNumber: '01', class: 'LKG', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:08 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-5', studentId: 'stu-9', studentName: 'Reyansh Patil', rollNumber: '02', class: 'LKG', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:08 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-6', studentId: 'stu-10', studentName: 'Avani Deshmukh', rollNumber: '01', class: 'LKG', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:10 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-7', studentId: 'stu-11', studentName: 'Advait Joshi', rollNumber: '02', class: 'LKG', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:10 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-8', studentId: 'stu-12', studentName: 'Tanvi Nair', rollNumber: '01', class: 'UKG', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:12 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-9', studentId: 'stu-13', studentName: 'Samar Mehra', rollNumber: '02', class: 'UKG', section: 'A', date: '2026-09-11', status: 'Late', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:35 AM', source: 'Teacher Mobile App', isOverridden: false, overrideRemarks: 'Arrived at 08:35 AM with parent' },
  { id: 'att-10', studentId: 'stu-3', studentName: 'Rohan Verma', rollNumber: '01', class: 'UKG', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:14 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-11', studentId: 'stu-14', studentName: 'Sia Singhania', rollNumber: '02', class: 'UKG', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Sunita Patel', markedByRole: 'Teacher', markedAt: '08:14 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-12', studentId: 'stu-15', studentName: 'Aarohi Sen', rollNumber: '01', class: '1', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:15 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-13', studentId: 'stu-16', studentName: 'Devansh Agarwal', rollNumber: '02', class: '1', section: 'A', date: '2026-09-11', status: 'Excused', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:15 AM', source: 'Teacher Mobile App', isOverridden: false, overrideRemarks: 'Medical leave informed by parent' },
  { id: 'att-14', studentId: 'stu-17', studentName: 'Pranav Pillai', rollNumber: '01', class: '5', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:18 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-15', studentId: 'stu-18', studentName: 'Anika Saxena', rollNumber: '02', class: '5', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:18 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-16', studentId: 'stu-19', studentName: 'Shaurya Tiwari', rollNumber: '01', class: '5', section: 'B', date: '2026-09-11', status: 'Absent', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:20 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-17', studentId: 'stu-20', studentName: 'Meera Nambiar', rollNumber: '02', class: '5', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Priya Joshi', markedByRole: 'Teacher', markedAt: '08:20 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-18', studentId: 'stu-21', studentName: 'Aditya Roy', rollNumber: '01', class: '9', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:10 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-19', studentId: 'stu-22', studentName: 'Riya Banerjee', rollNumber: '02', class: '9', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:10 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-20', studentId: 'stu-23', studentName: 'Neil Chatterjee', rollNumber: '01', class: '9', section: 'B', date: '2026-09-11', status: 'Absent', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:12 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-21', studentId: 'stu-24', studentName: 'Pooja Hegde', rollNumber: '02', class: '9', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:12 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-22', studentId: 'stu-4', studentName: 'Ananya Iyer', rollNumber: '01', class: '10', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:02 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-23', studentId: 'stu-6', studentName: 'Ishaan Gupta', rollNumber: '02', class: '10', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:02 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-24', studentId: 'stu-25', studentName: 'Yashwardhan Rathore', rollNumber: '03', class: '10', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:02 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-25', studentId: 'stu-26', studentName: 'Sara Ali', rollNumber: '04', class: '10', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:02 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-26', studentId: 'stu-5', studentName: 'Kabir Khan', rollNumber: '01', class: '10', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Admin', markedByRole: 'Admin', markedAt: '09:15 AM', source: 'Admin Portal', isOverridden: true, overrideRemarks: 'Admin override: Bus R-102 transit breakdown verified', overrideBy: 'Admin', overrideAt: '09:15 AM' },
  { id: 'att-27', studentId: 'stu-27', studentName: 'Sneha Kulkarni', rollNumber: '02', class: '10', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:06 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-28', studentId: 'stu-28', studentName: 'Aryan Bhatt', rollNumber: '03', class: '10', section: 'B', date: '2026-09-11', status: 'Present', markedBy: 'Vikram Mehta', markedByRole: 'Teacher', markedAt: '08:06 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-29', studentId: 'stu-29', studentName: 'Dhruv Pandey', rollNumber: '01', class: '10', section: 'C', date: '2026-09-11', status: 'Late', markedBy: 'Rajesh Nair', markedByRole: 'Teacher', markedAt: '08:42 AM', source: 'Teacher Mobile App', isOverridden: false, overrideRemarks: 'Doctor appointment morning delay' },
  { id: 'att-30', studentId: 'stu-30', studentName: 'Kriti Varma', rollNumber: '02', class: '10', section: 'C', date: '2026-09-11', status: 'Present', markedBy: 'Rajesh Nair', markedByRole: 'Teacher', markedAt: '08:05 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-31', studentId: 'stu-31', studentName: 'Harshit Singhal', rollNumber: '01', class: '11', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Rajesh Nair', markedByRole: 'Teacher', markedAt: '08:15 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-32', studentId: 'stu-32', studentName: 'Radhika Madan', rollNumber: '02', class: '11', section: 'A', date: '2026-09-11', status: 'Half Day', markedBy: 'Rajesh Nair', markedByRole: 'Teacher', markedAt: '08:15 AM', source: 'Teacher Mobile App', isOverridden: false, overrideRemarks: 'Approved early departure 12:30 PM' },
  { id: 'att-33', studentId: 'stu-33', studentName: 'Siddharth Menon', rollNumber: '01', class: '12', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:00 AM', source: 'Teacher Mobile App', isOverridden: false },
  { id: 'att-34', studentId: 'stu-34', studentName: 'Tanya Chawla', rollNumber: '02', class: '12', section: 'A', date: '2026-09-11', status: 'Present', markedBy: 'Anita Sharma', markedByRole: 'Teacher', markedAt: '08:00 AM', source: 'Teacher Mobile App', isOverridden: false }
];

// Staff & Teacher Daily Attendance Records
export const initialStaffAttendance: StaffAttendanceRecord[] = [
  { id: 'stf-att-1', employeeId: 'emp-1', employeeName: 'Anita Sharma', employeeCode: 'TCH-001', role: 'teacher', department: 'Mathematics', designation: 'Senior Mathematics Teacher', date: '2026-09-11', status: 'Present', checkInTime: '07:45 AM', checkOutTime: '03:30 PM', markedBy: 'Biometric Sync', markedAt: '07:45 AM' },
  { id: 'stf-att-2', employeeId: 'emp-2', employeeName: 'Vikram Mehta', employeeCode: 'TCH-002', role: 'teacher', department: 'Science', designation: 'Head of Science Department', date: '2026-09-11', status: 'On Leave', markedBy: 'Admin Portal', markedAt: '08:00 AM', remarks: 'Sick Leave approved via Leave Management' },
  { id: 'stf-att-3', employeeId: 'emp-3', employeeName: 'Sunita Patel', employeeCode: 'TCH-003', role: 'teacher', department: 'Pre-Primary', designation: 'Pre-Primary Coordinator & Teacher', date: '2026-09-11', status: 'Present', checkInTime: '07:40 AM', checkOutTime: '03:30 PM', markedBy: 'Biometric Sync', markedAt: '07:40 AM' },
  { id: 'stf-att-4', employeeId: 'emp-4', employeeName: 'Rohan Deshmukh', employeeCode: 'ADM-001', role: 'admin', department: 'Administration', designation: 'Senior Administrative Officer', date: '2026-09-11', status: 'Present', checkInTime: '08:00 AM', checkOutTime: '05:00 PM', markedBy: 'Biometric Sync', markedAt: '08:00 AM' },
  { id: 'stf-att-5', employeeId: 'emp-5', employeeName: 'Rajesh Nair', employeeCode: 'TCH-004', role: 'teacher', department: 'Senior Secondary', designation: 'PGT Senior Science & Physics Faculty', date: '2026-09-11', status: 'Late', checkInTime: '08:25 AM', checkOutTime: '03:30 PM', markedBy: 'Admin Portal', markedAt: '08:30 AM', remarks: 'Traffic congestion on outer ring road' },
  { id: 'stf-att-6', employeeId: 'emp-6', employeeName: 'Meena Sharma', employeeCode: 'SUP-001', role: 'support', department: 'Operations', designation: 'Facility & Maintenance Supervisor', date: '2026-09-11', status: 'Present', checkInTime: '07:30 AM', checkOutTime: '04:00 PM', markedBy: 'Biometric Sync', markedAt: '07:30 AM' }
];


