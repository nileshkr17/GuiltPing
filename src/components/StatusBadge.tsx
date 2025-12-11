import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  completed: number;
  total: number;
}

export const StatusBadge = ({ completed, total }: StatusBadgeProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={cn(
              "transition-all duration-500",
              percentage === 100 ? "text-success" : "text-primary"
            )}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {completed}/{total}
        </span>
      </div>
      
      <div>
        <p className="font-semibold text-foreground">Group Progress</p>
        <p className="text-sm text-muted-foreground">
          {completed === total ? "Everyone's done! 🎉" : `${total - completed} pending`}
        </p>
      </div>
    </div>
  );
};
