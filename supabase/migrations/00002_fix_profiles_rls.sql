-- ============================================================================
-- Fix: Profiles RLS infinite recursion
-- ============================================================================
-- The original profiles_select policy used a self-referencing subquery:
--   organisation_id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid())
-- This caused infinite recursion because PostgreSQL evaluates the subquery
-- with RLS applied, which re-triggers the same policy.
--
-- Solution: Use a SECURITY DEFINER function to bypass RLS when looking up
-- the current user's organisation_id, breaking the circular dependency.
-- ============================================================================

-- Helper function that bypasses RLS to get the current user's org ID
CREATE OR REPLACE FUNCTION public.get_user_org_id() RETURNS UUID AS $$
  SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO authenticated;

-- Drop the broken self-referencing policy
DROP POLICY IF EXISTS profiles_select ON profiles;

-- Users can always read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can read other profiles in their organisation
CREATE POLICY profiles_select_org ON profiles
  FOR SELECT USING (organisation_id = public.get_user_org_id());
