import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Voice from "./pages/Voice";
import Splits from "./pages/Splits";
import MatchMeter from "./pages/MatchMeter";
import Chatterbox from "./pages/Chatterbox";
import Gallery from "./pages/Gallery";
import GuideBot from "./pages/GuideBot";
import StyleMatch from "./pages/StyleMatch";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/split" element={<Splits />} />
          <Route path="/chat" element={<Chatterbox />} />
          <Route path="/onboarding" element={<Navigate to="/signup" replace />} />
          <Route path="/smartmatch" element={<Navigate to="/matches" replace />} />
          <Route path="/chatterbox" element={<Navigate to="/chat" replace />} />
          <Route path="/guidebot" element={<GuideBot />} />
          <Route path="/stylematch" element={<StyleMatch />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/roomgallery" element={<Gallery />} />
          <Route path="/matches" element={<MatchMeter />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
