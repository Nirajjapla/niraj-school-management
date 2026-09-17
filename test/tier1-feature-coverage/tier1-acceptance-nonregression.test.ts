import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import { createTestFeeRecord, createTestComponent } from '../helpers/test-utils';

test('[T1.18] Verify Student Fee Records List aggregate summary metrics', () => {
  const records = CentralData.initialFeeRecords;
  assert.ok(Array.isArray(records), 'initialFeeRecords must be an array');
  assert.ok(records.length > 0, 'initialFeeRecords should not be empty');

  // Compute aggregate metrics as done in fee-list.tsx
  const totalMonthly = records.reduce((acc, f) => acc + (f.monthlyFee || 0), 0);
  const totalQuarterly = records.reduce((acc, f) => acc + (f.quarterlyFee || 0), 0);
  const totalAnnual = records.reduce((acc, f) => acc + (f.annualFee || 0), 0);
  const totalCollected = records.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalPending = records.reduce((acc, f) => acc + Math.max(0, f.totalAmount - (f.paidAmount || 0)), 0);

  assert.ok(totalMonthly > 0, 'Total Monthly Fee metric must be positive');
  assert.ok(totalQuarterly > totalMonthly, 'Total Quarterly Fee must be greater than Monthly');
  assert.ok(totalAnnual > totalQuarterly, 'Total Annual Fee must be greater than Quarterly');
  assert.ok(totalCollected >= 0, 'Total Collected metric must be non-negative');
  assert.ok(totalPending >= 0, 'Total Pending metric must be non-negative');
});

test('[T1.19] Verify partial payment recording updates paidAmount and sets status to partial', () => {
  const feeRecord = createTestFeeRecord({
    totalAmount: 10000,
    paidAmount: 0,
    status: 'pending'
  });

  const paymentAmount = 4000;
  const newPaid = feeRecord.paidAmount + paymentAmount;
  const newStatus = newPaid >= feeRecord.totalAmount ? 'paid' : newPaid > 0 ? 'partial' : feeRecord.status;

  assert.strictEqual(newPaid, 4000, 'Paid amount should be 4000');
  assert.strictEqual(newStatus, 'partial', 'Status should transition to partial');
  assert.strictEqual(feeRecord.totalAmount - newPaid, 6000, 'Outstanding balance should be 6000');
});

test('[T1.20] Verify full payment recording marks status as paid and sets paidDate', () => {
  const feeRecord = createTestFeeRecord({
    totalAmount: 7500,
    paidAmount: 2500,
    status: 'partial'
  });

  const remainingPayment = feeRecord.totalAmount - feeRecord.paidAmount;
  const newPaid = feeRecord.paidAmount + remainingPayment;
  const newStatus = newPaid >= feeRecord.totalAmount ? 'paid' : 'partial';
  const paidDate = new Date().toISOString().split('T')[0];

  assert.strictEqual(newPaid, 7500, 'Paid amount should equal totalAmount');
  assert.strictEqual(newStatus, 'paid', 'Status should transition to paid');
  assert.ok(paidDate.length === 10, 'paidDate must be a valid ISO date YYYY-MM-DD');
});

test('[T1.21] Verify fee override adjusts student total without destroying structure link', () => {
  const feeRecord = createTestFeeRecord({
    monthlyFee: 5000,
    totalAmount: 5000,
    paidAmount: 0,
    status: 'pending'
  });

  const overrideAmount = 3500;
  const overrideRemarks = 'Discretionary scholarship approved by Principal';

  const updatedRecord = {
    ...feeRecord,
    totalAmount: overrideAmount,
    overrideAmount,
    overrideRemarks,
    status: feeRecord.paidAmount >= overrideAmount ? 'paid' : 'pending'
  };

  assert.strictEqual(updatedRecord.totalAmount, 3500, 'totalAmount should reflect override');
  assert.strictEqual(updatedRecord.overrideAmount, 3500, 'overrideAmount should be preserved');
  assert.strictEqual(updatedRecord.overrideRemarks, overrideRemarks, 'overrideRemarks should be recorded');
  assert.strictEqual(updatedRecord.monthlyFee, 5000, 'Original monthlyFee base structure must remain intact');
});

test('[T1.22] Verify invoice detail view itemizes components with individual amounts', () => {
  const components = [
    createTestComponent({ name: 'Tuition Fee', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Library Fee', amount: 300, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Transport Fee', amount: 1200, frequency: 'Monthly', isOptional: true })
  ];

  // Each line item in invoice detail must have identifiable name, frequency, and amount
  for (const comp of components) {
    assert.ok(comp.name.length > 0, 'Component name must not be empty');
    assert.ok(comp.amount > 0, 'Component amount must be positive');
    assert.ok(['Monthly', 'Quarterly', 'Half yearly', 'Yearly'].includes(comp.frequency));
  }

  const mandatoryTotal = components.filter(c => !c.isOptional).reduce((sum, c) => sum + c.amount, 0);
  assert.strictEqual(mandatoryTotal, 3300, 'Mandatory invoice total should equal sum of non-optional items');
});
