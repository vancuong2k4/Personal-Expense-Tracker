<div align="center">

# 💰 Personal Expense Tracker

**Ứng dụng quản lý tài chính cá nhân toàn diện** — Theo dõi thu chi, quản lý số dư ví, luân chuyển dòng tiền nội bộ, hóa đơn định kỳ, danh mục tùy biến, thiết lập ngân sách, chế độ Dark Mode & đa ngôn ngữ i18n và phân tích tài chính với biểu đồ trực quan.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![i18next](https://img.shields.io/badge/i18n-react--i18next-26A69A?style=flat-square&logo=i18next&logoColor=white)](https://react.i18next.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực** | Đăng ký / Đăng nhập với JWT, tự động logout khi token hết hạn |
| 👛 **Quản lý ví** | Tạo và quản lý nhiều ví (Tiền mặt, Ngân hàng, Thẻ tín dụng) với số dư theo thời gian thực |
| 🔄 **Chuyển tiền giữa các ví** | Luân chuyển dòng tiền giữa 2 ví (rút tiền mặt, thanh toán thẻ...), hỗ trợ phí chuyển và hoàn tác số dư nguyên tử |
| 💸 **Giao dịch** | Ghi chép thu/chi với danh mục, ghi chú, tự động cập nhật số dư ví nguyên tử |
| 🎯 **Quản lý Ngân sách** | Thiết lập hạn mức chi tiêu hàng tháng theo từng danh mục, theo dõi thanh tiến độ & cảnh báo vượt ngân sách |
| 🔁 **Chi tiêu & Hóa đơn định kỳ** | Quản lý tiền nhà, điện nước, internet, lương, gói subscription với chu kỳ linh hoạt và cảnh báo khi đến hạn |
| 🏷️ **Danh mục tùy biến** | Tạo danh mục thu/chi riêng mang đậm dấu ấn cá nhân với bộ Emoji picker, bảo vệ danh mục hệ thống |
| 🌙 **Chế độ Tối (Dark Mode)** | Chuyển đổi giao diện sáng/tối linh hoạt với lưu trữ trạng thái người dùng (Local Storage) |
| 🌐 **Đa ngôn ngữ (i18n)** | Hỗ trợ song ngữ Tiếng Việt & Tiếng Anh với bộ chuyển đổi ngôn ngữ tức thời |
| 📥 **Xuất báo cáo CSV** | Xuất dữ liệu giao dịch ra file CSV chuẩn UTF-8 BOM, tương thích hoàn toàn tiếng Việt trên Excel |
| 🔍 **Lọc & tìm kiếm** | Lọc giao dịch theo ví, danh mục, loại (thu/chi), khoảng thời gian và phân trang linh hoạt |
| 📊 **Thống kê & Biểu đồ** | Biểu đồ cột thu/chi 6 tháng, biểu đồ tròn phân bổ chi tiêu theo danh mục với Recharts |
| ⚙️ **Hồ sơ & Bảo mật** | Cập nhật thông tin tài khoản, thống kê số ví/giao dịch sở hữu, đổi mật khẩu bảo mật mã hóa bcrypt |
| 📱 **Responsive** | Giao diện hiện đại, tối ưu trải nghiệm trên mọi kích thước màn hình |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — UI framework và build tool siêu tốc
- **Tailwind CSS 3** — Utility-first CSS kèm cấu hình Dark Mode class-based
- **react-i18next & i18next** — Framework quốc tế hóa đa ngôn ngữ (Tiếng Việt & English)
- **React Router 6** — Client-side routing với cơ chế ProtectedRoute
- **Recharts 2** — Thư viện biểu đồ cột và biểu đồ tròn tương tác cao
- **Axios** — HTTP client với request/response interceptors xử lý JWT tự động

### Backend
- **Node.js** + **Express 4** — RESTful API server theo kiến trúc nhiều tầng (Controller - Service)
- **PostgreSQL** + **node-postgres (pg)** — Hệ quản trị CSDL quan hệ với connection pool
- **bcryptjs** — Mã hóa mật khẩu an toàn với salt rounds = 12
- **jsonwebtoken** — Xác thực phiên làm việc stateless với JWT

---

## 📂 Cấu trúc dự án

```
personal-expense-tracker/
├── client/                          # React Frontend (Vite)
│   └── src/
│       ├── api/                     # Axios API calls
│       │   ├── axiosInstance.js     # Base instance + request/response interceptors
│       │   ├── authApi.js           # Login, Register, Profile, Change Password
│       │   ├── walletApi.js         # CRUD Wallets
│       │   ├── transactionApi.js    # CRUD Transactions
│       │   ├── categoryApi.js       # CRUD Categories
│       │   ├── statsApi.js          # Stats & Charts data
│       │   ├── budgetApi.js         # Budgets CRUD
│       │   ├── transferApi.js       # Wallet Transfers
│       │   └── recurringApi.js      # Recurring transactions / Subscriptions
│       ├── components/
│       │   ├── common/              # Button, Modal, Pagination, EmptyState, Badge, ConfirmDialog
│       │   ├── charts/              # MonthlyChart, CategoryChart (Recharts)
│       │   ├── layout/              # Sidebar, MainLayout, ProtectedRoute
│       │   ├── transactions/        # TransactionForm, List, Item, Filter
│       │   ├── wallets/             # WalletCard, WalletForm, TransferModal
│       │   ├── budgets/             # BudgetCard, BudgetForm, BudgetOverview
│       │   └── recurring/           # RecurringCard, RecurringForm
│       ├── context/                 # AuthContext, ThemeContext (Dark Mode)
│       ├── i18n/                    # Cấu hình đa ngôn ngữ (vi.json, en.json)
│       ├── hooks/                   # useAuth, useTheme, useWallets, useTransactions, useStats, useBudgets, useCategories, useRecurring
│       ├── pages/                   # DashboardPage, WalletsPage, TransactionsPage, BudgetsPage, RecurringPage, CategoriesPage, ProfilePage, Auth
│       └── utils/                   # formatCurrency, formatDate, exportCSV
│
├── server/                          # Express Backend API
│   ├── src/
│   │   ├── config/                  # Kết nối CSDL PostgreSQL (Pool)
│   │   ├── controllers/             # Tiếp nhận request & điều hướng
│   │   ├── services/                # Business logic & Database transactions
│   │   ├── routes/                  # Định nghĩa API routes
│   │   └── middlewares/             # Xác thực JWT (authMiddleware) & Xử lý lỗi (errorHandler)
│   └── database/                    # SQL scripts & Migration files
```

---

## 🔒 Thực tiễn bảo mật (Security Best Practices)

- **Password Hashing** — Sử dụng thuật toán `bcryptjs` với salt rounds = 12, không bao giờ lưu trữ mật khẩu thuần.
- **Phòng chống SQL Injection** — Sử dụng 100% Parameterized Queries (`$1, $2...`) thông qua PostgreSQL connection pool.
- **Phòng chống IDOR (Insecure Direct Object Reference)** — Mọi truy vấn đọc/ghi/sửa/xóa đều bắt buộc đối chiếu với `user_id` giải mã từ JWT của người dùng hiện tại.
- **Bảo vệ tính toàn vẹn danh mục hệ thống** — Danh mục mặc định (`is_default = true`) được bảo vệ không thể bị xóa hoặc sửa bởi bất kỳ người dùng nào.
- **Tính toàn vẹn dữ liệu (Atomic Multi-wallet Transactions)** — Sử dụng `BEGIN / COMMIT / ROLLBACK` của PostgreSQL khi tạo/sửa/xóa giao dịch hoặc chuyển quỹ giữa 2 ví, bảo đảm không bao giờ xảy ra lỗi sai lệch số dư.
- **Chống Email Enumeration** — Thông báo lỗi đăng nhập đồng nhất ("Email hoặc mật khẩu không đúng") để tránh việc kẻ xấu dò tìm tài khoản.

---

## 🗺️ Lộ trình phát triển

- [x] Bước 1 — Database Schema + API Xác thực (JWT)
- [x] Bước 2 — API Quản lý Ví (CRUD + IDOR protection)
- [x] Bước 3 — UI Xác thực & Quản lý Ví (React + Tailwind)
- [x] Bước 4 — API Giao dịch (CRUD + Dynamic Filter + Pagination)
- [x] Bước 5 — UI Giao dịch (Form, List, Filter, Pagination)
- [x] Bước 6 — Thống kê & Biểu đồ (Recharts BarChart + PieChart)
- [x] Bước 7 — Quản lý Ngân sách theo danh mục (Budget Tracker & Alerts)
- [x] Bước 8 — Export Báo cáo CSV (Hỗ trợ chuẩn tiếng Việt trên Excel)
- [x] Bước 9 — Chuyển tiền giữa các ví (Wallet Transfer & Rollback)
- [x] Bước 10 — Cài đặt Tài khoản & Đổi mật khẩu (Profile & Password Change)
- [x] Bước 11 — Quản lý danh mục chi tiêu tùy chỉnh (Custom Categories)
- [x] Bước 12 — Chi tiêu & Hóa đơn định kỳ (Recurring Subscriptions & Bills)
- [x] Bước 13 — Chế độ tối (Dark Mode) & Hỗ trợ đa ngôn ngữ (i18n)
- [ ] Bước 14 *(dự kiến)* — Đính kèm hóa đơn chứng từ hình ảnh & Cloud Storage

---

## 🤝 Đóng góp phát triển (Contributing)

Mọi đóng góp (Pull Request, Issue báo lỗi, Đề xuất tính năng) đều rất được hoan nghênh!

```bash
# 1. Tạo nhánh tính năng mới
git checkout -b feat/ten-tinh-nang

# 2. Commit thay đổi tuân theo Conventional Commits
git commit -m "feat(scope): mo ta tinh nang"

# 3. Push lên repository và tạo Pull Request
git push origin feat/ten-tinh-nang
```

**Quy ước commit:** `feat` | `fix` | `docs` | `refactor` | `style` | `test`

---

## 📄 License

Dự án được phân phối dưới giấy phép **MIT License** — © 2024 [vancuong2k4](https://github.com/vancuong2k4).

---

<div align="center">
  <sub>Xây dựng để học hỏi và áp dụng thực tế • Built to learn & grow 🚀</sub>
</div>
