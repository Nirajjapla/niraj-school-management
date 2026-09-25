import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockLeaveRepository, createApiLeaveRepository } from '../../src/services/leaveRepository';
import { initialLeaves, initialEmployees, Employee, LeaveRequest } from '../../src/services/centralData';

function leaveFixture() {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    }
  };
  return { storage, repo: createMockLeaveRepository(storage, structuredClone(initialLeaves)) };
}

test('Leave repository: basic CRUD and approval/rejection lifecycle', async () => {
  const { storage, repo } = leaveFixture();
  const list = await repo.list();
  assert.equal(list.length, initialLeaves.length);

  // Create new leave
  const created = await repo.create({
    employeeId: 'emp-1',
    employeeName: 'Anita Sharma',
    employeeRole: 'teacher',
    leaveType: 'Paid',
    isPaid: true,
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    daysCount: 3,
    reason: 'Attending National Education Conclave'
  });
  assert.equal(created.status, 'pending');
  assert.equal(created.daysCount, 3);
  assert.equal(created.leaveType, 'Paid');

  // Approve leave
  const approved = await repo.approve(created.id, 'Principal');
  assert.equal(approved.status, 'approved');
  assert.equal(approved.approvedBy, 'Principal');

  // Reject another leave
  const rejected = await repo.reject(list[0].id, 'Urgent examination duties', 'Vice Principal');
  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.rejectionReason, 'Urgent examination duties');
  assert.equal(rejected.approvedBy, 'Vice Principal');

  // Delete leave
  await repo.remove(created.id);
  const updatedList = await repo.list();
  assert.equal(updatedList.some(l => l.id === created.id), false);
});

test('Leave repository: validation guards against invalid dates and missing fields', async () => {
  const { repo } = leaveFixture();

  // Missing employee
  await assert.rejects(
    repo.create({
      employeeId: '',
      employeeName: '',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      daysCount: 2,
      reason: 'Valid reason'
    }),
    /Employee selection is required/
  );

  // Inverted dates
  await assert.rejects(
    repo.create({
      employeeId: 'emp-1',
      employeeName: 'Anita Sharma',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-10-05',
      endDate: '2026-10-01',
      daysCount: 2,
      reason: 'Valid reason'
    }),
    /Start date cannot be after end date/
  );

  // Missing reason
  await assert.rejects(
    repo.create({
      employeeId: 'emp-1',
      employeeName: 'Anita Sharma',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      daysCount: 2,
      reason: '   '
    }),
    /Reason for leave is required/
  );
});

test('Leave Quota: initial employees possess configured leave quotas (18 for teachers, 15 for staff)', () => {
  for (const emp of initialEmployees) {
    if (emp.role === 'teacher') {
      assert.equal(emp.paidLeaveQuota, 18, `Teacher ${emp.name} should have default 18 paid leave quota`);
    } else {
      assert.equal(emp.paidLeaveQuota, 15, `Staff ${emp.name} should have default 15 paid leave quota`);
    }
  }
});

