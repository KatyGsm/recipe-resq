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
import GameStats from "./GameStats";
import { ReceiptUpload } from "./ReceiptUpload";
import { RecentReceipts } from "./RecentReceipts";
import { ProductUpload } from "./ProductUpload";
import { ExpiringProducts } from "./ExpiringProducts";
import { ExpiryNotifications } from "./ExpiryNotifications";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
      tags: ["Breakfast", "Healthy"]
    },
    {
      id: 2,
      title: "Beef Tacos",
      time: 25,
      difficulty: "Medium",
      ingredients: 6,
      image: "🌮",
      tags: ["Dinner", "Mexican"]
    },
    {
      id: 3,
      title: "Milk Pancakes",
      time: 15,
      difficulty: "Easy",
      ingredients: 5,
      image: "🥞",
      tags: ["Breakfast", "Sweet"]
    }
  ];

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
              <h1 className="text-xl font-bold text-gradient-primary">FRIDGE CHEF</h1>
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
            <div className="grid md:grid-cols-2 gap-6">
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
                    Based on your fridge
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {suggestedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
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
    </div>
  );
};

export default Dashboard;