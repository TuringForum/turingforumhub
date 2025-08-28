import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trash2, Users, Shield, Activity, Settings, UserCheck, UserX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserData {
  id: string;
  email: string;
  nickname: string | null;
  role: UserRole | null;
  created_at: string;
  last_sign_in_at?: string;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    contributorCount: 0,
    readerCount: 0,
    guestCount: 0
  });

  const fetchUsers = async () => {
    try {
      // Get user roles data
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (roleError) {
        console.error('Error fetching roles:', roleError);
        toast({
          title: "Error",
          description: "Failed to fetch user role data",
          variant: "destructive",
        });
        return;
      }

      // Get profiles data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, nickname');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        // Continue without profile data
      }

      // Create a map of user_id to nickname for efficient lookup
      const nicknameMap = new Map(
        profileData?.map(profile => [profile.user_id, profile.nickname]) || []
      );

      // Map the data to include nicknames
      const userData = roleData.map(roleRecord => ({
        id: roleRecord.user_id,
        email: `User ${roleRecord.user_id.slice(0, 8)}...`, // Show partial ID for privacy
        nickname: nicknameMap.get(roleRecord.user_id) || null,
        role: roleRecord.role as UserRole,
        created_at: roleRecord.created_at,
        last_sign_in_at: undefined, // Not available client-side
      }));

      setUsers(userData);

      // Calculate stats
      const stats = {
        totalUsers: userData.length,
        adminCount: userData.filter(u => u.role === 'admin').length,
        contributorCount: userData.filter(u => u.role === 'contributor').length,
        readerCount: userData.filter(u => u.role === 'reader').length,
        guestCount: userData.filter(u => u.role === 'guest').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (userId === user?.id && newRole !== 'admin') {
      toast({
        title: "Cannot Change Own Role",
        description: "You cannot remove admin access from your own account.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingRole(userId);
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      });

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete Own Account",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }

    setDeletingUser(userId);
    
    try {
      console.log('Starting user deletion for:', userId);
      
      // Delete from user_roles table first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error deleting user role:', roleError);
        throw roleError;
      }
      
      console.log('User role deleted successfully');

      // Also delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.warn('Error deleting profile:', profileError);
        // Continue even if profile deletion fails
      } else {
        console.log('User profile deleted successfully');
      }

      toast({
        title: "User Deleted",
        description: "User has been successfully removed from the system",
      });

      // Optimistically remove from UI
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      console.log('Refreshing user list...');
      // Additionally refetch from server to stay in sync
      await fetchUsers();
      console.log('User list refreshed');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'contributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reader':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'guest':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">
            Manage users, roles, and system settings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.adminCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributors</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.contributorCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Readers</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.readerCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guests</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.guestCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Note:</strong> For security reasons, user emails are not displayed. Users are identified by partial IDs and nicknames. 
                Changing roles will immediately affect their access permissions. You cannot remove admin access from your own account or delete your own account.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Role Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium">
                        {userData.nickname || (
                          <span className="text-muted-foreground italic">No nickname</span>
                        )}
                        {userData.id === user?.id && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(userData.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={userData.role || 'guest'}
                            onValueChange={(value: UserRole) => updateUserRole(userData.id, value)}
                            disabled={updatingRole === userData.id || deletingUser === userData.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guest">Guest</SelectItem>
                              <SelectItem value="reader">Reader</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={userData.id === user?.id || deletingUser === userData.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deletingUser === userData.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this user? This action will:
                                  <ul className="list-disc ml-6 mt-2">
                                    <li>Remove the user from all roles</li>
                                    <li>Delete their profile information</li>
                                    <li>Permanently remove their access to the system</li>
                                  </ul>
                                  <br />
                                  <strong>This action cannot be undone.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(userData.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default AdminPanel;