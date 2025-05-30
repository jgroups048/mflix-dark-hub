import React, { useState, useEffect, useCallback } from 'react';
import { getSplashAdminSettings, saveSplashAdminSettings, SplashSettings, ObjectFitOptions } from '@/lib/firebaseServices/splashAdminService';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // For bonus toast
import { Loader2, PlayCircle } from 'lucide-react'; // For loading spinner and PlayCircle
import MainSplashScreen from '@/components/SplashScreen'; // Import the main display component

const initialSplashSettings: Omit<SplashSettings, 'updatedAt'> = {
  enabled: false,
  mode: 'image',
  imageUrl: '',
  videoUrl: '',
  logoUrl: '',
  audioUrl: '',
  objectFit: 'cover',
};

const SplashScreenAdmin: React.FC = () => {
  const [settings, setSettings] = useState<Omit<SplashSettings, 'updatedAt'>>(initialSplashSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTestSplash, setShowTestSplash] = useState(false); // State for Test Run
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSettings = await getSplashAdminSettings();
      if (fetchedSettings) {
        const { updatedAt, ...rest } = fetchedSettings; // Exclude timestamp from form state
        setSettings(rest);
      } else {
        setSettings(initialSplashSettings);
      }
    } catch (error) {
      console.error("Failed to fetch splash settings for admin panel:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Settings",
        description: "Could not load splash screen settings. Please try again later.",
      });
      setSettings(initialSplashSettings); // Fallback to initial if fetch fails
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: name === 'enabled' ? (typeof value === 'boolean' ? value : value === 'true') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSplashAdminSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Splash screen settings have been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save splash settings:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Settings",
        description: "Could not save splash screen settings. Please try again.",
      });
    }
    setIsSaving(false);
  };

  const handleTestRun = () => {
    if (!settings.enabled) {
      toast({
        variant: "default",
        title: "Splash Not Enabled",
        description: "Enable the splash screen to test it.",
      });
      return;
    }
    if (settings.mode === 'image' && !settings.imageUrl) {
        toast({ variant: "default", title: "Missing Image URL for Test"});
        return;
    }
    if (settings.mode === 'video' && !settings.videoUrl) {
        toast({ variant: "default", title: "Missing Video URL for Test"});
        return;
    }
    setShowTestSplash(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="ml-2 text-lg">Loading Splash Settings...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-700 text-white m-4 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Splash Screen Configuration (New)</CardTitle>
          <CardDescription className="text-gray-400">
            Manage the splash screen settings. These settings are stored in 'splashScreenSettings/main'.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="enabled" 
                name="enabled"
                checked={settings.enabled} 
                onCheckedChange={(checked) => handleSelectChange('enabled', checked ? 'true' : 'false')}
                disabled={isSaving}
              />
              <Label htmlFor="enabled">Enable Splash Screen</Label>
            </div>

            {settings.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <Select 
                    name="mode"
                    value={settings.mode}
                    onValueChange={(value) => handleSelectChange('mode', value as 'image' | 'video')}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.mode === 'image' && (
                  <div className="space-y-2 pl-4 border-l-2 border-red-500/30">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      name="imageUrl"
                      value={settings.imageUrl || ''} 
                      onChange={handleInputChange} 
                      placeholder="https://example.com/splash.png" 
                      className="bg-gray-800 border-gray-600"
                      disabled={isSaving}
                    />
                  </div>
                )}

                {settings.mode === 'video' && (
                  <div className="space-y-2 pl-4 border-l-2 border-red-500/30">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input 
                      id="videoUrl" 
                      name="videoUrl"
                      value={settings.videoUrl || ''} 
                      onChange={handleInputChange} 
                      placeholder="https://example.com/splash.mp4" 
                      className="bg-gray-800 border-gray-600"
                      disabled={isSaving}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="objectFit">Media Size Format</Label>
                  <Select 
                    name="objectFit"
                    value={settings.objectFit || 'cover'}
                    onValueChange={(value) => handleSelectChange('objectFit', value as ObjectFitOptions)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Select media size format" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="cover">Cover (fills space, may crop)</SelectItem>
                      <SelectItem value="contain">Contain (fits within space, letterboxed)</SelectItem>
                      <SelectItem value="fill">Fill (stretches to fill space)</SelectItem>
                      <SelectItem value="none">None (original size)</SelectItem>
                      <SelectItem value="scale-down">Scale Down (like none or contain, whichever is smaller)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">Controls how the splash image/video resizes.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Overlay Logo URL (Optional)</Label>
                  <Input 
                    id="logoUrl" 
                    name="logoUrl"
                    value={settings.logoUrl || ''} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/overlay.png" 
                    className="bg-gray-800 border-gray-600"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audioUrl">Audio URL (Optional, .mp3)</Label>
                  <Input 
                    id="audioUrl" 
                    name="audioUrl"
                    value={settings.audioUrl || ''} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/sound.mp3" 
                    className="bg-gray-800 border-gray-600"
                    disabled={isSaving}
                  />
                </div>

                <Button 
                    type="button" // Important: prevent form submission
                    onClick={handleTestRun} 
                    variant="outline"
                    className="w-full mt-6 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                    disabled={isSaving || isLoading || !settings.enabled || (settings.mode === 'image' && !settings.imageUrl) || (settings.mode === 'video' && !settings.videoUrl)}
                >
                    <PlayCircle className="mr-2 h-5 w-5" /> Test Run Current Splash
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-700 pt-6">
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSaving || isLoading}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Splash Settings'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Test Splash Screen Modal Overlay */}
      {showTestSplash && settings.enabled && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center backdrop-blur-sm">
          <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <MainSplashScreen 
              onComplete={() => setShowTestSplash(false)} 
              ignoreSessionStorage={true} // Always ignore session for test
              testSettings={{
                ...settings, // Pass current form settings
                // duration can be passed if SplashSettings had it, or MainSplashScreen has a default
                // For now, let's assume MainSplashScreen uses a default if not in testSettings.
                // If you want to test a specific duration, add a duration field to the admin form
                // and pass settings.duration here.
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SplashScreenAdmin; 