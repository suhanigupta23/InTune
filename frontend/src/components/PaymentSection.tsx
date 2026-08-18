import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/use-toast";

const handlePaymentRedirect = () => {
  toast({
    title: "Redirecting to Payment App 🔗",
    description: "Opening your payment app for quick access.",
  });

  // ✅ This actually triggers UPI app (PhonePe, GPay, etc.)
  setTimeout(() => {
    window.location.href =
      "upi://pay?pa=8770562841@axl&pn=Suhani&am=50&cu=INR";
  }, 1000);
};


interface PaymentSectionProps {
  balance: number;
  roommateId: string;
}

const PaymentSection = ({ balance, roommateId }: PaymentSectionProps) => {
  const [yourQrCode, setYourQrCode] = useState<string | null>(null);
  const [roommateQrCode, setRoommateQrCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isYour: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isYour) {
          setYourQrCode(result);
        } else {
          setRoommateQrCode(result);
        }
        toast({
          title: "QR Code uploaded successfully!",
          description: `${isYour ? "Your" : "Roommate's"} payment QR code has been saved.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getBalanceStatus = () => {
    if (balance > 0) {
      return {
        text: `${roommateId} owes you ₹${balance.toFixed(2)}`,
        variant: "success" as const,
        action: "Request Payment"
      };
    } else if (balance < 0) {
      return {
        text: `You owe ${roommateId} ₹${Math.abs(balance).toFixed(2)}`,
        variant: "warning" as const,
        action: "Pay Now"
      };
    } else {
      return {
        text: "All settled up! 🎉",
        variant: "success" as const,
        action: null
      };
    }
  };

  const balanceStatus = getBalanceStatus();

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="shadow-xl border-2 border-accent/20">
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <div className="text-3xl font-bold mb-2">
              {balance === 0 ? "₹0.00" : `₹${Math.abs(balance).toFixed(2)}`}
            </div>
            <p className={`text-lg ${
              balance > 0 ? "text-success" : 
              balance < 0 ? "text-warning" : 
              "text-muted-foreground"
            }`}>
              {balanceStatus.text}
            </p>
            {balanceStatus.action && (
              <Button 

                className="mt-4 shadow-lg"
                variant={balance < 0 ? "default" : "outline"}
                onClick={() => {
                  if (balance > 0) {
                    toast({
                      title: "Payment Request Sent! 📨",
                      description: `Request for ₹${balance.toFixed(2)} has been sent to ${roommateId}.`,
                    });
                  } else {
                    toast({
                      title: "Payment Reminder",
                      description: `You need to pay ₹${Math.abs(balance).toFixed(2)} to ${roommateId}.`,
                    });
                  }
                }}
              >
                {balanceStatus.action}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your QR Code */}
        <Card className="shadow-lg border border-accent/30 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Your Payment QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yourQrCode ? (
                <div className="text-center">
                  <img 
                    src={yourQrCode} 
                    alt="Your QR Code" 
                    className="mx-auto w-32 h-32 object-contain border rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-2 mt-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">QR Code uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Upload your payment QR code</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="your-qr" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {yourQrCode ? "Change QR Code" : "Upload QR Code"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="your-qr"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, true)}
                />
                {yourQrCode && (
              <Button
  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
  onClick={handlePaymentRedirect}
>
  Open Payment App
</Button>


                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roommate's QR Code */}
        <Card className="shadow-lg border border-accent/30 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {roommateId}'s Payment QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roommateQrCode ? (
                <div className="text-center">
                  <img 
                    src={roommateQrCode} 
                    alt="Roommate's QR Code" 
                    className="mx-auto w-32 h-32 object-contain border rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-2 mt-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">QR Code uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Upload {roommateId}'s payment QR code</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="roommate-qr" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {roommateQrCode ? "Change QR Code" : "Upload QR Code"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="roommate-qr"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, false)}
                />
                {roommateQrCode && (
                  <>
                    <Button 
                      variant="secondary"
                      className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg"
                      onClick={() => {
                        toast({
                          title: "Opening Payment App...",
                          description: `Redirecting to ${roommateId}'s payment method.`,
                        });
                      }}
                    >
                      Pay {roommateId}
                    </Button>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                      onClick={() => {
                        toast({
                          title: "Redirecting to Payment App 🔗",
                          description: `Opening ${roommateId}'s payment app for direct payment.`,
                        });
                      }}
                    >
                      Quick Pay via App
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSection;