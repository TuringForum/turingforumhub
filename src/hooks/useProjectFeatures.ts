import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectFeature {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjectFeatures = (projectId: string) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<ProjectFeature[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('project_features')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching features:', error);
        toast({
          title: "Error",
          description: "Failed to load features",
          variant: "destructive",
        });
        return;
      }

      const featuresWithTypedStatus: ProjectFeature[] = (data || []).map(feature => ({
        ...feature,
        status: feature.status as ProjectFeature['status'],
        priority: feature.priority as ProjectFeature['priority'],
      }));
      setFeatures(featuresWithTypedStatus);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFeature = async (featureData: {
    title: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('project_features')
        .insert({
          ...featureData,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feature:', error);
        toast({
          title: "Error",
          description: "Failed to create feature",
          variant: "destructive",
        });
        return { error: error.message };
      }

      const typedFeature: ProjectFeature = {
        ...data,
        status: data.status as ProjectFeature['status'],
        priority: data.priority as ProjectFeature['priority'],
      };
      setFeatures((prev) => [typedFeature, ...prev]);
      toast({
        title: "Success",
        description: "Feature created successfully",
      });
      return { data };
    } catch (error) {
      console.error('Error creating feature:', error);
      return { error: 'Failed to create feature' };
    }
  };

  const updateFeature = async (
    id: string,
    updates: Partial<Omit<ProjectFeature, 'id' | 'project_id' | 'created_by' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('project_features')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating feature:', error);
        toast({
          title: "Error",
          description: "Failed to update feature",
          variant: "destructive",
        });
        return { error: error.message };
      }

      const typedFeature: ProjectFeature = {
        ...data,
        status: data.status as ProjectFeature['status'],
        priority: data.priority as ProjectFeature['priority'],
      };
      setFeatures((prev) =>
        prev.map((feature) => (feature.id === id ? typedFeature : feature))
      );
      toast({
        title: "Success",
        description: "Feature updated successfully",
      });
      return { data };
    } catch (error) {
      console.error('Error updating feature:', error);
      return { error: 'Failed to update feature' };
    }
  };

  const deleteFeature = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('project_features')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting feature:', error);
        toast({
          title: "Error",
          description: "Failed to delete feature",
          variant: "destructive",
        });
        return { error: error.message };
      }

      setFeatures((prev) => prev.filter((feature) => feature.id !== id));
      toast({
        title: "Success",
        description: "Feature deleted successfully",
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting feature:', error);
      return { error: 'Failed to delete feature' };
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFeatures();
    }
  }, [projectId, user]);

  return {
    features,
    loading,
    createFeature,
    updateFeature,
    deleteFeature,
    refetch: fetchFeatures,
  };
};