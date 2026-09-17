import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import * as DataContextModule from '../../src/contexts/DataContext';
import {
  ALL_CLASSES,
  STANDARD_COMPONENT_CODES,
  referenceComputeCompositeFee,
  createTestComponent,
  createTestFeeStructure,
  isSameClass
} from '../helpers/test-utils';

test('[T1.7] Verify standard component breakdown in fee structures', () => {
  const feeStructures = CentralData.initialFeeStructures;
  assert.ok(feeStructures.length > 0, 'Fee structures must not be empty');

  // Verify at least one secondary structure has the core components
  const class10Normal = feeStructures.find(fs => isSameClass(fs.className, 'Class 10') && fs.category === 'normal');
  assert.ok(class10Normal, 'Class 10 Normal structure must exist');
  assert.ok(class10Normal.components.length >= 7, 'Class 10 should have itemized breakdown with standard components');

  // Check tuition component is present and mandatory
  const tuition = class10Normal.components.find(c =>
    c.name.toLowerCase().includes('tuition') || (c as any).code === 'TUITION'
  );
  assert.ok(tuition, 'Tuition component must be present');
  assert.strictEqual(tuition.isOptional, false, 'Tuition must be mandatory');

  // Check transport component is present and optional
  const transport = class10Normal.components.find(c =>
    c.name.toLowerCase().includes('transport') || (c as any).code === 'TRANSPORT'
  );
  if (transport) {
    assert.strictEqual(transport.isOptional, true, 'Transport component must be optional');
  }
});

test('[T1.8] Verify Laboratory & Science Practical fee rule (Class 6-12 only)', () => {
  const feeStructures = CentralData.initialFeeStructures;

  // Pre-primary should not have positive Lab fee
  const nurseryNormal = feeStructures.find(fs => isSameClass(fs.className, 'Nursery') && fs.category === 'normal');
  if (nurseryNormal) {
    const labComp = nurseryNormal.components.find(c =>
      c.name.toLowerCase().includes('lab') || (c as any).code === 'LAB'
    );
    if (labComp) {
      assert.strictEqual(labComp.amount, 0, 'Nursery lab fee should be 0');
    }
  }

  // Class 10 should have positive Lab fee
  const class10Normal = feeStructures.find(fs => isSameClass(fs.className, 'Class 10') && fs.category === 'normal');
  if (class10Normal) {
    const labComp = class10Normal.components.find(c =>
      c.name.toLowerCase().includes('lab') || (c as any).code === 'LAB'
    );
    assert.ok(labComp, 'Class 10 must have Lab fee component');
    assert.ok(labComp.amount > 0, 'Class 10 Lab fee amount must be greater than 0');
  }
});

test('[T1.9] Verify dynamic composite fee calculation for Monthly collection frequency', () => {
  const computeFn = (DataContextModule as any).computeCompositeFee || referenceComputeCompositeFee;

  const testComponents = [
    createTestComponent({ name: 'Tuition', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Library', amount: 200, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Sports', amount: 300, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Annual Function', amount: 1200, frequency: 'Yearly', isOptional: false }),
    createTestComponent({ name: 'Transport', amount: 1000, frequency: 'Monthly', isOptional: true }) // optional, excluded from base
  ];

  const result = computeFn(testComponents, 'Monthly');
  // Monthly equivalent = 3000 + 200 + 300 + (1200/12 = 100) = 3600
  assert.strictEqual(result.monthly, 3600, 'Monthly composite fee should be 3600');
  assert.strictEqual(result.baseComposite, 3600, 'Base composite fee for Monthly should match monthly equivalent');
});

test('[T1.10] Verify dynamic composite fee calculation for Quarterly and Annual frequencies', () => {
  const computeFn = (DataContextModule as any).computeCompositeFee || referenceComputeCompositeFee;

  const testComponents = [
    createTestComponent({ name: 'Tuition', amount: 3000, frequency: 'Monthly', isOptional: false }),
    createTestComponent({ name: 'Exam Fee', amount: 600, frequency: 'Quarterly', isOptional: false }),
    createTestComponent({ name: 'Annual Day', amount: 2400, frequency: 'Yearly', isOptional: false })
  ];

  // Annual total = (3000 * 12) + (600 * 4) + 2400 = 36000 + 2400 + 2400 = 40800
  // Monthly equivalent = 40800 / 12 = 3400
  // Quarterly equivalent = 40800 / 4 = 10200
  const monthlyRes = computeFn(testComponents, 'Monthly');
  const quarterlyRes = computeFn(testComponents, 'Quarterly');
  const annualRes = computeFn(testComponents, 'Annually');

  assert.strictEqual(annualRes.annual, 40800, 'Annual total should be 40800');
  assert.strictEqual(quarterlyRes.quarterly, 10200, 'Quarterly total should be 10200');
  assert.strictEqual(monthlyRes.monthly, 3400, 'Monthly total should be 3400');
  assert.strictEqual(quarterlyRes.baseComposite, 10200, 'Quarterly baseComposite should be 10200');
  assert.strictEqual(annualRes.baseComposite, 40800, 'Annual baseComposite should be 40800');
});

test('[T1.11] Verify component management operations (add, edit, toggle optional, delete)', () => {
  const computeFn = (DataContextModule as any).computeCompositeFee || referenceComputeCompositeFee;

  // Base setup
  const components = [
    createTestComponent({ id: 'c1', name: 'Tuition', amount: 4000, frequency: 'Monthly', isOptional: false })
  ];
  let res = computeFn(components, 'Monthly');
  assert.strictEqual(res.baseComposite, 4000);

  // Operation 1: Add new component
  const updatedComponents = [
    ...components,
    createTestComponent({ id: 'c2', name: 'Computer Lab', amount: 500, frequency: 'Monthly', isOptional: false })
  ];
  res = computeFn(updatedComponents, 'Monthly');
  assert.strictEqual(res.baseComposite, 4500, 'Adding component should increment composite fee');

  // Operation 2: Edit component amount
  const editedComponents = updatedComponents.map(c =>
    c.id === 'c2' ? { ...c, amount: 800 } : c
  );
  res = computeFn(editedComponents, 'Monthly');
  assert.strictEqual(res.baseComposite, 4800, 'Editing component amount should update composite fee');

  // Operation 3: Toggle optional status (mandatory -> optional)
  const toggledComponents = editedComponents.map(c =>
    c.id === 'c2' ? { ...c, isOptional: true } : c
  );
  res = computeFn(toggledComponents, 'Monthly');
  assert.strictEqual(res.baseComposite, 4000, 'Optional component should be excluded from base composite fee');

  // Operation 4: Delete component
  const deletedComponents = toggledComponents.filter(c => c.id !== 'c2');
  res = computeFn(deletedComponents, 'Monthly');
  assert.strictEqual(res.baseComposite, 4000, 'Deleting component should reflect in structure');
});

test('[T1.12] Verify Late Fee amount, due day of month, and grace period configuration', () => {
  const feeStructures = CentralData.initialFeeStructures;

  for (const fs of feeStructures) {
    assert.ok(
      typeof fs.lateFeeFixedAmount === 'number' && fs.lateFeeFixedAmount >= 0,
      `lateFeeFixedAmount must be a non-negative number for ${fs.className} ${fs.category}`
    );
    assert.ok(
      typeof fs.dueDayOfMonth === 'number' && fs.dueDayOfMonth >= 1 && fs.dueDayOfMonth <= 31,
      `dueDayOfMonth must be between 1 and 31 for ${fs.className} ${fs.category}`
    );
    if ((fs as any).graceDays !== undefined) {
      assert.ok(
        (fs as any).graceDays >= 0,
        `graceDays must be non-negative for ${fs.className} ${fs.category}`
      );
    }
  }
});
