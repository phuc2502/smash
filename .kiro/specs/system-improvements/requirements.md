# Tài liệu Yêu cầu: Cải tiến Hệ thống Quản lý Trung tâm Toán học

## Giới thiệu

Tài liệu này mô tả các yêu cầu cải tiến cho Hệ thống Quản lý Trung tâm Toán học, phục vụ 4 nhóm người dùng: Admin/Quản lý, Giảng viên, Học viên và Phụ huynh. Các cải tiến bao gồm 7 module chính: Lớp học & Lịch học, Điểm danh, Bài tập & Kiểm tra, Tài liệu, Điểm số, Thông báo và Cổng thông tin Phụ huynh.

## Bảng chú giải

- **Hệ thống**: Hệ thống Quản lý Trung tâm Toán học
- **Admin**: Người dùng có vai trò quản trị toàn hệ thống
- **Giảng viên**: Người dùng có vai trò giảng dạy, quản lý lớp học
- **Học viên**: Người dùng có vai trò học tập tại trung tâm
- **Phụ huynh**: Người dùng có vai trò theo dõi tình hình học tập của con
- **Dashboard**: Màn hình tổng quan thống kê
- **Popup**: Hộp thoại hiển thị trên màn hình hiện tại
- **Split-screen**: Giao diện chia đôi màn hình
- **PBT**: Property-Based Testing - kiểm thử dựa trên thuộc tính
- **Anti-Cheat**: Tính năng chống gian lận trong thi/kiểm tra
- **Trigger Event**: Sự kiện kích hoạt thông báo tự động

## Yêu cầu


### Yêu cầu 0: Quy tắc UI/UX Chung

**User Story:** Là người dùng hệ thống, tôi muốn giao diện nhất quán, trực quan và hoạt động tốt trên mọi thiết bị, để tôi có thể thao tác hiệu quả dù dùng máy tính hay điện thoại.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị tất cả các icon thao tác (Xem, Sửa, Xóa) trong cột Thao tác ở trạng thái cố định, không phụ thuộc vào sự kiện hover chuột.
2. THE Hệ_thống SHALL áp dụng mã màu phân biệt cho từng trạng thái bài tập: Đang mở (xanh lá), Chờ chấm (vàng), Đã chấm (xanh dương), Quá hạn (đỏ).
3. THE Hệ_thống SHALL áp dụng mã màu phân biệt cho từng loại bài tập: Tự luận (tím), Trắc nghiệm (cam).
4. WHEN người dùng truy cập bất kỳ danh sách nào có cột Thao tác, THE Hệ_thống SHALL hiển thị đầy đủ các icon thao tác tương ứng với quyền của người dùng đó mà không cần di chuột.
5. THE Hệ_thống SHALL hiển thị giao diện tương thích trên thiết bị di động (Mobile) và máy tính bảng (Tablet) với độ phân giải từ 360px trở lên.
6. WHEN danh sách dữ liệu vượt quá 50 bản ghi, THE Hệ_thống SHALL áp dụng phân trang (Pagination) hoặc tải thêm (Lazy Load) để tránh tải toàn bộ dữ liệu cùng lúc.

### Yêu cầu 1: Module Quản lý Lớp học & Lịch học

**User Story:** Là Giảng viên, tôi muốn quản lý danh sách lớp và thiết lập lịch học linh hoạt, để tôi có thể theo dõi chuyên cần và tổ chức lịch dạy hiệu quả.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị cột "Tỷ lệ chuyên cần" trong danh sách lớp, đặt ngay sau cột "Tỷ lệ nộp bài".
2. THE Hệ_thống SHALL chỉ hiển thị các thao tác Xem (Read), Sửa (Update), Xóa (Delete) trong cột Thao tác của danh sách lớp.
3. WHEN Giảng viên truy cập màn hình thiết lập lịch học, THE Hệ_thống SHALL hiển thị ô thiết lập lịch chung ở đầu trang trước các nội dung khác.
4. THE Hệ_thống SHALL cung cấp bộ lọc lịch học theo Ngày, Tháng, Năm cho Giảng viên.
5. THE Hệ_thống SHALL cho phép Giảng viên chọn Thứ trong tuần (Thứ 2 đến Chủ nhật) thông qua Dropdown hoặc Checkbox khi thiết lập lịch học.
6. THE Hệ_thống SHALL cho phép Giảng viên chọn khung thời gian học (giờ bắt đầu, giờ kết thúc) khi thiết lập lịch học.
7. THE Hệ_thống SHALL cung cấp nút "Thêm ngày" để Giảng viên tạo nhiều buổi học khác nhau trong tuần cho cùng một lớp.
8. WHEN Giảng viên nhấn "Thêm ngày", THE Hệ_thống SHALL thêm một dòng mới cho phép chọn Thứ và khung thời gian học bổ sung.
9. IF Giảng viên xóa một buổi học đã thiết lập, THEN THE Hệ_thống SHALL cập nhật lại danh sách lịch học và không ảnh hưởng đến các buổi học còn lại.
10. WHEN Giảng viên thiết lập lịch học trùng với lịch dạy khác của chính họ, THE Hệ_thống SHALL hiển thị cảnh báo xung đột lịch và yêu cầu xác nhận trước khi lưu.
11. THE Hệ_thống SHALL cho phép Admin lưu trữ (Archive) các lớp học đã kết thúc, tách biệt khỏi danh sách lớp đang hoạt động.


