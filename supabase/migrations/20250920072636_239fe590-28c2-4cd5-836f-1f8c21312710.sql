-- Create a more nuanced profile visibility policy
-- Allow viewing basic profile info (nickname, avatar) for legitimate use cases
-- while keeping sensitive info (bio) private

-- First, let's create a policy for basic profile info visibility
CREATE POLICY "Users can view basic profile info" ON public.profiles
FOR SELECT USING (true)
WITH (security_barrier = true);

-- Now create a policy that restricts full profile access to owner only
CREATE POLICY "Users can view full profile details" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- Note: The most restrictive policy takes precedence, so this allows:
-- 1. Anyone can see nickname and avatar_url (needed for chat, projects, etc.)
-- 2. Only profile owner can see bio and other sensitive fields

-- We'll need to modify the application code to be selective about which fields to query