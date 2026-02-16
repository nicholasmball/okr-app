-- ============================================================================
-- Add manager_id to profiles for line management hierarchy
-- ============================================================================
-- Adds a self-referencing FK so each person can have one direct manager.
-- Nullable — not everyone has a manager (e.g. CEO, new hires).
-- ON DELETE SET NULL — if a manager leaves, their reports become unmanaged.

ALTER TABLE profiles
  ADD COLUMN manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_manager ON profiles(manager_id);

-- Prevent self-management
ALTER TABLE profiles
  ADD CONSTRAINT profiles_no_self_manager CHECK (manager_id != id);