### Yêu cầu 2: Module Điểm danh

**User Story:** Là Giảng viên, tôi muốn điểm danh học viên và theo dõi chuyên cần theo từng lớp, để tôi có thể quản lý tình hình học tập và thông báo kịp thời cho phụ huynh.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị giao diện điểm danh theo tab, phân chia theo từng lớp học.
2. WHEN Giảng viên chọn một lớp học, THE Hệ_thống SHALL hiển thị Dashboard thống kê chuyên cần của lớp đó bao gồm tỷ lệ đi học, số buổi vắng có phép, số buổi vắng không phép.
3. THE Hệ_thống SHALL hiển thị cột "Điểm danh" dạng Checkbox trong danh sách học viên của lớp, với 3 tùy chọn: "Vắng có phép", "Vắng không phép" và "Đi muộn".
4. WHEN Giảng viên tích chọn "Vắng có phép" cho một học viên, THE Hệ_thống SHALL hiển thị ô nhập văn bản bắt buộc để nhập lý do vắng mặt.
5. IF Giảng viên xác nhận vắng mặt (có phép hoặc không phép) mà không nhập lý do khi chọn "Vắng có phép", THEN THE Hệ_thống SHALL ngăn lưu và hiển thị thông báo lỗi yêu cầu nhập lý do.
6. WHEN Giảng viên xác nhận trạng thái vắng mặt của học viên, THE Hệ_thống SHALL hiển thị nút "Gửi thông báo" bên cạnh học viên đó.
7. WHEN Giảng viên nhấn "Gửi thông báo", THE Hệ_thống SHALL hiển thị Popup chứa mẫu tin nhắn SMS mặc định báo cáo tình hình nghỉ học của học viên.
8. WHEN Giảng viên xác nhận trong Popup, THE Hệ_thống SHALL gửi tin nhắn thông báo đến số điện thoại của Phụ huynh học viên đó.
9. IF số điện thoại Phụ huynh không tồn tại trong hệ thống, THEN THE Hệ_thống SHALL hiển thị thông báo lỗi và không gửi tin nhắn.
10. THE Hệ_thống SHALL cho phép Giảng viên chỉnh sửa trạng thái điểm danh đã lưu trong vòng 24 giờ sau khi điểm danh.
11. WHEN Giảng viên sửa trạng thái điểm danh đã gửi thông báo, THE Hệ_thống SHALL hiển thị tùy chọn gửi SMS đính chính đến Phụ huynh.


### Yêu cầu 3: Module Bài tập & Kiểm tra

