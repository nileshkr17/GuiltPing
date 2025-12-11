import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GroupMemberCardProps {
  name: string;
  isCompleted: boolean;
  streak: number;
  isCurrentUser?: boolean;
}

export const GroupMemberCard = ({ name, isCompleted, streak, isCurrentUser }: GroupMemberCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl glass transition-all duration-300",
      isCompleted && "bg-success/10 border-success/30",
      isCurrentUser && "ring-2 ring-primary/30"
    )}>
      <Avatar className={cn(
        "h-12 w-12 transition-all duration-300",
        isCompleted ? "ring-2 ring-success" : "ring-2 ring-muted"
      )}>
        <AvatarFallback className={cn(
          "font-semibold text-sm",
          isCompleted ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">
          {name}
          {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          {streak > 0 ? `🔥 ${streak} day streak` : 'No streak yet'}
        </p>
      </div>
      
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
        isCompleted ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
      )}>
        {isCompleted ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
      </div>
    </div>
  );
};
