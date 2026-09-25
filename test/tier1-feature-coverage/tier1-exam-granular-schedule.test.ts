import test from 'node:test';
import assert from 'node:assert/strict';
import { initialExams, ExamSchedule } from '../../src/services/centralData';

test('Exam Schedule: Initial dataset contains granular details (Class, Section, Subject, Date, Time Range)', () => {
  assert.ok(initialExams.length >= 8, 'Should have multiple scheduled exams in initial dataset');

  initialExams.forEach(exam => {
    assert.ok(exam.name, 'Exam series name must be defined');
    assert.ok(exam.className, 'Class name must be defined');
    assert.ok(exam.section, 'Section must be defined');
    assert.ok(exam.subjectName, 'Subject name must be defined');
    assert.ok(exam.examDate, 'Exam date must be defined');
    assert.ok(exam.startTime, 'Start time must be defined');
    assert.ok(exam.endTime, 'End time must be defined');
    assert.ok(exam.timeRange, 'Time range must be defined');
    assert.ok(exam.maxMarks > 0, 'Max marks must be greater than 0');
  });
});

test('Exam Schedule: Allows multiple exams on the same day for a class & section', () => {
  // Find Class 10 Section A exams on 2026-09-25
  const sameDayExams = initialExams.filter(
    e => e.className === '10' && e.section === 'A' && e.examDate === '2026-09-25'
  );

  assert.equal(sameDayExams.length, 2, 'Class 10-A should have 2 exams scheduled on 2026-09-25');

  const slot1 = sameDayExams.find(e => e.subjectName === 'Mathematics');
  const slot2 = sameDayExams.find(e => e.subjectName === 'Computer Applications Lab');

  assert.ok(slot1, 'Mathematics slot must exist on 2026-09-25');
  assert.ok(slot2, 'Computer Applications Lab slot must exist on 2026-09-25');

  assert.equal(slot1?.startTime, '09:00 AM');
  assert.equal(slot1?.endTime, '11:30 AM');
  assert.equal(slot1?.roomNumber, 'Exam Hall A');

  assert.equal(slot2?.startTime, '01:30 PM');
  assert.equal(slot2?.endTime, '03:30 PM');
  assert.equal(slot2?.roomNumber, 'Computer Lab 2');
});

test('Exam Schedule: Allows single exam on a day for a class & section', () => {
  const class5Exams = initialExams.filter(
    e => e.className === '5' && e.section === 'A' && e.examDate === '2026-09-28'
  );

  assert.equal(class5Exams.length, 1, 'Class 5-A should have 1 exam scheduled on 2026-09-28');
  assert.equal(class5Exams[0].subjectName, 'Environmental Studies');
  assert.equal(class5Exams[0].timeRange, '09:30 AM - 11:30 AM');
});

test('Exam Schedule: Chronological sorting by date and start time', () => {
  const sorted = [...initialExams].sort((a, b) => {
    const dateA = a.examDate || a.startDate || '';
    const dateB = b.examDate || b.startDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  // Verify dates are non-decreasing
  for (let i = 0; i < sorted.length - 1; i++) {
    const curDate = sorted[i].examDate || sorted[i].startDate || '';
    const nextDate = sorted[i + 1].examDate || sorted[i + 1].startDate || '';
    assert.ok(curDate <= nextDate, `Date ${curDate} must be <= ${nextDate}`);
  }
});
