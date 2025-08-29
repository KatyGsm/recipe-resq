import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, isToday, isPast } from "date-fns";

interface UrgentProduct {
  id: string;
  name: string;
  days_until_expiry: number;
  location: string | null;
}

export const ExpiryNotifications = () => {
  const [urgentProducts, setUrgentProducts] = useState<UrgentProduct[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUrgentProducts();
    
    // Check for urgent products every 5 minutes
    const interval = setInterval(fetchUrgentProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUrgentProducts = async () => {
    try {
      // Get products expiring in 1 day or less (urgent)
      const { data, error } = await supabase.rpc('get_expiring_products', { days_ahead: 1 });

      if (error) {
        console.error('Error fetching urgent products:', error);
        return;
      }

      const urgent = (data || []).filter((product: UrgentProduct) => 
        !dismissed.includes(product.id)
      );
      
      // Log today's date and comparison for debugging
      const today = new Date();
      console.log('Today is:', format(today, 'yyyy-MM-dd'));
      console.log('Urgent products found:', urgent.map(p => ({
        name: p.name,
        expiry_date: p.expiry_date,
        days_until_expiry: p.days_until_expiry
      })));
      
      setUrgentProducts(urgent);

      // Show toast notification for new urgent items
      if (urgent.length > 0) {
        const todayItems = urgent.filter(p => p.days_until_expiry === 0);
        const expiredItems = urgent.filter(p => p.days_until_expiry < 0);
        
        if (todayItems.length > 0) {
          toast({
            title: "⚠️ Items Expiring Today!",
            description: `${todayItems.length} product(s) expire today: ${todayItems.map(p => p.name).join(', ')}`,
            variant: "destructive",
            duration: 8000, // Show longer for urgent items
          });
        }
        
        if (expiredItems.length > 0) {
          toast({
            title: "🚨 Expired Items Detected!",
            description: `${expiredItems.length} product(s) have expired: ${expiredItems.map(p => p.name).join(', ')}`,
            variant: "destructive",
            duration: 10000, // Show even longer for expired items
          });
        }
      }
    } catch (error) {
      console.error('Error fetching urgent products:', error);
    }
  };

  const dismissNotification = (productId: string) => {
    setDismissed(prev => [...prev, productId]);
    setUrgentProducts(prev => prev.filter(p => p.id !== productId));
  };

  const dismissAll = () => {
    const allIds = urgentProducts.map(p => p.id);
    setDismissed(prev => [...prev, ...allIds]);
    setUrgentProducts([]);
  };

  if (urgentProducts.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-destructive/50 bg-destructive/5">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-destructive animate-pulse" />
            <h3 className="font-semibold text-destructive">Urgent Expiry Alerts</h3>
            <Badge variant="destructive" className="animate-pulse">
              {urgentProducts.length}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss All
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {urgentProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-destructive/20"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.days_until_expiry < 0 
                      ? `❌ Expired ${Math.abs(product.days_until_expiry)} day${Math.abs(product.days_until_expiry) !== 1 ? 's' : ''} ago`
                      : product.days_until_expiry === 0 
                        ? '🚨 Expires TODAY!'
                        : `⏰ Expires tomorrow`
                    }
                    {product.location && ` • 📍 ${product.location}`}
                    • {format(new Date(), 'HH:mm')} check
                  </p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissNotification(product.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-center text-muted-foreground">
          💡 Use these products first to reduce waste and save money!
        </div>
      </div>
    </Card>
  );
};