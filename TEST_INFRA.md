# School ERP Test Infrastructure & E2E Test Suite Architecture

## Overview
This document outlines the test infrastructure, runner configuration, directory layout, and complete inventory for the School ERP Fee Management Restructure and Student Transport Fee Allocation.

The test suite is **opaque-box and requirement-driven**, derived directly from the requirements in `ORIGINAL_REQUEST.md` and architecture contracts in `PROJECT.md`:
- **R1**: Dedicated Full-Page Fee Structure Master inside Fee Management (15 classes Nursery-12, General vs Reservation dual categories).
- **R2**: Comprehensive Itemized Fee Component Breakdown & Rules (9 components, dynamic composite fee calculation for Monthly, Quarterly, Annually, late fee & grace period).
- **R3**: Student Management Transport Fee Option (Add & Edit toggle, route selector, auto-sync to central fee record in DataContext).
- **Acceptance Criteria & Non-Regression**: Student fee records list, payment recording, invoice detail view, fee overrides.

---

## Runner Architecture & Execution

### Test Runner Engine
- **Framework**: Native Node.js Test Runner (`node:test` and `node:assert`).
- **Transpiler & Bundler**: `esbuild` v0.21.5 (transpiles TypeScript and TSX with inline sourcemaps in ~4ms).
- **Runtime**: Node.js v24.18.0 (ESM mode).
- **Execution Speed**: ~110ms total execution time for all 56 tests across 4 tiers.
- **Air-Gapped Compatibility**: 100% self-contained using existing local binaries, zero external network downloads.

### Execution Commands

```bash
# Run the entire test suite (all 4 tiers, 56 test cases)
npm test
# OR
node test/runner.mjs

# Run specific tiers
node test/runner.mjs --tier=1    # Tier 1: Feature Coverage (22 tests)
node test/runner.mjs --tier=2    # Tier 2: Boundary & Corner Cases (20 tests)
node test/runner.mjs --tier=3    # Tier 3: Cross-Feature Combinations (8 tests)
node test/runner.mjs --tier=4    # Tier 4: Real-World Scenarios (6 tests)

# Filter test suites by file name
node test/runner.mjs --grep=transport

# Filter individual test cases by pattern
node test/runner.mjs --test-name-pattern="subsidized"
```

---

## Directory Layout

```
test/
├── runner.mjs                                 # CLI Test runner & bundler
├── helpers/
│   └── test-utils.ts                         # Spec constants, factories, calculations, normalizers
├── tier1-feature-coverage/
│   ├── tier1-r1-fee-master.test.ts           # R1: Fee Master & Dual Category structures (6 tests)
│   ├── tier1-r2-components-calc.test.ts      # R2: 9 Components & Dynamic composite fees (6 tests)
│   ├── tier1-r3-transport-sync.test.ts       # R3: Transport toggle & DataContext sync (5 tests)
│   └── tier1-acceptance-nonregression.test.ts# Non-Regression: List, payments, invoices, overrides (5 tests)
├── tier2-boundary-corner/
│   ├── tier2-r1-boundaries.test.ts           # R1: Limits, empty lists, case/whitespace normalization (5 tests)
│   ├── tier2-r2-boundaries.test.ts           # R2: Zero fees, all-optional, grace boundaries, leap year (5 tests)
│   ├── tier2-r3-boundaries.test.ts           # R3: Null route, zero fare, capacity edges, toggle cycle (5 tests)
│   └── tier2-nonregression-boundaries.test.ts# Payments: Zero/negative, overpayment, micro-payments (5 tests)
├── tier3-cross-feature/
│   └── tier3-pairwise-combinations.test.ts   # Pairwise cross-feature interactions (8 tests)
└── tier4-real-world/
    └── tier4-application-scenarios.test.ts   # End-to-end user workflows (6 tests)
```

---

## Complete Test Inventory (56 Test Cases)

### Tier 1: Feature Coverage (22 Tests)
| Test ID | Test Name | Target Scope |
|---|---|---|
| T1.1 | Verify all 30 initial fee structures exist (15 classes x 2 categories) | R1 Master Structures |
| T1.2 | Verify Pre-Primary stage structures (Nursery, LKG, UKG) | R1 Pre-Primary |
| T1.3 | Verify Primary stage structures (Class 1 to Class 5) | R1 Primary |
| T1.4 | Verify Secondary stage structures (Class 6 to Class 10) | R1 Secondary |
| T1.5 | Verify Senior Secondary stage structures (Class 11 and Class 12) | R1 Senior Secondary |
| T1.6 | Verify Dual Category: Reservation / RTE distinct pricing & concessions | R1 Dual Category |
| T1.7 | Verify standard component breakdown in fee structures | R2 9 Components |
| T1.8 | Verify Laboratory & Science Practical fee rule (Class 6-12 only) | R2 Component Applicability |
| T1.9 | Verify dynamic composite fee calculation for Monthly collection | R2 Composite Engine |
| T1.10 | Verify dynamic composite fee calculation for Quarterly & Annual | R2 Composite Frequencies |
| T1.11 | Verify component management operations (add, edit, toggle, delete) | R2 Component Management |
| T1.12 | Verify Late Fee amount, due day of month, and grace period configuration | R2 Late Fee & Grace |
| T1.13 | Verify Student data model supports isAvailingTransport and busRouteId | R3 Student Model |
| T1.14 | Verify transport enrollment auto-sync adds transport fee component | R3 DataContext Sync |
| T1.15 | Verify transport dis-enrollment auto-sync removes transport fee component | R3 Dis-enrollment Sync |
| T1.16 | Verify route change auto-sync updates transport component to new fare | R3 Route Change Sync |
| T1.17 | Verify Reservation / RTE students receive subsidized transport rate | R3 RTE Transport Subsidies |
| T1.18 | Verify Student Fee Records List aggregate summary metrics | Non-Regression: Fee List |
| T1.19 | Verify partial payment recording updates paidAmount and sets status to partial | Non-Regression: Payment Modal |
| T1.20 | Verify full payment recording marks status as paid and sets paidDate | Non-Regression: Full Payment |
| T1.21 | Verify fee override adjusts student total without destroying structure link | Non-Regression: Fee Override |
| T1.22 | Verify invoice detail view itemizes components with individual amounts | Non-Regression: Invoice Detail |

