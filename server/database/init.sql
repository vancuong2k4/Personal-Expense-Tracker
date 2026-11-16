-- ============================================================
-- Personal Expense Tracker — Database Initialization Script
-- Chạy file này một lần để tạo toàn bộ bảng
-- ============================================================

-- Bật extension để dùng uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BẢNG 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index trên email vì ta hay query: WHERE email = $1
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- BẢNG 2: wallets
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  -- type: 'cash' | 'bank' | 'credit'
  type        VARCHAR(20) NOT NULL DEFAULT 'cash',
  balance     DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency    VARCHAR(10) NOT NULL DEFAULT 'VND',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- ============================================================
-- BẢNG 3: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  -- type: 'income' | 'expense'
  type        VARCHAR(10) NOT NULL,
  icon        VARCHAR(50),
  -- is_default = true: danh mục hệ thống, seed sẵn cho mọi user
  is_default  BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- BẢNG 4: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id        UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  category_id      INT NOT NULL REFERENCES categories(id),
  -- type: 'income' | 'expense'
  type             VARCHAR(10) NOT NULL,
  amount           DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  note             TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index kép: query thường gặp là "lấy tất cả giao dịch của user, sort theo ngày"
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id
  ON transactions(wallet_id);

-- ============================================================
-- SEED DATA: Danh mục mặc định (chạy 1 lần)
-- ============================================================
INSERT INTO categories (name, type, icon) VALUES
  -- Thu nhập
  ('Lương', 'income', '💼'),
  ('Thưởng', 'income', '🎁'),
  ('Đầu tư', 'income', '📈'),
  ('Khác (Thu)', 'income', '💰'),
  -- Chi tiêu
  ('Ăn uống', 'expense', '🍜'),
  ('Di chuyển', 'expense', '🚗'),
  ('Mua sắm', 'expense', '🛍️'),
  ('Hóa đơn & Tiện ích', 'expense', '💡'),
  ('Giải trí', 'expense', '🎬'),
  ('Sức khỏe', 'expense', '🏥'),
  ('Giáo dục', 'expense', '📚'),
  ('Khác (Chi)', 'expense', '💸')
ON CONFLICT DO NOTHING;
