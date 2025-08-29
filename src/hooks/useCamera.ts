import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ScanType = 'receipt' | 'expiry' | 'fridge';

interface CameraResult {
  webPath?: string;
  base64String?: string;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getBucketName = (scanType: ScanType): string => {
    switch (scanType) {
      case 'receipt':
        return 'receipts';
      case 'expiry':
        return 'expiry-photos';
      case 'fridge':
        return 'fridge-photos';
      default:
        return 'receipts';
    }
  };

  const takePicture = async (scanType: ScanType): Promise<CameraResult | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      return {
        webPath: image.webPath,
        base64String: image.base64String,
      };
    } catch (error) {
      console.error('Error taking picture:', error);
      toast({
        title: "Camera Error",
        description: "Failed to take picture. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (scanType: ScanType): Promise<CameraResult | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      return {
        webPath: image.webPath,
        base64String: image.base64String,
      };
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (
    base64String: string,
    scanType: ScanType,
    fileName?: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload images.",
          variant: "destructive",
        });
        return null;
      }

      // Convert base64 to blob
      const response = await fetch(`data:image/jpeg;base64,${base64String}`);
      const blob = await response.blob();
      
      const bucketName = getBucketName(scanType);
      const timestamp = new Date().getTime();
      const fileExtension = 'jpg';
      const finalFileName = fileName || `${scanType}_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${finalFileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully!",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePicture,
    selectFromGallery,
    uploadImage,
    isLoading,
  };
};