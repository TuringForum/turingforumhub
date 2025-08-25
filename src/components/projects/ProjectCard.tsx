import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BookOpen, ExternalLink, Github, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export const ProjectCard = ({ project, onView, onEdit, onDelete }: ProjectCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === project.created_by;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              <span className="line-clamp-1">{project.title}</span>
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          
          {(isOwner || onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => onView(project)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {(isOwner && onEdit) && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {(isOwner && onDelete) && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(project)} 
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            {!project.is_public && (
              <Badge variant="outline">Private</Badge>
            )}
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Created by:</strong> {project.creator_nickname || 'Unknown'}</p>
            <p><strong>Updated:</strong> {formatDate(project.updated_at)}</p>
          </div>

          <div className="flex space-x-2">
            <Button 
              className="flex-1 group-hover:bg-primary/90" 
              variant="secondary"
              onClick={() => onView(project)}
            >
              View Project
            </Button>
            
            <div className="flex space-x-1">
              {project.repository_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.repository_url!, '_blank');
                  }}
                >
                  <Github className="h-4 w-4" />
                </Button>
              )}
              {project.demo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.demo_url!, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};