-- Create forum categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_reply_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories
CREATE POLICY "Everyone can view categories"
ON public.forum_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.forum_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for forum_posts
CREATE POLICY "Everyone can view posts"
ON public.forum_posts
FOR SELECT
USING (true);

CREATE POLICY "Contributors can create posts"
ON public.forum_posts
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'contributor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can update their own posts"
ON public.forum_posts
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update any post"
ON public.forum_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own posts"
ON public.forum_posts
FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any post"
ON public.forum_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for forum_replies
CREATE POLICY "Everyone can view replies"
ON public.forum_replies
FOR SELECT
USING (true);

CREATE POLICY "Contributors can create replies"
ON public.forum_replies
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'contributor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can update their own replies"
ON public.forum_replies
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update any reply"
ON public.forum_replies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own replies"
ON public.forum_replies
FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any reply"
ON public.forum_replies
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_forum_categories_updated_at
  BEFORE UPDATE ON public.forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update post reply count and last reply info
CREATE OR REPLACE FUNCTION public.update_post_reply_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers for reply stats
CREATE TRIGGER update_post_reply_stats_insert
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reply_stats();

CREATE TRIGGER update_post_reply_stats_delete
  AFTER DELETE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reply_stats();

-- Insert default categories
INSERT INTO public.forum_categories (name, description, slug, color) VALUES
('General Discussion', 'General topics and casual conversations', 'general', '#6366f1'),
('Development', 'Programming and development discussions', 'development', '#3b82f6'),
('Help & Support', 'Get help and support from the community', 'help-support', '#10b981'),
('Feature Requests', 'Suggest new features and improvements', 'feature-requests', '#f59e0b'),
('Announcements', 'Official announcements and updates', 'announcements', '#ef4444');

-- Create indexes for better performance
CREATE INDEX idx_forum_posts_category_id ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_created_by ON public.forum_posts(created_by);
CREATE INDEX idx_forum_posts_last_reply_at ON public.forum_posts(last_reply_at DESC);
CREATE INDEX idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX idx_forum_replies_created_by ON public.forum_replies(created_by);
CREATE INDEX idx_forum_replies_created_at ON public.forum_replies(created_at);