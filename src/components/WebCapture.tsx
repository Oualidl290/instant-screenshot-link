
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { uploadScreenshot } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface WebCaptureProps {
  onCaptureComplete: (previewUrl: string, shareableUrl: string) => void;
}

const WebCapture: React.FC<WebCaptureProps> = ({ onCaptureComplete }) => {
  const [capturing, setCapturing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleScreenshot = async () => {
    setCapturing(true);
    try {
      // We'll capture the whole page for this demo
      const canvas = await html2canvas(document.body);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      // Create file from blob
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      
      // Create URL for preview
      const objectUrl = URL.createObjectURL(blob);
      
      // Upload to Supabase
      setUploading(true);
      const url = await uploadScreenshot(file);
      
      // Notify parent component
      onCaptureComplete(objectUrl, url);
      
      toast({
        title: "Screenshot captured!",
        description: "Your screenshot is ready to share.",
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      toast({
        variant: "destructive",
        title: "Capture failed",
        description: "There was a problem capturing your screenshot.",
      });
    } finally {
      setCapturing(false);
      setUploading(false);
    }
  };

  return (
    <Button 
      onClick={handleScreenshot}
      disabled={capturing || uploading}
      className="gradient-btn w-full py-6 text-lg"
    >
      {capturing ? "Capturing..." : 
       uploading ? "Uploading..." : 
       "Capture Screenshot"} 
      <Camera className="ml-2" size={20} />
    </Button>
  );
};

export default WebCapture;
