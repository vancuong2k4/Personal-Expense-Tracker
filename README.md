# 💰 Personal Expense Tracker

Dự án quản lý tài chính cá nhân được xây dựng với React, Node.js/Express và PostgreSQL.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts
- **Backend:** Node.js, Express
- **Database:** PostgreSQL

## Tính năng

- Xác thực người dùng (JWT)
- Quản lý ví / tài khoản
- Quản lý giao dịch thu/chi
- Thống kê & biểu đồ theo tháng

## Khởi chạy dự án

### Backend
```bash
cd server
npm install
cp .env.example .env   # Điền thông tin DB và JWT_SECRET
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env   # Điền VITE_API_BASE_URL
npm run dev
```
