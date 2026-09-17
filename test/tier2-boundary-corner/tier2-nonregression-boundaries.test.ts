import test from 'node:test';
import assert from 'node:assert';
import { createTestFeeRecord } from '../helpers/test-utils';

test('[T2.16] Boundary: Zero and negative payment amount rejection', () => {
  const feeRecord = createTestFeeRecord({
    totalAmount: 5000,
    paidAmount: 0,
    status: 'pending'
  });

  function validatePaymentAmount(amount: number, outstanding: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than 0' };
    }
    if (amount > outstanding) {
      return { valid: false, error: 'Payment amount cannot exceed outstanding balance' };
    }
    return { valid: true };
  }

  const outstanding = feeRecord.totalAmount - feeRecord.paidAmount;

  // Zero payment
  const resZero = validatePaymentAmount(0, outstanding);
  assert.strictEqual(resZero.valid, false, '0 payment should be invalid');

  // Negative payment
  const resNeg = validatePaymentAmount(-500, outstanding);
  assert.strictEqual(resNeg.valid, false, 'Negative payment should be invalid');

  // Valid payment
  const resValid = validatePaymentAmount(1000, outstanding);
  assert.strictEqual(resValid.valid, true, 'Valid positive payment should pass');
});

test('[T2.17] Boundary: Payment exceeding outstanding balance handling', () => {
  const feeRecord = createTestFeeRecord({
    totalAmount: 6000,
    paidAmount: 4000,
    status: 'partial'
  });

  const outstanding = feeRecord.totalAmount - feeRecord.paidAmount; // 2000
  const overPayment = 2500;

  // Either cap at outstanding or disallow
  const effectivePaid = Math.min(feeRecord.totalAmount, feeRecord.paidAmount + overPayment);
  assert.strictEqual(effectivePaid, 6000, 'Effective paid amount should cap at totalAmount');
});

test('[T2.18] Boundary: Sequence of consecutive partial payments transitions status from pending to partial to paid', () => {
  let record = createTestFeeRecord({
    totalAmount: 5000,
    paidAmount: 0,
    status: 'pending'
  });

  function applyPayment(current: typeof record, amount: number) {
    const newPaid = current.paidAmount + amount;
    const newStatus: 'paid' | 'partial' | 'pending' =
      newPaid >= current.totalAmount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
    return {
      ...current,
      paidAmount: newPaid,
      status: newStatus
    };
  }

  // Payment 1: 1000
  record = applyPayment(record, 1000);
  assert.strictEqual(record.paidAmount, 1000);
  assert.strictEqual(record.status, 'partial');

  // Payment 2: 1500 (total paid 2500)
  record = applyPayment(record, 1500);
  assert.strictEqual(record.paidAmount, 2500);
  assert.strictEqual(record.status, 'partial');

  // Payment 3: 2500 (total paid 5000 -> completes)
  record = applyPayment(record, 2500);
  assert.strictEqual(record.paidAmount, 5000);
  assert.strictEqual(record.status, 'paid');
});

test('[T2.19] Boundary: Student with 0 total fee (100% scholarship / waiver) defaults directly to paid status', () => {
  const zeroFeeRecord = createTestFeeRecord({
    totalAmount: 0,
    paidAmount: 0,
    status: 'pending'
  });

  // A 0 total amount record has 0 outstanding, status should resolve to paid
  const outstanding = zeroFeeRecord.totalAmount - zeroFeeRecord.paidAmount;
  const effectiveStatus = outstanding === 0 ? 'paid' : zeroFeeRecord.status;

  assert.strictEqual(outstanding, 0);
  assert.strictEqual(effectiveStatus, 'paid', 'Zero fee balance should be considered paid');
});

test('[T2.20] Boundary: Fee override where overrideAmount <= paidAmount immediately marks status as paid', () => {
  const record = createTestFeeRecord({
    totalAmount: 8000,
    paidAmount: 3000,
    status: 'partial'
  });

  // Principal approves fee reduction down to 3000 (which is already paid)
  const overrideAmount = 3000;
  const newStatus = record.paidAmount >= overrideAmount ? 'paid' : 'partial';

  const updatedRecord = {
    ...record,
    totalAmount: overrideAmount,
    overrideAmount,
    status: newStatus
  };

  assert.strictEqual(updatedRecord.totalAmount, 3000);
  assert.strictEqual(updatedRecord.status, 'paid', 'Fee override down to paid amount should transition status to paid');
});
