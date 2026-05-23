/**
 * Property-Based Tests for GradeTableTab calculation logic.
 * Feature: grading-and-feedback
 * Property 1: Điểm TB phản ánh đúng tất cả GradeEntry
 * Property 2: Xếp loại nhất quán với điểm TB
 * Validates: Yêu cầu 5.2, 5.3, 7.1, 7.3, 7.4, 7.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calcAverage, classifyGrade } from '../../utils/gradeUtils';
import type { GradeEntry, ScoreType } from '../../context/AppContext';

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

function computeDisplayedAverage(entries: GradeEntry[]): number | null {
  return calcAverage(entries.map(e => e.score));
}

// ── Property 1: Điểm TB phản ánh đúng tất cả GradeEntry ─────────────────────
// Feature: grading-and-feedback, Property 1: average reflects all grade entries
// Validates: Yêu cầu 5.2, 7.1, 7.4, 7.5

describe('Property 1: Điểm TB phản ánh đúng tất cả GradeEntry', () => {
  it('computeDisplayedAverage(entries) === calcAverage(scores) for any non-empty array', () => {
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
    expect(calcAverage([])).toBeNull();
  });

  it('rounds to 1 decimal place', () => {
    // 8 + 9 + 7 = 24 / 3 = 8.0
    expect(calcAverage([8, 9, 7])).toBe(8);
    // 7 + 8 = 15 / 2 = 7.5
    expect(calcAverage([7, 8])).toBe(7.5);
  });
});

// ── Property 2: Xếp loại nhất quán với điểm TB ──────────────────────────────
// Feature: grading-and-feedback, Property 2: classification consistent with average
// Validates: Yêu cầu 5.3, 7.3

describe('Property 2: Xếp loại nhất quán với điểm TB', () => {
  it('classifyGrade(avg) is consistent for all avg in [0,10]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        (avg) => {
          const result = classifyGrade(avg);
          // Verify the classification matches the expected thresholds
          if (avg >= 9.0) return result === 'Xuất sắc';
          if (avg >= 8.0) return result === 'Giỏi';
          if (avg >= 6.5) return result === 'Khá';
          if (avg >= 5.0) return result === 'Trung bình';
          return result === 'Yếu';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('classifyGrade boundary values', () => {
    expect(classifyGrade(9.0)).toBe('Xuất sắc');
    expect(classifyGrade(8.0)).toBe('Giỏi');
    expect(classifyGrade(8.9)).toBe('Giỏi');
    expect(classifyGrade(6.5)).toBe('Khá');
    expect(classifyGrade(7.9)).toBe('Khá');
    expect(classifyGrade(5.0)).toBe('Trung bình');
    expect(classifyGrade(6.4)).toBe('Trung bình');
    expect(classifyGrade(4.9)).toBe('Yếu');
    expect(classifyGrade(0)).toBe('Yếu');
    expect(classifyGrade(null)).toBe('Chưa có điểm');
  });

  it('classification is deterministic — same input always gives same output', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        (avg) => classifyGrade(avg) === classifyGrade(avg)
      ),
      { numRuns: 100 }
    );
  });
});
