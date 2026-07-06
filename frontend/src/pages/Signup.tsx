import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Mail, Lock, User, Phone, Shield, ArrowRight, Home, CheckCircle, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createWorker } from "tesseract.js"; 
import { API } from "@/lib/api";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const { toast } = useToast();
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);   // NEW
  const [ocrLoading, setOcrLoading]   = useState(false);               // NEW
  const [showManualAadhaar, setShowManualAadhaar] = useState(false);
  const [manualAadhaar, setManualAadhaar] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 👇 ADD just these two helpers at the top of the component file (after imports)
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.err || data.msg || "Request failed");
  return data as T;
}

/* 🧠  OCR & Aadhaar Validation ------------------------------------------- */
const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function validateAadhaar(aadhaarString: string): boolean {
  const clean = aadhaarString.replace(/\s/g, "");
  if (clean.length !== 12 || !/^\d+$/.test(clean)) return false;
  
  let c = 0;
  const myArray = clean.split("").map(Number).reverse();
  for (let i = 0; i < myArray.length; i++) {
    c = verhoeffTableD[c][verhoeffTableP[i % 8][myArray[i]]];
  }
  return c === 0;
}

async function processAadhaar(file: File) {
  const worker = await createWorker("eng", 1, {
    logger: () => {}
  });
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  const upper = text.toUpperCase();
  let gender: "Male" | "Female" | "Unknown" = "Unknown";
  if (upper.includes("FEMALE")) gender = "Female";
  else if (upper.includes("MALE")) gender = "Male";

  // Clean line breaks to ensure correct pattern matching
  const cleanText = text.replace(/[\r\n]/g, " ");
  
  // Find all 4-4-4 digit sequences and 12 contiguous digit sequences
  const matches = cleanText.match(/\b\d{4}\s\d{4}\s\d{4}\b/g) || [];
  const contiguousMatches = cleanText.match(/\b\d{12}\b/g) || [];
  const allCandidates = [...matches, ...contiguousMatches];

  let isValid = false;
  let maskedAadhaar = "";

  for (const candidate of allCandidates) {
    if (validateAadhaar(candidate)) {
      isValid = true;
      maskedAadhaar = `XXXX XXXX ${candidate.replace(/\s/g, "").slice(-4)}`;
      break;
    }
  }

  return { gender, isValid, maskedAadhaar };
}

// ⬇️  REPLACE ONLY THESE TWO FUNCTIONS  ───────────────────────────
const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validations
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and privacy policy to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!aadhaarFile) {
      toast({ title: "Aadhaar image missing", description: "Please upload your Aadhaar JPG before continuing.", variant: "destructive" });
      return;
    }

    let extractedData = { gender: "Unknown" as any, isValid: false, maskedAadhaar: "" };
    try {
      setOcrLoading(true);
      extractedData = await processAadhaar(aadhaarFile);

      if (extractedData.gender === "Male") {
        toast({
          title: "Signup blocked 🚫",
          description: "At the moment InTune is only open to female students.",
          variant: "destructive"
        });
        return;
      }
      if (!extractedData.isValid) {
        if (showManualAadhaar && manualAadhaar.length === 12) {
          if (validateAadhaar(manualAadhaar)) {
            extractedData.isValid = true;
            extractedData.maskedAadhaar = `XXXX XXXX ${manualAadhaar.slice(-4)}`;
          } else {
            toast({
              title: "Invalid Manual Aadhaar",
              description: "The 12-digit Aadhaar number you entered is incorrect. Checksum validation failed.",
              variant: "destructive"
            });
            return;
          }
        } else {
          setShowManualAadhaar(true);
          toast({
            title: "Verification failed",
            description: "Aadhaar checksum validation failed. Please check the card image, or verify your 12-digit number manually below.",
            variant: "destructive"
          });
          return;
        }
      }
    } catch (err) {
      if (showManualAadhaar && manualAadhaar.length === 12) {
        if (validateAadhaar(manualAadhaar)) {
          extractedData.isValid = true;
          extractedData.maskedAadhaar = `XXXX XXXX ${manualAadhaar.slice(-4)}`;
        } else {
          toast({
            title: "Invalid Manual Aadhaar",
            description: "The 12-digit Aadhaar number you entered is incorrect. Checksum validation failed.",
            variant: "destructive"
          });
          return;
        }
      } else {
        setShowManualAadhaar(true);
        toast({
          title: "OCR scanning issue",
          description: "Could not read the image. Please enter your 12-digit Aadhaar number manually below.",
          variant: "destructive"
        });
        return;
      }
    } finally {
      setOcrLoading(false);
    }

    /* ↳ If we’re here gender = Female – continue with your existing API call */
    try {
      type Resp = { token: string; name: string; email: string; _id: string; anonymousId: string };
      const data = await request<Resp>("/auth/register", {
        name: formData.email.split("@")[0],
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: extractedData.gender === "Unknown" ? "Female" : extractedData.gender,
        isVerified: true,
        maskedAadhaar: extractedData.maskedAadhaar
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        anonymousId: data.anonymousId
      }));

      toast({ title: "Account created successfully! 🎉", description: "Redirecting to dashboard…" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    }
  };
  
