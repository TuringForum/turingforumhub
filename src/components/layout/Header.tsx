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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, BookOpen, User, Edit2, LogOut, Camera, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const Header = () => {
  const { user, signOut, loading, role } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditProfile = () => {
    setFormData({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (!result?.error) {
      setIsEditingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setFormData({ nickname: '', bio: '' });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
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
                        <NavigationMenuLink 
                          className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer group"
                          onClick={() => navigate('/livechat')}
                        >
                          <div className="text-sm font-medium leading-none group-hover:gradient-text transition-all duration-300">Live Chat</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Video calls, screen sharing, and real-time chat
                          </p>
                        </NavigationMenuLink>
                        {role === 'admin' && (
                          <NavigationMenuLink 
                            className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer group"
                            onClick={() => navigate('/admin')}
                          >
                            <div className="text-sm font-medium leading-none group-hover:gradient-text transition-all duration-300 text-red-400">Admin Panel</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage users, roles, and system settings
                            </p>
                          </NavigationMenuLink>
                        )}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-auto py-2 hover:bg-accent/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload-header"
                          className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
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
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {isEditingProfile ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="nickname-header" className="text-xs">Nickname</Label>
                          <Input
                            id="nickname-header"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            placeholder="Enter nickname"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="bio-header" className="text-xs">Bio</Label>
                          <Textarea
                            id="bio-header"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="min-h-[60px] text-xs"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveProfile} className="h-7 px-3 text-xs flex-1">
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-3 text-xs flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile?.bio && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Bio</Label>
                            <p className="text-xs text-muted-foreground mt-1 p-2 rounded bg-muted/30">
                              {profile.bio}
                            </p>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleEditProfile}
                          className="w-full h-8 text-xs"
                        >
                          <Edit2 className="w-3 h-3 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </div>
                  <DropdownMenuItem onClick={handleSignOut} disabled={loading} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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