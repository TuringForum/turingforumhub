import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Save, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
  });
  const [uploading, setUploading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (!result?.error) {
      setEditing(false);
    }
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

  const displayName = profile?.nickname || user.email?.split('@')[0] || 'Anonymous';
  const avatarFallback = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-subtle pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card/80 border-border/50 backdrop-blur-sm shadow-elegant">
          <CardHeader className="text-center pb-6">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage 
                  src={profile?.avatar_url || undefined} 
                  alt={displayName}
                />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl text-gradient-primary">
              {displayName}
            </CardTitle>
            {user.email && (
              <p className="text-muted-foreground">{user.email}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {editing ? (
              <div className="space-y-4">
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
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.bio && (
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <p className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
                      {profile.bio}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Member since</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <Button onClick={handleEdit} className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;