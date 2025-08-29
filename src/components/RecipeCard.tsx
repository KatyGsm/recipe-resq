import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Star, Play } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  time: number;
  difficulty: string;
  ingredients: number;
  image: string;
  tags: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400 border-green-400/50 bg-green-400/10";
      case "Medium": return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
      case "Hard": return "text-red-400 border-red-400/50 bg-red-400/10";
      default: return "text-muted-foreground border-border bg-muted/10";
    }
  };

  return (
    <Card className="glass-card-hover group">
      <CardContent className="p-0">
        {/* Recipe Image/Emoji */}
        <div className="relative bg-gradient-card p-6 rounded-t-lg">
          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {recipe.image}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="glass-card text-xs">
              <Star className="w-3 h-3 mr-1" />
              4.8
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Recipe Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.time}m
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              {recipe.ingredients} items
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}
            >
              {recipe.difficulty}
            </Badge>

            <Button 
              size="sm" 
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 neon-glow"
            >
              <Play className="w-3 h-3 mr-1" />
              Cook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;