import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, Settings } from 'lucide-react';

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome to Turing Forum Hub</h1>
          <p className="text-xl text-muted-foreground mb-8">
            A collaborative platform for discussions and knowledge sharing
          </p>
          <p className="text-lg mb-8">
            Join our community to access projects, wiki articles, and discussion forums.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (role === 'guest') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome to Turing Forum Hub</h1>
          <Badge className="mb-4 bg-gray-500">Guest Access</Badge>
          <p className="text-lg mb-8">
            Your account has been created but you currently have guest access with no permissions.
            Please contact an administrator to assign you a role so you can access our content.
          </p>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Pending Access</CardTitle>
              <CardDescription>
                An administrator needs to assign you a role to access platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-left">
                <p><strong>Reader:</strong> View all content (wiki, forums, projects)</p>
                <p><strong>Contributor:</strong> Read + edit wiki pages + participate in forums</p>
                <p><strong>Admin:</strong> Full access including user management</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-xl text-muted-foreground">
          Your role: <Badge className="ml-2">{role}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Projects
              </CardTitle>
              <CardDescription>
                Browse and manage development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Projects</Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Wiki
              </CardTitle>
              <CardDescription>
                Access knowledge base and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Browse Wiki</Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Forums
              </CardTitle>
              <CardDescription>
                Join discussions and conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {role === 'reader' ? 'View Forums' : 'Join Discussions'}
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['admin']}>
          <Card className="hover:shadow-lg transition-shadow border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Settings className="mr-2 h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                Manage users, roles, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/admin')}
              >
                Manage System
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {role === 'reader' && (
                <p>✅ View all content (projects, wiki, forums)</p>
              )}
              {role === 'contributor' && (
                <>
                  <p>✅ View all content (projects, wiki, forums)</p>
                  <p>✅ Edit wiki pages and participate in forums</p>
                </>
              )}
              {role === 'admin' && (
                <>
                  <p>✅ Full access to all content</p>
                  <p>✅ Edit wiki pages and manage forums</p>
                  <p>✅ User management and role assignment</p>
                  <p>✅ System administration</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
