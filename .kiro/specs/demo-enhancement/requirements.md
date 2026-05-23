# Tài liệu Yêu cầu: Demo Enhancement

## Giới thiệu

Tài liệu này mô tả các yêu cầu cho nhóm tính năng nâng cấp ứng dụng quản lý trung tâm toán học SMASH Math. Các tính năng bao gồm: quản lý danh sách học viên trong lớp, phân quyền tài khoản qua UI, persist dữ liệu nghiệp vụ vào localStorage, liên kết phụ huynh-học sinh, ghi nhật ký hoạt động thực tế, và cải thiện tìm kiếm/lọc người dùng.


## Bảngg chú giải

- **AppContext**: React Context cung cấp state và actions toàn cục cho ứng dụng
- **classStudentMap**: Cấu trúc dữ liệu ánh xạ classId → danh sách studentId[]
- **parentChildMap**: Cấu trúc dữ liệu ánh xạ parentId → danh sách studentId[]
- **PermissionKey**: Khóa định danh một quyền cụ thể trong hệ thống (ví dụ: `manage_users`, `view_grades`)
- **localStorage**: Bộ nhớ trình duyệt dùng để persist dữ liệu giữa các phiên
- **loadStoredJson**: Hàm tiện ích đọc và parse JSON từ localStorage
- **appendActivity**: Hàm ghi nhật ký hoạt động vào activity log (giữ 20 log gần nhất)
- **canAccess**: Hàm kiểm tra quyền truy cập kết hợp role permissions và per-user overrides
- **updateAccountPermissions**: Action cập nhật quyền bổ sung cho một user cụ thể
- **Học viên**: Người dùng có role "Học viên" trong hệ thống
- **Phụ huynh**: Người dùng có role "Phụ huynh" trong hệ thống
- **Giáo viên**: Người dùng có role "Giáo viên" trong hệ thống
- **ClassManagementPage**: Trang quản lý lớp học
- **UserManagementPage**: Trang quản lý người dùng
- **SettingsPage**: Trang cài đặt tài khoản
- **AttendancePage**: Trang điểm danh
- **GradingPage**: Trang chấm điểm

---

## Yêu cầu

### Yêu cầu A1: classStudentMap thành React State và Modal Xếp lớp

**User Story:** Là một quản trị viên hoặc giáo viên, tôi muốn quản lý danh sách học viên trong từng lớp học thông qua giao diện trực quan, để tôi có thể thêm hoặc xóa học viên khỏi lớp và thấy thay đổi được phản ánh ngay lập tức trên toàn hệ thống.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL khởi tạo `classStudentMap` là `Record<string, string[]>` từ dữ liệu trong localStorage key `smash.classStudentMap`, fallback về dữ liệu demo nếu localStorage trống hoặc lỗi parse.

2. WHEN `classStudentMap` thay đổi, THE AppContext SHALL lưu giá trị mới vào localStorage key `smash.classStudentMap` dưới dạng JSON.

3. THE AppContext SHALL cung cấp action `addStudentToClass(classId: string, studentId: string)` để thêm một học viên vào lớp.

4. WHEN `addStudentToClass` được gọi với một `studentId` chưa có trong lớp, THE AppContext SHALL thêm `studentId` vào mảng tương ứng trong `classStudentMap` và tăng `studentsCount` của lớp đó lên 1.

5. IF `addStudentToClass` được gọi với một `studentId` đã tồn tại trong lớp, THEN THE AppContext SHALL bỏ qua thao tác và không thay đổi state.

6. THE AppContext SHALL cung cấp action `removeStudentFromClass(classId: string, studentId: string)` để xóa một học viên khỏi lớp.

7. WHEN `removeStudentFromClass` được gọi với một `studentId` đang có trong lớp, THE AppContext SHALL xóa `studentId` khỏi mảng tương ứng trong `classStudentMap` và giảm `studentsCount` của lớp đó xuống 1 (không nhỏ hơn 0).

8. IF `removeStudentFromClass` được gọi với một `studentId` không tồn tại trong lớp, THEN THE AppContext SHALL bỏ qua thao tác và không thay đổi state.

9. THE ClassManagementPage SHALL hiển thị nút "Quản lý học viên" trên mỗi card lớp học.

10. WHEN người dùng nhấn nút "Quản lý học viên" trên một card lớp, THE ClassManagementPage SHALL mở modal "Quản lý danh sách học viên" cho lớp đó.

11. THE Modal "Quản lý danh sách học viên" SHALL hiển thị danh sách tên các học viên hiện đang thuộc lớp.

12. THE Modal "Quản lý danh sách học viên" SHALL hiển thị dropdown hoặc danh sách chọn chứa tất cả users có role "Học viên" chưa thuộc lớp đó, để người dùng có thể thêm vào.

13. WHEN người dùng chọn một học viên từ danh sách và xác nhận thêm, THE Modal SHALL gọi `addStudentToClass` và cập nhật danh sách hiển thị ngay lập tức.

14. WHEN người dùng nhấn nút xóa bên cạnh một học viên trong modal, THE Modal SHALL gọi `removeStudentFromClass` và cập nhật danh sách hiển thị ngay lập tức.

15. WHEN một học viên được thêm vào lớp qua modal, THE AttendancePage của lớp đó SHALL hiển thị học viên đó trong danh sách điểm danh.

16. WHEN một học viên được thêm vào lớp qua modal, THE GradingPage của lớp đó SHALL hiển thị học viên đó trong danh sách chấm điểm.

---

### Yêu cầu A2: SettingsPage — Tab Phân quyền và Bảo mật

**User Story:** Là một quản trị viên, tôi muốn quản lý quyền bổ sung cho từng tài khoản người dùng thông qua giao diện cài đặt, để tôi có thể cấp hoặc thu hồi quyền truy cập mà không cần thay đổi role của họ.

#### Tiêu chí chấp nhận

1. THE App.tsx SHALL đăng ký route `/settings` trỏ đến SettingsPage component.

2. THE Sidebar SHALL hiển thị mục điều hướng "Cài đặt" dẫn đến `/settings` cho tất cả người dùng đã đăng nhập, không yêu cầu permission đặc biệt.

3. THE SettingsPage SHALL hiển thị section "Phân quyền tài khoản" chỉ khi `canAccess('manage_users')` trả về `true` cho người dùng hiện tại.

4. WHILE section "Phân quyền tài khoản" được hiển thị, THE SettingsPage SHALL cung cấp dropdown để chọn một user từ danh sách tất cả users trong hệ thống.

5. WHEN người dùng chọn một user từ dropdown, THE SettingsPage SHALL hiển thị role hiện tại của user đó và danh sách tất cả PermissionKey dưới dạng checkbox.

6. WHEN người dùng chọn một user từ dropdown, THE SettingsPage SHALL đánh dấu checked các PermissionKey mà user đó đang có trong `accountPermissionOverrides`.

7. WHEN người dùng nhấn nút "Lưu phân quyền", THE SettingsPage SHALL gọi `updateAccountPermissions(userId, selectedPermissions[])` với danh sách các PermissionKey đang được check.

8. WHEN `updateAccountPermissions` được gọi thành công, THE SettingsPage SHALL gọi `appendActivity()` với thông tin log hành động cập nhật phân quyền.

9. IF người dùng hiện tại không có quyền `manage_users`, THEN THE SettingsPage SHALL không hiển thị section "Phân quyền tài khoản".

---

### Yêu cầu A3: Persist toàn bộ dữ liệu nghiệp vụ vào localStorage

**User Story:** Là một người dùng, tôi muốn dữ liệu nghiệp vụ (lớp học, học viên, bài tập, điểm danh, điểm số) được lưu lại sau khi tôi đóng trình duyệt, để tôi không mất dữ liệu đã nhập khi quay lại ứng dụng.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL persist state `users` vào localStorage key `smash.users` mỗi khi state này thay đổi.

2. THE AppContext SHALL persist state `classes` vào localStorage key `smash.classes` mỗi khi state này thay đổi.

3. THE AppContext SHALL persist state `assignments` vào localStorage key `smash.assignments` mỗi khi state này thay đổi.

4. THE AppContext SHALL persist state `attendanceSessions` vào localStorage key `smash.attendanceSessions` mỗi khi state này thay đổi.

5. THE AppContext SHALL persist state `gradeEntries` vào localStorage key `smash.gradeEntries` mỗi khi state này thay đổi.

6. THE AppContext SHALL persist state `classStudentMap` vào localStorage key `smash.classStudentMap` mỗi khi state này thay đổi.

7. THE AppContext SHALL persist state `parentChildMap` vào localStorage key `smash.parentChildMap` mỗi khi state này thay đổi.

8. WHEN AppContext khởi tạo, THE AppContext SHALL đọc từng key localStorage tương ứng bằng `loadStoredJson` và dùng làm giá trị khởi tạo cho state.

9. IF localStorage trống hoặc xảy ra lỗi parse JSON cho bất kỳ key nào, THEN THE AppContext SHALL sử dụng `initialData` tương ứng làm giá trị mặc định cho state đó.

10. THE AppContext SHALL sử dụng `useEffect` với dependency là state tương ứng để thực hiện việc lưu vào localStorage.

---

### Yêu cầu A4: parentChildMap thành State và UI Liên kết Phụ huynh-Học sinh

**User Story:** Là một quản trị viên, tôi muốn liên kết tài khoản phụ huynh với tài khoản học sinh của con em họ, để phụ huynh có thể xem thông tin học tập của con.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL khởi tạo `parentChildMap` là `Record<string, string[]>` từ localStorage key `smash.parentChildMap`, fallback về dữ liệu demo (PAR-001 → [STU-001]) nếu localStorage trống hoặc lỗi.

2. THE AppContext SHALL cung cấp action `linkParentToStudent(parentId: string, studentId: string)` để liên kết phụ huynh với học sinh.