### Tier 2: Boundary & Corner Cases (20 Tests)
| Test ID | Test Name | Boundary Category |
|---|---|---|
| T2.1 | Fee structure with empty components array handles gracefully with 0 composite | R1 Limits |
| T2.2 | Fee structure with 0 late fee and edge due days (Day 1 and Day 31) | R1 Boundaries |
| T2.3 | Class lookup with whitespace and case differences | R1 Robustness |
| T2.4 | Structure with duplicate component names handles without crash | R1 Data Integrity |
| T2.5 | Extreme fee amounts (₹1 Crore) and high component count (50+ items) | R1 Precision Stress |
| T2.6 | Zero amount components contribute 0 without altering composite sum | R2 Zero Input |
| T2.7 | All components set to optional yields 0 base composite fee | R2 Boundary State |
| T2.8 | Mixed frequency components combined across Monthly, Quarterly, Half-Yearly, Yearly | R2 Frequency Normalization |
| T2.9 | Grace period exact cutoff boundaries (due date, last grace day, and 1 day overdue) | R2 Date Thresholds |
| T2.10 | Due day clamping for short months (February, April) | R2 Calendar Edge |
| T2.11 | Student with isAvailingTransport=true but empty or undefined busRouteId | R3 Missing Reference |
| T2.12 | Student assigned to non-existent route ID | R3 Invalid Foreign Key |
| T2.13 | Bus route with 0 monthly fare (free transit) | R3 Zero Fare Boundary |
| T2.14 | Transport route capacity edge (assignedStudentsCount reaching capacity) | R3 Resource Limit |
| T2.15 | Rapid toggle idempotency (enrolled -> dis-enrolled -> re-enrolled -> dis-enrolled) | R3 State Churn |
| T2.16 | Zero and negative payment amount rejection | Non-Regression: Payment Validation |
| T2.17 | Payment exceeding outstanding balance handling | Non-Regression: Overpayment |
| T2.18 | Sequence of consecutive partial payments transitions status from pending to paid | Non-Regression: Micro-Payments |
| T2.19 | Student with 0 total fee (100% scholarship) defaults directly to paid status | Non-Regression: Zero Balance |
| T2.20 | Fee override where overrideAmount <= paidAmount immediately marks status as paid | Non-Regression: Override Settlement |

### Tier 3: Cross-Feature Combinations (8 Tests)
| Test ID | Pairwise Combination | Verification Objective |
|---|---|---|
| T3.1 | Category x Transport | Concession application across base tuition and transport |
| T3.2 | Frequency x Late Fees | Grace day and late fee consistency across billing cycles |
| T3.3 | Route Change x Fee Override | Retention and delta calculation when custom override exists |
| T3.4 | Stage Transition x Payment Status | Promoting student across academic stages with prior partial payments |
| T3.5 | Fee Master Component Update x Student Records | Propagating master fee component changes to composite fees |
| T3.6 | Category Switch x Transport Enrollment | Post-enrollment change from General to RTE category |
| T3.7 | Route Fare Update x Multiple Enrolled Students | Diesel surcharge / fare adjustments across student roster |
| T3.8 | Optional Components Selection x Transport | Additive calculation of transport + elective clubs |

### Tier 4: Real-World Application Scenarios (6 Tests)
| Test ID | Workflow Scenario | Scenario Description |
|---|---|---|
| T4.1 | Annual Academic Year Fee Setup Workflow | Full administration cycle reviewing and tuning 30 structures across all 4 stages |
| T4.2 | New Student Admission with Transport & RTE Subsidies | End-to-end student onboarding with transport toggle and auto-sync |
| T4.3 | Mid-Term Bus Route Transfer & Partial Payment | Relocation mid-term, updating route fare while preserving payment receipt history |
| T4.4 | RTE Legal Concession Verification and Audit | Education department regulatory audit across all academic stages |
| T4.5 | Grace Period Expiry, Late Fee & Settlement | Overdue invoice transition, late fee assessment, and full settlement |
| T4.6 | Bulk Class Fee Restructuring & Re-Synchronization | School board curriculum enhancement and composite fee recalculation |
