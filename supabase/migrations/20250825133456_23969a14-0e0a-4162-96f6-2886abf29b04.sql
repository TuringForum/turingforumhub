-- Create features table
CREATE TABLE public.project_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_by UUID NOT NULL,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bugs table
CREATE TABLE public.project_bugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_by UUID NOT NULL,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bugs ENABLE ROW LEVEL SECURITY;

-- RLS policies for features
CREATE POLICY "Users can view features of public projects or their own projects" 
ON public.project_features 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_features.project_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

CREATE POLICY "Users can create features for their own projects" 
ON public.project_features 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_features.project_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can update features for their own projects" 
ON public.project_features 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_features.project_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete features for their own projects" 
ON public.project_features 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_features.project_id 
    AND created_by = auth.uid()
  )
);

-- RLS policies for bugs (same structure as features)
CREATE POLICY "Users can view bugs of public projects or their own projects" 
ON public.project_bugs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_bugs.project_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

CREATE POLICY "Users can create bugs for their own projects" 
ON public.project_bugs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_bugs.project_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can update bugs for their own projects" 
ON public.project_bugs 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_bugs.project_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete bugs for their own projects" 
ON public.project_bugs 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_bugs.project_id 
    AND created_by = auth.uid()
  )
);

-- Admin policies for features
CREATE POLICY "Admins can manage all features" 
ON public.project_features 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies for bugs
CREATE POLICY "Admins can manage all bugs" 
ON public.project_bugs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_project_features_updated_at
BEFORE UPDATE ON public.project_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_bugs_updated_at
BEFORE UPDATE ON public.project_bugs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();