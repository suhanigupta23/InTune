import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserPlus, Mic, Users, MessageCircle, Heart } from "lucide-react";

const journeySteps = [
  {
    icon: UserPlus,
    title: "Sign Up & Verify",
    description: "Create account with Aadhaar verification and secure OTP authentication",
    step: "01",
  },
  {
    icon: Mic,
    title: "Voice Onboarding",
    description: "Share your personality through voice in English or regional languages",
    step: "02",
  },
  {
    icon: Users,
    title: "Get Matched",
    description: "AI analyzes your preferences and finds compatible roommates with detailed scores",
    step: "03",
  },
  {
    icon: MessageCircle,
    title: "Anonymous Chat",
    description: "Connect safely with potential matches using anonymous usernames",
    step: "04",
  },
  {
    icon: Heart,
    title: "Reveal & Connect",
    description: "Mutual reveal process with celebration and roommate guidance resources",
    step: "05",
  },
];

const UserJourney = () => {
  return (
    <section id="how-it-works" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* Journey Steps */}
       

        {/* CTA Card */}
        <Card className="mt-2 bg-card-gradient border-border/50 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Ready to Find Your Perfect Roommate?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of students who found their ideal living situation through InTune.
            </CardDescription>
          </CardHeader>
            <CardContent>
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UserJourney;