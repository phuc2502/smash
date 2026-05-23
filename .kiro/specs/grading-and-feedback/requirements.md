# Tài liệu Yêu cầu: Chấm điểm và Nhận xét

## Giới thiệu

Tài liệu này mô tả yêu cầu cho tính năng **Chấm điểm và Nhận xét** của ứng dụng SMASH Math Center. Tính năng này nâng cấp `GradingPage.tsx` từ trạng thái chỉ đọc với dữ liệu tĩnh thành một hệ thống chấm điểm đầy đủ chức năng, bao gồm:

1. **Chấm điểm bài tự luận** — Giáo viên chấm thủ công các bài nộp từ `quizSubmissions` có loại câu hỏi `essay`.
2. **Nhập/sửa điểm thành phần** — Thêm và chỉnh sửa các đầu điểm (Kiểm tra miệng, 15 phút, 1 tiết, BTVN, Giữa kỳ, Cuối kỳ) cho từng học viên trong từng lớp.
3. **Viết nhận xét** — Giáo viên soạn và lưu nhận xét cho từng học viên.
4. **Xem tổng hợp điểm** — Bảng điểm theo lớp với điểm trung bình và xếp loại được tính tự động.

## Bảng chú giải

- **GradeEntry**: Một đầu điểm thành phần của học viên trong một lớp (ví dụ: điểm kiểm tra miệng, điểm 15 phút).
- **StudentComment**: Nhận xét của giáo viên dành cho một học viên trong một lớp cụ thể.
- **ScoreType**: Loại đầu điểm — `'oral'` (miệng), `'quiz_15'` (15 phút), `'quiz_45'` (1 tiết), `'midterm'` (giữa kỳ), `'final'` (cuối kỳ), `'homework'` (BTVN), `'assignment'` (bài tập liên kết).
- **GradeClassification**: Xếp loại học lực — Xuất sắc (≥9.0), Giỏi (≥8.0), Khá (≥6.5), Trung bình (≥5.0), Yếu (<5.0).
- **AppContext**: Context React toàn cục chứa toàn bộ trạng thái và hành động của ứng dụng.
- **canAccess(permission)**: Hàm trong AppContext kiểm tra quyền của `currentAccount`.
- **grade_assignments**: PermissionKey cho phép chấm điểm và viết nhận xét.
- **view_own_grades**: PermissionKey cho phép học viên/phụ huynh xem điểm của chính mình.
- **export_grades**: PermissionKey cho phép xuất/in bảng điểm.
- **QuizSubmission**: Bản ghi bài nộp của học viên, có thể chứa câu trả lời tự luận chưa được chấm.
- **CLASS_STUDENT_MAP**: Bảng ánh xạ `classId → studentId[]` trong AppContext.
- **PARENT_CHILD_MAP**: Bảng ánh xạ `parentId → studentId[]` trong AppContext.
- **GradingPage**: Trang quản lý điểm số tại route `/grading`.
- **Tab Chấm bài nộp**: Tab đầu tiên trong GradingPage — danh sách bài tự luận chờ chấm.
- **Tab Bảng điểm**: Tab thứ hai — bảng điểm thành phần theo lớp, có thể chỉnh sửa inline.
- **Tab Nhận xét**: Tab thứ ba — danh sách học viên với ô nhập nhận xét.

---

## Yêu cầu

### Yêu cầu 1: Mở rộng AppContext với dữ liệu điểm và nhận xét

