import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Upload, Scan, Image as ImageIcon, FileImage } from "lucide-react";
import { useState } from "react";
import { useCamera, ScanType } from "@/hooks/useCamera";
import { useFileUpload } from "@/hooks/useFileUpload";

const Scanner = () => {
  const navigate = useNavigate();
  const [scanType, setScanType] = useState<ScanType | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { takePicture, selectFromGallery, uploadImage, isLoading: cameraLoading } = useCamera();
  const { uploadFile, handleFileSelect, isLoading: fileLoading } = useFileUpload();
  
  const isLoading = cameraLoading || fileLoading;

  const scanOptions = [
    {
      type: 'receipt' as const,
      icon: Scan,
      title: "Scan Receipt",
      description: "Automatically add groceries to your inventory",
      color: "bg-gradient-primary",
      textColor: "text-primary-foreground"
    },
    {
      type: 'expiry' as const,
      icon: Camera,
      title: "Check Expiry Dates",
      description: "Scan food packaging to detect expiration dates",
      color: "bg-gradient-secondary",
      textColor: "text-secondary-foreground"
    },
    {
      type: 'fridge' as const,
      icon: Upload,
      title: "Fridge Photo",
      description: "Take a photo of your fridge to find recipes",
      color: "bg-accent",
      textColor: "text-accent-foreground"
    }
  ];

  const handleScanSelect = (type: ScanType) => {
    setScanType(type);
    setCapturedImage(null);
    setUploadedImageUrl(null);
  };

  const handleTakePicture = async () => {
    if (!scanType) return;
    
    const result = await takePicture(scanType);
    if (result && result.base64String) {
      setCapturedImage(`data:image/jpeg;base64,${result.base64String}`);
    }
  };

  const handleSelectFromGallery = async () => {
    if (!scanType) return;
    
    const result = await selectFromGallery(scanType);
    if (result && result.base64String) {
      setCapturedImage(`data:image/jpeg;base64,${result.base64String}`);
    }
  };

  const handleUploadImage = async () => {
    if (!capturedImage || !scanType) return;
    
    const base64String = capturedImage.split(',')[1];
    const url = await uploadImage(base64String, scanType);
    if (url) {
      setUploadedImageUrl(url);
    }
  };

  const handleSelectFile = async () => {
    if (!scanType) return;
    
    const file = await handleFileSelect(scanType);
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file directly
      const url = await uploadFile(file, scanType);
      if (url) {
        setUploadedImageUrl(url);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setUploadedImageUrl(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="hover-glow">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Smart Scanner</h1>
            <p className="text-sm text-muted-foreground">Choose what you'd like to scan</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!scanType ? (
          <div className="space-y-6">
            {/* Scan Options */}
            <div className="grid md:grid-cols-3 gap-6">
              {scanOptions.map((option) => (
                <Card 
                  key={option.type}
                  className="glass-card-hover cursor-pointer group"
                  onClick={() => handleScanSelect(option.type)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`
                      w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${option.color}
                      group-hover:scale-110 transition-transform duration-300 neon-glow
                    `}>
                      <option.icon className={`w-8 h-8 ${option.textColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>How to Use the Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Choose Scan Type</h4>
                    <p className="text-sm text-muted-foreground">Select what you want to scan from the options above</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Position Your Camera</h4>
                    <p className="text-sm text-muted-foreground">Align the item clearly in your camera viewfinder</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Confirm</h4>
                    <p className="text-sm text-muted-foreground">Check the scanned information and make any needed adjustments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Camera Interface */}
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                {!capturedImage ? (
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Ready to capture</p>
                      <p className="text-sm text-muted-foreground">
                        Take a photo or select from your gallery
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 mb-6 relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="w-full h-full object-contain rounded-lg border"
                    />
                    {uploadedImageUrl && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          ✓ Uploaded
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={() => setScanType(null)}
                    className="hover-glow"
                  >
                    Back to Options
                  </Button>
                  
                  {!capturedImage ? (
                    <>
                      <Button 
                        onClick={handleTakePicture}
                        className="bg-gradient-primary neon-glow"
                        disabled={isLoading}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {isLoading ? 'Opening Camera...' : 'Take Photo'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleSelectFromGallery}
                        className="hover-glow"
                        disabled={isLoading}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        From Gallery
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleSelectFile}
                        className="hover-glow"
                        disabled={isLoading}
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        onClick={handleRetake}
                        className="hover-glow"
                      >
                        Retake
                      </Button>
                      {!uploadedImageUrl ? (
                        <Button 
                          onClick={handleUploadImage}
                          className="bg-gradient-primary neon-glow"
                          disabled={isLoading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isLoading ? 'Uploading...' : 'Upload & Process'}
                        </Button>
                      ) : (
                        <Button 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            // Process the uploaded image here
                            console.log('Processing image:', uploadedImageUrl);
                          }}
                        >
                          ✓ Continue Processing
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scan Type Specific Tips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {scanType === 'receipt' && 'Receipt Scanning Tips'}
                  {scanType === 'expiry' && 'Expiry Date Scanning Tips'}
                  {scanType === 'fridge' && 'Fridge Photo Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanType === 'receipt' && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Ensure the receipt is flat and well-lit</p>
                    <p>• Make sure all text is clearly visible</p>
                    <p>• Try to avoid shadows and reflections</p>
                  </div>
                )}
                {scanType === 'expiry' && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Focus on the expiration date area</p>
                    <p>• Ensure good lighting on the packaging</p>
                    <p>• Hold the camera steady for a clear shot</p>
                  </div>
                )}
                {scanType === 'fridge' && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Open your fridge fully for the best view</p>
                    <p>• Try to get all shelves in the frame</p>
                    <p>• Good lighting helps identify ingredients</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;