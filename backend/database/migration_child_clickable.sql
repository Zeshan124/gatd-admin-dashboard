-- Migration: give each Program (child_solutions) admin-controlled clickability
-- for its card on the public /solutions page, plus an optional custom link.
-- Run once against an EXISTING database (phpMyAdmin → Import). Safe/idempotent-ish:
-- re-running errors only because the columns already exist.
--
--   is_clickable : 1 = the card links out, 0 = static (no link)
--   link_url     : custom target; when empty and clickable → /solutions/<slug>

ALTER TABLE child_solutions
  ADD COLUMN is_clickable TINYINT(1) NOT NULL DEFAULT 1 AFTER brochure,
  ADD COLUMN link_url     VARCHAR(500) NULL            AFTER is_clickable;
