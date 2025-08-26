import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Pin, Lock, User, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForumPost } from '@/hooks/useForumPosts';
import { useForumReplies, useCreateForumReply } from '@/hooks/useForumReplies';

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [replyContent, setReplyContent] = useState('');

  const { data: post, isLoading: postLoading } = useForumPost(postId!);
  const { data: replies, isLoading: repliesLoading } = useForumReplies(postId!);
  const createReply = useCreateForumReply();

  const getInitials = (nickname: string | null) => {
    if (!nickname) return 'U';
    return nickname
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !postId) return;

    try {
      await createReply.mutateAsync({
        content: replyContent.trim(),
        post_id: postId,
      });
      setReplyContent('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (postLoading) {
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

  if (!post) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Button onClick={() => navigate('/forums')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forums
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/forums')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forums
          </Button>
        </div>

        {/* Main Post */}
        <Card className="enhanced-card mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {getInitials(post.author?.nickname || null)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                  {post.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>by {post.author?.nickname || 'Anonymous'}</span>
                  <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                  {post.category && (
                    <Badge 
                      style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                    >
                      {post.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              {post.reply_count} {post.reply_count === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>

          {/* Reply Form */}
          <RoleGuard allowedRoles={['contributor', 'admin']}>
            {!post.is_locked && (
              <Card className="enhanced-card">
                <CardContent className="p-6">
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={createReply.isPending || !replyContent.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {createReply.isPending ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </RoleGuard>

          {/* Locked Post Message */}
          {post.is_locked && (
            <Card className="border-dashed border-2">
              <CardContent className="p-6 text-center">
                <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Discussion Locked</h3>
                <p className="text-muted-foreground text-sm">
                  This discussion has been locked and no longer accepts new replies.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reader Role Message */}
          {role === 'reader' && !post.is_locked && (
            <Card className="border-dashed border-2">
              <CardContent className="p-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Want to join the conversation?</h3>
                <p className="text-muted-foreground text-sm">
                  You have read-only access to forums. Contact an admin to upgrade your role for posting privileges.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Replies List */}
          {repliesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {replies?.map((reply) => (
                <Card key={reply.id} className="enhanced-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reply.author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {getInitials(reply.author?.nickname || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">
                            {reply.author?.nickname || 'Anonymous'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at))} ago
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default PostDetail;