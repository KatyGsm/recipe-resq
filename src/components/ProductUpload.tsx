import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Camera, Package, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ProductUploadProps {
  onProductAdded?: (productData: any) => void;
}

export const ProductUpload = ({ onProductAdded }: ProductUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('fridge');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeProduct = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(10);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      setProgress(20);

      // Convert image to base64
      const base64Image = await convertFileToBase64(file);
      setUploadedImage(URL.createObjectURL(file));
      setProgress(40);

      // Call the edge function to analyze the product
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: {
          imageBase64: base64Image,
          userId: user.id,
          location: selectedLocation
        }
      });

      setProgress(80);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to analyze product');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze product');
      }

      setProgress(100);
      setProcessedData(data);

      // Determine urgency based on days until expiry
      const daysUntilExpiry = data.days_until_expiry;
      let urgencyMessage = "Product added successfully!";
      let urgencyVariant: "default" | "destructive" = "default";

      if (daysUntilExpiry !== null) {
        if (daysUntilExpiry <= 1) {
          urgencyMessage = `⚠️ URGENT: ${data.product_name} expires ${daysUntilExpiry === 0 ? 'today' : 'tomorrow'}!`;
          urgencyVariant = "destructive";
        } else if (daysUntilExpiry <= 3) {
          urgencyMessage = `🔔 ${data.product_name} expires in ${daysUntilExpiry} days`;
        } else if (daysUntilExpiry <= 7) {
          urgencyMessage = `📅 ${data.product_name} expires in ${daysUntilExpiry} days`;
        }
      }
      
      toast({
        title: urgencyMessage,
        description: data.brand ? `Brand: ${data.brand} • Category: ${data.category}` : `Category: ${data.category}`,
        variant: urgencyVariant,
      });

      onProductAdded?.(data);

    } catch (error) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze product",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    await analyzeProduct(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getExpiryUrgency = (daysUntilExpiry: number | null) => {
    if (daysUntilExpiry === null) return { color: 'text-muted-foreground', icon: Calendar };
    if (daysUntilExpiry <= 1) return { color: 'text-destructive', icon: AlertTriangle };
    if (daysUntilExpiry <= 3) return { color: 'text-orange-500', icon: AlertTriangle };
    if (daysUntilExpiry <= 7) return { color: 'text-yellow-500', icon: Calendar };
    return { color: 'text-green-500', icon: Calendar };
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto neon-glow">
          <Package className="w-8 h-8 text-secondary-foreground" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Scan Product</h3>
          <p className="text-muted-foreground text-sm">
            Take a photo of any product to automatically detect expiry dates and add to your fridge
          </p>
        </div>

        {!isProcessing && !processedData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Storage Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fridge">🧊 Fridge</SelectItem>
                  <SelectItem value="freezer">❄️ Freezer</SelectItem>
                  <SelectItem value="pantry">🏠 Pantry</SelectItem>
                  <SelectItem value="countertop">🍎 Countertop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleUploadClick}
              className="w-full bg-gradient-secondary hover:scale-105 transition-all duration-300"
              disabled={isProcessing}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Supports JPG, PNG • Max 10MB
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Camera className="w-4 h-4 animate-pulse" />
                <span>Analyzing product...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded product"
                  className="max-w-full h-32 object-contain mx-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        )}

        {processedData && (
          <div className="space-y-4">
            {/* Expiry Status Message in the style of the uploaded image */}
            <div className="glass-card p-6 text-center space-y-3">
              {(() => {
                const daysUntilExpiry = processedData.days_until_expiry;
                let statusIcon, statusMessage, statusSubtext, statusColor;
                
                if (daysUntilExpiry === null) {
                  statusIcon = "✅";
                  statusMessage = "Product Added!";
                  statusSubtext = "Expiry date not detected. Check the product manually for best results.";
                  statusColor = "text-muted-foreground";
                } else if (daysUntilExpiry <= 0) {
                  statusIcon = "🚨";
                  statusMessage = "Expired Product!";
                  statusSubtext = `${processedData.product_name} has already expired. Consider disposing of it safely.`;
                  statusColor = "text-destructive";
                } else if (daysUntilExpiry <= 1) {
                  statusIcon = "⚠️";
                  statusMessage = "Use Immediately!";
                  statusSubtext = `${processedData.product_name} expires ${daysUntilExpiry === 1 ? 'tomorrow' : 'today'}. Use it right away!`;
                  statusColor = "text-destructive";
                } else if (daysUntilExpiry <= 3) {
                  statusIcon = "🔔";
                  statusMessage = "Use Soon!";
                  statusSubtext = `${processedData.product_name} expires in ${daysUntilExpiry} days. Plan to use it this week.`;
                  statusColor = "text-orange-500";
                } else if (daysUntilExpiry <= 7) {
                  statusIcon = "📅";
                  statusMessage = "Good for This Week!";
                  statusSubtext = `${processedData.product_name} expires in ${daysUntilExpiry} days. You have time to plan meals.`;
                  statusColor = "text-yellow-500";
                } else {
                  statusIcon = "✅";
                  statusMessage = "All Good!";
                  statusSubtext = `${processedData.product_name} is fresh and expires in ${daysUntilExpiry} days. Perfect for meal planning!`;
                  statusColor = "text-green-500";
                }
                
                return (
                  <>
                    <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">{statusIcon}</span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${statusColor}`}>
                        {statusMessage} {statusIcon === "✅" && "🎉"}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2">
                        {statusSubtext}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="glass-card p-4 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{processedData.product_name}</span>
                </div>
                
                {processedData.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{processedData.brand}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{processedData.category}</span>
                </div>
                
                {processedData.expiry_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expires:</span>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const urgency = getExpiryUrgency(processedData.days_until_expiry);
                        const UrgencyIcon = urgency.icon;
                        return (
                          <>
                            <UrgencyIcon className={`w-4 h-4 ${urgency.color}`} />
                            <span className={`font-medium ${urgency.color}`}>
                              {format(new Date(processedData.expiry_date), 'MMM dd, yyyy')}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {processedData.days_until_expiry !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days left:</span>
                    <span className={`font-medium ${getExpiryUrgency(processedData.days_until_expiry).color}`}>
                      {processedData.days_until_expiry} days
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                setProcessedData(null);
                setUploadedImage(null);
              }}
              variant="outline"
              className="w-full"
            >
              Scan Another Product
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};