**User Story:** Là một developer, tôi muốn AppContext có đầy đủ state và action cho điểm thành phần và nhận xét, để các component có thể đọc và ghi dữ liệu một cách nhất quán.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL định nghĩa interface `GradeEntry` với các trường: `id`, `studentId`, `classId`, `assignmentId` (tùy chọn), `title`, `scoreType`, `score`, `maxScore`, `gradedBy`, `gradedAt`.
2. THE AppContext SHALL định nghĩa interface `StudentComment` với các trường: `id`, `studentId`, `classId`, `teacherId`, `content`, `createdAt`, `updatedAt`.
3. THE AppContext SHALL cung cấp state `gradeEntries: GradeEntry[]` được khởi tạo với dữ liệu mẫu cho các lớp hiện có.
4. THE AppContext SHALL cung cấp state `studentComments: StudentComment[]` được khởi tạo rỗng.
5. WHEN `addGradeEntry(entry)` được gọi, THE AppContext SHALL thêm một `GradeEntry` mới với `id` được tạo tự động vào `gradeEntries`.
6. WHEN `updateGradeEntry(id, data)` được gọi, THE AppContext SHALL cập nhật các trường tương ứng của `GradeEntry` có `id` khớp.
7. WHEN `deleteGradeEntry(id)` được gọi, THE AppContext SHALL xóa `GradeEntry` có `id` khớp khỏi `gradeEntries`.
8. WHEN `saveStudentComment(comment)` được gọi với `studentId` và `classId` đã tồn tại, THE AppContext SHALL cập nhật `content` và `updatedAt` của nhận xét hiện có.
9. WHEN `saveStudentComment(comment)` được gọi với cặp `studentId`/`classId` chưa tồn tại, THE AppContext SHALL tạo mới một `StudentComment` với `id`, `createdAt`, `updatedAt` được tạo tự động.
10. WHEN `gradeEssaySubmission(submissionId, score, comment)` được gọi, THE AppContext SHALL cập nhật `score` của `QuizSubmission` tương ứng và nếu có `comment` thì gọi `saveStudentComment` cho học viên đó.

---

### Yêu cầu 2: Phân quyền truy cập trang chấm điểm

**User Story:** Là một quản trị viên hệ thống, tôi muốn kiểm soát ai được phép chấm điểm và ai chỉ được xem điểm của mình, để đảm bảo tính bảo mật và phân quyền đúng đắn.

#### Tiêu chí chấp nhận

1. WHEN `canAccess('grade_assignments')` trả về `false`, THE GradingPage SHALL ẩn toàn bộ Tab Chấm bài nộp và Tab Nhận xét, chỉ hiển thị Tab Bảng điểm ở chế độ chỉ đọc.
2. WHEN `canAccess('view_own_grades')` trả về `true` và vai trò là `student`, THE GradingPage SHALL chỉ hiển thị dữ liệu điểm của học viên đang đăng nhập.
3. WHEN `canAccess('view_own_grades')` trả về `true` và vai trò là `parent`, THE GradingPage SHALL chỉ hiển thị dữ liệu điểm của các học viên trong `PARENT_CHILD_MAP[currentAccount.id]`.
4. WHEN `canAccess('grade_assignments')` trả về `true`, THE GradingPage SHALL hiển thị đầy đủ ba tab và cho phép chỉnh sửa điểm, chấm bài, viết nhận xét.
5. WHEN `canAccess('export_grades')` trả về `true`, THE GradingPage SHALL hiển thị nút "Xuất PDF / In bảng điểm".
6. IF người dùng không có cả `grade_assignments` lẫn `view_own_grades`, THEN THE GradingPage SHALL hiển thị thông báo "Bạn không có quyền truy cập trang này".

---

### Yêu cầu 3: Kết nối GradingPage với dữ liệu thực từ AppContext

**User Story:** Là một giáo viên, tôi muốn trang chấm điểm hiển thị dữ liệu thực từ hệ thống thay vì dữ liệu tĩnh, để tôi có thể làm việc với danh sách học viên và bài nộp thực tế.

#### Tiêu chí chấp nhận

1. THE GradingPage SHALL lấy danh sách lớp từ `classes` trong AppContext thay vì dữ liệu hardcode.
2. THE GradingPage SHALL hiển thị dropdown chọn lớp, lọc toàn bộ nội dung ba tab theo `classId` được chọn.
3. WHEN một lớp được chọn, THE GradingPage SHALL lấy danh sách học viên từ `CLASS_STUDENT_MAP[classId]` và tra cứu thông tin từ `users`.
4. THE GradingPage SHALL lấy `gradeEntries` từ AppContext, lọc theo `classId` đang chọn để hiển thị bảng điểm.
5. THE GradingPage SHALL lấy `studentComments` từ AppContext, lọc theo `classId` đang chọn để hiển thị nhận xét.
6. THE GradingPage SHALL lấy `quizSubmissions` từ AppContext để hiển thị danh sách bài nộp chờ chấm.
7. WHEN không có lớp nào được chọn, THE GradingPage SHALL hiển thị trạng thái trống với hướng dẫn chọn lớp.

