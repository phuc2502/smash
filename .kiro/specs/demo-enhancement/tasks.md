# Kế hoạch Triển khai: Demo Enhancement

## Tổng quan

Triển khai 6 nhóm tính năng: mở rộng AppContext (state + actions + persistence), route `/settings` và Sidebar, modal quản lý học viên trong lớp, tab phân quyền trong SettingsPage, expand phụ huynh và search/filter trong UserManagementPage, và ghi nhật ký hoạt động thực tế.

---

## Tác vụ

- [x] 1. Mở rộng AppContext — state, actions, localStorage persistence
  - [x] 1.1 Chuyển `CLASS_STUDENT_MAP` từ `export const` thành state `classStudentMap`
    - Khai báo `const [classStudentMap, setClassStudentMap] = useState<Record<string, string[]>>(() => loadStoredJson('smash.classStudentMap') ?? CLASS_STUDENT_MAP_INITIAL)`
    - Giữ lại dữ liệu demo ban đầu làm `initialData` fallback
    - _Yêu cầu: A1.1, A3.6_
  - [x] 1.2 Chuyển `PARENT_CHILD_MAP` từ `export const` thành state `parentChildMap`
    - Khai báo `const [parentChildMap, setParentChildMap] = useState<Record<string, string[]>>(() => loadStoredJson('smash.parentChildMap') ?? PARENT_CHILD_MAP_INITIAL)`
    - Fallback về `{ 'PAR-001': ['STU-001'] }` nếu localStorage trống
    - _Yêu cầu: A4.1, A3.7_
  - [x] 1.3 Thêm action `addStudentToClass(classId, studentId)`
    - Bỏ qua nếu `studentId` đã tồn tại trong mảng
    - Cập nhật `classStudentMap` và tăng `studentsCount` của lớp lên 1
    - _Yêu cầu: A1.3, A1.4, A1.5_
  - [x] 1.4 Thêm action `removeStudentFromClass(classId, studentId)`
    - Bỏ qua nếu `studentId` không tồn tại trong mảng
    - Cập nhật `classStudentMap` và giảm `studentsCount` xuống 1 (không nhỏ hơn 0)
    - _Yêu cầu: A1.6, A1.7, A1.8_
  - [x] 1.5 Thêm action `linkParentToStudent(parentId, studentId)`
    - Bỏ qua nếu cặp (parentId, studentId) đã tồn tại
    - Thêm `studentId` vào mảng `parentChildMap[parentId]`
    - _Yêu cầu: A4.2, A4.3, A4.4_
  - [x] 1.6 Thêm action `unlinkParentFromStudent(parentId, studentId)`
    - Xóa `studentId` khỏi mảng `parentChildMap[parentId]`
    - _Yêu cầu: A4.5, A4.6_
  - [x] 1.7 Thêm `useEffect` persist cho 7 keys localStorage
    - `smash.users` → state `users`
    - `smash.classes` → state `classes`
    - `smash.assignments` → state `assignments`
    - `smash.attendanceSessions` → state `attendanceSessions`
    - `smash.gradeEntries` → state `gradeEntries`
    - `smash.classStudentMap` → state `classStudentMap`
    - `smash.parentChildMap` → state `parentChildMap`
    - Mỗi `useEffect` có dependency là state tương ứng, gọi `saveJson(key, value)`
    - _Yêu cầu: A3.1–A3.10_
  - [x] 1.8 Khởi tạo các state hiện có từ localStorage
    - `users`, `classes`, `assignments`, `attendanceSessions`, `gradeEntries` đọc từ localStorage bằng `loadStoredJson`, fallback về `initialData` tương ứng
    - _Yêu cầu: A3.8, A3.9_
  - [x] 1.9 Cập nhật `AttendancePage` và `GradingPage` đọc `parentChildMap` từ context thay vì static const
    - Xóa import `PARENT_CHILD_MAP` static, dùng `parentChildMap` từ `useAppContext()`
    - _Yêu cầu: A4.11, A4.12_

- [x] 2. Đăng ký route `/settings` và thêm nav item Cài đặt vào Sidebar
  - [x] 2.1 Thêm route `/settings` vào `App.tsx`
    - Import `SettingsPage` và thêm `<Route path="/settings" element={<SettingsPage />} />`
    - _Yêu cầu: A2.1_
  - [x] 2.2 Thêm mục "Cài đặt" vào `Sidebar.tsx` (hoặc NavMenu)
    - Link dẫn đến `/settings`, icon phù hợp (ví dụ: `Settings` từ lucide-react)
    - Hiển thị cho tất cả user đã đăng nhập, không yêu cầu permission đặc biệt
    - _Yêu cầu: A2.2_

- [x] 3. Tạo `ManageStudentsModal` và tích hợp vào ClassManagementPage
  - [x] 3.1 Tạo file `src/components/modals/ManageStudentsModal.tsx`
    - Props: `classId: string`, `className: string`, `isOpen: boolean`, `onClose: () => void`
    - Hiển thị danh sách tên học viên hiện đang thuộc lớp (đọc từ `classStudentMap[classId]`, map sang tên user)
    - Mỗi học viên có nút xóa, gọi `removeStudentFromClass` khi nhấn
    - Dropdown/select chứa tất cả users có role "Học viên" chưa thuộc lớp
    - Nút "Thêm" gọi `addStudentToClass` với học viên được chọn
    - _Yêu cầu: A1.11, A1.12, A1.13, A1.14_
  - [x] 3.2 Thêm nút "Quản lý học viên" vào card lớp trong `ClassManagementPage.tsx`
    - State `selectedClassId` để theo dõi lớp đang mở modal
    - Khi nhấn nút, set `selectedClassId` và mở `ManageStudentsModal`
    - _Yêu cầu: A1.9, A1.10_

