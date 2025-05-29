
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Eye, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdSettings {
  homePageBanner: {
    enabled: boolean;
    code: string;
    position: 'top' | 'bottom' | 'middle';
  };
  videoAds: {
    enabled: boolean;
    preRollAd: string;
    midRollAd: string;
    postRollAd: string;
    midRollInterval: number; // seconds
  };
  sidebarAds: {
    enabled: boolean;
    code: string;
  };
  popupAds: {
    enabled: boolean;
    code: string;
    frequency: number; // minutes
  };
  downloadPageAds: {
    enabled: boolean;
    beforeDownload: string;
    afterDownload: string;
  };
}

const AdManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [adSettings, setAdSettings] = useState<AdSettings>({
    homePageBanner: {
      enabled: false,
      code: '',
      position: 'top'
    },
    videoAds: {
      enabled: false,
      preRollAd: '',
      midRollAd: '',
      postRollAd: '',
      midRollInterval: 600 // 10 minutes
    },
    sidebarAds: {
      enabled: false,
      code: ''
    },
    popupAds: {
      enabled: false,
      code: '',
      frequency: 30 // 30 minutes
    },
    downloadPageAds: {
      enabled: false,
      beforeDownload: '',
      afterDownload: ''
    }
  });

  const handleSave = () => {
    setLoading(true);
    
    // Save to localStorage for now (can be moved to Supabase later)
    localStorage.setItem('entertainment-hub-ads', JSON.stringify(adSettings));
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Success!',
        description: 'Ad settings saved successfully',
      });
    }, 1000);
  };

  const handlePreview = (adCode: string, adType: string) => {
    if (!adCode.trim()) {
      toast({
        title: 'No Ad Code',
        description: 'Please enter ad code to preview',
        variant: 'destructive'
      });
      return;
    }

    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ad Preview - ${adType}</title>
            <style>
              body { margin: 20px; font-family: Arial, sans-serif; }
              .preview-container { border: 2px dashed #ccc; padding: 20px; }
              .preview-label { background: #f0f0f0; padding: 5px 10px; margin-bottom: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="preview-label">${adType} Preview</div>
            <div class="preview-container">
              ${adCode}
            </div>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="space-y-6">
      {/* Homepage Banner Ads */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Homepage Banner Ads</CardTitle>
          <CardDescription className="text-gray-400">
            Display banner ads on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={adSettings.homePageBanner.enabled}
              onCheckedChange={(checked) => 
                setAdSettings({
                  ...adSettings,
                  homePageBanner: { ...adSettings.homePageBanner, enabled: checked }
                })
              }
            />
            <Label className="text-white">Enable Homepage Banner</Label>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Banner Position</Label>
            <Select 
              value={adSettings.homePageBanner.position}
              onValueChange={(value: 'top' | 'bottom' | 'middle') =>
                setAdSettings({
                  ...adSettings,
                  homePageBanner: { ...adSettings.homePageBanner, position: value }
                })
              }
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="top">Top of Page</SelectItem>
                <SelectItem value="middle">Middle of Page</SelectItem>
                <SelectItem value="bottom">Bottom of Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Ad Code (HTML/JavaScript)</Label>
            <Textarea 
              placeholder="Paste your Google AdSense or other ad code here..."
              value={adSettings.homePageBanner.code}
              onChange={(e) => 
                setAdSettings({
                  ...adSettings,
                  homePageBanner: { ...adSettings.homePageBanner, code: e.target.value }
                })
              }
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePreview(adSettings.homePageBanner.code, 'Homepage Banner')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Ads */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Video Ads (Like MX Player)</CardTitle>
          <CardDescription className="text-gray-400">
            Configure pre-roll, mid-roll, and post-roll video advertisements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={adSettings.videoAds.enabled}
              onCheckedChange={(checked) => 
                setAdSettings({
                  ...adSettings,
                  videoAds: { ...adSettings.videoAds, enabled: checked }
                })
              }
            />
            <Label className="text-white">Enable Video Ads</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Mid-roll Ad Interval (seconds)</Label>
            <Input 
              type="number"
              placeholder="600"
              value={adSettings.videoAds.midRollInterval}
              onChange={(e) => 
                setAdSettings({
                  ...adSettings,
                  videoAds: { ...adSettings.videoAds, midRollInterval: parseInt(e.target.value) || 600 }
                })
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">How often to show mid-roll ads (default: 600 seconds = 10 minutes)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Pre-roll Ad (Before Video)</Label>
              <Textarea 
                placeholder="Video ad URL or embed code..."
                value={adSettings.videoAds.preRollAd}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    videoAds: { ...adSettings.videoAds, preRollAd: e.target.value }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Mid-roll Ad (During Video)</Label>
              <Textarea 
                placeholder="Video ad URL or embed code..."
                value={adSettings.videoAds.midRollAd}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    videoAds: { ...adSettings.videoAds, midRollAd: e.target.value }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Post-roll Ad (After Video)</Label>
              <Textarea 
                placeholder="Video ad URL or embed code..."
                value={adSettings.videoAds.postRollAd}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    videoAds: { ...adSettings.videoAds, postRollAd: e.target.value }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Page Ads */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Download Page Ads</CardTitle>
          <CardDescription className="text-gray-400">
            Show ads before and after download links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={adSettings.downloadPageAds.enabled}
              onCheckedChange={(checked) => 
                setAdSettings({
                  ...adSettings,
                  downloadPageAds: { ...adSettings.downloadPageAds, enabled: checked }
                })
              }
            />
            <Label className="text-white">Enable Download Page Ads</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Before Download Ad</Label>
              <Textarea 
                placeholder="Ad code to show before download button..."
                value={adSettings.downloadPageAds.beforeDownload}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    downloadPageAds: { ...adSettings.downloadPageAds, beforeDownload: e.target.value }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">After Download Ad</Label>
              <Textarea 
                placeholder="Ad code to show after download starts..."
                value={adSettings.downloadPageAds.afterDownload}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    downloadPageAds: { ...adSettings.downloadPageAds, afterDownload: e.target.value }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popup & Sidebar Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sidebar Ads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={adSettings.sidebarAds.enabled}
                onCheckedChange={(checked) => 
                  setAdSettings({
                    ...adSettings,
                    sidebarAds: { ...adSettings.sidebarAds, enabled: checked }
                  })
                }
              />
              <Label className="text-white">Enable Sidebar Ads</Label>
            </div>
            
            <Textarea 
              placeholder="Sidebar ad code..."
              value={adSettings.sidebarAds.code}
              onChange={(e) => 
                setAdSettings({
                  ...adSettings,
                  sidebarAds: { ...adSettings.sidebarAds, code: e.target.value }
                })
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Popup Ads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={adSettings.popupAds.enabled}
                onCheckedChange={(checked) => 
                  setAdSettings({
                    ...adSettings,
                    popupAds: { ...adSettings.popupAds, enabled: checked }
                  })
                }
              />
              <Label className="text-white">Enable Popup Ads</Label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Frequency (minutes)</Label>
              <Input 
                type="number"
                placeholder="30"
                value={adSettings.popupAds.frequency}
                onChange={(e) => 
                  setAdSettings({
                    ...adSettings,
                    popupAds: { ...adSettings.popupAds, frequency: parseInt(e.target.value) || 30 }
                  })
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <Textarea 
              placeholder="Popup ad code..."
              value={adSettings.popupAds.code}
              onChange={(e) => 
                setAdSettings({
                  ...adSettings,
                  popupAds: { ...adSettings.popupAds, code: e.target.value }
                })
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save All Ad Settings'}
      </Button>
    </div>
  );
};

export default AdManager;