---

### Yêu cầu 4: Tab Chấm bài nộp (Tab 1)

**User Story:** Là một giáo viên, tôi muốn xem danh sách các bài tự luận chưa được chấm và nhập điểm trực tiếp, để tôi có thể hoàn thành việc chấm bài một cách hiệu quả.

#### Tiêu chí chấp nhận

1. THE Tab_Chấm_bài_nộp SHALL hiển thị danh sách các `QuizSubmission` thuộc lớp đang chọn, có ít nhất một câu trả lời cho câu hỏi loại `essay` và chưa có `score`.
2. WHEN danh sách bài chờ chấm rỗng, THE Tab_Chấm_bài_nộp SHALL hiển thị thông báo "Không có bài tự luận nào chờ chấm".
3. THE Tab_Chấm_bài_nộp SHALL hiển thị cho mỗi bài nộp: tên học viên, tên bài tập, thời gian nộp, và nội dung câu trả lời tự luận.
4. WHEN giáo viên nhập điểm (0–10) và nhấn "Lưu điểm", THE Tab_Chấm_bài_nộp SHALL gọi `gradeEssaySubmission(submissionId, score, comment)` và cập nhật giao diện ngay lập tức.
5. IF giáo viên nhập điểm ngoài khoảng 0–10, THEN THE Tab_Chấm_bài_nộp SHALL hiển thị thông báo lỗi "Điểm phải từ 0 đến 10" và không lưu.
6. IF giáo viên nhập điểm không phải số hợp lệ, THEN THE Tab_Chấm_bài_nộp SHALL hiển thị thông báo lỗi và không lưu.
7. WHEN bài nộp đã được chấm điểm, THE Tab_Chấm_bài_nộp SHALL chuyển bài đó sang trạng thái "Đã chấm" và không còn hiển thị trong danh sách chờ chấm.
8. THE Tab_Chấm_bài_nộp SHALL hiển thị badge đếm số bài đang chờ chấm trên tiêu đề tab.

---

### Yêu cầu 5: Tab Bảng điểm (Tab 2)

**User Story:** Là một giáo viên, tôi muốn xem và chỉnh sửa điểm thành phần của từng học viên trong lớp, để tôi có thể quản lý toàn bộ quá trình học tập của học viên.

#### Tiêu chí chấp nhận

1. THE Tab_Bảng_điểm SHALL hiển thị bảng với các cột: Học viên, Kiểm tra miệng, 15 phút, 1 tiết, BTVN, Giữa kỳ, Cuối kỳ, Điểm TB, Xếp loại.
2. THE Tab_Bảng_điểm SHALL tính điểm trung bình tự động từ tất cả `GradeEntry` của học viên trong lớp đang chọn bằng hàm `calcAverage`.
3. THE Tab_Bảng_điểm SHALL hiển thị xếp loại học lực tự động bằng hàm `classifyGrade`.
4. WHEN giáo viên nhấn nút chỉnh sửa trên một ô điểm, THE Tab_Bảng_điểm SHALL chuyển ô đó sang chế độ input inline.
5. WHEN giáo viên nhập điểm hợp lệ (0–10) và xác nhận, THE Tab_Bảng_điểm SHALL gọi `updateGradeEntry` hoặc `addGradeEntry` tùy theo đầu điểm đã tồn tại hay chưa.
6. IF giáo viên nhập điểm ngoài khoảng 0–10, THEN THE Tab_Bảng_điểm SHALL hiển thị lỗi inline và không lưu.
7. WHEN giáo viên nhấn nút thêm đầu điểm mới, THE Tab_Bảng_điểm SHALL hiển thị form chọn loại điểm (`scoreType`) và nhập giá trị.
8. WHEN giáo viên nhấn nút xóa một đầu điểm, THE Tab_Bảng_điểm SHALL gọi `deleteGradeEntry` và cập nhật bảng ngay lập tức.
9. WHILE chế độ chỉ đọc (học viên/phụ huynh), THE Tab_Bảng_điểm SHALL ẩn tất cả nút chỉnh sửa, thêm, xóa.
10. THE Tab_Bảng_điểm SHALL hiển thị màu sắc xếp loại: Xuất sắc/Giỏi → xanh lá, Khá → xanh dương, Trung bình → vàng, Yếu → đỏ.

