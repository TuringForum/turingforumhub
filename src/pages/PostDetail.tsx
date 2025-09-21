import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { ReplyCard } from '@/components/forums/ReplyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, MessageSquare, Pin, Lock, User, Send, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForumPost, useDeleteForumPost } from '@/hooks/useForumPosts';
import { useForumReplies, useCreateForumReply, useUpdateForumReply, useDeleteForumReply, ForumReply } from '@/hooks/useForumReplies';

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false);
  const [deleteReplyDialogOpen, setDeleteReplyDialogOpen] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);

  const { data: post, isLoading: postLoading } = useForumPost(postId!);
  const { data: replies, isLoading: repliesLoading } = useForumReplies(postId!);
  const createReply = useCreateForumReply();
  const updateReply = useUpdateForumReply();
  const deletePost = useDeleteForumPost();
  const deleteReply = useDeleteForumReply();

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
        parent_id: null, // Top-level reply
      });
      setReplyContent('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleNestedReply = async (parentId: string, content: string) => {
    if (!postId) return;

    try {
      await createReply.mutateAsync({
        content,
        post_id: postId,
        parent_id: parentId,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditReply = async (reply: ForumReply, content: string) => {
    try {
      await updateReply.mutateAsync({
        id: reply.id,
        content,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return;
    try {
      await deletePost.mutateAsync(postId);
      navigate('/forums');
    } catch (error) {
      // Error is handled by the mutation
    }
    setDeletePostDialogOpen(false);
  };

  const handleDeleteReply = async () => {
    if (!selectedReplyId) return;
    try {
      await deleteReply.mutateAsync(selectedReplyId);
    } catch (error) {
      // Error is handled by the mutation
    }
    setDeleteReplyDialogOpen(false);
    setSelectedReplyId(null);
  };

  const canEditPost = user && post && (post.created_by === user.id || role === 'admin');
  const canDeletePost = user && post && (post.created_by === user.id || role === 'admin');

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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/forums')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forums
          </Button>
          
          {canDeletePost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem 
                  onClick={() => setDeletePostDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
            <div className="space-y-2">
              {replies?.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  postId={postId!}
                  onEdit={handleEditReply}
                  onDelete={(replyId) => {
                    setSelectedReplyId(replyId);
                    setDeleteReplyDialogOpen(true);
                  }}
                  onReply={handleNestedReply}
                  isLocked={post?.is_locked}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delete Post Dialog */}
        <AlertDialog open={deletePostDialogOpen} onOpenChange={setDeletePostDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone and will also delete all replies.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Reply Dialog */}
        <AlertDialog open={deleteReplyDialogOpen} onOpenChange={setDeleteReplyDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reply</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this reply? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReply}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Reply
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
};

export default PostDetail;