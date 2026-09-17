-- Migration: admin show/hide toggles for the fixed sections on a Subprogram
-- (solution_programs) public page — "Accredited By" and the Registration form.
-- Run once against an EXISTING database (phpMyAdmin → Import). Safe to re-run on
-- MariaDB (IF NOT EXISTS); a "#1060 Duplicate column" on MySQL means already applied.
--
--   show_accredited_by : 1 = show the "Accredited By" section, 0 = hide
--   show_registration  : 1 = show the registration form section, 0 = hide

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS show_accredited_by TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_registration  TINYINT(1) NOT NULL DEFAULT 1;

-- "Why It's Worth" alternative note — shown in place of the price when the price
-- is left blank (e.g. "Contact us via email for further details.").
ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS pricing_note VARCHAR(255) NULL;
