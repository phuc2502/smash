# Tài liệu Yêu cầu

## Giới thiệu

Tính năng **Role-Based Dashboard** tùy biến giao diện trang chủ (`DashboardPage.tsx`) của ứng dụng SMASH Math Center dựa trên vai trò (`role`) của tài khoản đang đăng nhập. Thay vì hiển thị một dashboard duy nhất cho tất cả người dùng, hệ thống sẽ phân nhánh sang ba giao diện riêng biệt: Admin/Quản lý, Giáo viên, và Học viên/Phụ huynh — mỗi giao diện chỉ hiển thị thông tin phù hợp và hành động cần thiết cho từng đối tượng.

## Bảng chú giải

- **Dashboard**: Trang tổng quan hiển thị sau khi đăng nhập thành công.
- **DashboardPage**: Component điều phối (`src/pages/DashboardPage.tsx`) quyết định dashboard nào được render.
- **AdminDashboard**: Giao diện dashboard dành cho vai trò Admin, Quản lý, Chủ trung tâm, Nhân viên hành chính.
- **TeacherDashboard**: Giao diện dashboard dành cho vai trò Giáo viên.
- **StudentParentDashboard**: Giao diện dashboard dành cho vai trò Học viên và Phụ huynh.
- **AppContext**: React Context cung cấp toàn bộ dữ liệu và trạng thái ứng dụng.
- **currentAccount**: Đối tượng `AccountProfile` trong AppContext đại diện cho tài khoản đang đăng nhập.
- **CLASS_STUDENT_MAP**: Bản đồ ánh xạ `classId → string[]` (danh sách studentId) đã có trong AppContext.
- **PARENT_CHILD_MAP**: Bản đồ ánh xạ `parentId → string[]` (danh sách studentId con) đã có trong AppContext.
- **AttendanceSession**: Bản ghi buổi điểm danh của một lớp, chứa mảng `records` chi tiết từng học viên.
- **AttendanceRecord**: Bản ghi điểm danh của một học viên trong một buổi học cụ thể.
- **Assignment**: Bài tập/kiểm tra được giao cho một lớp học.
- **GradeRecord**: Bản ghi điểm số của một học viên cho một bài tập/kiểm tra.
- **RoleKey**: Kiểu union `'owner' | 'manager' | 'admin_staff' | 'admin' | 'teacher' | 'student' | 'parent'`.
- **Nhóm Admin**: Bao gồm các vai trò `owner`, `manager`, `admin_staff`, `admin`.
- **Nhóm Giáo viên**: Vai trò `teacher`.
- **Nhóm Học viên/Phụ huynh**: Vai trò `student` và `parent`.

---

## Yêu cầu

### Yêu cầu 1: Điều phối Dashboard theo vai trò

**User Story:** Là một người dùng đã đăng nhập, tôi muốn thấy trang tổng quan phù hợp với vai trò của mình, để tôi không bị phân tâm bởi thông tin không liên quan.

#### Tiêu chí chấp nhận

1. WHEN người dùng truy cập trang Dashboard, THE DashboardPage SHALL kiểm tra `currentAccount.role` và render đúng component tương ứng với vai trò đó.
2. WHEN `currentAccount.role` thuộc Nhóm Admin (`owner`, `manager`, `admin_staff`, `admin`), THE DashboardPage SHALL render `AdminDashboard`.
3. WHEN `currentAccount.role` là `teacher` (Giáo viên), THE DashboardPage SHALL render `TeacherDashboard`.
4. WHEN `currentAccount.role` là `student` (Học viên) hoặc `parent` (Phụ huynh), THE DashboardPage SHALL render `StudentParentDashboard`.
5. IF `currentAccount` là null hoặc không xác định được role, THEN THE DashboardPage SHALL render `AdminDashboard` như fallback mặc định.

---

### Yêu cầu 2: Admin Dashboard — Thống kê toàn hệ thống

**User Story:** Là một Admin/Quản lý, tôi muốn xem thống kê tổng quan toàn hệ thống, để tôi có thể nắm bắt tình trạng hoạt động của trung tâm.

#### Tiêu chí chấp nhận

1. THE AdminDashboard SHALL hiển thị 4 thẻ thống kê: tổng số học viên, tổng số giáo viên, số lớp đang diễn ra, và số bài tập chờ chấm toàn hệ thống.
2. WHEN người dùng nhấp vào một thẻ thống kê, THE AdminDashboard SHALL điều hướng đến trang tương ứng (ví dụ: `/users?role=Học viên`).
3. THE AdminDashboard SHALL hiển thị biểu đồ cột thể hiện tỷ lệ lấp đầy học sinh (studentsCount / maxStudents) cho từng lớp học.
4. THE AdminDashboard SHALL hiển thị danh sách hoạt động hệ thống gần đây (tài khoản mới, bài tập cần chấm, tài liệu cập nhật).
5. THE AdminDashboard SHALL hiển thị khu vực "Điều phối nhanh" với các nút: Duyệt yêu cầu, Mở lớp mới, Cấp tài liệu, Gửi thông báo.
6. THE AdminDashboard SHALL hiển thị danh sách "Hành động ưu tiên" bao gồm bài tập chờ chấm và lớp học thiếu học viên.
7. WHEN có yêu cầu đăng ký tài khoản đang chờ duyệt, THE AdminDashboard SHALL hiển thị badge số lượng trên nút "Duyệt yêu cầu".

---

### Yêu cầu 3: Teacher Dashboard — Tổng quan lớp học cá nhân

