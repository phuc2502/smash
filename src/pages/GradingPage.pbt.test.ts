/**
 * Property-Based Tests for GradingPage data isolation logic.
 * Feature: grading-and-feedback
 * Property 7: Học viên/phụ huynh chỉ thấy dữ liệu của mình
 * Validates: Yêu cầu 2.2, 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ── Pure helper functions (mirrors GradingPage logic) ────────────────────────

/** Filter entries for a student role — only their own data */
function filterForStudent(
  entries: Array<{ studentId: string }>,
  myId: string
): Array<{ studentId: string }> {
  return entries.filter(e => e.studentId === myId);
}

/** Filter entries for a parent role — only their children's data */
function filterForParent(
  entries: Array<{ studentId: string }>,
  childIds: string[]
): Array<{ studentId: string }> {
  return entries.filter(e => childIds.includes(e.studentId));
}

/** Get visible student IDs based on role */
function getVisibleStudentIds(
  allStudentIds: string[],
  role: 'student' | 'parent' | 'teacher',
  currentId: string,
  childIds: string[]
): string[] {
  if (role === 'student') {
    return allStudentIds.filter(id => id === currentId);
  }
  if (role === 'parent') {
    return allStudentIds.filter(id => childIds.includes(id));
  }
  return allStudentIds;
}

// ── Property 7: Học viên/phụ huynh chỉ thấy dữ liệu của mình ───────────────
// Feature: grading-and-feedback, Property 7: student sees only own data
// Validates: Yêu cầu 2.2, 2.3

describe('Property 7: Data isolation — học viên/phụ huynh chỉ thấy dữ liệu của mình', () => {
  it('student only sees their own entries', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(
          fc.record({
            studentId: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { maxLength: 20 }
        ),
        (myId, allEntries) => {
          const visible = filterForStudent(allEntries, myId);
          return visible.every(e => e.studentId === myId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('parent only sees entries for their children', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        fc.array(
          fc.record({
            studentId: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          { maxLength: 20 }
        ),
        (childIds, allEntries) => {
          const visible = filterForParent(allEntries, childIds);
          return visible.every(e => childIds.includes(e.studentId));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getVisibleStudentIds for student returns only their own ID', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (allIds, myId) => {
          const allWithMe = [...allIds, myId];
          const visible = getVisibleStudentIds(allWithMe, 'student', myId, []);
          return visible.every(id => id === myId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getVisibleStudentIds for parent returns only child IDs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 10 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
        (allIds, childIds) => {
          const visible = getVisibleStudentIds(allIds, 'parent', 'PAR-001', childIds);
          return visible.every(id => childIds.includes(id));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getVisibleStudentIds for teacher returns all IDs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 10 }),
        (allIds) => {
          const visible = getVisibleStudentIds(allIds, 'teacher', 'TCH-001', []);
          return visible.length === allIds.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
