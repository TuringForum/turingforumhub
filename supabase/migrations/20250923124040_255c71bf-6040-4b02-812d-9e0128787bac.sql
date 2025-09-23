-- Continue fixing security issues for remaining tables

-- 3. Update wiki_pages policies
DROP POLICY IF EXISTS "Everyone can view published pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Authenticated users can view published pages" ON public.wiki_pages;

CREATE POLICY "Authenticated users can view published pages" ON public.wiki_pages
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

-- Create public view for wiki pages
DROP VIEW IF EXISTS public.wiki_pages_public;
CREATE VIEW public.wiki_pages_public AS
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
DROP POLICY IF EXISTS "Authenticated users can view public projects" ON public.projects;

CREATE POLICY "Authenticated users can view public projects" ON public.projects
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_public = true);

-- Create public view for projects
DROP VIEW IF EXISTS public.projects_public;
CREATE VIEW public.projects_public AS
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