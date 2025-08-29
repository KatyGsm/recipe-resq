import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Store, Euro, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Receipt {
  id: string;
  store_name: string;
  receipt_date: string;
  total_amount: number;
  created_at: string;
  receipt_items: {
    standardized_name: string;
    quantity: number;
    product_categories: {
      name: string;
    } | null;
  }[];
}

export const RecentReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items (
            standardized_name,
            quantity,
            product_categories (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching receipts:', error);
        return;
      }

      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Receipts
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

  if (receipts.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Receipts Yet</h3>
            <p className="text-muted-foreground text-sm">
              Upload your first receipt to start tracking your purchases automatically
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
          <FileText className="w-5 h-5 mr-2" />
          Recent Receipts
        </h3>
        
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="glass-card-hover p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{receipt.store_name || 'Unknown Store'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {receipt.receipt_date 
                          ? format(new Date(receipt.receipt_date), 'MMM dd, yyyy')
                          : format(new Date(receipt.created_at), 'MMM dd, yyyy')
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Euro className="w-3 h-3" />
                      <span>{receipt.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                <Button size="sm" variant="ghost" className="opacity-70 hover:opacity-100">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              {receipt.receipt_items && receipt.receipt_items.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {receipt.receipt_items.length} items purchased
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {receipt.receipt_items.slice(0, 3).map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item.standardized_name}
                        {item.quantity > 1 && ` (${item.quantity})`}
                      </Badge>
                    ))}
                    {receipt.receipt_items.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{receipt.receipt_items.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};