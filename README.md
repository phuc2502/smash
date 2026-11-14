<div align="center">

# 🎓 SMASH Math

**Hệ thống quản lý trung tâm Toán học**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## Giới thiệu

SMASH Math là ứng dụng web hỗ trợ vận hành trung tâm giáo dục: quản lý người dùng, lớp học, bài tập, tài liệu, điểm số, điểm danh và thông báo. Ứng dụng được xây dựng bằng React, TypeScript và Vite; dữ liệu mẫu cùng một số trạng thái được lưu trong trình duyệt (`localStorage`).

## Vai trò người dùng

Sản phẩm được tổ chức theo **4 nhóm vai trò**:

| Vai trò | Mô tả |
|---|---|
| **Quản trị viên (Admin)** | Quản lý người dùng, lớp học, nội dung, phân quyền và hoạt động của trung tâm. Nhóm này bao gồm các cấp quản trị như chủ trung tâm, quản lý và nhân viên hành chính. |
| **Giáo viên (Teacher)** | Quản lý lớp được phân công, tài liệu, bài tập, điểm danh và chấm điểm. |
| **Học viên (Student)** | Xem lớp, tài liệu, bài tập, điểm số và nộp bài. |
| **Phụ huynh (Parent)** | Theo dõi thông tin học tập, điểm và chuyên cần của con. |

Trong code, nhóm **Admin** hiện được biểu diễn bằng các khóa nội bộ `owner`, `manager`, `admin_staff` và `admin`; các quyền cụ thể có thể khác nhau theo cấp. Đây là các cấp trong cùng nhóm quản trị, không phải bốn nhóm người dùng bổ sung.

## Tính năng

- Đăng nhập, đăng ký yêu cầu tài khoản và quy trình quên mật khẩu.
- Quản lý người dùng, lớp học, lịch học và phân công giáo viên.
- Quản lý tài liệu, bài tập, bài làm trực tuyến và chấm điểm.
- Theo dõi điểm danh và đơn xin nghỉ.
- Bảng điều khiển và menu được lọc theo vai trò/quyền.
- Thông báo theo nhóm đối tượng.
- Chế độ demo với chuyển đổi nhanh giữa bốn vai trò.

## Phân quyền

Ứng dụng dùng `PermissionRoute` để bảo vệ các route và `canAccess()` để kiểm tra quyền trong giao diện. Quyền được khai báo trong `src/context/AppContext.tsx`; các trang và menu sử dụng những quyền như `manage_users`, `view_classes`, `grade_assignments`, `view_materials` và `submit_assignment`.

> Đây là ứng dụng frontend/demo: kiểm tra quyền ở client và dữ liệu trong `localStorage` không thay thế cho xác thực, phân quyền và lưu trữ an toàn ở backend. Không dùng cấu hình demo này làm ranh giới bảo mật production.

## Công nghệ

- React 19, TypeScript 5.8, Vite 6
- Tailwind CSS 4, React Router 7
- Vitest và fast-check cho kiểm thử
- Tích hợp Google Gemini được cấu hình qua biến môi trường

## Cài đặt và chạy

Yêu cầu Node.js 18 trở lên và npm 9 trở lên.

```bash
git clone https://github.com/phuc2502/smash.git
cd smash
npm install
cp .env.example .env
npm run dev
```

Ứng dụng chạy tại địa chỉ do Vite in ra trong terminal (mặc định thường là `http://localhost:5173`).

### Biến môi trường

Thiết lập các biến cần dùng trong `.env`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
VITE_DEMO_MODE="true"
```

Chỉ bật `VITE_DEMO_MODE` cho môi trường demo/phát triển. Không commit thông tin bí mật vào Git.

### Lệnh hữu ích

```bash
npm run dev       # Chạy môi trường phát triển
npm run build     # Build production
npm run preview   # Xem thử bản build
npm run lint      # Kiểm tra TypeScript (theo cấu hình dự án)
npx vitest run    # Chạy test
```

## Cấu trúc chính

```text
src/
├── components/     # Giao diện, layout, dashboard và route guard
├── context/        # AppContext, dữ liệu demo và logic quyền
├── notifications/ # Tạo và định nghĩa thông báo
├── pages/          # Các trang của ứng dụng
├── utils/          # Hàm tiện ích
├── App.tsx         # Khai báo routes
└── main.tsx        # Điểm khởi chạy
```

## Tài khoản demo

Khi bật chế độ demo, ứng dụng cung cấp tài khoản cho bốn vai trò chính:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@smashmath.edu.vn` | `Smash@123` |
| Giáo viên | `teacher@smashmath.edu.vn` | `Smash@123` |
| Học viên | `student@smashmath.edu.vn` | `Smash@123` |
| Phụ huynh | `parent@smashmath.edu.vn` | `Smash@123` |

> Chỉ sử dụng tài khoản/mật khẩu này trong dữ liệu demo cục bộ; không dùng làm thông tin đăng nhập thật.

## Kiểm thử

Dự án sử dụng Vitest và fast-check. Ví dụ:

```bash
npx vitest run
npx vitest run src/components/auth/PermissionRoute.pbt.test.tsx
```

## Đóng góp

1. Tạo fork và branch cho thay đổi.
2. Cập nhật code và bổ sung test phù hợp.
3. Chạy `npm run lint` và `npx vitest run`.
4. Gửi pull request kèm mô tả thay đổi.

## Giấy phép

Dự án được phân phối theo MIT License. Xem file [LICENSE](LICENSE) để biết chi tiết.
