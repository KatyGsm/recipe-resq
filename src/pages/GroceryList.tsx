import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ShoppingCart, Plus, Zap, Users, Clock } from "lucide-react";
import { useState } from "react";

const GroceryList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: "Milk", category: "Dairy", quantity: "1L", checked: false, predicted: true, addedBy: "System" },
    { id: 2, name: "Bread", category: "Bakery", quantity: "1 loaf", checked: false, predicted: true, addedBy: "System" },
    { id: 3, name: "Eggs", category: "Dairy", quantity: "12 pack", checked: true, predicted: false, addedBy: "You" },
    { id: 4, name: "Bananas", category: "Fruits", quantity: "6 pieces", checked: false, predicted: false, addedBy: "Sarah" },
    { id: 5, name: "Ground Beef", category: "Meat", quantity: "500g", checked: false, predicted: true, addedBy: "System" },
    { id: 6, name: "Onions", category: "Vegetables", quantity: "3 pieces", checked: false, predicted: false, addedBy: "You" }
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const categories = [...new Set(items.map(item => item.category))];
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked).length;

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
              <h1 className="text-xl font-bold">Smart Grocery List</h1>
              <p className="text-sm text-muted-foreground">
                {checkedItems}/{totalItems} completed
              </p>
            </div>
          </div>
          <Button className="bg-gradient-primary neon-glow">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center neon-glow">
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{items.filter(i => i.predicted).length}</div>
                  <div className="text-sm text-muted-foreground">AI Predicted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm text-muted-foreground">Collaborators</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping List */}
        <div className="space-y-4">
          {categories.map(category => (
            <Card key={category} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{category}</span>
                  <Badge variant="outline">
                    {items.filter(item => item.category === category).length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items
                    .filter(item => item.category === category)
                    .map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                          item.checked 
                            ? 'bg-muted/30 opacity-60' 
                            : 'hover:bg-muted/20 glass-card-hover'
                        }`}
                      >
                        <Checkbox 
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                              {item.name}
                            </span>
                            {item.predicted && (
                              <Badge variant="outline" className="text-xs bg-accent/20 text-accent border-accent/50">
                                <Zap className="w-3 h-3 mr-1" />
                                Predicted
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{item.quantity}</span>
                            <span>•</span>
                            <span>Added by {item.addedBy}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="hover-glow">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Add Suggestions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Suggested Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Apples", "Chicken Breast", "Rice", "Tomatoes", "Pasta"].map(suggestion => (
                <Button 
                  key={suggestion} 
                  variant="outline" 
                  size="sm" 
                  className="glass-card-hover"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroceryList;