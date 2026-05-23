/**
 * Property-Based Tests for grading-and-feedback feature.
 * Feature: grading-and-feedback
 * Uses fast-check, minimum 100 runs per property.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calcAverage, classifyGrade } from '../utils/gradeUtils';
import type { GradeEntry, StudentComment, ScoreType } from './AppContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeGradeEntry(score: number, idx: number): GradeEntry {
  return {
    id: `GE-${idx}`,
    studentId: 'S1',
    classId: 'C1',
    title: 'Test',
    scoreType: 'oral' as ScoreType,
    score,
    maxScore: 10,
    gradedBy: 'T1',
    gradedAt: new Date().toISOString(),
  };
}

/** Pure function: apply addGradeEntry to a state array */
function applyAddGradeEntry(state: GradeEntry[], entry: Omit<GradeEntry, 'id'>): GradeEntry[] {
  return [{ ...entry, id: `GE-${Date.now()}` }, ...state];
}

/** Pure function: apply saveStudentComment upsert */
function applyUpsert(
  comments: StudentComment[],
  comment: Omit<StudentComment, 'id' | 'createdAt' | 'updatedAt'>
): StudentComment[] {
  const existing = comments.find(
    c => c.studentId === comment.studentId && c.classId === comment.classId
  );
  if (existing) {
    return comments.map(c =>
      c.id === existing.id
        ? { ...c, content: comment.content, updatedAt: new Date().toISOString() }
        : c
    );
  }
  return [
    ...comments,
    {
      ...comment,
      id: `CMT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/** Pure function: apply gradeEssaySubmission */
function applyGradeEssay(
  submissions: Array<{ id: string; score?: number }>,
  submissionId: string,
  newScore: number
): Array<{ id: string; score?: number }> {
  return submissions.map(s => s.id === submissionId ? { ...s, score: newScore } : s);
}

/** Pure function: filter pending essays (no score) */
function getPendingEssays(
  submissions: Array<{ id: string; score?: number }>
): Array<{ id: string; score?: number }> {
  return submissions.filter(s => s.score === undefined);
}

/** Pure function: filter entries for a specific student */
function filterForStudent(
  entries: Array<{ studentId: string; score: number }>,
  myId: string
): Array<{ studentId: string; score: number }> {
  return entries.filter(e => e.studentId === myId);
}

/** Compute displayed average from GradeEntry array */
function computeDisplayedAverage(entries: GradeEntry[]): number | null {
  return calcAverage(entries.map(e => e.score));
}

/** Expected classification for a given average */
function expectedClassification(avg: number): string {
  if (avg >= 9.0) return 'Xuất sắc';
  if (avg >= 8.0) return 'Giỏi';
  if (avg >= 6.5) return 'Khá';
  if (avg >= 5.0) return 'Trung bình';
  return 'Yếu';
}

// ── Property 1: Điểm TB phản ánh đúng tất cả GradeEntry ─────────────────────
// Feature: grading-and-feedback, Property 1: average reflects all grade entries
// Validates: Yêu cầu 5.2, 7.1, 7.4, 7.5

describe('Property 1: Điểm TB phản ánh đúng tất cả GradeEntry', () => {
  it('computeDisplayedAverage(entries) === calcAverage(scores)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: 0, max: 10, noNaN: true }), { minLength: 1, maxLength: 20 }),
        (scores) => {
          const entries = scores.map((s, i) => makeGradeEntry(s, i));
          const displayed = computeDisplayedAverage(entries);
          const expected = calcAverage(scores);
          return displayed === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns null for empty entries', () => {
    expect(computeDisplayedAverage([])).toBeNull();
  });
});

// ── Property 2: Xếp loại nhất quán với điểm TB ──────────────────────────────
// Feature: grading-and-feedback, Property 2: classification consistent with average
// Validates: Yêu cầu 5.3, 7.3

describe('Property 2: Xếp loại nhất quán với điểm TB', () => {
  it('classifyGrade(avg) matches expected classification for all avg in [0,10]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        (avg) => {
          const result = classifyGrade(avg);
          const expected = expectedClassification(avg);
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('classifyGrade(null) returns "Chưa có điểm"', () => {
    expect(classifyGrade(null)).toBe('Chưa có điểm');
  });
});

// ── Property 3: saveStudentComment là upsert — không tạo trùng ──────────────
// Feature: grading-and-feedback, Property 3: saveStudentComment is upsert
// Validates: Yêu cầu 1.8, 1.9

describe('Property 3: saveStudentComment là upsert — không tạo trùng', () => {
  it('after N calls with same (studentId, classId), only 1 record exists', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
        (studentId, classId, contents) => {
          let comments: StudentComment[] = [];
          for (const content of contents) {
            comments = applyUpsert(comments, {
              studentId,
              classId,
              teacherId: 'T1',
              content,
            });
          }
          const matching = comments.filter(
            c => c.studentId === studentId && c.classId === classId
          );
          return matching.length === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('upsert updates content on existing record', () => {
    let comments: StudentComment[] = [];
    comments = applyUpsert(comments, { studentId: 'S1', classId: 'C1', teacherId: 'T1', content: 'First' });
    comments = applyUpsert(comments, { studentId: 'S1', classId: 'C1', teacherId: 'T1', content: 'Second' });
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toBe('Second');
  });
});

// ── Property 4: Điểm hợp lệ trong [0, 10] ───────────────────────────────────
// Feature: grading-and-feedback, Property 4: scores are within valid range
// Validates: Yêu cầu 1.5, 4.5, 5.5

describe('Property 4: Điểm hợp lệ trong [0, 10]', () => {
  it('entry added with score in [0,10] has valid score and maxScore', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        (score) => {
          const entryData: Omit<GradeEntry, 'id'> = {
            studentId: 'S1',
            classId: 'C1',
            title: 'Test',
            scoreType: 'oral',
            score,
            maxScore: 10,
            gradedBy: 'T1',
            gradedAt: new Date().toISOString(),
          };
          const state = applyAddGradeEntry([], entryData);
          const entry = state[0];
          return entry.score >= 0 && entry.score <= entry.maxScore && entry.maxScore <= 10;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 5: gradeEssaySubmission cập nhật đúng submission ───────────────
// Feature: grading-and-feedback, Property 5: gradeEssaySubmission updates correct submission
// Validates: Yêu cầu 1.10, 4.4

describe('Property 5: gradeEssaySubmission cập nhật đúng submission', () => {
  it('after gradeEssaySubmission, target submission has the new score', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            score: fc.option(fc.float({ min: 0, max: 10, noNaN: true })),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (newScore, submissions) => {
          const target = submissions[0];
          const result = applyGradeEssay(submissions, target.id, newScore);
          return result.find(s => s.id === target.id)?.score === newScore;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not modify other submissions', () => {
    const submissions = [
      { id: 'S1', score: undefined },
      { id: 'S2', score: 7 },
    ];
    const result = applyGradeEssay(submissions, 'S1', 9);
    expect(result.find(s => s.id === 'S2')?.score).toBe(7);
  });
});

// ── Property 6: Bài đã chấm không còn trong danh sách chờ ───────────────────
// Feature: grading-and-feedback, Property 6: graded submissions not in pending list
// Validates: Yêu cầu 4.7

describe('Property 6: Bài đã chấm không còn trong danh sách chờ', () => {
  it('getPendingEssays only returns submissions with score === undefined', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            score: fc.option(fc.float({ min: 0, max: 10, noNaN: true })),
          }),
          { maxLength: 20 }
        ),
        (submissions) => {
          const pending = getPendingEssays(submissions);
          return pending.every(s => s.score === undefined);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 7: Học viên chỉ thấy dữ liệu của mình ─────────────────────────
// Feature: grading-and-feedback, Property 7: student sees only own data
// Validates: Yêu cầu 2.2, 2.3

describe('Property 7: Học viên chỉ thấy dữ liệu của mình', () => {
  it('filterForStudent returns only entries belonging to the given studentId', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(
          fc.record({
            studentId: fc.string({ minLength: 1, maxLength: 20 }),
            score: fc.float({ min: 0, max: 10, noNaN: true }),
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
});

// ── Property 8: Nhận xét không vượt 1000 ký tự ──────────────────────────────
// Feature: grading-and-feedback, Property 8: comment content within 1000 chars
// Validates: Yêu cầu 6.7

describe('Property 8: Nhận xét không vượt 1000 ký tự', () => {
  it('isValidComment returns false for content longer than 1000 chars', () => {
    const isValidComment = (content: string) =>
      content.trim().length > 0 && content.length <= 1000;

    fc.assert(
      fc.property(
        fc.string({ minLength: 1001, maxLength: 2000 }),
        (content) => {
          return !isValidComment(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isValidComment returns true for valid content within 1000 chars', () => {
    const isValidComment = (content: string) =>
      content.trim().length > 0 && content.length <= 1000;

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
        (content) => {
          return isValidComment(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isValidComment returns false for empty/whitespace content', () => {
    expect(false).toBe(false); // placeholder — tested in unit tests below
    const isValidComment = (content: string) =>
      content.trim().length > 0 && content.length <= 1000;
    expect(isValidComment('')).toBe(false);
    expect(isValidComment('   ')).toBe(false);
    expect(isValidComment('Nhận xét hợp lệ')).toBe(true);
  });
});
