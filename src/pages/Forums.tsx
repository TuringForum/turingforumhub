import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForumPosts } from '@/hooks/useForumPosts';
import { CreatePostDialog } from '@/components/forums/CreatePostDialog';
import { ForumPostCard } from '@/components/forums/ForumPostCard';
import { ForumCategoryList } from '@/components/forums/ForumCategoryList';

const Forums = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  
  const { data: posts, isLoading: postsLoading } = useForumPosts(selectedCategory);

  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Forums</h1>
          <p className="text-xl text-muted-foreground">
            Join discussions and conversations
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="space-x-4">
            <Button 
              variant={!selectedCategory ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(undefined)}
            >
              All Categories
            </Button>
          </div>
          <RoleGuard allowedRoles={['contributor', 'admin']}>
            <CreatePostDialog />
          </RoleGuard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ForumCategoryList 
              selectedCategory={selectedCategory} 
              onCategorySelect={setSelectedCategory}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="h-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <ForumPostCard 
                  key={post.id} 
                  post={post}
                  onClick={() => navigate(`/forums/post/${post.id}`)}
                />
              ))
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Be the first to start a conversation in this category.
                  </p>
                  <RoleGuard allowedRoles={['contributor', 'admin']}>
                    <CreatePostDialog />
                  </RoleGuard>
                </CardContent>
              </Card>
            )}

            {role === 'reader' && posts && posts.length > 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Want to join the conversation?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    You have read-only access to forums. Contact an admin to upgrade your role for posting privileges.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Forums;