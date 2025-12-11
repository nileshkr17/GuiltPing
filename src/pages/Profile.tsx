import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarSelector } from "@/components/AvatarSelector";
import { 
  Bell, 
  Users, 
  LogOut, 
  ChevronRight, 
  Copy,
  Settings,
  Shield,
  Download,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ShareButtons } from "@/components/ShareButtons";

const Profile = () => {
  const navigate = useNavigate();
  const { permission, requestPermission } = usePushNotifications();
  const { isInstalled, canInstall, isIOS } = usePWAInstall();
  const { user, logout } = useAuth();
  
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notificationTime, setNotificationTime] = useState<number>(20);

  useEffect(() => {
    (async () => {
      try {
        // Try to get from cache first
        const cacheKey = `profile_${user?.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const data = JSON.parse(cached);
          setAvatar(data.avatar);
          setTotalDays(data.totalDays);
          setStreak(data.streak);
          if (data.group) {
            setGroup(data.group);
            setNotificationTime(data.group.notificationTime || 20);
          }
        }

        const [checkinsData, groupData, profileData] = await Promise.all([
          api.myCheckins(),
          api.myGroup(),
          api.getProfile(),
        ]);

        setTotalDays(checkinsData.totalDays || 0);
        setStreak(checkinsData.streak || 0);
        setGroup(groupData.group);
        // Handle both response formats: { user: { avatar } } or { avatar }
        const userAvatar = profileData.user?.avatar || profileData.avatar || null;
        setAvatar(userAvatar);
        if (groupData.group) {
          setNotificationTime(groupData.group.notificationTime || 20);
        }

        // Store in cache
        sessionStorage.setItem(cacheKey, JSON.stringify({
          avatar: userAvatar,
          totalDays: checkinsData.totalDays,
          streak: checkinsData.streak,
          group: groupData.group,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCopyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    
    try {
      await api.leaveGroup();
      toast.success("Left group successfully");
      setGroup(null);
      // Clear cache
      sessionStorage.removeItem(`profile_${user?.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to leave group");
    }
  };

  const handleAvatarSelect = async (newAvatar: string) => {
    try {
      const result = await api.updateProfile({ avatar: newAvatar });
      setAvatar(newAvatar);
      setShowAvatarSelector(false);
      toast.success("Avatar updated!");
      
      // Update user in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const updatedUser = { ...JSON.parse(userData), avatar: newAvatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Clear cache to force refresh with new avatar
      sessionStorage.removeItem(`profile_${user?.id}`);
      
      // Fetch fresh data to ensure avatar is synced
      const profileData = await api.getProfile();
      const userAvatar = profileData.user?.avatar || profileData.avatar || null;
      setAvatar(userAvatar);
    } catch (e: any) {
      toast.error(e.message || "Failed to update avatar");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && permission !== "granted") {
      await requestPermission();
    }
  };

  const handleNotificationTimeChange = async (value: string) => {
    const hour = parseInt(value);
    try {
      await api.updateGroupSettings({ notificationTime: hour });
      setNotificationTime(hour);
      toast.success(`Notification time updated to ${formatTime(hour)}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update notification time");
    }
  };

  const formatTime = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${suffix}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <PageHeader title="Profile" />

        {/* User Card */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileView(true)} 
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                  >
                    <Avatar className="h-16 w-16 ring-2 ring-primary cursor-pointer hover:opacity-80 transition-opacity">
                      {avatar && <AvatarImage src={avatar} alt="Profile" />}
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <button
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Edit className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{user?.name || "User"}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{streak}</p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{totalDays}</p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Group Section */}
        {group ? (
          <div className="glass rounded-2xl p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.memberCount} members</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Invite Code</p>
                <p className="font-mono font-semibold text-foreground">{group.inviteCode}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopyInviteCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Daily Notification</p>
                  <p className="text-sm font-medium text-foreground">Reminder time for all members</p>
                </div>
                <Select value={notificationTime.toString()} onValueChange={handleNotificationTimeChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>{formatTime(notificationTime)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {formatTime(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowShareModal(true)}
              >
                Share Invite
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive hover:text-destructive"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 mb-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">You're not in a group yet</p>
            <Button onClick={() => navigate("/group-setup")}>
              Join or Create Group
            </Button>
          </div>
        )}

        {/* Settings */}
        <div className="glass rounded-2xl divide-y divide-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Install App */}
          {!isInstalled && (canInstall || isIOS) && (
            <button 
              onClick={() => navigate("/install")}
              className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Install App</p>
                  <p className="text-sm text-muted-foreground">Add to home screen</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Notifications */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-sm text-muted-foreground">Daily reminders at 8 PM</p>
              </div>
            </div>
            <Switch 
              checked={permission === "granted"} 
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {/* Account Settings */}
          <button 
            onClick={() => navigate("/account-settings")}
            className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Account Settings</p>
                <p className="text-sm text-muted-foreground">Email, password, preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Privacy */}
          <button 
            onClick={() => navigate("/privacy-security")}
            className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Privacy & Security</p>
                <p className="text-sm text-muted-foreground">Data and privacy controls</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Support Developer */}
          <button 
            onClick={() => navigate("/support")}
            className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors border-t-2 border-primary/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">❤️</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Support Developer</p>
                <p className="text-sm text-muted-foreground">Buy me a coffee ☕</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>

      <BottomNav />

      {/* Share Modal */}
      {group && (
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Friends to {group.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
                <div className="inline-block bg-primary/10 px-6 py-3 rounded-xl">
                  <p className="text-2xl font-bold font-mono text-primary tracking-wider">
                    {group.inviteCode}
                  </p>
                </div>
              </div>
              <ShareButtons inviteCode={group.inviteCode} groupName={group.name} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Profile Quick View */}
      <Dialog open={showProfileView} onOpenChange={setShowProfileView}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              {avatar && <AvatarImage src={avatar} alt="Profile" />}
              <AvatarFallback className="text-2xl">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-primary">{streak}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-success">{totalDays}</p>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Selector */}
      <AvatarSelector
        currentAvatar={avatar || undefined}
        userName={user?.name || ""}
        userEmail={user?.email || ""}
        onAvatarSelect={handleAvatarSelect}
        open={showAvatarSelector}
        onOpenChange={setShowAvatarSelector}
      />
    </div>
  );
};

export default Profile;
