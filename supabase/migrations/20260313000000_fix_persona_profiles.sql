-- Fix persona profiles: add profile_id link, avatars, and display_names

-- 1. Add profile_id column to community_personas for direct linking
ALTER TABLE community_personas ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- 2. Populate profile_id by matching on name
UPDATE community_personas cp
SET profile_id = p.id
FROM profiles p
WHERE p.is_persona = true
  AND p.full_name = cp.name
  AND cp.profile_id IS NULL;

-- 3. Set display_name on all persona profiles where it's null
UPDATE profiles
SET display_name = full_name
WHERE is_persona = true AND display_name IS NULL;

-- 4. Generate DiceBear avatars for all personas without avatars
-- Using 'notionists' style for professional-looking illustrated avatars
UPDATE profiles
SET avatar_url = 'https://api.dicebear.com/9.x/notionists/svg?seed=' || encode(id::text::bytea, 'base64')
WHERE is_persona = true AND (avatar_url IS NULL OR avatar_url = '');

-- 5. Set proper roles based on persona bios/expertise
UPDATE profiles SET role = 'developer' WHERE is_persona = true AND full_name IN ('Mira Chen', 'Priya Sharma', 'Kai Nakamura');
UPDATE profiles SET role = 'founder' WHERE is_persona = true AND full_name IN ('Marcus Webb', 'Jake Rivera');
UPDATE profiles SET role = 'agency' WHERE is_persona = true AND full_name IN ('Sofia Reyes');
UPDATE profiles SET role = 'hobbyist' WHERE is_persona = true AND full_name IN ('Dev Patel', 'Leah Torres');

-- 6. Create index on profile_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_community_personas_profile_id ON community_personas(profile_id);
