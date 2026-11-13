# Định nghĩa văn phong – Tài liệu SRS Nhóm 13 (Hệ thống đặt món Ushi Mania)

## 1. Giọng văn tổng thể

- Trang trọng, khách quan, ngôi thứ ba. Không dùng "chúng tôi", "bạn". Chủ thể luôn là "Hệ thống", "Người dùng", "Khách hàng", "Nhân viên", "Quản trị viên".
- Mệnh lệnh – cam kết ở yêu cầu phi chức năng: dùng "phải", "không vượt quá", "tối thiểu".
- Mô tả hành vi ở phần chức năng: dùng "hiển thị", "cập nhật", "điều hướng", "báo lỗi".
- Chương giới thiệu là văn xuôi học thuật: câu dài, liệt kê bằng dấu hai chấm, dùng cụm như "làm cơ sở thống nhất", "đảm bảo… chính xác và đồng bộ".

## 2. Cấu trúc cố định cho mỗi chức năng

Mỗi chức năng gồm 4 mục theo thứ tự:

1. **Business rule**: gạch đầu dòng, câu ngắn, kết bằng phạm vi áp dụng.
   - Ví dụ: "SĐT chưa tồn tại trên hệ thống trước đó."
   - Ví dụ: "Chức năng áp dụng cho khách hàng".
2. **Đặc tả nghiệp vụ**: bảng usecase.
3. **Mockup screen**: chèn hình giao diện.
4. **Mô tả màn hình**: bảng mô tả từng trường.

## 3. Bảng Đặc tả nghiệp vụ (usecase)

Các dòng của bảng, theo thứ tự:

| Dòng | Nội dung |
| --- | --- |
| Tên usecase | Tên chức năng, ngắn gọn (vd: Đăng ký tài khoản) |
| Tác nhân | Đối tượng thực hiện (vd: Khách hàng đang sử dụng Ushi Web) |
| Mô tả | 1 câu nêu mục đích |
| Sự kiện kích hoạt | Vị trí + hành động (vd: Tại màn hình Trang chủ, click button **Đăng ký**) |
| Điều kiện tiên quyết | Điều kiện cần có trước khi thực hiện |
| Hậu điều kiện | Kết quả sau khi thực hiện thành công |
| Luồng sự kiện chính (thành công) | Bảng STT / Thực hiện bởi / Hành động |
| Luồng sự kiện thay thế | Bảng như trên, hoặc N/A |
| Luồng sự kiện thất bại | Bảng như trên, đánh số theo bước rẽ nhánh |

## 4. Quy ước viết luồng sự kiện

- Bảng 3 cột: **STT | Thực hiện bởi | Hành động**.
- Người dùng và Hệ thống xen kẽ nhau (người dùng thao tác, hệ thống phản hồi).
- Luồng thay thế và thất bại đánh số theo bước rẽ nhánh: 3a, 3b, 3c…
- Câu hành động bắt đầu bằng động từ: "Hiển thị…", "Lưu…", "Cập nhật…", "Nhập các thông tin và click button…".
- Luồng thất bại theo công thức cố định:

> Hiển thị thông báo lỗi khi + [điều kiện]
> Ví dụ: Hiển thị thông báo lỗi khi User nhập SĐT không hợp lệ

## 5. Bảng Mô tả màn hình

Các cột: **Tên trường | Bắt buộc | Kiểu hiển thị | Kiểu thao tác | Hiển thị mặc định | Max length | Mô tả**

Quy ước cột Mô tả:

- Mỗi quy tắc một dòng riêng trong ô.
- Dùng công thức "Khi click, hệ thống điều hướng sang…".
- Dùng mũi tên "→" cho kết quả: "Khi click → Xóa món khỏi giỏ hàng".
- Trường hợp rẽ nhánh dùng nhãn **TH1**, **TH2**.
- Nêu rõ validate: định dạng, độ dài tối đa, xử lý khi copy-paste, xử lý khi bỏ trống.

Ví dụ:

