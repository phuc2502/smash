# Tài liệu Yêu cầu: Missing Features & RBAC

## Giới thiệu

Tài liệu này mô tả yêu cầu cho ba nhóm tính năng cần bổ sung vào ứng dụng SMASH Math Center:

1. **Phân quyền toàn hệ thống (RBAC)** — Áp dụng kiểm soát truy cập dựa trên vai trò cho toàn bộ Sidebar, các trang, và các nút hành động. Mở rộng `PermissionKey` và `defaultRolePermissions` để phân biệt rõ hơn giữa "xem" và "quản lý" từng module.
2. **Làm bài trực tuyến** — Học viên làm trắc nghiệm hoặc tự luận ngay trên hệ thống tại route `/assignments/take/:assignmentId`, có đếm ngược thời gian và nộp bài.
3. **Xuất/In bảng điểm** — Giáo viên và Admin xuất PDF hoặc in bảng điểm từ `GradingPage` và `ClassReportPage` bằng `window.print()` với CSS print media query.

## Bảng chú giải

- **RBAC** (Role-Based Access Control): Hệ thống phân quyền dựa trên vai trò người dùng.
- **PermissionKey**: Kiểu union TypeScript liệt kê tất cả quyền hạn trong hệ thống.
- **RoleKey**: Kiểu union TypeScript liệt kê tất cả vai trò: `'owner' | 'manager' | 'admin_staff' | 'admin' | 'teacher' | 'student' | 'parent'`.
- **canAccess(permission)**: Hàm trong AppContext trả về `boolean` — kiểm tra xem `currentAccount` có quyền `permission` không, dựa trên `rolePermissions` và `accountPermissionOverrides`.
- **Nhóm Admin**: Các vai trò `owner`, `manager`, `admin_staff`, `admin`.
- **Nhóm Giáo viên**: Vai trò `teacher`.
- **Nhóm Học viên/Phụ huynh**: Vai trò `student` và `parent`.
- **AppNavLinkItem**: Kiểu dữ liệu mô tả một mục điều hướng trong Sidebar, có thể có trường `requiredPermission`.
- **ProtectedRoute**: Component bao bọc route, chuyển hướng về `/dashboard` nếu `canAccess()` trả về `false`.
- **OnlineQuizPage**: Trang mới tại `/assignments/take/:assignmentId` cho phép học viên làm bài trực tuyến.
- **QuizQuestion**: Một câu hỏi trong bài làm trực tuyến, có thể là trắc nghiệm hoặc tự luận.
- **QuizSubmission**: Bản ghi kết quả nộp bài của một học viên cho một bài tập.
- **GradeReport**: Bảng điểm tổng hợp gồm tên học viên, điểm từng bài, điểm trung bình, xếp loại.
- **PrintableGradeReport**: Component React được tối ưu cho in ấn với CSS `@media print`.

---

## Yêu cầu

### Yêu cầu 1: Mở rộng hệ thống PermissionKey

**User Story:** Là một developer, tôi muốn có các `PermissionKey` chi tiết hơn để phân biệt giữa "xem" và "quản lý" từng module, để hệ thống RBAC có thể kiểm soát chính xác từng hành động.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL định nghĩa thêm các `PermissionKey` mới: `submit_assignment`, `view_own_grades`, `export_grades`, `view_materials`, `view_assignments`.
2. THE AppContext SHALL cập nhật `defaultRolePermissions` để gán các permission mới cho từng vai trò theo bảng phân quyền sau:
   - `student`: thêm `submit_assignment`, `view_own_grades`, `view_materials`, `view_assignments`
   - `parent`: thêm `view_own_grades`, `view_materials`, `view_assignments`
   - `teacher`: thêm `view_materials`, `view_assignments`, `view_own_grades`, `export_grades`
   - `admin_staff`: thêm `view_materials`, `view_assignments`, `view_own_grades`
   - `admin`, `manager`, `owner`: thêm tất cả permission mới bao gồm `export_grades`
3. WHEN `canAccess('submit_assignment')` được gọi, THE AppContext SHALL trả về `true` chỉ với vai trò `student`.
4. WHEN `canAccess('export_grades')` được gọi, THE AppContext SHALL trả về `true` với các vai trò `owner`, `manager`, `admin`, `teacher`.
5. WHEN `canAccess('view_own_grades')` được gọi, THE AppContext SHALL trả về `true` với các vai trò `owner`, `manager`, `admin`, `teacher`, `student`, `parent` — nhưng không bao gồm `admin_staff`.
6. THE AppContext SHALL đảm bảo `manage_materials` vẫn chỉ thuộc về `owner`, `manager`, `admin_staff`, `teacher` — phân biệt với `view_materials` (chỉ xem).
7. THE AppContext SHALL đảm bảo `manage_assignments` vẫn chỉ thuộc về `owner`, `manager`, `admin_staff`, `teacher` — phân biệt với `view_assignments` (chỉ xem).

