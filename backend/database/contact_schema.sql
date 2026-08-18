-- GATD — Contact form messages (MySQL 8+ / MariaDB 10.4+)
-- Usage:  mysql -u root gatd < database/contact_schema.sql
-- Captures submissions from the site's "Get In Touch" contact form.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  first_name      VARCHAR(120) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone_country   CHAR(2)      NULL,             -- ISO-2, e.g. 'AE'
  phone_dial_code VARCHAR(6)   NULL,             -- derived, e.g. '+971'
  phone_number    VARCHAR(32)  NULL,             -- national number, digits only
  subject         VARCHAR(255) NULL,
  message         TEXT         NOT NULL,
  -- lifecycle (for a future inbox view)
  status          VARCHAR(24)  NOT NULL DEFAULT 'new',   -- new | read | replied | archived
  -- provenance / anti-spam
  source_page     VARCHAR(255) NULL,
  ip_address      VARCHAR(45)  NULL,
  user_agent      TEXT         NULL,
  is_spam         TINYINT(1)   NOT NULL DEFAULT 0,
  -- soft delete + audit
  delete_status   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_status (status),
  KEY idx_contact_email (email),
  KEY idx_contact_created_at (created_at),
  KEY idx_contact_is_spam (is_spam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