const handleGoogleSignup = async () => {
  try {
    type Resp = { token: string; name: string; email: string; _id: string; anonymousId: string };
    const randomSeed = Math.floor(Math.random() * 1000);
    const data = await request<Resp>("/auth/google-login", {
      name: `GoogleUser_${randomSeed}`,
      email: `googleuser_${randomSeed}@gmail.com`,
      googleId: `google_${randomSeed}`
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      anonymousId: data.anonymousId
    }));

    toast({
      title: "Google Signup Successful! 🎉",
      description: "Signed up via Google. Complete voice onboarding and Aadhaar verification next."
    });
    navigate("/dashboard");
  } catch (err: any) {
    toast({
      title: "Google Signup failed",
      description: err.message,
      variant: "destructive"
    });
  }
};

  const signupBenefits = [
    "Get your unique anonymous ID",
    "Advanced AI voice matching",
    "Anonymous chat system",
    "Aadhaar-verified security",
    "StyleMatch room decoration",
    "GuideBot conflict resolution"
  ];

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />
      
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Back to Home */}
          <Link 
            to="/" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-smooth"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits Column */}
            <div className="lg:col-span-1">
              <Card className="bg-card-gradient border-border/50 shadow-card h-fit">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Why Join InTune?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {signupBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-border">
                    <Badge variant="secondary" className="w-full justify-center">
                      🎯 97% Match Success Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card-gradient border-border/50 shadow-warm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-primary">
                    Join InTune Today
                  </CardTitle>
                  <CardDescription>
                    Create your account and get your unique anonymous ID to start matching
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">

                  
                  {/* ⬇️ New Aadhaar upload field */}
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Upload Aadhaar JPG</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="aadhaar"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setAadhaarFile(e.target.files?.[0] ?? null)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {ocrLoading && (
                      <p className="text-xs text-muted-foreground">Analysing image…</p>
                    )}
                    {showManualAadhaar && (
                      <div className="space-y-2 border border-amber-200 bg-amber-50/50 p-3 rounded-lg animate-in fade-in duration-300">
                        <Label htmlFor="manualAadhaar" className="text-amber-800 text-xs font-semibold">
                          Could not read card automatically. Please verify or enter the 12-digit Aadhaar number manually:
                        </Label>
                        <Input
                          id="manualAadhaar"
                          type="text"
                          maxLength={12}
                          placeholder="e.g. 636704876554"
                          value={manualAadhaar}
                          onChange={(e) => setManualAadhaar(e.target.value.replace(/\D/g, ""))}
                          className="bg-white border-amber-300 focus-visible:ring-amber-500 font-mono tracking-wider"
                        />
                      </div>
                    )}
                  </div>

                  {/* Email Signup Form */}
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create strong password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Agreements */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:text-primary/80">
                            Terms & Conditions
                          </Link>
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="privacy" 
                          checked={formData.agreeToPrivacy}
                          onCheckedChange={(checked) => handleInputChange('agreeToPrivacy', checked as boolean)}
                        />
                        <label htmlFor="privacy" className="text-sm text-muted-foreground">
                          I agree to the{" "}
                          <span className="text-primary hover:text-primary/80">
  Privacy Policy
</span>

                        </label>
                      </div>
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      Create Account & Get Anonymous ID
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                      Sign in here
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="mt-6 text-center text-xs text-muted-foreground">
                🔒 Your data is protected with Aadhaar verification, anonymous IDs, and end-to-end encryption.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;