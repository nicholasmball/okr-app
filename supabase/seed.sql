-- ============================================================================
-- Seed data for development
-- ============================================================================
-- NOTE: Run this AFTER creating test users via Supabase Auth.
-- The UUIDs below are placeholders — replace with real auth.users IDs.
-- ============================================================================

-- Organisation
INSERT INTO organisations (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Acme Engineering');

-- Profiles (assumes these users exist in auth.users)
-- You must create these users in Supabase Auth first, then update the IDs here.

-- Teams
INSERT INTO teams (id, organisation_id, name, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Platform Squad', 'Core platform and infrastructure'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Growth Squad', 'User acquisition and engagement'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Mobile Squad', 'iOS and Android development');

-- OKR Cycle
INSERT INTO okr_cycles (id, organisation_id, name, start_date, end_date, is_active) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Q1 2026', '2026-01-01', '2026-03-31', true);

-- Sample Team Objective
INSERT INTO objectives (id, organisation_id, cycle_id, team_id, type, title, description, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'team', 'Improve platform reliability to 99.9% uptime', 'Focus on reducing incidents and improving monitoring.', 'active');

-- Sample Cross-Cutting Objective
INSERT INTO objectives (id, organisation_id, cycle_id, type, title, description, status) VALUES
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'cross_cutting', 'Adopt Claude Code for all new development', 'All developers should use Claude Code as their primary coding assistant.', 'active');

-- Sample Key Results
INSERT INTO key_results (id, objective_id, title, target_value, current_value, unit) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Reduce P1 incidents from 5/month to 1/month', 1, 3, 'incidents/month'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Achieve 95% test coverage on critical paths', 95, 72, '%'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'All developers have Claude Code installed and configured', 100, 40, '%');
