-- Migration: give each Program (child_solutions) and Subprogram (solution_programs)
-- an admin toggle to show/hide its rating on the public site. Run once against an
-- EXISTING database (phpMyAdmin → Import). Safe to re-run: a "#1060 Duplicate
-- column" error just means it's already applied.
--
--   rating_enabled : 1 = rating shows on the website, 0 = hidden
--
-- Existing rows default to 1 (rating stays visible), so nothing changes until an
-- admin turns a rating off.

ALTER TABLE child_solutions
  ADD COLUMN rating_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER reviews;

ALTER TABLE solution_programs
  ADD COLUMN rating_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER reviews;
