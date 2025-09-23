-- Complete the remaining security fixes

-- 5. Update livechat_rooms to be more restrictive
DROP POLICY IF EXISTS "Users can view public rooms and rooms they created" ON public.livechat_rooms;
DROP POLICY IF EXISTS "Authenticated users can view public rooms or own rooms" ON public.livechat_rooms;

CREATE POLICY "Authenticated users can view public rooms or own rooms" ON public.livechat_rooms
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (is_public = true OR created_by = auth.uid())
);

-- Create public view for livechat rooms (only truly public information)
DROP VIEW IF EXISTS public.livechat_rooms_public;
CREATE VIEW public.livechat_rooms_public AS
SELECT 
  lr.id,
  lr.name,
  lr.description,
  lr.created_at,
  lr.is_active,
  p.nickname as creator_nickname
FROM public.livechat_rooms lr
LEFT JOIN public.profiles p ON lr.created_by = p.user_id
WHERE lr.is_public = true;

GRANT SELECT ON public.livechat_rooms_public TO anon;
GRANT SELECT ON public.livechat_rooms_public TO authenticated;

-- 6. Restrict livechat_participants further
DROP POLICY IF EXISTS "Users can view participants in rooms they can access" ON public.livechat_participants;
DROP POLICY IF EXISTS "Authenticated users can view participants in accessible rooms" ON public.livechat_participants;

CREATE POLICY "Authenticated users can view participants in accessible rooms" ON public.livechat_participants
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM livechat_rooms 
      WHERE id = livechat_participants.room_id 
      AND (is_public = true OR created_by = auth.uid())
    ) 
    OR user_id = auth.uid()
  )
);

-- 7. Update project_features and project_bugs policies
DROP POLICY IF EXISTS "Users can view features of public projects or their own project" ON public.project_features;
DROP POLICY IF EXISTS "Authenticated users can view features of accessible projects" ON public.project_features;
DROP POLICY IF EXISTS "Users can view bugs of public projects or their own projects" ON public.project_bugs;
DROP POLICY IF EXISTS "Authenticated users can view bugs of accessible projects" ON public.project_bugs;

CREATE POLICY "Authenticated users can view features of accessible projects" ON public.project_features
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_features.project_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

CREATE POLICY "Authenticated users can view bugs of accessible projects" ON public.project_bugs
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_bugs.project_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

-- 8. Create a safe function for public profile access
CREATE OR REPLACE FUNCTION public.get_public_profile_info(target_user_id uuid)
RETURNS TABLE(nickname text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.nickname, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO authenticated;