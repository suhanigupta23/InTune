import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import roommatesHappy1 from "@/assets/roommates-happy-1.jpg";
import roommatesHappy2 from "@/assets/roommates-happy-2.jpg";
import roommatesHappy3 from "@/assets/roommates-happy-3.jpg";
import roommatesHappy4 from "@/assets/roommates-happy-4.jpg";

const stories = [
  {
    id: 1,
    names: "Sarah & Emma",
    location: "San Francisco, CA",
    timeAgo: "Matched 3 months ago",
    quote: "After months of searching, we found each other through InTune! Our shared love for yoga and weekend brunches made us instant friends.",
    image: roommatesHappy1,
  },
  {
    id: 2,
    names: "Maya & Zoe",
    location: "New York, NY", 
    timeAgo: "Matched 6 months ago",
    quote: "Perfect match! We both love cooking and trying new recipes. Our kitchen adventures have created the best memories.",
    image: roommatesHappy2,
  },
  {
    id: 3,
    names: "Aria & Luna",
    location: "Austin, TX",
    timeAgo: "Matched 4 months ago", 
    quote: "Study buddies turned best friends! InTune matched us based on our academic goals and quiet lifestyle preferences.",
    image: roommatesHappy3,
  },
  {
    id: 4,
    names: "Chloe & Mia",
    location: "Seattle, WA",
    timeAgo: "Matched 2 months ago",
    quote: "Movie nights, deep conversations, and endless laughter. We couldn't have asked for a better roommate match!",
    image: roommatesHappy4,
  },
];

const SuccessStories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-warm-brown mb-4">Success Stories</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how InTune has helped women find their perfect roommate matches. 
            These are real stories from our community members who found their ideal living companions.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {stories.map((story) => (
                <div key={story.id} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] min-w-0">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={story.image} 
                        alt={`${story.names} success story`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{story.location}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-warm-brown mb-2">{story.names}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{story.timeAgo}</p>
                      
                      <div className="relative">
                        <Quote className="w-5 h-5 text-warm-brown/30 absolute -top-1 -left-1" />
                        <blockquote className="text-foreground/80 italic pl-6">
                          "{story.quote}"
                        </blockquote>
                      </div>
                      
                      <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-100">
                        Perfect Match Found
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;