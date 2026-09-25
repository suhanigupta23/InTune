import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Mail, Lock, ArrowRight, Home } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

async function request<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Request failed");
  }

  return data as T;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      type LoginResponse = {
        token: string;
        name: string;
        email: string;
        _id: string;
        anonymousId: string;
      };

      const data = await request<LoginResponse>("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        anonymousId: data.anonymousId
      }));

      toast({
        title: `Welcome back, ${data.name}!`,
        description: "Redirecting to your dashboard…"
      });
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
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

            <CardContent>
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
                      onChange={(event) => setEmail(event.target.value)}
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
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            🔒 Your data is protected with end-to-end encryption and anonymous ID systems.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
