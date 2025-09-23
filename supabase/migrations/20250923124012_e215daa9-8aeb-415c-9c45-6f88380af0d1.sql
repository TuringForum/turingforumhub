-- Fix security issue: Restrict access to user IDs and personal activity data
-- This migration implements proper RLS policies to prevent data harvesting

-- First, let's check and drop existing policies properly

-- 1. Update forum_posts policies to restrict detailed user data access
DROP POLICY IF EXISTS "Everyone can view posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.forum_posts;

-- Only authenticated users can view detailed post information including user IDs
CREATE POLICY "Authenticated users can view posts" ON public.forum_posts
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a public view for forum posts that exposes only safe information
DROP VIEW IF EXISTS public.forum_posts_public;
CREATE VIEW public.forum_posts_public AS
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
DROP POLICY IF EXISTS "Authenticated users can view replies" ON public.forum_replies;

CREATE POLICY "Authenticated users can view replies" ON public.forum_replies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create public view for forum replies
DROP VIEW IF EXISTS public.forum_replies_public;
CREATE VIEW public.forum_replies_public AS
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