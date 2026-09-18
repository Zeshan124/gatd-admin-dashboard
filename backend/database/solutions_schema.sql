-- GATD — Solutions & Programs (content/CMS) schema (MySQL 8+ / MariaDB 10.4+)
-- Usage:  mysql -u root gatd < database/solutions_schema.sql
--
-- Nested/variable content (gains, faqs, layout_data, …) is stored as JSON.
-- Soft delete uses delete_status (0/1), consistent with the rest of the app.
-- Money is integer minor units (price_cents). Times are UTC.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- parent_solutions — top-level catalog categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_solutions (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(120) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT         NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order    INT          NOT NULL DEFAULT 0,
  delete_status TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_parent_slug (slug),
  KEY idx_parent_active (is_active),
  KEY idx_parent_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- child_solutions — a solution page under a parent category
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS child_solutions (
  id                  BIGINT       NOT NULL AUTO_INCREMENT,
  parent_solution_id  BIGINT       NOT NULL,
  slug                VARCHAR(120) NOT NULL,
  eyebrow             VARCHAR(120) NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT         NOT NULL,
  subheading          VARCHAR(255) NULL,
  subtext             TEXT         NULL,
  banner              VARCHAR(500) NULL,
  card_image          VARCHAR(500) NULL,
  programmes_heading  VARCHAR(255) NULL,
  map_image           VARCHAR(500) NULL,
  gains_heading       VARCHAR(255) NULL,
  gains               JSON         NULL,
  why_heading         VARCHAR(255) NULL,
  why_badge           VARCHAR(255) NULL,
  why_image           VARCHAR(500) NULL,
  audience_badge      VARCHAR(255) NULL,
  audience_heading    VARCHAR(255) NULL,
  audience_image      VARCHAR(500) NULL,
  audience            JSON         NULL,
  brochure            VARCHAR(500) NULL,
  video_url           VARCHAR(500) NULL,                 -- gated program video (YouTube/Vimeo/MP4 URL)
  is_clickable        TINYINT(1)   NOT NULL DEFAULT 1,   -- does the /solutions card link out?
  link_url            VARCHAR(500) NULL,                 -- custom link; empty → /solutions/<slug>
  rating              DECIMAL(2,1) NULL,
  reviews             INT          NOT NULL DEFAULT 0,
  rating_enabled      TINYINT(1)   NOT NULL DEFAULT 1,   -- show the rating on the public site?
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order          INT          NOT NULL DEFAULT 0,
  delete_status       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_child_slug (slug),
  KEY idx_child_parent (parent_solution_id),
  KEY idx_child_active (is_active),
  KEY idx_child_sort (sort_order),
  CONSTRAINT fk_child_parent FOREIGN KEY (parent_solution_id)
    REFERENCES parent_solutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- solution_programs — full program detail page under a child solution
-- (distinct from the registrations `programs` pricing catalog)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solution_programs (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  child_solution_id    BIGINT       NOT NULL,
  slug                 VARCHAR(120) NOT NULL,
  eyebrow              VARCHAR(120) NULL,
  title                VARCHAR(255) NOT NULL,
  description          TEXT         NOT NULL,
  banner               VARCHAR(500) NULL,
  card_image           VARCHAR(500) NULL,
  subheading           VARCHAR(255) NULL,
  subtext              TEXT         NULL,
  rating               DECIMAL(2,1) NULL,
  reviews              INT          NOT NULL DEFAULT 0,
  rating_enabled       TINYINT(1)   NOT NULL DEFAULT 1,   -- show the rating on the public site?
  price_cents          INT          NULL,
  currency             CHAR(3)      NOT NULL DEFAULT 'SGD',
  pricing_period       VARCHAR(40)  NULL,
  pricing_heading      VARCHAR(120) NULL,
  pricing_description  TEXT         NULL,
  pricing_note         VARCHAR(255) NULL,                 -- alt text shown when price isn't finalised
  brochure             VARCHAR(500) NULL,
  video_url            VARCHAR(500) NULL,                 -- gated program video (YouTube/Vimeo/MP4 URL)
  is_clickable         TINYINT(1)   NOT NULL DEFAULT 1,   -- does the programme card link out?
  link_url             VARCHAR(500) NULL,                 -- custom link; empty → /solutions/<child>/<slug>
  registration_heading VARCHAR(255) NULL,
  show_accredited_by   TINYINT(1)   NOT NULL DEFAULT 1,   -- show the "Accredited By" section?
  show_registration    TINYINT(1)   NOT NULL DEFAULT 1,   -- show the registration form section?
  accredited_heading   VARCHAR(255) NULL,                 -- per-program "Accredited By" heading (else global)
  accredited_logos     JSON         NULL,                 -- per-program logos [{name,logo}] (else global)
  overview             JSON         NULL,
  gains_heading        VARCHAR(255) NULL,
  gains                JSON         NULL,
  focus_heading        VARCHAR(255) NULL,
  focus_areas          JSON         NULL,
  faqs                 JSON         NULL,
  facilitator          JSON         NULL,
  certification        JSON         NULL,
  layout_type          VARCHAR(40)  NULL,
  layout_data          JSON         NULL,
  is_published         TINYINT(1)   NOT NULL DEFAULT 1,
  is_active            TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order           INT          NOT NULL DEFAULT 0,
  delete_status        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_program_slug (slug),
  KEY idx_program_child (child_solution_id),
  KEY idx_program_active (is_active),
  KEY idx_program_published (is_published),
  KEY idx_program_sort (sort_order),
  CONSTRAINT fk_program_child FOREIGN KEY (child_solution_id)
    REFERENCES child_solutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
