-- Migration: per-program "Certification Focuses on Developing" left image
-- (solution_programs). When set, it overrides the default illustration for that
-- program only. Run once (phpMyAdmin → Import).
-- MariaDB-safe (IF NOT EXISTS); on MySQL, "#1060 Duplicate column" = already applied.
--
--   focus_image : per-program left image URL for the Certification Focus section

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS focus_image VARCHAR(500) NULL;
