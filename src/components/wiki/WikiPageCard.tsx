import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FileText, Eye, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { WikiPage } from '@/hooks/useWikiPages';
import { useAuth } from '@/hooks/useAuth';

interface WikiPageCardProps {
  page: WikiPage;
  onClick?: () => void;
  onEdit?: (page: WikiPage) => void;
  onDelete?: (page: WikiPage) => void;
}

export function WikiPageCard({ page, onClick, onEdit, onDelete }: WikiPageCardProps) {
  const { user, role } = useAuth();
  const isAuthor = user?.id === page.created_by;
  const canDelete = isAuthor || role === 'admin';
  return (
    <Card 
      className="enhanced-card hover:shadow-lg transition-all duration-300 cursor-pointer group h-full" 
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center text-lg group-hover:text-primary transition-colors">
            <FileText className="mr-2 h-5 w-5" />
            {page.title}
          </CardTitle>
          
          {canDelete && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {isAuthor && onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(page);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(page);
                    }}
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
        <CardDescription className="line-clamp-2">
          {page.excerpt || page.content.substring(0, 150) + '...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {page.category && (
            <Badge 
              style={{ 
                backgroundColor: page.category.color + '20', 
                color: page.category.color 
              }}
              className="text-xs"
            >
              {page.category.name}
            </Badge>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {page.view_count} views
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(page.updated_at))} ago
              </span>
            </div>
          </div>
          
          <Button 
            className="w-full group-hover:bg-primary/90" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Read Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}