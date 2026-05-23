# Tài liệu Thiết kế: Missing Features & RBAC

## Tổng quan

Tài liệu này mô tả thiết kế kỹ thuật cho ba nhóm tính năng:
1. **RBAC toàn hệ thống** — Mở rộng PermissionKey, PermissionRoute, Sidebar filtering, ẩn/hiện nút hành động
2. **Làm bài trực tuyến** — OnlineQuizPage tại `/assignments/take/:assignmentId`
3. **Xuất/In bảng điểm** — PrintableGradeReport với `window.print()` và CSS `@media print`

---

## Kiến trúc tổng thể

### Files cần tạo mới
```
src/
├── components/
│   ├── auth/
│   │   └── PermissionRoute.tsx          ← [MỚI] Bảo vệ route theo permission
│   ├── demo/
│   │   └── DemoRoleSwitcher.tsx         ← [MỚI] Widget chuyển đổi role nhanh
│   └── grading/
│       └── PrintableGradeReport.tsx     ← [MỚI] Component in bảng điểm
└── pages/
    └── OnlineQuizPage.tsx               ← [MỚI] Trang làm bài trực tuyến
```

### Files cần sửa đổi
```
src/
├── context/AppContext.tsx               ← Mở rộng PermissionKey, interfaces, demo data
├── App.tsx                              ← Thêm PermissionRoute, route mới
├── components/layout/Sidebar.tsx        ← Lọc menu theo canAccess()
├── pages/AssignmentsPage.tsx            ← Ẩn/hiện nút theo role
├── pages/GradingPage.tsx                ← Thêm nút xuất, ẩn theo permission
├── pages/ClassReportPage.tsx            ← Thêm nút xuất báo cáo
├── pages/MaterialsPage.tsx              ← Ẩn nút upload/xóa với student/parent
├── pages/UserManagementPage.tsx         ← Ẩn nút thêm/xóa/khóa theo permission
├── pages/ClassManagementPage.tsx        ← Ẩn nút tạo/sửa/xóa lớp theo permission
└── pages/AttendancePage.tsx             ← Phân quyền xem vs quản lý điểm danh
```

---

## 1. RBAC — Mở rộng hệ thống phân quyền

### 1.1 Bảng phân quyền (Permission Matrix)

| Permission | owner | manager | admin_staff | admin | teacher | student | parent |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `view_dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage_users` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `manage_devices` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `view_access_logs` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `manage_classes` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `manage_materials` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `view_materials` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage_assignments` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `view_assignments` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `submit_assignment` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `grade_assignments` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `view_own_grades` | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `export_grades` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `manage_attendance` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `view_attendance` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage_security` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

### 1.2 PermissionRoute Component

```tsx
// src/components/auth/PermissionRoute.tsx
interface PermissionRouteProps {
  permission: PermissionKey;
  redirectTo?: string;
  children: ReactElement;
}

export function PermissionRoute({ permission, redirectTo = '/dashboard', children }: PermissionRouteProps) {
  const { canAccess } = useAppContext();
  return canAccess(permission) ? children : <Navigate to={redirectTo} replace />;
}
```

Sử dụng trong App.tsx:
```tsx
<Route path="/users" element={
  <PermissionRoute permission="manage_users">
    <UserManagementPage />
  </PermissionRoute>
} />
<Route path="/assignments/take/:assignmentId" element={
  <PermissionRoute permission="submit_assignment" redirectTo="/assignments">
    <OnlineQuizPage />
  </PermissionRoute>
} />
```

### 1.3 Sidebar RBAC Filtering

Mỗi nav item có thêm trường `requiredPermission?: PermissionKey`:

