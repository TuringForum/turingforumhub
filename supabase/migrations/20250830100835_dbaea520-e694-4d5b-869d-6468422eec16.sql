-- Fix security warnings: Set search_path for all functions to prevent SQL injection
-- This ensures functions cannot be manipulated by changing the search path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'guest');
  RETURN new;
END;
$function$;

-- Fix has_role function  
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$function$;

-- Fix handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nickname', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_post_reply_stats function
CREATE OR REPLACE FUNCTION public.update_post_reply_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET 
      reply_count = reply_count + 1,
      last_reply_at = NEW.created_at,
      last_reply_by = NEW.created_by,
      updated_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET 
      reply_count = GREATEST(0, reply_count - 1),
      updated_at = now()
    WHERE id = OLD.post_id;
    
    -- Update last reply info if we deleted the most recent reply
    UPDATE public.forum_posts
    SET 
      last_reply_at = (
        SELECT created_at 
        FROM public.forum_replies 
        WHERE post_id = OLD.post_id 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      last_reply_by = (
        SELECT created_by 
        FROM public.forum_replies 
        WHERE post_id = OLD.post_id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    WHERE id = OLD.post_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix create_wiki_page_revision function
CREATE OR REPLACE FUNCTION public.create_wiki_page_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only create revision if content actually changed
  IF OLD.title != NEW.title OR OLD.content != NEW.content OR OLD.excerpt != NEW.excerpt THEN
    -- Insert old version into revisions table
    INSERT INTO public.wiki_page_revisions (
      page_id, title, content, excerpt, version, created_by
    ) VALUES (
      OLD.id, OLD.title, OLD.content, OLD.excerpt, OLD.version, OLD.updated_by
    );
    
    -- Increment version number
    NEW.version = OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix increment_wiki_page_view function
CREATE OR REPLACE FUNCTION public.increment_wiki_page_view(page_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.wiki_pages 
  SET view_count = view_count + 1 
  WHERE id = page_id;
END;
$function$;