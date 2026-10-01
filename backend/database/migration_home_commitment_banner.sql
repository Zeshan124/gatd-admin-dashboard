-- Homepage-only Commitment Banner settings.
-- Run once (phpMyAdmin -> Import). MariaDB-safe (IF NOT EXISTS).

ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS home_commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS home_show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS home_show_commitment_cta TINYINT(1) NOT NULL DEFAULT 0;