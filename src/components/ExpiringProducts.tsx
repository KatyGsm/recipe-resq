import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ExpiringProduct {
  id: string;
  name: string;
  expiry_date: string;
  days_until_expiry: number;
  category_name: string | null;
  image_path: string | null;
  location: string | null;
}

export const ExpiringProducts = () => {
  const [products, setProducts] = useState<ExpiringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpiringProducts();
  }, []);

  const fetchExpiringProducts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_expiring_products', { days_ahead: 7 });

      if (error) {
        console.error('Error fetching expiring products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching expiring products:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsConsumed = async (productId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_consumed: true, 
          consumed_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (error) {
        console.error('Error marking product as consumed:', error);
        toast({
          title: "Error",
          description: "Failed to mark product as consumed",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      toast({
        title: "Great job! 🎉",
        description: `${productName} marked as consumed`,
      });

    } catch (error) {
      console.error('Error marking product as consumed:', error);
    }
  };

  const getUrgencyStyle = (days: number) => {
    if (days < 0) return { 
      bgColor: 'bg-destructive/20', 
      textColor: 'text-destructive', 
      borderColor: 'border-destructive/50',
      icon: AlertTriangle,
      label: 'EXPIRED'
    };
    if (days === 0) return { 
      bgColor: 'bg-destructive/20', 
      textColor: 'text-destructive', 
      borderColor: 'border-destructive/50',
      icon: AlertTriangle,
      label: 'TODAY'
    };
    if (days === 1) return { 
      bgColor: 'bg-orange-100 dark:bg-orange-900/20', 
      textColor: 'text-orange-600 dark:text-orange-400', 
      borderColor: 'border-orange-300 dark:border-orange-700',
      icon: AlertTriangle,
      label: 'TOMORROW'
    };
    if (days <= 3) return { 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', 
      textColor: 'text-yellow-600 dark:text-yellow-400', 
      borderColor: 'border-yellow-300 dark:border-yellow-700',
      icon: Calendar,
      label: `${days} DAYS`
    };
    return { 
      bgColor: 'bg-green-100 dark:bg-green-900/20', 
      textColor: 'text-green-600 dark:text-green-400', 
      borderColor: 'border-green-300 dark:border-green-700',
      icon: Calendar,
      label: `${days} DAYS`
    };
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Expiring Soon
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">All Good! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              No products expiring in the next 7 days. Keep up the great work managing your fridge!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          Expiring Soon
          <Badge variant="destructive" className="ml-auto">
            {products.length} items
          </Badge>
        </h3>
        
        <div className="space-y-3">
          {products.map((product) => {
            const urgency = getUrgencyStyle(product.days_until_expiry);
            const UrgencyIcon = urgency.icon;
            
            return (
              <div 
                key={product.id} 
                className={`glass-card-hover p-4 border-l-4 ${urgency.borderColor} ${urgency.bgColor}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      <Badge variant="outline" className={`text-xs ${urgency.textColor}`}>
                        <UrgencyIcon className="w-3 h-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(product.expiry_date), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {product.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span className="capitalize">{product.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {product.category_name && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category_name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {product.days_until_expiry < 0 
                      ? `Expired ${Math.abs(product.days_until_expiry)} days ago`
                      : product.days_until_expiry === 0 
                        ? 'Expires today!'
                        : `${product.days_until_expiry} days remaining`
                    }
                  </div>
                  
                  <Button
                    size="sm"
                    variant={product.days_until_expiry <= 1 ? "destructive" : "outline"}
                    onClick={() => markAsConsumed(product.id, product.name)}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Used it!
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          💡 Tip: Use products with fewer days left first to reduce waste!
        </div>
      </div>
    </Card>
  );
};