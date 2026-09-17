import test from 'node:test';
import assert from 'node:assert';
import * as CentralData from '../../src/services/centralData';
import {
  ALL_CLASSES,
  ACADEMIC_STAGES,
  CATEGORIES,
  EXPECTED_TOTAL_STRUCTURES,
  isSameClass
} from '../helpers/test-utils';

test('[T1.1] Verify all 30 initial fee structures exist (15 classes x 2 categories)', () => {
  const feeStructures = CentralData.initialFeeStructures;
  assert.ok(Array.isArray(feeStructures), 'initialFeeStructures must be an array');
  assert.strictEqual(
    feeStructures.length,
    EXPECTED_TOTAL_STRUCTURES,
    `Expected ${EXPECTED_TOTAL_STRUCTURES} structures, got ${feeStructures.length}`
  );

  // Verify all 15 classes exist with both normal and reservation categories
  for (const className of ALL_CLASSES) {
    for (const category of CATEGORIES) {
      const match = feeStructures.find(
        fs => isSameClass(fs.className, className) && fs.category === category
      );
      assert.ok(
        match,
        `Missing fee structure for class "${className}" and category "${category}"`
      );
    }
  }
});

test('[T1.2] Verify Pre-Primary stage structures (Nursery, LKG, UKG)', () => {
  const feeStructures = CentralData.initialFeeStructures;
  const prePrimaryClasses = ACADEMIC_STAGES['Pre-Primary'];

  for (const className of prePrimaryClasses) {
    const normal = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'normal');
    const res = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'reservation');

    assert.ok(normal, `Pre-primary class ${className} normal structure must exist`);
    assert.ok(res, `Pre-primary class ${className} reservation structure must exist`);
    assert.ok(normal.compositeFee > 0, `${className} normal compositeFee must be positive`);
    assert.ok(res.compositeFee > 0, `${className} reservation compositeFee must be positive`);
    assert.ok(Array.isArray(normal.components), `${className} normal components must be an array`);
    assert.ok(Array.isArray(res.components), `${className} reservation components must be an array`);
  }
});

test('[T1.3] Verify Primary stage structures (Class 1 to Class 5)', () => {
  const feeStructures = CentralData.initialFeeStructures;
  const primaryClasses = ACADEMIC_STAGES['Primary'];

  for (const className of primaryClasses) {
    const normal = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'normal');
    const res = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'reservation');

    assert.ok(normal, `Primary class ${className} normal structure must exist`);
    assert.ok(res, `Primary class ${className} reservation structure must exist`);
    assert.ok(normal.compositeFee > 0, `${className} normal compositeFee must be positive`);
    assert.ok(res.compositeFee > 0, `${className} reservation compositeFee must be positive`);
  }
});

test('[T1.4] Verify Secondary stage structures (Class 6 to Class 10)', () => {
  const feeStructures = CentralData.initialFeeStructures;
  const secondaryClasses = ACADEMIC_STAGES['Secondary'];

  for (const className of secondaryClasses) {
    const normal = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'normal');
    const res = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'reservation');

    assert.ok(normal, `Secondary class ${className} normal structure must exist`);
    assert.ok(res, `Secondary class ${className} reservation structure must exist`);
    assert.ok(normal.compositeFee > 0, `${className} normal compositeFee must be positive`);
    assert.ok(res.compositeFee > 0, `${className} reservation compositeFee must be positive`);
  }
});

test('[T1.5] Verify Senior Secondary stage structures (Class 11 and Class 12)', () => {
  const feeStructures = CentralData.initialFeeStructures;
  const seniorSecClasses = ACADEMIC_STAGES['Senior Secondary'];

  for (const className of seniorSecClasses) {
    const normal = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'normal');
    const res = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'reservation');

    assert.ok(normal, `Senior Secondary class ${className} normal structure must exist`);
    assert.ok(res, `Senior Secondary class ${className} reservation structure must exist`);
    assert.ok(normal.compositeFee > 0, `${className} normal compositeFee must be positive`);
    assert.ok(res.compositeFee > 0, `${className} reservation compositeFee must be positive`);
  }
});

test('[T1.6] Verify Dual Category: Reservation / RTE structures have distinct pricing and concessions', () => {
  const feeStructures = CentralData.initialFeeStructures;

  for (const className of ALL_CLASSES) {
    const normal = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'normal');
    const res = feeStructures.find(fs => isSameClass(fs.className, className) && fs.category === 'reservation');

    if (normal && res) {
      assert.ok(
        res.compositeFee < normal.compositeFee,
        `Class ${className} reservation compositeFee (${res.compositeFee}) should be less than normal (${normal.compositeFee})`
      );
    }
  }
});
