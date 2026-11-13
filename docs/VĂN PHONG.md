# Định nghĩa văn phong – Tài liệu SRS hệ thống quản lý học tập SMASH

## 1. Giọng văn tổng thể

- Viết bằng tiếng Việt trang trọng, rõ ràng, khách quan và nhất quán; ưu tiên ngôi thứ ba. Không dùng cách xưng hô trực tiếp như “chúng tôi” hoặc “bạn”.
- Gọi tác nhân theo đúng vai trò trong hệ thống: **Học viên**, **Giáo viên**, **Phụ huynh**, **Quản trị viên**. Dùng **Người dùng** khi yêu cầu áp dụng chung cho nhiều vai trò.
- Dùng **Hệ thống** làm chủ thể mô tả phản hồi và xử lý, ví dụ: “Hệ thống hiển thị danh sách lớp học”.
- Mô tả chức năng bằng động từ cụ thể: “hiển thị”, “lọc”, “thêm”, “cập nhật”, “xóa”, “tính”, “lưu”, “phân quyền”. Tránh từ ngữ mơ hồ như “xử lý phù hợp” hoặc “hoạt động tốt”.
- Với yêu cầu bắt buộc, dùng “phải” hoặc “chỉ được phép”; với hành vi giao diện, nêu rõ điều kiện và kết quả.
- Nêu rõ phạm vi dữ liệu và quyền truy cập, đặc biệt với điểm số, bài nộp, nhận xét, lớp học và thông tin học viên.

## 2. Cấu trúc cố định cho mỗi chức năng

Mỗi chức năng nên được trình bày theo thứ tự sau:

1. **Business rule**: các quy tắc nghiệp vụ, điều kiện áp dụng và giới hạn quyền.
2. **Đặc tả nghiệp vụ**: bảng use case, gồm luồng chính, luồng thay thế và luồng thất bại.
3. **Mockup screen**: hình minh họa giao diện nếu có.
4. **Mô tả màn hình**: bảng giải thích trường dữ liệu và thành phần giao diện.

Nếu chức năng không có giao diện riêng, ghi rõ “Không áp dụng” thay vì để trống mục.

## 3. Bảng Đặc tả nghiệp vụ (use case)

Các dòng thông tin được trình bày theo thứ tự:

| Dòng | Nội dung |
| --- | --- |
| Tên use case | Tên chức năng ngắn gọn, bắt đầu bằng động từ hoặc nêu rõ mục tiêu (ví dụ: Nhập điểm học viên, Xem bảng điểm). |
| Tác nhân | Vai trò thực hiện (ví dụ: Giáo viên, Học viên, Phụ huynh, Quản trị viên). |
| Mô tả | Một đến hai câu nêu mục tiêu và phạm vi chức năng. |
| Sự kiện kích hoạt | Vị trí giao diện và thao tác kích hoạt (ví dụ: Tại trang Quản lý Điểm số, chọn lớp học). |
| Điều kiện tiên quyết | Điều kiện cần thỏa mãn trước khi thực hiện, gồm đăng nhập, quyền truy cập và dữ liệu liên quan nếu có. |
| Hậu điều kiện | Trạng thái dữ liệu hoặc giao diện sau khi thực hiện thành công. |
| Luồng sự kiện chính (thành công) | Bảng **STT / Thực hiện bởi / Hành động**. |
| Luồng sự kiện thay thế | Bảng cùng cấu trúc cho trường hợp hợp lệ khác; ghi “Không có” nếu không có. |
| Luồng sự kiện thất bại | Bảng cùng cấu trúc, nêu điều kiện lỗi và phản hồi của hệ thống. |

## 4. Quy ước viết luồng sự kiện

- Dùng bảng ba cột: **STT | Thực hiện bởi | Hành động**.
- Ghi rõ tác nhân thực hiện và phản hồi tương ứng của Hệ thống; không gộp nhiều hành động khác nhau vào một bước.
- Luồng chính được đánh số tuần tự: 1, 2, 3… Luồng thay thế hoặc thất bại đánh số theo bước phát sinh nhánh, ví dụ: 3a, 3b.
- Mỗi hành động nên bắt đầu bằng động từ: “Chọn lớp học…”, “Nhập điểm…”, “Hiển thị bảng điểm…”, “Lưu nhận xét…”.
- Luồng thất bại phải nêu cả điều kiện và kết quả, theo mẫu: “Hệ thống hiển thị thông báo lỗi khi [điều kiện] và không lưu dữ liệu”.
- Với thao tác bị từ chối do quyền, nêu rõ vai trò hoặc quyền nào không đáp ứng và dữ liệu nào không được hiển thị hay thay đổi.

