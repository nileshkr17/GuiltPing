import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const InstallBanner = () => {
  const { canInstall, isInstalled, isIOS } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('installBannerDismissed') === 'true';
  });
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  // Don't show if already installed, dismissed, or can't install (except iOS)
  if (isInstalled || isDismissed || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
      <div className="max-w-lg mx-auto glass rounded-2xl p-4 shadow-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Install GuiltPing</p>
            <p className="text-xs text-muted-foreground truncate">
              Add to home screen for the best experience
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/install")}
            className="flex-shrink-0"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
