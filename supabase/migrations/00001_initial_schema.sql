-- ============================================================================
-- OKR App — Initial Database Schema
-- ============================================================================
--
-- ERD Overview:
--
--   Organisation (1) ──< Team (many)
--   Organisation (1) ──< OKRCycle (many)
--   Organisation (1) ──< Objective (many, for cross_cutting + individual)
--   Team (1) ──< Objective (many, for team type)
--   Team (1) ──< TeamMembership (many) >── User (many)
--   User (1) ──< Objective (many, for individual type)
--   OKRCycle (1) ──< Objective (many)
--   Objective (1) ──< KeyResult (many)
--   KeyResult (1) ──< CheckIn (many)
--   User (1) ──< KeyResult (many, as assignee)
--   User (1) ──< CheckIn (many, as author)
--
-- ============================================================================

-- --------------------------------------------------------------------------
-- Enums
-- --------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'team_lead', 'member');
CREATE TYPE objective_type AS ENUM ('team', 'cross_cutting', 'individual');
CREATE TYPE objective_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE kr_status AS ENUM ('on_track', 'at_risk', 'off_track');

-- --------------------------------------------------------------------------
-- Organisation
-- --------------------------------------------------------------------------

CREATE TABLE organisations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- User Profile (extends Supabase auth.users)
-- --------------------------------------------------------------------------

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'member',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_organisation ON profiles(organisation_id);

-- --------------------------------------------------------------------------
-- Team
-- --------------------------------------------------------------------------

CREATE TABLE teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  team_lead_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_organisation ON teams(organisation_id);
CREATE INDEX idx_teams_lead ON teams(team_lead_id);

-- --------------------------------------------------------------------------
-- Team Membership (many-to-many: User <-> Team)
-- --------------------------------------------------------------------------

CREATE TABLE team_memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user ON team_memberships(user_id);

-- --------------------------------------------------------------------------
-- OKR Cycle
-- --------------------------------------------------------------------------

CREATE TABLE okr_cycles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

CREATE INDEX idx_okr_cycles_organisation ON okr_cycles(organisation_id);
CREATE UNIQUE INDEX idx_okr_cycles_active ON okr_cycles(organisation_id) WHERE is_active = true;

-- --------------------------------------------------------------------------
-- Objective
-- --------------------------------------------------------------------------

CREATE TABLE objectives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  cycle_id        UUID NOT NULL REFERENCES okr_cycles(id) ON DELETE CASCADE,
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,
  owner_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type            objective_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  status          objective_status NOT NULL DEFAULT 'draft',
  score           NUMERIC(3, 2) DEFAULT 0.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- team objectives must have a team_id
  CONSTRAINT team_objective_requires_team CHECK (
    type != 'team' OR team_id IS NOT NULL
  ),
  -- individual objectives must have an owner_id
  CONSTRAINT individual_objective_requires_owner CHECK (
    type != 'individual' OR owner_id IS NOT NULL
  )
);

CREATE INDEX idx_objectives_organisation ON objectives(organisation_id);
CREATE INDEX idx_objectives_cycle ON objectives(cycle_id);
CREATE INDEX idx_objectives_team ON objectives(team_id);
CREATE INDEX idx_objectives_owner ON objectives(owner_id);
CREATE INDEX idx_objectives_type ON objectives(type);

-- --------------------------------------------------------------------------
-- Key Result
-- --------------------------------------------------------------------------

CREATE TABLE key_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id  UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  assignee_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  target_value  NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT '%',
  score         NUMERIC(3, 2) DEFAULT 0.00,
  status        kr_status NOT NULL DEFAULT 'on_track',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_key_results_objective ON key_results(objective_id);
CREATE INDEX idx_key_results_assignee ON key_results(assignee_id);

-- --------------------------------------------------------------------------
-- Check-In (progress update on a Key Result)
-- --------------------------------------------------------------------------

CREATE TABLE check_ins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value         NUMERIC NOT NULL,
  status        kr_status NOT NULL,
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_check_ins_key_result ON check_ins(key_result_id);
CREATE INDEX idx_check_ins_author ON check_ins(author_id);
CREATE INDEX idx_check_ins_created ON check_ins(created_at DESC);

-- --------------------------------------------------------------------------
-- Updated-at trigger function
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON okr_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON key_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- Row Level Security (RLS)
-- --------------------------------------------------------------------------

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles in their org, update their own
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Organisations: members can read their own org
CREATE POLICY organisations_select ON organisations
  FOR SELECT USING (
    id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid())
  );

-- Organisations: only admins can update
CREATE POLICY organisations_update ON organisations
  FOR UPDATE USING (
    id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teams: members of the same org can read all teams
CREATE POLICY teams_select ON teams
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Teams: admins and team leads can manage teams
CREATE POLICY teams_insert ON teams
  FOR INSERT WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY teams_update ON teams
  FOR UPDATE USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY teams_delete ON teams
  FOR DELETE USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Team Memberships: org members can read, admins/leads can manage
CREATE POLICY team_memberships_select ON team_memberships
  FOR SELECT USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN profiles p ON p.organisation_id = t.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY team_memberships_insert ON team_memberships
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN profiles p ON p.organisation_id = t.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY team_memberships_delete ON team_memberships
  FOR DELETE USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN profiles p ON p.organisation_id = t.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'team_lead')
    )
  );

-- OKR Cycles: org members can read, admins/leads can manage
CREATE POLICY okr_cycles_select ON okr_cycles
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY okr_cycles_insert ON okr_cycles
  FOR INSERT WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY okr_cycles_update ON okr_cycles
  FOR UPDATE USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

-- Objectives: org members can read, admins/leads can create/update
CREATE POLICY objectives_select ON objectives
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY objectives_insert ON objectives
  FOR INSERT WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY objectives_update ON objectives
  FOR UPDATE USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY objectives_delete ON objectives
  FOR DELETE USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Key Results: same org can read, admins/leads can create/update,
-- assignees can also update their own KRs
CREATE POLICY key_results_select ON key_results
  FOR SELECT USING (
    objective_id IN (
      SELECT o.id FROM objectives o
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY key_results_insert ON key_results
  FOR INSERT WITH CHECK (
    objective_id IN (
      SELECT o.id FROM objectives o
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'team_lead')
    )
  );

CREATE POLICY key_results_update ON key_results
  FOR UPDATE USING (
    assignee_id = auth.uid()
    OR objective_id IN (
      SELECT o.id FROM objectives o
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'team_lead')
    )
  );

-- Check-Ins: same org can read, author or KR assignee can create
CREATE POLICY check_ins_select ON check_ins
  FOR SELECT USING (
    key_result_id IN (
      SELECT kr.id FROM key_results kr
      JOIN objectives o ON o.id = kr.objective_id
      JOIN profiles p ON p.organisation_id = o.organisation_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY check_ins_insert ON check_ins
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
  );