## 5. Bảng Mô tả màn hình

Các cột khuyến nghị: **Tên trường | Bắt buộc | Kiểu hiển thị | Kiểu thao tác | Giá trị mặc định | Giới hạn | Mô tả**.

Quy ước:

- Mỗi quy tắc hoặc điều kiện nên được viết riêng trong ô Mô tả.
- Mô tả cụ thể dữ liệu hiển thị, quyền thao tác, điều kiện validate và phản hồi của giao diện.
- Dùng “Khi chọn…”, “Khi nhấn…”, “Hệ thống hiển thị…” để diễn đạt rõ thao tác và kết quả.
- Với trường hợp rẽ nhánh, dùng nhãn **TH1**, **TH2**; ví dụ: **TH1:** dữ liệu hợp lệ → lưu điểm. **TH2:** dữ liệu không hợp lệ → hiển thị lỗi và không lưu.
- Nêu giới hạn và quy tắc nhập khi có: kiểu dữ liệu, khoảng giá trị, độ dài tối đa, trường hợp để trống, dữ liệu không hợp lệ.
- Chỉ ghi giới hạn cụ thể khi đã được xác định trong yêu cầu hoặc thiết kế; không tự đặt giới hạn.

Ví dụ:

| Tên trường | Bắt buộc | Kiểu hiển thị | Kiểu thao tác | Giá trị mặc định | Giới hạn | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| Lớp học | Có | Danh sách chọn | Chọn | Chưa chọn lớp | N/A | Giáo viên chọn một lớp trong danh sách lớp được phép truy cập. Khi chọn lớp, Hệ thống hiển thị dữ liệu học viên và điểm số thuộc lớp đó. |
| Điểm | Có | Ô nhập số | Nhập | Điểm hiện tại hoặc để trống khi thêm mới | Từ 0 đến 10 | Hệ thống chỉ lưu điểm trong khoảng hợp lệ. Nếu điểm không hợp lệ, Hệ thống hiển thị lỗi và không cập nhật dữ liệu. |
| Lưu nhận xét | Không | Button | Click | Enable khi có nội dung hợp lệ | N/A | Khi nhấn, Hệ thống lưu nhận xét cho học viên trong lớp đang chọn và hiển thị thông báo xác nhận. |

## 6. Yêu cầu phi chức năng

- Nhóm yêu cầu theo chủ đề phù hợp với hệ thống: **Hiệu năng**, **Bảo mật và phân quyền**, **Tính sẵn sàng và ổn định**, **Toàn vẹn dữ liệu**, **Tương thích**, **Khả dụng và trải nghiệm**, **Bảo trì**.
- Mỗi yêu cầu phải kiểm chứng được, nêu điều kiện hoặc tiêu chí đánh giá cụ thể.
- Dùng cách diễn đạt “Hệ thống phải…” hoặc “Dữ liệu … phải…”.
- Chỉ số định lượng phải được **in đậm** khi có căn cứ, ví dụ: **3 giây**, **99%**. Không tự tạo chỉ số nếu chưa được thống nhất.
- Với dữ liệu học tập, nêu yêu cầu bảo vệ quyền riêng tư, kiểm soát truy cập theo vai trò và đảm bảo chỉ người có quyền mới được xem hoặc thay đổi dữ liệu.

## 7. Bảng Thông báo hệ thống

- Các cột: **Mã thông báo | Kiểu hiển thị | Nội dung thông báo | Điều kiện hiển thị**.
- Mã thông báo đánh số tuần tự, ví dụ: TB01, TB02…; mã phải duy nhất trong tài liệu.
- Dùng các kiểu hiển thị phù hợp như Toast-Error, Toast-Success, Inline error hoặc Popup; sử dụng nhất quán.
- Nội dung ngắn gọn, dễ hiểu và chỉ rõ vấn đề hoặc kết quả, ví dụ: “Điểm phải nằm trong khoảng từ 0 đến 10.” hoặc “Đã lưu nhận xét.”
- Điều kiện hiển thị phải nêu rõ thao tác hoặc lỗi dẫn đến thông báo và cách thông báo được đóng nếu cần.

