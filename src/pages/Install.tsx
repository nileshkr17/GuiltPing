import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { 
  Download, 
  Bell, 
  Smartphone, 
  CheckCircle, 
  Share, 
  Plus,
  Zap,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const Install = () => {
  const navigate = useNavigate();
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      // Installation successful
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Install GuiltPing</h1>
            <p className="text-muted-foreground">Get the full app experience</p>
          </div>
        </div>

        {/* App Preview */}
        <div className="flex items-center gap-4 p-6 rounded-2xl glass mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">GuiltPing</h2>
            <p className="text-sm text-muted-foreground">DSA Practice Accountability</p>
          </div>
        </div>

        {/* Installation Status */}
        {isInstalled ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30 mb-6 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-foreground">App Installed!</p>
              <p className="text-sm text-muted-foreground">GuiltPing is ready to use</p>
            </div>
          </div>
        ) : canInstall ? (
          <Button
            onClick={handleInstall}
            size="lg"
            className="w-full h-14 rounded-xl mb-6 animate-slide-up"
          >
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : isIOS ? (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">Install on iOS</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">1. Tap Share</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the share button in Safari's toolbar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">2. Add to Home Screen</p>
                  <p className="text-sm text-muted-foreground">
                    Scroll down and tap "Add to Home Screen"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">3. Open from Home</p>
                  <p className="text-sm text-muted-foreground">
                    Launch GuiltPing from your home screen
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <p className="text-muted-foreground text-center">
              Visit this page in a supported browser to install the app
            </p>
          </div>
        )}

        {/* Push Notifications */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              permission === "granted" ? "bg-success/10" : "bg-warning/10"
            )}>
              <Bell className={cn(
                "w-6 h-6",
                permission === "granted" ? "text-success" : "text-warning"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {permission === "granted" 
                  ? "Notifications enabled" 
                  : "Get daily reminders at 8 PM"}
              </p>
            </div>
          </div>

          {permission === "granted" ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Notifications are enabled</span>
            </div>
          ) : permission === "denied" ? (
            <p className="text-sm text-muted-foreground">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          ) : isSupported ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={requestPermission}
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Push notifications are not supported on this device.
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-foreground mb-4">Why install?</h3>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Smartphone className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">Works offline</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">Daily reminder notifications</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Download className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">Quick access from home screen</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Install;
