/**
 * Test Utilities and Specification Helpers for School ERP E2E Test Suite
 * Authoritative constants and helpers derived from ORIGINAL_REQUEST.md and PROJECT.md
 */

import type {
  FeeComponent,
  FeeStructure,
  Student,
  StudentFeeRecord,
  TransportRoute
} from '../../src/services/centralData';

export const ALL_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
] as const;

export type SchoolClassName = typeof ALL_CLASSES[number];

export const ACADEMIC_STAGES = {
  'Pre-Primary': ['Nursery', 'LKG', 'UKG'],
  'Primary': ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
  'Secondary': ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
  'Senior Secondary': ['Class 11', 'Class 12']
} as const;

export const CATEGORIES = ['normal', 'reservation'] as const;
export type FeeCategory = typeof CATEGORIES[number];

export const STANDARD_COMPONENT_CODES = [
  'TUITION',
  'ANNUAL',
  'LAB',
  'LIBRARY',
  'SPORTS',
  'COMPUTER',
  'EXAM',
  'CAMPUS_DEV',
  'TRANSPORT'
] as const;

export type StandardComponentCode = typeof STANDARD_COMPONENT_CODES[number];

export const EXPECTED_TOTAL_STRUCTURES = 30; // 15 classes x 2 categories

/**
 * Normalizes an individual component's periodic fee to an annual amount based on its billing frequency.
 */
export function componentToAnnual(amount: number, frequency: 'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly'): number {
  switch (frequency) {
    case 'Monthly': return amount * 12;
    case 'Quarterly': return amount * 4;
    case 'Half yearly': return amount * 2;
    case 'Yearly': return amount;
    default: return amount * 12;
  }
}

/**
 * Normalizes an individual component's periodic fee to a monthly equivalent.
 */
export function componentToMonthly(amount: number, frequency: 'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly'): number {
  return Math.round(componentToAnnual(amount, frequency) / 12);
}

/**
 * Normalizes an individual component's periodic fee to a quarterly equivalent.
 */
export function componentToQuarterly(amount: number, frequency: 'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly'): number {
  return Math.round(componentToAnnual(amount, frequency) / 4);
}

/**
 * Authoritative reference composite fee calculation derived from R2.
 * Calculates Monthly, Quarterly, and Annual sums of mandatory components.
 */
export function referenceComputeCompositeFee(
  components: FeeComponent[],
  frequency: 'Monthly' | 'Quarterly' | 'Annually' = 'Monthly'
): { monthly: number; quarterly: number; annual: number; baseComposite: number } {
  const mandatoryComponents = components.filter(c => !c.isOptional);

  let totalAnnual = 0;
  for (const comp of mandatoryComponents) {
    totalAnnual += componentToAnnual(comp.amount, comp.frequency);
  }

  const monthly = Math.round(totalAnnual / 12);
  const quarterly = Math.round(totalAnnual / 4);
  const annual = totalAnnual;

  const baseComposite = frequency === 'Monthly'
    ? monthly
    : frequency === 'Quarterly'
      ? quarterly
      : annual;

  return { monthly, quarterly, annual, baseComposite };
}

/**
 * Factory for creating test FeeComponent instances
 */
export function createTestComponent(overrides: Partial<FeeComponent> & { name: string; amount: number }): FeeComponent {
  return {
    id: `comp-${Math.random().toString(36).substring(2, 9)}`,
    frequency: 'Monthly',
    isOptional: false,
    description: 'Test fee component',
    ...overrides
  };
}

/**
 * Factory for creating 9 standard components for testing
 */
export function createStandardNineComponents(
  className: string,
  category: 'normal' | 'reservation' = 'normal',
  transportFare = 1200
): FeeComponent[] {
  const isReservation = category === 'reservation';
  const discountFactor = isReservation ? 0.5 : 1.0;
  const isLabEligible = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(className);

  return [
    createTestComponent({
      id: `fc-tui-${className}-${category}`,
      name: 'Tuition Fee',
      amount: Math.round(2500 * discountFactor),
      frequency: 'Monthly',
      isOptional: false,
      description: 'Core academic tuition and faculty instruction'
    }),
    createTestComponent({
      id: `fc-ann-${className}-${category}`,
      name: 'Annual Function & Cultural Activity Fee',
      amount: Math.round(1800 * discountFactor),
      frequency: 'Yearly',
      isOptional: false,
      description: 'Annual day, stage events, and cultural exhibitions'
    }),
    createTestComponent({
      id: `fc-lab-${className}-${category}`,
      name: 'Laboratory & Science Practical Fee',
      amount: isLabEligible ? Math.round(800 * discountFactor) : 0,
      frequency: 'Monthly',
      isOptional: false,
      description: 'Science laboratory apparatus, chemicals, and equipment maintenance'
    }),
    createTestComponent({
      id: `fc-lib-${className}-${category}`,
      name: 'Library & Digital E-Resource Fee',
      amount: Math.round(300 * discountFactor),
      frequency: 'Monthly',
      isOptional: false,
      description: 'Library access, books, and digital portal subscription'
    }),
    createTestComponent({
      id: `fc-spo-${className}-${category}`,
      name: 'Sports, Yoga & Physical Education Fee',
      amount: Math.round(400 * discountFactor),
      frequency: 'Monthly',
      isOptional: false,
      description: 'Sports equipment, coaching, yoga, and athletic grounds'
    }),
    createTestComponent({
      id: `fc-cmp-${className}-${category}`,
      name: 'Computer Lab & Smart Class Tech Fee',
      amount: Math.round(600 * discountFactor),
      frequency: 'Monthly',
      isOptional: false,
      description: 'Computer systems, high-speed internet, and smart classroom'
    }),
    createTestComponent({
      id: `fc-exm-${className}-${category}`,
      name: 'Examination & Periodic Assessment Fee',
      amount: Math.round(1200 * discountFactor),
      frequency: 'Quarterly',
      isOptional: false,
      description: 'Printing of test papers, assessment evaluation, and report cards'
    }),
    createTestComponent({
      id: `fc-dev-${className}-${category}`,
      name: 'Campus Development & Maintenance Fee',
      amount: Math.round(2000 * discountFactor),
      frequency: 'Yearly',
      isOptional: false,
      description: 'Campus infrastructure upkeep, generator backup, and sanitation'
    }),
    createTestComponent({
      id: `fc-tra-${className}-${category}`,
      name: 'Transport Fee',
      amount: isReservation ? Math.round(transportFare * 0.75) : transportFare,
      frequency: 'Monthly',
      isOptional: true,
      description: 'Optional school transit service linked to bus route'
    })
  ];
}

