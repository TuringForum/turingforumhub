import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const RoleGuard = ({ children, allowedRoles, fallback }: RoleGuardProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            You need to be signed in to access this content.
            <Button 
              className="ml-4" 
              onClick={() => navigate('/auth')}
              size="sm"
            >
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            You don't have permission to access this content. Your current role is: {role || 'unknown'}.
            {role === 'guest' && (
              <div className="mt-2">
                <p className="text-sm">
                  As a guest, you have no access permissions. Please contact an administrator to assign you a role.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};