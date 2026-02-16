-- Multi-assignee key results: junction table + assignment_type enum
-- Supports team, individual, and multi-individual assignment modes

-- 1. Create assignment_type enum
CREATE TYPE assignment_type AS ENUM ('unassigned', 'team', 'individual', 'multi_individual');

-- 2. Add assignment_type column to key_results
ALTER TABLE key_results
  ADD COLUMN assignment_type assignment_type NOT NULL DEFAULT 'unassigned';

-- 3. Create junction table for KR assignees
CREATE TABLE key_result_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key_result_id, user_id)
);

CREATE INDEX idx_kr_assignees_key_result ON key_result_assignees(key_result_id);
CREATE INDEX idx_kr_assignees_user ON key_result_assignees(user_id);

-- 4. Enable RLS
ALTER TABLE key_result_assignees ENABLE ROW LEVEL SECURITY;

-- Select: org members can view
CREATE POLICY "Org members can view KR assignees"
  ON key_result_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM key_results kr
      JOIN objectives o ON o.id = kr.objective_id
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE kr.id = key_result_assignees.key_result_id
        AND p.id = auth.uid()
    )
  );

-- Insert: admin or team_lead
CREATE POLICY "Admins and team leads can insert KR assignees"
  ON key_result_assignees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'team_lead')
    )
  );

-- Delete: admin or team_lead
CREATE POLICY "Admins and team leads can delete KR assignees"
  ON key_result_assignees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'team_lead')
    )
  );

-- 5. Migrate existing data: copy assignee_id into junction table + set assignment_type
INSERT INTO key_result_assignees (key_result_id, user_id)
SELECT id, assignee_id
FROM key_results
WHERE assignee_id IS NOT NULL;

UPDATE key_results
SET assignment_type = 'individual'
WHERE assignee_id IS NOT NULL;

-- 6. Update KR update policy to allow assignees and team members to update team-type KRs
-- Drop existing update policy and recreate
DROP POLICY IF EXISTS "Users can update key results in their org" ON key_results;

CREATE POLICY "Users can update key results in their org"
  ON key_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM objectives o
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE o.id = key_results.objective_id
        AND p.id = auth.uid()
    )
  );