**User Story:** Là Học viên, tôi muốn làm bài tập trực tuyến với giao diện hỗ trợ công thức toán học và chống gian lận, để tôi có thể thể hiện năng lực thực sự của mình.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL chỉ hỗ trợ 2 định dạng bài tập: Tự luận và Trắc nghiệm (loại bỏ định dạng Video).
2. THE Hệ_thống SHALL hiển thị nút "Đã làm" thay cho nút "Chấm điểm ngay" trong giao diện làm bài của Học viên.
3. THE Hệ_thống SHALL hiển thị dòng cảnh báo "Không thoát, không chụp màn hình, không copy..." ở phía trên cùng màn hình làm bài.
4. WHEN Học viên làm bài Trắc nghiệm, THE Hệ_thống SHALL hiển thị tổng số câu hỏi và trạng thái từng câu (đã làm/chưa làm).
5. WHEN Học viên nộp bài Trắc nghiệm, THE Hệ_thống SHALL hiển thị đáp án đúng của từng câu trực tiếp trên danh sách câu hỏi.
6. WHEN Học viên làm bài Tự luận, THE Hệ_thống SHALL cung cấp trình soạn thảo hỗ trợ nhập công thức toán học (tương đương LaTeX/MathType).
7. THE Hệ_thống SHALL chặn thao tác copy/paste trong màn hình làm bài.
8. THE Hệ_thống SHALL chặn thao tác chụp màn hình trong màn hình làm bài.
9. THE Hệ_thống SHALL hiển thị đồng hồ đếm ngược thời gian làm bài.
10. WHEN Học viên chuyển sang tab khác trong trình duyệt trong khi đang làm bài, THE Hệ_thống SHALL hiển thị cảnh báo và ghi nhận lần vi phạm.
11. IF Học viên vi phạm chuyển tab từ 3 lần trở lên, THEN THE Hệ_thống SHALL tự động khóa bài và ghi nhận trạng thái vi phạm.
12. THE Hệ_thống SHALL quản lý đồng hồ đếm ngược thời gian làm bài ở phía Server để tránh gian lận chỉnh giờ máy tính.
13. THE Hệ_thống SHALL tự động lưu nháp bài làm mỗi 60 giây để tránh mất dữ liệu khi mất kết nối.
14. WHEN Học viên mất kết nối và kết nối lại trong thời gian làm bài, THE Hệ_thống SHALL khôi phục bài làm từ bản lưu nháp gần nhất và tiếp tục đếm ngược từ thời điểm Server ghi nhận.
15. THE Hệ_thống SHALL tự động chấm điểm bài Trắc nghiệm và đồng bộ điểm sang module Điểm số ngay sau khi Học viên nộp bài.
16. THE Hệ_thống SHALL cung cấp giao diện chấm bài Tự luận dạng Split-screen: một bên hiển thị đề bài, một bên hiển thị bài làm của học viên và khung nhập điểm/nhận xét.
17. THE Hệ_thống SHALL cho phép Giảng viên lọc danh sách bài nộp theo Bài tập và Tình trạng chấm (Đã chấm/Chưa chấm).
18. WHEN Giảng viên lưu điểm và nhận xét cho bài Tự luận, THE Hệ_thống SHALL đồng bộ điểm sang module Điểm số và đồng bộ nhận xét sang module Điểm số.


### Yêu cầu 4: Module Tài liệu

**User Story:** Là Giảng viên, tôi muốn quản lý tài liệu học tập theo từng lớp, để học viên có thể dễ dàng tìm kiếm và tải xuống tài liệu phù hợp.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị cột "Ngày đăng" ở đầu danh sách tài liệu.
2. THE Hệ_thống SHALL hiển thị cột "Phân loại" với 3 giá trị: Tổng ôn, Kiến thức, Đọc thêm.
3. THE Hệ_thống SHALL hiển thị cấu trúc phân loại tài liệu theo định dạng: [Mã Lớp] - [Mã Ca Học] - [Số lượng tài liệu].
4. THE Hệ_thống SHALL cho phép Giảng viên thêm, sửa, xóa tài liệu cho các lớp mình phụ trách.
5. WHEN Giảng viên nhấn nút "Thêm tài liệu", THE Hệ_thống SHALL hiển thị Popup yêu cầu nhập: Tên tài liệu, Mô tả, và Upload file đính kèm.
6. IF Giảng viên nhấn lưu tài liệu mà chưa nhập Tên tài liệu hoặc chưa upload file, THEN THE Hệ_thống SHALL ngăn lưu và hiển thị thông báo lỗi tương ứng.
7. THE Hệ_thống SHALL chỉ cho phép upload các định dạng file: .pdf, .docx, .xlsx, .pptx, .jpg, .png với dung lượng tối đa 50MB mỗi file.
8. IF Giảng viên upload file vượt quá 50MB hoặc sai định dạng, THEN THE Hệ_thống SHALL từ chối và hiển thị thông báo lỗi rõ ràng.
9. WHEN Học viên chọn một lớp học, THE Hệ_thống SHALL hiển thị danh sách tài liệu thuộc lớp đó.
10. WHEN Học viên nhấn "Xem chi tiết" trên một tài liệu, THE Hệ_thống SHALL hiển thị mô tả chi tiết của tài liệu đó.
11. WHEN Học viên nhấn "Tải xuống", THE Hệ_thống SHALL cho phép tải file tài liệu về máy.
12. THE Hệ_thống SHALL lưu trữ tài liệu phân tách theo từng lớp học, không chia sẻ chéo giữa các lớp.

