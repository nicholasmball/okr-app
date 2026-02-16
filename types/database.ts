// =============================================================================
// Database types — mirrors the PostgreSQL schema
// =============================================================================

export type UserRole = 'admin' | 'team_lead' | 'member';
export type ObjectiveType = 'team' | 'cross_cutting' | 'individual';
export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type KRStatus = 'on_track' | 'at_risk' | 'off_track';
export type AssignmentType = 'unassigned' | 'team' | 'individual' | 'multi_individual';

export interface Organisation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organisation_id: string | null;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  team_lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
}

export interface OKRCycle {
  id: string;
  organisation_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Objective {
  id: string;
  organisation_id: string;
  cycle_id: string;
  team_id: string | null;
  owner_id: string | null;
  type: ObjectiveType;
  title: string;
  description: string | null;
  status: ObjectiveStatus;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  assignee_id: string | null;
  assignment_type: AssignmentType;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  score: number;
  status: KRStatus;
  created_at: string;
  updated_at: string;
}

export interface KRAssignee {
  id: string;
  key_result_id: string;
  user_id: string;
  assigned_at: string;
}

export interface CheckIn {
  id: string;
  key_result_id: string;
  author_id: string;
  value: number;
  status: KRStatus;
  comment: string | null;
  created_at: string;
}
