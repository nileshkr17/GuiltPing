import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ShareButtons } from "@/components/ShareButtons";

const GroupSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"choice" | "create" | "join" | "created" | "discover">("choice");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);
  const [isPublic, setIsPublic] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const [publicGroups, setPublicGroups] = useState<any[]>([]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code);
      setMode("join");
    }
  }, [searchParams]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    
    setIsLoading(true);
    try {
      const group = await api.createGroup(
        groupName.trim(), 
        maxMembers, 
        isPublic, 
        groupDescription.trim()
      );
      setCreatedGroup(group);
      setMode("created");
      toast.success("Group created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublicGroups = async () => {
    setIsLoading(true);
    try {
      const res = await api.discoverGroups();
      setPublicGroups(res.groups || []);
    } catch (err: any) {
      toast.error("Failed to load public groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "discover") {
      loadPublicGroups();
    }
  }, [mode]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setIsLoading(true);
    try {
      await api.joinGroup(inviteCode.trim().toUpperCase());
      toast.success("You've joined the group!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to join group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-12 pb-8 px-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">GuiltPing</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-12">
        {mode === "choice" && (
          <div className="max-w-sm mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground text-center mb-2">
              Set Up Your Group
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Create a new group or join an existing one with up to 5 members
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="w-full glass rounded-2xl p-6 text-left hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Create New Group</h3>
                    <p className="text-sm text-muted-foreground">Start a new accountability group</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="w-full glass rounded-2xl p-6 text-left hover:border-secondary/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Users className="w-7 h-7 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Join with Code</h3>
                    <p className="text-sm text-muted-foreground">Enter an invite code to join</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setMode("discover")}
                className="w-full glass rounded-2xl p-6 text-left hover:border-accent/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Discover Groups</h3>
                    <p className="text-sm text-muted-foreground">Browse public groups to join</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="max-w-sm mx-auto animate-slide-up">
            <button
              onClick={() => setMode("choice")}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Group</h1>
            <p className="text-muted-foreground mb-8">
              Give your group a name that motivates everyone!
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., DSA Warriors"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Input
                  id="groupDescription"
                  placeholder="What's your group about?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="h-12 rounded-xl border-2"
                  maxLength={200}
                />
              </div>

              <div className="space-y-3">
                <Label>Member Limit</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-primary">{maxMembers}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose between 2 and 50 members
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {isPublic ? "Public Group" : "Private Group"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublic 
                        ? "Anyone can discover and join this group"
                        : "Only people with invite code can join"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl"
                disabled={isLoading || !groupName.trim()}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </div>
        )}

        {mode === "join" && (
          <div className="max-w-sm mx-auto animate-slide-up">
            <button
              onClick={() => setMode("choice")}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">Join a Group</h1>
            <p className="text-muted-foreground mb-8">
              Enter the invite code shared by your group admin
            </p>

            <form onSubmit={handleJoinGroup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl border-2 font-mono text-center text-lg tracking-wider"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="w-full h-12 rounded-xl"
                disabled={isLoading || !inviteCode.trim()}
              >
                {isLoading ? "Joining..." : "Join Group"}
              </Button>
            </form>
          </div>
        )}

        {mode === "discover" && (
          <div className="max-w-sm mx-auto animate-slide-up">
            <button
              onClick={() => setMode("choice")}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">Discover Groups</h1>
            <p className="text-muted-foreground mb-6">
              Browse and join public accountability groups
            </p>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading groups...</p>
              </div>
            ) : publicGroups.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No public groups available</p>
                <Button onClick={() => setMode("create")} variant="outline">
                  Create One Instead
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {publicGroups.map((group) => (
                  <div key={group.id} className="glass rounded-xl p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{group.memberCount} / {group.maxMembers} members</span>
                      {group.createdBy && <span>By {group.createdBy.name}</span>}
                    </div>

                    {/* Show members who have joined */}
                    {group.members && group.members.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Members:</p>
                        <div className="flex flex-wrap gap-2">
                          {group.members.slice(0, 5).map((member: any) => (
                            <div key={member.id} className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {(member.name || member.email).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-foreground">{member.name || member.email.split('@')[0]}</span>
                              {member.streak > 0 && (
                                <span className="text-xs text-warning font-semibold">🔥{member.streak}</span>
                              )}
                            </div>
                          ))}
                          {group.members.length > 5 && (
                            <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
                              <span className="text-xs text-muted-foreground">+{group.members.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await api.joinGroup(group.inviteCode);
                          toast.success(`Joined ${group.name}!`);
                          navigate("/");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to join group");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Join Group
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === "created" && createdGroup && (
          <div className="max-w-sm mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Group Created! 🎉
              </h1>
              <p className="text-muted-foreground">
                Share the invite code with your friends
              </p>
            </div>

            <div className="glass rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Your Invite Code</p>
                <div className="inline-block bg-primary/10 px-6 py-3 rounded-xl">
                  <p className="text-3xl font-bold font-mono text-primary tracking-wider">
                    {createdGroup.inviteCode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Group Name</span>
                <span className="font-semibold text-foreground">{createdGroup.name}</span>
              </div>
              {createdGroup.description && (
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <span className="text-sm text-foreground text-right">{createdGroup.description}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="font-semibold text-foreground">{createdGroup.memberCount} / {createdGroup.maxMembers}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="font-semibold text-foreground">{createdGroup.isPublic ? "Public" : "Private"}</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 mb-6">
              <ShareButtons inviteCode={createdGroup.inviteCode} groupName={createdGroup.name} />
            </div>

            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="w-full h-12 rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSetup;
