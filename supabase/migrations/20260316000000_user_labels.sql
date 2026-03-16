-- User permission labels (vip, beta, early-access, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Index for label lookups
CREATE INDEX IF NOT EXISTS idx_profiles_labels ON public.profiles USING GIN (labels);

-- Give mike@rocketopp.com the owner + vip labels
UPDATE public.profiles
SET labels = ARRAY['owner', 'vip']
WHERE email = 'mike@rocketopp.com';
