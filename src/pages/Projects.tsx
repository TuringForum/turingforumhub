import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search } from 'lucide-react';

const Projects = () => {
  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
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
          <RoleGuard allowedRoles={['contributor', 'admin']}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </RoleGuard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Sample Project 1
              </CardTitle>
              <CardDescription>
                A demonstration project showcasing the platform's capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Status:</strong> Active</p>
                <p><strong>Contributors:</strong> 3</p>
                <p><strong>Last Updated:</strong> 2 days ago</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Project
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Sample Project 2
              </CardTitle>
              <CardDescription>
                Another example project for collaborative development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Status:</strong> In Progress</p>
                <p><strong>Contributors:</strong> 5</p>
                <p><strong>Last Updated:</strong> 1 week ago</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Project
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center text-muted-foreground">
                <Plus className="mx-auto h-8 w-8 mb-2" />
                Create New Project
              </CardTitle>
              <CardDescription className="text-center">
                Start a new collaborative project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleGuard allowedRoles={['contributor', 'admin']}>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </RoleGuard>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Projects;