---

### Yêu cầu 2: Demo Role Switcher — Chuyển đổi vai trò nhanh

**User Story:** Là một người xem demo, tôi muốn chuyển đổi giữa các tài khoản demo mà không cần đăng xuất/đăng nhập lại, để tôi có thể thấy sự khác biệt giao diện giữa các vai trò một cách trực quan.

#### Tiêu chí chấp nhận

1. THE DemoRoleSwitcher SHALL hiển thị một widget cố định ở góc dưới bên phải màn hình (chỉ trong môi trường development hoặc khi có flag `VITE_DEMO_MODE=true`).
2. THE DemoRoleSwitcher SHALL hiển thị dropdown với 4 tùy chọn: Admin (`admin@smashmath.edu.vn`), Giáo viên (`teacher@smashmath.edu.vn`), Học viên (`student@smashmath.edu.vn`), Phụ huynh (`parent@smashmath.edu.vn`).
3. WHEN người dùng chọn một vai trò trong DemoRoleSwitcher, THE AppContext SHALL cập nhật `currentAccount` sang tài khoản demo tương ứng mà không cần đăng xuất.
4. WHEN `currentAccount` thay đổi qua DemoRoleSwitcher, THE NavMenu SHALL re-render ngay lập tức để phản ánh quyền của vai trò mới.
5. THE DemoRoleSwitcher SHALL hiển thị vai trò hiện tại đang được chọn với màu sắc phân biệt.

---

### Yêu cầu 2: Phân quyền Sidebar — Ẩn/hiện menu theo vai trò

**User Story:** Là một người dùng, tôi muốn Sidebar chỉ hiển thị các mục menu mà tôi có quyền truy cập, để giao diện không bị rối và tôi không bị nhầm lẫn bởi các tính năng không dành cho mình.

#### Tiêu chí chấp nhận

1. THE AppNavLinkItem SHALL có trường tùy chọn `requiredPermission?: PermissionKey` để khai báo quyền cần thiết để hiển thị mục đó.
2. WHEN NavMenu render danh sách điều hướng, THE NavMenu SHALL gọi `canAccess(entry.requiredPermission)` và chỉ render mục đó nếu kết quả là `true` hoặc `requiredPermission` không được khai báo.
3. THE APP_NAV_LINKS SHALL gán `requiredPermission` cho từng mục theo bảng sau:
   - `/users` → `manage_users`
   - `/classes` (nhóm) → `manage_classes` hoặc `view_attendance`
   - `/materials` → `view_materials`
   - `/assignments` → `view_assignments`
   - `/grading` → `grade_assignments` hoặc `view_own_grades`
   - `/announcements` → `view_dashboard` (tất cả đều thấy)
4. WHEN `currentAccount.role` là `student`, THE NavMenu SHALL ẩn các mục: Người dùng, Quản lý lớp học (nhóm con: Báo cáo lớp học, Quản lý lịch học), Chấm điểm.
5. WHEN `currentAccount.role` là `parent`, THE NavMenu SHALL ẩn các mục: Người dùng, Quản lý lớp học (nhóm con: Báo cáo lớp học, Quản lý lịch học), Bài tập (nếu không có `view_assignments`), Chấm điểm.
6. WHEN `currentAccount.role` là `teacher`, THE NavMenu SHALL ẩn mục: Người dùng.
7. WHEN tất cả children của một nhóm điều hướng bị ẩn, THE NavMenu SHALL ẩn luôn cả nhóm đó.

---

### Yêu cầu 3: Phân quyền trang — Bảo vệ route và ẩn nút hành động

**User Story:** Là một người dùng, tôi muốn không thể truy cập trực tiếp vào URL của trang mà tôi không có quyền, và các nút hành động (Thêm, Sửa, Xóa, Export) chỉ hiển thị với người có quyền tương ứng.

#### Tiêu chí chấp nhận

