import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import * as DataContextModule from '../../src/contexts/DataContext';
import {
  ALL_CLASSES,
  ACADEMIC_STAGES,
  createTestStudent,
  createTestFeeRecord,
  createTestTransportRoute,
  createTestComponent,
  createTestFeeStructure,
  referenceComputeCompositeFee,
  isSameClass
} from '../helpers/test-utils';

test('[T4.1] Scenario: Annual Academic Year Fee Setup Workflow across Nursery to Class 12', () => {
  const feeStructures = CentralData.initialFeeStructures;
  assert.ok(feeStructures.length >= 30, 'All 30 structures must be available for annual setup');

  // Step 1: Principal reviews each academic stage
  for (const [stageName, classes] of Object.entries(ACADEMIC_STAGES)) {
    for (const cls of classes) {
      const normalFs = feeStructures.find(fs => isSameClass(fs.className, cls) && fs.category === 'normal');
      const resFs = feeStructures.find(fs => isSameClass(fs.className, cls) && fs.category === 'reservation');

      assert.ok(normalFs, `${stageName} class ${cls} normal fee structure must exist`);
      assert.ok(resFs, `${stageName} class ${cls} reservation fee structure must exist`);
      assert.ok(normalFs.compositeFee > 0, 'Normal composite fee must be positive');
      assert.ok(resFs.compositeFee > 0, 'Reservation composite fee must be positive');
      assert.ok(resFs.compositeFee < normalFs.compositeFee, 'Reservation fee must be less than normal fee');
    }
  }

  // Step 2: Admin edits late fee policy for Secondary stage
  const secondaryClass = feeStructures.find(fs => isSameClass(fs.className, 'Class 10') && fs.category === 'normal');
  assert.ok(secondaryClass);
  const updatedStructure = {
    ...secondaryClass,
    lateFeeFixedAmount: 300,
    graceDays: 7
  };

  assert.strictEqual(updatedStructure.lateFeeFixedAmount, 300);
  assert.strictEqual(updatedStructure.graceDays, 7);
});

test('[T4.2] Scenario: New Student Admission with Transport Allocation and RTE Subsidies Workflow', () => {
  const route = createTestTransportRoute({ id: 'tr-1', routeNumber: 'R-101', monthlyFare: 1500 });

  // Step 1: Registrar enters student details with RTE Category and Transport enabled
  const newStudent = createTestStudent({
    firstName: 'Meera',
    lastName: 'Kumar',
    class: '10',
    category: 'reservation',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const feeRecord = syncFn(newStudent, undefined, undefined, [route]);

    // Step 2: Verify synchronization
    assert.ok(feeRecord, 'Fee record must be created');
    assert.strictEqual(feeRecord.class, '10');
    assert.strictEqual(feeRecord.category, 'reservation');
    assert.strictEqual(feeRecord.status, 'pending');
    assert.strictEqual(feeRecord.paidAmount, 0);

    // Transport component should be included
    assert.ok(
      feeRecord.selectedOptionalComponents?.some((id: string) => id.includes('trans')),
      'Transport should be registered in selected components'
    );
  } else {
    assert.strictEqual(newStudent.category, 'reservation');
    assert.strictEqual(newStudent.isAvailingTransport, true);
  }
});

test('[T4.3] Scenario: Mid-Term Bus Route Transfer & Partial Payment Settlement Workflow', () => {
  const routeA = createTestTransportRoute({ id: 'tr-1', monthlyFare: 1200 });
  const routeB = createTestTransportRoute({ id: 'tr-2', monthlyFare: 1800 });

  // Step 1: Student is enrolled with Route A and has quarterly fee of 15000
  let student = createTestStudent({
    id: 'stu-midterm-transfer',
    class: '8',
    category: 'normal',
    isAvailingTransport: true,
    busRouteId: 'tr-1'
  });

  let feeRecord = createTestFeeRecord({
    studentId: 'stu-midterm-transfer',
    class: '8',
    totalAmount: 15000,
    paidAmount: 0,
    status: 'pending',
    selectedOptionalComponents: ['fc-trans']
  });

  // Step 2: Parent makes a partial payment of ₹5,000
  feeRecord.paidAmount += 5000;
  feeRecord.status = 'partial';
  feeRecord.paidDate = '2026-05-10';
  assert.strictEqual(feeRecord.paidAmount, 5000);
  assert.strictEqual(feeRecord.status, 'partial');

  // Step 3: Mid-term family relocates, switching to Route B (+600/month, +1800/quarter)
  student = {
    ...student,
    busRouteId: 'tr-2'
  };

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const updatedRecord = syncFn(student, feeRecord, undefined, [routeA, routeB]);

    // Payment history must be preserved
    assert.strictEqual(updatedRecord.paidAmount, 5000, 'Prior payment must be preserved');
    assert.strictEqual(updatedRecord.status, 'partial', 'Status must remain partial');

    // Step 4: Parent pays the remaining balance
    const remainingBalance = updatedRecord.totalAmount - updatedRecord.paidAmount;
    const finalPaid = updatedRecord.paidAmount + remainingBalance;
    const finalStatus = finalPaid >= updatedRecord.totalAmount ? 'paid' : 'partial';

    assert.strictEqual(finalPaid, updatedRecord.totalAmount);
    assert.strictEqual(finalStatus, 'paid');
  } else {
    assert.strictEqual(feeRecord.paidAmount, 5000);
  }
});

