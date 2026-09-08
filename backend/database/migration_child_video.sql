-- Migration: give each Program (child_solutions) a gated video URL shown on its
-- public Program page (/solutions/<slug>) — same gated "Watch Programme Video"
-- feature the Subprograms already have. Run once against an EXISTING database
-- (phpMyAdmin → Import). Safe to re-run — a "#1060 Duplicate column" error just
-- means it's already applied.
--
--   video_url : YouTube / Vimeo / direct MP4 link (or same-site /path). Empty =
--               no video icon shown on that program page.

ALTER TABLE child_solutions
  ADD COLUMN video_url VARCHAR(500) NULL AFTER brochure;
