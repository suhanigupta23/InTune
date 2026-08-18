import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCards from "@/components/FeatureCards";
import { 
  ArrowRight, 
  Star,
  Zap,
  Shield,
  Brain,
  Heart,
  Users,
  MessageCircle,
  Mic
} from "lucide-react";

const featureHighlights = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced machine learning algorithms analyze voice patterns, personality traits, and lifestyle preferences for unprecedented accuracy.",
    benefits: ["97% accuracy rate", "Voice pattern analysis", "Behavioral prediction", "Continuous learning"],
    badge: "Core Feature"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Complete anonymity until mutual match confirmation with Aadhaar verification and secure data handling.",
    benefits: ["Anonymous IDs", "Aadhaar verification", "End-to-end encryption", "GDPR compliant"],
    badge: "Security"
  },
  {
    icon: MessageCircle,
    title: "Safe Communication",
    description: "Anonymous chat with AI safety filters, icebreaker prompts, and abuse prevention systems.",
    benefits: ["NLP safety filters", "Icebreaker prompts", "Report system", "Moderated environment"],
    badge: "Safety"
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Automated room allocation, conflict resolution bot, and intelligent suggestion systems.",
    benefits: ["Auto room matching", "GuideBot assistance", "Smart notifications", "Workflow automation"],
    badge: "Innovation"
  }
];

const comparisonFeatures = [
  { feature: "Voice-based matching", intune: true, others: false },
  { feature: "Anonymous chat system", intune: true, others: false },
  { feature: "AI conflict resolution", intune: true, others: false },
  { feature: "Style preference matching", intune: true, others: false },
  { feature: "Multi-language support", intune: true, others: true },
  { feature: "Basic matching", intune: true, others: true },
  { feature: "Location-based suggestions", intune: true, others: true },
  { feature: "Mobile responsive", intune: true, others: true },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Revolutionary Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Features That Make InTune Different
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover the innovative features that set InTune apart from traditional roommate matching platforms. 
            From AI-powered voice analysis to anonymous communication systems.
          </p>
          <Link to="/how-it-works">
            <Button variant="hero" size="lg">
              See How It Works <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Core Feature Highlights
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Each feature is designed with student needs in mind, ensuring the best possible roommate matching experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featureHighlights.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-card-gradient border-border/50 hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <Badge variant="outline">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <FeatureCards />

      {/* Comparison Table */}
      <section className="py-16 bg-accent-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              InTune vs Others
            </h2>
            <p className="text-xl text-muted-foreground">
              See how InTune's innovative features compare to traditional roommate matching platforms.
            </p>
          </div>

          <Card className="bg-card-gradient border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-primary">Feature</th>
                      <th className="text-center p-4 font-semibold text-primary">InTune</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Others</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((item, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="p-4 text-muted-foreground">{item.feature}</td>
                        <td className="p-4 text-center">
                          {item.intune ? (
                            <div className="w-6 h-6 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                          ) : (
                            <div className="w-6 h-6 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                              ✗
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {item.others ? (
                            <div className="w-6 h-6 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                          ) : (
                            <div className="w-6 h-6 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                              ✗
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                Experience These Features Yourself
              </CardTitle>
              <CardDescription className="text-lg">
                Join the revolution in roommate matching. Try InTune's innovative features today.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  <Mic className="mr-2 w-5 h-5" />
                  Start Voice Matching
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="warm" size="lg">
                  <Users className="mr-2 w-5 h-5" />
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;