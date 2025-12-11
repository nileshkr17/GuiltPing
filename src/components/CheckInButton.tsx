import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  disabled?: boolean;
}

export const CheckInButton = ({ isCheckedIn, onCheckIn, disabled }: CheckInButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isCheckedIn || disabled) return;
    setIsAnimating(true);
    onCheckIn();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant={isCheckedIn ? "success" : "checkin"}
      size="xl"
      onClick={handleClick}
      disabled={disabled || isCheckedIn}
      className={cn(
        "w-full max-w-sm h-20 rounded-2xl text-lg font-bold transition-all duration-300",
        isCheckedIn && "shadow-success",
        isAnimating && "animate-check-in",
        !isCheckedIn && "animate-bounce-subtle"
      )}
    >
      {isCheckedIn ? (
        <>
          <Check className="w-6 h-6 mr-2" />
          Completed Today!
        </>
      ) : (
        <>
          <Zap className="w-6 h-6 mr-2" />
          I completed today's DSA!
        </>
      )}
    </Button>
  );
};
