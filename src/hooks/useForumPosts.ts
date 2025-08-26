import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  created_by: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
  last_reply_author?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
}

export const useForumPosts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['forum-posts', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(id, name, slug, color)
        `)
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching forum posts:', error);
        throw error;
      }

      return data as ForumPost[];
    },
  });
};

export const useForumPost = (postId: string) => {
  return useQuery({
    queryKey: ['forum-post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(id, name, slug, color)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching forum post:', error);
        throw error;
      }

      return data as ForumPost;
    },
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      content: string;
      category_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          ...post,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast({
        title: 'Post Created',
        description: 'Your forum post has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating forum post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create forum post. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-post'] });
      toast({
        title: 'Post Updated',
        description: 'Forum post has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating forum post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update forum post. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast({
        title: 'Post Deleted',
        description: 'Forum post has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting forum post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete forum post. Please try again.',
        variant: 'destructive',
      });
    },
  });
};