-- Migration: add an admin-managed viewer count to blog posts.
-- Run once against an EXISTING database (phpMyAdmin → Import).
-- Shown on blog cards; editable from the admin Blog form.

ALTER TABLE blogs
  ADD COLUMN views INT NOT NULL DEFAULT 0 AFTER read_minutes;