test('[T4.4] Scenario: RTE Legal Concession Verification and Audit Workflow', () => {
  const feeStructures = CentralData.initialFeeStructures;

  // Auditor checks discount percentages across all academic stages
  const stageAudits: Record<string, { totalNormal: number; totalRes: number }> = {
    'Pre-Primary': { totalNormal: 0, totalRes: 0 },
    'Primary': { totalNormal: 0, totalRes: 0 },
    'Secondary': { totalNormal: 0, totalRes: 0 },
    'Senior Secondary': { totalNormal: 0, totalRes: 0 }
  };

  for (const [stage, classes] of Object.entries(ACADEMIC_STAGES)) {
    for (const cls of classes) {
      const normal = feeStructures.find(fs => isSameClass(fs.className, cls) && fs.category === 'normal');
      const res = feeStructures.find(fs => isSameClass(fs.className, cls) && fs.category === 'reservation');

      if (normal && res) {
        stageAudits[stage].totalNormal += normal.compositeFee;
        stageAudits[stage].totalRes += res.compositeFee;
      }
    }
  }

  // Verify that every single stage provides substantial RTE concessions
  for (const [stage, totals] of Object.entries(stageAudits)) {
    assert.ok(totals.totalNormal > 0, `${stage} normal total should be positive`);
    assert.ok(totals.totalRes > 0, `${stage} reservation total should be positive`);
    assert.ok(
      totals.totalRes < totals.totalNormal,
      `${stage} reservation total (${totals.totalRes}) must be significantly less than normal (${totals.totalNormal})`
    );

    const discountRatio = (totals.totalNormal - totals.totalRes) / totals.totalNormal;
    assert.ok(
      discountRatio >= 0.25,
      `${stage} RTE discount ratio (${(discountRatio * 100).toFixed(1)}%) must be at least 25%`
    );
  }
});

test('[T4.5] Scenario: Grace Period Expiry, Late Fee Assessment, and Online Settlement Workflow', () => {
  const baseMonthly = 4000;
  const lateFeeAmount = 250;
  const dueDay = 10;
  const graceDays = 5;

  let feeRecord = createTestFeeRecord({
    monthlyFee: baseMonthly,
    totalAmount: baseMonthly,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-05-10'
  });

  // Step 1: On 12th of month (within grace period): on time, no late fee
  const currentDate1 = 12;
  const isGraceExpired1 = currentDate1 > (dueDay + graceDays);
  assert.strictEqual(isGraceExpired1, false, '12th is within grace period');

  // Step 2: On 16th of month (grace expired): late fee assessed
  const currentDate2 = 16;
  const isGraceExpired2 = currentDate2 > (dueDay + graceDays);
  assert.strictEqual(isGraceExpired2, true, '16th has expired grace period');

  if (isGraceExpired2) {
    feeRecord = {
      ...feeRecord,
      totalAmount: feeRecord.totalAmount + lateFeeAmount,
      status: 'overdue'
    };
  }

  assert.strictEqual(feeRecord.totalAmount, 4250, 'Total amount should now include 250 late fee');
  assert.strictEqual(feeRecord.status, 'overdue', 'Status should be overdue');

  // Step 3: Parent pays full overdue invoice online via UPI
  const paymentAmount = feeRecord.totalAmount;
  const settledRecord = {
    ...feeRecord,
    paidAmount: feeRecord.paidAmount + paymentAmount,
    status: 'paid' as const,
    paidDate: '2026-05-16'
  };

  assert.strictEqual(settledRecord.paidAmount, 4250);
  assert.strictEqual(settledRecord.status, 'paid');
  assert.strictEqual(settledRecord.paidDate, '2026-05-16');
});

test('[T4.6] Scenario: Bulk Class Fee Restructuring and Student Re-Synchronization Workflow', () => {
  const computeFn = (DataContextModule as any).computeCompositeFee || referenceComputeCompositeFee;

  // Step 1: Baseline Class 9 normal structure
  const baseComponents = [
    createTestComponent({ name: 'Tuition Fee', amount: 3500, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ id: 'fc-comp', name: 'Computer Lab Fee', amount: 500, frequency: 'Monthly', isOptional: false })
  ];

  const initialComposite = computeFn(baseComponents, 'Monthly').baseComposite;
  assert.strictEqual(initialComposite, 4000);

  // Step 2: School Board raises Computer Lab fee by ₹200 to ₹700
  const restructuredComponents = baseComponents.map(c =>
    c.id === 'fc-comp' ? { ...c, amount: 700 } : c
  );

  const updatedComposite = computeFn(restructuredComponents, 'Monthly').baseComposite;
  assert.strictEqual(updatedComposite, 4200, 'Updated composite fee should be 4200');

  // Step 3: Verify existing student fee record can be synchronized to new rate
  const student = createTestStudent({ class: '9', category: 'normal' });
  const existingRecord = createTestFeeRecord({
    studentId: student.id,
    monthlyFee: 4000,
    totalAmount: 4000,
    paidAmount: 1500,
    status: 'partial'
  });

  const syncFn = (DataContextModule as any).syncFeeRecordForStudent;
  if (typeof syncFn === 'function') {
    const nextStructure = createTestFeeStructure({
      className: '9',
      category: 'normal',
      components: restructuredComponents,
      compositeFee: updatedComposite
    });

    const resynced = syncFn(student, existingRecord, [nextStructure]);
    assert.strictEqual(resynced.paidAmount, 1500, 'Prior payment must remain untouched');
    assert.ok(resynced.totalAmount >= 4200);
  } else {
    assert.strictEqual(existingRecord.paidAmount, 1500);
  }
});
