# Tài liệu Thiết kế: Role-Based Dashboard

## Tổng quan

Tính năng này tái cấu trúc `DashboardPage.tsx` thành một component điều phối (dispatcher) thuần túy, đồng thời tạo ba component dashboard chuyên biệt: `AdminDashboard`, `TeacherDashboard`, và `StudentParentDashboard`. Mỗi component đọc dữ liệu từ `AppContext` và lọc/tính toán thông tin phù hợp với vai trò của `currentAccount`.

Toàn bộ dữ liệu cần thiết (CLASS_STUDENT_MAP, PARENT_CHILD_MAP, attendanceSessions, demo accounts) đã tồn tại trong `AppContext.tsx`. Không cần thêm API mới hay thay đổi cấu trúc dữ liệu lớn — chỉ cần expose thêm các hằng số và thêm dữ liệu demo cho student/parent.

---

## Kiến trúc

```
src/
├── pages/
│   └── DashboardPage.tsx          ← [SỬA] Dispatcher thuần túy
└── components/
    └── dashboard/
        ├── AdminDashboard.tsx     ← [MỚI] Toàn bộ UI hiện tại của DashboardPage
        ├── TeacherDashboard.tsx   ← [MỚI] Dashboard giáo viên
        └── StudentParentDashboard.tsx ← [MỚI] Dashboard học viên/phụ huynh
```

### Luồng dữ liệu

```
AppContext (users, classes, assignments, attendanceSessions,
           CLASS_STUDENT_MAP, PARENT_CHILD_MAP, currentAccount)
        │
        ▼
DashboardPage.tsx
  ├── currentAccount.role ∈ {owner, manager, admin_staff, admin}
  │       └──► AdminDashboard (dùng stats toàn hệ thống)
  ├── currentAccount.role === 'teacher'
  │       └──► TeacherDashboard (filter theo instructor name)
  └── currentAccount.role ∈ {student, parent}
          └──► StudentParentDashboard (filter theo CLASS_STUDENT_MAP / PARENT_CHILD_MAP)
```

---

## Các Component và Giao diện

### 1. `DashboardPage.tsx` (Dispatcher)

Trách nhiệm duy nhất: đọc `currentAccount.role` và render đúng dashboard.

```tsx
const ADMIN_ROLES: RoleKey[] = ['owner', 'manager', 'admin_staff', 'admin'];

export default function DashboardPage() {
  const { currentAccount } = useAppContext();
  const roleKey = getRoleKey(currentAccount?.role);

  if (ADMIN_ROLES.includes(roleKey)) return <AdminDashboard />;
  if (roleKey === 'teacher') return <TeacherDashboard />;
  return <StudentParentDashboard />;
}
```

Hàm `getRoleKey(roleLabel: string | undefined): RoleKey` tra cứu ngược từ `ROLE_LABELS` để chuyển nhãn tiếng Việt sang RoleKey.

### 2. `AdminDashboard.tsx`

Chứa toàn bộ UI hiện tại của `DashboardPage.tsx` (move, không rewrite). Sử dụng:
- `stats` từ AppContext (totalUsers, totalTeachers, activeClasses, pendingGrading, pendingRequests)
- `users`, `assignments`, `materials`, `classes` để tạo recentActivities và pendingTasks
- Modal: `CreateClassModal`, `CreateUserModal`, `ApproveUsersModal`

### 3. `TeacherDashboard.tsx`

**Dữ liệu đầu vào:** `currentAccount`, `classes`, `assignments`, `attendanceSessions`

**Logic lọc lớp học:**
```ts
// Chuẩn hóa tên: bỏ tiền tố "Thầy "/"Cô ", lowercase
function normalizeInstructorName(name: string): string {
  return name.replace(/^(thầy|cô)\s+/i, '').toLowerCase().trim();
}

const myClasses = classes.filter(cls =>
  normalizeInstructorName(cls.instructor) === normalizeInstructorName(currentAccount.name)
);
```

**Thống kê cá nhân:**
- `myClassCount` = `myClasses.length`
- `myStudentCount` = tổng `studentsCount` của các lớp trong `myClasses`
- `myPendingGrading` = số `assignments` có `status === 'Chờ chấm điểm'` và `classId` thuộc `myClasses`

**Sections hiển thị:**
- Stat cards (3 thẻ)
- Danh sách lớp học (MyClassList)
- Bài tập cần chấm (PendingGradingList)
- Hành động nhanh (QuickActions): Điểm danh, Tạo bài tập, Thêm tài liệu

### 4. `StudentParentDashboard.tsx`

**Dữ liệu đầu vào:** `currentAccount`, `classes`, `assignments`, `attendanceSessions`, `CLASS_STUDENT_MAP`, `PARENT_CHILD_MAP`