### Yêu cầu 5: Module Điểm số

**User Story:** Là Giảng viên, tôi muốn quản lý và nhập điểm linh hoạt cho học viên theo các loại điểm tùy chỉnh, để tôi có thể theo dõi và đánh giá toàn diện kết quả học tập.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL cung cấp module Điểm số riêng biệt để tổng hợp và theo dõi điểm theo Tháng, Học kỳ, Năm.
2. THE Hệ_thống SHALL chỉ cho phép Giảng viên xem điểm của các lớp mình phụ trách.
3. THE Hệ_thống SHALL hiển thị sĩ số lớp trong module Điểm số, không hiển thị tên Giảng viên bên cạnh.
4. THE Hệ_thống SHALL cho phép Giảng viên tự định nghĩa các loại điểm (tên cột điểm) và thiết lập trọng số phần trăm (%) cho từng loại.
5. IF tổng trọng số các loại điểm thông thường không bằng 100%, THEN THE Hệ_thống SHALL hiển thị cảnh báo và ngăn lưu cấu hình.
6. THE Hệ_thống SHALL hỗ trợ cột "Điểm thưởng/Bonus" riêng biệt không tính vào tổng trọng số 100%, được cộng thêm vào điểm tổng kết cuối cùng.
7. THE Hệ_thống SHALL hỗ trợ nhập điểm hàng loạt cho danh sách học viên và lưu tất cả cùng lúc bằng nút "Lưu chung".
8. WHEN Học viên vắng mặt trong một bài kiểm tra, THE Hệ_thống SHALL cho phép Giảng viên chọn tính điểm là 0 hoặc đánh dấu N/A (không tính vào công thức trung bình).
9. THE Hệ_thống SHALL thay thế icon "Thêm" bằng icon "Ghi chú" trong cột Thao tác của module Điểm số để ghi chú điểm thưởng.
10. THE Hệ_thống SHALL cho phép Giảng viên để lại nhận xét cho từng bài tập, đồng bộ với dữ liệu chấm bài trong module Bài tập.
11. THE Hệ_thống SHALL hiển thị Dashboard điểm trung bình theo Từng lớp, Từng đợt kiểm tra, Từng loại kiểm tra cho Admin.
12. WHEN Admin truy cập module Điểm số, THE Hệ_thống SHALL chỉ hiển thị chế độ xem thống kê, không cho phép chỉnh sửa điểm.


### Yêu cầu 6: Module Thông báo

