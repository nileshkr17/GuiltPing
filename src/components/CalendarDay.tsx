import { cn } from "@/lib/utils";

interface CalendarDayProps {
  day: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export const CalendarDay = ({ day, isCompleted, isToday, isFuture }: CalendarDayProps) => {
  return (
    <div className={cn(
      "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
      isFuture && "text-muted-foreground/40",
      !isFuture && !isCompleted && "text-muted-foreground",
      isCompleted && "bg-success text-success-foreground",
      isToday && !isCompleted && "ring-2 ring-primary",
      isToday && isCompleted && "ring-2 ring-success-foreground/30"
    )}>
      {day}
    </div>
  );
};
