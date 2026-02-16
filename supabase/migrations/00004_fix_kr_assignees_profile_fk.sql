-- Add FK from key_result_assignees.user_id to profiles.id so PostgREST can resolve the join
-- (user_id already references auth.users; this additional FK enables the profiles relationship)
ALTER TABLE key_result_assignees
  ADD CONSTRAINT key_result_assignees_user_id_profile_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
