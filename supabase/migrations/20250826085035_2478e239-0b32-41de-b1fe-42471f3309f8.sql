-- Create wiki categories table
CREATE TABLE public.wiki_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wiki pages table
CREATE TABLE public.wiki_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID NOT NULL REFERENCES public.wiki_categories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  updated_by UUID,
  is_published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wiki page revisions table for version history
CREATE TABLE public.wiki_page_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  version INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_page_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wiki_categories
CREATE POLICY "Everyone can view categories"
ON public.wiki_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.wiki_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wiki_pages
CREATE POLICY "Everyone can view published pages"
ON public.wiki_pages
FOR SELECT
USING (is_published = true);

CREATE POLICY "Contributors can view all pages"
ON public.wiki_pages
FOR SELECT
USING (
  has_role(auth.uid(), 'contributor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Contributors can create pages"
ON public.wiki_pages
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'contributor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can update their own pages"
ON public.wiki_pages
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update any page"
ON public.wiki_pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own pages"
ON public.wiki_pages
FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any page"
ON public.wiki_pages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wiki_page_revisions
CREATE POLICY "Contributors can view revisions"
ON public.wiki_page_revisions
FOR SELECT
USING (
  has_role(auth.uid(), 'contributor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Contributors can create revisions"
ON public.wiki_page_revisions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'contributor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_wiki_categories_updated_at
  BEFORE UPDATE ON public.wiki_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wiki_pages_updated_at
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create revision and update version when page is updated
CREATE OR REPLACE FUNCTION public.create_wiki_page_revision()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for revision creation
CREATE TRIGGER create_wiki_page_revision_trigger
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wiki_page_revision();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_wiki_page_view(page_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.wiki_pages 
  SET view_count = view_count + 1 
  WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default categories
INSERT INTO public.wiki_categories (name, description, slug, color) VALUES
('Getting Started', 'Introduction and basic guides', 'getting-started', '#10b981'),
('Development', 'Development guides and tutorials', 'development', '#3b82f6'),
('Best Practices', 'Recommended practices and guidelines', 'best-practices', '#8b5cf6'),
('Tutorials', 'Step-by-step tutorials', 'tutorials', '#f59e0b'),
('Reference', 'Technical reference and documentation', 'reference', '#ef4444'),
('Community', 'Community guidelines and resources', 'community', '#06b6d4');

-- Create indexes for better performance
CREATE INDEX idx_wiki_pages_category_id ON public.wiki_pages(category_id);
CREATE INDEX idx_wiki_pages_created_by ON public.wiki_pages(created_by);
CREATE INDEX idx_wiki_pages_slug ON public.wiki_pages(slug);
CREATE INDEX idx_wiki_pages_published ON public.wiki_pages(is_published);
CREATE INDEX idx_wiki_page_revisions_page_id ON public.wiki_page_revisions(page_id);
CREATE INDEX idx_wiki_page_revisions_version ON public.wiki_page_revisions(page_id, version DESC);