**Logic lấy danh sách lớp:**
```ts
function getStudentIds(currentAccount: AccountProfile): string[] {
  if (currentAccount.role === ROLE_LABELS.student) {
    return [currentAccount.id];
  }
  if (currentAccount.role === ROLE_LABELS.parent) {
    return PARENT_CHILD_MAP[currentAccount.id] ?? [];
  }
  return [];
}

function getEnrolledClassIds(studentIds: string[]): string[] {
  return Object.entries(CLASS_STUDENT_MAP)
    .filter(([, students]) => students.some(id => studentIds.includes(id)))
    .map(([classId]) => classId);
}
```

**Tính tỷ lệ chuyên cần:**
```ts
function calcAttendanceRate(
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
```

**Sections hiển thị:**
- Stat cards (3 thẻ: số lớp, tỷ lệ chuyên cần, bài tập chưa làm)
- Danh sách lớp đang học (EnrolledClassList)
- Bài tập sắp đến hạn (UpcomingAssignments) — sắp xếp theo `deadlineAt` tăng dần
- Lịch học sắp tới (UpcomingSchedule) — parse từ `schedule` string của các lớp

---

## Mô hình Dữ liệu

### Dữ liệu đã có trong AppContext (không cần thêm)

```ts
// Đã export từ AppContext.tsx
export const CLASS_STUDENT_MAP: Record<string, string[]>;
export const PARENT_CHILD_MAP: Record<string, string[]>;

// Đã có trong AppContextType
attendanceSessions: AttendanceSession[];
```

### Cập nhật CLASS_STUDENT_MAP cho STU-001

Tài khoản demo `student@smashmath.edu.vn` có id `STU-001`. Cần thêm `STU-001` vào ít nhất một lớp trong `CLASS_STUDENT_MAP`:

```ts
export const CLASS_STUDENT_MAP: Record<string, string[]> = {
  'MATH-06-01': ['STU-001', 'ST-2023-084', 'ST-2023-201', ...],
  'MATH-07-02': ['ST-2023-084', 'ST-2023-205', ...],
  'MATH-09-EX': ['STU-001', 'ST-2023-201', ...],
};
```

### Tài khoản demo (đã có, cần xác nhận)

Các tài khoản sau đã được định nghĩa trong `demoAccounts` của AppContext:

| Email | Role | ID |
|---|---|---|
| `admin@smashmath.edu.vn` | Admin | ADM-001 |
| `teacher@smashmath.edu.vn` | Giáo viên | TCH-109 |
| `student@smashmath.edu.vn` | Học viên | STU-001 |
| `parent@smashmath.edu.vn` | Phụ huynh | PAR-001 |

`PARENT_CHILD_MAP['PAR-001']` đã ánh xạ sang `['ST-2023-084', 'ST-2023-201']`.

### Kiểu dữ liệu bổ sung (nếu cần GradeRecord trong tương lai)

Hiện tại dashboard chỉ hiển thị tiến độ nộp bài (`progress/total`) từ `Assignment`. Nếu cần hiển thị điểm số thực tế, sẽ cần thêm:

```ts
export interface GradeRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;       // 0–10
  maxScore: number;
  gradedAt: string;    // ISO date
  gradedBy: string;    // teacherId
  comment?: string;
}
```

Tuy nhiên, trong phạm vi tính năng này, `GradeRecord` là **tùy chọn** — dashboard học viên sẽ hiển thị tiến độ bài tập thay vì điểm số chi tiết.

---

## Thuộc tính Đúng đắn (Correctness Properties)

*Một thuộc tính (property) là đặc điểm hoặc hành vi phải đúng trong mọi lần thực thi hợp lệ của hệ thống — về cơ bản là một phát biểu hình thức về những gì hệ thống phải làm. Các thuộc tính đóng vai trò cầu nối giữa đặc tả dạng văn bản và đảm bảo đúng đắn có thể kiểm chứng tự động.*

### Property 1: Dispatcher luôn render đúng component

*Với mọi* giá trị `role` hợp lệ của `currentAccount`, `DashboardPage` phải render đúng một trong ba component (`AdminDashboard`, `TeacherDashboard`, `StudentParentDashboard`) và không bao giờ render nhiều hơn một component cùng lúc.

**Validates: Yêu cầu 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Lớp học của giáo viên là tập con của tất cả lớp

*Với mọi* tập hợp lớp học và tên giáo viên, danh sách lớp được lọc trong `TeacherDashboard` phải là tập con của toàn bộ danh sách lớp (`myClasses.length <= classes.length`), và mọi lớp trong kết quả phải có `instructor` khớp với tên giáo viên sau khi chuẩn hóa.

**Validates: Yêu cầu 3.2**

### Property 3: Tỷ lệ chuyên cần nằm trong khoảng [0, 100]

*Với mọi* tập hợp `AttendanceRecord` hợp lệ, hàm `calcAttendanceRate` phải trả về giá trị trong khoảng `[0.0, 100.0]`.

**Validates: Yêu cầu 4.4**

### Property 4: Tỷ lệ chuyên cần khi không có buổi học là 0

*Với mọi* học viên không có bản ghi điểm danh nào, `calcAttendanceRate` phải trả về `0` (không phải NaN hay lỗi chia cho 0).

