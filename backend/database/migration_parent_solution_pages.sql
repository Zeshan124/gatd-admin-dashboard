-- Migration: individual Solution (parent) pages — hero + middle section fields.
-- Lets each main Solution (e.g. "Certified Programs") open as its own page:
--   hero banner + description, a middle section (left image + right content),
--   then its Programs grid. Managed in Admin → Solutions. Run once (phpMyAdmin → Import).
-- MariaDB-safe (IF NOT EXISTS); on MySQL, "#1060 Duplicate column" = already applied.

ALTER TABLE parent_solutions
  ADD COLUMN IF NOT EXISTS eyebrow        VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS banner         VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS middle_image   VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS middle_badge   VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS middle_heading VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS middle_body    TEXT         NULL,
  ADD COLUMN IF NOT EXISTS is_clickable   TINYINT(1)   NOT NULL DEFAULT 1;
