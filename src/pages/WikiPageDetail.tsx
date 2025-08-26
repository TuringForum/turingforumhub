import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Eye, Calendar, Edit, FileText, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWikiPage } from '@/hooks/useWikiPages';
import { RichTextRenderer } from '@/components/wiki/RichTextRenderer';
import { EditPageDialog } from '@/components/wiki/EditPageDialog';

const WikiPageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: page, isLoading, error } = useWikiPage(slug!);

  const getInitials = (nickname: string | null) => {
    if (!nickname) return 'U';
    return nickname
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canEdit = user && page && (
    page.created_by === user.id || 
    role === 'admin'
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-4">The wiki page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/wiki')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wiki
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/wiki')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wiki
          </Button>
          
          {canEdit && (
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Page
            </Button>
          )}
        </div>

        {/* Page Header */}
        <Card className="enhanced-card mb-8">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Title and Category */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h1 className="text-4xl font-bold">{page.title}</h1>
                </div>
                
                {page.category && (
                  <Badge 
                    style={{ 
                      backgroundColor: page.category.color + '20', 
                      color: page.category.color 
                    }}
                    className="text-sm"
                  >
                    {page.category.name}
                  </Badge>
                )}
              </div>

              {/* Excerpt */}
              {page.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {page.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-6">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={page.author?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {getInitials(page.author?.nickname || null)}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {page.author?.nickname || 'Anonymous'}</span>
                </div>
                
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Updated {formatDistanceToNow(new Date(page.updated_at))} ago
                </span>
                
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {page.view_count} views
                </span>
                
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Version {page.version}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Content */}
        <Card className="enhanced-card">
          <CardContent className="p-8">
            <RichTextRenderer content={page.content} />
          </CardContent>
        </Card>

        {/* Footer with edit info */}
        {page.updated_by && page.updated_by !== page.created_by && (
          <Card className="enhanced-card mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Last edited by {page.updater?.nickname || 'Anonymous'}</span>
                </div>
                <span>{formatDistanceToNow(new Date(page.updated_at))} ago</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        {page && (
          <EditPageDialog 
            page={page}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default WikiPageDetail;