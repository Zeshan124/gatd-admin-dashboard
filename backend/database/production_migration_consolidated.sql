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
--   * solution_programs accredited_heading/accredited_logos (per-program Accredited By)
--   * solution_programs focus_image (per-program "Certification Focuses on Developing" image)
--   * solution_programs hero_logos (per-program hero logos, between title & rating)
--   * parent_solutions eyebrow/banner/middle_* (individual Solution pages)
--   * solution_programs brochure/register/video_button_text (editable hero CTA labels)
--   * solution_programs programme_dates/location ("Programme Details" section)
--   * company_profile   table              (header Company Profile popup)
--   * newsletter_subscribers table         (footer newsletter form)
--   * accreditation_settings table         (Program pages "Accredited By" heading + logos)
--   * site_popup        table              (website popup shown on site open)
--
-- NOTE: the MADANI subprogram content is NOT here — import madani_subprogram.sql
-- separately (after editing its @parent_slug), it is a one-time content insert.
-- ============================================================================
SET NAMES utf8mb4;

-- Blog viewer count -----------------------------------------------------------
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;

-- Solutions (parent_solutions) — individual Solution pages ---------------------
ALTER TABLE parent_solutions
  ADD COLUMN IF NOT EXISTS eyebrow        VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS banner         VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS middle_image   VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS middle_badge   VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS middle_heading VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS middle_body    TEXT         NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_clickable   TINYINT(1)   NOT NULL DEFAULT 1;

-- Programs (child_solutions) --------------------------------------------------
ALTER TABLE child_solutions
  ADD COLUMN IF NOT EXISTS is_clickable   TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS link_url       VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS rating_enabled TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS video_url      VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta TINYINT(1) NOT NULL DEFAULT 1;

-- Subprograms (solution_programs) ---------------------------------------------
ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS is_clickable       TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS link_url           VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS rating_enabled     TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS video_url          VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_accredited_by TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_registration  TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pricing_note       VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS accredited_heading VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS accredited_logos   JSON         NULL,
  ADD COLUMN IF NOT EXISTS focus_image        VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS hero_logos         JSON         NULL,
  ADD COLUMN IF NOT EXISTS brochure_button_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS register_button_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS video_button_text    VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_text  VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS commitment_cta_url   VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_commitment_cta  TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS programme_dates      VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS location             VARCHAR(160) NULL;

-- Company Profile (header popup) — singleton settings row ---------------------
CREATE TABLE IF NOT EXISTS company_profile (
  id           TINYINT      NOT NULL DEFAULT 1,
  is_enabled   TINYINT(1)   NOT NULL DEFAULT 1,
  eyebrow      VARCHAR(120) NULL,
  heading      VARCHAR(255) NULL,
  description  TEXT         NULL,
  button_label VARCHAR(80)  NULL,
  pdf_url      VARCHAR(500) NULL,
  home_commitment_banner_eyebrow VARCHAR(160) NULL,
  home_commitment_banner_heading VARCHAR(500) NULL,
  home_commitment_cta_text VARCHAR(100) NULL,
  home_commitment_cta_url VARCHAR(500) NULL,
  home_show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  home_show_commitment_cta TINYINT(1) NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS home_commitment_banner_eyebrow VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_banner_heading VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_cta_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_commitment_cta_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS home_show_commitment_banner TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS home_show_commitment_cta TINYINT(1) NOT NULL DEFAULT 0;

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

-- Website popup (shown on site open) — singleton settings row -----------------
CREATE TABLE IF NOT EXISTS site_popup (
  id               TINYINT      NOT NULL DEFAULT 1,     -- singleton row (always 1)
  is_enabled       TINYINT(1)   NOT NULL DEFAULT 0,     -- show the popup at all?
  show_from        DATE         NULL,                   -- display window start (inclusive, optional)
  show_until       DATE         NULL,                   -- display window end (inclusive, optional)
  frequency        VARCHAR(16)  NOT NULL DEFAULT 'session', -- session | daily | always
  delay_seconds    TINYINT      NOT NULL DEFAULT 1,     -- seconds after page load
  eyebrow          VARCHAR(120) NULL,                   -- "UPCOMING PROGRAMME"
  title_highlight  VARCHAR(160) NULL,                   -- red part of the title
  title            VARCHAR(255) NULL,                   -- dark part of the title
  description      TEXT         NULL,
  start_date       DATE         NULL,                   -- programme dates
  end_date         DATE         NULL,
  location_city    VARCHAR(120) NULL,
  location_country VARCHAR(120) NULL,
  price_label      VARCHAR(60)  NULL,                   -- "Investment"
  price            VARCHAR(60)  NULL,                   -- "SGD 4,500"
  price_unit       VARCHAR(40)  NULL,                   -- "/person"
  badge_text       VARCHAR(120) NULL,                   -- "10% Group Discount (5+)"
  button_text      VARCHAR(80)  NULL,
  button_url       VARCHAR(500) NULL,
  image            VARCHAR(500) NULL,                   -- right-hand image
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the single row (no-op if it already exists). Starts DISABLED — upload an
-- image and switch it on from the dashboard.
INSERT INTO site_popup (id, is_enabled, frequency, delay_seconds, eyebrow, title_highlight, title, description,
  start_date, end_date, location_city, location_country, price_label, price, price_unit, badge_text, button_text, button_url)
VALUES (1, 0, 'session', 1, 'Upcoming Programme', 'Strategic Leadership', 'for Public Sector Transformation',
  'A 5-day executive development programme designed to strengthen leadership capability, human capital, policy execution, digital governance and future-ready public-sector leadership.',
  '2026-11-23', '2026-11-27', 'Kuala Lumpur', 'Malaysia', 'Investment', 'SGD 4,500', '/person',
  '10% Group Discount (5+)', 'Explore the Programme', '/solutions')
ON DUPLICATE KEY UPDATE id = id;
