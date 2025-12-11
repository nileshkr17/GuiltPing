import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Coffee, QrCode, ExternalLink, Copy, ArrowLeft, Github } from "lucide-react";
import { toast } from "sonner";

const Support = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(50);
  const [showQR, setShowQR] = useState(false);
  const UPI_ID = "7764026505@ybl";
  const NAME = "Nilesh Kumar";

  const quickAmounts = [
    { value: 50, label: "₹50", icon: "☕" },
    { value: 100, label: "₹100", icon: "🍔" },
    { value: 200, label: "₹200", icon: "🍱" },
    { value: 500, label: "₹500", icon: "🎮" },
    { value: 1000, label: "₹1000", icon: "🎁" },
    { value: 2000, label: "₹2000", icon: "🎉" },
  ];

  const handleAmountChange = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      setAmount(0);
    } else if (num > 2000) {
      setAmount(2000);
      toast.error("Maximum amount is ₹2000");
    } else if (num < 0) {
      setAmount(0);
    } else {
      setAmount(num);
    }
  };

  const generateUPILink = () => {
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("GuiltPing Support")}`;
  };

  const generateQRCode = () => {
    const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("GuiltPing Support")}`;
    // Using QR Server API - a reliable free QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
  };

  const handleGPay = () => {
    if (amount < 10) {
      toast.error("Minimum amount is ₹10");
      return;
    }
    const gPayLink = `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("GuiltPing Support")}`;
    window.location.href = gPayLink;
    
    // Fallback to web UPI
    setTimeout(() => {
      window.open(generateUPILink(), '_blank');
    }, 1000);
  };

  const handlePhonePe = () => {
    if (amount < 10) {
      toast.error("Minimum amount is ₹10");
      return;
    }
    const phonepeLink = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("GuiltPing Support")}`;
    window.location.href = phonepeLink;
    
    setTimeout(() => {
      window.open(generateUPILink(), '_blank');
    }, 1000);
  };

  const handlePaytm = () => {
    if (amount < 10) {
      toast.error("Minimum amount is ₹10");
      return;
    }
    const paytmLink = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("GuiltPing Support")}`;
    window.location.href = paytmLink;
    
    setTimeout(() => {
      window.open(generateUPILink(), '_blank');
    }, 1000);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied!");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Support</h1>
        </div>

        {/* Hero Section */}
        <div className="glass rounded-2xl p-6 mb-6 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Support the Developer
          </h2>
          <p className="text-sm text-muted-foreground">
            Love GuiltPing? Buy me a coffee! ☕
          </p>
        </div>

        {/* Amount Selection */}
        <Card className="glass p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            Choose Amount
          </h3>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map((item) => (
              <Button
                key={item.value}
                variant={amount === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAmount(item.value)}
                className="h-16 flex flex-col gap-1 font-semibold"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <span className="text-2xl font-bold text-primary">₹</span>
            <Input
              type="number"
              min="50"
              max="2000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-xl font-bold h-12"
              placeholder="Custom amount"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Min: ₹50 | Max: ₹2000
          </p>
        </Card>

        {/* Payment Methods */}
        <Card className="glass p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-lg mb-4">Pay via UPI</h3>
          
          <div className="grid grid-cols-4 gap-3">
            <Button 
              onClick={handleGPay}
              disabled={amount < 50}
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              title="Pay with Google Pay"
            >
              <span className="text-3xl">G</span>
              <span className="text-xs">GPay</span>
            </Button>

            <Button 
              onClick={handlePhonePe}
              disabled={amount < 50}
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              title="Pay with PhonePe"
            >
              <span className="text-3xl">⚡</span>
              <span className="text-xs">PhonePe</span>
            </Button>

            <Button 
              onClick={handlePaytm}
              disabled={amount < 50}
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              title="Pay with Paytm"
            >
              <span className="text-3xl">P</span>
              <span className="text-xs">Paytm</span>
            </Button>

            <Button
              onClick={() => setShowQR(!showQR)}
              disabled={amount < 50}
              variant="outline"
              className="h-20 flex flex-col gap-2"
              title="Show QR Code"
            >
              <QrCode className="w-8 h-8" />
              <span className="text-xs">QR Code</span>
            </Button>
          </div>

          {showQR && amount >= 50 && (
            <div className="mt-6 text-center animate-fade-in">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                <img 
                  src={generateQRCode()} 
                  alt="UPI QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Scan with any UPI app
              </p>
            </div>
          )}

          {/* <div className="mt-4 p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-semibold">{UPI_ID}</p>
              <Button variant="ghost" size="sm" onClick={handleCopyUPI}>
                Copy
              </Button>
            </div>
          </div> */}
        </Card>

        {/* About Developer */}
        <Card className="glass p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-lg mb-4">About the Developer</h3>
          
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">👨‍💻</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">

                  Nilesh
                    
                </p>
                {/* github with git icon*/}
                <p className="text-xs text-muted-foreground">
                  <a href="https://github.com/nileshkr17" target="_blank" rel="noopener noreferrer">
                    <Github className="inline-block w-4 h-4 mr-1" />
                    /nileshkr17
                  </a>
                </p>

                <p className="text-xs text-muted-foreground">
                  Software Engineer 
                </p>
              </div>
            </div>
            
            <p>
              Hey there! Life for me is one big Ctrl + Alt + Explore. From Jamshedpur, now surviving Bangalore's rent on strong coffee ☕
            </p>

            <p>
              <span className="font-semibold text-foreground">My motto?</span> Hard work over shortcuts, consistency over glamour, curiosity over comfort. The world runs on memes, caffeine, and "just one more episode."
            </p>

            <p className="text-foreground font-medium text-center pt-2">
              Thanks for stopping by! ✨
            </p>
          </div>
        </Card>

      </div>
      <BottomNav />
    </div>
  );
};

export default Support;
