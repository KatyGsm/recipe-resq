import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  expiresIn: number;
  icon: LucideIcon;
  color: string;
}

interface InventoryCardProps {
  item: InventoryItem;
}

const InventoryCard = ({ item }: InventoryCardProps) => {
  const navigate = useNavigate();
  
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
    <Card 
      className={`glass-card-hover border cursor-pointer ${getUrgencyColor(item.expiresIn)}`}
      onClick={() => navigate(`/app/inventory/${item.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
          </div>
          <UrgencyIcon className={`w-4 h-4 ${getUrgencyColor(item.expiresIn).split(' ')[0]}`} />
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${getUrgencyColor(item.expiresIn)}`}>
            {item.expiresIn === 0 ? "Today" : 
             item.expiresIn === 1 ? "1 day" : 
             `${item.expiresIn} days`}
          </Badge>
          
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              Use
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/inventory/${item.id}`);
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCard;