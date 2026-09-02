-- GATD — Blog module schema (MySQL 8+ / MariaDB 10.4+)
-- Usage:  mysql -u root gatd < database/blog_schema.sql
--
-- Soft delete via delete_status (0/1), consistent with the rest of the app.
-- tags stored as JSON. Times are UTC. content holds HTML authored in the admin.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS blogs (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(160) NOT NULL,
  title            VARCHAR(255) NOT NULL,
  excerpt          TEXT         NULL,
  content          LONGTEXT     NOT NULL,
  cover_image      VARCHAR(500) NULL,
  author_name      VARCHAR(160) NULL,
  author_image     VARCHAR(500) NULL,
  category         VARCHAR(120) NULL,
  tags             JSON         NULL,
  read_minutes     INT          NULL,
  views            INT          NOT NULL DEFAULT 0,   -- admin-managed viewer count
  meta_title       VARCHAR(255) NULL,
  meta_description VARCHAR(500) NULL,
  is_featured      TINYINT(1)   NOT NULL DEFAULT 0,
  is_published     TINYINT(1)   NOT NULL DEFAULT 1,
  published_at     TIMESTAMP    NULL,
  sort_order       INT          NOT NULL DEFAULT 0,
  delete_status    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_slug (slug),
  KEY idx_blog_published (is_published),
  KEY idx_blog_published_at (published_at),
  KEY idx_blog_featured (is_featured),
  KEY idx_blog_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
