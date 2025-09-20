import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
  repository_url: string | null;
  demo_url: string | null;
  is_public: boolean;
  creator_nickname?: string | null;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
        return;
      }

      // Get creator nicknames using secure function
      const profileQueries = projectsData.map(p => 
        supabase.rpc('get_user_basic_profile', { target_user_id: p.created_by })
      );
      
      const profileResults = await Promise.all(profileQueries);
      
      // Create a map of user_id to nickname
      const nicknameMap = new Map(
        profileResults
          .filter(result => result.data?.[0])
          .map(result => [result.data[0].user_id, result.data[0].nickname])
      );

      // Combine the data
      const projectsWithCreators: Project[] = projectsData.map(project => ({
        ...project,
        status: project.status as 'draft' | 'active' | 'completed' | 'archived',
        creator_nickname: nicknameMap.get(project.created_by) || null,
      }));

      setProjects(projectsWithCreators);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    title: string;
    description?: string;
    content?: string;
    status?: 'draft' | 'active' | 'completed' | 'archived';
    tags?: string[];
    repository_url?: string;
    demo_url?: string;
    is_public?: boolean;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
        return { error: error.message };
      }

      // Get creator nickname
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', user.id)
        .single();

      const newProject: Project = {
        ...data,
        status: data.status as 'draft' | 'active' | 'completed' | 'archived',
        creator_nickname: profileData?.nickname || null,
      };

      setProjects((prev) => [newProject, ...prev]);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      return { data: newProject };
    } catch (error) {
      console.error('Error creating project:', error);
      return { error: 'Failed to create project' };
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Omit<Project, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'creator_nickname'>>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
        return { error: error.message };
      }

      // Get creator nickname using secure function
      const { data: profiles } = await supabase
        .rpc('get_user_basic_profile', { target_user_id: data.created_by });
      
      const profile = profiles?.[0];

      const updatedProject: Project = {
        ...data,
        status: data.status as 'draft' | 'active' | 'completed' | 'archived',
        creator_nickname: profile?.nickname || null,
      };

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      return { data: updatedProject };
    } catch (error) {
      console.error('Error updating project:', error);
      return { error: 'Failed to update project' };
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
        return { error: error.message };
      }

      setProjects((prev) => prev.filter((project) => project.id !== id));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error: 'Failed to delete project' };
    }
  };

  const getProject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        return { error: error.message };
      }

      // Get creator nickname using secure function
      const { data: profiles } = await supabase
        .rpc('get_user_basic_profile', { target_user_id: data.created_by });
      
      const profile = profiles?.[0];

      const projectWithCreator: Project = {
        ...data,
        status: data.status as 'draft' | 'active' | 'completed' | 'archived',
        creator_nickname: profile?.nickname || null,
      };

      return { data: projectWithCreator };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { error: 'Failed to fetch project' };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    refetch: fetchProjects,
  };
};