1. THE App.tsx SHALL bọc các route cần bảo vệ bằng `PermissionRoute` — một component nhận `permission: PermissionKey` và chuyển hướng về `/dashboard` nếu `canAccess(permission)` trả về `false`.
2. WHEN `currentAccount.role` là `student` hoặc `parent` và truy cập `/users`, THE PermissionRoute SHALL chuyển hướng về `/dashboard`.
3. WHEN `currentAccount.role` là `student` hoặc `parent` và truy cập `/grading`, THE PermissionRoute SHALL chuyển hướng về `/dashboard`.
4. WHEN `currentAccount.role` là `student` và truy cập `/assignments`, THE AssignmentsPage SHALL hiển thị chế độ chỉ xem — không có nút "Tạo bài tập mới", chỉ có nút "Làm bài" cho các bài tập đang mở.
5. WHEN `currentAccount.role` là `parent` và truy cập `/assignments`, THE AssignmentsPage SHALL hiển thị danh sách bài tập của con ở chế độ chỉ xem — không có nút "Tạo bài tập mới" và không có nút "Làm bài".
6. WHEN `currentAccount.role` là `student` và truy cập `/materials`, THE MaterialsPage SHALL hiển thị chế độ chỉ xem — không có nút "Tải lên tài liệu mới" hay "Xóa".
7. WHEN `currentAccount.role` là `teacher` và truy cập `/users`, THE PermissionRoute SHALL chuyển hướng về `/dashboard`.
8. THE UserManagementPage SHALL chỉ hiển thị nút "Thêm người dùng", "Xóa", "Khóa tài khoản" khi `canAccess('manage_users')` trả về `true`.
9. THE ClassManagementPage SHALL chỉ hiển thị nút "Tạo lớp mới", "Sửa", "Xóa lớp" khi `canAccess('manage_classes')` trả về `true`.

---

### Yêu cầu 4: Phân quyền module Điểm danh

**User Story:** Là một người dùng, tôi muốn trang Điểm danh hiển thị đúng chức năng theo vai trò của tôi — giáo viên có thể điểm danh, học viên/phụ huynh chỉ xem lịch sử.

#### Tiêu chí chấp nhận

1. WHEN `canAccess('manage_attendance')` trả về `true`, THE AttendancePage SHALL hiển thị đầy đủ chức năng: tạo buổi điểm danh, chỉnh sửa trạng thái, xác nhận buổi học.
2. WHEN `canAccess('view_attendance')` trả về `true` nhưng `canAccess('manage_attendance')` trả về `false`, THE AttendancePage SHALL hiển thị chế độ chỉ xem lịch sử điểm danh — không có nút tạo buổi mới hay chỉnh sửa.
3. IF `canAccess('view_attendance')` trả về `false`, THEN THE PermissionRoute SHALL chuyển hướng người dùng khỏi `/classes/attendance`.
4. WHEN `currentAccount.role` là `student`, THE AttendancePage SHALL chỉ hiển thị lịch sử điểm danh của chính học viên đó (lọc theo `studentId`).
5. WHEN `currentAccount.role` là `parent`, THE AttendancePage SHALL chỉ hiển thị lịch sử điểm danh của các con được liên kết trong `PARENT_CHILD_MAP`.

---

### Yêu cầu 5: Trạng thái bài tập và điều kiện hiển thị nút "Làm bài"

**User Story:** Là một học viên, tôi muốn biết rõ bài tập nào đang mở để làm, để tôi không bị nhầm lẫn giữa bài đã đóng, bài chưa mở, và bài đang trong thời hạn.

#### Tiêu chí chấp nhận

1. THE Assignment SHALL có trường `status` với các giá trị: `'Đang mở'` (học viên có thể làm), `'Chờ chấm điểm'` (đã đóng nộp bài), `'Đã đóng'` (hết hạn), `'Nháp'` (chưa phát hành).
2. WHEN `assignment.status === 'Đang mở'` và `currentAccount.role === 'student'`, THE AssignmentsPage SHALL hiển thị nút "Làm bài" dẫn đến `/assignments/take/:assignmentId`.
3. WHEN `assignment.status !== 'Đang mở'` hoặc học viên đã nộp bài, THE AssignmentsPage SHALL ẩn nút "Làm bài" và hiển thị trạng thái tương ứng (ví dụ: "Đã nộp", "Đã đóng").
4. WHEN `currentAccount.role` là `parent`, THE AssignmentsPage SHALL không hiển thị nút "Làm bài" cho bất kỳ bài tập nào.

---

### Yêu cầu 6: Tính năng Làm bài trực tuyến

**User Story:** Là một học viên, tôi muốn làm bài tập trắc nghiệm và tự luận ngay trên hệ thống, để tôi không cần nộp bài qua kênh khác và có thể xem kết quả ngay sau khi nộp.

#### Tiêu chí chấp nhận

