
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link, CheckCircle2, History, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { isExtension } from "@/utils/extensionDetection";
import WebCapture from "./WebCapture";
import ExtensionCapture from "./ExtensionCapture";

interface ScreenshotHistory {
  id: string;
  url: string;
  date: string;
}

const ScreenshotCapture: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<ScreenshotHistory[]>(() => {
    const saved = localStorage.getItem('screenshotHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isRunningAsExtension = isExtension();

  const saveToHistory = (url: string) => {
    const newItem = {
      id: Date.now().toString(),
      url,
      date: new Date().toLocaleString()
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep only last 10
    setHistory(updatedHistory);
    localStorage.setItem('screenshotHistory', JSON.stringify(updatedHistory));
  };

  const handleCaptureComplete = (preview: string, shareUrl: string) => {
    setPreviewUrl(preview);
    setShareableUrl(shareUrl);
    saveToHistory(shareUrl);
  };

  const handleCopyLink = () => {
    if (shareableUrl && inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with anyone you like.",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  const removeHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('screenshotHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('screenshotHistory');
    toast({
      title: "History cleared",
      description: "All your history items have been removed.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-transparent bg-clip-text">
          Screenshot & Share
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRunningAsExtension ? 
            "Capture tab, upload, and share screenshots in seconds." :
            "Capture, upload, and share screenshots in seconds."}
        </p>
      </div>
      
      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capture">Capture</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                {isRunningAsExtension ? 
                  <ExtensionCapture onCaptureComplete={handleCaptureComplete} /> :
                  <WebCapture onCaptureComplete={handleCaptureComplete} />
                }
              </div>
              
              {previewUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Preview</h3>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Screenshot preview" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}
              
              {shareableUrl && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-3">Share Link</h3>
                  <div className="flex">
                    <Input
                      ref={inputRef}
                      value={shareableUrl}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="ml-2"
                      variant={copied ? "outline" : "default"}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This link expires in 30 days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Screenshots</h3>
                {history.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearHistory}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </Button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No screenshots in history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="border rounded-md p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center overflow-hidden">
                        <Link className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
                        <div className="overflow-hidden">
                          <div className="truncate text-sm">{item.url}</div>
                          <div className="text-xs text-muted-foreground">{item.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            toast({ title: "Link copied to clipboard" });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon"
                          variant="ghost"
                          onClick={() => removeHistoryItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScreenshotCapture;
