import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockStudentRepository, createApiStudentRepository, importStudents } from '../../src/services/studentRepository';
import { initialStudents } from '../../src/services/centralData';

function fixture() {
  const entries = new Map<string, string>();
  const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); } };
  return { storage, repo: createMockStudentRepository(storage, [initialStudents[0]]) };
}
const input = () => { const { id, user, studentId, ...data } = initialStudents[0]; return data; };

test('Student repository: persistence and deletion survive repository recreation without reseeding', async () => {
  const { storage, repo } = fixture();
  const [seed] = await repo.list();
  await repo.remove(seed.id);
  assert.deepEqual(await createMockStudentRepository(storage, [seed]).list(), []);
  const created = await repo.create(input());
  const updated = await repo.update(created.id, { firstName: 'Updated', classId: 'class-1', sectionId: 'section-1' });
  assert.equal(updated.firstName, 'Updated');
  assert.deepEqual(await createMockStudentRepository(storage, []).list(), [updated]);
});

test('Student repository: bulk creation produces unique stable identities', async () => {
  const { repo } = fixture();
  const created = await Promise.all(Array.from({ length: 100 }, () => repo.create(input())));
  assert.equal(new Set(created.map(row => row.id)).size, 100);
  assert.equal(new Set(created.map(row => row.studentId)).size, 100);
  assert.equal((await repo.list()).length, 101);
});

test('Student repository: invalid fields and duplicate admission IDs never persist', async () => {
  const { repo } = fixture();
  await assert.rejects(repo.create({ ...input(), firstName: '   ' }), /required/);
  await assert.rejects(repo.create({ ...input(), isAvailingTransport: true, busRouteId: '' }), /route/);
  await assert.rejects(repo.create({ ...input(), parentEmail: 'invalid' }), /email/);
  await assert.rejects(repo.create({ ...input(), studentId: initialStudents[0].studentId.toLowerCase() }), /already exists/);
  const created = await repo.create(input());
  await assert.rejects(repo.update(created.id, { studentId: initialStudents[0].studentId }), /already exists/);
  await assert.rejects(repo.update('missing', { firstName: 'Name' }), /no longer exists/);
  assert.equal((await repo.list()).length, 2);
});

test('Student repository: corrupt or unavailable storage rejects without replacing saved data', async () => {
  const { storage, repo } = fixture();
  storage.setItem('erp_students', '{broken');
  await assert.rejects(repo.list());
  assert.equal(storage.getItem('erp_students'), '{broken');
  const denied = createMockStudentRepository({ getItem: () => '[]', setItem: () => { throw new Error('Storage full'); } }, []);
  await assert.rejects(denied.create(input()), /Storage full/);
  assert.deepEqual(await denied.list(), []);
});

test('Student import: partial failures return only retryable rows and await each result', async () => {
  const { repo } = fixture();
  let attempt = 0;
  const result = await importStudents([input(), input(), input()], async row => {
    await Promise.resolve();
    if (++attempt === 2) throw new Error('Server unavailable');
    return repo.create(row);
  });
  assert.equal(result.imported.length, 2);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].message, 'Server unavailable');
  const retry = await importStudents(result.failed.map(row => row.input), repo.create);
  assert.equal(retry.imported.length, 1);
  assert.equal((await repo.list()).length, 4);
});

test('Student API adapter: explicit wire mappings and authoritative server result are respected', async () => {
  const authoritative = { ...initialStudents[0], id: 'server-id' };
  const calls: unknown[] = [];
  const repo = createApiStudentRepository({
    async getStudents() { return { records: [authoritative] }; },
    async createStudent(payload: { first_name: string }) { calls.push(payload); return { record: authoritative }; },
    async updateStudent(id: string, payload: { first_name?: string }) { calls.push([id, payload]); return { record: authoritative }; },
    async deleteStudent(id: string) { calls.push(id); }
  }, {
    encodeCreate: row => ({ first_name: row.firstName }),
    encodeUpdate: row => ({ first_name: row.firstName }),
    decodeStudent: (response: any) => response.record,
    decodeList: (response: any) => response.records
  });
  assert.equal(repo.mode, 'api');
  assert.deepEqual(await repo.list(), [authoritative]);
  assert.equal((await repo.create(input())).id, 'server-id');
  await repo.update('server-id', { firstName: 'Changed' });
  await repo.remove('server-id');
  assert.deepEqual(calls, [{ first_name: input().firstName }, ['server-id', { first_name: 'Changed' }], 'server-id']);
});

test('Student API adapter: failed requests propagate without mock fallback', async () => {
  const fail = async () => { throw new Error('401 Unauthorized'); };
  const repo = createApiStudentRepository({ getStudents: fail, createStudent: fail, updateStudent: fail, deleteStudent: fail }, {
    encodeCreate: row => row, encodeUpdate: row => row,
    decodeStudent: () => { throw new Error('Unexpected decode'); }, decodeList: () => []
  });
  await assert.rejects(repo.list(), /401/);
  await assert.rejects(repo.create(input()), /401/);
  await assert.rejects(repo.update('id', {}), /401/);
  await assert.rejects(repo.remove('id'), /401/);
});
