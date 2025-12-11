import { Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  label: string;
  type?: "personal" | "group";
}

export const StreakCounter = ({ streak, label, type = "personal" }: StreakCounterProps) => {
  const isActive = streak > 0;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-2xl glass transition-all duration-300",
      isActive && type === "personal" && "animate-streak-glow",
      isActive && "border-primary/20"
    )}>
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-full mb-3 transition-all duration-300",
        isActive ? "bg-primary/10" : "bg-muted"
      )}>
        {type === "personal" ? (
          <Flame className={cn(
            "w-8 h-8 transition-colors duration-300",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
        ) : (
          <TrendingUp className={cn(
            "w-8 h-8 transition-colors duration-300",
            isActive ? "text-secondary" : "text-muted-foreground"
          )} />
        )}
      </div>
      
      <span className={cn(
        "text-4xl font-bold transition-colors duration-300",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {streak}
      </span>
      
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
};
