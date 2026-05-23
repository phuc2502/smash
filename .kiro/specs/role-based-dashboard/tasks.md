# Kế hoạch Triển khai: Role-Based Dashboard

## Tổng quan

Tái cấu trúc `DashboardPage.tsx` thành dispatcher và tạo ba component dashboard chuyên biệt. Dữ liệu cần thiết phần lớn đã có trong AppContext; chỉ cần cập nhật `CLASS_STUDENT_MAP` để bao gồm `STU-001` và xác nhận các tài khoản demo.

## Tác vụ

- [x] 1. Cập nhật AppContext — dữ liệu demo và mapping
  - Thêm `STU-001` vào `CLASS_STUDENT_MAP` (ít nhất 2 lớp: `MATH-06-01`, `MATH-09-EX`)
  - Xác nhận `PARENT_CHILD_MAP['PAR-001']` đã có dữ liệu
  - Xác nhận 4 tài khoản demo (`admin`, `teacher`, `student`, `parent`) đã tồn tại trong `demoAccounts`
  - Export `CLASS_STUDENT_MAP` và `PARENT_CHILD_MAP` từ AppContext (đã export, kiểm tra lại)
  - _Yêu cầu: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 2. Tạo AdminDashboard component
  - [x] 2.1 Tạo file `src/components/dashboard/AdminDashboard.tsx`
    - Di chuyển toàn bộ JSX và logic hiện tại từ `DashboardPage.tsx` sang file mới
    - Giữ nguyên tất cả import, state, và handlers (modal states, navigate, etc.)
    - _Yêu cầu: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3. Tạo các hàm tiện ích cho dashboard logic
  - [x] 3.1 Tạo file `src/components/dashboard/dashboardUtils.ts`
    - Viết hàm `getRoleKey(roleLabel: string | undefined): RoleKey` — tra cứu ngược từ ROLE_LABELS
    - Viết hàm `normalizeInstructorName(name: string): string` — bỏ tiền tố "Thầy"/"Cô", lowercase, trim
    - Viết hàm `calcAttendanceRate(studentIds: string[], sessions: AttendanceSession[]): number` — tính tỷ lệ chuyên cần, xử lý chia cho 0
    - Viết hàm `getStudentIds(currentAccount: AccountProfile): string[]` — phân nhánh student vs parent
    - Viết hàm `getEnrolledClassIds(studentIds: string[]): string[]` — lọc từ CLASS_STUDENT_MAP
    - _Yêu cầu: 1.2, 1.3, 1.4, 3.2, 4.1, 4.2, 4.4_

  - [x] 3.2 Viết property test cho calcAttendanceRate

    - **Property 3: Tỷ lệ chuyên cần nằm trong khoảng [0, 100]**
    - **Validates: Yêu cầu 4.4**
    - Generate ngẫu nhiên mảng AttendanceRecord (bao gồm mảng rỗng — edge case Property 4)
    - Kiểm tra kết quả luôn trong [0.0, 100.0] và không phải NaN
    - `// Feature: role-based-dashboard, Property 3 & 4: tỷ lệ chuyên cần trong [0,100]`

  - [ ]* 3.3 Viết property test cho getEnrolledClassIds (student)
    - **Property 5: Lớp học của học viên là tập con của CLASS_STUDENT_MAP**
    - **Validates: Yêu cầu 4.1**
    - Generate ngẫu nhiên CLASS_STUDENT_MAP và studentId
    - Kiểm tra mọi classId trả về đều chứa studentId trong mảng giá trị
    - `// Feature: role-based-dashboard, Property 5: lớp học viên là tập con`

  - [ ]* 3.4 Viết property test cho getEnrolledClassIds (parent)
    - **Property 6: Lớp học của phụ huynh là hợp của lớp học các con**
    - **Validates: Yêu cầu 4.2**
    - Generate ngẫu nhiên PARENT_CHILD_MAP và CLASS_STUDENT_MAP
    - Kiểm tra tập lớp của phụ huynh = union của tập lớp từng con
    - `// Feature: role-based-dashboard, Property 6: lớp phụ huynh là hợp lớp con`

  - [ ]* 3.5 Viết property test cho normalizeInstructorName và lọc lớp giáo viên
    - **Property 2: Lớp học của giáo viên là tập con của tất cả lớp**
    - **Validates: Yêu cầu 3.2**
    - Generate ngẫu nhiên danh sách lớp và tên giáo viên (có/không có tiền tố Thầy/Cô)
    - Kiểm tra kết quả lọc là tập con và mọi phần tử đều khớp tên sau chuẩn hóa
    - `// Feature: role-based-dashboard, Property 2: lớp giáo viên là tập con`

