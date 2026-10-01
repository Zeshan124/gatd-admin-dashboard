-- GATD — Company Profile settings (single-row) for the header popup.
-- Usage:  mysql -u root gatd < database/company_profile.sql   (safe to re-run)
-- Managed from Admin → Company Profile. The popup reuses the brochure-leads
-- pipeline (source_type = 'company_profile').

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS company_profile (
  id           TINYINT      NOT NULL DEFAULT 1,   -- singleton row (always 1)
  is_enabled   TINYINT(1)   NOT NULL DEFAULT 1,   -- show the header button?
  eyebrow      VARCHAR(120) NULL,                 -- small label in the popup
  heading      VARCHAR(255) NULL,                 -- popup title
  description  TEXT         NULL,                 -- helper/privacy text
  button_label VARCHAR(80)  NULL,                 -- header button text
  pdf_url      VARCHAR(500) NULL,                 -- the profile PDF delivered on submit
  home_commitment_banner_eyebrow VARCHAR(160) NULL,
  home_commitment_banner_heading VARCHAR(500) NULL,
  home_commitment_cta_text VARCHAR(100) NULL,
  home_commitment_cta_url VARCHAR(500) NULL,
  home_show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  home_show_commitment_cta TINYINT(1) NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the single settings row (no-op if it already exists).
INSERT INTO company_profile (id, is_enabled, eyebrow, heading, description, button_label, pdf_url)
VALUES (1, 1, 'Company Profile', 'Download Our Company Profile',
        'Enter your details and we will share the GATD company profile with you.',
        'Company Profile', '/brochures/GATD-Company-Profile.pdf')
ON DUPLICATE KEY UPDATE id = id;
