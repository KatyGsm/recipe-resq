import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gradient-primary mb-4 animate-pulse-glow">
            404
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center neon-glow animate-float">
              <ChefHat className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">Recipe Not Found!</h2>
          <p className="text-muted-foreground mb-4">
            Looks like this page went bad before we could serve it. 
            Let's get you back to cooking something delicious!
          </p>
          
          <div className="text-sm text-muted-foreground/80 mb-4">
            Searched for: <code className="bg-muted/50 px-2 py-1 rounded text-xs">
              {location.pathname}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="glass-card hover-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-primary hover:scale-105 transition-all duration-300 neon-glow"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Kitchen
          </Button>
        </div>

        {/* Fun Floating Elements */}
        <div className="absolute top-20 left-10 animate-float opacity-60">
          <div className="text-2xl">🥕</div>
        </div>
        <div className="absolute top-40 right-16 animate-float opacity-40" style={{animationDelay: '1s'}}>
          <div className="text-2xl">🍎</div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float opacity-50" style={{animationDelay: '2s'}}>
          <div className="text-2xl">🥛</div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
