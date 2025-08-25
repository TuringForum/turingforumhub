import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-6 gradient-text leading-tight">
              Welcome to Turing Forum Hub
            </h1>
            <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
              A collaborative platform for discussions and knowledge sharing
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join our community to access projects, wiki articles, and discussion forums. 
              Connect with like-minded developers and share your expertise.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-primary text-lg px-8 py-4 h-auto"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4 h-auto border-white/20 hover:bg-white/10 hover:border-white/40"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="enhanced-card p-8 text-center animate-scale-in">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Rich Content</h3>
              <p className="text-muted-foreground">
                Access comprehensive documentation, tutorials, and collaborative projects.
              </p>
            </div>

            <div className="enhanced-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with developers, share knowledge, and collaborate on exciting projects.
              </p>
            </div>

            <div className="enhanced-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <MessageSquare className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Active Discussions</h3>
              <p className="text-muted-foreground">
                Engage in meaningful conversations and get help from experienced developers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'guest') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-6 gradient-text">Welcome to Turing Forum Hub</h1>
            <Badge className="mb-6 bg-muted/50 text-muted-foreground border-muted text-lg px-4 py-2">
              Guest Access
            </Badge>
          </div>
          
          <div className="enhanced-card p-8 mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce-gentle">
              <Settings className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Account Setup Required</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your account has been created but you currently have guest access with no permissions.
              Please contact an administrator to assign you a role so you can access our content.
            </p>
          </div>

          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Available Roles</CardTitle>
              <CardDescription className="text-lg">
                An administrator needs to assign you a role to access platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">Reader</p>
                      <p className="text-sm text-muted-foreground">View all content</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-400">Contributor</p>
                      <p className="text-sm text-muted-foreground">Create and edit content</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">Admin</p>
                      <p className="text-sm text-muted-foreground">Full system access</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Welcome back!</h1>
        <div className="text-xl text-muted-foreground flex items-center gap-3">
          Your role: 
          <Badge className={cn(
            "text-lg px-4 py-2 shadow-lg transition-all duration-300",
            role === 'admin' && "bg-red-500/20 text-red-400 border-red-500/30",
            role === 'contributor' && "bg-blue-500/20 text-blue-400 border-blue-500/30", 
            role === 'reader' && "bg-green-500/20 text-green-400 border-green-500/30"
          )}>
            {role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/projects')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                Projects
              </CardTitle>
              <CardDescription className="text-base">
                Browse and manage development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" variant="secondary">
                View Projects
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/wiki')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                Wiki
              </CardTitle>
              <CardDescription className="text-base">
                Access knowledge base and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" variant="secondary">
                Browse Wiki
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
          <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/forums')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                Forums
              </CardTitle>
              <CardDescription className="text-base">
                Join discussions and conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" variant="secondary">
                {role === 'reader' ? 'View Forums' : 'Join Discussions'}
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['admin']}>
          <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105 border-red-500/20" onClick={() => navigate('/admin')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-red-400">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <Settings className="h-6 w-6 text-red-400" />
                </div>
                Admin Panel
              </CardTitle>
              <CardDescription className="text-base">
                Manage users, roles, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full border-red-500/30 hover:bg-red-500/10">
                Manage System
              </Button>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mr-3 shadow-glow">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            Your Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {role === 'reader' && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-green-400 font-medium">View all content (projects, wiki, forums)</p>
                </div>
              )}
              {role === 'contributor' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                    <p className="text-green-400 font-medium">View all content (projects, wiki, forums)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-sm">✓</span>
                    </div>
                    <p className="text-blue-400 font-medium">Edit wiki pages and participate in forums</p>
                  </div>
                </>
              )}
              {role === 'admin' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                    <p className="text-green-400 font-medium">Full access to all content</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-sm">✓</span>
                    </div>
                    <p className="text-blue-400 font-medium">Edit wiki pages and manage forums</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 text-sm">✓</span>
                    </div>
                    <p className="text-red-400 font-medium">User management and role assignment</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 text-sm">✓</span>
                    </div>
                    <p className="text-purple-400 font-medium">System administration</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-glow">
                  <span className="text-2xl font-bold text-primary-foreground">{role?.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Role Level: {role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
