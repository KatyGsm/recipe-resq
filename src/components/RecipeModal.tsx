import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, ChefHat, Users, Star, CheckCircle } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  time: number;
  difficulty: string;
  ingredients: number;
  image: string;
  tags: string[];
  instructions?: string[];
  ingredientsList?: string[];
  servings?: number;
  description?: string;
}

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal = ({ recipe, isOpen, onClose }: RecipeModalProps) => {
  if (!recipe) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400 border-green-400/50 bg-green-400/10";
      case "Medium": return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
      case "Hard": return "text-red-400 border-red-400/50 bg-red-400/10";
      default: return "text-muted-foreground border-border bg-muted/10";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{recipe.image}</div>
            <div className="flex-1">
              <DialogTitle className="text-2xl text-gradient-primary mb-2">
                {recipe.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Recipe Info Bar */}
        <div className="flex items-center gap-6 py-4 bg-card/50 rounded-lg px-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{recipe.time} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-secondary" />
            <span>{recipe.servings || 4} servings</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ChefHat className="w-4 h-4 text-accent" />
            <span>{recipe.ingredients} ingredients</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}
          >
            {recipe.difficulty}
          </Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm">4.8</span>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <div className="mb-6">
            <p className="text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredientsList && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Ingredients
            </h3>
            <div className="grid gap-2">
              {recipe.ingredientsList.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 py-2 px-3 bg-card/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            Cooking Instructions
          </h3>
          <div className="space-y-4">
            {recipe.instructions?.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 py-1">
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Detailed cooking instructions will be available soon!</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button 
            onClick={onClose}
            variant="outline" 
            className="flex-1"
          >
            Close
          </Button>
          <Button 
            className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 neon-glow"
          >
            Start Cooking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;