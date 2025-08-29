import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Flame, Trophy, Target, TrendingUp } from "lucide-react";

const GameStats = () => {
  const currentXP = 1250;
  const nextLevelXP = 1500;
  const progressPercent = (currentXP / nextLevelXP) * 100;
  const currentLevel = 8;
  const streakDays = 12;

  const badges = [
    { name: "Waste Warrior", icon: "🛡️", color: "text-green-400" },
    { name: "Recipe Master", icon: "👨‍🍳", color: "text-primary" },
    { name: "Smart Shopper", icon: "🛒", color: "text-secondary" },
  ];

  const achievements = [
    { name: "Zero Waste Week", progress: 60, total: 100 },
    { name: "Recipe Explorer", progress: 85, total: 100 },
    { name: "Smart Scanner", progress: 40, total: 100 },
  ];

  return (
    <Card className="glass-card border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent animate-pulse-glow" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level & XP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center border-2 border-accent/50">
              <span className="text-lg font-bold text-accent">{currentLevel}</span>
            </div>
            <div>
              <div className="font-semibold">Level {currentLevel}</div>
              <div className="text-xs text-muted-foreground">Eco Chef</div>
            </div>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/50">
            {currentXP} XP
          </Badge>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
            <span className="text-accent font-medium">{nextLevelXP - currentXP} XP to go</span>
          </div>
          <Progress value={progressPercent} className="h-2">
            <div className="h-full bg-gradient-primary progress-glow rounded-full transition-all duration-500" 
                 style={{ width: `${progressPercent}%` }} />
          </Progress>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between p-3 bg-gradient-card rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-medium">Streak</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-400">{streakDays}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>
        </div>

        {/* Badges */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            Recent Badges
          </div>
          <div className="flex gap-2">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className="flex-1 glass-card p-2 text-center hover-lift cursor-pointer"
              >
                <div className="text-lg mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Challenges */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Active Challenges
          </div>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{achievement.name}</span>
                  <span className="text-primary font-medium">
                    {achievement.progress}%
                  </span>
                </div>
                <Progress value={achievement.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-gradient-primary/10 border border-primary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">This Week's Goal</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Save €20 by using expiring ingredients
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">€14 / €20</span>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              70% complete
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;