**Validates: Yêu cầu 4.4** *(edge case)*

### Property 5: Lớp học của học viên là tập con của CLASS_STUDENT_MAP

*Với mọi* `studentId`, danh sách `classId` trả về bởi `getEnrolledClassIds` phải là tập con của các key trong `CLASS_STUDENT_MAP`, và mọi lớp trong kết quả phải thực sự chứa `studentId` đó trong mảng giá trị.

**Validates: Yêu cầu 4.1**

### Property 6: Lớp học của phụ huynh là hợp của lớp học các con

*Với mọi* `parentId` có trong `PARENT_CHILD_MAP`, tập hợp lớp học hiển thị trong `StudentParentDashboard` (chế độ phụ huynh) phải bằng hợp của tập lớp học của từng con.

**Validates: Yêu cầu 4.2**

### Property 7: Bài tập sắp đến hạn được sắp xếp tăng dần theo deadline

*Với mọi* danh sách bài tập có `deadlineAt` hợp lệ, danh sách "Bài tập sắp đến hạn" trong `StudentParentDashboard` phải được sắp xếp sao cho `deadlineAt[i] <= deadlineAt[i+1]` với mọi `i`.

**Validates: Yêu cầu 4.6**

---

## Xử lý Lỗi

- **currentAccount null**: `DashboardPage` fallback về `AdminDashboard` (yêu cầu 1.5). Trong thực tế, route đã được bảo vệ bởi `PrivateRoute` nên trường hợp này hiếm xảy ra.
- **Giáo viên không có lớp nào**: `TeacherDashboard` hiển thị empty state với thông báo "Bạn chưa được phân công lớp nào" (yêu cầu 3.7).
- **Học viên không có lớp nào**: `StudentParentDashboard` hiển thị empty state với gợi ý liên hệ trung tâm (yêu cầu 4.8).
- **Phụ huynh không có con trong hệ thống**: `StudentParentDashboard` hiển thị thông báo "Chưa có học viên được liên kết" (yêu cầu 4.9).
- **Chia cho 0 trong tỷ lệ chuyên cần**: Hàm `calcAttendanceRate` kiểm tra `relevantRecords.length === 0` trước khi chia, trả về `0`.
- **Instructor name không khớp**: Nếu không có lớp nào khớp tên giáo viên, `TeacherDashboard` hiển thị empty state (không crash).

---

## Chiến lược Kiểm thử

### Kiểm thử đơn vị (Unit Tests)

Tập trung vào các hàm logic thuần túy:

- `normalizeInstructorName(name)`: kiểm tra bỏ tiền tố "Thầy"/"Cô", lowercase, trim
- `calcAttendanceRate(studentIds, sessions)`: kiểm tra các trường hợp biên (0 buổi, 100% có mặt, 0% có mặt)
- `getStudentIds(currentAccount)`: kiểm tra phân nhánh student vs parent
- `getEnrolledClassIds(studentIds)`: kiểm tra lọc đúng từ CLASS_STUDENT_MAP
- `getRoleKey(roleLabel)`: kiểm tra tra cứu ngược ROLE_LABELS

### Kiểm thử thuộc tính (Property-Based Tests)

Sử dụng thư viện **fast-check** (đã phổ biến trong hệ sinh thái TypeScript/Vite).

Cấu hình: tối thiểu 100 lần chạy mỗi property test.

Mỗi property test phải có comment tham chiếu:
```ts
// Feature: role-based-dashboard, Property N: <mô tả thuộc tính>
```

**Property tests cần triển khai:**

1. **Property 1** — Dispatcher render đúng component: Generate ngẫu nhiên `role` từ tập hợp RoleKey, kiểm tra component được render.
2. **Property 2** — Lớp giáo viên là tập con: Generate ngẫu nhiên danh sách lớp và tên giáo viên, kiểm tra kết quả lọc.
3. **Property 3 & 4** — Tỷ lệ chuyên cần trong [0, 100]: Generate ngẫu nhiên mảng AttendanceRecord (bao gồm mảng rỗng), kiểm tra kết quả.
4. **Property 5** — Lớp học viên là tập con: Generate ngẫu nhiên CLASS_STUDENT_MAP và studentId, kiểm tra kết quả.
5. **Property 6** — Lớp phụ huynh là hợp của lớp con: Generate ngẫu nhiên PARENT_CHILD_MAP và CLASS_STUDENT_MAP, kiểm tra tính đúng đắn.
6. **Property 7** — Bài tập sắp xếp tăng dần: Generate ngẫu nhiên danh sách Assignment với deadlineAt, kiểm tra thứ tự sau khi sắp xếp.

### Kiểm thử tích hợp (Integration Tests)

- Render `DashboardPage` với từng `currentAccount` mock, kiểm tra component con được mount.
- Kiểm tra `TeacherDashboard` chỉ hiển thị lớp của giáo viên đang đăng nhập.
- Kiểm tra `StudentParentDashboard` hiển thị đúng lớp theo `CLASS_STUDENT_MAP`.
