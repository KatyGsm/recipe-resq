import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Clock, Users, ChefHat, TrendingDown } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* App Logo/Title */}
          <div className="mb-8 animate-fade-in">
            <Badge variant="secondary" className="glass-card mb-6 px-6 py-2 text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-primary-glow" />
              AI-Powered Food Assistant
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="text-gradient-primary">FRIDGE</span>{" "}
              <span className="text-gradient-secondary">CHEF</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Reduce food waste, cook smarter, and save money with AI-powered recipe suggestions 
              and intelligent grocery planning.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-up">
            <Card className="glass-card-hover p-6 text-left">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 neon-glow">
                <Camera className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Scanning</h3>
              <p className="text-muted-foreground">Scan receipts and food items to track expiry dates automatically</p>
            </Card>

            <Card className="glass-card-hover p-6 text-left">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expiry Alerts</h3>
              <p className="text-muted-foreground">Get timely reminders before your food expires</p>
            </Card>

            <Card className="glass-card-hover p-6 text-left">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Recipe Magic</h3>
              <p className="text-muted-foreground">Transform fridge contents into delicious meals</p>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 neon-glow px-8 py-4 text-lg font-semibold"
              onClick={() => navigate("/app")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Cooking Smart
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="glass-card hover-glow px-8 py-4 text-lg"
              onClick={() => navigate("/auth")}
            >
              <Users className="w-5 h-5 mr-2" />
              Sign in / Sign up
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">40%</div>
              <div className="text-sm text-muted-foreground">Food Waste Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-secondary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Smart Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">€200</div>
              <div className="text-sm text-muted-foreground">Avg. Monthly Savings</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-4 h-4 bg-primary-glow rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-16 animate-float" style={{animationDelay: '1s'}}>
          <div className="w-6 h-6 bg-secondary rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{animationDelay: '2s'}}>
          <div className="w-3 h-3 bg-accent/60 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default Index;