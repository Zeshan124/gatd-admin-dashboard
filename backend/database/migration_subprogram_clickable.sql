-- Migration: give each Subprogram (solution_programs) admin-controlled
-- clickability for its card on the public Program page, plus an optional custom
-- link. Run once against an EXISTING database (phpMyAdmin → Import).
--
--   is_clickable : 1 = the card links out, 0 = static (no link)
--   link_url     : custom target; when empty and clickable → /solutions/<child>/<slug>
--                  (own page only links when the subprogram is published)

ALTER TABLE solution_programs
  ADD COLUMN is_clickable TINYINT(1) NOT NULL DEFAULT 1 AFTER brochure,
  ADD COLUMN link_url     VARCHAR(500) NULL            AFTER is_clickable;