---

### Yêu cầu 6: Tab Nhận xét (Tab 3)

**User Story:** Là một giáo viên, tôi muốn viết và lưu nhận xét cho từng học viên, để tôi có thể cung cấp phản hồi cá nhân hóa về quá trình học tập.

#### Tiêu chí chấp nhận

1. THE Tab_Nhận_xét SHALL hiển thị danh sách tất cả học viên trong lớp đang chọn, mỗi học viên có một ô textarea để nhập nhận xét.
2. WHEN nhận xét đã tồn tại trong `studentComments`, THE Tab_Nhận_xét SHALL hiển thị nội dung nhận xét hiện có trong textarea.
3. WHEN giáo viên nhấn "Lưu nhận xét", THE Tab_Nhận_xét SHALL gọi `saveStudentComment` và hiển thị thông báo xác nhận "Đã lưu nhận xét".
4. IF nội dung nhận xét rỗng hoặc chỉ chứa khoảng trắng, THEN THE Tab_Nhận_xét SHALL không lưu và hiển thị thông báo "Nhận xét không được để trống".
5. THE Tab_Nhận_xét SHALL hiển thị thời gian cập nhật cuối cùng (`updatedAt`) bên cạnh mỗi nhận xét đã lưu.
6. WHILE chế độ chỉ đọc (học viên/phụ huynh), THE Tab_Nhận_xét SHALL hiển thị nhận xét dưới dạng văn bản tĩnh, không có textarea hay nút lưu.
7. THE Tab_Nhận_xét SHALL hỗ trợ nhận xét tối đa 1000 ký tự và hiển thị bộ đếm ký tự còn lại.

---

### Yêu cầu 7: Tính toán điểm trung bình và xếp loại

**User Story:** Là một giáo viên, tôi muốn hệ thống tự động tính điểm trung bình và xếp loại học lực, để tôi không phải tính thủ công và tránh sai sót.

#### Tiêu chí chấp nhận

1. THE GradingPage SHALL tính điểm trung bình bằng hàm `calcAverage` từ `gradeUtils.ts` dựa trên tất cả `GradeEntry` của học viên trong lớp.
2. WHEN danh sách `GradeEntry` của học viên rỗng, THE GradingPage SHALL hiển thị "—" cho điểm trung bình và "Chưa có điểm" cho xếp loại.
3. THE GradingPage SHALL phân loại học lực bằng hàm `classifyGrade` từ `gradeUtils.ts` theo thang: Xuất sắc (≥9.0), Giỏi (≥8.0), Khá (≥6.5), Trung bình (≥5.0), Yếu (<5.0).
4. WHEN điểm thành phần được thêm, sửa, hoặc xóa, THE GradingPage SHALL tính lại điểm trung bình và xếp loại ngay lập tức mà không cần tải lại trang.
5. THE GradingPage SHALL làm tròn điểm trung bình đến 1 chữ số thập phân.

---

### Yêu cầu 8: Xuất và in bảng điểm

**User Story:** Là một giáo viên hoặc quản trị viên, tôi muốn xuất bảng điểm ra PDF hoặc in, để tôi có thể lưu trữ và chia sẻ kết quả học tập.

#### Tiêu chí chấp nhận

1. WHEN `canAccess('export_grades')` trả về `true`, THE GradingPage SHALL hiển thị nút "Xuất PDF / In bảng điểm".
2. WHEN giáo viên nhấn nút xuất, THE GradingPage SHALL gọi `window.print()` để kích hoạt in ấn trình duyệt.
3. THE PrintableGradeReport SHALL hiển thị bảng điểm với dữ liệu thực từ `gradeEntries` và `users` của lớp đang chọn, thay thế dữ liệu tĩnh hiện tại.
4. THE PrintableGradeReport SHALL chỉ hiển thị khi in (`@media print`), ẩn hoàn toàn trên màn hình thường.
5. THE PrintableGradeReport SHALL bao gồm: tên lớp, tên giáo viên, ngày xuất, bảng điểm đầy đủ với điểm TB và xếp loại.
