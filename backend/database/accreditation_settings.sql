-- GATD — "Accredited By" settings (single row) for the Program pages.
-- Usage:  mysql -u root gatd < database/accreditation_settings.sql   (safe to re-run)
-- Managed from Admin → Accredited By. The section's per-program visibility is the
-- solution_programs.show_accredited_by toggle; this holds the shared heading + logos.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS accreditation_settings (
  id         TINYINT      NOT NULL DEFAULT 1,   -- singleton row (always 1)
  heading    VARCHAR(255) NULL,                 -- section heading, e.g. "Accredited By"
  logos      JSON         NULL,                 -- [{ name, logo }]
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the single row with the current logos (no-op if it already exists).
INSERT INTO accreditation_settings (id, heading, logos)
VALUES (1, 'Accredited By',
  '[{"name":"European Council for Business Education","logo":"/images/solutions/strategic-hr/1.png"},{"name":"QS Stars Rating System - Online Learning","logo":"/images/solutions/strategic-hr/2.png"},{"name":"ACBSP Global Business Accreditation","logo":"/images/solutions/strategic-hr/3.png"},{"name":"ASIC Accreditation Service for International Colleges","logo":"/images/solutions/strategic-hr/4.png"},{"name":"Business Graduates Association Member","logo":"/images/solutions/strategic-hr/5.png"},{"name":"ATHEA","logo":"/images/solutions/strategic-hr/6.jpg"},{"name":"Cambridge International Academics","logo":"/images/solutions/strategic-hr/7.jpg"}]')
ON DUPLICATE KEY UPDATE id = id;
