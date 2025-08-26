import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string;
  created_by: string;
  updated_by: string | null;
  is_published: boolean;
  view_count: number;
  version: number;
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
  updater?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
}

export const useWikiPages = (categoryId?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['wiki-pages', categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('wiki_pages')
        .select(`
          *,
          category:wiki_categories(id, name, slug, color)
        `)
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching wiki pages:', error);
        throw error;
      }

      return data as WikiPage[];
    },
  });
};

export const useWikiPage = (slug: string) => {
  return useQuery({
    queryKey: ['wiki-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select(`
          *,
          category:wiki_categories(id, name, slug, color)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching wiki page:', error);
        throw error;
      }

      // Increment view count
      if (data) {
        await supabase.rpc('increment_wiki_page_view', { page_id: data.id });
      }

      return data as WikiPage;
    },
  });
};

export const useCreateWikiPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category_id: string;
      is_published?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wiki_pages')
        .insert([{
          ...page,
          created_by: user.id,
          updated_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      toast({
        title: 'Page Created',
        description: 'Your wiki page has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating wiki page:', error);
      toast({
        title: 'Error',
        description: 'Failed to create wiki page. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateWikiPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WikiPage> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wiki_pages')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      queryClient.invalidateQueries({ queryKey: ['wiki-page'] });
      toast({
        title: 'Page Updated',
        description: 'Wiki page has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating wiki page:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wiki page. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteWikiPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      toast({
        title: 'Page Deleted',
        description: 'Wiki page has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting wiki page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete wiki page. Please try again.',
        variant: 'destructive',
      });
    },
  });
};