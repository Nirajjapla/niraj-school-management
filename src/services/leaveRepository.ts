import type { LeaveRequest } from './centralData';

export type CreateLeaveInput = Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'> & {
  status?: 'pending' | 'approved' | 'rejected';
  appliedDate?: string;
};

export type UpdateLeaveInput = Partial<Omit<LeaveRequest, 'id'>>;

export interface LeaveRepository {
  /** Mode indicator: mock in-memory/localStorage vs backend API */
  readonly mode: 'mock' | 'api';
  list(): Promise<LeaveRequest[]>;
  create(input: CreateLeaveInput): Promise<LeaveRequest>;
  update(id: string, input: UpdateLeaveInput): Promise<LeaveRequest>;
  remove(id: string): Promise<void>;
  approve(id: string, approvedBy?: string): Promise<LeaveRequest>;
  reject(id: string, reason: string, approvedBy?: string): Promise<LeaveRequest>;
}

export function validateLeave(leave: CreateLeaveInput): void {
  if (!leave.employeeId?.trim() || !leave.employeeName?.trim()) {
    throw new Error('Employee selection is required.');
  }
  if (!leave.startDate?.trim() || !leave.endDate?.trim()) {
    throw new Error('Start date and end date are required.');
  }
  if (new Date(leave.startDate) > new Date(leave.endDate)) {
    throw new Error('Start date cannot be after end date.');
  }
  if (!leave.reason?.trim()) {
    throw new Error('Reason for leave is required.');
  }
  if (!['Paid', 'Unpaid'].includes(leave.leaveType)) {
    throw new Error('Leave type must be either Paid or Unpaid.');
  }
}

/** In-memory & localStorage mock repository for Leave Management */
export function createMockLeaveRepository(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  seed: LeaveRequest[]
): LeaveRepository {
  const key = 'erp_leaves';

  const write = (leaves: LeaveRequest[]) => storage.setItem(key, JSON.stringify(leaves));

  const read = (): LeaveRequest[] => {
    const raw = storage.getItem(key);
    if (raw === null) {
      write(seed);
      return structuredClone(seed);
    }
    try {
      const rows: unknown = JSON.parse(raw);
      if (!Array.isArray(rows) || rows.some(row => !row || typeof row.id !== 'string')) {
        write(seed);
        return structuredClone(seed);
      }
      // Normalize any legacy leave types to Paid / Unpaid
      const normalized: LeaveRequest[] = (rows as LeaveRequest[]).map(r => ({
        ...r,
        leaveType: (r.leaveType === 'Unpaid' || r.isPaid === false) ? 'Unpaid' : 'Paid',
        isPaid: r.leaveType === 'Unpaid' ? false : (r.isPaid ?? true)
      }));
      return normalized;
    } catch {
      write(seed);
      return structuredClone(seed);
    }
  };

  return {
    mode: 'mock',
    async list() {
      return read();
    },
    async create(input) {
      validateLeave(input);
      const rows = read();
      const id = `lv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const isPaid = input.leaveType === 'Paid';
      const newLeave: LeaveRequest = {
        ...input,
        id,
        leaveType: input.leaveType,
        isPaid,
        appliedDate: input.appliedDate || new Date().toISOString().split('T')[0],
        status: input.status || 'pending'
      };
      write([newLeave, ...rows]);
      return newLeave;
    },
    async update(id, input) {
      const rows = read();
      const current = rows.find(r => r.id === id);
      if (!current) throw new Error('Leave request not found.');
      const isPaid = input.leaveType !== undefined ? input.leaveType === 'Paid' : current.isPaid;
      const updated: LeaveRequest = {
        ...current,
        ...input,
        id,
        isPaid
      };
      validateLeave(updated);
      write(rows.map(r => (r.id === id ? updated : r)));
      return updated;
    },
    async remove(id) {
      const rows = read();
      if (!rows.some(r => r.id === id)) throw new Error('Leave request not found.');
      write(rows.filter(r => r.id !== id));
    },
    async approve(id, approvedBy = 'Admin') {
      const rows = read();
      const current = rows.find(r => r.id === id);
      if (!current) throw new Error('Leave request not found.');
      const updated: LeaveRequest = {
        ...current,
        status: 'approved',
        approvedBy
      };
      write(rows.map(r => (r.id === id ? updated : r)));
      return updated;
    },
    async reject(id, reason, approvedBy = 'Admin') {
      const rows = read();
      const current = rows.find(r => r.id === id);
      if (!current) throw new Error('Leave request not found.');
      const updated: LeaveRequest = {
        ...current,
        status: 'rejected',
        rejectionReason: reason,
        approvedBy
      };
      write(rows.map(r => (r.id === id ? updated : r)));
      return updated;
    }
  };
}

/** API adapter repository for future backend service integration */
export function createApiLeaveRepository<CreateDto, UpdateDto>(
  gateway: {
    getLeaves(): Promise<unknown>;
    createLeave(input: CreateDto): Promise<unknown>;
    updateLeave(id: string, input: UpdateDto): Promise<unknown>;
    deleteLeave(id: string): Promise<unknown>;
    approveLeave(id: string, approvedBy?: string): Promise<unknown>;
    rejectLeave(id: string, reason: string): Promise<unknown>;
  },
  contract: {
    encodeCreate(input: CreateLeaveInput): CreateDto;
    encodeUpdate(input: UpdateLeaveInput): UpdateDto;
    decodeLeave(response: unknown): LeaveRequest;
    decodeList(response: unknown): LeaveRequest[];
  }
): LeaveRepository {
  return {
    mode: 'api',
    async list() {
      return contract.decodeList(await gateway.getLeaves());
    },
    async create(input) {
      validateLeave(input);
      return contract.decodeLeave(await gateway.createLeave(contract.encodeCreate(input)));
    },
    async update(id, input) {
      return contract.decodeLeave(await gateway.updateLeave(id, contract.encodeUpdate(input)));
    },
    async remove(id) {
      await gateway.deleteLeave(id);
    },
    async approve(id, approvedBy) {
      return contract.decodeLeave(await gateway.approveLeave(id, approvedBy));
    },
    async reject(id, reason) {
      return contract.decodeLeave(await gateway.rejectLeave(id, reason));
    }
  };
}