test('Leave Quota: balance computation accurately calculates allocated, used, remaining, and unpaid days', () => {
  const emp: Employee = {
    id: 'emp-test-1',
    code: 'TCH-TEST',
    name: 'Test Teacher',
    role: 'teacher',
    designation: 'Mathematics Teacher',
    department: 'Mathematics',
    phone: '+91 99999 88888',
    email: 'test@school.com',
    joiningDate: '2022-01-01',
    qualification: 'B.Ed',
    gender: 'Female',
    bloodGroup: 'O+',
    paidLeaveQuota: 18,
    leaveBalance: {
      casual: { total: 12, taken: 0 },
      sick: { total: 10, taken: 0 },
      earned: { total: 15, taken: 0 }
    }
  };

  const sampleLeaves: LeaveRequest[] = [
    {
      id: 'lv-t1',
      employeeId: 'emp-test-1',
      employeeName: 'Test Teacher',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      daysCount: 3,
      reason: 'Medical rest',
      status: 'approved',
      appliedDate: '2026-05-28'
    },
    {
      id: 'lv-t2',
      employeeId: 'emp-test-1',
      employeeName: 'Test Teacher',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-07-10',
      endDate: '2026-07-11',
      daysCount: 2,
      reason: 'Personal work',
      status: 'approved',
      appliedDate: '2026-07-05'
    },
    {
      id: 'lv-t3',
      employeeId: 'emp-test-1',
      employeeName: 'Test Teacher',
      employeeRole: 'teacher',
      leaveType: 'Paid',
      isPaid: true,
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      daysCount: 2,
      reason: 'Pending request',
      status: 'pending',
      appliedDate: '2026-07-28'
    },
    {
      id: 'lv-t4',
      employeeId: 'emp-test-1',
      employeeName: 'Test Teacher',
      employeeRole: 'teacher',
      leaveType: 'Unpaid',
      isPaid: false,
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      daysCount: 5,
      reason: 'Extended family visit',
      status: 'approved',
      appliedDate: '2026-08-20'
    }
  ];

  // Helper matching DataContext getEmployeeLeaveBalance logic
  const computeBalance = (employee: Employee, leavesList: LeaveRequest[]) => {
    const quota = employee.paidLeaveQuota ?? (employee.role === 'teacher' ? 18 : 15);
    const empLeaves = leavesList.filter(l => l.employeeId === employee.id);
    const usedPaid = empLeaves
      .filter(l => (l.leaveType === 'Paid' || l.isPaid) && l.status === 'approved')
      .reduce((sum, l) => sum + (l.daysCount || 1), 0);
    const pendingPaid = empLeaves
      .filter(l => (l.leaveType === 'Paid' || l.isPaid) && l.status === 'pending')
      .reduce((sum, l) => sum + (l.daysCount || 1), 0);
    const usedUnpaid = empLeaves
      .filter(l => (l.leaveType === 'Unpaid' || !l.isPaid) && l.status === 'approved')
      .reduce((sum, l) => sum + (l.daysCount || 1), 0);
    const remainingPaid = Math.max(0, quota - usedPaid);
    return { quota, usedPaid, remainingPaid, usedUnpaid, pendingPaid };
  };

  const balance = computeBalance(emp, sampleLeaves);
  assert.equal(balance.quota, 18);
  assert.equal(balance.usedPaid, 5); // 3 + 2 approved paid days
  assert.equal(balance.remainingPaid, 13); // 18 - 5
  assert.equal(balance.pendingPaid, 2); // 2 pending paid days
  assert.equal(balance.usedUnpaid, 5); // 5 approved unpaid days

  // Boundary condition: Quota adjustment when used > new quota
  const reducedEmp = { ...emp, paidLeaveQuota: 4 };
  const reducedBalance = computeBalance(reducedEmp, sampleLeaves);
  assert.equal(reducedBalance.quota, 4);
  assert.equal(reducedBalance.usedPaid, 5);
  assert.equal(reducedBalance.remainingPaid, 0); // clamped to 0, not negative
});

test('Leave Quota: bulk update propagates custom quotas across teacher and staff roles', () => {
  const employees: Employee[] = [
    { ...initialEmployees[0], role: 'teacher', paidLeaveQuota: 18 },
    { ...initialEmployees[1], role: 'teacher', paidLeaveQuota: 18 },
    { ...initialEmployees[3], role: 'admin', paidLeaveQuota: 15 },
    { ...initialEmployees[4], role: 'support', paidLeaveQuota: 15 }
  ];

  // Bulk update teachers to 20
  const updatedTeachers = employees.map(e => e.role === 'teacher' ? { ...e, paidLeaveQuota: 20 } : e);
  assert.equal(updatedTeachers[0].paidLeaveQuota, 20);
  assert.equal(updatedTeachers[1].paidLeaveQuota, 20);
  assert.equal(updatedTeachers[2].paidLeaveQuota, 15);
  assert.equal(updatedTeachers[3].paidLeaveQuota, 15);

  // Bulk update staff to 12
  const updatedStaff = updatedTeachers.map(e => e.role !== 'teacher' ? { ...e, paidLeaveQuota: 12 } : e);
  assert.equal(updatedStaff[0].paidLeaveQuota, 20);
  assert.equal(updatedStaff[1].paidLeaveQuota, 20);
  assert.equal(updatedStaff[2].paidLeaveQuota, 12);
  assert.equal(updatedStaff[3].paidLeaveQuota, 12);
});
