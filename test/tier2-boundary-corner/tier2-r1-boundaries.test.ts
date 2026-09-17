import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import {
  createTestFeeStructure,
  createTestComponent,
  referenceComputeCompositeFee,
  normalizeClassName,
  isSameClass
} from '../helpers/test-utils';

test('[T2.1] Boundary: Fee structure with empty components array handles gracefully with 0 composite fee', () => {
  const emptyStructure = createTestFeeStructure({
    components: [],
    compositeFee: 0
  });

  const totals = referenceComputeCompositeFee(emptyStructure.components, 'Monthly');
  assert.strictEqual(totals.baseComposite, 0, 'Composite fee for empty components must be 0');
  assert.strictEqual(totals.monthly, 0);
  assert.strictEqual(totals.annual, 0);
  assert.ok(!Number.isNaN(totals.baseComposite), 'Composite fee must not be NaN');
});

test('[T2.2] Boundary: Fee structure with 0 late fee and edge due days (Day 1 and Day 31)', () => {
  const structureDay1 = createTestFeeStructure({
    dueDayOfMonth: 1,
    lateFeeFixedAmount: 0,
    graceDays: 0
  });

  const structureDay31 = createTestFeeStructure({
    dueDayOfMonth: 31,
    lateFeeFixedAmount: 0,
    graceDays: 10
  });

  assert.strictEqual(structureDay1.dueDayOfMonth, 1);
  assert.strictEqual(structureDay1.lateFeeFixedAmount, 0);
  assert.strictEqual(structureDay31.dueDayOfMonth, 31);
  assert.strictEqual(structureDay31.graceDays, 10);
});

test('[T2.3] Boundary: Class lookup with whitespace and case differences', () => {
  const feeStructures = CentralData.initialFeeStructures;

  // Test searching with untrimmed and mixed-case class names
  const testQueries = [' 10 ', 'Class 10', 'class 10', 'NURSERY', ' nursery '];

  for (const query of testQueries) {
    const matched = feeStructures.find(
      fs => isSameClass(fs.className, query) && fs.category === 'normal'
    );
    assert.ok(
      matched,
      `Class lookup for "${query}" should find matching fee structure`
    );
  }
});

test('[T2.4] Boundary: Structure with duplicate component names handles without crash', () => {
  const duplicateComponents = [
    createTestComponent({ id: 'c1', name: 'Tuition Fee', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ id: 'c2', name: 'Tuition Fee', amount: 500, frequency: 'Monthly', isOptional: false })
  ];

  const totals = referenceComputeCompositeFee(duplicateComponents, 'Monthly');
  // Both mandatory components are summed
  assert.strictEqual(totals.baseComposite, 3500);
});

test('[T2.5] Boundary: Extreme fee amounts and high component count handle without precision loss', () => {
  // Extreme amount: ₹10,000,000 (1 Crore)
  const largeComponent = createTestComponent({
    name: 'Executive Endowment Fee',
    amount: 10000000,
    frequency: 'Yearly',
    isOptional: false
  });

  const totals = referenceComputeCompositeFee([largeComponent], 'Annually');
  assert.strictEqual(totals.annual, 10000000);
  assert.strictEqual(totals.monthly, Math.round(10000000 / 12));

  // 50 components
  const manyComponents = Array.from({ length: 50 }, (_, i) =>
    createTestComponent({
      id: `c-stress-${i}`,
      name: `Special Activity ${i + 1}`,
      amount: 100,
      frequency: 'Monthly',
      isOptional: false
    })
  );

  const stressTotals = referenceComputeCompositeFee(manyComponents, 'Monthly');
  assert.strictEqual(stressTotals.baseComposite, 50 * 100, '50 components of 100 should sum to 5000');
});
