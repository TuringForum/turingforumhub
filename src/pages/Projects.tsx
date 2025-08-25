import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, GitBranch, Star, Clock, Plus, Search, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Projects = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Please sign in to access the projects
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-xl text-muted-foreground">
          Browse and manage development projects
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search Projects
          </Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="mr-2 h-5 w-5" />
              Web Development Framework
            </CardTitle>
            <CardDescription>
              A modern React-based framework for building web applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind</Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <GitBranch className="mr-2 h-4 w-4" />
                <span>12 branches</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                <span>24 stars</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Updated 2 days ago</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Project
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="mr-2 h-5 w-5" />
              API Documentation Tool
            </CardTitle>
            <CardDescription>
              Automated documentation generator for REST APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Node.js</Badge>
              <Badge variant="secondary">Express</Badge>
              <Badge variant="secondary">OpenAPI</Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <GitBranch className="mr-2 h-4 w-4" />
                <span>8 branches</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                <span>15 stars</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Updated 1 week ago</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Project
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="mr-2 h-5 w-5" />
              Data Visualization Library
            </CardTitle>
            <CardDescription>
              Interactive charts and graphs for web applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">D3.js</Badge>
              <Badge variant="secondary">Canvas</Badge>
              <Badge variant="secondary">SVG</Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <GitBranch className="mr-2 h-4 w-4" />
                <span>6 branches</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                <span>31 stars</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Updated 3 days ago</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Project
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Create New Project</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start a new collaborative project and invite contributors
            </p>
            <Button className="w-full" variant="outline">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;