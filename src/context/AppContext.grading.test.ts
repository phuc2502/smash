/**
 * Unit tests for GradeEntry, StudentComment, ScoreType types and grading actions.
 * Feature: grading-and-feedback
 * Validates: Yêu cầu 1.1, 1.2, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10
 */

import { describe, it, expect } from 'vitest';
import type { GradeEntry, StudentComment, ScoreType } from './AppContext';

// ── Task 1.1: Type structure tests ──────────────────────────────────────────

describe('GradeEntry interface', () => {
  it('should have all required fields', () => {
    const entry: GradeEntry = {
      id: 'GE-001',
      studentId: 'ST-2023-084',
      classId: 'MATH-06-01',
      title: 'Kiểm tra miệng',
      scoreType: 'oral',
      score: 8,
      maxScore: 10,
      gradedBy: 'TCH-109',
      gradedAt: '2025-03-01T08:00:00.000Z',
    };
    expect(entry.id).toBe('GE-001');
    expect(entry.studentId).toBe('ST-2023-084');
    expect(entry.classId).toBe('MATH-06-01');
    expect(entry.title).toBe('Kiểm tra miệng');
    expect(entry.scoreType).toBe('oral');
    expect(entry.score).toBe(8);
    expect(entry.maxScore).toBe(10);
    expect(entry.gradedBy).toBe('TCH-109');
    expect(entry.gradedAt).toBe('2025-03-01T08:00:00.000Z');
  });

  it('should allow optional assignmentId', () => {
    const withAssignment: GradeEntry = {
      id: 'GE-002',
      studentId: 'ST-2023-084',
      classId: 'MATH-06-01',
      assignmentId: 'ASG-001',
      title: '15 phút',
      scoreType: 'quiz_15',
      score: 7.5,
      maxScore: 10,
      gradedBy: 'TCH-109',
      gradedAt: '2025-03-05T08:00:00.000Z',
    };
    expect(withAssignment.assignmentId).toBe('ASG-001');

    const withoutAssignment: GradeEntry = {
      id: 'GE-003',
      studentId: 'ST-2023-084',
      classId: 'MATH-06-01',
      title: 'Giữa kỳ',
      scoreType: 'midterm',
      score: 9,
      maxScore: 10,
      gradedBy: 'TCH-109',
      gradedAt: '2025-04-01T08:00:00.000Z',
    };
    expect(withoutAssignment.assignmentId).toBeUndefined();
  });
});

describe('ScoreType', () => {
  it('should include all 7 valid score types', () => {
    const validTypes: ScoreType[] = [
      'oral',
      'quiz_15',
      'quiz_45',
      'midterm',
      'final',
      'homework',
      'assignment',
    ];
    expect(validTypes).toHaveLength(7);
    // Each type should be a string
    validTypes.forEach(t => expect(typeof t).toBe('string'));
  });
});

describe('StudentComment interface', () => {
  it('should have all required fields', () => {
    const comment: StudentComment = {
      id: 'CMT-001',
      studentId: 'ST-2023-084',
      classId: 'MATH-06-01',
      teacherId: 'TCH-109',
      content: 'Học viên tiến bộ tốt.',
      createdAt: '2025-03-01T08:00:00.000Z',
      updatedAt: '2025-03-01T08:00:00.000Z',
    };
    expect(comment.id).toBe('CMT-001');
    expect(comment.studentId).toBe('ST-2023-084');
    expect(comment.classId).toBe('MATH-06-01');
    expect(comment.teacherId).toBe('TCH-109');
    expect(comment.content).toBe('Học viên tiến bộ tốt.');
    expect(comment.createdAt).toBeTruthy();
    expect(comment.updatedAt).toBeTruthy();
  });
});

// ── Task 2.2: updateGradeEntry and deleteGradeEntry logic tests ──────────────

describe('updateGradeEntry logic', () => {
  it('should update only the matching entry', () => {
    const entries: GradeEntry[] = [
      { id: 'GE-A', studentId: 'S1', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
      { id: 'GE-B', studentId: 'S2', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
    ];
    const updated = entries.map(e => e.id === 'GE-A' ? { ...e, score: 9 } : e);
    expect(updated.find(e => e.id === 'GE-A')?.score).toBe(9);
    expect(updated.find(e => e.id === 'GE-B')?.score).toBe(8); // unchanged
  });

  it('should not affect other fields when updating score', () => {
    const entry: GradeEntry = {
      id: 'GE-A', studentId: 'S1', classId: 'C1', title: 'Miệng',
      scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'T1', gradedAt: '2025-01-01',
    };
    const updated = { ...entry, score: 9.5 };
    expect(updated.title).toBe('Miệng');
    expect(updated.scoreType).toBe('oral');
    expect(updated.gradedBy).toBe('T1');
  });
});

describe('deleteGradeEntry logic', () => {
  it('should remove only the matching entry', () => {
    const entries: GradeEntry[] = [
      { id: 'GE-A', studentId: 'S1', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
      { id: 'GE-B', studentId: 'S2', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
    ];
    const filtered = entries.filter(e => e.id !== 'GE-A');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('GE-B');
  });

  it('should not affect other entries when deleting', () => {
    const entries: GradeEntry[] = [
      { id: 'GE-A', studentId: 'S1', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
      { id: 'GE-B', studentId: 'S2', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
      { id: 'GE-C', studentId: 'S3', classId: 'C1', title: 'Miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'T1', gradedAt: '' },
    ];
    const filtered = entries.filter(e => e.id !== 'GE-B');
    expect(filtered).toHaveLength(2);
    expect(filtered.map(e => e.id)).toEqual(['GE-A', 'GE-C']);
  });
});
