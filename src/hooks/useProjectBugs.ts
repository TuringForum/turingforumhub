import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectBug {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjectBugs = (projectId: string) => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState<ProjectBug[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBugs = async () => {
    try {
      const { data, error } = await supabase
        .from('project_bugs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bugs:', error);
        toast({
          title: "Error",
          description: "Failed to load bugs",
          variant: "destructive",
        });
        return;
      }

      const bugsWithTypedStatus: ProjectBug[] = (data || []).map(bug => ({
        ...bug,
        status: bug.status as ProjectBug['status'],
        severity: bug.severity as ProjectBug['severity'],
      }));
      setBugs(bugsWithTypedStatus);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBug = async (bugData: {
    title: string;
    description?: string;
    status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('project_bugs')
        .insert({
          ...bugData,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bug:', error);
        toast({
          title: "Error",
          description: "Failed to create bug",
          variant: "destructive",
        });
        return { error: error.message };
      }

      const typedBug: ProjectBug = {
        ...data,
        status: data.status as ProjectBug['status'],
        severity: data.severity as ProjectBug['severity'],
      };
      setBugs((prev) => [typedBug, ...prev]);
      toast({
        title: "Success",
        description: "Bug created successfully",
      });
      return { data };
    } catch (error) {
      console.error('Error creating bug:', error);
      return { error: 'Failed to create bug' };
    }
  };

  const updateBug = async (
    id: string,
    updates: Partial<Omit<ProjectBug, 'id' | 'project_id' | 'created_by' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('project_bugs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bug:', error);
        toast({
          title: "Error",
          description: "Failed to update bug",
          variant: "destructive",
        });
        return { error: error.message };
      }

      const typedBug: ProjectBug = {
        ...data,
        status: data.status as ProjectBug['status'],
        severity: data.severity as ProjectBug['severity'],
      };
      setBugs((prev) =>
        prev.map((bug) => (bug.id === id ? typedBug : bug))
      );
      toast({
        title: "Success",
        description: "Bug updated successfully",
      });
      return { data };
    } catch (error) {
      console.error('Error updating bug:', error);
      return { error: 'Failed to update bug' };
    }
  };

  const deleteBug = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('project_bugs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting bug:', error);
        toast({
          title: "Error",
          description: "Failed to delete bug",
          variant: "destructive",
        });
        return { error: error.message };
      }

      setBugs((prev) => prev.filter((bug) => bug.id !== id));
      toast({
        title: "Success",
        description: "Bug deleted successfully",
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting bug:', error);
      return { error: 'Failed to delete bug' };
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchBugs();
    }
  }, [projectId, user]);

  return {
    bugs,
    loading,
    createBug,
    updateBug,
    deleteBug,
    refetch: fetchBugs,
  };
};