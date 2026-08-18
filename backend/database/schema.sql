-- GATD — Program Registrations schema (MySQL 8+)
-- Usage:  mysql -u root gatd < database/schema.sql
--
-- Money is stored as integer minor units (cents). SGD 3,850 -> 385000.
-- Times are stored as UTC TIMESTAMPs (the app sets the connection tz to +00:00).

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- programs — catalog + authoritative pricing (server never trusts the client)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(120) NOT NULL,               -- stable id, used by the form/API
  title       VARCHAR(255) NOT NULL,
  price_cents INT          NOT NULL,               -- integer minor units, >= 0
  currency    CHAR(3)      NOT NULL DEFAULT 'SGD',
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_slug (slug),
  CONSTRAINT chk_programs_price CHECK (price_cents >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- registrations — one row per submitted form
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id                 BIGINT       NOT NULL AUTO_INCREMENT,
  reference_no       VARCHAR(20)  NOT NULL,        -- human-friendly, e.g. REG-2026-000123
  -- applicant
  first_name         VARCHAR(120) NOT NULL,
  last_name          VARCHAR(120) NULL,            -- optional / future
  email              VARCHAR(255) NOT NULL,
  phone_country      CHAR(2)      NOT NULL,        -- ISO-2, e.g. 'AE'
  phone_dial_code    VARCHAR(6)   NOT NULL,        -- derived from country, e.g. '+971'
  phone_number       VARCHAR(32)  NOT NULL,        -- national number, digits-normalized
  country            VARCHAR(120) NULL,            -- free-text country field
  designation        VARCHAR(160) NULL,
  organization       VARCHAR(200) NULL,
  hear_about_us      VARCHAR(200) NULL,            -- "From where do you hear?"
  -- commercial (server-computed)
  currency           CHAR(3)      NOT NULL DEFAULT 'SGD',
  total_amount_cents INT          NOT NULL DEFAULT 0,
  -- lifecycle (dashboard is future work; defaults to 'new')
  status             VARCHAR(24)  NOT NULL DEFAULT 'new',
  internal_notes     TEXT         NULL,
  -- provenance / anti-spam
  source_page        VARCHAR(255) NULL,
  utm_source         VARCHAR(120) NULL,
  utm_medium         VARCHAR(120) NULL,
  utm_campaign       VARCHAR(120) NULL,
  ip_address         VARCHAR(45)  NULL,
  user_agent         TEXT         NULL,
  is_spam            TINYINT(1)   NOT NULL DEFAULT 0,
  -- soft delete + audit
  delete_status      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registrations_reference (reference_no),
  KEY idx_registrations_status (status),
  KEY idx_registrations_email (email),
  KEY idx_registrations_created_at (created_at),
  KEY idx_registrations_is_spam (is_spam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- registration_programs — line items (many-to-many + price snapshot)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_programs (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  registration_id  BIGINT       NOT NULL,
  program_id       BIGINT       NULL,              -- SET NULL if the catalog row is later removed
  program_slug     VARCHAR(120) NOT NULL,          -- denormalized snapshot
  program_title    VARCHAR(255) NOT NULL,          -- denormalized snapshot
  unit_price_cents INT          NOT NULL,          -- price at time of registration
  currency         CHAR(3)      NOT NULL DEFAULT 'SGD',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reg_prog (registration_id, program_slug),   -- no duplicate programme per registration
  KEY idx_regprog_registration (registration_id),
  KEY idx_regprog_program (program_slug),
  CONSTRAINT fk_regprog_registration FOREIGN KEY (registration_id)
    REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_regprog_program FOREIGN KEY (program_id)
    REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- counters — atomic per-year sequence for reference numbers (MySQL has no
-- sequences). Incremented inside the registration transaction.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS counters (
  name  VARCHAR(64) NOT NULL,
  value BIGINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- admin_users — dashboard accounts (login/signup). Passwords are bcrypt-hashed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  name          VARCHAR(160) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt hash
  role          VARCHAR(24)  NOT NULL DEFAULT 'admin',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Seed program catalog (SGD; prices in integer cents). Re-runnable.
-- Source: lib/programsData.js
-- ---------------------------------------------------------------------------
INSERT INTO programs (slug, title, price_cents, currency, sort_order) VALUES
  ('strategic-hr-business-partnership', 'Strategic HR Business Partnership & Beyond',     385000, 'SGD', 1),
  ('business-people-leadership',        'Impactful Business and People Leadership',        385000, 'SGD', 2),
  ('performance-rewards',               'Performance Development and Rewards Management',  280000, 'SGD', 3),
  ('resourcing-talent-learning',        'Resourcing, Talent and Learning Management',      280000, 'SGD', 4),
  ('impactive-hr',                      'Impactive HR for the Uninitiated',                280000, 'SGD', 5),
  ('progressing-org-development',       'Progressing Organization Development',            280000, 'SGD', 6),
  ('advancing-trainer-development',     'Advancing Trainer Development (ToT)',             280000, 'SGD', 7),
  ('management-best-practices',         'Management: Best Practices for Best Results',     385000, 'SGD', 8)
ON DUPLICATE KEY UPDATE
  title      = VALUES(title),
  price_cents= VALUES(price_cents),
  currency   = VALUES(currency),
  sort_order = VALUES(sort_order);
