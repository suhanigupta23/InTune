import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Neha Sharma",
    role: "Computer Science Student",
    image: "👩‍💻",
    quote: "InTune helped me find not just a roommate, but my best friend! The voice matching was so accurate.",
    rating: 5,
    highlight: "Found her best friend",
  },
  {
    name: "Parth Mehta",
    role: "Engineering Student",
    image: "👨‍🎓",
    quote: "Finally found someone who respects quiet study hours. I can actually get proper sleep now!",
    rating: 5,
    highlight: "Finally got sleep",
  },
  {
    name: "Priya Patel",
    role: "MBA Student",
    image: "👩‍🎓",
    quote: "The StyleMatch feature helped us create the most beautiful dorm room. We're always getting compliments!",
    rating: 5,
    highlight: "Dream room achieved",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-accent-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real students sharing their InTune experiences and how they found their perfect matches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card-gradient border-border/50 hover-lift relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-accent/30">
                <Quote className="w-8 h-8" />
              </div>
              
              <CardContent className="pt-6">
                {/* Profile */}
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.image}</div>
                  <div>
                    <h3 className="font-semibold text-primary">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Highlight Badge */}
                <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  ✨ {testimonial.highlight}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;