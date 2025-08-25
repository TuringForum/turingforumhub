import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
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

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Welcome back!</h1>
        <p className="text-xl text-muted-foreground">
          Explore our platform and connect with the community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
              Join Discussions
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mr-3 shadow-glow">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <p className="text-green-400 font-medium">Access all projects and documentation</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <p className="text-blue-400 font-medium">Participate in community discussions</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 text-sm">✓</span>
                </div>
                <p className="text-purple-400 font-medium">Contribute to wiki knowledge base</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-glow">
                  <Users className="h-10 w-10 text-primary-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Welcome to the community!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;