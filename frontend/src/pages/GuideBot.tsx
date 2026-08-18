import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Send, Bot, User, Sparkles, Scale, Info } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
}

const GuideBot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am InTune's conflict resolution GuideBot. Roommate disagreements are completely natural. Select an issue type below, or type your concern, and I will help you find a peaceful solution! 🤝",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sampleIssues = [
    {
      title: "🧹 Cleanliness & Chores",
      query: "My roommate is not doing their dishes or cleaning the shared space.",
      response: "Chores and cleanliness are the #1 source of roommate tension. I highly recommend establishing a weekly rotating chore schedule in writing. Try discussing a dedicated day (e.g., 'Sunday cleanups') where both of you clean together to keep it friendly and split the effort!"
    },
    {
      title: "🎵 Guests & Noise Policy",
      query: "My roommate has guests over late at night and makes too much noise.",
      response: "Quiet hours are essential. I advise establishing agreed-upon 'quiet periods' (e.g., 10 PM to 7 AM on weekdays). For guests, set a rule requiring 24-hour advance notice so no one is caught off-guard in shared living areas."
    },
    {
      title: "💤 Sleep Schedules & Lights",
      query: "One of us is an early bird and the other stays up late studying.",
      response: "If sleep schedules mismatch, respect is key. Try using desk lamps instead of overhead lights, invest in noise-canceling headphones, and agree to keep morning/night routines (like blow-drying hair or packing bags) outside the shared bedroom."
    },
    {
      title: "💵 Shared Bills & Rent",
      query: "We keep losing track of who owes who for groceries and internet.",
      response: "Avoid verbal accounts! Use InTune's integrated 'SplitMate' tool to log expenses instantly. Discuss budget caps and confirm payment dates before utility bills are due to keep it stress-free."
    }
  ];

  const handleSampleClick = (issue: typeof sampleIssues[0]) => {
    // 1. Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: issue.query,
      timestamp: new Date()
    };

    // 2. Add bot reply after delay
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: issue.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 700);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I understand your concern. The best first step is always open, non-confrontational communication using 'I' statements (e.g., 'I feel stressed when the kitchen is cluttered' instead of 'You always leave a mess'). Consider scheduling a quick 10-minute chat over tea to align your boundaries! ☕",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 850);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-8 flex flex-col">
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-warm-brown flex items-center gap-2">
            <Bot className="w-8 h-8 text-warm-brown" />
            GuideBot Conflict Resolution
          </h1>
          <p className="text-muted-text text-sm mt-1">
            Get instant, unbiased AI advice on common co-living challenges and resolve roommate tension.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
          
          {/* Left Panel - Issue Templates */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border border-soft-sand bg-white/70 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-warm-brown uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-warm-brown" />
                  Common Disputes
                </CardTitle>
                <CardDescription className="text-xxs">
                  Click a template to seek direct resolution advice:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 p-4 pt-0">
                {sampleIssues.map((issue, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => handleSampleClick(issue)}
                    className="w-full justify-start text-left border-soft-sand hover:bg-light-cream text-warm-brown font-semibold text-xs whitespace-normal h-auto py-2.5 px-3"
                  >
                    {issue.title}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-soft-sand bg-amber-50/50 p-4 space-y-2 shadow-sm">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-xxs text-amber-800 font-medium leading-relaxed">
                  <strong>Tip:</strong> If issues persist and you cannot reach a compromise, you can escalate the matter directly to our Admin Support team inside your chats.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Panel - Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col border border-soft-sand bg-white shadow-lg rounded-2xl overflow-hidden min-h-[450px]">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-light-cream to-creamy-beige border-b border-soft-sand py-3 px-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-warm-brown text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  GB
                </div>
                <div>
                  <h3 className="text-sm font-bold text-warm-brown">GuideBot Assistant</h3>
                  <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {msg.sender === "bot" && (
                        <div className="w-6 h-6 rounded-full bg-warm-brown text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          🤖
                        </div>
                      )}
                      <div className={`rounded-xl px-3.5 py-2 text-xs shadow-sm ${
                        msg.sender === "user"
                          ? "bg-warm-brown text-white rounded-tr-none"
                          : "bg-light-cream text-warm-brown border border-soft-sand rounded-tl-none"
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 border-t border-soft-sand bg-light-cream/40 flex items-center gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a conflict or boundaries question..."
                  className="flex-1 border-soft-sand bg-white text-xs placeholder:text-muted-text py-4"
                />
                <Button type="submit" className="bg-warm-brown hover:bg-warm-brown-dark text-white font-bold shadow-sm p-3">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>

            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuideBot;