**User Story:** Là người dùng hệ thống, tôi muốn nhận thông báo kịp thời về các sự kiện liên quan đến mình, để tôi không bỏ lỡ thông tin quan trọng.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL hiển thị icon Quả chuông trên thanh điều hướng để truy cập thông báo.
2. WHEN Giảng viên tạo thông báo mới, THE Hệ_thống SHALL cho phép nhập Tiêu đề, Nội dung và chọn lớp nhận thông báo (chỉ từ các lớp Giảng viên đó phụ trách).
3. THE Hệ_thống SHALL cho phép Admin/Quản lý gửi thông báo đến toàn bộ người dùng hệ thống.
4. THE Hệ_thống SHALL cho phép mỗi người dùng tự cấu hình bật/tắt từng loại thông báo trong phần cài đặt cá nhân.
5. WHEN có tài khoản mới chờ duyệt, THE Hệ_thống SHALL gửi thông báo tự động đến Admin.
5. WHEN một lớp học mới được tạo, THE Hệ_thống SHALL gửi thông báo tự động đến Admin.
6. WHEN Học viên được thêm vào lớp, THE Hệ_thống SHALL gửi thông báo tự động đến Admin.
7. WHEN phân quyền người dùng thay đổi, THE Hệ_thống SHALL gửi thông báo tự động đến Admin.
8. WHEN lớp học sắp khai giảng, THE Hệ_thống SHALL gửi thông báo nhắc lịch đến Admin.
9. WHEN Học viên nộp bài, THE Hệ_thống SHALL gửi thông báo tự động đến Giảng viên phụ trách.
10. THE Hệ_thống SHALL gửi thông báo nhắc lịch dạy hôm nay đến Giảng viên.
11. WHEN Học viên vắng mặt liên tiếp N buổi (N do Admin cấu hình), THE Hệ_thống SHALL gửi thông báo đến Giảng viên phụ trách.
12. WHEN bài tập sắp đến hạn nộp (còn 1 ngày), THE Hệ_thống SHALL gửi thông báo đến Giảng viên phụ trách.
13. WHEN Admin thêm Học viên vào lớp, THE Hệ_thống SHALL gửi thông báo đến Giảng viên phụ trách lớp đó.
14. WHEN có bài tập mới được giao, THE Hệ_thống SHALL gửi thông báo đến Học viên trong lớp.
15. WHEN điểm bài tập được công bố, THE Hệ_thống SHALL gửi thông báo đến Học viên.
16. WHEN hạn nộp bài còn N ngày (N do Admin cấu hình), THE Hệ_thống SHALL gửi thông báo nhắc nhở đến Học viên chưa nộp.
17. THE Hệ_thống SHALL gửi thông báo nhắc lịch học hôm nay đến Học viên.
18. WHEN Giảng viên để lại nhận xét mới cho Học viên, THE Hệ_thống SHALL gửi thông báo đến Học viên đó.
19. WHEN con có điểm mới, THE Hệ_thống SHALL gửi thông báo đến Phụ huynh.
20. WHEN con vắng mặt, THE Hệ_thống SHALL gửi thông báo đến Phụ huynh.
21. WHEN con có bài chưa nộp sắp đến hạn, THE Hệ_thống SHALL gửi thông báo đến Phụ huynh.
22. THE Hệ_thống SHALL gửi thống kê điểm trung bình tháng đến Phụ huynh vào cuối mỗi tháng.
23. WHEN Giảng viên để lại nhận xét về học viên, THE Hệ_thống SHALL gửi thông báo nhận xét đến Phụ huynh của học viên đó.


### Yêu cầu 7: Cổng thông tin Phụ huynh (Parent Portal)

**User Story:** Là Phụ huynh, tôi muốn theo dõi tình hình học tập của con một cách trực quan và dễ hiểu, để tôi có thể hỗ trợ con kịp thời.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL cung cấp tính năng "Chuyển đổi tài khoản con" dạng Dropdown/Menu trên thanh công cụ cho Phụ huynh có từ 2 con trở lên học tại trung tâm.
2. THE Hệ_thống SHALL hiển thị Tên đầy đủ và Mã học viên của từng con trong Dropdown để tránh nhầm lẫn khi có nhiều con cùng tên hoặc sinh đôi.
3. WHEN Phụ huynh chọn một người con trong Dropdown, THE Hệ_thống SHALL cập nhật toàn bộ dữ liệu Dashboard theo người con được chọn.
3. THE Hệ_thống SHALL sử dụng ngôn ngữ thân thiện, cá nhân hóa trong giao diện Phụ huynh: "Điểm số của con", "Lớp học của con" thay vì các thuật ngữ học thuật.
4. THE Hệ_thống SHALL chỉ hiển thị nút "Xem kết quả" trong phần bài tập của giao diện Phụ huynh, ẩn hoàn toàn các nút làm bài và chấm bài.
5. THE Hệ_thống SHALL cung cấp Dashboard riêng biệt cho Phụ huynh hiển thị biểu đồ mức độ cải thiện điểm số của con qua từng bài kiểm tra.
6. WHEN Phụ huynh truy cập Dashboard, THE Hệ_thống SHALL hiển thị biểu đồ xu hướng điểm số theo thời gian cho từng môn/lớp của con.
7. THE Hệ_thống SHALL hiển thị thông tin chuyên cần của con (số buổi đi học, số buổi vắng có phép, số buổi vắng không phép) trong Dashboard Phụ huynh.
8. IF Phụ huynh chỉ có 1 con học tại trung tâm, THEN THE Hệ_thống SHALL ẩn tính năng "Chuyển đổi tài khoản con" và hiển thị trực tiếp thông tin của con đó.

---

