import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScanType } from './useCamera';

export const useFileUpload = () => {
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

  const uploadFile = async (file: File, scanType: ScanType): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload files.",
          variant: "destructive",
        });
        return null;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return null;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return null;
      }

      const bucketName = getBucketName(scanType);
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${scanType}_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload file. Please try again.",
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
        description: "File uploaded successfully!",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (scanType: ScanType): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  };

  return {
    uploadFile,
    handleFileSelect,
    isLoading,
  };
};