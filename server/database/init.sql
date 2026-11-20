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
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  -- type: 'income' | 'expense'
  type        VARCHAR(10) NOT NULL,
  icon        VARCHAR(50),
  -- is_default = true: danh mục hệ thống, seed sẵn cho mọi user
  is_default  BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

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
-- BẢNG 5: budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  month       VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_category_month UNIQUE (user_id, category_id, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- ============================================================
-- BẢNG 6: transfers (Chuyển tiền giữa các ví)
-- ============================================================
CREATE TABLE IF NOT EXISTS transfers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_wallet_id  UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  to_wallet_id    UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  fee             DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
  note            TEXT,
  transfer_date   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_different_wallets CHECK (from_wallet_id <> to_wallet_id)
);

CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON transfers(user_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_from_wallet ON transfers(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_wallet ON transfers(to_wallet_id);

-- ============================================================
-- BẢNG 7: recurring_transactions (Giao dịch & Hóa đơn định kỳ)
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id        UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  category_id      INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type             VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount           DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  frequency        VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  note             TEXT,
  next_due_date    DATE NOT NULL,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_due ON recurring_transactions(user_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_wallet ON recurring_transactions(wallet_id);

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
