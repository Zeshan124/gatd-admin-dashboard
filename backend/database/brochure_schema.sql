-- GATD — Brochure download leads (MySQL 8+ / MariaDB 10.4+)
-- Usage:  mysql -u root gatd < database/brochure_schema.sql
-- Captures "Download Brochure" form submissions from Solution and Program pages.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS brochure_leads (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  source_type   VARCHAR(16)  NOT NULL DEFAULT 'program',  -- 'solution' | 'program'
  item_slug     VARCHAR(160) NULL,                        -- which solution/program
  item_title    VARCHAR(255) NULL,
  brochure      VARCHAR(500) NULL,                        -- brochure path/URL offered
  -- applicant
  name          VARCHAR(160) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  country       VARCHAR(120) NULL,
  organization  VARCHAR(200) NULL,
  -- lifecycle (for the inbox)
  status        VARCHAR(24)  NOT NULL DEFAULT 'new',       -- new | contacted | archived
  -- provenance / anti-spam
  source_page   VARCHAR(255) NULL,
  ip_address    VARCHAR(45)  NULL,
  user_agent    TEXT         NULL,
  is_spam       TINYINT(1)   NOT NULL DEFAULT 0,
  -- soft delete + audit
  delete_status TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_brochure_type (source_type),
  KEY idx_brochure_status (status),
  KEY idx_brochure_email (email),
  KEY idx_brochure_created_at (created_at),
  KEY idx_brochure_is_spam (is_spam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
