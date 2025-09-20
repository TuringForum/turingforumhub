-- Create an admin function to get all user profiles
-- This function can only be called by users with admin role
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(user_id uuid, nickname text, avatar_url text, bio text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Only allow admins to call this function
  SELECT p.user_id, p.nickname, p.avatar_url, p.bio, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin');
$$;

-- Grant execute permission to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles TO authenticated;