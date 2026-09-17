import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import { computeCompositeFee } from '../../src/contexts/DataContext';

const EXPECTED_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10',
  '11', '12'
];

const PRE_PRIMARY_AND_PRIMARY = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5'];
const SECONDARY_AND_SR_SECONDARY = ['6', '7', '8', '9', '10', '11', '12'];
const CATEGORIES: ('normal' | 'reservation')[] = ['normal', 'reservation'];

const ALL_9_CODES: CentralData.FeeComponentCode[] = [
  'TUITION',
  'ANNUAL',
  'LAB',
  'LIBRARY',
  'SPORTS',
  'COMPUTER',
  'EXAM',
  'CAMPUS_DEV',
  'TRANSPORT'
];

test('[CHALLENGER-M1-2.1] Verify all 15 classes exist for both normal and reservation categories (30 fee structures)', () => {
  const structures = CentralData.initialFeeStructures;

  assert.ok(Array.isArray(structures), 'initialFeeStructures must be an array');
  assert.strictEqual(structures.length, 30, `Expected exactly 30 fee structures, received ${structures.length}`);

  const structureIds = new Set<string>();

  for (const className of EXPECTED_CLASSES) {
    for (const category of CATEGORIES) {
      const found = structures.find(
        fs => fs.className === className && fs.category === category
      );

      assert.ok(
        found,
        `Missing fee structure for class "${className}" and category "${category}"`
      );

      assert.ok(found.id, `Fee structure for ${className} ${category} must have an id`);
      assert.ok(!structureIds.has(found.id), `Duplicate fee structure id found: ${found.id}`);
      structureIds.add(found.id);

      assert.strictEqual(found.className, className);
      assert.strictEqual(found.category, category);
    }
  }
});

test('[CHALLENGER-M1-2.2] Verify required component breakdown and count per stage', () => {
  const structures = CentralData.initialFeeStructures;

  for (const fs of structures) {
    assert.ok(Array.isArray(fs.components), `components must be an array for ${fs.className} ${fs.category}`);

    const isPreOrPrimary = PRE_PRIMARY_AND_PRIMARY.includes(fs.className);
    const expectedCount = isPreOrPrimary ? 8 : 9;

    assert.strictEqual(
      fs.components.length,
      expectedCount,
      `Class ${fs.className} (${fs.category}) should have exactly ${expectedCount} components, found ${fs.components.length}`
    );

    const compCodes = fs.components.map(c => c.code);
    const compIds = new Set<string>();

    for (const comp of fs.components) {
      assert.ok(comp.id, `Component in ${fs.className} ${fs.category} must have id`);
      assert.ok(!compIds.has(comp.id), `Duplicate component id ${comp.id} in ${fs.className} ${fs.category}`);
      compIds.add(comp.id);

      assert.ok(comp.name && comp.name.trim().length > 0, `Component ${comp.id} must have non-empty name`);
      assert.ok(typeof comp.amount === 'number' && comp.amount > 0, `Component ${comp.name} (${comp.id}) amount must be > 0`);
      assert.ok(comp.description && comp.description.trim().length > 0, `Component ${comp.name} must have description`);
      assert.ok(
        ['Monthly', 'Quarterly', 'Half yearly', 'Yearly'].includes(comp.frequency),
        `Component ${comp.name} has invalid frequency ${comp.frequency}`
      );

      assert.ok(
        ALL_9_CODES.includes(comp.code!),
        `Component ${comp.name} code "${comp.code}" is not in the recognized 9 standard codes`
      );

      // Verify optionality: only TRANSPORT is optional
      if (comp.code === 'TRANSPORT') {
        assert.strictEqual(comp.isOptional, true, `Transport component must be optional in ${fs.className} ${fs.category}`);
      } else {
        assert.strictEqual(comp.isOptional, false, `Component ${comp.name} (${comp.code}) must be mandatory in ${fs.className} ${fs.category}`);
      }
    }

    // Verify presence of all non-LAB standard components
    const requiredAlways: CentralData.FeeComponentCode[] = [
      'TUITION', 'ANNUAL', 'LIBRARY', 'SPORTS', 'COMPUTER', 'EXAM', 'CAMPUS_DEV', 'TRANSPORT'
    ];
    for (const code of requiredAlways) {
      assert.ok(
        compCodes.includes(code),
        `Fee structure for ${fs.className} ${fs.category} is missing required component code ${code}`
      );
    }
  }
});

