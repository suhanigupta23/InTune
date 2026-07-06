import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Key, User, Heart } from "lucide-react";

interface MatchData {
  anon_id: string;
  match_score: number;
  criteria_scores: {
    cleanliness: number;
    sleep_schedule: number;
    social_habits: number;
    lifestyle: number;
    food: number;
  };
  chatroom_passkey: string;
}

interface MatchCardProps {
  match: MatchData;
  rank: number;
  onMessage: (passkey: string) => void;
  onLike?: (passkey: string) => void;
}

const MatchCard = ({ match, rank, onMessage, onLike }: MatchCardProps) => {
  const criteriaIcons = {
    cleanliness: "🧼",
    sleep_schedule: "🌙",
    social_habits: "🗣️",
    lifestyle: "🧘",
    food: "🍽️",
  };

  const criteriaLabels = {
    cleanliness: "Cleanliness",
    sleep_schedule: "Sleep",
    social_habits: "Social",
    lifestyle: "Lifestyle",
    food: "Food",
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 font-bold";
    if (score >= 60) return "text-amber-800 font-bold";
    return "text-gray-700 font-bold";
  };

  const getRankBadge = (rank: number) => {
    const badges = {
      1: { text: "🥇 Best Match", variant: "default" as const },
      2: { text: "🥈 Great Match", variant: "secondary" as const },
      3: { text: "🥉 Good Match", variant: "outline" as const },
    };
    return badges[rank as keyof typeof badges] || { text: `#${rank} Match`, variant: "outline" as const };
  };

  return (
    <Card className="shadow-md border border-soft-sand hover:shadow-lg transition-all duration-300 bg-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-light-cream border border-soft-sand rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-warm-brown" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-warm-brown">{match.anon_id}</h3>
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-muted-text" />
                <span className="text-sm text-muted-text">Anonymous ID</span>
              </div>
            </div>
          </div>
          <Badge {...getRankBadge(rank)} className="px-3 py-1 bg-warm-brown text-white hover:bg-warm-brown-dark">
            {getRankBadge(rank).text}
          </Badge>
        </div>

        {/* Overall Match Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-warm-brown">Overall Compatibility</span>
            <span className={`text-xl font-extrabold ${getScoreColor(match.match_score)}`}>
              {match.match_score}%
            </span>
          </div>
          <Progress 
            value={match.match_score} 
            className="h-3 bg-soft-sand"
          />
        </div>

        {/* Criteria Breakdown - Fully visible, high-contrast, no hidden hover */}
        <div className="space-y-3 mb-6 bg-light-cream/40 p-4 rounded-xl border border-soft-sand/50">
          {Object.entries(match.criteria_scores).map(([criterion, score]) => (
            <div key={criterion} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{criteriaIcons[criterion as keyof typeof criteriaIcons]}</span>
                <span className="text-sm font-bold text-warm-brown">
                  {criteriaLabels[criterion as keyof typeof criteriaLabels]}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 h-2 bg-soft-sand rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-amber-600' : 'bg-gray-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-sm font-extrabold ${getScoreColor(score)} min-w-[3.2rem] text-right`}>
                  {score}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Beautifully colored, high-contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Button 
            variant="outline" 
            className="w-full border-amber-800 text-amber-900 hover:bg-amber-50 font-bold shadow-sm"
            onClick={() => onMessage(match.chatroom_passkey)}
          >
            <MessageCircle className="h-4 w-4 mr-2 text-amber-800" />
            Chat Anonymously
          </Button>

          {onLike && (
            <Button 
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold flex items-center justify-center gap-2 shadow-md"
              onClick={() => onLike(match.chatroom_passkey)}
            >
              <Heart className="h-4 w-4 fill-white text-white" />
              Swipe Right
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;