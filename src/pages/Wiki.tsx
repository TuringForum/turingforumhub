import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { BookOpen, Search, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWikiPages, useDeleteWikiPage, WikiPage } from '@/hooks/useWikiPages';
import { CreatePageDialog } from '@/components/wiki/CreatePageDialog';
import { WikiPageCard } from '@/components/wiki/WikiPageCard';
import { WikiCategoryList } from '@/components/wiki/WikiCategoryList';

const Wiki = () => {
  const { role } = useAuth();
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pages && pages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.map((page) => (
                  <WikiPageCard 
                    key={page.id} 
                    page={page}
                    onClick={() => navigate(`/wiki/${page.slug}`)}
                    onDelete={(page) => {
                      setPageToDelete(page);
                      setDeleteDialogOpen(true);
                    }}
                  />
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