test('[CHALLENGER-M1-2.3] Verify LAB (Science Practical) is absent in classes Nursery-5 and present in classes 6-12', () => {
  const structures = CentralData.initialFeeStructures;

  // Nursery through 5: LAB must be strictly absent
  for (const className of PRE_PRIMARY_AND_PRIMARY) {
    for (const category of CATEGORIES) {
      const fs = structures.find(s => s.className === className && s.category === category)!;
      const labComp = fs.components.find(c => c.code === 'LAB');
      assert.strictEqual(
        labComp,
        undefined,
        `Class ${className} (${category}) MUST NOT have LAB component, but found: ${JSON.stringify(labComp)}`
      );

      // Check name does not contain "laboratory & science practical"
      const labByName = fs.components.find(c => c.name.toLowerCase().includes('laboratory'));
      assert.strictEqual(
        labByName,
        undefined,
        `Class ${className} (${category}) has unexpected laboratory component by name: ${labByName?.name}`
      );
    }
  }

  // Classes 6 through 12: LAB must be strictly present and active
  for (const className of SECONDARY_AND_SR_SECONDARY) {
    for (const category of CATEGORIES) {
      const fs = structures.find(s => s.className === className && s.category === category)!;
      const labComp = fs.components.find(c => c.code === 'LAB');
      assert.ok(
        labComp,
        `Class ${className} (${category}) MUST have LAB component`
      );
      assert.strictEqual(labComp.isOptional, false, `LAB in ${className} (${category}) must be mandatory`);
      assert.ok(labComp.amount > 0, `LAB amount in ${className} (${category}) must be positive`);
      assert.strictEqual(labComp.frequency, 'Monthly', `LAB frequency in ${className} (${category}) should be Monthly`);
    }
  }
});

test('[CHALLENGER-M1-2.4] Verify late fee configuration (amount > 0, 1 <= dueDay <= 28, graceDays >= 0)', () => {
  const structures = CentralData.initialFeeStructures;

  for (const fs of structures) {
    // 1. lateFeeFixedAmount > 0
    assert.strictEqual(
      typeof fs.lateFeeFixedAmount,
      'number',
      `lateFeeFixedAmount must be a number for ${fs.className} ${fs.category}`
    );
    assert.ok(
      fs.lateFeeFixedAmount > 0,
      `lateFeeFixedAmount must be > 0 for ${fs.className} ${fs.category}, got ${fs.lateFeeFixedAmount}`
    );

    // 2. dueDayOfMonth >= 1 && dueDayOfMonth <= 28
    assert.strictEqual(
      typeof fs.dueDayOfMonth,
      'number',
      `dueDayOfMonth must be a number for ${fs.className} ${fs.category}`
    );
    assert.ok(
      fs.dueDayOfMonth >= 1 && fs.dueDayOfMonth <= 28,
      `dueDayOfMonth must be in [1, 28] for ${fs.className} ${fs.category}, got ${fs.dueDayOfMonth}`
    );

    // 3. graceDays >= 0
    assert.strictEqual(
      typeof fs.graceDays,
      'number',
      `graceDays must be defined as a number for ${fs.className} ${fs.category}`
    );
    assert.ok(
      fs.graceDays >= 0,
      `graceDays must be >= 0 for ${fs.className} ${fs.category}, got ${fs.graceDays}`
    );
  }
});

test('[CHALLENGER-M1-2.5] Verify composite fee calculation and concession discounts', () => {
  const structures = CentralData.initialFeeStructures;

  for (const className of EXPECTED_CLASSES) {
    const normal = structures.find(s => s.className === className && s.category === 'normal')!;
    const res = structures.find(s => s.className === className && s.category === 'reservation')!;

    // Reservation composite fee must be strictly lower than normal composite fee
    assert.ok(
      res.compositeFee < normal.compositeFee,
      `Reservation composite fee (${res.compositeFee}) must be less than normal composite fee (${normal.compositeFee}) for ${className}`
    );

    // Verify composite calculation aligns with computeCompositeFee
    const normalCalc = computeCompositeFee(normal.components, normal.collectionFrequency);
    assert.strictEqual(
      normal.compositeFee,
      normalCalc.baseComposite,
      `Normal structure compositeFee for ${className} (${normal.compositeFee}) does not match computeCompositeFee (${normalCalc.baseComposite})`
    );

    const resCalc = computeCompositeFee(res.components, res.collectionFrequency);
    assert.strictEqual(
      res.compositeFee,
      resCalc.baseComposite,
      `Reservation structure compositeFee for ${className} (${res.compositeFee}) does not match computeCompositeFee (${resCalc.baseComposite})`
    );

    // Verify late fee concession: reservation late fee <= normal late fee
    assert.ok(
      res.lateFeeFixedAmount <= normal.lateFeeFixedAmount,
      `Reservation late fee (${res.lateFeeFixedAmount}) should be <= normal late fee (${normal.lateFeeFixedAmount}) for ${className}`
    );
  }
});