/**
 * Factory for creating test FeeStructure instances
 */
export function createTestFeeStructure(overrides?: Partial<FeeStructure>): FeeStructure {
  const className = overrides?.className || 'Class 10';
  const category = overrides?.category || 'normal';
  const components = overrides?.components || createStandardNineComponents(className, category);
  const composite = referenceComputeCompositeFee(components, overrides?.collectionFrequency || 'Monthly');

  return {
    id: `fs-test-${className.toLowerCase().replace(/\s+/g, '-')}-${category}`,
    className,
    category,
    collectionFrequency: 'Monthly',
    compositeFee: composite.baseComposite,
    components,
    lateFeeFixedAmount: 250,
    dueDayOfMonth: 10,
    graceDays: 5,
    ...overrides
  };
}

/**
 * Factory for creating test Student instances
 */
export function createTestStudent(overrides?: Partial<Student>): Student {
  const id = `stu-test-${Math.random().toString(36).substring(2, 9)}`;
  return {
    id,
    studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: '2012-05-15',
    gender: 'Male',
    class: 'Class 10',
    section: 'A',
    category: 'normal',
    rollNumber: '101',
    admissionDate: '2026-04-01',
    parentName: 'Rajesh Sharma',
    parentPhone: '9876543210',
    parentEmail: 'rajesh.sharma@example.com',
    houseAddress: '123 Civil Lines',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    emergencyContact: '9876543211',
    bloodGroup: 'B+',
    isAvailingTransport: false,
    busRouteId: undefined,
    ...overrides
  };
}

/**
 * Factory for creating test TransportRoute instances
 */
export function createTestTransportRoute(overrides?: Partial<TransportRoute>): TransportRoute {
  return {
    id: `tr-test-${Math.random().toString(36).substring(2, 6)}`,
    routeNumber: 'R-101',
    routeTitle: 'North City Express',
    descriptionString: 'Stop 1 -> Stop 2 -> School Campus',
    morningPickupSchedule: '07:15 AM - 08:00 AM',
    eveningDropDuration: '02:30 PM - 03:30 PM',
    vehicleNumber: 'DL-01-AB-1234',
    vehicleType: 'Bus',
    isAC: true,
    driverId: 'drv-1',
    driverName: 'Ramesh Singh',
    driverPhone: '9811223344',
    capacity: 45,
    assignedStudentsCount: 10,
    status: 'active',
    monthlyFare: 1200,
    assetDetails: {
      insuranceExpiry: '2027-03-31',
      fitnessCertExpiry: '2027-05-15',
      pucExpiry: '2026-11-30',
      gpsInstalled: true,
      cctvInstalled: true,
      fuelType: 'CNG'
    },
    ...overrides
  } as TransportRoute;
}

/**
 * Factory for creating test StudentFeeRecord instances
 */
export function createTestFeeRecord(overrides?: Partial<StudentFeeRecord>): StudentFeeRecord {
  return {
    id: `fee-test-${Math.random().toString(36).substring(2, 9)}`,
    studentId: overrides?.studentId || 'stu-test-1',
    studentName: overrides?.studentName || 'Aarav Sharma',
    class: overrides?.class || 'Class 10',
    section: overrides?.section || 'A',
    category: overrides?.category || 'normal',
    feeType: 'Composite Fee',
    collectionFrequency: overrides?.collectionFrequency || 'Monthly',
    monthlyFee: 4500,
    quarterlyFee: 13500,
    annualFee: 54000,
    totalAmount: 4500,
    paidAmount: 0,
    dueDate: '2026-04-10',
    paidDate: null,
    status: 'pending',
    selectedOptionalComponents: [],
    ...overrides
  };
}

/**
 * Normalizes class name (e.g. 'Class 10' -> '10', '10' -> '10', 'Nursery' -> 'Nursery')
 */
export function normalizeClassName(name: string): string {
  return name.trim().replace(/^Class\s+/i, '');
}

/**
 * Checks if two class names match under normalization
 */
export function isSameClass(a: string, b: string): boolean {
  return normalizeClassName(a).toLowerCase() === normalizeClassName(b).toLowerCase();
}
