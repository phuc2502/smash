import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { buildNotifications } from '../notifications/buildNotifications';
import type { AppNotification, Announcement } from '../notifications/types';
export type { AppNotification, Announcement } from '../notifications/types';

export interface User {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  email: string;
  phone: string;
  status: string;
  statusColor: string;
  activity: string;
}

export interface Class {
  id: string;
  title: string;
  status: string;
  instructor: string;
  /** ID của giáo viên phụ trách — dùng để lọc lớp theo tài khoản teacher */
  instructorId?: string;
  role: string;
  schedule: string;
  location?: string;
  studentsCount: number;
  maxStudents: number;
  color: string;
}

export interface Assignment {
  id: string;
  type: string;
  typeColor: string;
  status: string;
  title: string;
  classId: string;
  className: string;
  progress: number;
  total: number;
  deadline: string;
  /** Mô tả ngắn (ví dụ dòng phụ trong bảng admin) */
  description?: string;
  /** Hạn chót dạng ISO — dùng lọc theo ngày & luật quá hạn */
  deadlineAt?: string;
  /** Ghi đè tên GV; nếu thiếu sẽ lấy theo `Class.instructor` */
  teacherName?: string;
  isUrgent?: boolean;
  /** Danh sách câu hỏi cho bài làm trực tuyến */
  questions?: QuizQuestion[];
  /** Thời gian làm bài (phút), 0 = không giới hạn */
  timeLimit?: number;
}

export interface Material {
  id: string;
  title: string;
  detail: string;
  description: string;
  files: number;
  updated: string;
  iconName: string;
  color: string;
  category: 'review' | 'knowledge' | 'extra_reading';
  file_size_bytes: number;
  mime_type: string;
  publishedAt: string;
  fileName: string;
  authorName: string;
  classId: string;
  isHidden?: boolean;
  isApproved?: boolean;
}

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  requestedAt: string;
  note?: string;
  accountType?: 'personal' | 'group';
  requestedBy?: string;
}

export interface TrustedDevice {
  id: string;
  name: string;
  location: string;
  assignedTo: string;
  isActive: boolean;
  lastSeen: string;
}

export interface AccessLogEntry {
  id: string;
  accountEmail: string;
  accountName: string;
  result: 'success' | 'failed' | 'blocked';
  reason: string;
  deviceName: string;
  deviceId: string;
  timestamp: string;
}

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  issueType: 'forgot_password' | 'locked_account' | 'invalid_device' | 'other';
  message: string;
  createdAt: string;
}

// ── Grading Types ────────────────────────────────────────────
export type ScoreType =
  | 'oral'        // Kiểm tra miệng
  | 'quiz_15'     // 15 phút
  | 'quiz_45'     // 1 tiết
  | 'midterm'     // Giữa kỳ
  | 'final'       // Cuối kỳ
  | 'homework'    // BTVN
  | 'assignment'; // Bài tập liên kết

export interface GradeEntry {
  id: string;              // "GE-{timestamp}"
  studentId: string;       // tham chiếu User.id
  classId: string;         // tham chiếu Class.id
  assignmentId?: string;   // tham chiếu Assignment.id (tùy chọn)
  title: string;           // "Kiểm tra miệng", "15 phút", v.v.
  scoreType: ScoreType;
  score: number;           // 0–10
  maxScore: number;        // mặc định 10
  gradedBy: string;        // teacherId
  gradedAt: string;        // ISO date
  is_na?: boolean;         // true = vắng mặt, không tính TB
  note?: string;           // ghi chú điểm thưởng (giáo viên)
  feedback?: string;       // nhận xét của giáo viên
  adminNote?: string;      // ghi chú nội bộ của Admin
}

export interface StudentComment {
  id: string;          // "CMT-{timestamp}"
  studentId: string;   // tham chiếu User.id
  classId: string;     // tham chiếu Class.id
  teacherId: string;   // tham chiếu User.id (giáo viên)
  content: string;     // tối đa 1000 ký tự
  createdAt: string;   // ISO date
  updatedAt: string;   // ISO date
}

// ── Quiz Types ────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'essay';
  options?: [string, string, string, string]; // A, B, C, D
  correctAnswer?: string; // 'A' | 'B' | 'C' | 'D'
}

/** Tệp đính kèm bài nộp tự luận (Word hoặc Ảnh) */
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;     // bytes
  fileType: string;     // MIME type, vd: 'image/png', 'application/msword'
  dataUrl: string;      // base64 data URL
}

export interface QuizSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: Record<string, string>; // questionId → answer
  /** Tệp đính kèm (ảnh chụp bài viết tay / file Word) */
  attachments?: Attachment[];
  submittedAt: string; // ISO date
  score?: number;      // 0–10, chỉ có với trắc nghiệm
  maxScore?: number;
}

// ── Schedule Types ──────────────────────────────────────────────
export interface ScheduleSlot {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Thứ 2, 7=Chủ nhật
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface ClassScheduleConfig {
  classId: string;
  slots: ScheduleSlot[];
  effectiveFrom: string; // ISO date
  effectiveTo?: string;  // ISO date (optional)
}

// ── ExamSession (Anti-Cheat) ─────────────────────────────────
export interface ExamSession {
  sessionId: string;
  studentId: string;
  assignmentId: string;
  startedAt: string;        // ISO date
  deadline: string;         // ISO date, tính từ startedAt + timeLimit
  tabSwitchCount: number;
  maxTabSwitches: number;   // mặc định 3
  isLocked: boolean;
  lastAutoSave?: string;    // ISO date
  draftAnswers: Record<string, string>;
  violationNotes?: string;
}

// ── GradeColumnConfig (cột điểm động) ────────────────────────
export interface GradeColumnConfig {
  id: string;
  classId: string;
  name: string;            // VD: "Kiểm tra 15p", "Giữa kỳ"
  weight: number;          // 0-100, tổng các cột thường = 100
  isBonus: boolean;        // true = điểm thưởng, không tính tổng 100%
  sourceType: 'manual' | 'auto_sync';
  assignmentId?: string;
  displayOrder: number;
}

// ── NotificationPreference ───────────────────────────────────
export type NotificationEventType =
  | 'new_account_pending'
  | 'class_created'
  | 'student_added_to_class'
  | 'permission_changed'
  | 'class_starting_soon'
  | 'assignment_submitted'
  | 'teaching_reminder'
  | 'student_absent_streak'
  | 'assignment_deadline_soon'
  | 'new_assignment'
  | 'grade_published'
  | 'submission_deadline_reminder'
  | 'study_reminder'
  | 'new_feedback'
  | 'child_new_grade'
  | 'child_absent'
  | 'child_overdue_assignment'
  | 'monthly_grade_summary';

export interface UserNotificationPreferences {
  userId: string;
  preferences: Record<NotificationEventType, boolean>;
}

// ── Attendance Types ────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  markedBy: string;
  markedAt: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  records: AttendanceRecord[];
  isFinalized: boolean;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}


export type RoleKey = 'owner' | 'manager' | 'admin_staff' | 'admin' | 'teacher' | 'student' | 'parent';
export type AccountStatus = 'active' | 'inactive' | 'locked';
export type PermissionKey =
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_devices'
  | 'view_access_logs'
  | 'manage_classes'
  | 'view_classes'
  | 'manage_materials'
  | 'view_materials'
  | 'manage_assignments'
  | 'view_assignments'
  | 'submit_assignment'
  | 'grade_assignments'
  | 'view_own_grades'
  | 'export_grades'
  | 'manage_security'
  | 'manage_attendance'
  | 'view_attendance';

export interface SecurityPolicy {
  lockoutThreshold: number;
  lockoutMinutes: number;
  sessionTimeoutMinutes: number;
  minPasswordLength: number;
  requireStrongPassword: boolean;
}

export interface AccountProfile {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export interface AccountPreferences {
  darkMode: boolean;
  emailReports: boolean;
  soundNotifications: boolean;
  browserNotifications: boolean;
  autoLockSession: boolean;
  language: 'vi' | 'en';
}

export interface AccountActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: 'mint' | 'slate';
}

export interface ForgotPasswordRequest {
  id: string;
  email: string;
  name: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

interface AppState {
  users: User[];
  userRequests: UserRequest[];
  classes: Class[];
  assignments: Assignment[];
  materials: Material[];
  attendanceSessions: AttendanceSession[];
  gradeEntries: GradeEntry[];
  studentComments: StudentComment[];
  leaveRequests: LeaveRequest[];
  forgotPasswordRequests: ForgotPasswordRequest[];
}

// ── Module 9 State & Actions ──────────────────────────────────
interface SystemImprovementsState {
  classScheduleSlots: Record<string, ScheduleSlot[]>;
  examSessions: Record<string, ExamSession>;
  gradeColumnConfigs: Record<string, GradeColumnConfig[]>;
  userNotificationPreferences: UserNotificationPreferences[];
}

interface SystemImprovementsActions {
  updateClassSchedule: (classId: string, slots: ScheduleSlot[]) => void;
  updateExamSession: (sessionId: string, data: Partial<ExamSession>) => void;
  createExamSession: (session: ExamSession) => void;
  updateGradeColumnConfigs: (classId: string, configs: GradeColumnConfig[]) => void;
  updateNotificationPreferences: (userId: string, prefs: Record<NotificationEventType, boolean>) => void;
}

interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  accountType: 'personal' | 'group';
  note?: string;
}

interface AppContextType extends AppState, SystemImprovementsState, SystemImprovementsActions {
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  addClass: (cls: Class) => void;
  updateClass: (id: string, cls: Partial<Class>) => void;
  deleteClass: (id: string) => void;

