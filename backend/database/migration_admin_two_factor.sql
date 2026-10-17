-- Migration: Two-factor authentication (Google Authenticator / any TOTP app)
-- for dashboard accounts. Run once (phpMyAdmin → Import). MariaDB-safe.
--
--   totp_secret       — the account's authenticator key, encrypted (AES-256-GCM)
--   totp_enabled      — 1 once the person has scanned the QR code and confirmed a code
--   totp_last_step    — last accepted 30-second step (stops a code being re-used)
--   totp_backup_codes — JSON array of hashed one-time backup codes
--   totp_enabled_at   — when 2FA was switched on
--
-- 2FA is required for everyone: accounts with totp_enabled = 0 are asked to set
-- it up (scan a QR code) the next time they sign in.

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS totp_secret       VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS totp_enabled      TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS totp_last_step    BIGINT       NULL,
  ADD COLUMN IF NOT EXISTS totp_backup_codes JSON         NULL,
  ADD COLUMN IF NOT EXISTS totp_enabled_at   TIMESTAMP    NULL;
