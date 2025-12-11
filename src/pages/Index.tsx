import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckInButton } from "@/components/CheckInButton";
import { GroupMemberCard } from "@/components/GroupMemberCard";
import { StreakCounter } from "@/components/StreakCounter";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { permission, requestPermission, isSupported } = usePushNotifications();
  const [members, setMembers] = useState<any[]>([]);
  const [personalStreak, setPersonalStreak] = useState(0);
  const [groupStreak, setGroupStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [hasGroup, setHasGroup] = useState(true);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [backendError, setBackendError] = useState(false);
  
  const currentUser = members.find(m => m.isCurrentUser);
  const completedCount = members.filter(m => m.isCompleted).length;

  useEffect(() => {
    (async () => {
      try {
        // Get today's date at midnight in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const [checkinsRes, groupRes] = await Promise.all([
          api.myCheckins(),
          api.myGroup()
        ]);
        
        // Check if there's a check-in for today
        const checkedInToday = checkinsRes.items.some((c: any) => {
          const checkinDate = new Date(c.date).toISOString().split('T')[0];
          return checkinDate === todayStr && c.completed;
        });
        setHasCheckedInToday(checkedInToday);
        setPersonalStreak(checkinsRes.streak || user?.streak || 0);
        setTotalDays(checkinsRes.totalDays || 0);
        
        if (groupRes.group) {
          setHasGroup(true);
          setGroupName(groupRes.group.name);
          setMembers(groupRes.group.members || []);
          
          // Calculate group streak (min streak of all members)
          const streaks = groupRes.group.members.map((m: any) => m.streak);
          setGroupStreak(streaks.length > 0 ? Math.min(...streaks) : 0);
        } else {
          setHasGroup(false);
          // No group
          setMembers([]);
        }
      } catch (e: any) {
        console.error(e);
        // Check if it's a network error or backend is down
        if (e.message?.includes('fetch') || e.message?.includes('Network') || !navigator.onLine) {
          setBackendError(true);
        } else {
          toast.error("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCheckIn = async () => {
    // Double check to prevent duplicate check-ins
    if (hasCheckedInToday) {
      toast.error("You have already checked in today!");
      return;
    }

    try {
      const result = await api.checkinToday();
      setHasCheckedInToday(true);
      setPersonalStreak(result.streak || personalStreak + 1);
      setMembers(prev => 
        prev.map(m => 
          m.isCurrentUser ? { ...m, isCompleted: true, streak: result.streak || m.streak + 1 } : m
        )
      );
      toast.success("Check-in recorded!");
    } catch (e: any) {
      console.error(e);
      // Parse error message from response
      const errorMsg = e.message || "Failed to check in";
      toast.error(errorMsg);
      
      // If already checked in, update UI state
      if (errorMsg.includes("already checked in")) {
        setHasCheckedInToday(true);
      }
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <PageHeader 
          title={user.name.includes('@') ? user.name.split('@')[0] : user.name}
          subtitle={today}
          action={
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotificationSheet(true)}
            >
              <Bell className="w-5 h-5" />
              {permission !== "granted" && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          }
        />

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in">
          <StreakCounter streak={personalStreak} label="Your Streak" type="personal" />
          <StreakCounter streak={groupStreak} label="Group Streak" type="group" />
        </div>

        {backendError ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center animate-fade-in px-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warning to-warning/70 flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse">
                <svg className="w-10 h-10 text-warning-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Backend Sleeping... 😴
              </h2>
              <p className="text-muted-foreground mb-4">
                We're on a free deployment tier, so the server takes a nap sometimes. Give it 30-60 seconds to wake up!
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                If this happens often, consider supporting the developer to upgrade to a better tier 💪
              </p>
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full h-12 rounded-xl"
                  onClick={() => window.location.reload()}
                >
                  Retry Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  onClick={() => navigate("/support")}
                >
                  Support Developer
                </Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !hasGroup ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                You're Not in a Group Yet
              </h2>
              <p className="text-muted-foreground mb-8">
                Join an accountability group to stay motivated with friends and track progress together!
              </p>
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full h-12 rounded-xl"
                  onClick={() => navigate("/group-setup")}
                >
                  Join or Create Group
                </Button>
                <p className="text-xs text-muted-foreground">
                  Create your own group or join an existing one with an invite code
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Check-in Button */}
            <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CheckInButton 
                isCheckedIn={hasCheckedInToday}
                onCheckIn={handleCheckIn}
              />
            </div>

            {/* Group Status */}
            <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <StatusBadge completed={completedCount} total={members.length} />
            </div>

            {/* Group Members */}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {groupName || "Group Members"}
                </h2>
                {members.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {members.map((member, index) => (
            <div 
              key={member.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <GroupMemberCard
                name={member.name}
                isCompleted={member.isCompleted}
                streak={member.streak}
                isCurrentUser={member.isCurrentUser}
                avatar={member.avatar}
                onClick={member.isCurrentUser ? () => setShowProfileView(true) : undefined}
              />
            </div>
          ))}
            </div>

            {/* Daily Report Preview */}
            <div className="mt-8 p-4 rounded-2xl glass animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-muted-foreground mb-2">📱 Daily report at 8 PM</p>
              <p className="text-foreground">
                "Great progress today! {completedCount} out of {members.length} have completed their DSA practice. 
                Keep it up team! 🔥"
              </p>
            </div>
          </>
        )}
      </div>

      <BottomNav />

      {/* Notification Settings Sheet */}
      <Sheet open={showNotificationSheet} onOpenChange={setShowNotificationSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notification Settings</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {!isSupported ? (
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground">
                  Push notifications are not supported on this device or browser.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded at 8 PM daily
                      </p>
                    </div>
                    <Switch 
                      checked={permission === "granted"} 
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          const success = await requestPermission();
                          if (!success) {
                            toast.error("Failed to enable notifications");
                          }
                        }
                      }}
                    />
                  </div>

                  {permission === "granted" && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-sm text-success font-medium">✓ Notifications enabled</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive daily reminders to complete your DSA practice
                      </p>
                    </div>
                  )}

                  {permission === "denied" && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">Notifications blocked</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please enable notifications in your browser settings
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">Notification Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Daily Reminder</p>
                          <p className="text-xs text-muted-foreground">8:00 PM</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Every day</span>
                    </div>
                  </div>
                </div>

                {permission === "granted" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        await api.pushTest();
                        toast.success("Test notification sent!");
                      } catch (e: any) {
                        toast.error(e.message || "Failed to send test notification");
                      }
                    }}
                  >
                    Send Test Notification
                  </Button>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Quick View */}
      <Dialog open={showProfileView} onOpenChange={setShowProfileView}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={currentUser?.avatar || undefined} alt="Profile" />
              <AvatarFallback className="text-2xl">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-primary">{personalStreak}</p>
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
    </div>
  );
};

export default Index;
