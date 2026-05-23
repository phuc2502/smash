import type { RoleKey } from '../context/AppContext';
import type { AppNotification, Announcement, AnnouncementTarget } from './types';

// Role groups
const ADMIN_ROLES: RoleKey[] = ['owner', 'manager', 'admin', 'admin_staff'];
const TEACHER_ROLES: RoleKey[] = ['teacher'];
const STUDENT_PARENT_ROLES: RoleKey[] = ['student', 'parent'];

function isAdminRole(role: RoleKey) { return ADMIN_ROLES.includes(role); }
function isTeacher(role: RoleKey) { return TEACHER_ROLES.includes(role); }
function isStudentOrParent(role: RoleKey) { return STUDENT_PARENT_ROLES.includes(role); }

function roleToTarget(role: RoleKey): AnnouncementTarget {
  if (role === 'teacher') return 'teacher';
  if (role === 'student') return 'student';
  if (role === 'parent') return 'parent';
  if (role === 'admin_staff') return 'admin_staff';
  return 'all'; // owner/manager → treat as 'all'
}

interface BuildState {
  userRequests: { id: string; requestedAt: string }[];
  supportRequests: { id: string; createdAt: string }[];
  assignments: { id: string; title: string; status: string; isUrgent?: boolean; deadline: string; questions?: { type: string }[] }[];
  classes: { id: string; title: string; studentsCount: number; maxStudents: number; status: string }[];
  materials: { id: string; title: string; updated: string }[];
  accessLogs: { id: string; result: 'success' | 'failed' | 'blocked'; timestamp: string }[];
  announcements: Announcement[];
  quizSubmissions?: { id: string; assignmentId: string; studentId: string; score?: number; submittedAt: string }[];
  users?: { id: string; name: string }[];
}

const PRIORITY_ORDER: Record<string, number> = { action: 0, reminder: 1, info: 2 };