- [x] 4. Tạo TeacherDashboard component
  - [x] 4.1 Tạo file `src/components/dashboard/TeacherDashboard.tsx`
    - Import và sử dụng `normalizeInstructorName` từ `dashboardUtils.ts`
    - Lọc `myClasses` từ `classes` dựa trên `currentAccount.name`
    - Tính `myStudentCount` (tổng studentsCount của myClasses)
    - Tính `myPendingGrading` (assignments chờ chấm thuộc myClasses)
    - Render 3 stat cards: số lớp, tổng học viên, bài tập chờ chấm
    - Render danh sách "Lớp học của tôi" với tên lớp, lịch, sĩ số, trạng thái
    - Render danh sách "Bài tập cần chấm" với tên bài, lớp, tiến độ, deadline, badge khẩn cấp
    - Render "Hành động nhanh": Điểm danh, Tạo bài tập, Thêm tài liệu (navigate đến trang tương ứng)
    - Render empty state khi không có lớp nào
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 5. Tạo StudentParentDashboard component
  - [x] 5.1 Tạo file `src/components/dashboard/StudentParentDashboard.tsx`
    - Import `CLASS_STUDENT_MAP`, `PARENT_CHILD_MAP` từ AppContext
    - Import `getStudentIds`, `getEnrolledClassIds`, `calcAttendanceRate` từ `dashboardUtils.ts`
    - Tính `enrolledClassIds` và lọc `enrolledClasses` từ `classes`
    - Tính `attendanceRate` từ `attendanceSessions` và `studentIds`
    - Tính `pendingAssignments` (bài tập chưa hoàn thành thuộc enrolledClasses)
    - Render 3 stat cards: số lớp, tỷ lệ chuyên cần (%), bài tập chưa làm
    - Render danh sách "Lớp học của tôi" với tên lớp, giáo viên, lịch học, trạng thái
    - Render danh sách "Bài tập sắp đến hạn" sắp xếp theo `deadlineAt` tăng dần
    - Render "Lịch học sắp tới" từ trường `schedule` của các lớp đang học
    - Render empty state cho học viên không có lớp (yêu cầu 4.8)
    - Render empty state cho phụ huynh không có con liên kết (yêu cầu 4.9)
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 5.2 Viết property test cho sắp xếp bài tập theo deadline
    - **Property 7: Bài tập sắp đến hạn được sắp xếp tăng dần theo deadline**
    - **Validates: Yêu cầu 4.6**
    - Generate ngẫu nhiên danh sách Assignment với deadlineAt hợp lệ
    - Kiểm tra `deadlineAt[i] <= deadlineAt[i+1]` với mọi i sau khi sắp xếp
    - `// Feature: role-based-dashboard, Property 7: bài tập sắp xếp tăng dần`

- [x] 6. Refactor DashboardPage.tsx thành dispatcher
  - Xóa toàn bộ UI logic khỏi `DashboardPage.tsx`
  - Import `AdminDashboard`, `TeacherDashboard`, `StudentParentDashboard`
  - Import `getRoleKey` từ `dashboardUtils.ts`
  - Định nghĩa `ADMIN_ROLES: RoleKey[]` = `['owner', 'manager', 'admin_staff', 'admin']`
  - Implement logic phân nhánh: admin → AdminDashboard, teacher → TeacherDashboard, còn lại → StudentParentDashboard
  - _Yêu cầu: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 6.1 Viết property test cho DashboardPage dispatcher
    - **Property 1: Dispatcher luôn render đúng component**
    - **Validates: Yêu cầu 1.1, 1.2, 1.3, 1.4, 1.5**
    - Generate ngẫu nhiên role từ tập RoleKey (bao gồm null — edge case 1.5)
    - Kiểm tra đúng một trong ba component được render, không bao giờ render nhiều hơn một
    - `// Feature: role-based-dashboard, Property 1: dispatcher render đúng component`

- [x] 7. Checkpoint — Kiểm tra toàn bộ
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có vấn đề phát sinh.
  - Kiểm tra thủ công: đăng nhập lần lượt bằng 4 tài khoản demo và xác nhận đúng dashboard được hiển thị.

## Ghi chú

- Tác vụ đánh dấu `*` là tùy chọn, có thể bỏ qua để ra MVP nhanh hơn
- Mỗi property test phải chạy tối thiểu 100 lần (cấu hình fast-check: `{ numRuns: 100 }`)
- Thứ tự tác vụ quan trọng: utils (3) phải xong trước Teacher (4) và Student (5)
- `AdminDashboard` (tác vụ 2) có thể làm song song với utils (tác vụ 3)
