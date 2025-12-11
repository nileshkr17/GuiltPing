import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot3",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot4",
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  userName?: string;
  userEmail?: string;
  onAvatarSelect: (avatar: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarSelector({ 
  currentAvatar, 
  userName, 
  userEmail,
  onAvatarSelect,
  open,
  onOpenChange 
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onAvatarSelect(selectedAvatar);
    onOpenChange(false);
  };

  const getInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userEmail?.charAt(0).toUpperCase() || '?';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Preview */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-primary">
              {selectedAvatar ? (
                <AvatarImage src={selectedAvatar} alt="Avatar preview" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-sm text-muted-foreground">Select an avatar below</p>
          </div>

          {/* Upload Custom */}
          <div>
            <label htmlFor="avatar-upload" className="block mb-2">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Custom Image
                </span>
              </Button>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">Max size: 2MB</p>
          </div>

          {/* Preset Avatars */}
          <div>
            <p className="text-sm font-medium mb-3">Or choose a preset:</p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative rounded-xl overflow-hidden transition-all hover:scale-105 ${
                    selectedAvatar === avatar 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'ring-1 ring-border'
                  }`}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                  </Avatar>
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Avatar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
