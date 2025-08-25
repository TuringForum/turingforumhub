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
import { Home, Settings, BookOpen, MessageSquare, Users, User } from 'lucide-react';
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
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <span className="text-primary-foreground font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Turing Forum Hub</h1>
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
                        "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/') && "bg-accent/50 text-accent-foreground shadow-glow"
                      )}
                      onClick={() => navigate('/')}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/profile') && "bg-accent/50 text-accent-foreground shadow-glow"
                      )}
                      onClick={() => navigate('/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {(role === 'reader' || role === 'contributor' || role === 'admin') && (
                    <>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Content
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-6 w-[400px] glass">
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer group"
                              onClick={() => navigate('/projects')}
                            >
                              <div className="text-sm font-medium leading-none group-hover:gradient-text transition-all duration-300">Projects</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Browse and manage development projects
                              </p>
                            </NavigationMenuLink>
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer group"
                              onClick={() => navigate('/wiki')}
                            >
                              <div className="text-sm font-medium leading-none group-hover:gradient-text transition-all duration-300">Wiki</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Access knowledge base and documentation
                              </p>
                            </NavigationMenuLink>
                            <NavigationMenuLink 
                              className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer group"
                              onClick={() => navigate('/forums')}
                            >
                              <div className="text-sm font-medium leading-none group-hover:gradient-text transition-all duration-300">Forums</div>
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
                          "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          isActive('/admin') && "bg-accent/50 text-accent-foreground shadow-glow"
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
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground font-medium">{user.email}</span>
                  {role && (
                    <Badge className={cn(
                      "transition-all duration-300 shadow-sm",
                      getRoleColor(role)
                    )}>
                      {role}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut} 
                  disabled={loading}
                  className="border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="btn-primary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};