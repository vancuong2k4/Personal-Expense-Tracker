-- ============================================================
-- Migration: Add user_id to categories & create recurring_transactions
-- ============================================================

-- 1. Bổ sung user_id vào bảng categories để hỗ trợ danh mục tùy chỉnh
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 2. Bảng recurring_transactions: Quản lý chi tiêu định kỳ và nhắc nợ/hóa đơn
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
