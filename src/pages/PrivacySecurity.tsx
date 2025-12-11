import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

  const handleDownloadData = async () => {
    try {
      // TODO: Implement API call to download user data
      toast.success("Preparing your data for download...");
    } catch (e: any) {
      toast.error(e.message || "Failed to download data");
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your check-in history? This cannot be undone.")) {
      return;
    }

    try {
      // TODO: Implement API call to clear history
      toast.success("History cleared successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to clear history");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <PageHeader title="Privacy & Security" />
        </div>

        {/* Privacy Settings */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {profileVisibility ? (
                    <Eye className="w-5 h-5 text-primary" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    Show profile to group members
                  </p>
                </div>
              </div>
              <Switch 
                checked={profileVisibility} 
                onCheckedChange={setProfileVisibility}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">Show Streak</p>
                <p className="text-sm text-muted-foreground">
                  Display your streak to others
                </p>
              </div>
              <Switch 
                checked={showStreak} 
                onCheckedChange={setShowStreak}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">Group Invites</p>
                <p className="text-sm text-muted-foreground">
                  Allow others to invite you to groups
                </p>
              </div>
              <Switch 
                checked={allowGroupInvites} 
                onCheckedChange={setAllowGroupInvites}
              />
            </div>
          </div>
        </div>

        {/* Data & Analytics */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-foreground mb-4">Data & Analytics</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">Usage Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Help improve GuiltPing with anonymous data
                </p>
              </div>
              <Switch 
                checked={dataCollection} 
                onCheckedChange={setDataCollection}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                onClick={handleDownloadData}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Export all your data in JSON format
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-foreground mb-4">Security</h3>
          
          <div className="space-y-3">
            <button className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors w-full text-left">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage logged-in devices</p>
              </div>
              <span className="text-sm text-primary font-medium">1 device</span>
            </button>

            <button className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors w-full text-left">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security</p>
              </div>
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass rounded-2xl p-6 border border-warning/20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold text-warning mb-4">Data Management</h3>
          
          <div className="space-y-3">
            <Button 
              onClick={handleClearHistory}
              variant="outline"
              className="w-full justify-start text-warning hover:text-warning hover:bg-warning/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Check-in History
            </Button>

            <p className="text-xs text-muted-foreground">
              This will permanently delete all your check-in records but keep your account active
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="glass rounded-2xl divide-y divide-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
            <p className="font-medium text-foreground">Terms of Service</p>
          </button>
          <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
            <p className="font-medium text-foreground">Privacy Policy</p>
          </button>
          <button className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors">
            <p className="font-medium text-foreground">Cookie Policy</p>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PrivacySecurity;