## 8. Từ vựng đặc trưng

- Tác nhân: **Học viên**, **Giáo viên**, **Phụ huynh**, **Quản trị viên**, **Người dùng**.
- Đối tượng nghiệp vụ: **lớp học**, **học viên**, **bài tập**, **bài nộp**, **điểm thành phần**, **điểm trung bình**, **xếp loại**, **nhận xét**.
- Thành phần giao diện: **trang**, **tab**, **bảng điểm**, **danh sách chọn**, **ô nhập**, **button**, **badge**, **popup**, **toast**, **mockup**.
- Thuật ngữ kỹ thuật tiếng Anh có thể giữ nguyên khi cần thiết, ví dụ: use case, validate, read-only, inline edit; giải thích bằng tiếng Việt ở lần xuất hiện đầu tiên nếu thuật ngữ có thể gây hiểu nhầm.
- Dùng thống nhất một cách gọi cho cùng một vai trò hoặc đối tượng trong toàn bộ tài liệu. Không thay đổi tùy tiện giữa “User”, “người dùng” và “học viên”.
- Tên thành phần giao diện đặt trong ngoặc kép hoặc in đậm, ví dụ: tab **Điểm số**, button **Lưu điểm**.

## 9. Điểm cần tránh

- Giữ lại nội dung không liên quan đến đề tài như đặt món, thực đơn, giỏ hàng, khách hàng hoặc voucher.
- Gọi tác nhân không nhất quán hoặc nhầm quyền của Giáo viên, Học viên, Phụ huynh và Quản trị viên.
- Mô tả chức năng mà không nêu điều kiện tiên quyết, phạm vi dữ liệu hoặc kết quả sau thao tác.
- Để trống mục trong cấu trúc tài liệu; ghi “Không áp dụng” hoặc “Không có” khi phù hợp.
- Đưa ra quy tắc, quyền, giới hạn điểm hoặc chỉ số hiệu năng chưa được xác nhận trong yêu cầu.
- Dùng câu mơ hồ, lỗi chính tả, thông báo lỗi thiếu khoảng trắng hoặc đánh số mục bị lặp.
- Dùng thuật ngữ không thống nhất, đặc biệt giữa “điểm”, “điểm trung bình”, “điểm thành phần” và “xếp loại”.

## 10. Prompt mô tả văn phong (dùng lại được)

```
Viết tài liệu SRS bằng tiếng Việt cho hệ thống quản lý học tập SMASH.
Dùng văn phong trang trọng, rõ ràng, khách quan và ngôi thứ ba. Gọi tác nhân
nhất quán là Học viên, Giáo viên, Phụ huynh, Quản trị viên hoặc Người dùng;
dùng “Hệ thống” để mô tả phản hồi và xử lý.

Mỗi chức năng trình bày theo thứ tự:
1. Business rule: quy tắc nghiệp vụ, điều kiện áp dụng và quyền truy cập.
2. Đặc tả nghiệp vụ: use case gồm tác nhân, mô tả, sự kiện kích hoạt,
   điều kiện tiên quyết, hậu điều kiện, luồng chính, thay thế và thất bại.
3. Mockup screen: hình minh họa nếu có; nếu không có, ghi “Không áp dụng”.
4. Mô tả màn hình: bảng trường dữ liệu, thành phần giao diện, thao tác,
   giá trị mặc định, giới hạn và quy tắc validate.

Mỗi bước luồng sự kiện ghi rõ người thực hiện và bắt đầu bằng động từ.
Luồng lỗi nêu điều kiện, thông báo của Hệ thống và việc dữ liệu có được lưu hay không.
Yêu cầu phi chức năng phải kiểm chứng được; dùng “Hệ thống phải…” và chỉ nêu
chỉ số định lượng đã được xác nhận.

Sử dụng đúng thuật ngữ của hệ thống: lớp học, học viên, bài tập, bài nộp,
điểm thành phần, điểm trung bình, xếp loại và nhận xét. Không đưa nội dung
liên quan đến nhà hàng, đặt món hoặc các nghiệp vụ không thuộc đề tài.
```
