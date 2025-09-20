import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, Video } from 'lucide-react';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!user) {
    return <div className="container mx-auto p-6">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <img src="/lovable-uploads/4a8eae7c-5598-408e-8d97-3a8d7275f7af.png" alt="Alan Turing" className="w-32 h-32 rounded-full shadow-xl mb-8 border-4 border-primary/20 mx-auto" />
            <h1 className="text-6xl font-bold mb-6 gradient-text leading-tight">
              Welcome to Turing Forum Hub
            </h1>
            <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">A collaborative platform for discussions and knowledge sharing about AI code generation</p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join our community to access projects, wiki articles, and discussion forums. 
              Connect with like-minded developers and share your expertise.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => navigate('/auth')} className="btn-primary text-lg px-8 py-4 h-auto">
              Get Started
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
            <div className="enhanced-card p-8 text-center animate-scale-in">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Rich Content</h3>
              <p className="text-muted-foreground">
                Access comprehensive documentation, tutorials, and collaborative projects.
              </p>
            </div>

            <div className="enhanced-card p-8 text-center animate-scale-in" style={{
            animationDelay: '0.1s'
          }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with developers, share knowledge, and collaborate on exciting projects.
              </p>
            </div>

            <div className="enhanced-card p-8 text-center animate-scale-in" style={{
            animationDelay: '0.2s'
          }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <MessageSquare className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Active Discussions</h3>
              <p className="text-muted-foreground">
                Engage in meaningful conversations and get help from experienced developers.
              </p>
            </div>

            <div className="enhanced-card p-8 text-center animate-scale-in" style={{
            animationDelay: '0.3s'
          }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Video className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Live Video Chat</h3>
              <p className="text-muted-foreground">
                Join video calls, share screens, and collaborate in real-time with the community.
              </p>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="container mx-auto p-6 animate-fade-in">
      <div className="mb-12 text-center">
        <div className="flex flex-col items-center mb-6">
          <img src="/lovable-uploads/4a8eae7c-5598-408e-8d97-3a8d7275f7af.png" alt="Alan Turing" className="w-32 h-32 rounded-full shadow-xl mb-6 border-4 border-primary/20" />
          <h1 className="text-5xl font-bold mb-4 gradient-text">Turing Forum Hub</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/livechat')}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                <Video className="h-6 w-6 text-primary-foreground" />
              </div>
              Live Chat
            </CardTitle>
            <CardDescription className="text-base">
              Video calls, screen sharing, and real-time chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full group-hover:bg-primary/90" variant="secondary">
              Start Video Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;