export function buildNotifications(
  state: BuildState,
  roleKey: RoleKey,
): AppNotification[] {
  const now = Date.now();
  const items: AppNotification[] = [];

  // ── ADMIN GROUP ─────────────────────────────────────────────
  if (isAdminRole(roleKey)) {
    // 1. Tài khoản chờ duyệt
    if (state.userRequests.length > 0) {
      items.push({
        id: 'notif-user-requests',
        type: 'user_request',
        priority: 'action',
        title: `${state.userRequests.length} tài khoản chờ duyệt`,
        body: 'Có yêu cầu tạo tài khoản mới cần xét duyệt.',
        createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
        href: '/users',
        meta: { count: state.userRequests.length },
      });
    }

    // 2. Yêu cầu hỗ trợ
    if (state.supportRequests.length > 0) {
      items.push({
        id: 'notif-support-requests',
        type: 'support_request',
        priority: 'action',
        title: `${state.supportRequests.length} yêu cầu hỗ trợ chưa xử lý`,
        body: 'Người dùng đang chờ phản hồi từ hệ thống.',
        createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
        href: '/settings',
        meta: { count: state.supportRequests.length },
      });
    }

    // 3. Cảnh báo bảo mật (failed/blocked trong 24h gần nhất)
    const recentFailedLogs = state.accessLogs.filter(
      (log) =>
        (log.result === 'failed' || log.result === 'blocked') &&
        now - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000,
    );
    if (recentFailedLogs.length > 0) {
      items.push({
        id: 'notif-security',
        type: 'security',
        priority: 'action',
        title: 'Cảnh báo bảo mật',
        body: `${recentFailedLogs.length} lần đăng nhập thất bại trong 24 giờ qua.`,
        createdAt: new Date(now - 1000 * 60 * 2).toISOString(),
        href: '/settings',
        meta: { count: recentFailedLogs.length },
      });
    }

    // 4. Lớp sắp đầy (≥ 80%)
    const nearlyFullClasses = state.classes.filter(
      (c) => c.maxStudents > 0 && c.studentsCount / c.maxStudents >= 0.8,
    );
    if (nearlyFullClasses.length > 0) {
      items.push({
        id: 'notif-class-full',
        type: 'class_full',
        priority: 'reminder',
        title: `${nearlyFullClasses.length} lớp học sắp đầy`,
        body: `${nearlyFullClasses[0].title} đã đạt ${Math.round(nearlyFullClasses[0].studentsCount / nearlyFullClasses[0].maxStudents * 100)}% sĩ số.`,
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
        href: '/classes',
        meta: { count: nearlyFullClasses.length },
      });
    }
  }

  // ── TEACHER GROUP ────────────────────────────────────────────
  if (isTeacher(roleKey)) {
    // 1. Bài chờ chấm điểm
    const pendingGrading = state.assignments.filter((a) => a.status === 'Chờ chấm điểm');
    if (pendingGrading.length > 0) {
      items.push({
        id: 'notif-grading',
        type: 'grading',
        priority: 'action',
        title: `${pendingGrading.length} bài tập chờ chấm điểm`,
        body: `Gồm: ${pendingGrading.map((a) => a.title).slice(0, 2).join(', ')}${pendingGrading.length > 2 ? '...' : ''}`,
        createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
        href: '/grading',
        meta: { count: pendingGrading.length },
      });
    }

    // 1b. Thông báo bài tự luận mới nộp (chưa chấm điểm)
    if (state.quizSubmissions && state.users) {
      // Tìm các bài tập có câu tự luận
      const essayAssignmentIds = new Set(
        state.assignments
          .filter(a => a.questions?.some(q => q.type === 'essay'))
          .map(a => a.id)
      );
      // Lọc bài nộp tự luận chưa chấm điểm
      const ungradedEssaySubmissions = state.quizSubmissions.filter(
        s => essayAssignmentIds.has(s.assignmentId) && s.score === undefined
      );
      if (ungradedEssaySubmissions.length > 0) {
        const latestSub = ungradedEssaySubmissions[0];
        const studentName = state.users.find(u => u.id === latestSub.studentId)?.name ?? 'Học viên';
        const assignmentTitle = state.assignments.find(a => a.id === latestSub.assignmentId)?.title ?? 'Bài tập';
        items.push({
          id: `notif-essay-submission-${ungradedEssaySubmissions.length}`,
          type: 'essay_submission',
          priority: 'action',
          title: `${ungradedEssaySubmissions.length} bài tự luận mới chờ chấm`,
          body: `Học viên ${studentName} đã nộp bài tự luận "${assignmentTitle}". Click để chấm điểm ngay!`,
          createdAt: latestSub.submittedAt,
          href: '/grading',
          meta: { count: ungradedEssaySubmissions.length },
        });
      }
    }

    // 2. Bài tập urgent (sắp hết hạn / quá hạn)
    const urgentAssignments = state.assignments.filter((a) => a.isUrgent && a.status !== 'Chờ chấm điểm');
    if (urgentAssignments.length > 0) {
      items.push({
        id: 'notif-assignment-urgent-teacher',
        type: 'assignment_urgent',
        priority: 'action',
        title: 'Bài tập sắp hết thời hạn',
        body: `"${urgentAssignments[0].title}" đang ở trạng thái khẩn cấp.`,
        createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
        href: '/assignments',
        meta: { count: urgentAssignments.length },
      });
    }

    // 3. Lớp sắp bắt đầu
    const upcomingClasses = state.classes.filter((c) => c.status === 'Sắp bắt đầu');
    if (upcomingClasses.length > 0) {
      items.push({
        id: 'notif-class-change-teacher',
        type: 'class_change',
        priority: 'reminder',
        title: `${upcomingClasses.length} lớp học sắp bắt đầu`,
        body: `${upcomingClasses[0].title} sẽ sớm khai giảng.`,
        createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
        href: '/classes',
        meta: { count: upcomingClasses.length },
      });
    }
  }

  // ── STUDENT / PARENT GROUP ────────────────────────────────────
  if (isStudentOrParent(roleKey)) {
    // 1. Deadline sắp hết (urgent)
    const urgentDeadlines = state.assignments.filter((a) => a.isUrgent);
    if (urgentDeadlines.length > 0) {
      items.push({
        id: 'notif-deadline-urgent',
        type: 'assignment_urgent',
        priority: 'action',
        title: 'Bài tập sắp đến hạn!',
        body: `"${urgentDeadlines[0].title}" — hạn: ${urgentDeadlines[0].deadline}.`,
        createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
        href: '/assignments',
        meta: { count: urgentDeadlines.length },
      });
    }

    // 2. Bài tập mới đang mở
    const openAssignments = state.assignments.filter((a) => a.status === 'Đang mở');
    if (openAssignments.length > 0) {
      items.push({
        id: 'notif-assignment-new',
        type: 'assignment_new',
        priority: 'reminder',
        title: `${openAssignments.length} bài tập mới đang chờ bạn`,
        body: `${openAssignments[0].title}`,
        createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
        href: '/assignments',
        meta: { count: openAssignments.length },
      });
    }

    // 3. Lớp học có thay đổi
    const upcomingClasses = state.classes.filter((c) => c.status === 'Sắp bắt đầu');
    if (upcomingClasses.length > 0) {
      items.push({
        id: 'notif-class-change-student',
        type: 'class_change',
        priority: 'reminder',
        title: 'Cập nhật lịch học',
        body: `${upcomingClasses[0].title} sẽ sớm khai giảng.`,
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        href: '/classes',
        meta: { count: upcomingClasses.length },
      });
    }
  }

  // ── TẤT CẢ: Tài liệu mới ────────────────────────────────────
  const recentMaterials = state.materials.filter(
    (m) => m.updated.includes('ngày') || m.updated.includes('giờ') || m.updated.includes('phút'),
  );
  if (recentMaterials.length > 0) {
    items.push({
      id: 'notif-materials',
      type: 'material',
      priority: 'info',
      title: 'Tài liệu mới được cập nhật',
      body: `${recentMaterials[0].title} vừa được cập nhật.`,
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      href: '/materials',
      meta: { count: recentMaterials.length },
    });
  }

  // ── TẤT CẢ: Announcements (lọc theo target) ─────────────────
  const myTarget = roleToTarget(roleKey);
  const relevantAnnouncements = state.announcements.filter(
    (a) => a.targets.includes('all') || a.targets.includes(myTarget as AnnouncementTarget),
  );
  relevantAnnouncements.forEach((a) => {
    items.push({
      id: `notif-ann-${a.id}`,
      type: 'announcement',
      priority: a.priority,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt,
      href: '/announcements',
      meta: { entityId: a.id },
    });
  });

  // Sort: action → reminder → info, trong cùng priority mới nhất trước
  return items.sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pd !== 0) return pd;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
