import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Mic,
  BrainCircuit,
  BarChart3,
  MessageCircle,
  Handshake,
  Eye,
  Palette,
  GalleryVertical,
  Bot,
  Scale,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate hook

const features = [
  {
    icon: UserPlus,
    title: "Onboarding",
    description:
      "Kickstart your journey with seamless sign-up and instant Aadhaar verification. Ensures every user is real, trusted, and ready to vibe in our community.",
    color: "text-orange-600",
    path: "/signup", // ✅ Add route path
  },
  {
    icon: Mic,
    title: "VoiceMatch Survey",
    description:
      "Talk to our AI assistant to share your lifestyle and roommate preferences. Say goodbye to boring forms—your voice guides your perfect match.",
    color: "text-amber-600",
    path: "/voice",
  },
  {
    icon: BrainCircuit,
    title: "SmartMatch Engine & MatchMeter",
    description:
      "Let our intelligent matchmaker analyze compatibility scores. Review your percentage breakdown and see where you align or clash.",
    color: "text-yellow-600",
    path: "/matches",
  },
  {
    icon: MessageCircle,
    title: "ChatterBox",
    description:
      "Break the ice with real-time anonymous chats before making it official. Stay private while you vibe, connect, and decide together.",
    color: "text-amber-500",
    path: "/chat",
  },
  {
    icon: Handshake,
    title: "Match Confirmation",
    description:
      "Loved the conversation? Lock in your match with mutual confirmation. Only when both users agree, the real journey begins.",
    color: "text-yellow-500",
    path: "/matches",
  },
  {
    icon: Palette,
    title: "StyleMatch",
    description:
      "Turn your shared space into a vibe with AI-powered decor ideas. From cozy corners to aesthetic walls, we style your space smartly.",
    color: "text-amber-400",
    path: "/stylematch",
  },
  {
    icon: GalleryVertical,
    title: "Roommate Gallery",
    description:
      "Celebrate roommate wins with photos, testimonials, and shared smiles. A vibrant wall of success stories to inspire the next match.",
    color: "text-yellow-400",
    path: "/roomgallery",
  },
  {
    icon: Bot,
    title: "GuideBot",
    description:
      "Clash? Vent to our AI bot and get peaceful, unbiased advice. If needed, escalate directly to admin support from within the chat.",
    color: "text-orange-300",
    path: "/guidebot",
  },
  {
    icon: Scale,
    title: "SplitMate",
    description:
      "Track every shared expense with ease and zero awkwardness. Keep finances transparent, fair, and drama-free in your space.",
    color: "text-amber-300",
    path: "/split",
  },
];

import { useToast } from "@/components/ui/use-toast";

const FeatureCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardClick = (title: string, path: string) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const hasVibe = !!userObj?.vibeText;

    if (title === "Onboarding") {
      if (token) {
        toast({
          title: "Already Verified! ✓",
          description: "You have already completed verification. Redirecting to Match Meter...",
        });
        setTimeout(() => navigate("/matches"), 800);
      } else {
        navigate("/signup");
      }
    } else if (title === "VoiceMatch Survey") {
      if (token && hasVibe) {
        toast({
          title: "Voice Survey Completed! ✓",
          description: "You already completed your roommate vibe survey. Redirecting to matches...",
        });
        setTimeout(() => navigate("/matches"), 800);
      } else {
        navigate("/voice");
      }
    } else {
      navigate(path);
    }
  };

  return (
    <section id="features" className="py-16 bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Everything You Need for Perfect Roommate Matching
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From voice-powered matching to AI-guided conflict resolution, InTune provides 
            comprehensive tools for finding and living with your ideal roommate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isMockMatched = sessionStorage.getItem("mockRoommateMatched") === "true";
            let displayTitle = feature.title;
            let displayDescription = feature.description;

            if (feature.title === "Match Confirmation") {
              if (isMockMatched) {
                displayTitle = "Roommate Confirmed! 🎉";
                displayDescription = "Congratulations! You have locked in your match with Anjali Gupta (CleanFreak_551). Real identity & verified Aadhaar details are revealed.";
              }
            }

            return (
              <Card
                key={index}
                onClick={() => handleCardClick(feature.title, feature.path)}
                className="bg-card-gradient border-border/50 hover-lift group cursor-pointer transition"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce ${feature.color}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-primary">
                    {displayTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {displayDescription}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
