import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OmniWidget from "./omniWidget";
import VoiceMatchCard from "./VoiceMatchCard";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Save, CheckCircle } from "lucide-react";

const VoiceMatchSection = () => {
  const navigate = useNavigate();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [currentVibeType, setCurrentVibeType] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartChat = (cardType: string) => {
    setCurrentVibeType(cardType);
    setShowVoiceModal(true);
    setTranscript("");
    setIsSuccess(false);
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice speech recognition is not supported in this browser. Please type your preferences.",
        variant: "destructive"
      });
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";

    rec.onstart = () => {
      setRecording(true);
      setTranscript("");
    };

    rec.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    rec.onerror = (e: any) => {
      console.error(e);
      setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
    };

    rec.start();
    setRecognition(rec);
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const saveVibeProfile = async () => {
    if (!transcript) {
      toast({
        title: "Transcript empty",
        description: "Please record or type something before saving.",
        variant: "destructive"
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ vibeText: transcript })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to save profile");

      setIsSuccess(true);
      toast({
        title: "Voice Vibe Saved! 🎉",
        description: `Your ${currentVibeType} matching profile is now active.`,
      });

      // Auto-redirect to Match Meter after 2.5 seconds
      setTimeout(() => {
        setShowVoiceModal(false);
        navigate("/matches");
      }, 2500);

    } catch (err: any) {
      toast({
        title: "Error saving vibe",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="voice-page">
      <section className="relative py-20 px-6 bg-gradient-to-br from-light-cream via-creamy-beige to-soft-sand overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-warm-brown rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-soft-sand rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-warm-brown-dark rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-creamy-beige rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-warm-brown mb-6 drop-shadow-sm">
            Voice Match
          </h1>
          <p className="text-xl text-muted-text max-w-3xl mx-auto leading-relaxed">
            Let our AI assistant understand your roommate vibe through natural voice. 
            Speak your lifestyle, cleaning habits, and daily routines to find a compatible match.
          </p>
        </div>

        {/* Unified Survey Card */}
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
          <Card className="border-soft-sand bg-gradient-to-br from-warm-white to-light-cream shadow-xl p-8 rounded-2xl border text-center space-y-6">
            <CardHeader className="space-y-3 pb-0">
              <div className="mx-auto w-16 h-16 bg-warm-brown/10 rounded-full flex items-center justify-center text-warm-brown">
                <Mic className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-warm-brown">
                Take the Roommate Survey
              </CardTitle>
              <CardDescription className="text-muted-text text-sm leading-relaxed">
                Answering a few simple questions by voice allows our SBERT similarity matching algorithm to find your perfect roommates.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-left border-t border-b border-soft-sand/60 py-6 my-4 space-y-3">
              <h4 className="font-semibold text-warm-brown text-xs uppercase tracking-wider mb-2">
                📋 Topics covered in the survey:
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-text">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>Roommate Preferences</strong> (hygiene, cleaning standards, sleep schedules)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>Room Preferences</strong> (budget, ideal location, sharing style)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>Lifestyle & Habits</strong> (hobbies, social standards, guest rules)
                </li>
              </ul>
            </CardContent>

            <div className="pt-2 flex flex-col gap-3">
              <Button
                onClick={() => {
                  // Find and activate the Omnidimension iframe widget
                  const iframe = document.querySelector('iframe[id*="omnidimension"]') || document.querySelector('iframe[src*="omnidim"]');
                  if (iframe) {
                    try {
                      (iframe as HTMLIFrameElement).contentWindow?.postMessage(JSON.stringify({ event: "open" }), "*");
                      (iframe as HTMLIFrameElement).contentWindow?.postMessage(JSON.stringify({ event: "toggle" }), "*");
                    } catch (e) {}
                    (iframe as HTMLElement).click();
                    toast({
                      title: "AI Assistant Activated! 🎙️",
                      description: "Please chat with InTune in the bottom right corner bubble.",
                    });
                  } else {
                    toast({
                      title: "Launching survey assistant...",
                      description: "Click the floating OmniDimension Agent button at the bottom right to start!",
                    });
                  }
                }}
                className="bg-warm-brown hover:bg-warm-brown-dark text-white font-bold px-8 py-6 text-base rounded-xl shadow-lg w-full transition-smooth hover-lift"
              >
                🎙️ Start Voice Survey
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Survey captured! 🎉",
                    description: "Moving forward to your Match Meter compatibility dashboard...",
                  });
                  setTimeout(() => navigate("/matches"), 800);
                }}
                variant="outline"
                className="border-soft-sand text-warm-brown hover:bg-light-cream font-bold px-8 py-6 text-sm rounded-xl w-full"
              >
                I've Finished the Survey! Proceed to Match Meter ✓
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Voice Recorder Modal */}
      <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-warm-white to-light-cream border border-soft-sand shadow-2xl backdrop-blur-md">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              <h3 className="text-2xl font-bold text-green-800">Your survey is taken!</h3>
              <p className="text-sm text-muted-text">
                Moving forward to your Match Meter to check your compatibility vibe scores...
              </p>
              <Button
                onClick={() => {
                  setShowVoiceModal(false);
                  navigate("/matches");
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold mt-4 flex items-center gap-2"
              >
                Go to Match Meter Now
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-warm-brown flex items-center gap-2">
                  🎙️ Voice Assessment
                </DialogTitle>
                <DialogDescription className="text-muted-text">
                  Speak clearly into your microphone about your <strong>{currentVibeType}</strong>. Explain things like your sleep schedule, hobbies, hygiene standards, or expectations.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center p-6 space-y-6">
                <button
                  type="button"
                  onClick={recording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    recording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse text-white scale-110"
                      : "bg-warm-brown hover:bg-warm-brown-dark text-white hover:scale-105"
                  }`}
                >
                  {recording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </button>

                <span className={`text-sm font-semibold tracking-wider ${recording ? "text-red-500 animate-pulse" : "text-muted-text"}`}>
                  {recording ? "RECORDING SPEECH..." : "TAP MIC TO SPEAK"}
                </span>

                <div className="w-full space-y-2">
                  <label className="text-sm font-medium text-warm-brown">Vibe Transcript:</label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Start speaking, or edit the transcribed text here manually..."
                    className="w-full h-32 p-3 text-sm border rounded-lg border-soft-sand bg-white/80 focus:ring-1 focus:ring-warm-brown focus:border-warm-brown resize-none outline-none shadow-inner"
                  />
                </div>

                <div className="flex justify-end gap-3 w-full pt-4 border-t border-soft-sand">
                  <Button
                    variant="outline"
                    onClick={() => setShowVoiceModal(false)}
                    className="border-soft-sand text-warm-brown hover:bg-light-cream font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveVibeProfile}
                    disabled={!transcript}
                    className="bg-warm-brown hover:bg-warm-brown-dark text-white font-semibold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Vibe Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <OmniWidget />
    </section>
    </div>
  );
};

export default VoiceMatchSection;
