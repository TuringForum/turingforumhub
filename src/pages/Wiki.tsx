import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BookOpen, Search, FileText, Eye, Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWikiPages, useDeleteWikiPage, WikiPage } from '@/hooks/useWikiPages';
import { CreatePageDialog } from '@/components/wiki/CreatePageDialog';
import { WikiPageCard } from '@/components/wiki/WikiPageCard';
import { WikiCategoryList } from '@/components/wiki/WikiCategoryList';

const Wiki = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<WikiPage | null>(null);
  
  const { data: pages, isLoading: pagesLoading } = useWikiPages(selectedCategory, searchQuery);
  const deletePage = useDeleteWikiPage();

  const handleDeletePage = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage.mutateAsync(pageToDelete.id);
    } catch (error) {
      // Error is handled by the mutation
    }
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  };
  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wiki</h1>
          <p className="text-xl text-muted-foreground">
            Access knowledge base and documentation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search wiki articles..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <RoleGuard allowedRoles={['contributor', 'admin']}>
            <CreatePageDialog />
          </RoleGuard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <WikiCategoryList 
              selectedCategory={selectedCategory} 
              onCategorySelect={setSelectedCategory}
            />
          </div>

          <div className="lg:col-span-3">
            {pagesLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-48"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pages && pages.length > 0 ? (
              <div className="space-y-2">
                {[...pages]
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((page) => (
                    <div 
                      key={page.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/wiki/${page.slug}`)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate group-hover:text-primary transition-colors">
                          {page.title}
                        </span>
                        {page.category && (
                          <Badge 
                            variant="secondary"
                            className="text-xs flex-shrink-0"
                            style={{ 
                              backgroundColor: page.category.color + '20', 
                              color: page.category.color 
                            }}
                          >
                            {page.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground flex-shrink-0">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {page.view_count}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(page.updated_at))} ago
                        </span>
                        {((user?.id === page.created_by) || role === 'admin') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPageToDelete(page);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">
                    {searchQuery 
                      ? 'No articles found' 
                      : selectedCategory 
                        ? 'No articles in this category' 
                        : 'No articles yet'
                    }
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery
                      ? 'Try adjusting your search terms or browse categories.'
                      : selectedCategory
                        ? 'Be the first to contribute to this category.'
                        : 'Start building the knowledge base by creating the first article.'
                    }
                  </p>
                  <RoleGuard allowedRoles={['contributor', 'admin']}>
                    <CreatePageDialog />
                  </RoleGuard>
                </CardContent>
              </Card>
            )}

            {role === 'reader' && pages && pages.length > 0 && (
              <Card className="border-dashed border-2 mt-6">
                <CardContent className="p-6 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Want to contribute to the wiki?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    You have read-only access. Contact an admin to upgrade your role for editing privileges.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Delete Page Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Wiki Page</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone and will also delete all revisions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePage}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Page
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
};

export default Wiki;