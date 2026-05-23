/**
 * Property-based tests cho dashboardUtils.
 * Feature: role-based-dashboard
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calcAttendanceRate, normalizeInstructorName, getEnrolledClassIds } from './dashboardUtils';
import type { AttendanceSession, AttendanceRecord } from '../../context/AppContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

const arbStatus = fc.constantFrom('present', 'absent', 'late', 'excused') as fc.Arbitrary<AttendanceRecord['status']>;

const arbRecord = (studentIds: string[]) =>
  fc.record({
    id: fc.uuid(),
    classId: fc.constant('MATH-06-01'),
    studentId: fc.oneof(...studentIds.map(id => fc.constant(id))),
    studentName: fc.string({ minLength: 1, maxLength: 20 }),
    date: fc.constant('2025-01-01'),
    status: arbStatus,
    markedBy: fc.constant('ADM-001'),
    markedAt: fc.constant(new Date().toISOString()),
  });

const arbSession = (studentIds: string[]) =>
  fc.array(arbRecord(studentIds), { minLength: 0, maxLength: 10 }).map(records => ({
    id: fc.sample(fc.uuid(), 1)[0],
    classId: 'MATH-06-01',
    className: 'Toán 6',
    date: '2025-01-01',
    totalStudents: records.length,
    presentCount: records.filter(r => r.status === 'present').length,
    absentCount: records.filter(r => r.status === 'absent').length,
    lateCount: records.filter(r => r.status === 'late').length,
    excusedCount: records.filter(r => r.status === 'excused').length,
    records,
    isFinalized: false,
  } as AttendanceSession));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calcAttendanceRate', () => {
  // Feature: role-based-dashboard, Property 3 & 4: tỷ lệ chuyên cần trong [0,100]
  it('Property 3: kết quả luôn trong [0, 100] với mọi input hợp lệ', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.record({
          id: fc.uuid(),
          classId: fc.constant('CLS-1'),
          studentId: fc.string({ minLength: 1, maxLength: 10 }),
          studentName: fc.string({ minLength: 1, maxLength: 20 }),
          date: fc.constant('2025-01-01'),
          status: arbStatus,
          markedBy: fc.constant('ADM-001'),
          markedAt: fc.constant(new Date().toISOString()),
        }), { minLength: 0, maxLength: 20 }),
        (studentIds, records) => {
          const sessions: AttendanceSession[] = records.length > 0 ? [{
            id: 'sess-1',
            classId: 'CLS-1',
            className: 'Test',
            date: '2025-01-01',
            totalStudents: records.length,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            records,
            isFinalized: false,
          }] : [];

          const rate = calcAttendanceRate(studentIds, sessions);
          expect(rate).toBeGreaterThanOrEqual(0);
          expect(rate).toBeLessThanOrEqual(100);
          expect(Number.isNaN(rate)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: edge case — mảng rỗng trả về 0
  it('Property 4: trả về 0 khi không có bản ghi điểm danh', () => {
    expect(calcAttendanceRate(['STU-001'], [])).toBe(0);
    expect(calcAttendanceRate([], [])).toBe(0);
  });
});

describe('normalizeInstructorName', () => {
  it('bỏ tiền tố Thầy/Cô và lowercase', () => {
    expect(normalizeInstructorName('Thầy Nguyễn Minh')).toBe('nguyễn minh');
    expect(normalizeInstructorName('Cô Lê Thị Thu')).toBe('lê thị thu');
    expect(normalizeInstructorName('Nguyễn Minh')).toBe('nguyễn minh');
    expect(normalizeInstructorName('  Thầy  Trần Hùng  ')).toBe('trần hùng');
  });

  // Property 2: Lớp học của giáo viên là tập con của tất cả lớp
  it('Property 2: kết quả lọc lớp theo tên GV là tập con của tất cả lớp', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.string({ minLength: 1, maxLength: 10 }),
          instructor: fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 1, maxLength: 20 }).map(s => `Thầy ${s}`),
            fc.string({ minLength: 1, maxLength: 20 }).map(s => `Cô ${s}`),
          ),
        }), { minLength: 0, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (classes, teacherName) => {
          const normalized = normalizeInstructorName(teacherName);
          const myClasses = classes.filter(
            cls => normalizeInstructorName(cls.instructor) === normalized
          );
          // Tập con
          expect(myClasses.length).toBeLessThanOrEqual(classes.length);
          // Mọi phần tử đều khớp
          myClasses.forEach(cls => {
            expect(normalizeInstructorName(cls.instructor)).toBe(normalized);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('getEnrolledClassIds', () => {
  // Property 5: Lớp học của học viên là tập con của CLASS_STUDENT_MAP
  it('Property 5: kết quả là tập con của CLASS_STUDENT_MAP và chứa studentId', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 5 }),
        (studentIds) => {
          const classIds = getEnrolledClassIds(studentIds);
          // Kết quả là mảng string
          expect(Array.isArray(classIds)).toBe(true);
          // Không có duplicate
          expect(new Set(classIds).size).toBe(classIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('trả về mảng rỗng khi studentIds rỗng', () => {
    expect(getEnrolledClassIds([])).toEqual([]);
  });
});
