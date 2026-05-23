export type NotificationType =
  | 'user_request'    // Admin: tài khoản chờ duyệt
  | 'support_request' // Admin: yêu cầu hỗ trợ mới
  | 'security'        // Admin: đăng nhập thất bại / thiết bị lạ
  | 'class_full'      // Admin: lớp sắp đầy ≥ 80%
  | 'class_change'    // Teacher/Student: thay đổi lịch lớp
  | 'grading'         // Teacher: bài chờ chấm điểm
  | 'essay_submission' // Teacher: học viên nộp bài tự luận mới
  | 'assignment_urgent' // Teacher/Student: deadline sắp hết / quá hạn
  | 'assignment_new'  // Student/Parent: bài tập mới được giao
  | 'material'        // All: tài liệu mới cập nhật
  | 'announcement'    // All: thông báo từ admin/manager
  | 'system';         // All: broadcast hệ thống

export type NotificationPriority = 'action' | 'reminder' | 'info';

export type AnnouncementTarget =
  | 'all'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'admin_staff';

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  createdAt: string; // ISO
  readAt?: string;
  href: string;
  meta?: { entityId?: string; count?: number };
}

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  body: string;
  targets: AnnouncementTarget[];
  priority: NotificationPriority;
  isPinned: boolean;
  createdAt: string; // ISO
}
