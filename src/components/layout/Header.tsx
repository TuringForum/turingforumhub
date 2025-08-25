import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Home, Settings, BookOpen, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 hover:bg-red-600';
      case 'contributor':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'reader':
        return 'bg-green-500 hover:bg-green-600';
      case 'guest':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Turing Forum Hub</h1>
                  <p className="text-xs text-muted-foreground">Collaborative platform</p>
                </div>
              </button>
            </div>
            
            {user && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive('/') && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => navigate('/')}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {(role === 'reader' || role === 'contributor' || role === 'admin') && (
                    <>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Content
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-4 w-[300px]">
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                              onClick={() => navigate('/projects')}
                            >
                              <div className="text-sm font-medium leading-none">Projects</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Browse and manage development projects
                              </p>
                            </NavigationMenuLink>
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                              onClick={() => navigate('/wiki')}
                            >
                              <div className="text-sm font-medium leading-none">Wiki</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Access knowledge base and documentation
                              </p>
                            </NavigationMenuLink>
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                              onClick={() => navigate('/forums')}
                            >
                              <div className="text-sm font-medium leading-none">Forums</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Join discussions and conversations
                              </p>
                            </NavigationMenuLink>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </>
                  )}

                  {role === 'admin' && (
                    <NavigationMenuItem>
                      <NavigationMenuLink 
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                          isActive('/admin') && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => navigate('/admin')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  {role && (
                    <Badge className={getRoleColor(role)}>
                      {role}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" onClick={handleSignOut} disabled={loading}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};