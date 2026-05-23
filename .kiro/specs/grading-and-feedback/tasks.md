# Kế hoạch triển khai: Chấm điểm và Nhận xét

## Tổng quan

Triển khai tính năng Chấm điểm và Nhận xét theo thứ tự từ tầng dữ liệu (AppContext) lên tầng giao diện (GradingPage và các component con). Mỗi bước xây dựng trên bước trước và kết thúc bằng việc kết nối toàn bộ.

## Tasks

- [x] 1. Định nghĩa kiểu dữ liệu và mở rộng AppContext
  - Thêm interface `GradeEntry` và `StudentComment` vào `src/context/AppContext.tsx`
  - Thêm type `ScoreType` vào AppContext
  - Thêm `gradeEntries: GradeEntry[]` và `studentComments: StudentComment[]` vào `AppContextType` và `AppState`
  - Thêm 5 action signatures vào `AppContextType`: `addGradeEntry`, `updateGradeEntry`, `deleteGradeEntry`, `saveStudentComment`, `gradeEssaySubmission`
  - Tạo `initialGradeEntries` với dữ liệu mẫu cho các lớp MATH-06-01, MATH-07-02, MATH-09-EX
  - _Yêu cầu: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.1 Viết unit test cho kiểu dữ liệu
    - Kiểm tra `GradeEntry` có đủ các trường bắt buộc
    - Kiểm tra `ScoreType` bao gồm tất cả 7 loại
    - _Yêu cầu: 1.1, 1.2_

- [x] 2. Triển khai các action CRUD cho GradeEntry trong AppContext
  - Triển khai `addGradeEntry`: tạo id tự động `GE-${Date.now()}`, thêm vào state
  - Triển khai `updateGradeEntry`: tìm theo id, merge data mới
  - Triển khai `deleteGradeEntry`: lọc bỏ entry có id khớp
  - _Yêu cầu: 1.5, 1.6, 1.7_

  - [x] 2.1 Viết property test cho addGradeEntry
    - **Property 4: Điểm hợp lệ trong [0, 10]**
    - **Validates: Yêu cầu 1.5, 4.5, 5.5**
    - Dùng fast-check: với mọi score ∈ [0,10], entry được thêm vào phải có score đúng

  - [x] 2.2 Viết unit test cho updateGradeEntry và deleteGradeEntry
    - Test update thay đổi đúng trường, không ảnh hưởng entry khác
    - Test delete xóa đúng entry, không ảnh hưởng entry khác
    - _Yêu cầu: 1.6, 1.7_

- [x] 3. Triển khai saveStudentComment (upsert) trong AppContext
  - Tìm comment theo `(studentId, classId)` — nếu có thì update `content` và `updatedAt`, nếu không thì tạo mới với id `CMT-${Date.now()}`
  - _Yêu cầu: 1.8, 1.9_

  - [x] 3.1 Viết property test cho saveStudentComment
    - **Property 3: saveStudentComment là upsert — không tạo trùng**
    - **Validates: Yêu cầu 1.8, 1.9**
    - Dùng fast-check: với mọi (studentId, classId), gọi N lần → chỉ có 1 bản ghi

- [x] 4. Triển khai gradeEssaySubmission trong AppContext
  - Cập nhật `score` của `QuizSubmission` có `id = submissionId`
  - Nếu có `comment`, gọi `saveStudentComment` cho học viên tương ứng (lấy `classId` từ `assignments`)
  - _Yêu cầu: 1.10_

  - [x] 4.1 Viết property test cho gradeEssaySubmission
    - **Property 5: gradeEssaySubmission cập nhật đúng submission**
    - **Validates: Yêu cầu 1.10, 4.4**
    - Dùng fast-check: với mọi submissionId và score ∈ [0,10], submission.score sau khi gọi phải bằng score

- [x] 5. Checkpoint — Kiểm tra AppContext
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 6. Tạo component EssayGradingTab
  - Tạo file `src/components/grading/EssayGradingTab.tsx`
  - Nhận props: `classId`, `submissions` (đã lọc essay + chưa có score), `assignments`, `users`, `onGrade`
  - Hiển thị danh sách bài nộp: tên học viên, tên bài tập, thời gian nộp, nội dung câu trả lời
  - Mỗi bài có input điểm (0–10, step 0.5) và textarea nhận xét tùy chọn
  - Validate: điểm phải là số trong [0, 10] — hiển thị lỗi inline nếu không hợp lệ
  - Nút "Lưu điểm" disabled khi input không hợp lệ
  - Hiển thị thông báo "Không có bài tự luận nào chờ chấm" khi danh sách rỗng
  - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 6.1 Viết property test cho validation điểm
    - **Property 4 (phần validation): Điểm ngoài [0,10] bị từ chối**
    - **Validates: Yêu cầu 4.5, 4.6**
    - Dùng fast-check: với mọi số ngoài [0,10] hoặc chuỗi không phải số, `isValidScore` trả về false

  - [x] 6.2 Viết property test cho danh sách chờ chấm
    - **Property 6: Bài đã chấm không còn trong danh sách chờ**
    - **Validates: Yêu cầu 4.7**
    - Dùng fast-check: với mọi tập submissions, `getPendingEssays` chỉ trả về bài có `score === undefined`

