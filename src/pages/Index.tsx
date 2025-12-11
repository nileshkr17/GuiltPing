import { useState } from "react";
import { CheckInButton } from "@/components/CheckInButton";
import { GroupMemberCard } from "@/components/GroupMemberCard";
import { StreakCounter } from "@/components/StreakCounter";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockMembers = [
  { id: "1", name: "You", isCompleted: false, streak: 7, isCurrentUser: true },
  { id: "2", name: "Alex Chen", isCompleted: true, streak: 12, isCurrentUser: false },
  { id: "3", name: "Sarah Kim", isCompleted: true, streak: 5, isCurrentUser: false },
  { id: "4", name: "Mike Johnson", isCompleted: false, streak: 3, isCurrentUser: false },
  { id: "5", name: "Emma Davis", isCompleted: true, streak: 8, isCurrentUser: false },
];

const Index = () => {
  const [members, setMembers] = useState(mockMembers);
  const [personalStreak, setPersonalStreak] = useState(7);
  
  const currentUser = members.find(m => m.isCurrentUser);
  const completedCount = members.filter(m => m.isCompleted).length;

  const handleCheckIn = () => {
    setMembers(prev => 
      prev.map(m => 
        m.isCurrentUser ? { ...m, isCompleted: true, streak: m.streak + 1 } : m
      )
    );
    setPersonalStreak(prev => prev + 1);
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
          title="GuiltPing"
          subtitle={today}
          action={
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          }
        />

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in">
          <StreakCounter streak={personalStreak} label="Your Streak" type="personal" />
          <StreakCounter streak={5} label="Group Streak" type="group" />
        </div>

        {/* Check-in Button */}
        <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CheckInButton 
            isCheckedIn={currentUser?.isCompleted || false}
            onCheckIn={handleCheckIn}
          />
        </div>

        {/* Group Status */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatusBadge completed={completedCount} total={members.length} />
        </div>

        {/* Group Members */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Group Members</h2>
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
              />
            </div>
          ))}
        </div>

        {/* Daily Report Preview */}
        <div className="mt-8 p-4 rounded-2xl glass animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-muted-foreground mb-2">📱 Daily report at 8 PM</p>
          <p className="text-foreground">
            "Great progress today! 3 out of 5 have completed their DSA practice. 
            Keep it up team! 🔥"
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