3. WHEN `linkParentToStudent` được gọi với một cặp (parentId, studentId) chưa tồn tại, THE AppContext SHALL thêm `studentId` vào mảng tương ứng của `parentId` trong `parentChildMap`.

4. IF `linkParentToStudent` được gọi với một cặp (parentId, studentId) đã tồn tại, THEN THE AppContext SHALL bỏ qua thao tác.

5. THE AppContext SHALL cung cấp action `unlinkParentFromStudent(parentId: string, studentId: string)` để hủy liên kết.

6. WHEN `unlinkParentFromStudent` được gọi với một cặp (parentId, studentId) đang tồn tại, THE AppContext SHALL xóa `studentId` khỏi mảng tương ứng của `parentId` trong `parentChildMap`.

7. WHEN người dùng mở rộng (expand) row của một user có role "Phụ huynh" trong UserManagementPage, THE UserManagementPage SHALL hiển thị danh sách tên học sinh đã được liên kết với phụ huynh đó.

8. WHILE row phụ huynh đang được mở rộng, THE UserManagementPage SHALL hiển thị nút "Liên kết con em" cho phép chọn học sinh từ danh sách users có role "Học viên".

9. WHEN người dùng chọn một học sinh và xác nhận liên kết, THE UserManagementPage SHALL gọi `linkParentToStudent` và cập nhật danh sách hiển thị ngay lập tức.

10. WHEN người dùng nhấn nút hủy liên kết bên cạnh tên học sinh, THE UserManagementPage SHALL gọi `unlinkParentFromStudent` và cập nhật danh sách hiển thị ngay lập tức.

11. THE GradingPage SHALL đọc dữ liệu liên kết phụ huynh-học sinh từ `parentChildMap` state trong AppContext thay vì từ static const.

12. THE AttendancePage SHALL đọc dữ liệu liên kết phụ huynh-học sinh từ `parentChildMap` state trong AppContext thay vì từ static const.

---

### Yêu cầu B1: Activity Logs thực từ hành động người dùng

**User Story:** Là một quản trị viên, tôi muốn nhật ký hoạt động phản ánh các hành động thực tế của người dùng trong hệ thống, để tôi có thể theo dõi và kiểm tra lịch sử thao tác.

#### Tiêu chí chấp nhận

1. WHEN một phiên điểm danh được lưu thành công, THE AttendancePage SHALL gọi `appendActivity()` với tiêu đề mô tả lớp học vừa được điểm danh.

2. WHEN điểm của một học viên được nhập hoặc sửa thành công, THE GradingPage SHALL gọi `appendActivity()` với tiêu đề mô tả tên học viên vừa được chấm điểm.

3. WHEN một học viên được thêm vào lớp thành công qua modal, THE ClassManagementPage SHALL gọi `appendActivity()` với tiêu đề mô tả tên học viên và tên lớp.

4. WHEN một liên kết phụ huynh-học sinh được tạo thành công, THE UserManagementPage SHALL gọi `appendActivity()` với tiêu đề mô tả tên học sinh được liên kết.

5. WHEN phân quyền của một user được cập nhật thành công, THE SettingsPage SHALL gọi `appendActivity()` với tiêu đề mô tả tên user được cập nhật quyền.

6. THE `appendActivity()` SHALL được gọi với đủ 3 tham số: `title` (tên hành động), `description` (mô tả chi tiết), và `tone` (loại thông báo phù hợp).

---

### Yêu cầu B2: Hoàn thiện Search/Filter trên UserManagementPage

**User Story:** Là một quản trị viên, tôi muốn tìm kiếm và lọc người dùng theo tên, email hoặc role một cách nhanh chóng, để tôi có thể tìm thấy người dùng cần quản lý mà không phải cuộn qua toàn bộ danh sách.

#### Tiêu chí chấp nhận

1. THE UserManagementPage SHALL hiển thị thanh tìm kiếm cho phép nhập text để lọc người dùng theo tên hoặc email.

2. WHEN người dùng nhập text vào thanh tìm kiếm, THE UserManagementPage SHALL lọc và chỉ hiển thị các user có tên hoặc email chứa chuỗi tìm kiếm (không phân biệt hoa thường).

3. THE UserManagementPage SHALL hiển thị các nút filter nhanh: "Tất cả", "Giáo viên", "Học viên", "Phụ huynh".

4. WHEN người dùng nhấn một nút filter role, THE UserManagementPage SHALL chỉ hiển thị các user có role tương ứng.

5. WHEN người dùng nhấn nút "Tất cả", THE UserManagementPage SHALL hiển thị tất cả users không phân biệt role.

6. THE UserManagementPage SHALL quản lý trạng thái filter bằng local state thay vì URL param.

7. WHEN cả thanh tìm kiếm và filter role đều được áp dụng, THE UserManagementPage SHALL hiển thị các user thỏa mãn cả hai điều kiện cùng lúc.

8. IF không có user nào thỏa mãn điều kiện tìm kiếm và lọc, THEN THE UserManagementPage SHALL hiển thị thông báo "Không tìm thấy người dùng phù hợp".