1. THE App.tsx SHALL đăng ký route `/assignments/take/:assignmentId` trỏ đến `OnlineQuizPage`, được bảo vệ bởi `PermissionRoute` với `permission = 'submit_assignment'`.
2. WHEN học viên truy cập `/assignments/take/:assignmentId`, THE OnlineQuizPage SHALL tải dữ liệu bài tập từ AppContext theo `assignmentId` và hiển thị tiêu đề, mô tả, thời gian làm bài.
3. THE OnlineQuizPage SHALL có layout gồm 3 vùng: (1) Header cố định với tiêu đề bài tập và đồng hồ đếm ngược; (2) Vùng nội dung cuộn được với danh sách câu hỏi; (3) Footer cố định với nút "Nộp bài" và thanh tiến độ (số câu đã trả lời / tổng số câu).
4. WHEN bài tập có `type === 'Trắc nghiệm'`, THE OnlineQuizPage SHALL hiển thị danh sách câu hỏi trắc nghiệm với 4 lựa chọn A, B, C, D cho mỗi câu, mỗi câu được đánh số thứ tự.
5. WHEN bài tập có `type === 'Tự luận'`, THE OnlineQuizPage SHALL hiển thị ô nhập văn bản tự do (`textarea`) cho mỗi câu hỏi, mỗi câu được đánh số thứ tự.
6. WHEN bài tập có `timeLimit > 0` (phút), THE OnlineQuizPage SHALL hiển thị đồng hồ đếm ngược định dạng `MM:SS` và tự động nộp bài khi hết giờ.
7. WHEN thời gian còn lại dưới 5 phút, THE OnlineQuizPage SHALL hiển thị cảnh báo màu đỏ trên đồng hồ đếm ngược.
8. WHEN học viên nhấn nút "Nộp bài", THE OnlineQuizPage SHALL hiển thị hộp thoại xác nhận trước khi nộp, bao gồm số câu chưa trả lời.
9. WHEN học viên xác nhận nộp bài, THE OnlineQuizPage SHALL lưu `QuizSubmission` vào AppContext với `studentId`, `assignmentId`, `answers`, `submittedAt`, và `score` (với trắc nghiệm).
10. WHEN bài tập là trắc nghiệm và học viên đã nộp, THE OnlineQuizPage SHALL hiển thị kết quả ngay: số câu đúng, điểm số, và đáp án đúng cho từng câu.
11. WHEN bài tập là tự luận và học viên đã nộp, THE OnlineQuizPage SHALL hiển thị thông báo "Bài đã nộp, chờ giáo viên chấm điểm".
12. WHEN học viên đã có `QuizSubmission` cho `assignmentId` này, THE OnlineQuizPage SHALL hiển thị kết quả đã nộp và không cho phép làm lại.
13. IF `assignmentId` không tồn tại trong AppContext, THEN THE OnlineQuizPage SHALL hiển thị thông báo lỗi và nút quay lại trang `/assignments`.
14. WHEN `currentAccount.role` là `parent`, THE PermissionRoute SHALL chặn truy cập vào `/assignments/take/:assignmentId` và chuyển hướng về `/assignments`.

---

### Yêu cầu 7: Mô hình dữ liệu và dữ liệu demo cho Làm bài trực tuyến

**User Story:** Là một developer, tôi muốn có các kiểu dữ liệu rõ ràng và dữ liệu demo phong phú cho câu hỏi và bài nộp, để tôi có thể kiểm thử tính năng làm bài trực tuyến với nhiều tình huống khác nhau.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL định nghĩa interface `QuizQuestion` với các trường: `id: string`, `text: string`, `type: 'multiple_choice' | 'essay'`, `options?: string[]` (4 lựa chọn cho trắc nghiệm), `correctAnswer?: string` (đáp án đúng cho trắc nghiệm).
2. THE AppContext SHALL định nghĩa interface `QuizSubmission` với các trường: `id: string`, `assignmentId: string`, `studentId: string`, `answers: Record<string, string>` (questionId → answer), `submittedAt: string` (ISO date), `score?: number`, `maxScore?: number`.
3. THE AppContext SHALL mở rộng interface `Assignment` với các trường tùy chọn: `questions?: QuizQuestion[]`, `timeLimit?: number` (phút, 0 = không giới hạn).
4. THE AppContext SHALL cung cấp state `quizSubmissions: QuizSubmission[]` và action `submitQuiz(submission: Omit<QuizSubmission, 'id'>): void`.
5. THE AppContext SHALL cung cấp hàm `getSubmission(assignmentId: string, studentId: string): QuizSubmission | undefined` để kiểm tra học viên đã nộp bài chưa.
6. THE AppContext SHALL thêm dữ liệu demo gồm ít nhất:
   - 1 bài tập `type: 'Trắc nghiệm'` với 5 câu hỏi trắc nghiệm, `timeLimit: 15`, `status: 'Đang mở'`, thuộc lớp `MATH-06-01`
   - 1 bài tập `type: 'Tự luận'` với 2 câu hỏi tự luận, `timeLimit: 0`, `status: 'Đang mở'`, thuộc lớp `MATH-09-EX`
   - 1 bài tập `status: 'Đã đóng'` để kiểm thử trạng thái không thể làm bài
