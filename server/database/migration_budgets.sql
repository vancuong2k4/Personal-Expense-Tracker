-- ============================================================
-- Migration: Add Budgets Table
-- ============================================================

CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  month       VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM' (vd: '2024-11')
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_category_month UNIQUE (user_id, category_id, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