| Tên trường | Bắt buộc | Kiểu hiển thị | Kiểu thao tác | Hiển thị mặc định | Max length | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| Số điện thoại | Có | Textbox | Typing | Số điện thoại | 10 | Người dùng nhập SĐT muốn dùng để đăng ký tài khoản. Chỉ cho phép nhập ký tự số. Khi nhập đến ký tự 10, hệ thống không cho nhập thêm. Trường hợp bỏ trống, khi tạo tài khoản → báo lỗi |
| Tạo tài khoản | Có | Button | Click | Enable | N/A | **TH1:** Thông tin thiếu hoặc không hợp lệ → báo lỗi. **TH2:** Thông tin đầy đủ và chính xác → điều hướng tới trang đăng nhập, thông báo tạo tài khoản thành công |

## 6. Yêu cầu phi chức năng

- Chia theo nhóm đề mục: Hiệu năng, Bảo mật, Tính sẵn sàng và ổn định, Sao lưu và khôi phục, Tương thích, Khả dụng và trải nghiệm, Bảo trì.
- Mỗi gạch đầu dòng mở đầu bằng "Hệ thống phải…" hoặc "Dữ liệu… phải…".
- Chỉ số định lượng được **in đậm**: **3 giây**, **≤ 1 giây**, **99%**, **15 phút**.
- Có ví dụ trong ngoặc khi cần: "(ví dụ: bcrypt)".

## 7. Bảng Thông báo hệ thống

- Cột: **Mã thông báo | Kiểu hiển thị | Nội dung thông báo | Mô tả**.
- Mã đánh số TB01, TB02…
- Kiểu hiển thị: Toast-Error, Popup.
- Nội dung ngắn, có dấu chấm than: "Không có quyền truy cập!".
- Cột Mô tả nêu điều kiện hiển thị và thao tác đóng (vd: "Click OK để đóng Popup").

## 8. Từ vựng đặc trưng

- Trộn thuật ngữ Anh – Việt tự nhiên: usecase, business rule, button, textbox, click, validate, popup, toast, mockup, tab, voucher.
- Viết tắt: SĐT, TH (trường hợp), STT.
- Tên thành phần giao diện đặt trong ngoặc kép hoặc in đậm: button "Tiến hành đặt món", tab Thực đơn.

## 9. Điểm yếu cần tránh khi bắt chước

- Gọi "User", "Người dùng", "Khách hàng" lẫn lộn trong cùng một chức năng.
- Để trống mục "Tổng quan hệ thống".
- Lỗi chính tả và gõ sai: "cuả", "Hiển thị không hiển thị thực đơn".
- Đánh số mục con bị lặp (1.2.1.1 dùng lại cho nhiều chức năng).
- Dùng ký tự mũi tên không thống nhất trong ô mô tả.
- Thông báo lỗi thiếu khoảng trắng: "Đặt món thất bại.Vui lòng thử lại".

## 10. Prompt mô tả văn phong (dùng lại được)

```
Viết tài liệu SRS bằng tiếng Việt, văn phong trang trọng, khách quan, ngôi thứ ba
(Hệ thống / Người dùng / Nhân viên / Quản trị viên).

Mỗi chức năng gồm 4 mục:
1. Business rule: gạch đầu dòng ngắn, kết bằng phạm vi áp dụng.
2. Đặc tả nghiệp vụ: bảng usecase với luồng chính, thay thế, thất bại (đánh số 3a, 3b…).
3. Mockup screen.
4. Mô tả màn hình: bảng trường (Bắt buộc, Kiểu hiển thị, Kiểu thao tác, Mặc định, Max length, Mô tả).

Câu hành động bắt đầu bằng động từ ("Hiển thị…", "Cập nhật…").
Lỗi viết theo mẫu "Hiển thị thông báo lỗi khi…".
Yêu cầu phi chức năng dùng "Hệ thống phải…" và in đậm chỉ số định lượng.
Giữ thuật ngữ kỹ thuật tiếng Anh (button, textbox, validate, popup).
Dùng nhất quán một cách gọi cho mỗi tác nhân trong toàn tài liệu.
```