<div align="center">

# 💰 Personal Expense Tracker

**Ứng dụng quản lý tài chính cá nhân toàn diện** — Theo dõi thu chi, quản lý số dư ví, luân chuyển dòng tiền nội bộ, thiết lập ngân sách danh mục và phân tích tài chính với biểu đồ trực quan.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
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
| 📥 **Xuất báo cáo CSV** | Xuất dữ liệu giao dịch ra file CSV chuẩn UTF-8 BOM, tương thích hoàn toàn tiếng Việt trên Excel |
| 🔍 **Lọc & tìm kiếm** | Lọc giao dịch theo ví, danh mục, loại (thu/chi), khoảng thời gian và phân trang linh hoạt |
| 📊 **Thống kê & Biểu đồ** | Biểu đồ cột thu/chi 6 tháng, biểu đồ tròn phân bổ chi tiêu theo danh mục với Recharts |
| ⚙️ **Hồ sơ & Bảo mật** | Cập nhật thông tin tài khoản, thống kê số ví/giao dịch sở hữu, đổi mật khẩu bảo mật mã hóa bcrypt |
| 📱 **Responsive** | Giao diện hiện đại, tối ưu trải nghiệm trên mọi kích thước màn hình |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — UI framework và build tool siêu tốc
- **Tailwind CSS 3** — Utility-first CSS cho giao diện hiện đại
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
│       │   ├── categoryApi.js       # Categories
│       │   ├── statsApi.js          # Stats & Charts data
│       │   ├── budgetApi.js         # Budgets CRUD
│       │   └── transferApi.js       # Wallet Transfers
│       ├── components/
│       │   ├── common/              # Button, Modal, Pagination, EmptyState, Badge, ConfirmDialog
│       │   ├── charts/              # MonthlyChart, CategoryChart (Recharts)
│       │   ├── layout/              # Sidebar, MainLayout, ProtectedRoute
│       │   ├── transactions/        # TransactionForm, List, Item, Filter
│       │   ├── wallets/             # WalletCard, WalletForm, TransferModal
│       │   └── budgets/             # BudgetCard, BudgetForm, BudgetOverview
│       ├── context/                 # AuthContext (quản lý phiên đăng nhập toàn cục)
│       ├── hooks/                   # useAuth, useWallets, useTransactions, useStats, useBudgets, useCategories
│       ├── pages/                   # DashboardPage, WalletsPage, TransactionsPage, BudgetsPage, ProfilePage, Auth
│       └── utils/                   # formatCurrency, formatDate, groupByDate, exportCSV
│
└── server/                          # Express Backend
    ├── database/
    │   ├── init.sql                 # Toàn bộ schema DDL + seed data
    │   ├── migration_budgets.sql    # Script bổ sung bảng budgets
    │   └── migration_transfers.sql  # Script bổ sung bảng transfers
    └── src/
        ├── config/db.js             # PostgreSQL connection pool & query wrapper
        ├── middlewares/             # authMiddleware (JWT), errorHandler
        ├── routes/                  # authRoutes, walletRoutes, transactionRoutes, statsRoutes, categoryRoutes, budgetRoutes, transferRoutes
        ├── controllers/             # Controller layer: validate request → gọi service → trả JSON
        └── services/                # Business logic layer + atomic database transactions
```

---

## 🗃️ Database Schema

```sql
users         -- Tài khoản người dùng (uuid PK, email UNIQUE, password_hash)
wallets       -- Ví của user (uuid PK, user_id FK, name, type, balance)
categories    -- Danh mục thu/chi (SERIAL PK, name, type, icon, is_default)
transactions  -- Giao dịch (uuid PK, user_id, wallet_id, category_id, type, amount)
budgets       -- Ngân sách chi tiêu tháng (uuid PK, user_id, category_id, amount, month)
transfers     -- Chuyển tiền giữa các ví (uuid PK, user_id, from_wallet_id, to_wallet_id, amount, fee)
```

**Ràng buộc & Quan hệ:**
- `users` → `wallets` → `transactions` ← `categories`
- `users` & `categories` → `budgets` với ràng buộc duy nhất `UNIQUE (user_id, category_id, month)`
- `wallets` (nguồn & đích) → `transfers` với kiểm tra ràng buộc `CONSTRAINT check_different_wallets CHECK (from_wallet_id <> to_wallet_id)`
- Tất cả khóa ngoại liên kết với `ON DELETE CASCADE` đảm bảo toàn vẹn dữ liệu.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu môi trường

- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone repository

```bash
git clone https://github.com/vancuong2k4/Personal-Expense-Tracker.git
cd Personal-Expense-Tracker
```

### 2. Cài đặt Backend

```bash
cd server
npm install

