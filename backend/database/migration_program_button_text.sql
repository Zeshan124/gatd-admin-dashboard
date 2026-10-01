-- Migration: editable hero CTA button labels per Subprogram (solution_programs).
-- Lets the admin set the "Download Brochure", "Register Now" and "Watch Programme
-- Video" button text per program. Empty → the public page shows the defaults.
-- Run once (phpMyAdmin → Import). MariaDB-safe (IF NOT EXISTS).

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS brochure_button_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS register_button_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS video_button_text    VARCHAR(100) NULL;
