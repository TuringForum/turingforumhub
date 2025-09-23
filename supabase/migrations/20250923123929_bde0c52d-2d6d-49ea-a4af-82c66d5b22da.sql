-- Fix security issue: Restrict access to user IDs and personal activity data
-- This migration implements proper RLS policies to prevent data harvesting

-- 1. Update forum_posts policies to restrict detailed user data access
DROP POLICY IF EXISTS "Everyone can view posts" ON public.forum_posts;

-- Only authenticated users can view detailed post information including user IDs
CREATE POLICY "Authenticated users can view posts" ON public.forum_posts
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a public view for forum posts that exposes only safe information
CREATE OR REPLACE VIEW public.forum_posts_public AS
SELECT 
  fp.id,
  fp.title,
  fp.content,
  fp.created_at,
  fp.updated_at,
  fp.category_id,
  fp.is_pinned,
  fp.is_locked,
  fp.reply_count,
  fp.last_reply_at,
  -- Instead of exposing user IDs, show safe profile information
  p.nickname as author_nickname,
  lr_p.nickname as last_reply_author_nickname
FROM public.forum_posts fp
LEFT JOIN public.profiles p ON fp.created_by = p.user_id
LEFT JOIN public.profiles lr_p ON fp.last_reply_by = lr_p.user_id;

-- Grant public access to the safe view
GRANT SELECT ON public.forum_posts_public TO anon;
GRANT SELECT ON public.forum_posts_public TO authenticated;

-- 2. Update forum_replies policies
DROP POLICY IF EXISTS "Everyone can view replies" ON public.forum_replies;

CREATE POLICY "Authenticated users can view replies" ON public.forum_replies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create public view for forum replies
CREATE OR REPLACE VIEW public.forum_replies_public AS
SELECT 
  fr.id,
  fr.post_id,
  fr.parent_id,
  fr.content,
  fr.created_at,
  fr.updated_at,
  p.nickname as author_nickname
FROM public.forum_replies fr
LEFT JOIN public.profiles p ON fr.created_by = p.user_id;

GRANT SELECT ON public.forum_replies_public TO anon;
GRANT SELECT ON public.forum_replies_public TO authenticated;

-- 3. Update wiki_pages policies
DROP POLICY IF EXISTS "Everyone can view published pages" ON public.wiki_pages;

CREATE POLICY "Authenticated users can view published pages" ON public.wiki_pages
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

-- Create public view for wiki pages
CREATE OR REPLACE VIEW public.wiki_pages_public AS
SELECT 
  wp.id,
  wp.title,
  wp.slug,
  wp.content,
  wp.excerpt,
  wp.created_at,
  wp.updated_at,
  wp.category_id,
  wp.version,
  wp.view_count,
  p.nickname as author_nickname,
  up.nickname as last_updated_by_nickname
FROM public.wiki_pages wp
LEFT JOIN public.profiles p ON wp.created_by = p.user_id
LEFT JOIN public.profiles up ON wp.updated_by = up.user_id
WHERE wp.is_published = true;

GRANT SELECT ON public.wiki_pages_public TO anon;
GRANT SELECT ON public.wiki_pages_public TO authenticated;

-- 4. Update projects policies to be more restrictive
DROP POLICY IF EXISTS "Everyone can view public projects" ON public.projects;

CREATE POLICY "Authenticated users can view public projects" ON public.projects
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_public = true);

-- Create public view for projects
CREATE OR REPLACE VIEW public.projects_public AS
SELECT 
  proj.id,
  proj.title,
  proj.description,
  proj.content,
  proj.status,
  proj.tags,
  proj.repository_url,
  proj.demo_url,
  proj.created_at,
  proj.updated_at,
  p.nickname as author_nickname
FROM public.projects proj
LEFT JOIN public.profiles p ON proj.created_by = p.user_id
WHERE proj.is_public = true;

GRANT SELECT ON public.projects_public TO anon;
GRANT SELECT ON public.projects_public TO authenticated;

-- 5. Update livechat_rooms to be more restrictive
-- Remove the public access part from existing policy
DROP POLICY IF EXISTS "Users can view public rooms and rooms they created" ON public.livechat_rooms;

CREATE POLICY "Authenticated users can view public rooms or own rooms" ON public.livechat_rooms
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (is_public = true OR created_by = auth.uid())
);

-- Create public view for livechat rooms (only truly public information)
CREATE OR REPLACE VIEW public.livechat_rooms_public AS
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

-- 6. Restrict livechat_participants to authenticated users only
DROP POLICY IF EXISTS "Users can view participants in rooms they can access" ON public.livechat_participants;

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

-- 7. Update project_features and project_bugs policies to be more restrictive
DROP POLICY IF EXISTS "Users can view features of public projects or their own project" ON public.project_features;
DROP POLICY IF EXISTS "Users can view bugs of public projects or their own projects" ON public.project_bugs;

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

-- 8. Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Only allow viewing of basic profile info for authenticated users
CREATE POLICY "Authenticated users can view public profile info" ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create a function to safely get public profile information
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

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO authenticated;