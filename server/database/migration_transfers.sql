-- ============================================================
-- Migration: Add Transfers Table (Chuyển tiền giữa các ví)
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
