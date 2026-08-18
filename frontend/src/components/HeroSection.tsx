import { Users } from "lucide-react";
import roommatesHero from "@/assets/roommates-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${roommatesHero})` }}
      />
      <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]" />
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-white" />
          <span className="text-white font-medium">Roommate Gallery</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight">
          Celebrate Your Perfect Match
        </h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl">
          Share the joy of finding your ideal roommate! Upload your happy moments 
          and inspire other women in their search for the perfect living companion.
        </p>
        
        <div className="flex flex-wrap items-center gap-8 text-white/90">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Privacy Protected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Consent Required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Community Inspiring</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;