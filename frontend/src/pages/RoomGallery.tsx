import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ShareMomentSection from "@/components/ShareMomentSection";
import SuccessStories from "@/components/SuccessStories";
import CommunityStats from "@/components/CommunityStats";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const RoomGallery = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Top-edge GitHub-style progress bar simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 250);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* GitHub-style top-edge loader */}
      {loading && (
        <div 
          className="fixed top-0 left-0 h-1 bg-warm-brown transition-all duration-200 ease-out z-[99999]"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      )}

      <Navbar />
      <HeroSection />
      <ShareMomentSection />
      <SuccessStories />
      <CommunityStats />
      <Footer />
    </div>
  );
};

export default RoomGallery;