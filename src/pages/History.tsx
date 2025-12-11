import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDay } from "@/components/CalendarDay";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Mock completion data
const mockCompletedDays = [1, 2, 3, 5, 6, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 28, 29, 30];

const History = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  const completionRate = Math.round((mockCompletedDays.length / daysInMonth) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <PageHeader 
          title="History"
          subtitle="Track your progress"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{mockCompletedDays.length}</p>
            <p className="text-xs text-muted-foreground">Days Done</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">7</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>

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
              const isCompleted = mockCompletedDays.includes(day) && !isFuture;
              
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

      <BottomNav />
    </div>
  );
};

export default History;
