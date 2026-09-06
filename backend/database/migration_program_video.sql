-- Migration: give each Subprogram (solution_programs) a gated video URL shown on
-- its public Program page (visitor must submit the lead form to watch it). Run
-- once against an EXISTING database (phpMyAdmin → Import). Safe to re-run — a
-- "#1060 Duplicate column" error just means it's already applied.
--
--   video_url : YouTube / Vimeo / direct MP4 link (or same-site /path). Empty =
--               no video icon shown on that program page.

ALTER TABLE solution_programs
  ADD COLUMN video_url VARCHAR(500) NULL AFTER brochure;
