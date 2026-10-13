-- Migration: dashboard accounts — per-person access control.
-- Run once (phpMyAdmin → Import). MariaDB-safe (IF NOT EXISTS).
--
-- permissions: JSON map of dashboard section → "view" | "manage" (missing = no
-- access), e.g. {"registrations":"view","blog":"manage"}.
-- NULL = an account created before access control existed: it keeps full access
-- until a Super Admin opens it in Admin → Users and saves its access.
--
-- Roles used: super_admin | admin | editor | viewer.

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS permissions JSON NULL AFTER role;

-- Promote the live Super Admin account (no-op if the email doesn't exist).
-- On a local database, change the email to your own local account.
UPDATE admin_users SET role = 'super_admin' WHERE email = 'superadmin@globalatd.com';
