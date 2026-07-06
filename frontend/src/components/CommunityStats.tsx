import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stats = [
  {
    number: "2,847",
    label: "Successful Matches"
  },
  {
    number: "486", 
    label: "Photos Shared"
  },
  {
    number: "95%",
    label: "Satisfaction Rate"
  },
  {
    number: "50+",
    label: "Cities Covered"
  }
];

const CommunityStats = () => {
  return (
    <section className="py-20 bg-warm-beige/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-lg text-warm-brown font-medium mb-4">
            Ready to find your perfect roommate match?
          </p>
          <Button size="lg" className="bg-warm-brown hover:bg-warm-brown/90 text-white">
            Start Your Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-warm-brown mb-4">
            Our Growing Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of women who have found their perfect roommate matches through InTune
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-warm-brown mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityStats;