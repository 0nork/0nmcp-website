-- Fix FKs: drop auth.users refs, add profiles refs so PostgREST can join
ALTER TABLE community_threads DROP CONSTRAINT IF EXISTS community_threads_user_id_fkey;
ALTER TABLE community_threads
  ADD CONSTRAINT community_threads_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE community_threads DROP CONSTRAINT IF EXISTS community_threads_group_id_fkey;
ALTER TABLE community_threads
  ADD CONSTRAINT community_threads_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE SET NULL;

ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
