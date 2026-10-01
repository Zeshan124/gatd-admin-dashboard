-- Per-program controls for the bottom Commitment banner CTA.
-- Run once (phpMyAdmin -> Import). MariaDB-safe (IF NOT EXISTS).

ALTER TABLE parent_solutions
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE child_solutions
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta TINYINT(1) NOT NULL DEFAULT 1;