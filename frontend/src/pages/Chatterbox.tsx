import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, ArrowLeft, ShieldAlert, MessageCircle, User } from "lucide-react";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface MatchRoommate {
  _id: string;
  name: string;
  anonymousId: string;
  status: "pending" | "matched";
}

// Highly sophisticated Category Cosine Similarity Matcher (Identical to MatchMeter)
function calculateCompatibility(userVibe: string, candidateVibe: string) {
  const cleanA = userVibe.toLowerCase();
  const cleanB = candidateVibe.toLowerCase();

  const getCategoryScore = (keywords: string[]) => {
    let matches = 0;
    keywords.forEach(kw => {
      const hasA = cleanA.includes(kw);
      const hasB = cleanB.includes(kw);
      if (hasA && hasB) matches += 2.0;
      else if (hasA || hasB) matches += 0.5;
    });
    const base = 60 + Math.min(matches * 8, 38);
    return Math.round(base);
  };

  const cleanlinessScore = getCategoryScore(["clean", "tidy", "neat", "wash", "messy", "dirty", "hygiene", "dust"]);
  const sleepScore = getCategoryScore(["sleep", "wake", "night", "morning", "early", "late", "owl", "lark", "bed", "rest"]);
  const socialScore = getCategoryScore(["friend", "guest", "party", "social", "chat", "quiet", "alone", "loud", "music", "noise"]);
  const lifestyleScore = getCategoryScore(["smoke", "drink", "alcohol", "pet", "dog", "cat", "hobby", "study", "work", "job"]);
  const foodScore = getCategoryScore(["cook", "veg", "non-veg", "food", "kitchen", "bake", "eat", "meal", "dine"]);

  const wordsA = cleanA.match(/\b\w+\b/g) || [];
  const wordsB = cleanB.match(/\b\w+\b/g) || [];
  const vocab = new Set([...wordsA, ...wordsB]);

  let overallScore = 75;
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
      overallScore = Math.round(55 + cosSim * 43);
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

const Chatterbox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("recipient");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [matchesList, setMatchesList] = useState<MatchRoommate[]>([]);
  const [recipientName, setRecipientName] = useState("Loading...");
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

        // 1. Get current user profile
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error("Failed to get profile");
        const meData = await meRes.json();
        setCurrentUser(meData);

        // 2. Fetch candidates list, score, sort, and slice to TOP 4
        const candRes = await fetch(`${API_BASE}/auth/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let top4Rooms: MatchRoommate[] = [];

        if (candRes.ok && meData.vibeText) {
          const candData = await candRes.json();
          // Score and sort candidates
          const scored = candData.map((c: any) => {
            const compat = calculateCompatibility(meData.vibeText, c.vibeText || "No voice bio provided.");
            return { ...c, match_score: compat.overallScore };
          });
          scored.sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0));
          const top4Candidates = scored.slice(0, 4);

          // Get match swipe statuses to check if names should be revealed
          const matchesRes = await fetch(`${API_BASE}/auth/matches`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          let matchesData: any[] = [];
          if (matchesRes.ok) {
            matchesData = await matchesRes.json();
          }

          top4Rooms = top4Candidates.map((c: any) => {
            const matchedRecord = matchesData.find((m: any) => m._id === c._id);
            return {
              _id: c._id,
              name: c.name,
              anonymousId: c.anonymousId,
              status: matchedRecord?.status === "matched" ? "matched" : "pending"
            };
          });

          setMatchesList(top4Rooms);

          // Auto-select the first candidate if none is in URL params
          if (!recipientId && top4Rooms.length > 0) {
            navigate(`/chat?recipient=${top4Rooms[0]._id}`, { replace: true });
            return;
          }
        }
        // 3. Fetch specific recipient messages if recipientId exists
        if (recipientId) {
          const chatRes = await fetch(`${API_BASE}/auth/chat/${recipientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!chatRes.ok) throw new Error("Failed to load chat history");
          const chatData = await chatRes.json();
          setMessages(chatData);

          // Resolve active recipient's name or anonymity from top 4 rooms
          const activeMatch = top4Rooms.find((m: any) => m._id === recipientId);
          if (activeMatch) {
            setRecipientName(activeMatch.status === "matched" ? activeMatch.name : activeMatch.anonymousId);
            setIsRevealed(activeMatch.status === "matched");
          } else {
            // Check fallback in matchesList state
            const stateMatch = matchesList.find((m: any) => m._id === recipientId);
            if (stateMatch) {
              setRecipientName(stateMatch.status === "matched" ? stateMatch.name : stateMatch.anonymousId);
              setIsRevealed(stateMatch.status === "matched");
            } else {
              setRecipientName("Anonymous Roommate");
              setIsRevealed(false);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchChatData();

    // Poll message list every 3 seconds for two-way chat updates
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [recipientId, navigate, matchesList.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !recipientId) return;

    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_BASE}/auth/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: recipientId,
          content: inputText
        })
      });
      const newMessage = await res.json();
      if (!res.ok) throw new Error(newMessage.msg || "Failed to send message");

      setMessages(prev => [...prev, newMessage]);
      setInputText("");
    } catch (err: any) {
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive"
      });
    }
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

        {/* Chat App Workspace Grid */}
        <div className="flex-1 min-h-[600px] flex flex-col md:flex-row border border-soft-sand bg-white shadow-xl rounded-2xl overflow-hidden">
          
          {/* Left Sidebar Pane - Chat Inbox List (Matches Top 4) */}
          <div className="w-full md:w-80 border-r border-soft-sand bg-light-cream/30 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-soft-sand bg-light-cream/60">
              <h3 className="font-bold text-warm-brown text-base flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-warm-brown" />
                Top 4 Matches
              </h3>
              <p className="text-xxs text-muted-text mt-1">Chat directly with your top 4 vibe matches</p>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-soft-sand/40">
              {matchesList.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-text">
                  Complete your voice survey to calculate and load your top 4 matches!
                </div>
              ) : (
                matchesList.map((m) => {
                  const isSelected = m._id === recipientId;
                  return (
                    <div
                      key={m._id}
                      onClick={() => navigate(`/chat?recipient=${m._id}`)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-smooth ${
                        isSelected 
                          ? "bg-white border-l-4 border-warm-brown shadow-sm" 
                          : "hover:bg-light-cream"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-warm-brown text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        {m.status === "matched" ? m.name[0].toUpperCase() : "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-sm font-bold text-warm-brown truncate">
                            {m.status === "matched" ? m.name : m.anonymousId}
                          </h4>
                        </div>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          m.status === "matched" ? "bg-green-100 text-green-800" : "bg-soft-sand text-warm-brown"
                        }`}>
                          {m.status === "matched" ? "Revealed" : "Anonymous"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane - Chat Window Area */}
          <div className="flex-1 flex flex-col bg-white">
            {recipientId ? (
              <>
                {/* Active Chat Header */}
                <div className="bg-gradient-to-r from-light-cream to-creamy-beige border-b border-soft-sand py-4 px-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-warm-brown rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {recipientName[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-warm-brown">{recipientName}</CardTitle>
                      <p className="text-xxs text-muted-text">
                        {isRevealed ? "👥 Real Identity Confirmed Match" : "🔒 Anonymous Chatting Mode"}
                      </p>
                    </div>
                  </div>

                  {!isRevealed && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xxs font-bold px-2 py-1 rounded-full border border-amber-200">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Vibe check active
                    </div>
                  )}
                </div>

                {/* Messages Feed Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[480px]">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-text">
                      <p className="font-semibold text-warm-brown mb-1">Start Chatterbox Conversation</p>
                      <p className="text-xs max-w-xs">Ask questions about roommate routines, rent sharing, or daily schedules. Confirm the vibe before matching!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender === currentUser?._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isMe
                                ? "bg-warm-brown text-white rounded-tr-none"
                                : "bg-light-cream text-warm-brown border border-soft-sand rounded-tl-none"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                isMe ? "text-white/70" : "text-muted-text"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-soft-sand bg-light-cream/40 flex items-center gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border-soft-sand bg-white focus:ring-1 focus:ring-warm-brown focus:border-warm-brown placeholder:text-muted-text text-sm"
                  />
                  <Button type="submit" className="bg-warm-brown hover:bg-warm-brown-dark text-white font-bold shadow-md px-5 py-5 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-light-cream/20">
                <div className="w-16 h-16 bg-light-cream border border-soft-sand rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-warm-brown/40" />
                </div>
                <h3 className="text-lg font-bold text-warm-brown mb-1">Welcome to InTune Chat</h3>
                <p className="text-sm text-muted-text max-w-sm">
                  Select a roommate candidate from the inbox list on the left to start chatting anonymously and break the ice!
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chatterbox;
