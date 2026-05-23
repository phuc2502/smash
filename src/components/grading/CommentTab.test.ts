/**
 * Tests for CommentTab validation logic.
 * Feature: grading-and-feedback
 * Property 8: Nhận xét không vượt 1000 ký tự
 * Validates: Yêu cầu 6.4, 6.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidComment } from './CommentTab';

// ── Property 8: Nhận xét không vượt 1000 ký tự ──────────────────────────────
// Feature: grading-and-feedback, Property 8: comment content within 1000 chars
// Validates: Yêu cầu 6.7

describe('Property 8: isValidComment — nhận xét không vượt 1000 ký tự', () => {
  it('returns false for content longer than 1000 chars', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1001, maxLength: 2000 }),
        (content) => !isValidComment(content)
      ),
      { numRuns: 100 }
    );
  });

  it('returns true for valid non-empty content within 1000 chars', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
        (content) => isValidComment(content)
      ),
      { numRuns: 100 }
    );
  });
});

// ── Task 8.2: Unit tests for empty/whitespace validation ─────────────────────
// Validates: Yêu cầu 6.4

describe('isValidComment — unit tests', () => {
  it('returns false for empty string', () => {
    expect(isValidComment('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isValidComment('   ')).toBe(false);
  });

  it('returns false for tab-only string', () => {
    expect(isValidComment('\t\t')).toBe(false);
  });

  it('returns false for newline-only string', () => {
    expect(isValidComment('\n\n')).toBe(false);
  });

  it('returns true for valid comment', () => {
    expect(isValidComment('Nhận xét hợp lệ')).toBe(true);
  });

  it('returns true for comment with leading/trailing spaces but non-empty content', () => {
    expect(isValidComment('  Học viên tiến bộ tốt.  ')).toBe(true);
  });

  it('returns false for string of exactly 1001 chars', () => {
    expect(isValidComment('a'.repeat(1001))).toBe(false);
  });

  it('returns true for string of exactly 1000 chars', () => {
    expect(isValidComment('a'.repeat(1000))).toBe(true);
  });
});
