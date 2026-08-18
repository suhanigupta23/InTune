import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, Star, Users, Home, TrendingUp } from "lucide-react";

interface VoiceMatchCardProps {
  title: string;
  description: string;
  isRequired: boolean;
  isOptional?: boolean;
  accuracyBoost?: boolean;
  icon: "users" | "home" | "star";
  onStartChat: () => void;
}

const VoiceMatchCard = ({ 
  title, 
  description, 
  isRequired, 
  isOptional = false, 
  accuracyBoost = false,
  icon,
  onStartChat 
}: VoiceMatchCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="w-8 h-8 text-warm-brown" />;
      case "home":
        return <Home className="w-8 h-8 text-warm-brown" />;
      case "star":
        return <TrendingUp className="w-8 h-8 text-warm-brown" />;
      default:
        return <MessageCircle className="w-8 h-8 text-warm-brown" />;
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-warm-white to-light-cream border border-soft-sand hover:border-warm-brown backdrop-blur-sm ${
      isOptional ? 'opacity-95 hover:opacity-100' : ''
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isRequired && (
          <Badge variant="destructive" className="bg-warm-brown text-warm-white hover:bg-warm-brown-dark">
            Required
          </Badge>
        )}
        {isOptional && (
          <Badge variant="secondary" className="bg-soft-sand text-warm-brown border border-warm-brown">
            Optional
          </Badge>
        )}
        {accuracyBoost && (
          <Badge variant="outline" className="ml-2 border-success-green text-success-green bg-success-green/10">
            <Star className="w-3 h-3 mr-1" />
            +25% Accuracy
          </Badge>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-light-cream border border-soft-sand">
            {getIcon()}
          </div>
          <div>
            <CardTitle className="text-xl text-warm-brown font-bold">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-text text-sm leading-relaxed">
          {description}
        </p>

        {/* Assistant Signature */}
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-light-cream to-creamy-beige rounded-lg border border-soft-sand shadow-sm">
          <div className="w-8 h-8 rounded-full bg-warm-brown flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-warm-white" />
          </div>
          <div className="text-sm">
            <div className="font-semibold text-warm-brown">AI Assistant</div>
            <div className="text-muted-text text-xs">Ready to help you match</div>
          </div>
        </div>

        {/* Start Chat Button */}
        <Button 
          onClick={onStartChat}
          className="w-full bg-warm-brown hover:bg-warm-brown-dark text-warm-white font-semibold transition-all duration-200 hover:shadow-lg"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Start Voice Matching
        </Button>

        {isOptional && (
          <p className="text-xs text-muted-text text-center italic">
            Complete this for better matching accuracy
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceMatchCard;