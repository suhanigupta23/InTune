import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { 
  User as UserIcon, 
  Mic, 
  Users, 
  MessageCircle, 
  Palette, 
  MapPin, 
  Bot,
  Settings,
  LogOut,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  Lock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  anonymousId: string;
  gender: string;
  isVerified: boolean;
  vibeText: string;
  avatarSeed: string;
}

interface MatchRoommate {
  _id: string;
  name: string;
  anonymousId: string;
  status: "pending" | "matched";
  avatarSeed?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchRoommate[]>([]);
  const [chatsCount, setChatsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

        // 1. Fetch user profile
        const profileRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!profileRes.ok) {
          if (profileRes.status === 401 || profileRes.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to load user profile");
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        // 2. Fetch matches/chats list
        const matchesRes = await fetch(`${API_BASE}/auth/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }

        // 3. Fetch active chats count
        const chatsCountRes = await fetch(`${API_BASE}/auth/chats/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (chatsCountRes.ok) {
          const chatsCountData = await chatsCountRes.json();
          setChatsCount(chatsCountData.count);
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Failed to load dashboard data",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({ title: "Logged out", description: "You have been securely signed out." });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-warm-brown border-t-transparent rounded-full animate-spin"></div>
        <p className="text-warm-brown font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const hasVibe = !!profile?.vibeText;
  const finalizedRoommate = matches.find(m => m.status === "matched");
  const isFinalized = !!finalizedRoommate || sessionStorage.getItem("mockRoommateMatched") === "true";
  const activeChats = matches.filter(m => m.status === "pending");

  // Lock status helper
  const handleLockedClick = (e: React.MouseEvent, title: string) => {
    if (!isFinalized) {
      e.preventDefault();
      toast({
        title: "Feature Locked 🔒",
        description: `"${title}" will unlock as soon as you find and finalize a roommate match! Swiping right on profiles in Match Meter helps confirm matches.`,
        variant: "destructive"
      });
    }
  };

  // Steps calculations
  const completedSteps = ["Account Setup", "Identity Verification"];
  if (hasVibe) completedSteps.push("Voice Onboarding", "Matching Algorithm");

  const pendingSteps = [];
  if (!hasVibe) pendingSteps.push("Voice Onboarding");
  if (!isFinalized) pendingSteps.push("Finalize Roommate Match");

  const completionPercentage = Math.round(
    (completedSteps.length / (completedSteps.length + pendingSteps.length)) * 100
  );

  const quickActions = [
    {
      icon: Mic,
      title: "Voice Onboarding",
      description: hasVibe ? "Vibe survey complete!" : "Complete your roommate preference survey",
      status: hasVibe ? "completed" : "pending",
      link: "/voice",
      color: "bg-green-100 text-green-600",
      lockable: false
    },
    {
      icon: Users,
      title: "View Matches",
      description: "See compatibility scores",
      status: hasVibe ? "active" : "pending",
      link: "/matches",
      color: "bg-blue-100 text-blue-600",
      lockable: false
    },
    {
      icon: MessageCircle,
      title: "Chatterbox Chats",
      description: `${chatsCount} active chats`,
      status: chatsCount > 0 ? "active" : "pending",
      link: "/chat",
      color: "bg-purple-100 text-purple-600",
      lockable: false
    },
    {
      icon: Palette,
      title: "StyleMatch",
      description: "Room decoration templates",
      status: isFinalized ? "available" : "locked",
      link: "/stylematch",
      color: "bg-orange-100 text-orange-600",
      lockable: true
    },
    {
      icon: MapPin,
      title: "Room Finder",
      description: "Browse room pictures",
      status: isFinalized ? "available" : "locked",
      link: "/roomgallery",
      color: "bg-teal-100 text-teal-600",
      lockable: true
    },
    {
      icon: Bot,
      title: "GuideBot",
      description: "Get advice on conflict resolution",
      status: isFinalized ? "available" : "locked",
      link: "/guidebot",
      color: "bg-indigo-100 text-indigo-600",
      lockable: true
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "active":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "locked":
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <Star className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-warm-brown mb-2">
                Welcome back, {profile?.anonymousId || "User"}! 👋
              </h1>
              <p className="text-muted-text">
                Your credentials are secure. Ready to tune in with matching vibes?
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-soft-sand text-warm-brown hover:bg-light-cream">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Voice Onboarding Alert banner */}
        {!hasVibe && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-amber-600 animate-pulse" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Voice Onboarding Required</h4>
                <p className="text-xs text-amber-700">Complete your voice preferences to unlock matching compatibility and cosine similarity meters.</p>
              </div>
            </div>
            <Link to="/voice">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Start Survey
              </Button>
            </Link>
          </div>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-warm-white to-light-cream border-soft-sand shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-warm-brown">
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={completionPercentage} className="h-2 bg-soft-sand" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-text">{completionPercentage}% Complete</span>
                  <span className="text-warm-brown font-medium">
                    {completedSteps.length}/{completedSteps.length + pendingSteps.length} Steps
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warm-white to-light-cream border-soft-sand shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-warm-brown">
                Match Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-text">Roommate Status:</span>
                  <span className="font-semibold text-warm-brown">
                    {isFinalized ? "Finalized! 🎉" : "Finding Roommate..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Active Chats:</span>
                  <span className="font-semibold text-warm-brown">{activeChats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Aadhaar Status:</span>
                  <span className="font-semibold text-green-600">Verified ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warm-brown to-warm-brown-dark text-white border-transparent shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-white">
                Vibe Matching Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-light-cream">
                {isFinalized 
                  ? `Matched with roommate ${finalizedRoommate ? (finalizedRoommate.name || finalizedRoommate.anonymousId) : "Anjali Gupta"}! StyleMatch and conflict GuideBot are now fully unlocked!` 
                  : "Complete your voice survey, go to 'View Matches' to check percentage values, and send messages anonymously to break the ice!"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-warm-white to-light-cream border-soft-sand shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-warm-brown">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Unlock and manage your roommate search features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    const locked = action.lockable && !isFinalized;
                    return (
                      <Link 
                        key={index} 
                        to={locked ? "#" : action.link}
                        onClick={(e) => locked && handleLockedClick(e, action.title)}
                        className={locked ? "cursor-not-allowed" : ""}
                      >
                        <Card className={`hover-lift border-soft-sand transition-smooth ${locked ? "opacity-50 hover:translate-y-0" : "cursor-pointer"}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-warm-brown text-sm">
                                    {action.title}
                                  </h3>
                                  {getStatusIcon(action.status)}
                                </div>
                                <p className="text-xs text-muted-text">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Chats & Match cards */}
          <div>
            <Card className="bg-gradient-to-br from-warm-white to-light-cream border-soft-sand shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-warm-brown">
                  Active Rooms / Chats
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Directly chat with matching roommate candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.length === 0 ? (
                  <p className="text-xs text-muted-text text-center py-6">No active matches found. Start swiping on Match Meter!</p>
                ) : (
                  matches.map((m, index) => (
                    <div 
                      key={index} 
                      onClick={() => navigate(`/chat?recipient=${m._id}`)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-soft-sand hover:border-warm-brown cursor-pointer hover-lift transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warm-brown text-white rounded-full flex items-center justify-center font-bold">
                          {m.status === "matched" ? "✓" : "Anon"}
                        </div>
                        <div>
                          <div className="font-medium text-warm-brown text-sm">
                            {m.status === "matched" ? m.name : m.anonymousId}
                          </div>
                          <div className="text-xs text-muted-text">
                            {m.status === "matched" ? "Finalized Roommate" : "Active chat"}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={m.status === "matched" ? "default" : "secondary"}
                        className={m.status === "matched" ? "bg-green-600 hover:bg-green-700 text-white" : "text-warm-brown border-soft-sand"}
                      >
                        {m.status === "matched" ? "revealed" : "anonymous"}
                      </Badge>
                    </div>
                  ))
                )}
                
                <Link to="/matches">
                  <Button variant="outline" size="sm" className="w-full border-soft-sand text-warm-brown hover:bg-light-cream font-medium">
                    Find New Roommates (Match Meter)
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8 bg-gradient-to-br from-warm-white to-light-cream border-soft-sand shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-warm-brown">
              Recommended Tasks
            </CardTitle>
            <CardDescription className="text-muted-text">
              Steps to fully unlock your roommate portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-soft-sand">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-warm-brown font-medium text-sm">{step}</span>
                  <Button 
                    variant="hero" 
                    size="sm" 
                    className="ml-auto bg-warm-brown hover:bg-warm-brown-dark text-white font-semibold"
                    onClick={() => {
                      if (step.includes("Voice")) navigate("/voice");
                      else navigate("/matches");
                    }}
                  >
                    Complete Step
                  </Button>
                </div>
              ))}
              {pendingSteps.length === 0 && (
                <div className="col-span-2 flex items-center gap-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-sm">All steps completed! You are fully locked in.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;