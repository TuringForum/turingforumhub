import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, BookOpen, User, Camera, Save, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditProfile = () => {
    setFormData({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (!result?.error) {
      setEditDialogOpen(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const avatarUrl = await uploadAvatar(file);
    
    if (avatarUrl) {
      await updateProfile({ avatar_url: avatarUrl });
    }
    
    setUploading(false);
  };

  const isActive = (path: string) => location.pathname === path;
  
  const displayName = profile?.nickname || user?.email?.split('@')[0] || 'User';
  const avatarFallback = displayName[0]?.toUpperCase() || 'U';

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
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 hover:bg-accent/50 transition-all duration-300">
                      <Avatar className="w-8 h-8 border-2 border-primary/20">
                        <AvatarImage 
                          src={profile?.avatar_url || undefined} 
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleEditProfile}>
                          <User className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="glass border-white/10">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="relative">
                              <Avatar className="w-20 h-20 border-4 border-primary/20">
                                <AvatarImage 
                                  src={profile?.avatar_url || undefined} 
                                  alt={displayName}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                  {avatarFallback}
                                </AvatarFallback>
                              </Avatar>
                              <label
                                htmlFor="avatar-upload-header"
                                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                              >
                                <Camera className="w-3 h-3" />
                                <input
                                  id="avatar-upload-header"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarUpload}
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="nickname">Nickname</Label>
                            <Input
                              id="nickname"
                              value={formData.nickname}
                              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                              placeholder="Enter your nickname"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Tell us about yourself..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSaveProfile} className="flex-1">
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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