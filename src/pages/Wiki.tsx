import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, FileText, Folder } from 'lucide-react';

const Wiki = () => {
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
              />
            </div>
          </div>
          <RoleGuard allowedRoles={['contributor', 'admin']}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </RoleGuard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" />
                  Getting Started
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" />
                  Development
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" />
                  Best Practices
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" />
                  Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" />
                  Reference
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Getting Started Guide
                  </CardTitle>
                  <CardDescription>
                    Learn how to use the Turing Forum Hub platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p><strong>Category:</strong> Getting Started</p>
                    <p><strong>Last Updated:</strong> 3 days ago</p>
                    <p><strong>Author:</strong> Admin</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Read Article
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Development Workflow
                  </CardTitle>
                  <CardDescription>
                    Best practices for collaborative development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p><strong>Category:</strong> Development</p>
                    <p><strong>Last Updated:</strong> 1 week ago</p>
                    <p><strong>Author:</strong> Contributor</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Read Article
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Code Review Guidelines
                  </CardTitle>
                  <CardDescription>
                    How to conduct effective code reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p><strong>Category:</strong> Best Practices</p>
                    <p><strong>Last Updated:</strong> 2 weeks ago</p>
                    <p><strong>Author:</strong> Admin</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Read Article
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>
                    Complete reference for platform APIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p><strong>Category:</strong> Reference</p>
                    <p><strong>Last Updated:</strong> 4 days ago</p>
                    <p><strong>Author:</strong> Admin</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Wiki;