```ts
const APP_NAV_LINKS = [
  { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/users', label: 'Người dùng', icon: Users, requiredPermission: 'manage_users' },
  {
    label: 'Quản lý lớp học', icon: School,
    requiredPermission: 'manage_classes',
    children: [
      { path: '/classes', label: 'Danh sách lớp' },
      { path: '/classes/schedule', label: 'Thời khóa biểu' },
      { path: '/classes/attendance', label: 'Điểm danh', requiredPermission: 'view_attendance' },
      { path: '/class-report', label: 'Báo cáo lớp học', requiredPermission: 'grade_assignments' },
    ]
  },
  { path: '/materials', label: 'Tài liệu', icon: BookOpen, requiredPermission: 'view_materials' },
  { path: '/assignments', label: 'Bài tập', icon: ClipboardList, requiredPermission: 'view_assignments' },
  { path: '/grading', label: 'Chấm điểm', icon: CheckCircle2, requiredPermission: 'grade_assignments' },
  { path: '/announcements', label: 'Thông báo', icon: Megaphone },
];
```

Logic render trong Sidebar:
```tsx
const visibleLinks = APP_NAV_LINKS.filter(link => {
  if (!link.requiredPermission) return true;
  return canAccess(link.requiredPermission);
});
```

### 1.4 DemoRoleSwitcher

Widget cố định góc dưới phải, chỉ hiển thị khi `import.meta.env.VITE_DEMO_MODE === 'true'`:

```tsx
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@smashmath.edu.vn', color: 'rose' },
  { label: 'Giáo viên', email: 'teacher@smashmath.edu.vn', color: 'slate' },
  { label: 'Học viên', email: 'student@smashmath.edu.vn', color: 'mint' },
  { label: 'Phụ huynh', email: 'parent@smashmath.edu.vn', color: 'mint' },
];
```

AppContext cần thêm action `switchDemoAccount(email: string): void` để cập nhật `currentAccount` trực tiếp mà không cần đăng xuất.

---

## 2. Làm bài trực tuyến — OnlineQuizPage

### 2.1 Mô hình dữ liệu mới

```ts
// Thêm vào AppContext.tsx
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'essay';
  options?: [string, string, string, string]; // A, B, C, D
  correctAnswer?: string; // 'A' | 'B' | 'C' | 'D'
}

export interface QuizSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: Record<string, string>; // questionId → answer
  submittedAt: string; // ISO date
  score?: number;      // 0–10, chỉ có với trắc nghiệm
  maxScore?: number;
}

// Mở rộng Assignment
export interface Assignment {
  // ... các trường hiện có ...
  questions?: QuizQuestion[];
  timeLimit?: number; // phút, 0 = không giới hạn
  deadlineAt?: string; // ISO date (thay thế deadline string)
}
```

### 2.2 Layout OnlineQuizPage

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed)                              │
│  [← Quay lại]  Tên bài tập    [⏱ 14:32]   │
├─────────────────────────────────────────────┤
│ CONTENT (scrollable)                        │
│                                             │
│  Câu 1: [text câu hỏi]                     │
│  ○ A. Lựa chọn A                           │
│  ○ B. Lựa chọn B                           │
│  ○ C. Lựa chọn C                           │
│  ○ D. Lựa chọn D                           │
│                                             │
│  Câu 2: [text câu hỏi]                     │
│  [textarea tự luận]                         │
│                                             │
├─────────────────────────────────────────────┤
│ FOOTER (fixed)                              │
│  Đã trả lời: 3/5  [████░░] [Nộp bài]      │
└─────────────────────────────────────────────┘
```

### 2.3 State management trong OnlineQuizPage

```ts
const [answers, setAnswers] = useState<Record<string, string>>({});
const [timeLeft, setTimeLeft] = useState<number>(assignment.timeLimit * 60); // giây
const [showConfirm, setShowConfirm] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [result, setResult] = useState<QuizSubmission | null>(null);
```

### 2.4 Logic tính điểm trắc nghiệm

```ts
function gradeMultipleChoice(questions: QuizQuestion[], answers: Record<string, string>): number {
  const correct = questions.filter(q =>
    q.type === 'multiple_choice' && answers[q.id] === q.correctAnswer
  ).length;
  return Math.round((correct / questions.length) * 10 * 10) / 10; // thang 10
}
```

### 2.5 Countdown Timer

```ts
useEffect(() => {
  if (!assignment.timeLimit || timeLeft <= 0 || submitted) return;
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) { handleAutoSubmit(); return 0; }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [timeLeft, submitted]);
```

---

## 3. Xuất/In bảng điểm — PrintableGradeReport

### 3.1 Cấu trúc component

```tsx
// src/components/grading/PrintableGradeReport.tsx
interface PrintableGradeReportProps {
  className: string;
  instructor: string;
  students: GradeRow[];
  exportedAt: string;
}

