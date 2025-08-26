import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WikiCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useWikiCategories = () => {
  return useQuery({
    queryKey: ['wiki-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching wiki categories:', error);
        throw error;
      }

      return data as WikiCategory[];
    },
  });
};

export const useCreateWikiCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<WikiCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('wiki_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-categories'] });
      toast({
        title: 'Category Created',
        description: 'Wiki category has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating wiki category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create wiki category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};