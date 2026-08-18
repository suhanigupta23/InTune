import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroVoiceMatch from "@/assets/hero-voicematch.jpg";
import heroMatchMeter from "@/assets/hero-matchmeter.jpg";
import heroChatterBox from "@/assets/hero-chatterbox.jpg";
import heroStyleMatch from "@/assets/hero-stylematch.jpg";
import heroInTuneMain from "@/assets/hero-intune-main.jpg";

const slides = [
  {
    id: 1,
    image: heroInTuneMain,
    title: "InTune: In sync. In vibe. In tune.",
    subtitle: "Your vibe is the key to your perfect co-living match.",
    cta: "Get Started",
  },
  {
    id: 2,
    image: heroVoiceMatch,
    title: "VoiceMatch: Speak your vibe, match smarter",
    subtitle: "Let your voice reveal your true personality for better matches.",
    cta: "Try VoiceMatch",
  },
  {
    id: 3,
    image: heroMatchMeter,
    title: "MatchMeter: AI scoring that gets you",
    subtitle: "Advanced compatibility algorithms that understand your lifestyle.",
    cta: "See Your Score",
  },
  {
    id: 4,
    image: heroChatterBox,
    title: "ChatterBox: Connect anonymously",
    subtitle: "Chat safely and build connections before revealing your identity.",
    cta: "Start Chatting",
  },
  {
    id: 5,
    image: heroStyleMatch,
    title: "StyleMatch: Decorate your dream room",
    subtitle: "Match with roommates who share your aesthetic and style preferences.",
    cta: "Explore Styles",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in">
                {slide.subtitle}
              </p>
              <Link to="/signup">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-lg px-8 py-4 animate-fade-in"
                >
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-smooth hover-lift"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-smooth hover-lift"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-smooth ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;