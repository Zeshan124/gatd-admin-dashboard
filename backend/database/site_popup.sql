-- GATD — Website popup (single-row) shown to visitors shortly after the site opens.
-- Usage:  mysql -u root gatd < database/site_popup.sql   (safe to re-run)
-- Managed from Admin → Website Popup.

SET NAMES utf8mb4;

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
