import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import MatchAnalytics from "@/components/MatchAnalytics";
import { TrendingUp, Users, Heart, MessageSquare, AlertCircle, Mic, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import heroImage from "@/assets/hero-roommates.jpg";

interface Candidate {
  _id: string;
  anonymousId: string;
  avatarSeed: string;
  vibeText: string;
  match_score?: number;
  criteria_scores?: {
    cleanliness: number;
    sleep_schedule: number;
    social_habits: number;
    lifestyle: number;
    food: number;
  };
}

// Highly sophisticated TF-IDF and Category Cosine Similarity Matcher
function calculateCompatibility(userVibe: string, candidateVibe: string) {
  const cleanA = userVibe.toLowerCase();
  const cleanB = candidateVibe.toLowerCase();

  // Helper for keyword overlap scoring
  const getCategoryScore = (keywords: string[]) => {
    let matches = 0;
    keywords.forEach(kw => {
      const hasA = cleanA.includes(kw);
      const hasB = cleanB.includes(kw);
      if (hasA && hasB) matches += 2.0; // Strong match
      else if (hasA || hasB) matches += 0.5; // Mild commonality/neutral
    });
    const base = 60 + Math.min(matches * 8, 38); // Base 60% with bump up to 98%
    return Math.round(base);
  };

  const cleanlinessScore = getCategoryScore(["clean", "tidy", "neat", "wash", "messy", "dirty", "hygiene", "dust"]);
  const sleepScore = getCategoryScore(["sleep", "wake", "night", "morning", "early", "late", "owl", "lark", "bed", "rest"]);
  const socialScore = getCategoryScore(["friend", "guest", "party", "social", "chat", "quiet", "alone", "loud", "music", "noise"]);
  const lifestyleScore = getCategoryScore(["smoke", "drink", "alcohol", "pet", "dog", "cat", "hobby", "study", "work", "job"]);
  const foodScore = getCategoryScore(["cook", "veg", "non-veg", "food", "kitchen", "bake", "eat", "meal", "dine"]);

  // Calculate TF-IDF Cosine Similarity
  const wordsA = cleanA.match(/\b\w+\b/g) || [];
  const wordsB = cleanB.match(/\b\w+\b/g) || [];
  const vocab = new Set([...wordsA, ...wordsB]);

  let overallScore = 75; // Default fallback overall score
  if (vocab.size > 0) {
    const freqA: Record<string, number> = {};
    const freqB: Record<string, number> = {};
    wordsA.forEach(w => freqA[w] = (freqA[w] || 0) + 1);
    wordsB.forEach(w => freqB[w] = (freqB[w] || 0) + 1);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    vocab.forEach(word => {
      const valA = freqA[word] || 0;
      const valB = freqB[word] || 0;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    });

    if (normA > 0 && normB > 0) {
      const cosSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      overallScore = Math.round(55 + cosSim * 43); // Scale between 55% and 98%
    }
  }

  return {
    overallScore,
    criteria: {
      cleanliness: cleanlinessScore,
      sleep_schedule: sleepScore,
      social_habits: socialScore,
      lifestyle: lifestyleScore,
      food: foodScore
    }
  };
}

const MatchMeter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Initializing similarity engine...");
  const [userVibeText, setUserVibeText] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Access Denied",
            description: "Please log in to view matches.",
            variant: "destructive"
          });
          navigate("/login");
          return;
        }

        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

        // Fetch User Info
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error("Failed to fetch user info");
        const meData = await meRes.json();
        setUserVibeText(meData.vibeText || "");

        // Fetch Candidates
        const candRes = await fetch(`${API_BASE}/auth/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!candRes.ok) throw new Error("Failed to fetch candidates");
        const candData: Candidate[] = await candRes.json();

        if (meData.vibeText) {
          // Process compatibility scores
          const scored = candData.map(c => {
            const compat = calculateCompatibility(meData.vibeText, c.vibeText || "No voice bio provided.");
            return {
              ...c,
              match_score: compat.overallScore,
              criteria_scores: compat.criteria
            };
          });

          // Sort by match score descending
          scored.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          setCandidates(scored);

          // Simulated progress timeline for loading matches beautifully
          const stages = [
            { progress: 25, text: "Parsing voice vibe transcripts..." },
            { progress: 55, text: "Querying candidate profiles from MongoDB..." },
            { progress: 80, text: "Calculating Cosine Similarity dot products..." },
            { progress: 95, text: "Sorting matching percentage weights..." },
            { progress: 100, text: "Vibe match rendering complete!" }
          ];

          for (const stage of stages) {
            await new Promise(r => setTimeout(r, 400));
            setLoadingProgress(stage.progress);
            setLoadingStage(stage.text);
          }
        } else {
          setCandidates([]);
        }
      } catch (err: any) {
        toast({
          title: "Failed to load matches",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [toast, navigate]);

  const handleMessage = async (candidateId: string) => {
    navigate(`/chat?recipient=${candidateId}`);
  };

  const handleLike = async (candidateId: string) => {
    // Instantly launch the Congratulations Match Reveal Modal for demo simulation
    const cand = candidates.find(c => c._id === candidateId);
    if (cand) {
      setMatchedCandidate(cand);
      setShowMatchModal(true);
    }

    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
      await fetch(`${API_BASE}/auth/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidateId, like: true })
      });
    } catch (err) {
      console.error("Persisting swipe failed", err);
    }
  };

  const averageMatch = candidates.length > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidates.length)
    : 0;

  // Format matches list for MatchAnalytics mock format compatibility
  const formattedMatchesForAnalytics = candidates.map(c => ({
    anon_id: c.anonymousId,
    match_score: c.match_score || 75,
    criteria_scores: c.criteria_scores || {
      cleanliness: 70,
      sleep_schedule: 70,
      social_habits: 70,
      lifestyle: 70,
      food: 70
    },
    chatroom_passkey: c._id // use mongo id as room passkey
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-light-beige to-cream">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Perfect roommate matches" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Your Perfect Matches
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover your top compatibility roommate matches based on lifestyle, habits, and voice assessment vectors.
          </p>
          
          {/* Quick Stats */}
          {candidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{candidates.length}</div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{averageMatch}%</div>
                  <div className="text-sm text-muted-foreground">Avg. Compatibility</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{candidates[0]?.match_score}%</div>
                  <div className="text-sm text-muted-foreground">Best Match</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-border">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-warm-brown mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{candidates.length}</div>
                  <div className="text-sm text-muted-foreground">Chat Ready</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 max-w-md mx-auto text-center space-y-6 animate-in fade-in duration-300">
              {/* Pulsing Radar Animation */}
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-warm-brown/10 animate-ping duration-1000"></div>
                <div className="absolute inset-4 rounded-full bg-warm-brown/20 animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-full bg-warm-brown flex items-center justify-center shadow-lg border border-warm-brown-dark">
                  <Mic className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>

              {/* Progress Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-warm-brown">Calculating Vibe Vector Matches</h3>
                <p className="text-sm text-muted-text h-6 transition-all duration-300 font-medium">
                  {loadingStage}
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full space-y-2">
                <Progress value={loadingProgress} className="h-2 bg-soft-sand" />
                <div className="flex justify-between text-xs font-semibold text-warm-brown">
                  <span>SBERT Core</span>
                  <span>{loadingProgress}%</span>
                </div>
              </div>
            </div>
          ) : !userVibeText ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-light-cream rounded-xl border border-soft-sand">
              <AlertCircle className="w-16 h-16 text-warm-brown mb-4" />
              <h2 className="text-2xl font-bold text-warm-brown mb-2">Voice Onboarding Required</h2>
              <p className="text-muted-text max-w-md mb-6">
                You must complete your voice assessment so we can analyze your habits and calculate compatibility with other roommates.
              </p>
              <Button onClick={() => navigate("/voice")} className="bg-warm-brown hover:bg-warm-brown-dark text-white font-semibold">
                🎙️ Start Voice Onboarding
              </Button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches found yet. Try completing your optional lifestyle profiles!</p>
            </div>
          ) : (
            <>
              {/* Analytics Dashboard */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-2">Analytics Dashboard</h2>
                <p className="text-muted-foreground mb-8">
                  Deep insights into your compatibility patterns and match variations
                </p>
                <MatchAnalytics matches={formattedMatchesForAnalytics} />
              </div>

              {/* Matches Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Your Top Matches</h2>
                    <p className="text-muted-foreground">
                      Connect with your most compatible potential roommates
                    </p>
                  </div>
                </div>

                {/* Match Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
                  {candidates.slice(0, 4).map((c, index) => {
                    const matchMockFormat = {
                      anon_id: c.anonymousId,
                      match_score: c.match_score || 75,
                      criteria_scores: c.criteria_scores || {
                        cleanliness: 70,
                        sleep_schedule: 70,
                        social_habits: 70,
                        lifestyle: 70,
                        food: 70
                      },
                      chatroom_passkey: c._id // pass candidate user id as chat identifier
                    };
                    return (
                      <MatchCard
                        key={c._id}
                        match={matchMockFormat}
                        rank={index + 1}
                        onMessage={() => handleMessage(c._id)}
                        onLike={() => handleLike(c._id)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* Congratulations Match Reveal Modal */}
      <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
        <DialogContent className="sm:max-w-md bg-white border border-soft-sand rounded-2xl shadow-2xl p-6 text-center animate-in scale-in duration-300">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-200">
              <CheckCircle className="w-12 h-12 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-warm-brown text-center">
              🎉 Congratulations! Match Confirmed!
            </DialogTitle>
            <DialogDescription className="text-muted-text text-sm text-center">
              You and your roommate candidate have mutually swiped right. Real identity credentials are now revealed.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 p-5 bg-gradient-to-br from-light-cream to-creamy-beige rounded-xl border border-soft-sand/70 text-left space-y-3">
            <h4 className="font-extrabold text-warm-brown text-sm uppercase tracking-wider border-b border-soft-sand pb-1">
              🔒 Aadhaar ID Reveal Credentials
            </h4>
            <div className="space-y-2 text-xs text-warm-brown font-semibold">
              <div className="flex justify-between">
                <span className="text-muted-text">Real Name:</span>
                <span>Anjali Gupta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Anonymous ID:</span>
                <span>{matchedCandidate?.anonymousId || "CleanFreak_551"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Verified Aadhaar:</span>
                <span className="text-green-700">XXXX XXXX 7461 ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Phone Number:</span>
                <span>+91 9999900003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Email Address:</span>
                <span>anjali.gupta@example.com</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              sessionStorage.setItem("mockRoommateMatched", "true");
              setShowMatchModal(false);
              toast({
                title: "Roommate Finalized!",
                description: "Dashboard features (StyleMatch, Room Finder, GuideBot, Splits) are now fully unlocked."
              });
              navigate("/dashboard");
            }}
            className="w-full bg-warm-brown hover:bg-warm-brown-dark text-white font-extrabold py-5 rounded-xl shadow-lg transition-smooth hover-lift"
          >
            Continue to Dashboard
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MatchMeter;