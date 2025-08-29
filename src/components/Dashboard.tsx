import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Clock, 
  ChefHat, 
  ShoppingCart, 
  User, 
  Bell,
  TrendingUp,
  Zap,
  Star,
  Apple,
  Milk,
  Beef
} from "lucide-react";
import { format } from "date-fns";
import QuickActions from "./QuickActions";
import InventoryCard from "./InventoryCard";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import GameStats from "./GameStats";
import { ReceiptUpload } from "./ReceiptUpload";
import { RecentReceipts } from "./RecentReceipts";
import { ProductUpload } from "./ProductUpload";
import { ExpiringProducts } from "./ExpiringProducts";
import { ExpiryNotifications } from "./ExpiryNotifications";
import { FridgeScanner } from "./FridgeScanner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [fridgeRecipes, setFridgeRecipes] = useState<any[]>([]);

  const handleRecipeClick = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleFridgeAnalyzed = (analysisData: any) => {
    console.log('Fridge analysis received:', analysisData);
    
    // Transform AI recipes to match our recipe format
    if (analysisData.recipe_suggestions?.recipes) {
      const transformedRecipes = analysisData.recipe_suggestions.recipes.map((aiRecipe: any, index: number) => ({
        id: Date.now() + index, // Generate unique ID
        title: aiRecipe.name,
        time: parseInt(aiRecipe.prep_time) || 30,
        difficulty: aiRecipe.difficulty === 'easy' ? 'Easy' : 
                   aiRecipe.difficulty === 'medium' ? 'Medium' : 
                   aiRecipe.difficulty === 'hard' ? 'Hard' : 'Medium',
        ingredients: aiRecipe.ingredients_used?.length || 5,
        image: getRecipeEmoji(aiRecipe.meal_type, aiRecipe.name),
        tags: [
          aiRecipe.meal_type ? aiRecipe.meal_type.charAt(0).toUpperCase() + aiRecipe.meal_type.slice(1) : 'Main',
          'Fresh Ingredients'
        ],
        servings: 4,
        description: aiRecipe.description || `A delicious ${aiRecipe.name} made with fresh ingredients from your fridge.`,
        ingredientsList: [
          ...(aiRecipe.ingredients_used || []),
          ...(aiRecipe.missing_ingredients?.map((ing: string) => `${ing} (to buy)`) || [])
        ],
        instructions: aiRecipe.instructions || [
          "Gather all your ingredients",
          "Follow the preparation steps",
          "Cook according to recipe instructions",
          "Enjoy your meal!"
        ]
      }));
      
      setFridgeRecipes(transformedRecipes);
    }
  };

  const getRecipeEmoji = (mealType: string, recipeName: string) => {
    // Simple emoji mapping based on meal type or recipe name
    const name = recipeName.toLowerCase();
    const type = mealType?.toLowerCase();
    
    if (name.includes('soup')) return '🍲';
    if (name.includes('salad')) return '🥗';
    if (name.includes('pasta')) return '🍝';
    if (name.includes('rice')) return '🍚';
    if (name.includes('sandwich')) return '🥪';
    if (name.includes('smoothie')) return '🥤';
    if (name.includes('pancake')) return '🥞';
    if (name.includes('taco')) return '🌮';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    
    if (type === 'breakfast') return '🍳';
    if (type === 'lunch') return '🍽️';
    if (type === 'dinner') return '🍖';
    if (type === 'snack') return '🍿';
    if (type === 'dessert') return '🍰';
    
    return '🍽️'; // Default
  };

  // Mock data for demo
  const expiringItems = [
    { id: 1, name: "Milk", category: "Dairy", expiresIn: 2, icon: Milk, color: "text-blue-400" },
    { id: 2, name: "Bananas", category: "Fruits", expiresIn: 3, icon: Apple, color: "text-yellow-400" },
    { id: 3, name: "Ground Beef", category: "Meat", expiresIn: 1, icon: Beef, color: "text-red-400" },
  ];

  const suggestedRecipes = [
    {
      id: 1,
      title: "Banana Smoothie Bowl",
      time: 10,
      difficulty: "Easy",
      ingredients: 4,
      image: "🥣",
      tags: ["Breakfast", "Healthy"],
      servings: 2,
      description: "A nutritious and delicious smoothie bowl packed with fresh bananas, perfect for a healthy breakfast or snack.",
      ingredientsList: [
        "2 ripe bananas, frozen",
        "1/2 cup milk of choice",
        "1 tbsp honey or maple syrup",
        "1/4 cup granola for topping",
        "Fresh berries for topping",
        "Chia seeds (optional)"
      ],
      instructions: [
        "Add frozen bananas and milk to a blender.",
        "Blend until smooth and creamy, adding more milk if needed.",
        "Pour the smoothie into a bowl.",
        "Top with granola, fresh berries, and chia seeds.",
        "Serve immediately and enjoy your healthy breakfast!"
      ]
    },
    {
      id: 2,
      title: "Beef Tacos",
      time: 25,
      difficulty: "Medium",
      ingredients: 6,
      image: "🌮",
      tags: ["Dinner", "Mexican"],
      servings: 4,
      description: "Flavorful beef tacos with seasoned ground beef, fresh vegetables, and all your favorite toppings.",
      ingredientsList: [
        "1 lb ground beef",
        "1 packet taco seasoning",
        "8 taco shells",
        "1 cup shredded lettuce",
        "1 cup diced tomatoes",
        "1 cup shredded cheese",
        "Sour cream and salsa for serving"
      ],
      instructions: [
        "Heat a large skillet over medium-high heat.",
        "Add ground beef and cook, breaking it apart, until browned (about 5-7 minutes).",
        "Drain excess fat and add taco seasoning with 1/4 cup water.",
        "Simmer for 2-3 minutes until sauce thickens.",
        "Warm taco shells according to package directions.",
        "Fill shells with beef mixture and top with lettuce, tomatoes, and cheese.",
        "Serve with sour cream and salsa on the side."
      ]
    },
    {
      id: 3,
      title: "Milk Pancakes",
      time: 15,
      difficulty: "Easy",
      ingredients: 5,
      image: "🥞",
      tags: ["Breakfast", "Sweet"],
      servings: 3,
      description: "Fluffy, golden pancakes made with fresh milk for the perfect weekend breakfast treat.",
      ingredientsList: [
        "1 cup all-purpose flour",
        "1 cup milk",
        "1 large egg",
        "2 tbsp sugar",
        "2 tsp baking powder",
        "1/2 tsp salt",
        "2 tbsp butter, melted"
      ],
      instructions: [
        "In a large bowl, whisk together flour, sugar, baking powder, and salt.",
        "In another bowl, combine milk, egg, and melted butter.",
        "Pour wet ingredients into dry ingredients and stir until just combined (don't overmix).",
        "Heat a griddle or large skillet over medium heat and lightly grease.",
        "Pour 1/4 cup batter for each pancake onto the griddle.",
        "Cook until bubbles form on surface, then flip and cook until golden brown.",
        "Serve hot with butter and maple syrup."
      ]
    }
  ];

  // Combine default recipes with fridge-generated recipes
  const allRecipes = [...fridgeRecipes, ...suggestedRecipes];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center neon-glow">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">SCHWARZ SMART KITCHEN</h1>
              <p className="text-sm text-muted-foreground">Smart Cooking Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Current Date Display */}
            <div className="glass-card px-3 py-2 text-sm font-medium text-foreground">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </div>
            
            <Button variant="ghost" size="sm" className="hover-glow">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="hover-glow">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Urgent Expiry Notifications */}
        <div className="mb-6">
          <ExpiryNotifications />
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome & Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Welcome Back!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You've saved €45 this week by reducing food waste!
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-gradient-primary">87%</div>
                      <div className="text-sm text-muted-foreground">Food Usage</div>
                    </div>
                    <Progress value={87} className="flex-1" />
                  </div>
                </CardContent>
              </Card>

              <GameStats />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Smart Scanning Tools */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Receipt Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReceiptUpload onReceiptProcessed={() => {
                    // Could refresh expiring items or inventory here
                  }} />
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-secondary" />
                    Product Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductUpload onProductAdded={() => {
                    // Could refresh expiring products here
                  }} />
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-accent" />
                    Fridge Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FridgeScanner onFridgeAnalyzed={handleFridgeAnalyzed} />
                </CardContent>
              </Card>
            </div>

            {/* Expiring Products */}
            <ExpiringProducts />

            {/* Suggested Recipes */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Suggested Recipes
                  <Badge variant="secondary" className="ml-auto">
                    {fridgeRecipes.length > 0 ? 'From your fridge' : 'Based on your fridge'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {allRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={() => handleRecipeClick(recipe)}
                    />
                  ))}
                  {allRecipes.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Take a photo of your fridge to get personalized recipe suggestions!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Receipts */}
            <RecentReceipts />

            {/* Grocery List Preview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="w-5 h-5 text-secondary" />
                  Smart List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Milk</span>
                    <Badge variant="outline" className="text-xs">Predicted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bread</span>
                    <Badge variant="outline" className="text-xs">Predicted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eggs</span>
                    <Badge variant="outline" className="text-xs">Low stock</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 hover-glow">
                  View Full List
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-accent" />
                  Smart Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Store bananas separately from other fruits to prevent over-ripening!
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent" />
                    <span className="text-xs text-accent">+5 XP for learning</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card className="glass-card border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-accent" />
                  Weekly Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Zero Waste Week</p>
                  <p className="text-xs text-muted-foreground">
                    Use all ingredients before they expire
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={60} className="flex-1" />
                    <span className="text-xs">3/5 days</span>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-accent/20 text-accent border-accent/50">
                      🏆 +50 XP Reward
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;