import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Users, 
  LogOut, 
  ChevronRight, 
  Copy,
  Settings,
  Shield,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const Profile = () => {
  const navigate = useNavigate();
  const { permission, requestPermission } = usePushNotifications();
  const { isInstalled, canInstall, isIOS } = usePWAInstall();
  
  // Mock data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    streak: 7,
    totalDays: 45,
    joinedDate: "October 2024"
  };
  
  const group = {
    name: "DSA Warriors",
    memberCount: 5,
    inviteCode: "DSA2024"
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast.success("Invite code copied!");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && permission !== "granted") {
      await requestPermission();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <PageHeader title="Profile" />

        {/* User Card */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Joined {user.joinedDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{user.streak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{user.totalDays}</p>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </div>
          </div>
        </div>

        {/* Group Section */}
        <div className="glass rounded-2xl p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.memberCount} members</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Invite Code</p>
              <p className="font-mono font-semibold text-foreground">{group.inviteCode}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopyInviteCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

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
          <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
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
          <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
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
    </div>
  );
};

export default Profile;
