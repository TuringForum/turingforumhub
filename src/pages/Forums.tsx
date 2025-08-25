import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Pin, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Forums = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Forums</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Please sign in to access the forums
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Forums</h1>
        <p className="text-xl text-muted-foreground">
          Join discussions and conversations
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <Button variant="outline" size="sm">All Categories</Button>
          <Button variant="ghost" size="sm">Recent</Button>
          <Button variant="ghost" size="sm">Popular</Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">General Discussion</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Development</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Help & Support</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Feature Requests</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Announcements</span>
                <Badge variant="secondary">2</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Welcome to Turing Forum Hub!</h3>
                      <Badge variant="secondary">Pinned</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Get started with our platform. Introduce yourself and learn about the community guidelines.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        15 replies
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        2 days ago
                      </span>
                      <span>by Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">Best practices for code collaboration?</h3>
                      <Badge>Development</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Looking for advice on how to effectively collaborate on code projects. What tools and workflows work best?
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        8 replies
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        1 hour ago
                      </span>
                      <span>by Developer123</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">How to request new features?</h3>
                      <Badge variant="outline">Help & Support</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      I have some ideas for improving the platform. What's the best way to submit feature requests?
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        3 replies
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        6 hours ago
                      </span>
                      <span>by NewUser</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forums;