**User Story:** Là một Giáo viên, tôi muốn xem tổng quan về các lớp tôi đang phụ trách và các bài tập cần chấm, để tôi có thể quản lý công việc giảng dạy hiệu quả.

#### Tiêu chí chấp nhận

1. THE TeacherDashboard SHALL hiển thị 3 thẻ thống kê cá nhân: số lớp đang phụ trách, tổng số học viên trong các lớp đó, và số bài tập chờ chấm thuộc các lớp của giáo viên này.
2. WHEN tính thống kê, THE TeacherDashboard SHALL chỉ tính các lớp có `instructor` khớp với tên của `currentAccount` (so sánh không phân biệt hoa thường, bỏ tiền tố "Thầy"/"Cô").
3. THE TeacherDashboard SHALL hiển thị danh sách "Lớp học của tôi" với thông tin: tên lớp, lịch học, sĩ số (studentsCount/maxStudents), trạng thái lớp.
4. THE TeacherDashboard SHALL hiển thị danh sách "Bài tập cần chấm" với thông tin: tên bài tập, tên lớp, tiến độ nộp bài (progress/total), deadline.
5. WHEN một bài tập có `isUrgent = true` hoặc deadline đã qua, THE TeacherDashboard SHALL đánh dấu bài tập đó bằng chỉ báo khẩn cấp.
6. THE TeacherDashboard SHALL hiển thị khu vực "Hành động nhanh" với các nút: Điểm danh nhanh, Tạo bài tập mới, Thêm tài liệu.
7. WHEN giáo viên không phụ trách lớp nào, THE TeacherDashboard SHALL hiển thị thông báo trống phù hợp thay vì danh sách rỗng.

---

### Yêu cầu 4: Student/Parent Dashboard — Theo dõi học tập cá nhân

**User Story:** Là một Học viên hoặc Phụ huynh, tôi muốn xem thông tin học tập của bản thân (hoặc của con), để tôi có thể theo dõi tiến độ và lịch học.

#### Tiêu chí chấp nhận

1. WHEN `currentAccount.role` là `student`, THE StudentParentDashboard SHALL lấy danh sách lớp học bằng cách tra cứu `CLASS_STUDENT_MAP` với `currentAccount.id`.
2. WHEN `currentAccount.role` là `parent`, THE StudentParentDashboard SHALL lấy danh sách studentId con từ `PARENT_CHILD_MAP[currentAccount.id]`, sau đó tổng hợp tất cả lớp học của các con đó.
3. THE StudentParentDashboard SHALL hiển thị 3 thẻ thống kê: số lớp đang tham gia, tỷ lệ chuyên cần (%), số bài tập chưa hoàn thành.
4. WHEN tính tỷ lệ chuyên cần, THE StudentParentDashboard SHALL tính bằng công thức: `(tổng số buổi present + late) / tổng số buổi có mặt trong attendanceSessions × 100`, làm tròn đến 1 chữ số thập phân.
5. THE StudentParentDashboard SHALL hiển thị danh sách "Lớp học của tôi" với thông tin: tên lớp, tên giáo viên phụ trách, lịch học, trạng thái lớp.
6. THE StudentParentDashboard SHALL hiển thị danh sách "Bài tập sắp đến hạn" bao gồm các bài tập thuộc lớp của học viên có deadline trong tương lai, sắp xếp theo deadline tăng dần.
7. THE StudentParentDashboard SHALL hiển thị "Lịch học sắp tới" dựa trên lịch học (`schedule`) của các lớp đang tham gia.
8. WHEN học viên không tham gia lớp nào, THE StudentParentDashboard SHALL hiển thị thông báo trống và gợi ý liên hệ trung tâm.
9. WHEN `currentAccount.role` là `parent` và không có dữ liệu con trong `PARENT_CHILD_MAP`, THE StudentParentDashboard SHALL hiển thị thông báo chưa có học viên được liên kết.

---

### Yêu cầu 5: Dữ liệu demo đầy đủ cho kiểm thử

**User Story:** Là một developer, tôi muốn có đủ tài khoản demo và dữ liệu mẫu cho tất cả các vai trò, để tôi có thể kiểm thử từng dashboard một cách độc lập.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL cung cấp tài khoản demo cho vai trò `student` với email `student@smashmath.edu.vn` và mật khẩu `Smash@123`.
2. THE AppContext SHALL cung cấp tài khoản demo cho vai trò `parent` với email `parent@smashmath.edu.vn` và mật khẩu `Smash@123`.
3. THE AppContext SHALL cung cấp tài khoản demo cho vai trò `teacher` với email `teacher@smashmath.edu.vn` và mật khẩu `Smash@123`.
4. WHEN đăng nhập bằng tài khoản `student@smashmath.edu.vn`, THE AppContext SHALL trả về `currentAccount` với `id = 'STU-001'` và `role = 'Học viên'`.
5. WHEN đăng nhập bằng tài khoản `parent@smashmath.edu.vn`, THE AppContext SHALL trả về `currentAccount` với `id = 'PAR-001'` và `role = 'Phụ huynh'`.
6. THE CLASS_STUDENT_MAP SHALL ánh xạ `STU-001` vào ít nhất một lớp học để StudentParentDashboard có dữ liệu hiển thị.
7. THE PARENT_CHILD_MAP SHALL ánh xạ `PAR-001` vào ít nhất một studentId để StudentParentDashboard (chế độ phụ huynh) có dữ liệu hiển thị.