  addAssignment: (asgn: Assignment) => void;
  updateAssignment: (id: string, updated: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Materials
  addMaterial: (material: Omit<Material, 'id' | 'publishedAt' | 'authorName' | 'updated'>) => void;
  updateMaterial: (id: string, updated: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Attendance
  markAttendance: (session: AttendanceSession) => void;
  updateAttendanceRecord: (sessionId: string, studentId: string, status: AttendanceStatus, note?: string) => void;
  finalizeAttendanceSession: (sessionId: string) => void;
  unfinalizeAttendanceSession: (sessionId: string) => void;
  getAttendanceByClass: (classId: string) => AttendanceSession[];
  getAttendanceByStudent: (studentId: string) => AttendanceRecord[];

  // Leave Requests
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => void;
  resolveLeaveRequest: (id: string, status: 'approved' | 'rejected', resolvedBy: string) => void;
  updateLeaveRequest: (id: string, date: string, reason: string, classId: string, className: string) => void;
  deleteLeaveRequest: (id: string) => void;



  // Quiz
  quizSubmissions: QuizSubmission[];
  submitQuiz: (submission: Omit<QuizSubmission, 'id'>) => void;
  getSubmission: (assignmentId: string, studentId: string) => QuizSubmission | undefined;

  // Grading & Comments
  gradeEntries: GradeEntry[];
  studentComments: StudentComment[];
  addGradeEntry: (entry: Omit<GradeEntry, 'id'>) => void;
  updateGradeEntry: (id: string, data: Partial<GradeEntry>) => void;
  deleteGradeEntry: (id: string) => void;
  saveStudentComment: (comment: Omit<StudentComment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  gradeEssaySubmission: (submissionId: string, score: number, comment?: string) => void;

  isAuthenticated: boolean;
  currentAccount: AccountProfile | null;
  accountPreferences: AccountPreferences;
  accountActivities: AccountActivity[];
  rememberedEmail: string;
  trustedDevices: TrustedDevice[];
  accessLogs: AccessLogEntry[];
  supportRequests: SupportRequest[];
  rolePermissions: Record<RoleKey, PermissionKey[]>;
  accountPermissionOverrides: Record<string, PermissionKey[]>;
  securityPolicy: SecurityPolicy;

  // Notification & Communication
  announcements: Announcement[];
  notifications: AppNotification[];
  unreadCount: number;
  readNotificationIds: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createAnnouncement: (payload: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  pinAnnouncement: (id: string) => void;

  login: (payload: LoginPayload) => { success: boolean; message: string };
  submitSupportRequest: (payload: Omit<SupportRequest, 'id' | 'createdAt'>) => { success: boolean; message: string; ticketId?: string };
  logout: () => void;
  registerAccountRequest: (payload: RegisterPayload) => { success: boolean; message: string };
  addTrustedDevice: (payload: Omit<TrustedDevice, 'id' | 'lastSeen'>) => void;
  removeTrustedDevice: (deviceId: string) => void;
  resetUserPassword: (userId: string) => { success: boolean; message: string; tempPassword?: string };
  updateUserStatus: (userId: string, status: User['status']) => void;
  updateAccountPermissions: (userId: string, permissions: PermissionKey[]) => void;
  updateSecurityPolicy: (data: Partial<SecurityPolicy>) => void;
  canAccess: (permission: PermissionKey) => boolean;
  updateAccountProfile: (data: Partial<Pick<AccountProfile, 'name' | 'email' | 'phone' | 'avatarUrl'>>) => void;
  changePassword: (currentPassword: string, nextPassword: string) => { success: boolean; message: string };
  updateAccountPreferences: (data: Partial<AccountPreferences>) => void;
  switchDemoAccount: (email: string) => void;
  appendActivity: (title: string, description: string, tone?: 'mint' | 'slate') => void;

  // Forgot Password Custom Workflow
  forgotPasswordRequests: ForgotPasswordRequest[];
  submitForgotPasswordRequest: (email: string, name: string, note?: string) => { success: boolean; message: string };
  checkForgotPasswordRequestStatus: (email: string) => ForgotPasswordRequest | undefined;
  approveForgotPasswordRequest: (requestId: string) => void;
  rejectForgotPasswordRequest: (requestId: string) => void;
  completeForgotPasswordReset: (email: string, nextPassword: string) => { success: boolean; message: string };

  classStudentMap: Record<string, string[]>;
  parentChildMap: Record<string, string[]>;
  addStudentToClass: (classId: string, studentId: string) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  linkParentToStudent: (parentId: string, studentId: string) => void;
  unlinkParentFromStudent: (parentId: string, studentId: string) => void;

  stats: {
    totalUsers: number;
    totalTeachers: number;
    activeClasses: number;
    pendingGrading: number;
    pendingRequests: number;
  };
}

const LS_KEYS = {
  auth: 'smash.auth',
  account: 'smash.account',
  prefs: 'smash.account.preferences',
  rememberedEmail: 'smash.auth.rememberedEmail',
  readNotifs: 'smash.notifications.read',
};

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    authorId: 'ADM-001',
    authorName: 'Trần Văn A',
    authorRole: 'Admin',
    title: 'Khai giảng khóa học Hè 2025',
    body: 'Trung tâm SMASH Math thông báo khai giảng các khóa học hè tháng 6. Đăng ký sớm để nhận ưu đãi.',
    targets: ['all'],
    priority: 'reminder',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'ann-002',
    authorId: 'ADM-001',
    authorName: 'Trần Văn A',
    authorRole: 'Admin',
    title: 'Cập nhật lịch thi học kỳ II',
    body: 'Lịch thi học kỳ II dành cho giáo viên: vui lòng hoàn thành đề cương ôn tập trước ngày 20/5.',
    targets: ['teacher'],
    priority: 'action',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'ann-003',
    authorId: 'ADM-001',
    authorName: 'Trần Văn A',
    authorRole: 'Admin',
    title: 'Nhắc nhở nộp bài tập cuối kỳ',
    body: 'Học viên chú ý: Hạn nộp bài tập tổng hợp cuối kỳ là ngày 30/5. Không nộp đúng hạn sẽ bị tính điểm 0.',
    targets: ['student', 'parent'],
    priority: 'action',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

const defaultAccount: AccountProfile = {
  id: 'ADM-001',
  name: 'Trần Văn A',
  role: 'Admin',
  roleTitle: 'Admin',
  email: 'admin@smashmath.edu.vn',
  phone: '0988 123 456',
  avatarUrl: 'https://picsum.photos/seed/admin/300/300',
};

const defaultPreferences: AccountPreferences = {
  darkMode: false,
  emailReports: true,
  soundNotifications: false,
  browserNotifications: true,
  autoLockSession: true,
  language: 'vi',
};

const defaultActivities: AccountActivity[] = [
  { id: 'act-1', title: 'Chấm điểm bài tập Toán 9', description: 'Đã hoàn thành 5/20 bài', time: '10 phút trước', tone: 'mint' },
  { id: 'act-2', title: 'Thêm thành viên mới', description: 'Tài khoản: Nguyễn Thu Hà (Học sinh)', time: '1 giờ trước', tone: 'mint' },
  { id: 'act-3', title: 'Cập nhật tài liệu', description: "Tải lên tệp 'Đề thi thử lớp 10'", time: 'Hôm qua', tone: 'mint' },
  { id: 'act-4', title: 'Đăng nhập hệ thống', description: 'Thiết bị: Chrome trên Windows', time: 'Hôm qua, 08:30', tone: 'slate' },
];

export const ROLE_LABELS: Record<RoleKey, string> = {
  owner: 'Chủ trung tâm',
  manager: 'Quản lý',
  admin_staff: 'Nhân viên hành chính',
  admin: 'Admin',
  teacher: 'Giáo viên',
  student: 'Học viên',
  parent: 'Phụ huynh',
};

const roleByLabel: Record<string, RoleKey> = Object.entries(ROLE_LABELS).reduce((acc, [key, label]) => {
  acc[label] = key as RoleKey;
  return acc;
}, {} as Record<string, RoleKey>);

const defaultRolePermissions: Record<RoleKey, PermissionKey[]> = {
  owner: [
    'view_dashboard', 'manage_users', 'manage_devices', 'view_access_logs',
    'manage_classes', 'view_classes', 'manage_materials', 'view_materials',
    'manage_assignments', 'view_assignments', 'grade_assignments',
    'view_own_grades', 'export_grades',
    'manage_security', 'manage_attendance', 'view_attendance',
  ],
  manager: [
    'view_dashboard', 'manage_users', 'manage_devices', 'view_access_logs',
    'manage_classes', 'view_classes', 'manage_materials', 'view_materials',
    'manage_assignments', 'view_assignments', 'grade_assignments',
    'view_own_grades', 'export_grades',
    'manage_attendance', 'view_attendance',
  ],
  admin_staff: [
    'view_dashboard', 'manage_users', 'manage_classes', 'view_classes',
    'manage_materials', 'view_materials',
    'view_assignments', 'manage_attendance', 'view_attendance',
  ],
  admin: [
    'view_dashboard', 'manage_users', 'manage_devices', 'view_access_logs',
    'manage_classes', 'view_classes', 'manage_materials', 'view_materials',
    'manage_assignments', 'view_assignments', 'grade_assignments',
    'view_own_grades', 'export_grades',
    'manage_security', 'manage_attendance', 'view_attendance',
  ],
  teacher: [
    'view_dashboard', 'manage_materials', 'view_materials',
    'manage_assignments', 'view_assignments', 'grade_assignments',
    'view_own_grades', 'export_grades',
    'manage_attendance', 'view_attendance', 'manage_classes', 'view_classes',
  ],
  student: [
    'view_dashboard', 'view_materials', 'view_assignments',
    'submit_assignment', 'view_own_grades', 'view_attendance', 'view_classes',
  ],
  parent: [
    'view_dashboard', 'view_materials', 'view_assignments',
    'view_own_grades', 'view_attendance', 'view_classes',
  ],
};

const defaultSecurityPolicy: SecurityPolicy = {
  lockoutThreshold: 5,
  lockoutMinutes: 15,
  sessionTimeoutMinutes: 30,
  minPasswordLength: 8,
  requireStrongPassword: true,
};

const demoAccounts = [
  {
    email: 'admin@smashmath.edu.vn',
    password: 'Smash@123',
    profile: { ...defaultAccount, role: ROLE_LABELS.admin, roleTitle: ROLE_LABELS.admin },
    accountType: 'personal' as const,
    failedAttempts: 0,
    lockedUntil: null as number | null,
    allowedDeviceIds: ['dv-office-001', 'dv-owner-laptop'],
    mustChangePassword: false,
    roleKey: 'admin' as RoleKey,
  },
  {
    email: 'teacher@smashmath.edu.vn',
    password: 'Smash@123',
    profile: {
      ...defaultAccount,
      id: 'TCH-109',
      name: 'Trần Văn Cường',
      role: ROLE_LABELS.teacher,
      roleTitle: ROLE_LABELS.teacher,
      email: 'teacher@smashmath.edu.vn',
      avatarUrl: 'https://picsum.photos/seed/teacher/300/300',
    },
    accountType: 'personal' as const,
    failedAttempts: 0,
    lockedUntil: null as number | null,
    allowedDeviceIds: ['dv-office-001'],
    mustChangePassword: false,
    roleKey: 'teacher' as RoleKey,
  },  {
    email: 'student@smashmath.edu.vn',
    password: 'Smash@123',
    profile: {
      ...defaultAccount,
      id: 'STU-001',
      name: 'Nguyễn Minh Khoa',
      role: ROLE_LABELS.student,
      roleTitle: ROLE_LABELS.student,
      email: 'student@smashmath.edu.vn',
      avatarUrl: 'https://picsum.photos/seed/student/300/300',
    },
    accountType: 'personal' as const,
    failedAttempts: 0,
    lockedUntil: null as number | null,
    allowedDeviceIds: ['dv-office-001'],
    mustChangePassword: false,
    roleKey: 'student' as RoleKey,
  },
  {
    email: 'parent@smashmath.edu.vn',
    password: 'Smash@123',
    profile: {
      ...defaultAccount,
      id: 'PAR-001',
      name: 'Nguyễn Văn Hùng',
      role: ROLE_LABELS.parent,
      roleTitle: ROLE_LABELS.parent,
      email: 'parent@smashmath.edu.vn',
      avatarUrl: 'https://picsum.photos/seed/parent/300/300',
    },
    accountType: 'personal' as const,
    failedAttempts: 0,
    lockedUntil: null as number | null,
    allowedDeviceIds: ['dv-office-001'],
    mustChangePassword: false,
    roleKey: 'parent' as RoleKey,
  },
];

const initialTrustedDevices: TrustedDevice[] = [
  { id: 'dv-office-001', name: 'Máy lễ tân 01', location: 'Cơ sở Trung tâm', assignedTo: 'Nhân viên hành chính', isActive: true, lastSeen: '5 phút trước' },
  { id: 'dv-office-002', name: 'Máy phòng học A1', location: 'Cơ sở Trung tâm', assignedTo: 'Giáo viên', isActive: true, lastSeen: '20 phút trước' },
  { id: 'dv-owner-laptop', name: 'Laptop chủ trung tâm', location: 'Văn phòng', assignedTo: 'Chủ trung tâm', isActive: true, lastSeen: 'Hôm qua' },
];

const CURRENT_DEVICE_ID = 'dv-office-001';
const CURRENT_DEVICE_NAME = 'Chrome / Windows - POS 01';

function loadStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const initialUsers: User[] = [
  // Giáo viên
  { id: 'TCH-109', name: 'Trần Văn Cường', role: 'Giáo viên', roleColor: 'slate', email: 'cuong.tran@edu.vn', phone: '0988 123 456', status: 'Đang làm việc', statusColor: 'mint', activity: 'Hôm qua' },
  { id: 'TCH-110', name: 'Lê Thị Thu', role: 'Giáo viên', roleColor: 'slate', email: 'thu.le@edu.vn', phone: '0977 234 567', status: 'Đang làm việc', statusColor: 'mint', activity: '2 giờ trước' },
  // Phụ huynh
  { id: 'PR-552', name: 'Lê Quang Minh', role: 'Phụ huynh', roleColor: 'mint', email: 'minh.le@gmail.com', phone: '0903 765 432', status: 'Khóa', statusColor: 'rose', activity: '1 tuần trước' },
  // Học viên lớp 6
  { id: 'STU-001', name: 'Nguyễn Minh Khoa', role: 'Học viên', roleColor: 'mint', email: 'khoa.nguyen@student.edu.vn', phone: '0912 000 001', status: 'Đang học', statusColor: 'mint', activity: '1 giờ trước' },
  { id: 'ST-2023-084', name: 'Nguyễn Thu Hà', role: 'Học viên', roleColor: 'mint', email: 'ha.nguyen@student.edu.vn', phone: '0912 345 678', status: 'Đang học', statusColor: 'mint', activity: '2 giờ trước' },
  { id: 'ST-2023-201', name: 'Trần Quốc Bảo', role: 'Học viên', roleColor: 'mint', email: 'bao.tran@student.edu.vn', phone: '0909 111 222', status: 'Đang học', statusColor: 'mint', activity: '1 giờ trước' },
  { id: 'ST-2023-202', name: 'Lê Thị Mai', role: 'Học viên', roleColor: 'mint', email: 'mai.le@student.edu.vn', phone: '0909 333 444', status: 'Đang học', statusColor: 'mint', activity: '3 giờ trước' },
  { id: 'ST-2023-203', name: 'Hoàng Minh Đức', role: 'Học viên', roleColor: 'mint', email: 'duc.hoang@student.edu.vn', phone: '0909 555 666', status: 'Đang học', statusColor: 'mint', activity: '5 giờ trước' },
  { id: 'ST-2023-204', name: 'Ngô Thanh Tùng', role: 'Học viên', roleColor: 'mint', email: 'tung.ngo@student.edu.vn', phone: '0909 777 888', status: 'Đang học', statusColor: 'mint', activity: 'Hôm qua' },
  // Học viên lớp 7
  { id: 'ST-2023-205', name: 'Vũ Thị Hồng Nhung', role: 'Học viên', roleColor: 'mint', email: 'nhung.vu@student.edu.vn', phone: '0909 999 000', status: 'Đang học', statusColor: 'mint', activity: 'Hôm qua' },
  { id: 'ST-2023-206', name: 'Đặng Văn Hải', role: 'Học viên', roleColor: 'mint', email: 'hai.dang@student.edu.vn', phone: '0908 111 222', status: 'Đang học', statusColor: 'mint', activity: '2 ngày trước' },
  { id: 'ST-2023-112', name: 'Phạm Thị Lan Anh', role: 'Học viên', roleColor: 'mint', email: 'anh.pham@student.edu.vn', phone: '0977 444 333', status: 'Nghỉ học', statusColor: 'slate', activity: '2 tháng trước' },
  { id: 'ST-2023-207', name: 'Bùi Thị Thanh Thảo', role: 'Học viên', roleColor: 'mint', email: 'thao.bui@student.edu.vn', phone: '0908 333 444', status: 'Đang học', statusColor: 'mint', activity: '4 giờ trước' },
  { id: 'ST-2023-208', name: 'Đinh Quang Huy', role: 'Học viên', roleColor: 'mint', email: 'huy.dinh@student.edu.vn', phone: '0908 555 666', status: 'Đang học', statusColor: 'mint', activity: 'Hôm qua' },
  // Học viên lớp 8
  { id: 'ST-2023-301', name: 'Phan Thị Ngọc Ánh', role: 'Học viên', roleColor: 'mint', email: 'anh.phan@student.edu.vn', phone: '0907 111 222', status: 'Đang học', statusColor: 'mint', activity: '2 giờ trước' },
  { id: 'ST-2023-302', name: 'Lý Minh Tuấn', role: 'Học viên', roleColor: 'mint', email: 'tuan.ly@student.edu.vn', phone: '0907 333 444', status: 'Đang học', statusColor: 'mint', activity: '3 giờ trước' },
  { id: 'ST-2023-303', name: 'Trương Thị Bích Ngọc', role: 'Học viên', roleColor: 'mint', email: 'ngoc.truong@student.edu.vn', phone: '0907 555 666', status: 'Đang học', statusColor: 'mint', activity: 'Hôm qua' },
  { id: 'ST-2023-304', name: 'Võ Hoàng Nam', role: 'Học viên', roleColor: 'mint', email: 'nam.vo@student.edu.vn', phone: '0907 777 888', status: 'Đang học', statusColor: 'mint', activity: '1 ngày trước' },
  // Học viên lớp 9
  { id: 'ST-2023-401', name: 'Đỗ Thị Hương Giang', role: 'Học viên', roleColor: 'mint', email: 'giang.do@student.edu.vn', phone: '0906 111 222', status: 'Đang học', statusColor: 'mint', activity: '1 giờ trước' },
  { id: 'ST-2023-402', name: 'Nguyễn Văn Phúc', role: 'Học viên', roleColor: 'mint', email: 'phuc.nguyen@student.edu.vn', phone: '0906 333 444', status: 'Đang học', statusColor: 'mint', activity: '2 giờ trước' },
  { id: 'ST-2023-403', name: 'Trần Thị Kim Anh', role: 'Học viên', roleColor: 'mint', email: 'anh.tran@student.edu.vn', phone: '0906 555 666', status: 'Đang học', statusColor: 'mint', activity: 'Hôm qua' },
  { id: 'ST-2023-404', name: 'Lê Quốc Dũng', role: 'Học viên', roleColor: 'mint', email: 'dung.le@student.edu.vn', phone: '0906 777 888', status: 'Đang học', statusColor: 'mint', activity: '3 giờ trước' },
];

const initialClasses: Class[] = [
  { id: 'MATH-06-01', title: 'Toán 6 - Nâng cao', status: 'Đang diễn ra', instructor: 'Thầy Trần Văn Cường', instructorId: 'TCH-109', role: 'Giáo viên chính', schedule: 'Thứ 2, 4 (18:00 - 20:00)', location: 'Phòng A101', studentsCount: 15, maxStudents: 20, color: 'mint' },
  { id: 'MATH-07-02', title: 'Toán 7 - Cơ bản', status: 'Sắp bắt đầu', instructor: 'Cô Lê Thị Thu', role: 'Giáo viên', schedule: 'Thứ 3, 5 (18:00 - 20:00)', location: 'Phòng B202', studentsCount: 12, maxStudents: 20, color: 'mint' },
  { id: 'MATH-09-EX', title: 'Toán 9 - Luyện thi vào 10', status: 'Đang diễn ra', instructor: 'Thầy Trần Văn Cường', instructorId: 'TCH-109', role: 'Trưởng bộ môn', schedule: 'Thứ 7, CN (08:00 - 10:30)', location: 'Phòng VIP 1', studentsCount: 25, maxStudents: 25, color: 'rose' },
  { id: 'MATH-06-02', title: 'Toán 6 - Cơ bản', status: 'Đang diễn ra', instructor: 'Cô Lê Thị Thu', role: 'Giáo viên', schedule: 'Thứ 3, 5 (16:00 - 18:00)', location: 'Phòng A102', studentsCount: 18, maxStudents: 20, color: 'mint' },
  { id: 'MATH-07-01', title: 'Toán 7 - Nâng cao', status: 'Đang diễn ra', instructor: 'Thầy Trần Văn Cường', instructorId: 'TCH-109', role: 'Giáo viên chính', schedule: 'Thứ 2, 4 (16:00 - 18:00)', location: 'Phòng B201', studentsCount: 14, maxStudents: 20, color: 'mint' },
  { id: 'MATH-08-01', title: 'Toán 8 - Nâng cao', status: 'Đang diễn ra', instructor: 'Cô Lê Thị Thu', role: 'Giáo viên chính', schedule: 'Thứ 6, 7 (18:00 - 20:00)', location: 'Phòng A103', studentsCount: 16, maxStudents: 20, color: 'mint' },
  { id: 'MATH-08-02', title: 'Toán 8 - Cơ bản', status: 'Sắp bắt đầu', instructor: 'Thầy Trần Văn Cường', instructorId: 'TCH-109', role: 'Giáo viên', schedule: 'Thứ 3, 5 (18:00 - 20:00)', location: 'Phòng B203', studentsCount: 10, maxStudents: 20, color: 'mint' },
  { id: 'MATH-09-01', title: 'Toán 9 - Cơ bản', status: 'Đang diễn ra', instructor: 'Cô Lê Thị Thu', role: 'Giáo viên', schedule: 'Thứ 2, 4 (08:00 - 10:00)', location: 'Phòng A104', studentsCount: 20, maxStudents: 25, color: 'mint' },
];

const initialAssignments: Assignment[] = [
  {
    id: 'ASG-001',
    type: 'Trắc nghiệm',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập trắc nghiệm - Toán 6 - Phương trình bậc 2',
    description: 'Bài ôn tập phương trình bậc hai cơ bản, yêu cầu học sinh làm điền.',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    teacherName: 'Thầy Nguyễn Minh',
    progress: 5,
    total: 15,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 20,
    questions: [
      {
        id: 'Q-101',
        text: 'Tìm nghiệm của phương trình bậc hai sau: x^2 - 5x + 6 = 0',
        type: 'multiple_choice',
        options: ['x = 2 hoặc x = 3', 'x = -2 hoặc x = -3', 'x = 1 hoặc x = 6', 'x = -1 hoặc x = -6'],
        correctAnswer: 'A',
      },
      {
        id: 'Q-102',
        text: 'Tính biệt thức \\Delta của phương trình 2x^2 - 4x + 2 = 0',
        type: 'multiple_choice',
        options: ['\\Delta = 4', '\\Delta = 0', '\\Delta = -4', '\\Delta = 8'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-103',
        text: 'Phương trình bậc hai ax^2 + bx + c = 0 có nghiệm kép khi nào?',
        type: 'multiple_choice',
        options: ['\\Delta > 0', '\\Delta < 0', '\\Delta = 0', '\\Delta \\ge 0'],
        correctAnswer: 'C',
      },
      {
        id: 'Q-104',
        text: 'Tính tổng hai nghiệm của phương trình x^2 + 7x + 12 = 0 theo định lý Vi-ét.',
        type: 'multiple_choice',
        options: ['7', '-7', '12', '-12'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-105',
        text: 'Tính tích hai nghiệm của phương trình 3x^2 - 5x - 2 = 0 theo định lý Vi-ét.',
        type: 'multiple_choice',
        options: ['\\frac{5}{3}', '-\\frac{5}{3}', '\\frac{2}{3}', '-\\frac{2}{3}'],
        correctAnswer: 'D',
      },
    ],
  },
  {
    id: 'ASG-002',
    type: 'Tự luận',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập tự luận - Toán 7 - Hình học không gian',
    description: 'Tính thể tích và diện tích các hình khối cơ bản. Học sinh vẽ hình và giải ra nháp rồi chụp ảnh nộp bài.',
    classId: 'MATH-07-02',
    className: 'Toán 7 - Cơ bản',
    teacherName: 'Cô Lê Thị Thu',
    progress: 0,
    total: 12,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 0,
    questions: [
      {
        id: 'Q-201',
        text: 'Cho hình hộp chữ nhật có kích thước chiều dài 5cm, chiều rộng 3cm và chiều cao 4cm. Hãy tính thể tích V của hình hộp chữ nhật đó.',
        type: 'essay',
      },
      {
        id: 'Q-202',
        text: 'Tính diện tích xung quanh của một hình lăng trụ đứng tam giác có chiều cao 6cm và chu vi đáy là 12cm.',
        type: 'essay',
      },
    ],
  },
  {
    id: 'ASG-003',
    type: 'Tự luận',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập tự luận - Toán 9 - Ứng dụng hệ phương trình',
    description: 'Trình bày quy trình giải toán bằng cách lập hệ phương trình. Học sinh giải ra giấy, chụp ảnh nộp lên.',
    classId: 'MATH-09-EX',
    className: 'Toán 9 - Luyện thi vào 10',
    teacherName: 'Thầy Trần Hùng',
    progress: 3,
    total: 25,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 0,
    isUrgent: true,
    questions: [
      {
        id: 'Q-301',
        text: 'Giải bài toán bằng cách lập hệ phương trình: Tìm hai số tự nhiên biết tổng của chúng bằng 15 và hiệu của chúng bằng 3.',
        type: 'essay',
      },
      {
        id: 'Q-302',
        text: 'Giải hệ phương trình sau: 3x - 2y = 4 và 2x + y = 5. Vẽ đồ thị minh họa tập nghiệm.',
        type: 'essay',
      },
    ],
  },
  {
    id: 'ASG-004',
    type: 'Trắc nghiệm',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập trắc nghiệm - Toán 6 - Số học chương 2',
    description: '20 câu trắc nghiệm ôn tập số học chương 2 về số nguyên và các phép tính.',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    teacherName: 'Thầy Nguyễn Minh',
    progress: 15,
    total: 15,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 15,
    questions: [
      {
        id: 'Q-401',
        text: 'Tính giá trị của biểu thức: -15 + (-27)',
        type: 'multiple_choice',
        options: ['-42', '42', '-12', '12'],
        correctAnswer: 'A',
      },
      {
        id: 'Q-402',
        text: 'Giá trị tuyệt đối của số -10 là bao nhiêu?',
        type: 'multiple_choice',
        options: ['-10', '10', '0', '1'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-403',
        text: 'Kết quả của phép tính (-4) × (-5) là?',
        type: 'multiple_choice',
        options: ['-20', '20', '-9', '9'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-404',
        text: 'Trong các số sau, số nào nhỏ nhất: -5, -3, 0, -8?',
        type: 'multiple_choice',
        options: ['-5', '-3', '0', '-8'],
        correctAnswer: 'D',
      },
      {
        id: 'Q-405',
        text: 'Tính tổng: S = 1 - 2 + 3 - 4 + 5',
        type: 'multiple_choice',
        options: ['3', '-3', '1', '-1'],
        correctAnswer: 'A',
      },
    ],
  },
  {
    id: 'ASG-005',
    type: 'Trắc nghiệm',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập trắc nghiệm - Toán 6 - Số học chương 3',
    description: '5 câu trắc nghiệm phân số, lũy thừa nâng cao.',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    teacherName: 'Thầy Nguyễn Minh',
    progress: 3,
    total: 15,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 15,
    questions: [
      {
        id: 'Q-001',
        text: 'Kết quả của phép tính 15 + 27 là bao nhiêu?',
        type: 'multiple_choice',
        options: ['40', '42', '43', '45'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-002',
        text: 'Số nào sau đây là số nguyên tố?',
        type: 'multiple_choice',
        options: ['1', '4', '7', '9'],
        correctAnswer: 'C',
      },
      {
        id: 'Q-003',
        text: 'Ước chung lớn nhất của 12 và 18 là?',
        type: 'multiple_choice',
        options: ['2', '3', '6', '9'],
        correctAnswer: 'C',
      },
      {
        id: 'Q-004',
        text: 'Bội số chung nhỏ nhất của 4 và 6 là?',
        type: 'multiple_choice',
        options: ['8', '12', '16', '24'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-005',
        text: 'Giá trị của biểu thức 3 × (4 + 2) - 5 là?',
        type: 'multiple_choice',
        options: ['9', '11', '13', '15'],
        correctAnswer: 'C',
      },
    ],
  },
  {
    id: 'ASG-006',
    type: 'Tự luận',
    typeColor: 'mint',
    status: 'Đang mở',
    title: 'Bài tập tự luận - Toán 9 - Hệ phương trình bậc nhất',
    description: '2 câu tự luận hệ phương trình nâng cao, không giới hạn thời gian. Học sinh nộp ảnh giải chi tiết.',
    classId: 'MATH-09-EX',
    className: 'Toán 9 - Luyện thi vào 10',
    teacherName: 'Thầy Trần Hùng',
    progress: 0,
    total: 25,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 0,
    questions: [
      {
        id: 'Q-006',
        text: 'Giải hệ phương trình: 2x + y = 5 và x - y = 1. Trình bày đầy đủ các bước giải.',
        type: 'essay',
      },
      {
        id: 'Q-007',
        text: 'Nêu ứng dụng thực tế của hệ phương trình bậc nhất hai ẩn trong cuộc sống. Cho ví dụ minh họa.',
        type: 'essay',
      },
    ],
  },
  {
    id: 'ASG-007',
    type: 'Trắc nghiệm',
    typeColor: 'slate',
    status: 'Đang mở',
    title: 'Bài tập trắc nghiệm - Toán 7 - Số hữu tỉ và số thực',
    description: 'Bài kiểm tra trắc nghiệm số học lớp 7, thời gian 45 phút.',
    classId: 'MATH-07-02',
    className: 'Toán 7 - Cơ bản',
    teacherName: 'Cô Lê Thị Thu',
    progress: 12,
    total: 12,
    deadlineAt: '2026-12-31T16:59:00.000Z',
    deadline: '31/12/2026 23:59',
    timeLimit: 45,
    questions: [
      {
        id: 'Q-701',
        text: 'Số nào dưới đây không phải là số hữu tỉ?',
        type: 'multiple_choice',
        options: ['\\frac{2}{3}', '-1.5', '\\sqrt{2}', '0'],
        correctAnswer: 'C',
      },
      {
        id: 'Q-702',
        text: 'Tính giá trị biểu thức: A = \\frac{1}{2} + \\frac{1}{3}',
        type: 'multiple_choice',
        options: ['\\frac{2}{5}', '\\frac{5}{6}', '\\frac{1}{6}', '\\frac{5}{5}'],
        correctAnswer: 'B',
      },
      {
        id: 'Q-703',
        text: 'Kết quả của lũy thừa (2^3)^2 là?',
        type: 'multiple_choice',
        options: ['2^5', '2^6', '2^8', '2^9'],
        correctAnswer: 'B',
      },
    ],
  },
];

const initialMaterials: Material[] = [
  {
    id: 'doc-001',
    title: 'Số học 6 - Chương 2: Số nguyên',
    detail: 'Tài liệu lý thuyết và bài tập về số nguyên, các phép tính cơ bản.',
    description: 'Tài liệu lý thuyết và bài tập về số nguyên, các phép tính cơ bản.',
    files: 1,
    updated: '2 ngày trước',
    iconName: 'FileText',
    color: 'mint',
    category: 'knowledge',
    file_size_bytes: 1468006,
    mime_type: 'application/pdf',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    fileName: 'So_hoc_6_Chuong_2_So_nguyen.pdf',
    authorName: 'Thầy Trần Văn Cường',
    classId: 'MATH-06-01',
    isApproved: true,
    isHidden: false,
  },
  {
    id: 'doc-002',
    title: 'Hình học 6 - Điểm và đường thẳng',
    detail: 'Tổng ôn tập hình học lớp 6 chủ đề điểm và đường thẳng.',
    description: 'Tổng ôn tập hình học lớp 6 chủ đề điểm và đường thẳng.',
    files: 1,
    updated: '5 ngày trước',
    iconName: 'FileCode',
    color: 'mint',
    category: 'review',
    file_size_bytes: 2202009,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    fileName: 'Hinh_hoc_6_Diem_va_duong_thang.docx',
    authorName: 'Cô Lê Thị Thu',
    classId: 'MATH-06-01',
    isApproved: true,
    isHidden: false,
  },
  {
    id: 'doc-003',
    title: 'Tuyển tập Đề thi thử vào lớp 10 chuyên',
    detail: 'Đọc thêm nâng cao ôn luyện thi tuyển sinh vào 10 các trường chuyên.',
    description: 'Đọc thêm nâng cao ôn luyện thi tuyển sinh vào 10 các trường chuyên.',
    files: 1,
    updated: '1 ngày trước',
    iconName: 'FileText',
    color: 'mint',
    category: 'extra_reading',
    file_size_bytes: 5033164,
    mime_type: 'application/pdf',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    fileName: 'De_thi_thu_vao_10_chuyen.pdf',
    authorName: 'Thầy Trần Văn Cường',
    classId: 'MATH-09-EX',
    isApproved: true,
    isHidden: false,
  },
  {
    id: 'doc-004',
    title: 'Phiếu học tập: Tam giác bằng nhau',
    detail: 'Phiếu bài tập tự luyện và đáp án về chuyên đề tam giác bằng nhau lớp 7.',
    description: 'Phiếu bài tập tự luyện và đáp án về chuyên đề tam giác bằng nhau lớp 7.',
    files: 1,
    updated: '3 ngày trước',
    iconName: 'FileText',
    color: 'mint',
    category: 'knowledge',
    file_size_bytes: 1887436,
    mime_type: 'application/pdf',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    fileName: 'Phieu_hoc_tap_tam_giac_bang_nhau.pdf',
    authorName: 'Cô Lê Thị Thu',
    classId: 'MATH-07-02',
    isApproved: true,
    isHidden: false,
  },
  {
    id: 'doc-005',
    title: 'Bài tập Đại số lớp 8 nâng cao',
    detail: 'Tài liệu các chuyên đề đại số ôn thi học sinh giỏi lớp 8.',
    description: 'Tài liệu các chuyên đề đại số ôn thi học sinh giỏi lớp 8.',
    files: 1,
    updated: '1 tuần trước',
    iconName: 'FileText',
    color: 'mint',
    category: 'extra_reading',
    file_size_bytes: 3145728,
    mime_type: 'application/pdf',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    fileName: 'Dai_so_8_nang_cao.pdf',
    authorName: 'Thầy Trần Văn Cường',
    classId: 'MATH-08-01',
    isApproved: true,
    isHidden: false,
  },
];

// ── Class-Student mapping (dùng cho điểm danh) ────────────────
const INITIAL_CLASS_STUDENT_MAP: Record<string, string[]> = {
  // Lớp 6
  'MATH-06-01': ['STU-001', 'ST-2023-084', 'ST-2023-201', 'ST-2023-202', 'ST-2023-203', 'ST-2023-204'],
  'MATH-06-02': ['ST-2023-084', 'ST-2023-202', 'ST-2023-207', 'ST-2023-208'],
  // Lớp 7
  'MATH-07-01': ['ST-2023-205', 'ST-2023-206', 'ST-2023-207', 'ST-2023-208'],
  'MATH-07-02': ['ST-2023-084', 'ST-2023-205', 'ST-2023-206', 'ST-2023-112'],
  // Lớp 8
  'MATH-08-01': ['ST-2023-301', 'ST-2023-302', 'ST-2023-303', 'ST-2023-304'],
  'MATH-08-02': ['ST-2023-301', 'ST-2023-302', 'ST-2023-207', 'ST-2023-208'],
  // Lớp 9 (STU-001 không còn ở đây nữa)
  'MATH-09-EX': ['ST-2023-201', 'ST-2023-202', 'ST-2023-203', 'ST-2023-204', 'ST-2023-401', 'ST-2023-402'],
  'MATH-09-01': ['ST-2023-401', 'ST-2023-402', 'ST-2023-403', 'ST-2023-404', 'ST-2023-301', 'ST-2023-302'],
};

// ── Parent-Child mapping ────────────────────────────────────
const INITIAL_PARENT_CHILD_MAP: Record<string, string[]> = {
  'PAR-001': ['STU-001'],
};

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const initialAttendanceSessions: AttendanceSession[] = [
  {
    id: 'ATT-001',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    date: formatDate(yesterday),
    totalStudents: 5,
    presentCount: 3,
    absentCount: 1,
    lateCount: 1,
    excusedCount: 0,
    isFinalized: true,
    records: [
      { id: 'ATR-001', classId: 'MATH-06-01', studentId: 'ST-2023-084', studentName: 'Nguyễn Thu Hà', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-002', classId: 'MATH-06-01', studentId: 'ST-2023-201', studentName: 'Trần Quốc Bảo', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-002b', classId: 'MATH-06-01', studentId: 'STU-001', studentName: 'Nguyễn Minh Khoa', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-003', classId: 'MATH-06-01', studentId: 'ST-2023-202', studentName: 'Lê Thị Mai', date: formatDate(yesterday), status: 'absent', note: 'Ốm, có giấy phép', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-004', classId: 'MATH-06-01', studentId: 'ST-2023-203', studentName: 'Hoàng Minh Đức', date: formatDate(yesterday), status: 'late', note: 'Trễ 10 phút', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-005', classId: 'MATH-06-01', studentId: 'ST-2023-204', studentName: 'Ngô Thanh Tùng', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: 'ATT-002',
    classId: 'MATH-09-EX',
    className: 'Toán 9 - Luyện thi vào 10',
    date: formatDate(yesterday),
    totalStudents: 6,
    presentCount: 5,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 1,
    isFinalized: true,
    records: [
      { id: 'ATR-006', classId: 'MATH-09-EX', studentId: 'ST-2023-201', studentName: 'Trần Quốc Bảo', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-007', classId: 'MATH-09-EX', studentId: 'ST-2023-202', studentName: 'Lê Thị Mai', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-008', classId: 'MATH-09-EX', studentId: 'ST-2023-203', studentName: 'Hoàng Minh Đức', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-009', classId: 'MATH-09-EX', studentId: 'ST-2023-204', studentName: 'Ngô Thanh Tùng', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-010', classId: 'MATH-09-EX', studentId: 'ST-2023-205', studentName: 'Vũ Thị Hồng Nhung', date: formatDate(yesterday), status: 'excused', note: 'Được phép nghỉ', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ATR-011', classId: 'MATH-09-EX', studentId: 'ST-2023-206', studentName: 'Đặng Văn Hải', date: formatDate(yesterday), status: 'present', markedBy: 'ADM-001', markedAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: 'ATT-003',
    classId: 'MATH-07-02',
    className: 'Toán 7 - Cơ bản',
    date: formatDate(twoDaysAgo),
    totalStudents: 4,
    presentCount: 3,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 0,
    isFinalized: false,
    records: [
      { id: 'ATR-012', classId: 'MATH-07-02', studentId: 'ST-2023-084', studentName: 'Nguyễn Thu Hà', date: formatDate(twoDaysAgo), status: 'present', markedBy: 'TCH-109', markedAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'ATR-013', classId: 'MATH-07-02', studentId: 'ST-2023-205', studentName: 'Vũ Thị Hồng Nhung', date: formatDate(twoDaysAgo), status: 'present', markedBy: 'TCH-109', markedAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'ATR-014', classId: 'MATH-07-02', studentId: 'ST-2023-206', studentName: 'Đặng Văn Hải', date: formatDate(twoDaysAgo), status: 'absent', note: 'Không phép', markedBy: 'TCH-109', markedAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'ATR-015', classId: 'MATH-07-02', studentId: 'ST-2023-112', studentName: 'Phạm Thị Lan Anh', date: formatDate(twoDaysAgo), status: 'present', markedBy: 'TCH-109', markedAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
];

const initialUserRequests: UserRequest[] = [
  { id: 'REQ-001', name: 'Lê Minh Tuấn', email: 'tuan.le@gmail.com', role: 'Học viên', requestedAt: '1 giờ trước', note: 'Đăng ký tài khoản học viên lớp Toán 6', accountType: 'personal' },
  { id: 'REQ-002', name: 'Nguyễn Hồng Hạnh', email: 'hanh.nguyen@edu.vn', role: 'Giáo viên', requestedAt: '3 giờ trước', note: 'Yêu cầu cấp tài khoản giảng dạy', accountType: 'personal' },
  { id: 'REQ-003', name: 'Bùi Xuân Toàn', email: 'toan.bui@gmail.com', role: 'Phụ huynh', requestedAt: '5 giờ trước', note: 'Đăng ký tài khoản theo dõi con' },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR-001',
    studentId: 'STU-001',
    studentName: 'Nguyễn Minh Khoa',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: 'Em bị sốt xuất huyết cần nhập viện theo dõi sức khỏe.',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'LR-002',
    studentId: 'ST-2023-202',
    studentName: 'Lê Thị Mai',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    reason: 'Gia đình có việc hiếu đột xuất ở quê phải di chuyển gấp.',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolvedBy: 'Trần Văn A',
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'LR-003',
    studentId: 'ST-2023-203',
    studentName: 'Hoàng Minh Đức',
    classId: 'MATH-06-01',
    className: 'Toán 6 - Nâng cao',
    date: new Date().toISOString().split('T')[0],
    reason: 'Trùng lịch thi tuyển chọn học sinh giỏi cấp trường vòng 2.',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
];


const initialGradeEntries: GradeEntry[] = [
  // ── Lớp MATH-06-01 (Thầy Trần Văn Cường) ───────────────────
  { id: 'GE-001', studentId: 'ST-2023-084', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-002', studentId: 'ST-2023-084', classId: 'MATH-06-01', title: '15 phút - Chương 2', scoreType: 'quiz_15', score: 7.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-05T08:00:00.000Z' },
  { id: 'GE-003', studentId: 'ST-2023-084', classId: 'MATH-06-01', title: 'Kiểm tra 1 tiết', scoreType: 'quiz_45', score: 8.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-15T08:00:00.000Z' },
  { id: 'GE-004', studentId: 'ST-2023-201', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-005', studentId: 'ST-2023-201', classId: 'MATH-06-01', title: '15 phút - Chương 2', scoreType: 'quiz_15', score: 8, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-05T08:00:00.000Z' },
  { id: 'GE-006', studentId: 'ST-2023-202', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-007', studentId: 'ST-2023-202', classId: 'MATH-06-01', title: 'BTVN tuần 1', scoreType: 'homework', score: 7, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-08T08:00:00.000Z' },
  { id: 'GE-008', studentId: 'ST-2023-203', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-009', studentId: 'ST-2023-204', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-010', studentId: 'STU-001', classId: 'MATH-06-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-01T08:00:00.000Z' },
  { id: 'GE-010b', studentId: 'STU-001', classId: 'MATH-06-01', title: '15 phút - Chương 2', scoreType: 'quiz_15', score: 9, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-05T08:00:00.000Z' },
  // ── Lớp MATH-07-01 (Thầy Trần Văn Cường) ───────────────────
  { id: 'GE-030', studentId: 'ST-2023-205', classId: 'MATH-07-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-031', studentId: 'ST-2023-205', classId: 'MATH-07-01', title: 'Giữa kỳ', scoreType: 'midterm', score: 9.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-04-01T08:00:00.000Z' },
  { id: 'GE-032', studentId: 'ST-2023-206', classId: 'MATH-07-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-033', studentId: 'ST-2023-207', classId: 'MATH-07-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-034', studentId: 'ST-2023-208', classId: 'MATH-07-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-02T08:00:00.000Z' },
  // ── Lớp MATH-07-02 (Cô Lê Thị Thu) ─────────────────────────
  { id: 'GE-011', studentId: 'ST-2023-084', classId: 'MATH-07-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-012', studentId: 'ST-2023-084', classId: 'MATH-07-02', title: 'Giữa kỳ', scoreType: 'midterm', score: 7.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-04-01T08:00:00.000Z' },
  { id: 'GE-013', studentId: 'ST-2023-205', classId: 'MATH-07-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-015', studentId: 'ST-2023-206', classId: 'MATH-07-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-02T08:00:00.000Z' },
  { id: 'GE-016', studentId: 'ST-2023-112', classId: 'MATH-07-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 4.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-02T08:00:00.000Z' },
  // ── Lớp MATH-08-01 (Cô Lê Thị Thu) ─────────────────────────
  { id: 'GE-040', studentId: 'ST-2023-301', classId: 'MATH-08-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-04T08:00:00.000Z' },
  { id: 'GE-041', studentId: 'ST-2023-301', classId: 'MATH-08-01', title: '15 phút', scoreType: 'quiz_15', score: 8.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-10T08:00:00.000Z' },
  { id: 'GE-042', studentId: 'ST-2023-302', classId: 'MATH-08-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-04T08:00:00.000Z' },
  { id: 'GE-043', studentId: 'ST-2023-303', classId: 'MATH-08-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-04T08:00:00.000Z' },
  { id: 'GE-044', studentId: 'ST-2023-304', classId: 'MATH-08-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-04T08:00:00.000Z' },
  // ── Lớp MATH-08-02 (Thầy Trần Văn Cường) ───────────────────
  { id: 'GE-050', studentId: 'ST-2023-301', classId: 'MATH-08-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-05T08:00:00.000Z' },
  { id: 'GE-051', studentId: 'ST-2023-302', classId: 'MATH-08-02', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-05T08:00:00.000Z' },
  // ── Lớp MATH-09-EX (Thầy Trần Văn Cường) ───────────────────
  { id: 'GE-017', studentId: 'ST-2023-201', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-018', studentId: 'ST-2023-201', classId: 'MATH-09-EX', title: '15 phút - Chương 1', scoreType: 'quiz_15', score: 8.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-10T08:00:00.000Z' },
  { id: 'GE-019', studentId: 'ST-2023-202', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-020', studentId: 'ST-2023-203', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-021', studentId: 'ST-2023-204', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-022', studentId: 'ST-2023-401', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-023', studentId: 'ST-2023-402', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8.5, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  { id: 'GE-024', studentId: 'STU-001', classId: 'MATH-09-EX', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-109', gradedAt: '2025-03-03T08:00:00.000Z' },
  // ── Lớp MATH-09-01 (Cô Lê Thị Thu) ─────────────────────────
  { id: 'GE-060', studentId: 'ST-2023-401', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
  { id: 'GE-061', studentId: 'ST-2023-402', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
  { id: 'GE-062', studentId: 'ST-2023-403', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 9, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
  { id: 'GE-063', studentId: 'ST-2023-404', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 6.5, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
  { id: 'GE-064', studentId: 'ST-2023-301', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 7, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
  { id: 'GE-065', studentId: 'ST-2023-302', classId: 'MATH-09-01', title: 'Kiểm tra miệng', scoreType: 'oral', score: 8, maxScore: 10, gradedBy: 'TCH-110', gradedAt: '2025-03-06T08:00:00.000Z' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadStoredJson<User[]>('smash.users', initialUsers));
  const [userRequests, setUserRequests] = useState<UserRequest[]>(initialUserRequests);
  const [classes, setClasses] = useState<Class[]>(() => loadStoredJson<Class[]>('smash.classes', initialClasses));
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadStoredJson<Assignment[]>('smash.assignments', initialAssignments));
  const [materials, setMaterials] = useState<Material[]>(() => loadStoredJson<Material[]>('smash.materials', initialMaterials));
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => loadStoredJson<AttendanceSession[]>('smash.attendanceSessions', initialAttendanceSessions));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => loadStoredJson<LeaveRequest[]>('smash.leaveRequests', initialLeaveRequests));
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>(() => loadStoredJson<QuizSubmission[]>('smash.quizSubmissions', []));
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>(() => loadStoredJson<GradeEntry[]>('smash.gradeEntries', initialGradeEntries));
  const [studentComments, setStudentComments] = useState<StudentComment[]>(() => loadStoredJson<StudentComment[]>('smash.studentComments', []));
  const [classStudentMap, setClassStudentMap] = useState<Record<string, string[]>>(
    () => loadStoredJson<Record<string, string[]>>('smash.classStudentMap.v2', INITIAL_CLASS_STUDENT_MAP)
  );
  const [parentChildMap, setParentChildMap] = useState<Record<string, string[]>>(
    () => loadStoredJson<Record<string, string[]>>('smash.parentChildMap.v2', INITIAL_PARENT_CHILD_MAP)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [forgotPasswordRequests, setForgotPasswordRequests] = useState<ForgotPasswordRequest[]>(() =>
    loadStoredJson<ForgotPasswordRequest[]>('smash.forgotPasswordRequests', [])
  );

  // ── Module 9: new states ────────────────────────────────────
  const [classScheduleSlots, setClassScheduleSlots] = useState<Record<string, ScheduleSlot[]>>(
    () => loadStoredJson<Record<string, ScheduleSlot[]>>('smash.classScheduleSlots', {})
  );
  const [examSessions, setExamSessions] = useState<Record<string, ExamSession>>(
    () => loadStoredJson<Record<string, ExamSession>>('smash.examSessions', {})
  );
  const [gradeColumnConfigs, setGradeColumnConfigs] = useState<Record<string, GradeColumnConfig[]>>(
    () => loadStoredJson<Record<string, GradeColumnConfig[]>>('smash.gradeColumnConfigs', {})
  );
  const [userNotificationPreferences, setUserNotificationPreferences] = useState<UserNotificationPreferences[]>(
    () => loadStoredJson<UserNotificationPreferences[]>('smash.notificationPrefs', [])
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStoredJson<boolean>(LS_KEYS.auth, false));
  const [currentAccount, setCurrentAccount] = useState<AccountProfile | null>(() => {
    if (!loadStoredJson<boolean>(LS_KEYS.auth, false)) return null;
    return loadStoredJson<AccountProfile>(LS_KEYS.account, defaultAccount);
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    const key = currentAccount ? `smash.notifications.read.${currentAccount.id}` : LS_KEYS.readNotifs;
    return loadStoredJson<string[]>(key, []);
  });

  useEffect(() => {
    const key = currentAccount ? `smash.notifications.read.${currentAccount.id}` : LS_KEYS.readNotifs;
    setReadNotificationIds(loadStoredJson<string[]>(key, []));
  }, [currentAccount]);
  const [accountPreferences, setAccountPreferences] = useState<AccountPreferences>(() => ({
    ...defaultPreferences,
    ...loadStoredJson<Partial<AccountPreferences>>(LS_KEYS.prefs, defaultPreferences),
  }));
  const [accountActivities, setAccountActivities] = useState<AccountActivity[]>(defaultActivities);
  const [managedAccounts, setManagedAccounts] = useState(demoAccounts);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(initialTrustedDevices);
  const [rolePermissions] = useState<Record<RoleKey, PermissionKey[]>>(defaultRolePermissions);
  const [accountPermissionOverrides, setAccountPermissionOverrides] = useState<Record<string, PermissionKey[]>>({});
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy>(defaultSecurityPolicy);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([
    {
      id: 'log-1',
      accountEmail: 'admin@smashmath.edu.vn',
      accountName: 'Trần Văn A',
      result: 'success',
      reason: 'Đăng nhập thành công',
      deviceName: 'Chrome / Windows - POS 01',
      deviceId: 'dv-office-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [rememberedEmail, setRememberedEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(LS_KEYS.rememberedEmail) ?? '';
  });

  // ── localStorage persistence ──────────────────────────────
  useEffect(() => { saveJson('smash.users', users); }, [users]);
  useEffect(() => { saveJson('smash.classes', classes); }, [classes]);
  useEffect(() => { saveJson('smash.assignments', assignments); }, [assignments]);
  useEffect(() => { saveJson('smash.attendanceSessions', attendanceSessions); }, [attendanceSessions]);
  useEffect(() => { saveJson('smash.gradeEntries', gradeEntries); }, [gradeEntries]);
  useEffect(() => { saveJson('smash.classStudentMap.v2', classStudentMap); }, [classStudentMap]);
  useEffect(() => { saveJson('smash.parentChildMap.v2', parentChildMap); }, [parentChildMap]);
  useEffect(() => { saveJson('smash.materials', materials); }, [materials]);
  useEffect(() => { saveJson('smash.leaveRequests', leaveRequests); }, [leaveRequests]);
  useEffect(() => { saveJson('smash.forgotPasswordRequests', forgotPasswordRequests); }, [forgotPasswordRequests]);
  useEffect(() => { saveJson('smash.quizSubmissions', quizSubmissions); }, [quizSubmissions]);
  useEffect(() => { saveJson('smash.studentComments', studentComments); }, [studentComments]);

  // Module 9: persist new states
  useEffect(() => { saveJson('smash.classScheduleSlots', classScheduleSlots); }, [classScheduleSlots]);
  useEffect(() => { saveJson('smash.examSessions', examSessions); }, [examSessions]);
  useEffect(() => { saveJson('smash.gradeColumnConfigs', gradeColumnConfigs); }, [gradeColumnConfigs]);
  useEffect(() => { saveJson('smash.notificationPrefs', userNotificationPreferences); }, [userNotificationPreferences]);

  // ── Class-Student actions ─────────────────────────────────
  const addStudentToClass = (classId: string, studentId: string) => {
    setClassStudentMap(prev => {
      const current = prev[classId] ?? [];
      if (current.includes(studentId)) return prev;
      return { ...prev, [classId]: [...current, studentId] };
    });
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, studentsCount: c.studentsCount + 1 } : c
    ));
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setClassStudentMap(prev => {
      const current = prev[classId] ?? [];
      if (!current.includes(studentId)) return prev;
      return { ...prev, [classId]: current.filter(id => id !== studentId) };
    });
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, studentsCount: Math.max(0, c.studentsCount - 1) } : c
    ));
  };

  // ── Parent-Child actions ──────────────────────────────────
  const linkParentToStudent = (parentId: string, studentId: string) => {
    setParentChildMap(prev => {
      const current = prev[parentId] ?? [];
      if (current.includes(studentId)) return prev;
      return { ...prev, [parentId]: [...current, studentId] };
    });
  };

  const unlinkParentFromStudent = (parentId: string, studentId: string) => {
    setParentChildMap(prev => {
      const current = prev[parentId] ?? [];
      return { ...prev, [parentId]: current.filter(id => id !== studentId) };
    });
  };

  // ── Materials actions ──────────────────────────────────────
  const addMaterial = (materialData: Omit<Material, 'id' | 'publishedAt' | 'authorName' | 'updated'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: `doc-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      authorName: currentAccount?.name ?? 'Giáo viên',
      updated: 'Vừa xong',
      files: 1,
      iconName: materialData.mime_type.includes('pdf') ? 'FileText' : materialData.mime_type.includes('word') || materialData.mime_type.includes('document') ? 'FileCode' : 'FileText',
      color: 'mint',
      detail: materialData.description,
      isApproved: true, // Auto-approve by default for convenience
      isHidden: false,
    };
    setMaterials(prev => [newMaterial, ...prev]);
    appendActivity('Tải lên tài liệu', `Tài liệu: ${materialData.title}`, 'mint');
  };

  const updateMaterial = (id: string, updated: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    appendActivity('Cập nhật tài liệu', `Đã cập nhật tài liệu thành công`, 'mint');
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    appendActivity('Xóa tài liệu', `Đã xóa tài liệu khỏi hệ thống`, 'slate');
  };

  // ── Module 9: new actions ───────────────────────────────────
  const updateClassSchedule = (classId: string, slots: ScheduleSlot[]) => {
    setClassScheduleSlots(prev => ({ ...prev, [classId]: slots }));
  };

  const createExamSession = (session: ExamSession) => {
    setExamSessions(prev => ({ ...prev, [session.sessionId]: session }));
  };

  const updateExamSession = (sessionId: string, data: Partial<ExamSession>) => {
    setExamSessions(prev => {
      const existing = prev[sessionId];
      if (!existing) return prev;
      return { ...prev, [sessionId]: { ...existing, ...data } };
    });
  };

  const updateGradeColumnConfigs = (classId: string, configs: GradeColumnConfig[]) => {
    setGradeColumnConfigs(prev => ({ ...prev, [classId]: configs }));
  };

  const updateNotificationPreferences = (userId: string, prefs: Record<NotificationEventType, boolean>) => {
    setUserNotificationPreferences(prev => {
      const existing = prev.find(p => p.userId === userId);
      if (existing) {
        return prev.map(p => p.userId === userId ? { ...p, preferences: prefs } : p);
      }
      return [...prev, { userId, preferences: prefs }];
    });
  };

  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev]);
    setManagedAccounts(prev => {
      if (prev.some(item => item.profile.id === user.id || item.email === user.email.toLowerCase())) return prev;
      const roleKey = roleByLabel[user.role] ?? 'student';
      return [
        {
          email: user.email.toLowerCase(),
          password: 'Welcome@123',
          profile: {
            ...defaultAccount,
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            role: user.role,
            roleTitle: user.role,
            avatarUrl: `https://picsum.photos/seed/${user.id}/300/300`,
          },
          accountType: 'personal',
          failedAttempts: 0,
          lockedUntil: null,
          allowedDeviceIds: ['dv-office-001'],
          mustChangePassword: true,
          roleKey,
        },
        ...prev,
      ];
    });
  };
  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedUser } : u)));
  };
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const approveRequest = (requestId: string) => {
    const request = userRequests.find(r => r.id === requestId);
    if (!request) return;

    const roleKey = roleByLabel[request.role] ?? 'student';
    const prefixMap: Record<RoleKey, string> = {
      owner: 'OWN',
      manager: 'MGR',
      admin_staff: 'STA',
      admin: 'ADM',
      teacher: 'TCH',
      student: 'STD',
      parent: 'PAR',
    };
    const prefix = prefixMap[roleKey];
    const newUser: User = {
      id: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}`,
      name: request.name,
      email: request.email,
      phone: 'Chưa cập nhật',
      role: request.role,
      roleColor: roleKey === 'admin' || roleKey === 'owner' ? 'rose' : roleKey === 'teacher' ? 'slate' : 'mint',
      status: roleKey === 'student' ? 'Đang học' : 'Đang làm việc',
      statusColor: 'mint',
      activity: 'Vừa đăng ký qua duyệt',
    };

    setUsers(prev => [newUser, ...prev]);
    setManagedAccounts(prev => {
      const existed = prev.some(item => item.email.toLowerCase() === request.email.toLowerCase());
      if (existed) return prev;
      return [
        {
          email: request.email.toLowerCase(),
          password: 'Welcome@123',
          profile: {
            ...defaultAccount,
            id: newUser.id,
            name: request.name,
            email: request.email.toLowerCase(),
            role: request.role,
            roleTitle: request.accountType === 'group' ? `Tài khoản nhóm - ${request.role}` : request.role,
            avatarUrl: `https://picsum.photos/seed/${newUser.id}/300/300`,
          },
          accountType: request.accountType ?? 'personal',
          failedAttempts: 0,
          lockedUntil: null,
          allowedDeviceIds: ['dv-office-001'],
          mustChangePassword: true,
          roleKey,
        },
        ...prev,
      ];
    });
    setUserRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const rejectRequest = (requestId: string) => {
    setUserRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const addClass = (cls: Class) => setClasses(prev => [cls, ...prev]);
  const updateClass = (id: string, updatedClass: Partial<Class>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...updatedClass } : c)));
  };
  const deleteClass = (id: string) => setClasses(prev => prev.filter(c => c.id !== id));

  const addAssignment = (asgn: Assignment) => setAssignments(prev => [asgn, ...prev]);
  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
  };
  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // ── Attendance methods ────────────────────────────────────
  const markAttendance = (session: AttendanceSession) => {
    setAttendanceSessions(prev => {
      const existingIdx = prev.findIndex(s => s.classId === session.classId && s.date === session.date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = session;
        return updated;
      }
      return [session, ...prev];
    });
  };

  const updateAttendanceRecord = (sessionId: string, studentId: string, status: AttendanceStatus, note?: string) => {
    setAttendanceSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const updatedRecords = s.records.map(r =>
        r.studentId === studentId ? { ...r, status, note: note ?? r.note, markedAt: new Date().toISOString() } : r
      );
      return {
        ...s,
        records: updatedRecords,
        presentCount: updatedRecords.filter(r => r.status === 'present').length,
        absentCount: updatedRecords.filter(r => r.status === 'absent').length,
        lateCount: updatedRecords.filter(r => r.status === 'late').length,
        excusedCount: updatedRecords.filter(r => r.status === 'excused').length,
      };
    }));
  };

  const finalizeAttendanceSession = (sessionId: string) => {
    setAttendanceSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, isFinalized: true } : s
    ));
  };

  const unfinalizeAttendanceSession = (sessionId: string) => {
    setAttendanceSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, isFinalized: false } : s
    ));
    appendActivity('Mở khóa sổ điểm danh', `Mở khóa sổ phiên điểm danh ID: ${sessionId}`, 'slate');
  };

  const getAttendanceByClass = (classId: string) => {
    return attendanceSessions.filter(s => s.classId === classId);
  };

  const getAttendanceByStudent = (studentId: string) => {
    return attendanceSessions.flatMap(s => s.records.filter(r => r.studentId === studentId));
  };

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `LR-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
    appendActivity('Nộp đơn nghỉ phép', `Học sinh: ${request.studentName}, Lớp: ${request.className}`, 'mint');
  };

  const resolveLeaveRequest = (id: string, status: 'approved' | 'rejected', resolvedBy: string) => {
    let resolvedReq: LeaveRequest | undefined;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      resolvedReq = {
        ...req,
        status,
        resolvedBy,
        resolvedAt: new Date().toISOString(),
      };
      return resolvedReq;
    }));

    if (status === 'approved') {
      setAttendanceSessions(prev => {
        const request = resolvedReq;
        if (!request) return prev;

        const dateStr = request.date;
        const classId = request.classId;

        const sessionIdx = prev.findIndex(s => s.classId === classId && s.date === dateStr);
        if (sessionIdx >= 0) {
          const updated = [...prev];
          const session = updated[sessionIdx];
          const recordIdx = session.records.findIndex(r => r.studentId === request.studentId);
          let updatedRecords = [...session.records];

          if (recordIdx >= 0) {
            updatedRecords[recordIdx] = {
              ...updatedRecords[recordIdx],
              status: 'excused',
              note: `Vắng có phép: ${request.reason}`,
              markedBy: resolvedBy,
              markedAt: new Date().toISOString(),
            };
          } else {
            updatedRecords.push({
              id: `ATR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              classId: classId,
              studentId: request.studentId,
              studentName: request.studentName,
              date: dateStr,
              status: 'excused',
              note: `Vắng có phép: ${request.reason}`,
              markedBy: resolvedBy,
              markedAt: new Date().toISOString(),
            });
          }

          updated[sessionIdx] = {
            ...session,
            records: updatedRecords,
            totalStudents: updatedRecords.length,
            presentCount: updatedRecords.filter(r => r.status === 'present').length,
            absentCount: updatedRecords.filter(r => r.status === 'absent').length,
            lateCount: updatedRecords.filter(r => r.status === 'late').length,
            excusedCount: updatedRecords.filter(r => r.status === 'excused').length,
          };
          return updated;
        } else {
          return prev;
        }
      });
    }

    appendActivity(
      status === 'approved' ? 'Phê duyệt nghỉ phép' : 'Từ chối nghỉ phép',
      `Đơn: ${id}, Người duyệt: ${resolvedBy}`,
      status === 'approved' ? 'mint' : 'slate'
    );
  };

  const updateLeaveRequest = (id: string, date: string, reason: string, classId: string, className: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      if (req.status !== 'pending') return req; // Chỉ được sửa khi trạng thái là pending
      return {
        ...req,
        date,
        reason,
        classId,
        className,
      };
    }));
    appendActivity('Sửa đơn nghỉ phép', `Mã đơn: ${id}`, 'mint');
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.filter(req => {
      if (req.id !== id) return true;
      if (req.status !== 'pending') return true; // Chỉ được xóa khi trạng thái là pending
      return false;
    }));
    appendActivity('Xóa đơn nghỉ phép', `Mã đơn: ${id}`, 'slate');
  };



  const appendAccessLog = (entry: Omit<AccessLogEntry, 'id' | 'timestamp'>) => {
    setAccessLogs(prev => [
      {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 200));
  };

  const appendActivity = (title: string, description: string, tone: AccountActivity['tone'] = 'mint') => {
    setAccountActivities(prev => [{ id: `act-${Date.now()}`, title, description, time: 'Vừa xong', tone }, ...prev].slice(0, 20));
  };

  const login = ({ email, password, remember }: LoginPayload) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = managedAccounts.find(item => item.email.toLowerCase() === normalizedEmail);

    if (!account) {
      appendAccessLog({
        accountEmail: normalizedEmail,
        accountName: 'Không xác định',
        result: 'failed',
        reason: 'Sai tài khoản',
        deviceName: CURRENT_DEVICE_NAME,
        deviceId: CURRENT_DEVICE_ID,
      });
      return { success: false, message: 'Tài khoản không tồn tại trong hệ thống.' };
    }

    if (account.lockedUntil && account.lockedUntil > Date.now()) {
      appendAccessLog({
        accountEmail: normalizedEmail,
        accountName: account.profile.name,
        result: 'blocked',
        reason: 'Tài khoản đang bị khóa tạm thời',
        deviceName: CURRENT_DEVICE_NAME,
        deviceId: CURRENT_DEVICE_ID,
      });
      return { success: false, message: 'Tài khoản đang bị khóa tạm thời do nhập sai nhiều lần.' };
    }

    const activeDeviceIds = trustedDevices.filter(device => device.isActive).map(device => device.id);
    if (!account.allowedDeviceIds.includes(CURRENT_DEVICE_ID) || !activeDeviceIds.includes(CURRENT_DEVICE_ID)) {
      appendAccessLog({
        accountEmail: normalizedEmail,
        accountName: account.profile.name,
        result: 'blocked',
        reason: 'Thiết bị không hợp lệ',
        deviceName: CURRENT_DEVICE_NAME,
        deviceId: CURRENT_DEVICE_ID,
      });
      return { success: false, message: 'Thiết bị hiện tại chưa được cấp quyền đăng nhập.' };
    }

    if (account.password !== password) {
      const nextAttempts = account.failedAttempts + 1;
      setManagedAccounts(prev => prev.map(item => {
        if (item.email !== account.email) return item;
        return {
          ...item,
          failedAttempts: nextAttempts >= securityPolicy.lockoutThreshold ? 0 : nextAttempts,
          lockedUntil: nextAttempts >= securityPolicy.lockoutThreshold ? Date.now() + securityPolicy.lockoutMinutes * 60 * 1000 : null,
        };
      }));
      appendAccessLog({
        accountEmail: normalizedEmail,
        accountName: account.profile.name,
        result: nextAttempts >= securityPolicy.lockoutThreshold ? 'blocked' : 'failed',
        reason: nextAttempts >= securityPolicy.lockoutThreshold ? `Khóa tài khoản do nhập sai ${securityPolicy.lockoutThreshold} lần` : 'Sai mật khẩu',
        deviceName: CURRENT_DEVICE_NAME,
        deviceId: CURRENT_DEVICE_ID,
      });
      return { success: false, message: nextAttempts >= securityPolicy.lockoutThreshold ? `Tài khoản bị khóa ${securityPolicy.lockoutMinutes} phút do nhập sai quá nhiều lần.` : 'Email hoặc mật khẩu chưa đúng.' };
    }

    if (account.mustChangePassword) {
      return { success: false, message: 'Tài khoản này đang dùng mật khẩu tạm. Vui lòng liên hệ quản trị để đổi mật khẩu lần đầu.' };
    }

    setIsAuthenticated(true);
    setCurrentAccount(account.profile);
    setManagedAccounts(prev => prev.map(item => item.email === account.email ? { ...item, failedAttempts: 0, lockedUntil: null } : item));
    saveJson(LS_KEYS.auth, true);
    saveJson(LS_KEYS.account, account.profile);

    if (remember) {
      if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEYS.rememberedEmail, normalizedEmail);
      setRememberedEmail(normalizedEmail);
    } else {
      if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEYS.rememberedEmail);
      setRememberedEmail('');
    }

    appendActivity('Đăng nhập hệ thống', 'Thiết bị: Chrome trên Windows', 'slate');
    appendAccessLog({
      accountEmail: normalizedEmail,
      accountName: account.profile.name,
      result: 'success',
      reason: 'Đăng nhập thành công',
      deviceName: CURRENT_DEVICE_NAME,
      deviceId: CURRENT_DEVICE_ID,
    });
    return { success: true, message: 'Đăng nhập thành công.' };
  };

  const submitSupportRequest = (payload: Omit<SupportRequest, 'id' | 'createdAt'>) => {
    if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
      return { success: false, message: 'Vui lòng nhập họ tên, email và mô tả vấn đề.' };
    }
    const ticketId = `SUP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setSupportRequests(prev => [
      {
        ...payload,
        id: ticketId,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    return { success: true, message: 'Đã gửi yêu cầu hỗ trợ thành công.', ticketId };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentAccount(null);
    saveJson(LS_KEYS.auth, false);
    if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEYS.account);
  };

  const updateAccountProfile = (data: Partial<Pick<AccountProfile, 'name' | 'email' | 'phone' | 'avatarUrl'>>) => {
    setCurrentAccount(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      saveJson(LS_KEYS.account, next);
      appendActivity('Cập nhật hồ sơ', 'Bạn vừa thay đổi thông tin cá nhân.');
      return next;
    });
  };

  const changePassword = (currentPassword: string, nextPassword: string) => {
    if (!currentPassword.trim() || !nextPassword.trim()) {
      return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' };
    }
    if (nextPassword.length < securityPolicy.minPasswordLength) {
      return { success: false, message: `Mật khẩu mới cần ít nhất ${securityPolicy.minPasswordLength} ký tự.` };
    }
    if (securityPolicy.requireStrongPassword && !(/[A-Z]/.test(nextPassword) && /[a-z]/.test(nextPassword) && /\d/.test(nextPassword))) {
      return { success: false, message: 'Mật khẩu cần có chữ hoa, chữ thường và số.' };
    }
    if (currentPassword === nextPassword) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu cũ.' };
    }

    if (currentAccount?.email) {
      const match = managedAccounts.find(item => item.email === currentAccount.email);
      if (match && match.password !== currentPassword) {
        return { success: false, message: 'Mật khẩu hiện tại chưa chính xác.' };
      }
      setManagedAccounts(prev => prev.map(item => item.email === currentAccount.email ? { ...item, password: nextPassword, mustChangePassword: false } : item));
    }

    appendActivity('Đổi mật khẩu', 'Mật khẩu tài khoản đã được cập nhật.');
    return { success: true, message: 'Đổi mật khẩu thành công.' };
  };

  const updateAccountPreferences = (data: Partial<AccountPreferences>) => {
    setAccountPreferences(prev => {
      const next = { ...prev, ...data };
      saveJson(LS_KEYS.prefs, next);
      appendActivity('Cập nhật cài đặt', 'Tùy chọn hiển thị đã được thay đổi.');
      return next;
    });
  };

  const registerAccountRequest = (payload: RegisterPayload) => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const isRegistered = managedAccounts.some(item => item.email.toLowerCase() === normalizedEmail);
    const isPending = userRequests.some(item => item.email.toLowerCase() === normalizedEmail);
    if (isRegistered || isPending) {
      return { success: false, message: 'Email đã có tài khoản hoặc đang chờ duyệt.' };
    }

    const normalizedRole = roleByLabel[payload.role] ? payload.role : 'Nhân viên hành chính';
    setUserRequests(prev => [
      {
        id: `REQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: payload.name.trim(),
        email: normalizedEmail,
        role: normalizedRole,
        note: payload.note || 'Yêu cầu tạo tài khoản từ trang đăng ký',
        accountType: payload.accountType,
        requestedBy: payload.name.trim(),
        requestedAt: 'Vừa xong',
      },
      ...prev,
    ]);
    return { success: true, message: 'Yêu cầu đăng ký đã được gửi để quản lý xét duyệt.' };
  };

  const submitForgotPasswordRequest = (email: string, name: string, note?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isRegistered = managedAccounts.some(item => item.email.toLowerCase() === normalizedEmail);
    if (!isRegistered) {
      return { success: false, message: 'Email không tồn tại trong hệ thống.' };
    }

    const existing = forgotPasswordRequests.find(r => r.email === normalizedEmail && r.status !== 'rejected');
    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, message: 'Yêu cầu của email này đang chờ duyệt. Vui lòng liên hệ Admin.' };
      }
      if (existing.status === 'approved') {
        return { success: true, message: 'Yêu cầu đã được duyệt! Hãy đặt lại mật khẩu mới bên dưới.' };
      }
    }

    const newRequest: ForgotPasswordRequest = {
      id: `FPR-${Math.floor(1000 + Math.random() * 9000)}`,
      email: normalizedEmail,
      name: name.trim(),
      note: note || 'Yêu cầu đặt lại mật khẩu từ trang Quên mật khẩu',
      status: 'pending',
      requestedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
    };

    setForgotPasswordRequests(prev => [newRequest, ...prev]);
    appendActivity('Yêu cầu khôi phục mật khẩu', `Tài khoản: ${normalizedEmail}`, 'slate');
    return { success: true, message: 'Yêu cầu khôi phục mật khẩu đã được gửi đến Admin xét duyệt.' };
  };

  const checkForgotPasswordRequestStatus = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return forgotPasswordRequests.find(r => r.email === normalizedEmail);
  };

  const approveForgotPasswordRequest = (requestId: string) => {
    setForgotPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r));
    const req = forgotPasswordRequests.find(r => r.id === requestId);
    if (req) {
      appendActivity('Phê duyệt khôi phục mật khẩu', `Tài khoản: ${req.email}`, 'mint');
    }
  };

  const rejectForgotPasswordRequest = (requestId: string) => {
    setForgotPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    const req = forgotPasswordRequests.find(r => r.id === requestId);
    if (req) {
      appendActivity('Từ chối khôi phục mật khẩu', `Tài khoản: ${req.email}`, 'slate');
    }
  };

  const completeForgotPasswordReset = (email: string, nextPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (nextPassword.length < securityPolicy.minPasswordLength) {
      return { success: false, message: `Mật khẩu mới cần ít nhất ${securityPolicy.minPasswordLength} ký tự.` };
    }
    if (securityPolicy.requireStrongPassword && !(/[A-Z]/.test(nextPassword) && /[a-z]/.test(nextPassword) && /\d/.test(nextPassword))) {
      return { success: false, message: 'Mật khẩu cần có chữ hoa, chữ thường và số.' };
    }

    const match = managedAccounts.find(item => item.email === normalizedEmail);
    if (!match) {
      return { success: false, message: 'Lỗi: Không tìm thấy tài khoản để cập nhật.' };
    }

    setManagedAccounts(prev => prev.map(item => item.email === normalizedEmail ? { ...item, password: nextPassword, mustChangePassword: false } : item));
    setForgotPasswordRequests(prev => prev.filter(r => r.email !== normalizedEmail));
    appendActivity('Đặt lại mật khẩu', `Tài khoản ${normalizedEmail} đã thiết lập mật khẩu mới thành công.`, 'mint');
    return { success: true, message: 'Đặt lại mật khẩu thành công. Hãy đăng nhập với mật khẩu mới.' };
  };

  const addTrustedDevice = (payload: Omit<TrustedDevice, 'id' | 'lastSeen'>) => {
    setTrustedDevices(prev => [
      {
        id: `dv-${Date.now()}`,
        ...payload,
        lastSeen: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const removeTrustedDevice = (deviceId: string) => {
    setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;
      const statusColor = status === 'Khóa' ? 'rose' : status === 'Nghỉ học' ? 'slate' : 'mint';
      return { ...user, status, statusColor };
    }));
  };

  const resetUserPassword = (userId: string) => {
    const user = users.find(item => item.id === userId);
    if (!user) return { success: false, message: 'Không tìm thấy người dùng.' };
    const tempPassword = `Smash@${Math.floor(1000 + Math.random() * 8999)}`;
    setManagedAccounts(prev => prev.map(account => account.profile.id === userId || account.email === user.email.toLowerCase()
      ? { ...account, password: tempPassword, mustChangePassword: true }
      : account));
    appendActivity('Reset mật khẩu', `Đã reset mật khẩu tạm cho ${user.name}.`);
    return { success: true, message: 'Đã tạo mật khẩu tạm và yêu cầu đổi khi đăng nhập đầu tiên.', tempPassword };
  };

  const updateAccountPermissions = (userId: string, permissions: PermissionKey[]) => {
    setAccountPermissionOverrides(prev => ({ ...prev, [userId]: permissions }));
  };

  const updateSecurityPolicy = (data: Partial<SecurityPolicy>) => {
    setSecurityPolicy(prev => ({ ...prev, ...data }));
  };

  const canAccess = (permission: PermissionKey) => {
    if (!currentAccount) return false;
    const roleKey = roleByLabel[currentAccount.role] ?? 'student';
    const basePermissions = rolePermissions[roleKey] ?? [];
    const overrides = accountPermissionOverrides[currentAccount.id] ?? [];
    return [...basePermissions, ...overrides].includes(permission);
  };

  const submitQuiz = (submission: Omit<QuizSubmission, 'id'>) => {
    const quizSubId = `QS-${Date.now()}`;
    setQuizSubmissions(prev => [
      { ...submission, id: quizSubId },
      ...prev,
    ]);

    // Update assignment progress and status
    setAssignments(prev => prev.map(a => {
      if (a.id === submission.assignmentId) {
        const newProgress = Math.min(a.total, a.progress + 1);
        const shouldSetGrading = a.type === "Tự luận" && a.status === "Đang mở";
        return {
          ...a,
          progress: newProgress,
          status: shouldSetGrading ? "Chờ chấm điểm" : a.status
        };
      }
      return a;
    }));

    // Auto sync grade if score is computed (trắc nghiệm)
    if (submission.score !== undefined) {
      const assignment = assignments.find(a => a.id === submission.assignmentId);
      if (assignment) {
        setGradeEntries(prev => {
          // Remove existing entry for the same student/assignment if any to avoid duplicates
          const filtered = prev.filter(
            e => !(e.assignmentId === submission.assignmentId && e.studentId === submission.studentId)
          );
          return [
            {
              id: `GE-${Date.now()}`,
              studentId: submission.studentId,
              classId: assignment.classId,
              assignmentId: submission.assignmentId,
              title: `Làm bài: ${assignment.title}`,
              scoreType: 'quiz_15',
              score: submission.score ?? 0,
              maxScore: 10,
              gradedBy: 'SYSTEM',
              gradedAt: new Date().toISOString(),
            },
            ...filtered,
          ];
        });
      }
    }
  };

  const getSubmission = (assignmentId: string, studentId: string): QuizSubmission | undefined => {
    return quizSubmissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
  };

  // ── GradeEntry CRUD ──────────────────────────────────────────
  const addGradeEntry = (entry: Omit<GradeEntry, 'id'>) => {
    setGradeEntries(prev => [
      { ...entry, id: `GE-${Date.now()}` },
      ...prev,
    ]);
  };

  const updateGradeEntry = (id: string, data: Partial<GradeEntry>) => {
    setGradeEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteGradeEntry = (id: string) => {
    setGradeEntries(prev => prev.filter(e => e.id !== id));
  };

  // ── StudentComment upsert ────────────────────────────────────
  const saveStudentComment = (comment: Omit<StudentComment, 'id' | 'createdAt' | 'updatedAt'>) => {
    setStudentComments(prev => {
      const existing = prev.find(
        c => c.studentId === comment.studentId && c.classId === comment.classId
      );
      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? { ...c, content: comment.content, updatedAt: new Date().toISOString() }
            : c
        );
      }
      return [
        ...prev,
        {
          ...comment,
          id: `CMT-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    });
  };

  // ── gradeEssaySubmission ─────────────────────────────────────
  const gradeEssaySubmission = (submissionId: string, score: number, comment?: string) => {
    setQuizSubmissions(prev => prev.map(s =>
      s.id === submissionId ? { ...s, score } : s
    ));
    
    const submission = quizSubmissions.find(s => s.id === submissionId);
    if (submission) {
      const assignment = assignments.find(a => a.id === submission.assignmentId);
      if (assignment) {
        // Create or update GradeEntry
        setGradeEntries(prev => {
          const existingIdx = prev.findIndex(
            e => e.assignmentId === submission.assignmentId && e.studentId === submission.studentId
          );
          const newEntry: GradeEntry = {
            id: existingIdx >= 0 ? prev[existingIdx].id : `GE-${Date.now()}`,
            studentId: submission.studentId,
            classId: assignment.classId,
            assignmentId: submission.assignmentId,
            title: `Làm bài: ${assignment.title}`,
            scoreType: 'assignment',
            score: score,
            maxScore: 10,
            gradedBy: currentAccount?.id ?? 'SYSTEM',
            gradedAt: new Date().toISOString(),
            note: comment,
          };
          
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = newEntry;
            return updated;
          }
          return [newEntry, ...prev];
        });

        if (comment) {
          saveStudentComment({
            studentId: submission.studentId,
            classId: assignment.classId,
            teacherId: currentAccount?.id ?? '',
            content: comment,
          });
        }
      }
    }
  };

  const switchDemoAccount = (email: string) => {
    const account = demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!account) return;
    setCurrentAccount(account.profile);
    setIsAuthenticated(true);
    saveJson(LS_KEYS.account, account.profile);
    saveJson(LS_KEYS.auth, true);
  };

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === 'Giáo viên').length,
    activeClasses: classes.filter(c => c.status === 'Đang diễn ra').length,
    pendingGrading: assignments.filter(a => a.status === 'Chờ chấm điểm').length,
    pendingRequests: userRequests.length,
  }), [users, classes, assignments, userRequests]);

  // ── Notification derived state ────────────────────────────────
  const currentRoleKey = useMemo(() => {
    if (!currentAccount) return 'student' as RoleKey;
    return (Object.entries({
      owner: 'Chủ trung tâm', manager: 'Quản lý', admin_staff: 'Nhân viên hành chính',
      admin: 'Admin', teacher: 'Giáo viên', student: 'Học viên', parent: 'Phụ huynh',
    } as Record<RoleKey, string>).find(([, label]) => label === currentAccount.role)?.[0] ?? 'student') as RoleKey;
  }, [currentAccount]);

  const notifications = useMemo(() =>
    buildNotifications(
      { userRequests, supportRequests, assignments, classes, materials, accessLogs, announcements, quizSubmissions, users },
      currentRoleKey,
    ),
    [userRequests, supportRequests, assignments, classes, materials, accessLogs, announcements, quizSubmissions, users, currentRoleKey],
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !readNotificationIds.includes(n.id)).length,
    [notifications, readNotificationIds],
  );

  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      const key = currentAccount ? `smash.notifications.read.${currentAccount.id}` : LS_KEYS.readNotifs;
      saveJson(key, next);
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(prev => {
      const next = Array.from(new Set([...prev, ...allIds]));
      const key = currentAccount ? `smash.notifications.read.${currentAccount.id}` : LS_KEYS.readNotifs;
      saveJson(key, next);
      return next;
    });
  };

  const createAnnouncement = (payload: Omit<Announcement, 'id' | 'createdAt'>) => {
    setAnnouncements(prev => [{
      ...payload,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const pinAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  };

  return (
    <AppContext.Provider
      value={{
        users,
        userRequests,
        classes,
        assignments,
        materials,
        attendanceSessions,
        leaveRequests,
        submitLeaveRequest,
        resolveLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        markAttendance,
        updateAttendanceRecord,
        finalizeAttendanceSession,
        unfinalizeAttendanceSession,
        getAttendanceByClass,
        getAttendanceByStudent,
        addUser,
        updateUser,
        deleteUser,
        approveRequest,
        rejectRequest,
        addClass,
        updateClass,
        deleteClass,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        quizSubmissions,
        submitQuiz,
        getSubmission,
        gradeEntries,
        studentComments,
        addGradeEntry,
        updateGradeEntry,
        deleteGradeEntry,
        saveStudentComment,
        gradeEssaySubmission,
        isAuthenticated,
        currentAccount,
        accountPreferences,
        accountActivities,
        rememberedEmail,
        trustedDevices,
        accessLogs,
        supportRequests,
        rolePermissions,
        accountPermissionOverrides,
        securityPolicy,
        announcements,
        notifications,
        unreadCount,
        readNotificationIds,
        markAsRead,
        markAllAsRead,
        createAnnouncement,
        deleteAnnouncement,
        pinAnnouncement,
        login,
        submitSupportRequest,
        logout,
        registerAccountRequest,
        addTrustedDevice,
        removeTrustedDevice,
        resetUserPassword,
        forgotPasswordRequests,
        submitForgotPasswordRequest,
        checkForgotPasswordRequestStatus,
        approveForgotPasswordRequest,
        rejectForgotPasswordRequest,
        completeForgotPasswordReset,
        updateUserStatus,
        updateAccountPermissions,
        updateSecurityPolicy,
        canAccess,
        updateAccountProfile,
        changePassword,
        updateAccountPreferences,
        switchDemoAccount,
        appendActivity,
        classStudentMap,
        parentChildMap,
        addStudentToClass,
        removeStudentFromClass,
        linkParentToStudent,
        unlinkParentFromStudent,
        // Module 9
        classScheduleSlots,
        examSessions,
        gradeColumnConfigs,
        userNotificationPreferences,
        updateClassSchedule,
        createExamSession,
        updateExamSession,
        updateGradeColumnConfigs,
        updateNotificationPreferences,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