interface GradeRow {
  studentId: string;
  studentName: string;
  scores: { assignmentTitle: string; score: number; maxScore: number }[];
  average: number;
  classification: GradeClassification;
}

type GradeClassification = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' | 'Chưa có điểm';
```

### 3.2 CSS Print Strategy

```css
/* Trong index.css hoặc component style */
@media print {
  body * { visibility: hidden; }
  #printable-area,
  #printable-area * { visibility: visible; }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
```

### 3.3 Hàm phân loại học lực

```ts
export function classifyGrade(average: number | null): GradeClassification {
  if (average === null) return 'Chưa có điểm';
  if (average >= 9.0) return 'Xuất sắc';
  if (average >= 8.0) return 'Giỏi';
  if (average >= 6.5) return 'Khá';
  if (average >= 5.0) return 'Trung bình';
  return 'Yếu';
}
```

---

## Thuộc tính Đúng đắn (Correctness Properties)

### Property 1: PermissionRoute luôn chặn đúng

*Với mọi* `PermissionKey` và `RoleKey`, `PermissionRoute` phải render `children` khi `canAccess()` trả về `true`, và render `<Navigate>` khi `canAccess()` trả về `false`. Không bao giờ render cả hai.

**Validates: Yêu cầu 3.1**

### Property 2: Phân loại học lực bao phủ toàn bộ [0, 10]

*Với mọi* giá trị `average` trong khoảng `[0.0, 10.0]`, hàm `classifyGrade` phải trả về đúng một trong 5 xếp loại (không bao giờ trả về `undefined` hay throw).

**Validates: Yêu cầu 9.1**

### Property 3: Điểm trung bình nằm trong [0, 10]

*Với mọi* mảng điểm thành phần hợp lệ (mỗi điểm trong [0, maxScore]), điểm trung bình tính ra phải nằm trong `[0.0, 10.0]`.

**Validates: Yêu cầu 9.2**

### Property 4: Tính điểm trắc nghiệm nhất quán

*Với mọi* tập câu hỏi và đáp án, `gradeMultipleChoice` phải trả về giá trị trong `[0, 10]`, và nếu tất cả đáp án đúng thì điểm phải là `10`, nếu tất cả sai thì điểm phải là `0`.

**Validates: Yêu cầu 6.9**

### Property 5: submit_assignment chỉ thuộc student

*Với mọi* `RoleKey` khác `'student'`, `canAccess('submit_assignment')` phải trả về `false`.

**Validates: Yêu cầu 1.3**

### Property 6: export_grades không thuộc student/parent

*Với mọi* `RoleKey` trong `['student', 'parent', 'admin_staff']`, `canAccess('export_grades')` phải trả về `false`.

**Validates: Yêu cầu 1.4**

---

## Xử lý lỗi

- `assignmentId` không tồn tại → OnlineQuizPage hiển thị error state + nút quay lại
- Hết giờ → tự động nộp bài với các câu đã trả lời
- Đã nộp bài → hiển thị kết quả, không cho làm lại
- `canAccess()` với `currentAccount = null` → trả về `false` (đã xử lý trong AppContext)
- Bảng điểm rỗng → PrintableGradeReport hiển thị "Chưa có dữ liệu điểm"
