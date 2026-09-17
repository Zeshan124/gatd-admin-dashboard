-- ============================================================================
-- GATD — Consolidated production migration (idempotent; safe to re-run).
-- MariaDB 10.x / cPanel. Import ONCE via phpMyAdmin -> Import. Uses IF NOT EXISTS
-- so any change already applied is skipped without error. Column positions are
-- omitted on purpose (order is cosmetic; the app references columns by name).
--
-- Covers every schema change accumulated since the last deploy:
--   * blogs.views                          (blog viewer count)
--   * child_solutions   clickable/link/rating_enabled/video_url
--   * solution_programs clickable/link/rating_enabled/video_url
--   * solution_programs show_accredited_by/show_registration (section toggles)
--   * solution_programs pricing_note (alt text when price not finalised)
--   * company_profile   table              (header Company Profile popup)
--   * newsletter_subscribers table         (footer newsletter form)
--   * accreditation_settings table         (Program pages "Accredited By" heading + logos)
--
-- NOTE: the MADANI subprogram content is NOT here — import madani_subprogram.sql
-- separately (after editing its @parent_slug), it is a one-time content insert.
-- ============================================================================
SET NAMES utf8mb4;

-- Blog viewer count -----------------------------------------------------------
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;

-- Programs (child_solutions) --------------------------------------------------
ALTER TABLE child_solutions
  ADD COLUMN IF NOT EXISTS is_clickable   TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS link_url       VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS rating_enabled TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS video_url      VARCHAR(500) NULL;

-- Subprograms (solution_programs) ---------------------------------------------
ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS is_clickable       TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS link_url           VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS rating_enabled     TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS video_url          VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_accredited_by TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_registration  TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pricing_note       VARCHAR(255) NULL;

-- Company Profile (header popup) — singleton settings row ---------------------
CREATE TABLE IF NOT EXISTS company_profile (
  id           TINYINT      NOT NULL DEFAULT 1,
  is_enabled   TINYINT(1)   NOT NULL DEFAULT 1,
  eyebrow      VARCHAR(120) NULL,
  heading      VARCHAR(255) NULL,
  description  TEXT         NULL,
  button_label VARCHAR(80)  NULL,
  pdf_url      VARCHAR(500) NULL,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO company_profile (id, is_enabled, eyebrow, heading, description, button_label, pdf_url)
VALUES (1, 1, 'Company Profile', 'Download Our Company Profile',
        'Enter your details and we will share the GATD company profile with you.',
        'Company Profile', '/brochures/GATD-Company-Profile.pdf')
ON DUPLICATE KEY UPDATE id = id;

-- Newsletter subscribers (footer form) ----------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  name          VARCHAR(160) NULL,
  status        VARCHAR(24)  NOT NULL DEFAULT 'subscribed',
  source_page   VARCHAR(255) NULL,
  ip_address    VARCHAR(45)  NULL,
  user_agent    TEXT         NULL,
  delete_status TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_email (email),
  KEY idx_newsletter_status (status),
  KEY idx_newsletter_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- "Accredited By" settings (Program pages) — shared heading + logos ------------
CREATE TABLE IF NOT EXISTS accreditation_settings (
  id         TINYINT      NOT NULL DEFAULT 1,
  heading    VARCHAR(255) NULL,
  logos      JSON         NULL,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO accreditation_settings (id, heading, logos)
VALUES (1, 'Accredited By',
  '[{"name":"European Council for Business Education","logo":"/images/solutions/strategic-hr/1.png"},{"name":"QS Stars Rating System - Online Learning","logo":"/images/solutions/strategic-hr/2.png"},{"name":"ACBSP Global Business Accreditation","logo":"/images/solutions/strategic-hr/3.png"},{"name":"ASIC Accreditation Service for International Colleges","logo":"/images/solutions/strategic-hr/4.png"},{"name":"Business Graduates Association Member","logo":"/images/solutions/strategic-hr/5.png"},{"name":"ATHEA","logo":"/images/solutions/strategic-hr/6.jpg"},{"name":"Cambridge International Academics","logo":"/images/solutions/strategic-hr/7.jpg"}]')
ON DUPLICATE KEY UPDATE id = id;
