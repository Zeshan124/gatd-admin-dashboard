-- Migration: per-program "Accredited By" heading + logos on Subprograms
-- (solution_programs). When set, they override the global default (Admin →
-- Accredited By) for that program only. Run once (phpMyAdmin → Import).
-- MariaDB-safe (IF NOT EXISTS); on MySQL, "#1060 Duplicate column" = already applied.
--
--   accredited_heading : per-program heading (else global / "Accredited By")
--   accredited_logos   : per-program logos [{ name, logo }] (else global logos)

ALTER TABLE solution_programs
  ADD COLUMN IF NOT EXISTS accredited_heading VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS accredited_logos   JSON         NULL;
