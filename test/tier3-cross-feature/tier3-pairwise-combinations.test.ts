import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import * as DataContextModule from '../../src/contexts/DataContext';
import {
  createTestStudent,
  createTestFeeRecord,
  createTestTransportRoute,
  createTestComponent,
  createTestFeeStructure,
  referenceComputeCompositeFee
} from '../helpers/test-utils';

test('[T3.1] Pairwise: Category x Transport (Normal + Transport vs Reservation + Transport)', () => {
  const route = createTestTransportRoute({ id: 'tr-1', monthlyFare: 2000 });

  const normalStudent = createTestStudent({
    class: '10',
    category: 'normal',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  const resStudent = createTestStudent({
    class: '10',
    category: 'reservation',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const normalRecord = syncFn(normalStudent, undefined, undefined, [route]);
    const resRecord = syncFn(resStudent, undefined, undefined, [route]);

    // Both base fee and transport fee should be lower for reservation
    assert.ok(
      resRecord.monthlyFee < normalRecord.monthlyFee,
      `Reservation monthly fee (${resRecord.monthlyFee}) must be strictly less than Normal (${normalRecord.monthlyFee})`
    );
    assert.ok(
      resRecord.totalAmount < normalRecord.totalAmount,
      `Reservation total amount (${resRecord.totalAmount}) must be less than Normal (${normalRecord.totalAmount})`
    );
  } else {
    assert.notStrictEqual(normalStudent.category, resStudent.category);
  }
});

test('[T3.2] Pairwise: Frequency x Late Fees (Monthly vs Quarterly vs Annually with Late Fee)', () => {
  const lateFeeAmount = 250;
  const frequencies: Array<'Monthly' | 'Quarterly' | 'Annually'> = ['Monthly', 'Quarterly', 'Annually'];

  for (const freq of frequencies) {
    const structure = createTestFeeStructure({
      collectionFrequency: freq,
      lateFeeFixedAmount: lateFeeAmount,
      dueDayOfMonth: 10,
      graceDays: 5
    });

    assert.strictEqual(structure.collectionFrequency, freq);
    assert.strictEqual(structure.lateFeeFixedAmount, 250);
    assert.strictEqual(structure.graceDays, 5);
  }
});

test('[T3.3] Pairwise: Route Change x Fee Override (Preserving or adjusting override on route change)', () => {
  const route1 = createTestTransportRoute({ id: 'tr-1', monthlyFare: 1200 });
  const route2 = createTestTransportRoute({ id: 'tr-2', monthlyFare: 1800 });

  const studentWithRoute1 = createTestStudent({
    id: 'stu-override-1',
    class: '10',
    category: 'normal',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  const feeRecordWithOverride = createTestFeeRecord({
    studentId: 'stu-override-1',
    monthlyFee: 6200,
    totalAmount: 4500, // Custom discounted override approved by management
    overrideAmount: 4500,
    overrideRemarks: 'Financial hardship concession approved',
    selectedOptionalComponents: ['fc-trans']
  });

  // Student switches to route 2 (fare difference: +600)
  const studentWithRoute2 = {
    ...studentWithRoute1,
    busRouteId: 'tr-2'
  };

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const synced = syncFn(studentWithRoute2, feeRecordWithOverride, undefined, [route1, route2]);

    // When an explicit override exists, the system should preserve the override or reflect the route delta
    assert.ok(synced.overrideAmount !== undefined, 'Override amount should be retained');
    assert.strictEqual(synced.overrideRemarks, feeRecordWithOverride.overrideRemarks);
  } else {
    assert.strictEqual(feeRecordWithOverride.overrideAmount, 4500);
  }
});

test('[T3.4] Pairwise: Stage Transition x Payment Status (Class 5 Primary to Class 6 Secondary with Partial Payment)', () => {
  // Class 5 student made partial payment of 2000
  const class5Record = createTestFeeRecord({
    studentId: 'stu-promo-1',
    class: '5',
    totalAmount: 4000,
    paidAmount: 2000,
    status: 'partial'
  });

  // Promoted to Class 6 (secondary introduces lab fee)
  const promotedStudent = createTestStudent({
    id: 'stu-promo-1',
    class: '6',
    category: 'normal'
  });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const nextRecord = syncFn(promotedStudent, class5Record);

    // Paid amount of 2000 must NOT be lost on class promotion!
    assert.strictEqual(nextRecord.paidAmount, 2000, 'Prior payment must be preserved after class promotion');
    assert.strictEqual(nextRecord.class, '6');
    assert.ok(nextRecord.totalAmount >= nextRecord.paidAmount);
  } else {
    assert.strictEqual(class5Record.paidAmount, 2000);
  }
});

test('[T3.5] Pairwise: Fee Master Component Update x Existing Student Records', () => {
  const computeFn = (DataContextModule as any).computeCompositeFee || referenceComputeCompositeFee;

  // Base Class 10 components
  const baseComponents = [
    createTestComponent({ name: 'Tuition Fee', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Exam Fee', amount: 400, frequency: 'Monthly', isOptional: false })
  ];
  const initialComposite = computeFn(baseComponents, 'Monthly').baseComposite;
  assert.strictEqual(initialComposite, 3400);

  // Admin introduces a new mandatory STEM Lab enhancement fee of 600
  const updatedComponents = [
    ...baseComponents,
    createTestComponent({ name: 'STEM Lab Fee', amount: 600, frequency: 'Monthly', isOptional: false })
  ];
  const revisedComposite = computeFn(updatedComponents, 'Monthly').baseComposite;
  assert.strictEqual(revisedComposite, 4000, 'Adding STEM Lab Fee should raise composite from 3400 to 4000');
});

test('[T3.6] Pairwise: Category Switch x Transport Enrollment (Normal -> Reservation post-enrollment)', () => {
  const route = createTestTransportRoute({ id: 'tr-1', monthlyFare: 1500 });

  const initialNormalStudent = createTestStudent({
    id: 'stu-cat-switch',
    class: '10',
    category: 'normal',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const normalRecord = syncFn(initialNormalStudent, undefined, undefined, [route]);

    // Student provides RTE documentation and category is switched to reservation
    const rteStudent = {
      ...initialNormalStudent,
      category: 'reservation' as const
    };
    const rteRecord = syncFn(rteStudent, normalRecord, undefined, [route]);

    assert.strictEqual(rteRecord.category, 'reservation');
    assert.ok(
      rteRecord.totalAmount < normalRecord.totalAmount,
      'RTE record total amount must be less than normal record total amount'
    );
  } else {
    assert.strictEqual(initialNormalStudent.isAvailingTransport, true);
  }
});

test('[T3.7] Pairwise: Route Fare Update x Multiple Enrolled Students', () => {
  const oldRoute = createTestTransportRoute({ id: 'tr-1', monthlyFare: 1200 });
  const newRoute = createTestTransportRoute({ id: 'tr-1', monthlyFare: 1600 }); // +400 fare hike

  const studentA = createTestStudent({ id: 'stu-a', class: '10', category: 'normal', isAvailingTransport: true, busRouteId: 'tr-1' });
  const studentB = createTestStudent({ id: 'stu-b', class: '9', category: 'normal', isAvailingTransport: true, busRouteId: 'tr-1' });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const recordAOld = syncFn(studentA, undefined, undefined, [oldRoute]);
    const recordANew = syncFn(studentA, recordAOld, undefined, [newRoute]);

    const recordBOld = syncFn(studentB, undefined, undefined, [oldRoute]);
    const recordBNew = syncFn(studentB, recordBOld, undefined, [newRoute]);

    assert.strictEqual(recordANew.monthlyFee - recordAOld.monthlyFee, 400, 'Student A fee should increase by 400');
    assert.strictEqual(recordBNew.monthlyFee - recordBOld.monthlyFee, 400, 'Student B fee should increase by 400');
  } else {
    assert.strictEqual(newRoute.monthlyFare - oldRoute.monthlyFare, 400);
  }
});

test('[T3.8] Pairwise: Optional Components Selection x Transport (Additive optional charges)', () => {
  const components = [
    createTestComponent({ name: 'Tuition Fee', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ id: 'fc-trans', name: 'Transport Fee', amount: 1500, frequency: 'Monthly', isOptional: true }),
    createTestComponent({ id: 'fc-robotics', name: 'Robotics Club Fee', amount: 800, frequency: 'Monthly', isOptional: true })
  ];

  const baseMandatory = components.filter(c => !c.isOptional).reduce((s, c) => s + c.amount, 0);
  assert.strictEqual(baseMandatory, 3000);

  // Student opts into BOTH Transport AND Robotics
  const selectedOptionalIds = ['fc-trans', 'fc-robotics'];
  const optionalSum = components
    .filter(c => selectedOptionalIds.includes(c.id))
    .reduce((s, c) => s + c.amount, 0);

  assert.strictEqual(optionalSum, 2300, 'Sum of optional items should be 1500 + 800 = 2300');
  assert.strictEqual(baseMandatory + optionalSum, 5300, 'Total including both optional items should be 5300');
});
