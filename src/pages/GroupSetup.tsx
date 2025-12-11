import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

const GroupSetup = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Group created! Share the invite code with your friends.");
      navigate("/");
    }, 1000);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("You've joined the group!");
      navigate("/");
    }, 1000);
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
                    <h3 className="font-semibold text-foreground text-lg">Join Existing Group</h3>
                    <p className="text-sm text-muted-foreground">Enter an invite code to join</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
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
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., DSA Warriors"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Member Limit</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your group can have up to 5 members including you.
                </p>
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
      </div>
    </div>
  );
};

export default GroupSetup;
