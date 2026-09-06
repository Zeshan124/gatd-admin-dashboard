-- GATD — Newsletter subscribers (footer subscription form).
-- Usage:  mysql -u root gatd < database/newsletter_subscribers.sql   (safe to re-run)
-- Captures email subscriptions from the site footer's newsletter form.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  name          VARCHAR(160) NULL,
  status        VARCHAR(24)  NOT NULL DEFAULT 'subscribed',  -- subscribed | unsubscribed
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
