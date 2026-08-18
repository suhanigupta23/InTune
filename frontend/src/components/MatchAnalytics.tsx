import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, ScatterChart, Scatter, Area, ComposedChart } from "recharts";

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

interface MatchAnalyticsProps {
  matches: MatchData[];
}

const MatchAnalytics = ({ matches }: MatchAnalyticsProps) => {
  // Prepare data for radar chart - average scores across all matches
  const avgCriteriaData = [
    {
      criteria: "Cleanliness",
      value: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.cleanliness, 0) / matches.length),
      fullMark: 100,
    },
    {
      criteria: "Sleep",
      value: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.sleep_schedule, 0) / matches.length),
      fullMark: 100,
    },
    {
      criteria: "Social",
      value: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.social_habits, 0) / matches.length),
      fullMark: 100,
    },
    {
      criteria: "Lifestyle",
      value: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.lifestyle, 0) / matches.length),
      fullMark: 100,
    },
    {
      criteria: "Food",
      value: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.food, 0) / matches.length),
      fullMark: 100,
    },
  ];

  // Prepare data for match score distribution
  const matchScoreData = matches.map((match, index) => ({
    match: match.anon_id,
    score: match.match_score,
    rank: index + 1,
  }));

  // Enhanced criteria variation data with more visual appeal
  const criteriaVariationData = [
    {
      criteria: "Cleanliness",
      min: Math.min(...matches.map(m => m.criteria_scores.cleanliness)),
      max: Math.max(...matches.map(m => m.criteria_scores.cleanliness)),
      avg: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.cleanliness, 0) / matches.length),
      range: Math.max(...matches.map(m => m.criteria_scores.cleanliness)) - Math.min(...matches.map(m => m.criteria_scores.cleanliness)),
      color: "#8B4513",
    },
    {
      criteria: "Sleep",
      min: Math.min(...matches.map(m => m.criteria_scores.sleep_schedule)),
      max: Math.max(...matches.map(m => m.criteria_scores.sleep_schedule)),
      avg: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.sleep_schedule, 0) / matches.length),
      range: Math.max(...matches.map(m => m.criteria_scores.sleep_schedule)) - Math.min(...matches.map(m => m.criteria_scores.sleep_schedule)),
      color: "#A0522D",
    },
    {
      criteria: "Social",
      min: Math.min(...matches.map(m => m.criteria_scores.social_habits)),
      max: Math.max(...matches.map(m => m.criteria_scores.social_habits)),
      avg: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.social_habits, 0) / matches.length),
      range: Math.max(...matches.map(m => m.criteria_scores.social_habits)) - Math.min(...matches.map(m => m.criteria_scores.social_habits)),
      color: "#CD853F",
    },
    {
      criteria: "Lifestyle",
      min: Math.min(...matches.map(m => m.criteria_scores.lifestyle)),
      max: Math.max(...matches.map(m => m.criteria_scores.lifestyle)),
      avg: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.lifestyle, 0) / matches.length),
      range: Math.max(...matches.map(m => m.criteria_scores.lifestyle)) - Math.min(...matches.map(m => m.criteria_scores.lifestyle)),
      color: "#DEB887",
    },
    {
      criteria: "Food",
      min: Math.min(...matches.map(m => m.criteria_scores.food)),
      max: Math.max(...matches.map(m => m.criteria_scores.food)),
      avg: Math.round(matches.reduce((sum, match) => sum + match.criteria_scores.food, 0) / matches.length),
      range: Math.max(...matches.map(m => m.criteria_scores.food)) - Math.min(...matches.map(m => m.criteria_scores.food)),
      color: "#F4A460",
    },
  ];

  // Create individual user data points for scatter plot
  const scatterData = matches.flatMap((match) => 
    Object.entries(match.criteria_scores).map(([criteria, score], idx) => ({
      x: idx + 1,
      y: score,
      criteria: criteria,
      user: match.anon_id,
      size: match.match_score,
    }))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Compatibility Overview - Radar Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            📊 Compatibility Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={avgCriteriaData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="criteria" 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Radar
                name="Average Score"
                dataKey="value"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Match Score Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            📈 Match Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={matchScoreData}>
              <XAxis 
                dataKey="match" 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--warm-brown))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--warm-brown))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Score Variations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            🎯 Score Distribution & Variations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={criteriaVariationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="criteria" 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'min' ? 'Minimum Score' : 
                  name === 'max' ? 'Maximum Score' : 
                  name === 'avg' ? 'Average Score' :
                  name === 'range' ? 'Score Range' : name
                ]}
              />
              
              {/* Range bars (min to max) */}
              <Bar 
                dataKey="range" 
                fill="url(#rangeGradient)" 
                opacity={0.3}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Average line */}
              <Line
                type="monotone"
                dataKey="avg"
                stroke="hsl(var(--warm-brown))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--warm-brown))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "hsl(var(--accent))" }}
              />
              
              {/* Min and Max dots */}
              <Line
                type="monotone"
                dataKey="min"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
                strokeDasharray="5,5"
              />
              
              <Line
                type="monotone"
                dataKey="max"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                strokeDasharray="5,5"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warm-brown))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--light-beige))" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchAnalytics;