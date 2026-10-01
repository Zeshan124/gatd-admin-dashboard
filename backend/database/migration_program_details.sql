-- Migration: "Programme Details" section fields per Subprogram (solution_programs).
-- Adds the Dates and Location shown in the Programme Details cards. Investment reuses
-- the existing price/currency/period; the description reuses pricing_description.
-- Run once (phpMyAdmin → Import). MariaDB-safe (IF NOT EXISTS).

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS programme_dates VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS location        VARCHAR(160) NULL;
