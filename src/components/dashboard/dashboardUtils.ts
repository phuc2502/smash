/**
 * Tiện ích cho Role-Based Dashboard.
 * Feature: role-based-dashboard
 */

import { ROLE_LABELS } from '../../context/AppContext';
import type { RoleKey, AccountProfile, AttendanceSession } from '../../context/AppContext';

/**
 * Tra cứu ngược từ nhãn tiếng Việt sang RoleKey.
 * Nếu không tìm thấy, fallback về 'student'.
 */
export function getRoleKey(roleLabel: string | undefined): RoleKey {
  if (!roleLabel) return 'student';
  const entry = Object.entries(ROLE_LABELS).find(([, label]) => label === roleLabel);
  return (entry?.[0] as RoleKey) ?? 'student';
}

/**
 * Chuẩn hóa tên giáo viên: bỏ tiền tố "Thầy"/"Cô", lowercase, trim.
 * Property 2: Lớp học của giáo viên là tập con của tất cả lớp
 */
export function normalizeInstructorName(name: string): string {
  return name.trim().replace(/^(thầy|cô)\s+/i, '').toLowerCase().trim();
}
/**
 * Lấy danh sách studentId dựa trên role của currentAccount.
 * - student → [currentAccount.id]
 * - parent  → parentChildMap[currentAccount.id] ?? []
 * - khác    → []
 */
export function getStudentIds(
  currentAccount: AccountProfile | null | undefined,
  parentChildMap: Record<string, string[]> = {}
): string[] {
  if (!currentAccount) return [];
  if (currentAccount.role === ROLE_LABELS.student) {
    return [currentAccount.id];
  }
  if (currentAccount.role === ROLE_LABELS.parent) {
    return parentChildMap[currentAccount.id] ?? [];
  }
  return [];
}

/**
 * Lấy danh sách classId mà các studentId đã đăng ký.
 * Property 5: Lớp học của học viên là tập con của classStudentMap
 * Property 6: Lớp học của phụ huynh là hợp của lớp học các con
 */
export function getEnrolledClassIds(
  studentIds: string[],
  classStudentMap: Record<string, string[]> = {}
): string[] {
  if (studentIds.length === 0) return [];
  return Object.entries(classStudentMap)
    .filter(([, students]) => (students as string[]).some(id => studentIds.includes(id)))
    .map(([classId]) => classId);
}

/**
 * Tính tỷ lệ chuyên cần (%) từ attendanceSessions.
 * Property 3: Tỷ lệ chuyên cần nằm trong khoảng [0, 100]
 * Property 4: Tỷ lệ chuyên cần khi không có buổi học là 0
 */
export function calcAttendanceRate(
  studentIds: string[],
  sessions: AttendanceSession[]
): number {
  const relevantRecords = sessions
    .flatMap(s => s.records)
    .filter(r => studentIds.includes(r.studentId));

  if (relevantRecords.length === 0) return 0;

  const attended = relevantRecords.filter(
    r => r.status === 'present' || r.status === 'late'
  ).length;

  return Math.round((attended / relevantRecords.length) * 1000) / 10;
}
