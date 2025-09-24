-- Fix function search path security warnings
-- Update all functions to have explicit search_path settings

-- Update functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.get_public_forum_posts()
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  category_id uuid,
  is_pinned boolean,
  is_locked boolean,
  reply_count integer,
  last_reply_at timestamptz,
  author_nickname text,
  last_reply_author_nickname text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    p.nickname as author_nickname,
    lr_p.nickname as last_reply_author_nickname
  FROM public.forum_posts fp
  LEFT JOIN public.profiles p ON fp.created_by = p.user_id
  LEFT JOIN public.profiles lr_p ON fp.last_reply_by = lr_p.user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_forum_replies(target_post_id uuid)
RETURNS TABLE(
  id uuid,
  post_id uuid,
  parent_id uuid,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  author_nickname text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    fr.id,
    fr.post_id,
    fr.parent_id,
    fr.content,
    fr.created_at,
    fr.updated_at,
    p.nickname as author_nickname
  FROM public.forum_replies fr
  LEFT JOIN public.profiles p ON fr.created_by = p.user_id
  WHERE fr.post_id = target_post_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_wiki_pages()
RETURNS TABLE(
  id uuid,
  title text,
  slug text,
  content text,
  excerpt text,
  created_at timestamptz,
  updated_at timestamptz,
  category_id uuid,
  version integer,
  view_count integer,
  author_nickname text,
  last_updated_by_nickname text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_public_projects()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  content text,
  status text,
  tags text[],
  repository_url text,
  demo_url text,
  created_at timestamptz,
  updated_at timestamptz,
  author_nickname text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_public_livechat_rooms()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  created_at timestamptz,
  is_active boolean,
  creator_nickname text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;