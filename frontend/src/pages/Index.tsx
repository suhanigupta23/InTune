import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import FeatureCards from "@/components/FeatureCards";
import UserJourney from "@/components/UserJourney";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />
      <FeatureCards />
      <UserJourney />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
