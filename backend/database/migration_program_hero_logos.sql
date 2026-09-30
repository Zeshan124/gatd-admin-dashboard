-- Migration: per-program hero logos on Subprograms (solution_programs).
-- Logos shown in the Program hero, between the title and the rating. Managed in
-- Admin → Subprograms. When empty, nothing is shown. Run once (phpMyAdmin → Import).
-- MariaDB-safe (IF NOT EXISTS); on MySQL, "#1060 Duplicate column" = already applied.
--
--   hero_logos : per-program hero logos [{ name, logo }]

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS hero_logos JSON NULL;