- [x] 7. Tạo component GradeTableTab
  - Tạo file `src/components/grading/GradeTableTab.tsx`
  - Nhận props: `classId`, `students`, `gradeEntries`, `readOnly`, `onAdd`, `onUpdate`, `onDelete`
  - Hiển thị bảng với cột: Học viên, Kiểm tra miệng, 15 phút, 1 tiết, BTVN, Giữa kỳ, Cuối kỳ, Điểm TB, Xếp loại
  - Tính Điểm TB bằng `calcAverage` và Xếp loại bằng `classifyGrade` từ `gradeUtils.ts`
  - Khi `!readOnly`: click ô điểm → chỉnh sửa inline với input; nút thêm đầu điểm mới; nút xóa
  - Màu xếp loại: Xuất sắc/Giỏi → xanh lá, Khá → xanh dương, Trung bình → vàng, Yếu → đỏ
  - Khi `readOnly`: ẩn tất cả nút chỉnh sửa, thêm, xóa
  - _Yêu cầu: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 7.1 Viết property test cho tính toán điểm TB
    - **Property 1: Điểm TB phản ánh đúng tất cả GradeEntry**
    - **Validates: Yêu cầu 5.2, 7.1, 7.4, 7.5**
    - Dùng fast-check: với mọi mảng scores, `computeDisplayedAverage(entries)` === `calcAverage(scores)`

  - [x] 7.2 Viết property test cho xếp loại
    - **Property 2: Xếp loại nhất quán với điểm TB**
    - **Validates: Yêu cầu 5.3, 7.3**
    - Dùng fast-check: với mọi avg ∈ [0,10], xếp loại hiển thị === `classifyGrade(avg)`

- [x] 8. Tạo component CommentTab
  - Tạo file `src/components/grading/CommentTab.tsx`
  - Nhận props: `classId`, `students`, `comments`, `readOnly`, `teacherId`, `onSave`
  - Hiển thị danh sách học viên, mỗi người có textarea (max 1000 ký tự) và bộ đếm ký tự còn lại
  - Hiển thị nội dung nhận xét hiện có nếu đã tồn tại trong `comments`
  - Hiển thị `updatedAt` bên cạnh nhận xét đã lưu
  - Nút "Lưu nhận xét" disabled khi nội dung rỗng/chỉ khoảng trắng hoặc vượt 1000 ký tự
  - Khi `readOnly`: hiển thị nhận xét dạng văn bản tĩnh, không có textarea hay nút lưu
  - _Yêu cầu: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 8.1 Viết property test cho validation nhận xét
    - **Property 8: Nhận xét không vượt 1000 ký tự**
    - **Validates: Yêu cầu 6.7**
    - Dùng fast-check: với mọi content.length > 1000, nút lưu bị disabled

  - [x] 8.2 Viết unit test cho validation nhận xét rỗng
    - Test `isValidComment('   ')` → false
    - Test `isValidComment('')` → false
    - Test `isValidComment('Nhận xét hợp lệ')` → true
    - _Yêu cầu: 6.4_

- [x] 9. Tái cấu trúc GradingPage — kết nối AppContext và 3 tab
  - Xóa toàn bộ dữ liệu hardcode (`allStudents`, mock stats)
  - Thêm dropdown chọn lớp từ `classes` trong AppContext
  - Thêm tab navigation: "Chấm bài nộp" / "Bảng điểm" / "Nhận xét"
  - Lọc học viên theo `CLASS_STUDENT_MAP[selectedClassId]` và vai trò người dùng
  - Lọc `gradeEntries` và `studentComments` theo `selectedClassId`
  - Lọc `quizSubmissions` theo lớp đang chọn (qua `assignments`)
  - Áp dụng phân quyền: ẩn tab theo `canAccess('grade_assignments')`, lọc dữ liệu theo `view_own_grades`
  - Hiển thị thông báo "Không có quyền truy cập" nếu thiếu cả hai quyền
  - _Yêu cầu: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 9.1 Viết property test cho data isolation
    - **Property 7: Học viên/phụ huynh chỉ thấy dữ liệu của mình**
    - **Validates: Yêu cầu 2.2, 2.3**
    - Dùng fast-check: với mọi studentId, `filterForStudent(entries, studentId)` chỉ chứa entries của studentId đó

- [x] 10. Cập nhật PrintableGradeReport dùng dữ liệu thực
  - Cập nhật `GradingPage` để truyền dữ liệu thực từ `gradeEntries` và `users` vào `PrintableGradeReport`
  - Thay thế dữ liệu tĩnh `gradeRows` bằng dữ liệu tính từ `gradeEntries` của lớp đang chọn
  - Đảm bảo nút "Xuất PDF / In bảng điểm" chỉ hiển thị khi `canAccess('export_grades')`
  - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Checkpoint cuối — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi chú

- Tất cả task đều bắt buộc, bao gồm cả kiểm thử
- Mỗi task tham chiếu yêu cầu cụ thể để truy xuất nguồn gốc
- Property tests dùng thư viện **fast-check**, chạy tối thiểu 100 lần mỗi test
- Không có backend — toàn bộ state trong AppContext (in-memory)
