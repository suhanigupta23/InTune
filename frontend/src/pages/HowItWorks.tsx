import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OnboardingImage from "@/assets/onboarding.jpg";
import VoiceImage from "@/assets/voicematchsurvey.jpg";
import SmartMatchImage from "@/assets/aimatch.jpg";
import MatchMeterImage from "@/assets/matchmeter.jpg";
import ChatterBoxImage from "@/assets/chatterbox.jpg";
import MatchConfirmImage from "@/assets/finalmatchconfirm.jpg";
import IDRevealImage from "@/assets/idreveal.jpg";
import StyleMatchImage from "@/assets/roomdecor.jpg";
import GalleryImage from "@/assets/roomgallery.jpg";
import GuideBotImage from "@/assets/guidebot.jpg";
import SplitMateImage from "@/assets/splitmate.jpg";
import AdminDashboardImage from "@/assets/dashboard.jpg";
import { motion } from "framer-motion";

import {
  ArrowRight,
  UserPlus,
  Mic,
  Users,
  MessageCircle,
  Heart,
  Shield,
  CheckCircle,
  Palette,
  MapPin
} from "lucide-react";

const detailedSteps = [
  {
    id: 1,
    icon: UserPlus,
    title: "Onboarding",
    subtitle: "Get your unique ID without revealing personal information",
    description:
      "Create your account with just an email. You'll receive a unique anonymous ID that protects your identity throughout the matching process, along with Aadhaar verification for security.",
    features: [
      "Email verification with OTP",
      "Aadhaar upload for security",
      "Anonymous ID generation",
      "Privacy protection"
    ],
    color: "bg-purple-100 text-purple-600",
    image: OnboardingImage

  },
  {
    id: 2,
    icon: Mic,
    title: "Voice Onboarding",
    subtitle: "Answer emotional questions in multiple languages",
    description:
      "Our AI conducts a personalized interview in your preferred language, asking about your emotional responses, stress management, and living preferences.",
    features: [
      "Multi-language support",
      "Voice-to-text conversion",
      "Personality analysis",
      "Lifestyle preference mapping"
    ],
    color: "bg-blue-100 text-blue-600",
    image: VoiceImage
  },
  {
    id: 3,
    icon: Users,
    title: "SmartMatch Engine",
    subtitle: "Find your perfect roommate with AI compatibility scoring",
    description:
      "Your preferences are transformed into vector data, then matched using AI models to find your best-fit roommate based on shared traits and behavior styles.",
    features: [
      "AI-based matching logic",
      "Cosine similarity scoring",
      "Real-time recommendation",
      "Compatibility category breakdown"
    ],
    color: "bg-green-100 text-green-600",
    image: SmartMatchImage
  },
  {
    id: 4,
    icon: Shield,
    title: "MatchMeter",
    subtitle: "Visualize how well you and your match align",
    description:
      "Displays your compatibility score with color-coded meters and criteria-based percentages, helping you understand the 'why' behind your match.",
    features: [
      "Category-wise score view",
      "Dynamic progress bar",
      "Transparency in logic",
      "Animated UI experience"
    ],
    color: "bg-red-100 text-red-600",
    image: MatchMeterImage
  },
  {
    id: 5,
    icon: MessageCircle,
    title: "ChatterBox (Anonymous Chat)",
    subtitle: "Talk it out anonymously before you commit",
    description:
      "Users can initiate anonymous chats with matches to learn about each other and decide without revealing real identities or contact details.",
    features: [
      "Real-time messaging",
      "Anonymous ID protection",
      "Privacy-safe environment",
      "Block/report system"
    ],
    color: "bg-yellow-100 text-yellow-600",
    image: ChatterBoxImage
  },
  {
    id: 6,
    icon: Heart,
    title: "Match Confirmation",
    subtitle: "Mutual consent unlocks your match",
    description:
      "After chatting, both users must agree to confirm the match. This consent-first flow keeps control in your hands while unlocking next steps.",
    features: [
      "Two-way confirmation",
      "No auto-matching without consent",
      "Feedback logging",
      "Unlocks next features"
    ],
    color: "bg-pink-100 text-pink-600",
    image: MatchConfirmImage
  },
  {
    id: 7,
    icon: UserPlus,
    title: "ID Reveal",
    subtitle: "Reveal real identities after mutual trust",
    description:
      "Once a match is confirmed, both parties can voluntarily view each other's real profiles and contact info for seamless communication.",
    features: [
      "Voluntary profile unmasking",
      "Controlled transparency",
      "Post-confirmation only",
      "Protects against impersonation"
    ],
    color: "bg-indigo-100 text-indigo-600",
    image: IDRevealImage
  },
  {
    id: 8,
    icon: Palette,
    title: "StyleMatch",
    subtitle: "Get AI-suggested ideas to design your dream room",
    description:
      "StyleMatch recommends decor styles and layout suggestions using your combined vibes and lifestyle preferences.",
    features: [
      "GPT-powered decor ideas",
      "Visual cards & grids",
      "Personality-based aesthetics",
      "Post-match engagement"
    ],
    color: "bg-orange-100 text-orange-600",
    image: StyleMatchImage
  },
  {
    id: 9,
    icon: Users,
    title: "Roommate Gallery",
    subtitle: "Celebrate successful roommate stories with the community",
    description:
      "Users can upload happy photos and testimonials after settling in, building trust and motivation for future users.",
    features: [
      "Photo & caption upload",
      "Public testimonial wall",
      "Moderation by admin",
      "Feel-good community feature"
    ],
    color: "bg-lime-100 text-lime-600",
    image: GalleryImage
  },
  {
    id: 10,
    icon: Shield,
    title: "GuideBot (Conflict Resolution)",
    subtitle: "AI-guided support to handle roommate issues",
    description:
      "When problems arise, users can talk to GuideBot for advice, or escalate serious concerns to admin—without friction.",
    features: [
      "GPT-based chatbot",
      "Issue classification",
      "Suggested solutions",
      "Escalation support"
    ],
    color: "bg-cyan-100 text-cyan-600",
    image: GuideBotImage
  },
  {
    id: 11,
    icon: Mic,
    title: "SplitMate (Expense Tracker)",
    subtitle: "Log and share your living expenses with clarity",
    description:
      "Easily track who paid for what, who owes what, and keep your room budget clear and balanced between roommates.",
    features: [
      "Shared expense logging",
      "Individual balance tracking",
      "Export to spreadsheet",
      "Debt-free living"
    ],
    color: "bg-blue-100 text-blue-600",
    image: SplitMateImage
  },
  {
    id: 12,
    icon: MapPin,
    title: "Admin Dashboard",
    subtitle: "Behind-the-scenes control for smooth experience",
    description:
      "Admins can manage users, matches, reports, and gallery submissions while tracking flagged chats and conflict logs.",
    features: [
      "Full user & match view",
      "Block/report handling",
      "Content moderation tools",
      "Match override capability"
    ],
    color: "bg-teal-100 text-teal-600",
    image: AdminDashboardImage
  }


];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            How InTune Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Your complete journey from anonymous signup to finding the perfect roommate match.
          </p>
          <Link to="/signup">
            <Button variant="hero" size="lg">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="absolute left-1/2 top-0 h-full w-1 bg-border hidden lg:block animate-pulse" />
          <div className="space-y-24 relative z-10">
            {detailedSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  className={`relative flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10`}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="lg:w-1/2 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">
                      Step {String(step.id).padStart(2, '0')} — {step.subtitle}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      {step.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-1/2">
                    <Card className="bg-cover bg-center border border-border/30 h-64 flex items-center justify-center shadow-md"
                      style={{ backgroundImage: `url(${step.image})` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-accent-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="bg-card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                Ready to Get Started?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of students who found their perfect roommate through InTune.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg">Create Account</Button>
              </Link>
              <Link to="/features">
                <Button variant="warm" size="lg">Explore Features</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;