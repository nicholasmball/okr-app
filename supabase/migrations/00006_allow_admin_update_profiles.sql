-- ============================================================================
-- Allow admins to update any profile in their organisation
-- ============================================================================
-- The original profiles_update policy only allows self-updates (id = auth.uid()).
-- Admins need to update other users' roles and manager assignments.
-- Uses the existing get_user_org_id() function to avoid RLS recursion.

-- Keep the original self-update policy and add a new admin policy
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    organisation_id = public.get_user_org_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
