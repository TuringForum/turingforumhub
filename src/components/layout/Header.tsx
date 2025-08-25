import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Turing Forum Hub</h1>
                <p className="text-sm text-muted-foreground">A collaborative platform for discussions and knowledge sharing</p>
              </div>
            </div>
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