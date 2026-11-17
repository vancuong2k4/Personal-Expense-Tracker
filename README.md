<div align="center">

# 💰 Personal Expense Tracker

**Ứng dụng quản lý tài chính cá nhân** — Theo dõi thu chi, quản lý ví và phân tích tài chính với biểu đồ trực quan.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực** | Đăng ký / Đăng nhập với JWT, tự động logout khi token hết hạn |
| 👛 **Quản lý ví** | Tạo và quản lý nhiều ví (Tiền mặt, Ngân hàng, Thẻ tín dụng) |
| 💸 **Giao dịch** | Ghi chép thu/chi với danh mục, ghi chú, cập nhật số dư ví tự động |
| 🔍 **Lọc & tìm kiếm** | Lọc giao dịch theo ví, danh mục, loại (thu/chi), khoảng thời gian |
| 📊 **Thống kê** | Biểu đồ cột thu/chi 6 tháng, biểu đồ tròn phân bổ theo danh mục |
| 📱 **Responsive** | Giao diện thích ứng desktop, hỗ trợ sidebar navigation |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — UI framework và build tool
- **Tailwind CSS 3** — Utility-first CSS
- **React Router 6** — Client-side routing với ProtectedRoute
- **Recharts 2** — Biểu đồ cột và biểu đồ tròn
- **Axios** — HTTP client với request/response interceptors

### Backend
- **Node.js** + **Express 4** — REST API server
- **PostgreSQL** + **node-postgres (pg)** — Database với connection pool
- **bcryptjs** — Mã hóa mật khẩu (salt rounds = 12)
- **jsonwebtoken** — JWT authentication

---

## 📂 Cấu trúc dự án

```
personal-expense-tracker/
├── client/                          # React Frontend (Vite)
│   └── src/
│       ├── api/                     # Axios API calls
│       │   ├── axiosInstance.js     # Base instance + interceptors
│       │   ├── authApi.js
│       │   ├── walletApi.js
│       │   ├── transactionApi.js
│       │   ├── categoryApi.js
│       │   └── statsApi.js
│       ├── components/
│       │   ├── common/              # Button, Modal, Pagination, EmptyState...
│       │   ├── charts/              # MonthlyChart, CategoryChart (Recharts)
│       │   ├── layout/              # Sidebar, MainLayout, ProtectedRoute
│       │   ├── transactions/        # TransactionForm, List, Item, Filter
│       │   └── wallets/             # WalletCard, WalletForm
│       ├── context/                 # AuthContext (global user/token state)
│       ├── hooks/                   # useAuth, useWallets, useTransactions, useStats...
│       ├── pages/                   # DashboardPage, WalletsPage, TransactionsPage, Auth
│       └── utils/                   # formatCurrency, formatDate, groupByDate
│
└── server/                          # Express Backend
    ├── database/
    │   └── init.sql                 # Schema DDL + seed data
    └── src/
        ├── config/db.js             # PostgreSQL connection pool
        ├── middlewares/             # authMiddleware (JWT), errorHandler
        ├── routes/                  # authRoutes, walletRoutes, transactionRoutes, statsRoutes
        ├── controllers/             # Thin layer: validate → call service → respond
        └── services/                # Business logic + DB queries
```

---

## 🗃️ Database Schema

```sql
users         -- Tài khoản người dùng (uuid PK, email UNIQUE, password_hash)
wallets       -- Ví của user (uuid PK, user_id FK, name, type, balance)
categories    -- Danh mục thu/chi (SERIAL PK, name, type, icon, is_default)
transactions  -- Giao dịch (uuid PK, user_id, wallet_id, category_id, type, amount)
```

**Quan hệ:** `users` → `wallets` → `transactions` ← `categories` (tất cả dùng `ON DELETE CASCADE`)

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

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

Chỉnh sửa `server/.env`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/expense_tracker
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
```

```bash
# Tạo database và chạy schema
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

`client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

> App chạy tại `http://localhost:3000`

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |

### Wallets

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/wallets` | Danh sách ví của user | ✅ |
| `POST` | `/api/wallets` | Tạo ví mới | ✅ |
| `PUT` | `/api/wallets/:id` | Cập nhật ví | ✅ |
| `DELETE` | `/api/wallets/:id` | Xóa ví | ✅ |

### Transactions

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/transactions` | Danh sách giao dịch (hỗ trợ filter + pagination) | ✅ |
| `POST` | `/api/transactions` | Tạo giao dịch + cập nhật số dư ví (atomic) | ✅ |
| `PUT` | `/api/transactions/:id` | Sửa giao dịch + điều chỉnh số dư | ✅ |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch + hoàn trả số dư | ✅ |

**Query params cho GET `/api/transactions`:**

```
?wallet_id=<uuid>   &category_id=<int>   &type=income|expense
&start_date=YYYY-MM-DD   &end_date=YYYY-MM-DD   &page=1   &limit=15
```

### Statistics

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/stats/overview` | Tổng quan tháng hiện tại | ✅ |
| `GET` | `/api/stats/monthly` | Thu/chi theo tháng `?months=6` | ✅ |
| `GET` | `/api/stats/by-category` | Phân bổ theo danh mục `?type=expense&month=YYYY-MM` | ✅ |

### Categories

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/categories` | Danh sách danh mục mặc định | ✅ |

---

## 🔒 Bảo mật

- **Password hashing** — `bcryptjs` với salt rounds = 12, không bao giờ lưu raw password
- **SQL Injection** — 100% parameterized queries (`$1, $2...`), không string interpolation
- **IDOR Attack** — Mọi query đều filter theo `user_id` lấy từ JWT, không từ request body
- **JWT Middleware** — Verify token trước khi vào bất kỳ protected route nào
- **Atomic Transactions** — `BEGIN/COMMIT/ROLLBACK` đảm bảo nhất quán khi thao tác giao dịch + số dư
- **Email Enumeration** — Trả cùng thông báo lỗi cho "email không tồn tại" và "sai password"

---

## 🗺️ Lộ trình phát triển

- [x] Bước 1 — Database Schema + API Xác thực (JWT)
- [x] Bước 2 — API Quản lý Ví (CRUD + IDOR protection)
- [x] Bước 3 — UI Xác thực & Quản lý Ví (React + Tailwind)
- [x] Bước 4 — API Giao dịch (CRUD + Dynamic Filter + Pagination)
- [x] Bước 5 — UI Giao dịch (Form, List, Filter, Pagination)
- [x] Bước 6 — Thống kê & Biểu đồ (Recharts BarChart + PieChart)
- [ ] Bước 7 *(dự kiến)* — Export báo cáo CSV/PDF
- [ ] Bước 8 *(dự kiến)* — Ngân sách theo danh mục (Budget Tracker)
- [ ] Bước 9 *(dự kiến)* — Nhắc nhở & thông báo định kỳ

---

## 🤝 Contributing

Pull requests are welcome! Vui lòng tạo issue trước để thảo luận về thay đổi lớn.

```bash
# Fork repo → tạo branch mới
git checkout -b feat/your-feature-name

# Commit theo convention
git commit -m "feat(scope): description"

# Push và tạo Pull Request
git push origin feat/your-feature-name
```

**Commit convention:** `feat` | `fix` | `docs` | `refactor` | `style` | `test`

---

## 📄 License

MIT License — © 2024 [vancuong2k4](https://github.com/vancuong2k4)

---

<div align="center">
  <sub>Xây dựng để học • Built to learn 🚀</sub>
</div>
