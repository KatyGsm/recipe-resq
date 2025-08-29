import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ScanLine, Plus, ChefHat, ShoppingCart, Clock } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Camera,
      title: "Scan Receipt",
      description: "Auto-add groceries to inventory",
      color: "bg-gradient-primary",
      textColor: "text-primary-foreground"
    },
    {
      icon: ScanLine,
      title: "Check Expiry",
      description: "Scan food packaging dates",
      color: "bg-gradient-secondary",
      textColor: "text-secondary-foreground"
    },
    {
      icon: Plus,
      title: "Add Item",
      description: "Manually add to inventory",
      color: "bg-accent",
      textColor: "text-accent-foreground"
    },
    {
      icon: ChefHat,
      title: "Find Recipes",
      description: "Cook with available ingredients",
      color: "bg-gradient-primary",
      textColor: "text-primary-foreground"
    },
    {
      icon: ShoppingCart,
      title: "Smart List",
      description: "AI-powered grocery suggestions",
      color: "bg-muted",
      textColor: "text-muted-foreground"
    },
    {
      icon: Clock,
      title: "Meal Planner",
      description: "Plan your weekly meals",
      color: "bg-gradient-secondary",
      textColor: "text-secondary-foreground"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`
                glass-card-hover h-auto p-4 flex-col gap-3 hover-lift
                transition-all duration-300 group
              `}
            >
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center ${action.color}
                group-hover:scale-110 transition-transform duration-300
                ${action.color.includes('gradient') ? 'neon-glow' : ''}
              `}>
                <action.icon className={`w-6 h-6 ${action.textColor}`} />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm mb-1">{action.title}</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;