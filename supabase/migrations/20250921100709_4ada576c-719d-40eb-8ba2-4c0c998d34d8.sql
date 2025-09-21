-- Add parent_id column to forum_replies for nested comments
ALTER TABLE public.forum_replies 
ADD COLUMN parent_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE;

-- Add index for better performance when querying nested replies
CREATE INDEX idx_forum_replies_parent_id ON public.forum_replies(parent_id);

-- Add index for better performance when querying replies by post
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON public.forum_replies(post_id);

-- Update the RLS policies to handle nested replies
-- The existing policies should work fine, but let's make sure nested replies inherit proper permissions