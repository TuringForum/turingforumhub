import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ForumReply {
  id: string;
  content: string;
  post_id: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
  replies?: ForumReply[];
}

// Helper function to build nested reply structure
const buildNestedReplies = (replies: ForumReply[]): ForumReply[] => {
  const replyMap = new Map<string, ForumReply>();
  const rootReplies: ForumReply[] = [];

  // Initialize all replies in the map
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, replies: [] });
  });

  // Build the nested structure
  replies.forEach(reply => {
    const replyWithChildren = replyMap.get(reply.id)!;
    
    if (reply.parent_id) {
      const parent = replyMap.get(reply.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(replyWithChildren);
      }
    } else {
      rootReplies.push(replyWithChildren);
    }
  });

  return rootReplies;
};

export const useForumReplies = (postId: string) => {
  return useQuery({
    queryKey: ['forum-replies', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at');

      if (error) {
        console.error('Error fetching forum replies:', error);
        throw error;
      }

      // Fetch author data for all unique users
      const userIds = [...new Set(data.map(reply => reply.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', userIds);

      // Create a map of user profiles
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine replies with author data
      const repliesWithAuthors = data.map(reply => ({
        ...reply,
        author: profileMap.get(reply.created_by) ? {
          id: profileMap.get(reply.created_by)!.user_id,
          nickname: profileMap.get(reply.created_by)!.nickname,
          avatar_url: profileMap.get(reply.created_by)!.avatar_url
        } : undefined
      }));

      return buildNestedReplies(repliesWithAuthors);
    },
  });
};

export const useCreateForumReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reply: {
      content: string;
      post_id: string;
      parent_id?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('forum_replies')
        .insert([{
          ...reply,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', variables.post_id] });
      toast({
        title: 'Reply Posted',
        description: 'Your reply has been posted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating forum reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateForumReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumReply> & { id: string }) => {
      const { data, error } = await supabase
        .from('forum_replies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', data.post_id] });
      toast({
        title: 'Reply Updated',
        description: 'Reply has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating forum reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reply. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteForumReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyId: string) => {
      // Get the reply data before deleting to know which post to invalidate
      const { data: replyData } = await supabase
        .from('forum_replies')
        .select('post_id')
        .eq('id', replyId)
        .single();

      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      return replyData;
    },
    onSuccess: (replyData) => {
      if (replyData) {
        queryClient.invalidateQueries({ queryKey: ['forum-replies', replyData.post_id] });
        queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
        queryClient.invalidateQueries({ queryKey: ['forum-post', replyData.post_id] });
      }
      toast({
        title: 'Reply Deleted',
        description: 'Reply has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting forum reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reply. Please try again.',
        variant: 'destructive',
      });
    },
  });
};