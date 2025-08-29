import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, ChefHat, CheckCircle, Clock, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FridgeScannerProps {
  onFridgeAnalyzed?: (analysisData: any) => void;
}

export const FridgeScanner = ({ onFridgeAnalyzed }: FridgeScannerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeFridge = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      setProgress(20);

      const base64Image = await convertFileToBase64(file);
      setUploadedImage(URL.createObjectURL(file));
      setProgress(40);

      const { data, error } = await supabase.functions.invoke('analyze-fridge', {
        body: {
          imageBase64: base64Image,
          userId: user.id
        }
      });

      setProgress(80);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to analyze fridge contents');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze fridge contents');
      }

      setProgress(100);
      setAnalysisResult(data);
      
      toast({
        title: "Fridge Analyzed! 🔍",
        description: `Found ${data.analysis_summary.total_ingredients} ingredients and ${data.analysis_summary.suggested_recipes} recipe suggestions!`,
        duration: 5000,
      });

      onFridgeAnalyzed?.(data);

    } catch (error) {
      console.error('Error analyzing fridge:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze fridge contents",
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    await analyzeFridge(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto neon-glow">
          <ChefHat className="w-8 h-8 text-accent-foreground" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Scan Fridge</h3>
          <p className="text-muted-foreground text-sm">
            Take a photo of your fridge to discover ingredients and get personalized recipe suggestions
          </p>
        </div>

        {!isProcessing && !analysisResult && (
          <div className="space-y-3">
            <Button
              onClick={handleUploadClick}
              className="w-full bg-gradient-accent hover:scale-105 transition-all duration-300"
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
                <span>
                  {progress < 50 ? 'Analyzing contents...' : 'Generating recipes...'}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded fridge"
                  className="max-w-full h-32 object-contain mx-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        )}

        {analysisResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Fridge Analyzed!</span>
            </div>
            
            <div className="glass-card p-4 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ingredients Found:</span>
                <Badge variant="secondary" className="font-medium">
                  {analysisResult.analysis_summary.total_ingredients}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recipe Suggestions:</span>
                <Badge variant="secondary" className="font-medium">
                  {analysisResult.analysis_summary.suggested_recipes}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fridge Status:</span>
                <Badge variant="outline" className="capitalize">
                  {analysisResult.fridge_contents.fridge_fullness}
                </Badge>
              </div>

              {analysisResult.recipe_suggestions.ingredient_usage && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ingredient Usage:</span>
                  <Badge variant="secondary">
                    {analysisResult.recipe_suggestions.ingredient_usage}
                  </Badge>
                </div>
              )}
            </div>

            {/* Quick Preview of Top Ingredients */}
            {analysisResult.fridge_contents.detected_items.length > 0 && (
              <div className="glass-card p-4 text-left">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>🥗</span>
                  Available Ingredients
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.fridge_contents.detected_items.slice(0, 6).map((item: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item.name}
                    </Badge>
                  ))}
                  {analysisResult.fridge_contents.detected_items.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{analysisResult.fridge_contents.detected_items.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Quick Preview of Top Recipes */}
            {analysisResult.recipe_suggestions.recipes.length > 0 && (
              <div className="glass-card p-4 text-left">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Recipe Suggestions
                </h4>
                <div className="space-y-2">
                  {analysisResult.recipe_suggestions.recipes.slice(0, 3).map((recipe: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{recipe.name}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{recipe.prep_time}min</span>
                        <Badge variant="outline" className="text-xs capitalize ml-1">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setAnalysisResult(null);
                setUploadedImage(null);
              }}
              variant="outline"
              className="w-full"
            >
              Scan Another Fridge
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