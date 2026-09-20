import type { Student } from './centralData';

export type CreateStudentInput = Omit<Student, 'id' | 'user' | 'studentId'> & { studentId?: string };
export type UpdateStudentInput = Partial<Omit<Student, 'id' | 'user'>>;
export interface StudentRepository {
  /** Local demo side effects are not appropriate for a server-owned ledger. */
  readonly mode: 'mock' | 'api';
  list(): Promise<Student[]>;
  create(input: CreateStudentInput): Promise<Student>;
  update(id: string, input: UpdateStudentInput): Promise<Student>;
  remove(id: string): Promise<void>;
}

export function validateStudent(student: CreateStudentInput): void {
  if (!student.firstName.trim() || !student.lastName.trim() || !student.class.trim() || !student.section.trim()) {
    throw new Error('First name, last name, class and section are required.');
  }
  if (!['Male', 'Female', 'Other'].includes(student.gender)) throw new Error('Invalid gender.');
  if (!['normal', 'reservation'].includes(student.category)) throw new Error('Invalid student category.');
  if (student.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.parentEmail)) {
    throw new Error('Enter a valid parent email address.');
  }
  if (student.isAvailingTransport && !student.busRouteId) throw new Error('Select a transport route.');
}

/** Seed once: deleted demo students must not reappear on the next load. */
export function createMockStudentRepository(storage: Pick<Storage, 'getItem' | 'setItem'>, seed: Student[]): StudentRepository {
  const key = 'erp_students';
  const write = (students: Student[]) => storage.setItem(key, JSON.stringify(students));
  const read = (): Student[] => {
    const raw = storage.getItem(key);
    if (raw === null) {
      write(seed);
      return structuredClone(seed);
    }
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row.id !== 'string')) {
      throw new Error('Saved student data is invalid. Restore your browser data before retrying.');
    }
    return rows as Student[];
  };
  const checkDuplicate = (rows: Student[], student: Student) => {
    if (rows.some(row => row.id !== student.id && row.studentId.toLowerCase() === student.studentId.toLowerCase())) {
      throw new Error(`Admission ID ${student.studentId} already exists.`);
    }
  };
  return {
    mode: 'mock',
    async list() { return read(); },
    async create(input) {
      validateStudent(input);
      const rows = read();
      const id = crypto.randomUUID();
      const student: Student = { ...input, id, studentId: input.studentId?.trim() || `STU-${id}`, firstName: input.firstName.trim(), lastName: input.lastName.trim() };
      checkDuplicate(rows, student);
      write([student, ...rows]);
      return student;
    },
    async update(id, input) {
      const rows = read();
      const current = rows.find(row => row.id === id);
      if (!current) throw new Error('Student no longer exists. Reload the list.');
      const student = { ...current, ...input, id };
      validateStudent(student);
      if (!student.studentId.trim()) throw new Error('Admission ID is required.');
      checkDuplicate(rows, student);
      write(rows.map(row => row.id === id ? student : row));
      return student;
    },
    async remove(id) {
      const rows = read();
      if (!rows.some(row => row.id === id)) throw new Error('Student no longer exists. Reload the list.');
      write(rows.filter(row => row.id !== id));
    }
  };
}

/** Supply verified wire mappings when the backend contract is available. */
export function createApiStudentRepository<CreateDto, UpdateDto>(
  gateway: {
    getStudents(): Promise<unknown>;
    createStudent(input: CreateDto): Promise<unknown>;
    updateStudent(id: string, input: UpdateDto): Promise<unknown>;
    deleteStudent(id: string): Promise<unknown>;
  },
  contract: {
    encodeCreate(input: CreateStudentInput): CreateDto;
    encodeUpdate(input: UpdateStudentInput): UpdateDto;
    decodeStudent(response: unknown): Student;
    decodeList(response: unknown): Student[];
  }
): StudentRepository {
  return {
    mode: 'api',
    async list() { return contract.decodeList(await gateway.getStudents()); },
    async create(input) {
      validateStudent(input);
      return contract.decodeStudent(await gateway.createStudent(contract.encodeCreate(input)));
    },
    async update(id, input) { return contract.decodeStudent(await gateway.updateStudent(id, contract.encodeUpdate(input))); },
    async remove(id) { await gateway.deleteStudent(id); }
  };
}

export async function importStudents(
  rows: CreateStudentInput[],
  create: (input: CreateStudentInput) => Promise<Student>
): Promise<{ imported: Student[]; failed: Array<{ input: CreateStudentInput; message: string }> }> {
  const imported: Student[] = [];
  const failed: Array<{ input: CreateStudentInput; message: string }> = [];
  for (const input of rows) {
    try { imported.push(await create(input)); }
    catch (error) { failed.push({ input, message: error instanceof Error ? error.message : 'Unable to import student.' }); }
  }
  return { imported, failed };
}
