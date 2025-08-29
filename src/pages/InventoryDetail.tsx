import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, AlertTriangle, Clock, CheckCircle, Edit } from "lucide-react";

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock inventory item data - in real app, fetch by ID
  const item = {
    id: parseInt(id || '1'),
    name: "Milk",
    category: "Dairy",
    brand: "Organic Valley",
    quantity: "1L",
    expiresIn: 2,
    expiryDate: "2024-03-15",
    location: "Fridge - Main Shelf",
    addedDate: "2024-03-10",
    addedBy: "Receipt Scan",
    nutritionInfo: {
      calories: "150 per 240ml",
      protein: "8g",
      fat: "8g",
      carbs: "12g"
    },
    storage_tips: [
      "Keep refrigerated at 4°C or below",
      "Store in original container",
      "Use within 7 days of opening"
    ],
    usage_suggestions: [
      "Perfect for morning cereal",
      "Great for baking cookies",
      "Use in smoothies"
    ]
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "text-destructive border-destructive/50 bg-destructive/10";
    if (days <= 3) return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
    return "text-green-400 border-green-400/50 bg-green-400/10";
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 1) return AlertTriangle;
    if (days <= 3) return Clock;
    return CheckCircle;
  };

  const UrgencyIcon = getUrgencyIcon(item.expiresIn);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="hover-glow">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{item.name}</h1>
              <p className="text-sm text-muted-foreground">Inventory Details</p>
            </div>
          </div>
          <Button variant="outline" className="hover-glow">
            <Edit className="w-4 h-4 mr-2" />
            Edit Item
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Item Overview */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center text-4xl neon-glow">
                🥛
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{item.name}</h1>
                  <Badge variant="outline" className={getUrgencyColor(item.expiresIn)}>
                    <UrgencyIcon className="w-3 h-3 mr-1" />
                    {item.expiresIn === 0 ? "Today" : 
                     item.expiresIn === 1 ? "1 day" : 
                     `${item.expiresIn} days`}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {item.expiryDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{item.category}</Badge>
                  <Badge variant="outline">{item.brand}</Badge>
                  <Badge variant="outline">{item.quantity}</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <Button className="bg-gradient-primary neon-glow">
                    Use Now
                  </Button>
                  <Button variant="outline" className="hover-glow">
                    Find Recipes
                  </Button>
                  <Button variant="outline" className="hover-glow">
                    Add to List
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Item Information */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added Date:</span>
                  <span>{item.addedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added By:</span>
                  <span>{item.addedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{item.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Nutrition Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories:</span>
                  <span>{item.nutritionInfo.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein:</span>
                  <span>{item.nutritionInfo.protein}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat:</span>
                  <span>{item.nutritionInfo.fat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs:</span>
                  <span>{item.nutritionInfo.carbs}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips and Suggestions */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Storage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.storage_tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Usage Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.usage_suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-accent rounded-full mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/50">
              <CardHeader>
                <CardTitle className="text-accent">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover-glow">
                  Mark as Used
                </Button>
                <Button variant="outline" className="w-full justify-start hover-glow">
                  Extend Expiry Date
                </Button>
                <Button variant="outline" className="w-full justify-start hover-glow">
                  Move to Different Location
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10">
                  Mark as Expired
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetail;