import test from 'node:test';
import assert from 'node:assert';
import {
  createTestComponent,
  referenceComputeCompositeFee,
  componentToAnnual
} from '../helpers/test-utils';

test('[T2.6] Boundary: Zero amount components contribute 0 without altering composite sum', () => {
  const components = [
    createTestComponent({ name: 'Tuition Fee', amount: 4000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Special Merit Waiver', amount: 0, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Optional Free Club', amount: 0, frequency: 'Monthly', isOptional: true })
  ];

  const totals = referenceComputeCompositeFee(components, 'Monthly');
  assert.strictEqual(totals.baseComposite, 4000, 'Zero amount components must contribute exactly 0');
});

test('[T2.7] Boundary: All components set to optional yields 0 base composite fee', () => {
  const allOptionalComponents = [
    createTestComponent({ name: 'Optional Transport', amount: 1500, frequency: 'Monthly', isOptional: true }),
    createTestComponent({ name: 'Optional Robotics Club', amount: 800, frequency: 'Monthly', isOptional: true }),
    createTestComponent({ name: 'Optional Swimming', amount: 600, frequency: 'Monthly', isOptional: true })
  ];

  const totals = referenceComputeCompositeFee(allOptionalComponents, 'Monthly');
  assert.strictEqual(totals.baseComposite, 0, 'Base composite fee must be 0 when all items are optional');
  assert.strictEqual(totals.annual, 0);
});

test('[T2.8] Boundary: Mixed frequency components combined across Monthly, Quarterly, Half-Yearly, Yearly', () => {
  const mixedComponents = [
    createTestComponent({ name: 'Monthly Tuition', amount: 2000, frequency: 'Monthly', isOptional: false }), // 2000 * 12 = 24000
    createTestComponent({ name: 'Quarterly Exam', amount: 1500, frequency: 'Quarterly', isOptional: false }), // 1500 * 4 = 6000
    createTestComponent({ name: 'Half Yearly Lab', amount: 1200, frequency: 'Half yearly', isOptional: false }), // 1200 * 2 = 2400
    createTestComponent({ name: 'Yearly Development', amount: 3600, frequency: 'Yearly', isOptional: false }) // 3600 * 1 = 3600
  ];

  // Total Annual = 24000 + 6000 + 2400 + 3600 = 36000
  // Monthly equivalent = 36000 / 12 = 3000
  // Quarterly equivalent = 36000 / 4 = 9000
  const totals = referenceComputeCompositeFee(mixedComponents, 'Monthly');
  assert.strictEqual(totals.annual, 36000, 'Annual total should be 36000');
  assert.strictEqual(totals.monthly, 3000, 'Monthly equivalent should be 3000');
  assert.strictEqual(totals.quarterly, 9000, 'Quarterly equivalent should be 9000');
});

test('[T2.9] Boundary: Grace period exact cutoff boundaries (due date, last grace day, and 1 day overdue)', () => {
  const dueDay = 10;
  const graceDays = 5;
  const lateFeeAmount = 250;

  function calculateLateFee(paymentDay: number): number {
    const finalGraceDay = dueDay + graceDays; // 15th
    return paymentDay > finalGraceDay ? lateFeeAmount : 0;
  }

  // Scenario 1: Paid on due date (10th) -> ₹0 late fee
  assert.strictEqual(calculateLateFee(10), 0, 'Payment on due date should have 0 late fee');

  // Scenario 2: Paid within grace period (12th) -> ₹0 late fee
  assert.strictEqual(calculateLateFee(12), 0, 'Payment within grace period should have 0 late fee');

  // Scenario 3: Paid on exact last day of grace period (15th) -> ₹0 late fee
  assert.strictEqual(calculateLateFee(15), 0, 'Payment on final grace day should have 0 late fee');

  // Scenario 4: Paid 1 day after grace period (16th) -> late fee applies
  assert.strictEqual(calculateLateFee(16), 250, 'Payment after grace period should incur late fee');
});

test('[T2.10] Boundary: Due day clamping for short months (February, April)', () => {
  function getClampedDueDate(year: number, monthIndex: number, configuredDueDay: number): string {
    // monthIndex is 0-indexed (e.g. 1 for Feb, 3 for Apr)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const effectiveDay = Math.min(configuredDueDay, daysInMonth);
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(effectiveDay).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  // February non-leap year (2025): 31st clamped to 28th
  assert.strictEqual(getClampedDueDate(2025, 1, 31), '2025-02-28');

  // February leap year (2028): 31st clamped to 29th
  assert.strictEqual(getClampedDueDate(2028, 1, 31), '2028-02-29');

  // April (30 days): 31st clamped to 30th
  assert.strictEqual(getClampedDueDate(2026, 3, 31), '2026-04-30');

  // May (31 days): 31st remains 31st
  assert.strictEqual(getClampedDueDate(2026, 4, 31), '2026-05-31');
});
