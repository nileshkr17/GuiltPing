import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDay } from "@/components/CalendarDay";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// State-driven completion data (fetched from API)
const initialCompletedDays: number[] = [];

const History = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDays, setCompletedDays] = useState<number[]>(initialCompletedDays);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [allTimeCheckins, setAllTimeCheckins] = useState<any[]>([]);
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calculate best streak from all check-ins
  const calculateBestStreak = (checkins: any[]) => {
    if (checkins.length === 0) return 0;
    
    const sorted = checkins
      .filter((c: any) => c.completed)
      .map((c: any) => new Date(c.date).getTime())
      .sort((a, b) => a - b);
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const diffDays = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  // Fetch all-time check-ins once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.myCheckins();
        setAllTimeCheckins(res.items || []);
        setBestStreak(calculateBestStreak(res.items || []));
      } catch (e: any) {
        console.error("Failed to fetch all-time check-ins:", e);
      }
    })();
  }, []);

  // Fetch current month check-ins
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const from = new Date(currentYear, currentMonth, 1).toISOString();
        const to = new Date(currentYear, currentMonth + 1, 0).toISOString();
        const res = await api.myCheckins(from, to);
        const days = res.items
          .filter((c: any) => c.completed)
          .map((c: any) => new Date(c.date).getDate());
        setCompletedDays(days);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Failed to load history");
        setCompletedDays([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  const completionRate = Math.round((completedDays.length / daysInMonth) * 100);

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <PageHeader 
          title="History"
          subtitle="Track your progress"
        />

        {/* Loading State */}
        {loading && (
          <div className="glass rounded-xl p-8 text-center mb-6 animate-fade-in">
            <p className="text-muted-foreground">Loading your history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass rounded-xl p-4 text-center mb-6 animate-fade-in border border-red-500/20">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{completedDays.length}</p>
              <p className="text-xs text-muted-foreground">Days Done</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-success">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="glass rounded-2xl p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-foreground">{monthName}</h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getDate() === day && 
                             today.getMonth() === currentMonth && 
                             today.getFullYear() === currentYear;
              const isFuture = new Date(currentYear, currentMonth, day) > today;
              const isCompleted = completedDays.includes(day) && !isFuture;
              
              return (
                <CalendarDay
                  key={day}
                  day={day}
                  isCompleted={isCompleted}
                  isToday={isToday}
                  isFuture={isFuture}
                />
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Insights</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Great consistency this month! You tend to skip weekends - try scheduling 
            lighter problems for Saturdays. Your longest streak was 7 days. 
            Keep pushing! 🚀
          </p>
        </div>
      </div>

      {loading && <p className="px-4 text-sm">Loading…</p>}
      {error && <p className="px-4 text-sm text-red-600">{error}</p>}
      <BottomNav />
    </div>
    </ProtectedRoute>
  );
};

export default History;