- [ ] 4. Thêm section "Phân quyền tài khoản" vào SettingsPage
  - [x] 4.1 Thêm section phân quyền vào `SettingsPage.tsx`
    - Chỉ render khi `canAccess('manage_users')` trả về `true`
    - Dropdown chọn user từ danh sách tất cả users trong hệ thống
    - _Yêu cầu: A2.3, A2.4, A2.9_
  - [x] 4.2 Hiển thị role và danh sách checkbox permissions khi chọn user
    - Hiển thị role hiện tại của user được chọn
    - Liệt kê tất cả `PermissionKey` dưới dạng checkbox
    - Đánh dấu checked các permission đang có trong `accountPermissionOverrides[userId]`
    - _Yêu cầu: A2.5, A2.6_
  - [x] 4.3 Nút "Lưu phân quyền" gọi `updateAccountPermissions` và `appendActivity`
    - Gọi `updateAccountPermissions(userId, selectedPermissions[])`
    - Gọi `appendActivity()` với title, description, tone phù hợp
    - _Yêu cầu: A2.7, A2.8, B1.5_

- [x] 5. Hoàn thiện UserManagementPage — search/filter và expand phụ huynh
  - [x] 5.1 Kết nối logic search/filter thực trong `UserManagementPage.tsx`
    - Thêm local state `searchText` và `roleFilter`
    - Lọc `users` theo `searchText` (tên hoặc email, không phân biệt hoa thường) và `roleFilter`
    - Khi cả hai điều kiện được áp dụng, hiển thị user thỏa mãn cả hai
    - Hiển thị thông báo "Không tìm thấy người dùng phù hợp" khi kết quả rỗng
    - _Yêu cầu: B2.1, B2.2, B2.3, B2.4, B2.5, B2.6, B2.7, B2.8_
  - [x] 5.2 Thêm expand row cho user có role "Phụ huynh"
    - State `expandedParentId` để theo dõi row đang mở
    - Khi expand, hiển thị danh sách tên học sinh liên kết từ `parentChildMap[parentId]`
    - _Yêu cầu: A4.7_
  - [x] 5.3 Thêm UI liên kết/hủy liên kết phụ huynh-học sinh trong expanded row
    - Dropdown/select chứa users có role "Học viên", nút "Liên kết con em"
    - Khi xác nhận, gọi `linkParentToStudent` và cập nhật hiển thị ngay
    - Nút hủy liên kết bên cạnh mỗi học sinh, gọi `unlinkParentFromStudent`
    - _Yêu cầu: A4.8, A4.9, A4.10_

- [x] 6. Thêm Activity Logs vào các trang
  - [x] 6.1 Thêm `appendActivity()` vào `AttendancePage.tsx`
    - Gọi sau khi lưu phiên điểm danh thành công
    - Tham số: `title` mô tả lớp vừa điểm danh, `description` chi tiết, `tone` phù hợp
    - _Yêu cầu: B1.1, B1.6_
  - [x] 6.2 Thêm `appendActivity()` vào `GradingPage.tsx`
    - Gọi sau khi nhập hoặc sửa điểm học viên thành công
    - Tham số: `title` mô tả tên học viên vừa chấm điểm, `description` chi tiết, `tone` phù hợp
    - _Yêu cầu: B1.2, B1.6_
  - [x] 6.3 Thêm `appendActivity()` vào `ClassManagementPage.tsx`
    - Gọi sau khi thêm học viên vào lớp thành công qua modal
    - Tham số: `title` mô tả tên học viên và tên lớp, `description` chi tiết, `tone` phù hợp
    - _Yêu cầu: B1.3, B1.6_
  - [x] 6.4 Thêm `appendActivity()` vào `UserManagementPage.tsx`
    - Gọi sau khi tạo liên kết phụ huynh-học sinh thành công
    - Tham số: `title` mô tả tên học sinh được liên kết, `description` chi tiết, `tone` phù hợp
    - _Yêu cầu: B1.4, B1.6_

- [x] 7. Checkpoint — Đảm bảo tất cả tính năng hoạt động đúng
  - Kiểm tra persist: thêm học viên vào lớp → reload trang → dữ liệu vẫn còn
  - Kiểm tra modal xếp lớp: thêm/xóa học viên, danh sách điểm danh và chấm điểm cập nhật đúng
  - Kiểm tra phân quyền: user không có `manage_users` không thấy section phân quyền trong Settings
  - Kiểm tra search/filter: tìm kiếm theo tên, email, lọc theo role, kết hợp cả hai
  - Kiểm tra expand phụ huynh: liên kết/hủy liên kết học sinh hoạt động đúng
  - Kiểm tra activity log: các hành động ghi log đúng nội dung

## Ghi chú

- Tác vụ 1 (AppContext) phải hoàn thành trước tất cả tác vụ còn lại
- Tác vụ 2 (Route + Sidebar) phải xong trước tác vụ 4 (SettingsPage)
- Tác vụ 3, 4, 5 có thể làm song song sau khi tác vụ 1 và 2 xong
- Tác vụ 6 (Activity Logs) nên làm sau khi các trang tương ứng đã hoàn thiện logic chính