7. THE AppContext SHALL thêm dữ liệu demo điểm số cho ít nhất 5 học viên với điểm khác nhau (bao gồm cả Xuất sắc, Giỏi, Khá, Trung bình, Yếu) để bảng điểm trông thực tế khi xuất.
8. THE AppContext SHALL thêm dữ liệu demo điểm danh (`AttendanceSession` và `AttendanceRecord`) cho `STU-001` trong ít nhất 2 buổi học thuộc lớp `MATH-06-01`, để `AttendancePage` hiển thị dữ liệu thực tế khi đăng nhập bằng tài khoản học viên demo.

---

---

### Yêu cầu 8: Tính năng Xuất/In bảng điểm

**User Story:** Là một giáo viên hoặc admin, tôi muốn xuất bảng điểm ra PDF hoặc in trực tiếp từ trình duyệt, để tôi có thể chia sẻ kết quả học tập với phụ huynh hoặc lưu hồ sơ.

#### Tiêu chí chấp nhận

1. WHEN `canAccess('export_grades')` trả về `true`, THE GradingPage SHALL hiển thị nút "Xuất PDF / In bảng điểm" trong khu vực header của trang.
2. WHEN `canAccess('export_grades')` trả về `false`, THE GradingPage SHALL ẩn hoàn toàn nút xuất bảng điểm.
3. WHEN `canAccess('export_grades')` trả về `true`, THE ClassReportPage SHALL hiển thị nút "Xuất báo cáo" trong khu vực header.
4. WHEN người dùng nhấn nút "Xuất PDF / In bảng điểm" trên GradingPage, THE GradingPage SHALL gọi `window.print()` để mở hộp thoại in của trình duyệt.
5. WHEN `window.print()` được gọi, THE PrintableGradeReport SHALL hiển thị bảng điểm đầy đủ bao gồm: tên trung tâm, tên lớp, danh sách học viên với điểm từng bài, điểm trung bình, xếp loại (Xuất sắc/Giỏi/Khá/Trung bình/Yếu).
6. WHILE chế độ in đang hoạt động (`@media print`), THE PrintableGradeReport SHALL ẩn tất cả các phần tử UI không liên quan (Sidebar, TopNavbar, nút hành động) và chỉ hiển thị nội dung bảng điểm.
7. THE PrintableGradeReport SHALL được render vào một `div` có `id="printable-area"`. CSS `@media print` SHALL dùng `visibility: hidden` cho toàn bộ `body` và `visibility: visible` chỉ cho `#printable-area` và các phần tử con của nó.
8. THE PrintableGradeReport SHALL sử dụng CSS `@media print` thuần túy — không dùng thư viện PDF bên ngoài.
9. WHEN bảng điểm được in, THE PrintableGradeReport SHALL hiển thị ngày xuất báo cáo ở cuối trang.
10. WHEN `currentAccount.role` là `student` hoặc `parent`, THE GradingPage SHALL chỉ hiển thị điểm cá nhân của học viên đó — không hiển thị điểm của học viên khác và không có nút xuất.

---

### Yêu cầu 9: Xếp loại học lực trong bảng điểm

**User Story:** Là một giáo viên, tôi muốn hệ thống tự động tính xếp loại học lực dựa trên điểm trung bình, để bảng điểm xuất ra có đầy đủ thông tin đánh giá.

#### Tiêu chí chấp nhận

1. THE GradeClassifier SHALL phân loại học lực theo thang điểm 10 như sau: điểm trung bình ≥ 9.0 → "Xuất sắc"; ≥ 8.0 → "Giỏi"; ≥ 6.5 → "Khá"; ≥ 5.0 → "Trung bình"; < 5.0 → "Yếu".
2. WHEN tính điểm trung bình, THE GradeCalculator SHALL tính trung bình cộng của tất cả điểm thành phần của học viên, làm tròn đến 1 chữ số thập phân.
3. THE GradeClassifier SHALL trả về xếp loại "Chưa có điểm" khi học viên không có điểm thành phần nào.
4. WHEN xuất bảng điểm, THE PrintableGradeReport SHALL hiển thị cột "Xếp loại" với màu sắc phân biệt: Xuất sắc/Giỏi → xanh lá, Khá → xanh dương, Trung bình → vàng, Yếu → đỏ.