# Tạo file .env từ mẫu
cp .env.example .env
```

Chỉnh sửa thông số trong `server/.env`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/expense_tracker
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
```

Khởi tạo CSDL:

```bash
# Tạo database và chạy file schema
createdb expense_tracker
psql -d expense_tracker -f database/init.sql

# Khởi động server (dev mode với nodemon)
npm run dev
```

> Server chạy tại `http://localhost:5000`

### 3. Cài đặt Frontend

```bash
cd ../client
npm install

# Tạo file .env từ mẫu
cp .env.example .env
```

Nội dung `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Khởi động ứng dụng React:

```bash
npm run dev
```

> Ứng dụng chạy tại `http://localhost:3000`

---

## 📡 API Reference

### Authentication & Profile

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |
| `GET` | `/api/auth/profile` | Xem thông tin tài khoản & thống kê số ví/giao dịch | ✅ |
| `PUT` | `/api/auth/profile` | Cập nhật thông tin cá nhân (Họ tên) | ✅ |
| `PUT` | `/api/auth/change-password` | Đổi mật khẩu bảo mật (verify mật khẩu cũ) | ✅ |

### Wallets

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/wallets` | Danh sách ví của user | ✅ |
| `POST` | `/api/wallets` | Tạo ví mới | ✅ |
| `PUT` | `/api/wallets/:id` | Cập nhật thông tin ví | ✅ |
| `DELETE` | `/api/wallets/:id` | Xóa ví | ✅ |

### Wallet Transfers (Chuyển tiền giữa các ví)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/transfers` | Chuyển tiền giữa 2 ví (trừ ví nguồn + phí, cộng ví đích) | ✅ |
| `GET` | `/api/transfers` | Lấy lịch sử chuyển tiền phân trang `?page=1&limit=20` | ✅ |
| `DELETE` | `/api/transfers/:id` | Hủy lượt chuyển tiền & tự động hoàn trả số dư nguyên tử | ✅ |

### Transactions

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/transactions` | Danh sách giao dịch (hỗ trợ filter + pagination) | ✅ |
| `POST` | `/api/transactions` | Tạo giao dịch + cập nhật số dư ví nguyên tử | ✅ |
| `PUT` | `/api/transactions/:id` | Sửa giao dịch + điều chỉnh số dư | ✅ |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch + hoàn trả số dư | ✅ |

**Query parameters hỗ trợ:**
```
?wallet_id=<uuid>&category_id=<int>&type=income|expense&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&limit=15
```

### Budgets (Quản lý Ngân sách)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/budgets` | Lấy danh sách ngân sách kèm tiến độ chi tiêu `?month=YYYY-MM` | ✅ |
| `POST` | `/api/budgets` | Thiết lập hoặc cập nhật hạn mức ngân sách (UPSERT) | ✅ |
| `DELETE` | `/api/budgets/:id` | Xóa ngân sách theo ID | ✅ |

### Statistics (Thống kê)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/stats/overview` | Tổng quan tài chính tháng hiện tại | ✅ |
| `GET` | `/api/stats/monthly` | Thu/chi theo tháng `?months=6` | ✅ |
| `GET` | `/api/stats/by-category` | Phân bổ chi tiêu theo danh mục `?type=expense&month=YYYY-MM` | ✅ |

### Categories

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/categories` | Danh sách danh mục hệ thống | ✅ |

---

## 🔒 Thực tiễn bảo mật (Security Best Practices)

- **Password Hashing** — Sử dụng thuật toán `bcryptjs` với salt rounds = 12, không bao giờ lưu trữ mật khẩu thuần.
- **Phòng chống SQL Injection** — Sử dụng 100% Parameterized Queries (`$1, $2...`) thông qua PostgreSQL connection pool.
- **Phòng chống IDOR (Insecure Direct Object Reference)** — Mọi truy vấn đọc/ghi/sửa/xóa đều bắt buộc đối chiếu với `user_id` giải mã từ JWT của người dùng hiện tại.
- **Xác thực phiên tập trung** — `authMiddleware` xác thực Bearer JWT trước khi chuyển tiếp vào các API tài nguyên được bảo vệ.
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
- [ ] Bước 11 *(dự kiến)* — Nhắc nhở & thông báo tài chính định kỳ
- [ ] Bước 12 *(dự kiến)* — Quản lý danh mục chi tiêu tùy chỉnh (Custom Categories)

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
