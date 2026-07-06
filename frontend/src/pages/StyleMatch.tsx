import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Sparkles, Send, Vote, Check, Eye, Heart } from "lucide-react";

interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  votes: number;
  roommateVoted: boolean;
  userVoted: boolean;
  colors: string[];
  imageUrl: string;
}

const StyleMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [decorSuggestions, setDecorSuggestions] = useState<string[]>([
    "💡 Add warm pendant lights above the study desks.",
    "🌿 Insert a tall fiddle-leaf fig plant in the corner.",
    "🖼️ Place a matching set of 3 abstract sand-colored canvas frames."
  ]);

  const [templates, setTemplates] = useState<StyleTemplate[]>([
    {
      id: "1",
      name: "Cozy Scandinavian",
      description: "Clean lines, warm wood accents, and cozy neutral textures. Promotes a peaceful, distraction-free environment.",
      votes: 2,
      roommateVoted: true,
      userVoted: false,
      colors: ["#F5F2EB", "#D4C5B9", "#8C7A6B"],
      imageUrl: "bg-gradient-to-tr from-[#E8DCC4] to-[#C9B99E]"
    },
    {
      id: "2",
      name: "Minimalist Boho",
      description: "Macrame hangings, warm earthy tones, rattan furniture, and tons of indoor green plants for a creative, breezy vibe.",
      votes: 1,
      roommateVoted: false,
      userVoted: true,
      colors: ["#EADAC2", "#DFBA9D", "#AF7E63"],
      imageUrl: "bg-gradient-to-tr from-[#DFBA9D] to-[#AF7E63]"
    },
    {
      id: "3",
      name: "Modern Industrial",
      description: "Sleek matte-black steel bars, exposed brick aesthetics, minimal grey fabric lounge chairs, and bright focus lights.",
      votes: 0,
      roommateVoted: false,
      userVoted: false,
      colors: ["#E5E5E5", "#A3A3A3", "#404040"],
      imageUrl: "bg-gradient-to-tr from-[#CCCCCC] to-[#555555]"
    }
  ]);

  const handleVote = (id: string) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === id) {
          const newUserVoted = !t.userVoted;
          return {
            ...t,
            userVoted: newUserVoted,
            votes: newUserVoted ? t.votes + 1 : t.votes - 1
          };
        }
        return t;
      })
    );
    toast({
      title: "Vote recorded!",
      description: "Shared roommate preferences updated successfully."
    });
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newPrompt = inputText;
    setInputText("");

    toast({
      title: "Analyzing space preferences...",
      description: "StyleMatch AI is calculating placement..."
    });

    setTimeout(() => {
      setDecorSuggestions(prev => [`✨ Placement suggestion: "${newPrompt}"`, ...prev]);
      toast({
        title: "Layout suggestion generated! 🛋️",
        description: "Added to roommate collaboration list below."
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 flex flex-col">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-4 self-start text-warm-brown hover:bg-light-cream font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-warm-brown flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-warm-brown" />
            StyleMatch Room Designer
          </h1>
          <p className="text-muted-text text-sm mt-1">
            Co-design your dream bedroom layout and decor themes with your matched roommate in real-time.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Roommate Collaborative Voting Area */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-warm-brown flex items-center gap-2">
              <Vote className="w-5 h-5" />
              Room Theme Collaboration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="border border-soft-sand bg-white shadow-md overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Visual mockup of the room */}
                    <div className={`h-40 ${template.imageUrl} flex items-center justify-center p-4 relative`}>
                      <span className="bg-white/90 backdrop-blur-sm text-warm-brown px-3 py-1 rounded-full text-xxs font-extrabold shadow-sm flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Preview Layout
                      </span>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-warm-brown text-base">{template.name}</h3>
                        <span className="text-xs font-bold bg-light-cream px-2 py-0.5 rounded border border-soft-sand text-warm-brown">
                          {template.votes} votes
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-text leading-relaxed">
                        {template.description}
                      </p>

                      {/* Color Palette pills */}
                      <div className="flex gap-1.5 pt-2">
                        {template.colors.map((c, i) => (
                          <div 
                            key={i} 
                            className="w-5 h-5 rounded-full border border-soft-sand shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 border-t border-soft-sand flex flex-col gap-2 bg-light-cream/35">
                    {/* Roommate Status */}
                    {template.roommateVoted && (
                      <div className="text-xxs text-warm-brown font-semibold flex items-center gap-1 bg-amber-50 border border-soft-sand px-2.5 py-1 rounded">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Anjali Gupta voted for this!
                      </div>
                    )}

                    <Button 
                      onClick={() => handleVote(template.id)}
                      className={`w-full py-2.5 rounded-lg text-xs font-extrabold transition-smooth ${
                        template.userVoted 
                          ? "bg-green-700 text-white hover:bg-green-800"
                          : "bg-warm-brown hover:bg-warm-brown-dark text-white"
                      }`}
                    >
                      {template.userVoted ? "✓ Voted" : "Vote for Theme"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel - AI Layout Assistant */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-warm-brown flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              StyleMatch AI Assistant
            </h2>

            <Card className="border border-soft-sand bg-white shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-warm-brown uppercase tracking-wider">
                  Layout Generator
                </CardTitle>
                <CardDescription className="text-xxs">
                  Input furniture items or paint colors to see AI placement:
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <form onSubmit={handleSendPrompt} className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Add a light beige rug"
                    className="border-soft-sand text-xs placeholder:text-muted-text"
                  />
                  <Button type="submit" className="bg-warm-brown hover:bg-warm-brown-dark text-white font-extrabold text-xs">
                    <Send className="w-3 h-3" />
                  </Button>
                </form>

                <div className="border-t border-soft-sand pt-3 space-y-2">
                  <span className="text-xxs font-extrabold text-warm-brown uppercase tracking-wide">
                    🤖 Shared Room Planner Notes:
                  </span>
                  <div className="space-y-2">
                    {decorSuggestions.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-light-cream border border-soft-sand/75 rounded-lg p-2.5 text-xxs font-medium text-warm-brown flex justify-between items-start"
                      >
                        <span>{item}</span>
                        <Heart className="w-3 h-3 text-red-400 mt-0.5 cursor-pointer hover:fill-red-400 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StyleMatch;
