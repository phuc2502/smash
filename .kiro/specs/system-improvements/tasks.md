# Kế hoạch Triển khai: Cải tiến Hệ thống Quản lý Trung tâm Toán học

## Tổng quan

Triển khai toàn diện các cải tiến hệ thống quản lý trung tâm toán học qua 8 module chức năng từ UI/UX chung, lịch học động, điểm danh chi tiết, hệ thống làm bài trực tuyến chống gian lận, quản lý tài liệu phân loại, hệ thống điểm số linh hoạt, thông báo tự động đa kênh, và cổng thông tin phụ huynh. Kế hoạch cũng bao gồm việc phát triển các trạng thái AppContext và lưu trữ Local Storage cục bộ, triển khai các cơ chế xử lý lỗi/khôi phục tự động và viết các ca kiểm thử đơn vị kết hợp Property-Based Testing (PBT) trên giao diện sử dụng thư viện fast-check.

---

## Tác vụ

- [ ] 1. Quy tắc UI/UX Chung (Module 0)
  - [ ] 1.1 Chỉnh sửa cột Thao tác hiển thị cố định tất cả các icon (Xem, Sửa, Xóa, Ghi chú) mà không dùng CSS hover để ẩn/hiện.
    - _Yêu cầu: Yêu cầu 0.1, 0.4_
  - [ ] 1.2 Tích hợp mã màu phân biệt trạng thái bài tập: Đang mở (#22c55e), Chờ chấm (#eab308), Đã chấm (#3b82f6), Quá hạn (#ef4444).
    - _Yêu cầu: Yêu cầu 0.2_
  - [ ] 1.3 Tích hợp mã màu phân loại bài tập: Tự luận (#a855f7), Trắc nghiệm (#f97316).
    - _Yêu cầu: Yêu cầu 0.3_
  - [ ] 1.4 Thiết kế và tối ưu giao diện responsive trên Mobile & Tablet (độ phân giải từ 360px trở lên).
    - _Yêu cầu: Yêu cầu 0.5_
  - [ ] 1.5 Cấu hình phân trang (Pagination) hoặc tải cuộn vô tận (Infinite Scroll/Lazy Load) tự động kích hoạt khi danh sách dữ liệu > 50 bản ghi.
    - _Yêu cầu: Yêu cầu 0.6_

- [ ] 2. Lớp học & Lịch học (Module 1)
  - [ ] 2.1 Thêm cột "Tỷ lệ chuyên cần" đặt ngay sau cột "Tỷ lệ nộp bài" trong danh sách quản lý lớp học.
    - _Yêu cầu: Yêu cầu 1.1_
  - [ ] 2.2 Giới hạn cột Thao tác trong danh sách lớp chỉ hiển thị các nút Xem (Read), Sửa (Update), Xóa (Delete).
    - _Yêu cầu: Yêu cầu 1.2_
  - [ ] 2.3 Xây dựng component `DynamicScheduleBuilder` thiết lập lịch học động: ô cấu hình lịch chung hiển thị đầu trang, hỗ trợ bộ lọc Ngày/Tháng/Năm.
    - _Yêu cầu: Yêu cầu 1.3, 1.4_
  - [ ] 2.4 Hỗ trợ chọn Thứ trong tuần (Thứ 2 đến Chủ nhật) qua dropdown/checkbox và chọn giờ học (startTime, endTime).
    - _Yêu cầu: Yêu cầu 1.5, 1.6_
  - [ ] 2.5 Cung cấp nút "Thêm ngày" để tạo nhiều buổi học trong tuần, hỗ trợ thêm dòng mới khi nhấn, và xử lý nút xóa buổi học đã chọn.
    - _Yêu cầu: Yêu cầu 1.7, 1.8, 1.9_
  - [ ] 2.6 Triển khai `ConflictDetectionService` để kiểm tra trùng lịch dạy của giảng viên; hiển thị cảnh báo và yêu cầu xác nhận ghi đè trước khi lưu.
    - _Yêu cầu: Yêu cầu 1.10_
  - [ ] 2.7 Thêm tính năng lưu trữ (Archive) các lớp học đã kết thúc để tách biệt khỏi danh sách lớp đang hoạt động.
    - _Yêu cầu: Yêu cầu 1.11_

- [ ] 3. Điểm danh & Thông báo SMS (Module 2)
  - [ ] 3.1 Xây dựng giao diện điểm danh theo tab phân theo từng lớp học; thiết kế Dashboard thống kê chuyên cần của lớp (tỷ lệ đi học, vắng có phép, vắng không phép).
    - _Yêu cầu: Yêu cầu 2.1, 2.2_
  - [ ] 3.2 Thêm cột "Điểm danh" dạng checkbox với 3 lựa chọn: "Vắng có phép", "Vắng không phép", "Đi muộn".
    - _Yêu cầu: Yêu cầu 2.3_
  - [ ] 3.3 Hiển thị ô nhập lý do bắt buộc khi chọn "Vắng có phép", validate chặn lưu và thông báo lỗi nếu bỏ trống lý do.
    - _Yêu cầu: Yêu cầu 2.4, 2.5_
  - [ ] 3.4 Tạo popup `SMSNotificationPopup` chứa mẫu tin nhắn SMS mặc định báo cáo tình hình nghỉ học; cho phép chỉnh sửa nội dung tin nhắn và xác nhận gửi.
    - _Yêu cầu: Yêu cầu 2.6, 2.7, 2.8_
  - [ ] 3.5 Bổ sung kiểm tra số điện thoại phụ huynh; hiển thị lỗi nếu số không tồn tại hoặc sai định dạng.
    - _Yêu cầu: Yêu cầu 2.9_
  - [ ] 3.6 Cho phép chỉnh sửa trạng thái điểm danh đã lưu trong vòng 24 giờ; hiển thị popup gửi SMS đính chính đến phụ huynh nếu đã gửi thông báo trước đó.
    - _Yêu cầu: Yêu cầu 2.10, 2.11_

- [ ] 4. Bài tập & Kiểm tra trực tuyến (Module 3)
  - [ ] 4.1 Lọc bỏ định dạng Video, chỉ hỗ trợ hai loại bài tập: Tự luận và Trắc nghiệm. Thay nút "Chấm điểm ngay" thành "Đã làm" trong giao diện học viên.
    - _Yêu cầu: Yêu cầu 3.1, 3.2_
  - [ ] 4.2 Hiển thị dòng cảnh báo chống gian lận ở trên cùng màn hình làm bài.
    - _Yêu cầu: Yêu cầu 3.3_
  - [ ] 4.3 Xây dựng màn hình thi trắc nghiệm: hiển thị tổng số câu, trạng thái làm bài, và tự động hiển thị đáp án đúng sau khi nộp bài.
    - _Yêu cầu: Yêu cầu 3.4, 3.5_
  - [ ] 4.4 Xây dựng màn hình thi tự luận: tích hợp `MathEditor` hỗ trợ nhập công thức LaTeX, render KaTeX.
    - _Yêu cầu: Yêu cầu 3.6_
  - [ ] 4.5 Triển khai các tính năng chống gian lận: chặn copy/paste, chặn chụp màn hình, quản lý đồng hồ đếm ngược phía Server (định dạng MM:SS, cảnh báo đỏ khi dưới 5 phút).
    - _Yêu cầu: Yêu cầu 3.7, 3.8, 3.9, 3.12_
  - [ ] 4.6 Ghi nhận sự kiện chuyển tab (`tab_switch_count`), hiển thị cảnh báo; tự động khóa bài thi (`is_locked = true`) và lưu lý do vi phạm nếu chuyển tab từ 3 lần trở lên.
    - _Yêu cầu: Yêu cầu 3.10, 3.11_
  - [ ] 4.7 Triển khai cơ chế tự động lưu nháp (auto-save) mỗi 60 giây; khôi phục trạng thái bài làm từ bản nháp gần nhất khi học viên mất kết nối rồi kết nối lại.
    - _Yêu cầu: Yêu cầu 3.13, 3.14_
  - [ ] 4.8 Tự động chấm điểm bài trắc nghiệm và đồng bộ điểm sang module Điểm số ngay sau khi nộp bài.
    - _Yêu cầu: Yêu cầu 3.15_
  - [ ] 4.9 Thiết kế giao diện chấm bài tự luận `SplitScreenGrader` (layout 50/50, chia đôi màn hình: một bên xem đề và bài làm, một bên nhập điểm và nhận xét); lọc danh sách bài nộp và đồng bộ kết quả chấm sang module Điểm số.
    - _Yêu cầu: Yêu cầu 3.16, 3.17, 3.18_

- [ ] 5. Quản lý Tài liệu học tập (Module 4)
  - [ ] 5.1 Thêm cột "Ngày đăng" ở đầu danh sách và cột "Phân loại" (Tổng ôn, Kiến thức, Đọc thêm).
    - _Yêu cầu: Yêu cầu 4.1, 4.2_
  - [ ] 5.2 Hiển thị cấu trúc thư mục phân loại tài liệu theo định dạng: `[Mã Lớp] - [Mã Ca Học] - [Số lượng tài liệu]`.
    - _Yêu cầu: Yêu cầu 4.3_
  - [ ] 5.3 Tạo popup `DocumentUploadPopup` cho phép giảng viên thêm tài liệu (Tên tài liệu, Mô tả, File đính kèm), validate chặn trống.
    - _Yêu cầu: Yêu cầu 4.4, 4.5, 4.6_
  - [ ] 5.4 Giới hạn upload file định dạng: .pdf, .docx, .xlsx, .pptx, .jpg, .png dung lượng tối đa 50MB; kiểm tra MIME type thực tế của file trên cả Client và Server.
    - _Yêu cầu: Yêu cầu 4.7, 4.8_
  - [ ] 5.5 Phân tách lưu trữ tài liệu theo từng lớp học độc lập; hỗ trợ xem chi tiết mô tả tài liệu và tải xuống (download) đối với học viên.
    - _Yêu cầu: Yêu cầu 4.9, 4.10, 4.11, 4.12_

- [ ] 6. Quản lý Điểm số (Module 5)
  - [ ] 6.1 Xây dựng màn hình quản lý Điểm số riêng biệt tổng hợp theo Tháng, Học kỳ, Năm.
    - _Yêu cầu: Yêu cầu 5.1_
  - [ ] 6.2 Phân quyền: giảng viên chỉ xem điểm lớp mình phụ trách, hiển thị sĩ số lớp, ẩn tên giảng viên. Admin chỉ xem thống kê Dashboard (điểm trung bình lớp/đợt/loại) không được chỉnh sửa.
    - _Yêu cầu: Yêu cầu 5.2, 5.3, 5.11, 5.12_
  - [ ] 6.3 Cho phép giảng viên định nghĩa tên cột điểm và thiết lập trọng số (%); validate tổng trọng số cột điểm thường phải bằng 100%.
    - _Yêu cầu: Yêu cầu 5.4, 5.5_
  - [ ] 6.4 Hỗ trợ cột "Điểm thưởng/Bonus" riêng biệt không tính vào tổng trọng số 100% để cộng thẳng vào điểm tổng kết.
    - _Yêu cầu: Yêu cầu 5.6_
  - [ ] 6.5 Triển khai bảng nhập điểm hàng loạt dạng spreadsheet `BulkGradeInput` kèm nút "Lưu chung" để lưu hàng loạt bằng 1 API call.
    - _Yêu cầu: Yêu cầu 5.7_
  - [ ] 6.6 Hỗ trợ đánh dấu điểm vắng mặt: tính điểm 0 hoặc đánh dấu N/A (không tính vào công thức tính trung bình).
    - _Yêu cầu: Yêu cầu 5.8_
  - [ ] 6.7 Thay thế icon "Thêm" thành icon "Ghi chú" ở cột Thao tác; cho phép nhập nhận xét từng bài tập và đồng bộ hai chiều với module Bài tập.
    - _Yêu cầu: Yêu cầu 5.9, 5.10_

- [ ] 7. Hệ thống Thông báo Đa kênh (Module 6)
  - [ ] 7.1 Thêm icon Quả chuông trên thanh điều hướng hiển thị danh sách thông báo. Hỗ trợ giảng viên tạo thông báo cho các lớp mình phụ trách; Admin gửi thông báo toàn hệ thống.
    - _Yêu cầu: Yêu cầu 6.1, 6.2, 6.3_
  - [ ] 7.2 Cung cấp trang cài đặt cá nhân cho phép người dùng tự cấu hình bật/tắt nhận từng loại thông báo.
    - _Yêu cầu: Yêu cầu 6.4_
  - [ ] 7.3 Triển khai cơ chế trigger thông báo tự động cho các sự kiện:
    - Admin nhận thông báo: Tài khoản mới chờ duyệt, Lớp mới được tạo, Học viên thêm vào lớp, Phân quyền thay đổi, Lớp học sắp khai giảng.
    - Giảng viên nhận thông báo: Học viên nộp bài, Nhắc lịch dạy hôm nay, Học viên vắng N buổi liên tiếp, Bài tập sắp đến hạn (1 ngày), Học viên được Admin thêm vào lớp.
    - Học viên nhận thông báo: Bài tập mới được giao, Điểm bài tập công bố, Nhắc nhở hạn nộp bài còn N ngày, Nhắc lịch học hôm nay, Nhận xét mới từ giảng viên.
    - Phụ huynh nhận thông báo: Con có điểm mới, Con vắng mặt, Con có bài tập chưa nộp sắp đến hạn, Nhận xét mới về con, Thống kê điểm trung bình tháng (gửi cuối tháng).
    - _Yêu cầu: Yêu cầu 6.5 đến 6.23_

- [ ] 8. Cổng thông tin Phụ huynh (Module 7)
  - [ ] 8.1 Xây dựng component `ChildSwitcher` cho phép phụ huynh đổi tài khoản con (hiển thị Tên đầy đủ, Mã học viên); ẩn switcher nếu phụ huynh chỉ có 1 con.
    - _Yêu cầu: Yêu cầu 7.1, 7.2, 7.8_
  - [ ] 8.2 Cập nhật toàn bộ Dashboard và thông tin chuyên cần theo tài khoản con được chọn.
    - _Yêu cầu: Yêu cầu 7.3 (đầu), 7.7_
  - [ ] 8.3 Cá nhân hóa ngôn ngữ giao diện (sử dụng "Lớp học của con", "Điểm số của con"); ẩn hoàn toàn nút làm bài/chấm bài, chỉ hiển thị nút "Xem kết quả".
    - _Yêu cầu: Yêu cầu 7.3 (sau), 7.4_
  - [ ] 8.4 Tích hợp component `ParentProgressChart` vẽ biểu đồ xu hướng điểm số theo thời gian (Line Chart) cho từng môn học/lớp học của con.
    - _Yêu cầu: Yêu cầu 7.5, 7.6_

- [ ] 9. Quản lý Trạng thái & Lưu trữ Cục bộ (Module 8)
  - [ ] 9.1 Khai báo trạng thái và hiệu ứng lưu trữ cho `classScheduleSlots` trong AppContext; viết action `updateClassSchedule`.
    - _Yêu cầu: Yêu cầu 8.1, Yêu cầu 8.2, Yêu cầu 8.3_
  - [ ] 9.2 Cập nhật trạng thái `attendanceSessions` và `attendanceRecords` trong AppContext để lưu đầy đủ status, lý do vắng có phép, editableUntil, và các cờ thông báo.
    - _Yêu cầu: Yêu cầu 8.4_
  - [ ] 9.3 Khai báo trạng thái `examSessions` và action `updateExamSession` trong AppContext để lưu trữ phiên làm bài trực tuyến.
    - _Yêu cầu: Yêu cầu 8.5, Yêu cầu 8.6_
  - [ ] 9.4 Khai báo trạng thái `gradeColumnConfigs` và action `updateGradeColumnConfigs` để cấu hình các cột điểm động.
    - _Yêu cầu: Yêu cầu 8.7_
  - [ ] 9.5 Cập nhật trạng thái `gradeEntries` hỗ trợ thuộc tính vắng mặt `is_na` và `note` ghi chú điểm thưởng.
    - _Yêu cầu: Yêu cầu 8.8_
  - [ ] 9.6 Cập nhật trạng thái `documents` lưu thông tin phân loại `category`, dung lượng `file_size_bytes` và loại `mime_type`.
    - _Yêu cầu: Yêu cầu 8.8_
  - [ ] 9.7 Khai báo trạng thái `userNotificationPreferences` lưu trữ tùy chỉnh thông báo cá nhân của người dùng.
    - _Yêu cầu: Yêu cầu 8.9_
  - [ ] 9.8 Cập nhật trạng thái liên kết phụ huynh - học sinh `parentChildMap` trong AppContext và đồng bộ localStorage.
    - _Yêu cầu: Yêu cầu 8.9_

- [ ] 10. Chiến lược Kiểm thử & Property-Based Testing (Module 9)
  - [ ] 10.1 Tích hợp và cấu hình thư viện `fast-check` trong source code dự án.
    - _Yêu cầu: Yêu cầu 10.2_
  - [ ] 10.2 Viết Unit tests kiểm tra các ví dụ cụ thể, điều kiện lỗi cho:
    - Ràng buộc nhập điểm số trong khoảng [0, 10] hoặc điểm tối đa.
    - Ràng buộc dung lượng file tài liệu upload tối đa 50MB.
    - Ràng buộc định dạng số điện thoại phụ huynh khi gửi SMS.
    - _Yêu cầu: Yêu cầu 9.5, 9.6, 9.9, 10.1_
  - [ ] 10.3 Viết Property-Based Tests (PBT) chạy tối thiểu 100 lần với tag định dạng chuẩn:
    - [ ] **Property 1: Tính toán Điểm trung bình tự động từ GradeEntry**
      - Kiểm tra tính toán điểm TB chính xác, làm tròn 1 chữ số thập phân với mọi mảng điểm ngẫu nhiên ∈ [0, 10].
      - _Validates: Yêu cầu 5.5, Yêu cầu 10.3, Yêu cầu 10.4_
    - [ ] **Property 2: Tổng trọng số các cột điểm thường phải bằng 100%**
      - Kiểm tra validator trả về true khi và chỉ khi tổng trọng số bằng 100%, bỏ qua các cột bonus.
      - _Validates: Yêu cầu 5.5, Yêu cầu 9.4, Yêu cầu 10.3, Yêu cầu 10.4_
    - [ ] **Property 3: Hệ thống Anti-cheat tự động khóa bài làm khi vi phạm chuyển tab**
      - Kiểm tra trạng thái bài thi tự động chuyển sang `is_locked = true` với mọi số lần chuyển tab >= 3.
      - _Validates: Yêu cầu 3.11, Yêu cầu 9.3, Yêu cầu 10.3, Yêu cầu 10.4_
    - [ ] **Property 4: Validation dung lượng file tài liệu upload**
      - Kiểm tra validator luôn từ chối (trả về false) đối với mọi file có dung lượng > 50MB.
      - _Validates: Yêu cầu 4.7, Yêu cầu 9.6, Yêu cầu 10.3, Yêu cầu 10.4_
    - [ ] **Property 5: SMS Gateway exponential backoff retry**
      - Kiểm tra cơ chế tự động gửi lại tối đa 3 lần với khoảng thời gian chờ tăng dần theo lũy thừa 2^n khi SMS Gateway gặp lỗi.
      - _Validates: Yêu cầu 9.8, Yêu cầu 10.3, Yêu cầu 10.4_

---

## Ghi chú

- Thư viện kiểm thử thuộc tính bắt buộc phải là **fast-check**; cấu hình chạy tối thiểu 100 lần chạy ngẫu nhiên.
- Tất cả các task đều có tham chiếu trực tiếp đến yêu cầu tương ứng trong file `requirements.md` để đảm bảo tính nhất quán của đặc tả.
- Khi triển khai, tầng quản lý trạng thái AppContext và lưu trữ localStorage phải được ưu tiên hoàn tất đầu tiên làm nền tảng cho các module phía trên.
