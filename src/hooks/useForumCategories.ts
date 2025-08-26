import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useForumCategories = () => {
  return useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching forum categories:', error);
        throw error;
      }

      return data as ForumCategory[];
    },
  });
};

export const useCreateForumCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<ForumCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast({
        title: 'Category Created',
        description: 'Forum category has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating forum category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create forum category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateForumCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('forum_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast({
        title: 'Category Updated',
        description: 'Forum category has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating forum category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update forum category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteForumCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast({
        title: 'Category Deleted',
        description: 'Forum category has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting forum category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete forum category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};