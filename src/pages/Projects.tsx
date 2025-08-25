import { useState } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm, ProjectFormData } from '@/components/projects/ProjectForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureList } from '@/components/projects/FeatureList';
import { BugList } from '@/components/projects/BugList';
import { BookOpen, Plus, Search } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateProject = async (data: ProjectFormData) => {
    setFormLoading(true);
    const result = await createProject(data);
    if (!result?.error) {
      setShowCreateDialog(false);
    }
    setFormLoading(false);
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    setFormLoading(true);
    const result = await updateProject(editingProject.id, data);
    if (!result?.error) {
      setEditingProject(null);
    }
    setFormLoading(false);
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    await deleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-xl text-muted-foreground">
          Browse and manage development projects
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {user && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="text-center p-12">
          <CardHeader>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No projects found</CardTitle>
            <CardDescription>
              {searchTerm ? 'No projects match your search criteria.' : 'Get started by creating your first project.'}
            </CardDescription>
          </CardHeader>
          {!searchTerm && user && (
            <CardContent>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleViewProject}
              onEdit={user?.id === project.created_by ? setEditingProject : undefined}
              onDelete={user?.id === project.created_by ? setDeletingProject : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setShowCreateDialog(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
              onSubmit={handleUpdateProject}
              onCancel={() => setEditingProject(null)}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProject?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Project Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              {selectedProject?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="bugs">Bugs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {selectedProject.description || 'No description provided'}
                  </p>
                </div>
                
                {selectedProject.content && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Content</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedProject.content}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Status:</strong> {selectedProject.status}
                  </div>
                  <div>
                    <strong>Created by:</strong> {selectedProject.creator_nickname || 'Unknown'}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(selectedProject.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Updated:</strong> {new Date(selectedProject.updated_at).toLocaleDateString()}
                  </div>
                </div>

                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag) => (
                        <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProject.repository_url || selectedProject.demo_url) && (
                  <div className="flex space-x-4">
                    {selectedProject.repository_url && (
                      <Button variant="outline" onClick={() => window.open(selectedProject.repository_url!, '_blank')}>
                        View Repository
                      </Button>
                    )}
                    {selectedProject.demo_url && (
                      <Button variant="outline" onClick={() => window.open(selectedProject.demo_url!, '_blank')}>
                        View Demo
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="features">
                <FeatureList 
                  projectId={selectedProject.id} 
                  isOwner={user?.id === selectedProject.created_by}
                />
              </TabsContent>
              
              <TabsContent value="bugs">
                <BugList 
                  projectId={selectedProject.id} 
                  isOwner={user?.id === selectedProject.created_by}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;