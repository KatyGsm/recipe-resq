import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, ChefHat, Star, Play, Timer, CheckCircle } from "lucide-react";
import { useState } from "react";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Mock recipe data - in real app, fetch by ID
  const recipe = {
    id: parseInt(id || '1'),
    title: "Banana Smoothie Bowl",
    time: 10,
    difficulty: "Easy",
    ingredients: 4,
    image: "🥣",
    tags: ["Breakfast", "Healthy"],
    description: "A nutritious and delicious smoothie bowl perfect for breakfast",
    servings: 2,
    rating: 4.8,
    ingredients_list: [
      { name: "Bananas", amount: "2 large", available: true },
      { name: "Greek Yogurt", amount: "1 cup", available: true },
      { name: "Granola", amount: "1/4 cup", available: false },
      { name: "Honey", amount: "2 tbsp", available: true }
    ],
    steps: [
      "Freeze bananas for at least 2 hours beforehand",
      "Add frozen bananas and yogurt to blender",
      "Blend until smooth and creamy",
      "Pour into bowl and add toppings",
      "Serve immediately and enjoy!"
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400 border-green-400/50 bg-green-400/10";
      case "Medium": return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
      case "Hard": return "text-red-400 border-red-400/50 bg-red-400/10";
      default: return "text-muted-foreground border-border bg-muted/10";
    }
  };

  const handleStartCooking = () => {
    setIsStarted(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="hover-glow">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{recipe.title}</h1>
            <p className="text-sm text-muted-foreground">Recipe Details</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Recipe Hero */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="text-8xl">{recipe.image}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{recipe.title}</h1>
                  <Badge variant="secondary" className="glass-card">
                    <Star className="w-3 h-3 mr-1" />
                    {recipe.rating}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} servings
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    {recipe.ingredients} ingredients
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                  {!isStarted ? (
                    <Button onClick={handleStartCooking} className="bg-gradient-primary neon-glow">
                      <Play className="w-4 h-4 mr-2" />
                      Start Cooking
                    </Button>
                  ) : (
                    <Badge className="bg-accent/20 text-accent border-accent/50">
                      <Timer className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ingredients */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipe.ingredients_list.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${ingredient.available ? 'text-green-400' : 'text-muted-foreground'}`} />
                      <span className={ingredient.available ? '' : 'line-through opacity-50'}>
                        {ingredient.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{ingredient.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Instructions
                  {isStarted && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {recipe.steps.length}
                      </span>
                      <Progress value={(currentStep + 1) / recipe.steps.length * 100} className="w-24" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStarted ? (
                  <div className="space-y-4">
                    <Card className="glass-card border-accent/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                            {currentStep + 1}
                          </div>
                          <p className="text-lg">{recipe.steps[currentStep]}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={prevStep} 
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        onClick={nextStep} 
                        disabled={currentStep === recipe.steps.length - 1}
                        className="bg-gradient-primary"
                      >
                        {currentStep === recipe.steps.length - 1 ? 'Complete!' : 'Next Step'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipe.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium text-xs">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;