### Yêu cầu 8: Quản lý Trạng thái và Lưu trữ Cục bộ (AppContext & Local Storage)

**User Story:** Là một nhà phát triển frontend, tôi muốn toàn bộ trạng thái nghiệp vụ mới của các cải tiến hệ thống được quản lý tập trung thông qua React Context (AppContext) và tự động lưu trữ (persist) vào localStorage, để dữ liệu được đồng bộ đồng nhất trên toàn giao diện và không bị mất sau khi tải lại trang.

#### Tiêu chí chấp nhận

1. THE AppContext SHALL khởi tạo trạng thái `classScheduleSlots` dưới dạng `Record<string, ScheduleSlot[]>` từ dữ liệu trong localStorage key `smash.classScheduleSlots`, fallback về danh sách lịch học mẫu nếu localStorage trống hoặc lỗi.
2. THE AppContext SHALL tự động lưu trữ (persist) trạng thái `classScheduleSlots` vào localStorage key `smash.classScheduleSlots` dưới dạng JSON mỗi khi trạng thái này thay đổi.
3. THE AppContext SHALL cung cấp action `updateClassSchedule(classId: string, slots: ScheduleSlot[])` để cập nhật lịch học động cho lớp, tự động lưu vào localStorage và thông báo re-render giao diện.
4. THE AppContext SHALL cập nhật trạng thái `attendanceSessions` và `attendanceRecords` từ localStorage key `smash.attendanceSessions` và `smash.attendanceRecords`, hỗ trợ lưu trữ trạng thái chi tiết của từng buổi điểm danh bao gồm: status, lý do vắng, thời hạn chỉnh sửa (editableUntil) và trạng thái gửi thông báo.
5. THE AppContext SHALL quản lý trạng thái `examSessions` dưới dạng `Record<string, ExamSession>` khởi tạo từ localStorage key `smash.examSessions` để hỗ trợ lưu trữ phiên thi chống gian lận và thông tin vi phạm của học viên.
6. THE AppContext SHALL cung cấp action `updateExamSession(sessionId: string, sessionData: Partial<ExamSession>)` để cập nhật số lần chuyển tab, trạng thái khóa bài thi và đáp án nháp, đồng thời tự động lưu trữ vào localStorage.
7. THE AppContext SHALL quản lý trạng thái các cột điểm động `gradeColumnConfigs` dưới dạng `Record<string, GradeColumnConfig[]>` từ localStorage key `smash.gradeColumnConfigs`, cung cấp action `updateGradeColumnConfigs(classId: string, configs: GradeColumnConfig[])` để thêm/sửa/xóa các cột điểm và đồng bộ vào localStorage.
8. THE AppContext SHALL cập nhật trạng thái `gradeEntries` (lưu điểm học viên, đánh dấu vắng N/A, ghi chú điểm thưởng) và `documents` (lưu thông tin phân loại, dung lượng file, MIME type) tự động persist vào các key localStorage tương ứng mỗi khi có sự thay đổi.
9. THE AppContext SHALL quản lý trạng thái `userNotificationPreferences` và `parentChildMap` (liên kết phụ huynh - học viên) từ localStorage keys `smash.notificationPrefs` và `smash.parentChildMap`, cung cấp các action cập nhật cấu hình thông báo và thiết lập liên kết con em tương ứng, đồng bộ tức thời vào localStorage.

---

### Yêu cầu 9: Chiến lược Xử lý Lỗi & Khôi phục (Error Handling)

**User Story:** Là người dùng hệ thống, tôi muốn ứng dụng hoạt động ổn định, tự động khôi phục dữ liệu khi gặp sự cố mất kết nối mạng hoặc vi phạm quy chế thi, đồng thời kiểm tra tính hợp lệ dữ liệu chặt chẽ trên giao diện để tránh sai sót.

#### Tiêu chí chấp nhận

