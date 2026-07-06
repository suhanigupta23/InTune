import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call
    toast({
      title: "Successfully joined waitlist!",
      description: "We'll notify you when InTune launches. Get ready to find your perfect roommate!",
    });
    setEmail("");
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card-gradient border-border/50 shadow-warm text-center">
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-gradient rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
              Be the First to Find Your Perfect Match
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Join our exclusive waitlist and get early access to InTune when we launch. 
              Plus, receive roommate tips and college living guides straight to your inbox.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background border-border"
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                size="lg"
                className="h-12 px-6"
              >
                Join Waitlist
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              🔒 Your email is safe with us. No spam, just roommate magic.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Newsletter;