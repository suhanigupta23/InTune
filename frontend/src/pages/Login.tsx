import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { Mail, Lock, ArrowRight, Home } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmailMode, setCustomEmailMode] = useState(false);
  const [customEmail, setCustomEmail] = useState("");

  /* ───────────────────────────────────────────────
   helper: POST to <backend>/api/<path>
   (Put these two lines near the top, after imports)
 ──────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

async function request<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Request failed");
  return data as T;
}

/* ───────────────────────────────────────────────
   UPDATED HANDLERS
 ──────────────────────────────────────────────── */
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    /* 1️⃣  hit the Express login endpoint */
    type Resp = { token: string; name: string; email: string; _id: string; anonymousId: string };
    const data = await request<Resp>("/auth/login", { email, password });

    /* 2️⃣  persist JWT so subsequent requests can include it */
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      anonymousId: data.anonymousId
    }));

    /* 3️⃣  user feedback + redirect */
    toast({
      title: `Welcome back, ${data.name}!`,
      description: "Redirecting to your dashboard…"
    });

    navigate("/dashboard");
  } catch (err: any) {
    toast({
      title: "Login failed",
      description: err.message,
      variant: "destructive"
    });
  }
};

const handleGoogleLogin = () => {
  setCustomEmailMode(false);
  setCustomEmail("");
  setShowGoogleModal(true);
};

const triggerGoogleLogin = async (selectedEmail: string) => {
  setShowGoogleModal(false);
  try {
    type Resp = { token: string; name: string; email: string; _id: string; anonymousId: string };
    const name = selectedEmail.split("@")[0];
    const data = await request<Resp>("/auth/google-login", {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: selectedEmail.trim().toLowerCase(),
      googleId: `google_${Date.now()}`
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      anonymousId: data.anonymousId
    }));

    toast({
      title: "Google Login Successful! 🎉",
      description: "Redirecting to dashboard…"
    });
    navigate("/dashboard");
  } catch (err: any) {
    toast({
      title: "Sign up first! ⚠️",
      description: "An account with this email does not exist. Please sign up first.",
      variant: "destructive"
    });
    setTimeout(() => {
      navigate("/signup");
    }, 1500);
  }
};


  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />
      
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link 
            to="/" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-smooth"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="bg-card-gradient border-border/50 shadow-warm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Welcome Back to InTune
              </CardTitle>
              <CardDescription>
                Sign in to continue your roommate matching journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google Login */}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full" 
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link to="/forgot-password" className="text-primary hover:text-primary/80">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            🔒 Your data is protected with end-to-end encryption and anonymous ID systems.
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="sm:max-w-[420px] bg-[#1a1a1a] text-white border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          {/* Google Logo */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>

          <DialogHeader className="w-full text-center space-y-1">
            <DialogTitle className="text-2xl font-normal text-white text-center">
              Choose an account
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-sm text-center">
              to continue to InTune
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mt-6 space-y-0.5 border-t border-b border-neutral-800 py-2">
            {!customEmailMode ? (
              <>
                {/* Suhani Gupta Preset */}
                <button
                  onClick={() => triggerGoogleLogin("suhanigupta2304@gmail.com")}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-800 rounded-lg transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#8A2BE2] text-white flex items-center justify-center font-semibold text-sm">
                      S
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Suhani Gupta</div>
                      <div className="text-xs text-neutral-400">suhanigupta2304@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium">Signed out</span>
                </button>

                {/* Use Another Account */}
                <button
                  onClick={() => setCustomEmailMode(true)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-neutral-800 rounded-lg transition text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Use another account</span>
                </button>
              </>
            ) : (
              <div className="p-3 space-y-3">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 py-3 text-sm rounded-xl focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCustomEmailMode(false)}
                    variant="ghost"
                    className="flex-1 text-xs text-neutral-400 hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => triggerGoogleLogin(customEmail)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full mt-4 text-center">
            <span className="text-xxs text-neutral-500">
              To continue, Google will share your name, email address, language preference, and profile picture with InTune.
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;