1. WHEN Học viên bị mất kết nối mạng trong khi làm bài trực tuyến, THE Client SHALL gửi tín hiệu (heartbeat) kiểm tra kết nối định kỳ mỗi 30 giây; IF phát hiện mất kết nối, bài làm SHALL được lưu nháp cục bộ vào Local Storage và tự động đồng bộ lại vào AppContext ngay khi khôi phục kết nối.
2. WHEN Học viên làm bài trực tuyến, THE Client/AppContext SHALL quản lý đồng hồ đếm ngược dựa trên mốc thời gian bắt đầu và thời hạn tối đa được định nghĩa; WHEN hết thời gian làm bài, THE Client SHALL tự động khóa và nộp bài với trạng thái "nộp muộn" nếu vượt quá deadline quy định.
3. WHEN Học viên thực hiện chuyển đổi tab hoặc rời khỏi màn hình làm bài, THE Client SHALL ghi nhận tăng `tabSwitchCount` trong AppContext; IF số lần chuyển tab đạt hoặc vượt giới hạn cho phép (mặc định 3 lần), THEN THE Client SHALL tự động khóa màn hình làm bài, đặt `is_locked = true` và ghi nhận ghi chú vi phạm.
4. WHEN thiết lập trọng số các cột điểm trong một lớp, THE Client SHALL kiểm tra tổng trọng số (%) của các cột điểm thường (không phải bonus); IF tổng trọng số khác 100%, THEN THE Client SHALL ngăn chặn thao tác lưu, hiển thị thông báo lỗi cảnh báo rõ ràng trên giao diện.
5. WHEN nhập điểm cho học viên, THE Client/AppContext SHALL kiểm tra giá trị điểm số; IF điểm số nhỏ hơn 0 hoặc lớn hơn điểm tối đa cho phép của bài tập/cột điểm, THEN THE Client SHALL từ chối ghi nhận và hiển thị thông báo lỗi chi tiết.
6. WHEN upload tài liệu, THE Client/Hệ_thống SHALL kiểm tra kích thước file trước khi xử lý; IF dung lượng file lớn hơn 50MB, THEN THE Client SHALL từ chối upload và hiển thị thông báo lỗi "Dung lượng file vượt quá 50MB".
7. WHEN upload tài liệu, THE Client/Hệ_thống SHALL kiểm tra loại MIME type thực tế của file; IF MIME type không thuộc danh sách cho phép (PDF, DOCX, XLSX, PPTX, JPEG, PNG), THEN THE Client SHALL từ chối và hiển thị thông báo lỗi định dạng.
8. WHEN gửi tin nhắn SMS báo cáo chuyên cần gặp lỗi từ trình mô phỏng gửi tin nhắn (SMS Simulator/Gateway), THE Client/AppContext SHALL tự động thực hiện lại (retry) tối đa 3 lần sử dụng thuật toán exponential backoff và hiển thị trạng thái lỗi gửi nếu thất bại hoàn toàn.
9. WHEN nhập số điện thoại phụ huynh để gửi thông báo SMS, THE Client SHALL kiểm tra định dạng số điện thoại; IF số điện thoại không hợp lệ hoặc để trống, THEN THE Client SHALL hiển thị lỗi cảnh báo và vô hiệu hóa nút gửi SMS.

---

### Yêu cầu 10: Chiến lược Kiểm thử (Property-Based Testing)

**User Story:** Là một kỹ sư đảm bảo chất lượng (QA), tôi muốn hệ thống frontend được kiểm thử kỹ lượng cả bằng các ca kiểm thử đơn vị thông thường (Unit tests) và kiểm thử dựa trên thuộc tính (Property-Based Testing - PBT), để phát hiện các lỗi logic tiềm ẩn với dữ liệu đầu vào ngẫu nhiên phong phú.

#### Tiêu chí chấp nhận

1. THE Kiểm_thử SHALL áp dụng hai phương pháp kiểm thử bổ sung cho nhau bao gồm Unit tests (kiểm tra các ví dụ cụ thể, edge cases, lỗi logic) và Property-Based Testing (kiểm tra các thuộc tính phổ quát trên dữ liệu đầu vào ngẫu nhiên của các hàm tiện ích và reducer).
2. THE Kiểm_thử SHALL sử dụng thư viện `fast-check` làm công cụ thực hiện Property-Based Testing (PBT) cho các module frontend viết bằng TypeScript/JavaScript.
3. THE Kiểm_thử SHALL được cấu hình chạy tối thiểu 100 lần (iterations) với các dữ liệu đầu vào ngẫu nhiên cho mỗi Property test để đảm bảo độ bao phủ cao trên giao diện.
4. THE Ca_kiểm_thử SHALL tuân thủ định dạng tag đặt tên nghiêm ngặt: `Feature: system-improvements, Property {N}: {mô tả thuộc tính kiểm tra}` để dễ dàng theo dõi và đối chiếu.

