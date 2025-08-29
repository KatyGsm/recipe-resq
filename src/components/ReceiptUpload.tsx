import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptUploadProps {
  onReceiptProcessed?: (receiptData: any) => void;
}

export const ReceiptUpload = ({ onReceiptProcessed }: ReceiptUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);
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

  const processReceipt = async (file: File) => {
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

      // Call the edge function to process the receipt
      const { data, error } = await supabase.functions.invoke('process-receipt', {
        body: {
          imageBase64: base64Image,
          userId: user.id
        }
      });

      setProgress(80);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to process receipt');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      setProgress(100);
      setProcessedData(data);
      
      toast({
        title: "Receipt Processed Successfully!",
        description: `Found ${data.products_count} products from ${data.store_name}`,
      });

      onReceiptProcessed?.(data);

    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process receipt",
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

    await processReceipt(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto neon-glow">
          <FileText className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Upload Receipt</h3>
          <p className="text-muted-foreground text-sm">
            Upload a photo of your receipt to automatically extract and categorize your purchases
          </p>
        </div>

        {!isProcessing && !processedData && (
          <div className="space-y-3">
            <Button
              onClick={handleUploadClick}
              className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
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
                <span>Processing receipt...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded receipt"
                  className="max-w-full h-32 object-contain mx-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        )}

        {processedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Receipt Processed!</span>
            </div>
            
            <div className="glass-card p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Store:</span>
                  <span className="font-medium">{processedData.store_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">€{processedData.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products:</span>
                  <span className="font-medium">{processedData.products_count}</span>
                </div>
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
              Upload Another Receipt
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