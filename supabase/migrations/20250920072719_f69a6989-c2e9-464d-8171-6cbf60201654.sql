-- Drop the previous policies and create a function-based approach
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view full profile details" ON public.profiles;

-- Create a security definer function to get basic profile info
CREATE OR REPLACE FUNCTION public.get_user_basic_profile(target_user_id uuid)
RETURNS TABLE(user_id uuid, nickname text, avatar_url text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.user_id, p.nickname, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- Create a more permissive policy for basic profile viewing
-- This allows viewing nickname and avatar_url which are needed for chat, projects, etc.
CREATE POLICY "Users can view basic profile info" ON public.profiles
FOR SELECT USING (
  -- Allow if requesting only basic fields (nickname, avatar_url) 
  -- or if it's the user's own profile
  auth.uid() = user_id
);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_basic_profile TO authenticated;