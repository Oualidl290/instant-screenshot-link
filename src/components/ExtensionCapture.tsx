
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { uploadScreenshot } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface ExtensionCaptureProps {
  onCaptureComplete: (previewUrl: string, shareableUrl: string) => void;
}

const ExtensionCapture: React.FC<ExtensionCaptureProps> = ({ onCaptureComplete }) => {
  const [capturing, setCapturing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const captureTab = async () => {
    setCapturing(true);
    
    try {
      // Check if we have access to the chrome API
      if (typeof window.chrome === 'undefined' || !window.chrome.tabs) {
        throw new Error("Chrome extension APIs not available");
      }
      
      // Query for the active tab
      const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
      
      // Capture the visible tab
      const dataUrl = await window.chrome.tabs.captureVisibleTab();
      
      // Convert data URL to blob
      const blob = await fetch(dataUrl).then(r => r.blob());
      
      // Create file from blob
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      
      // Preview
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
      console.error('Error capturing tab:', error);
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
      onClick={captureTab}
      disabled={capturing || uploading}
      className="gradient-btn w-full py-6 text-lg"
    >
      {capturing ? "Capturing..." : 
       uploading ? "Uploading..." : 
       "Capture Current Tab"} 
      <Camera className="ml-2" size={20} />
    </Button>
  );
};

export default ExtensionCapture;
