
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Eye, Upload, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logo: string;
  favicon: string;
  splashScreen: {
    enabled: boolean;
    logo: string;
    text: string;
    duration: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  footer: {
    copyrightText: string;
    socialLinks: {
      youtube: string;
      facebook: string;
      instagram: string;
      telegram: string;
    };
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

const SiteCustomization = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Entertainment Hub',
    siteTagline: 'Your Ultimate Entertainment Destination',
    logo: '',
    favicon: '',
    splashScreen: {
      enabled: true,
      logo: '',
      text: 'Entertainment Hub',
      duration: 3000
    },
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#dc2626',
      backgroundColor: '#000000',
      textColor: '#ffffff'
    },
    footer: {
      copyrightText: '© 2024 Entertainment Hub. All rights reserved.',
      socialLinks: {
        youtube: 'https://www.youtube.com/@Jgroupsentertainmenthub048',
        facebook: 'https://www.facebook.com/profile.php?id=61573079981019',
        instagram: 'https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli',
        telegram: 'https://t.me/+nRJaGvh8DMNlMzNl'
      }
    },
    seo: {
      metaTitle: 'Entertainment Hub - Movies, Web Series & Live TV',
      metaDescription: 'Watch latest movies, web series, and live TV shows online. Download high-quality content for free.',
      keywords: 'movies, web series, live tv, entertainment, streaming, download'
    }
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('entertainment-hub-site-settings');
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    setLoading(true);
    
    // Save to localStorage
    localStorage.setItem('entertainment-hub-site-settings', JSON.stringify(siteSettings));
    
    // Apply theme changes to document
    document.documentElement.style.setProperty('--primary-color', siteSettings.theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', siteSettings.theme.secondaryColor);
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Success!',
        description: 'Site settings saved successfully',
      });
    }, 1000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (field === 'logo') {
          setSiteSettings({
            ...siteSettings,
            logo: imageUrl
          });
        } else if (field === 'splashLogo') {
          setSiteSettings({
            ...siteSettings,
            splashScreen: {
              ...siteSettings.splashScreen,
              logo: imageUrl
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openPreview = () => {
    const previewWindow = window.open('/', '_blank');
    if (previewWindow) {
      toast({
        title: 'Preview Opened',
        description: 'Check the new window to see your changes',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Branding */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Site Branding</CardTitle>
          <CardDescription className="text-gray-400">
            Customize your site name, logo, and basic branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Site Name</Label>
              <Input 
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  siteName: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Site Tagline</Label>
              <Input 
                value={siteSettings.siteTagline}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  siteTagline: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Logo Upload</Label>
              <Input 
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="bg-gray-800 border-gray-600 text-white"
              />
              {siteSettings.logo && (
                <img src={siteSettings.logo} alt="Logo Preview" className="w-20 h-20 object-contain" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Favicon URL</Label>
              <Input 
                value={siteSettings.favicon}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  favicon: e.target.value
                })}
                placeholder="https://example.com/favicon.ico"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Splash Screen */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Splash Screen</CardTitle>
          <CardDescription className="text-gray-400">
            Configure the loading screen that appears when users visit your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={siteSettings.splashScreen.enabled}
              onCheckedChange={(checked) => 
                setSiteSettings({
                  ...siteSettings,
                  splashScreen: { ...siteSettings.splashScreen, enabled: checked }
                })
              }
            />
            <Label className="text-white">Enable Splash Screen</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Splash Logo</Label>
              <Input 
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'splashLogo')}
                className="bg-gray-800 border-gray-600 text-white"
              />
              {siteSettings.splashScreen.logo && (
                <img src={siteSettings.splashScreen.logo} alt="Splash Logo" className="w-16 h-16 object-contain" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Splash Text</Label>
              <Input 
                value={siteSettings.splashScreen.text}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  splashScreen: { ...siteSettings.splashScreen, text: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Duration (ms)</Label>
              <Input 
                type="number"
                value={siteSettings.splashScreen.duration}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  splashScreen: { ...siteSettings.splashScreen, duration: parseInt(e.target.value) || 3000 }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Theme Colors
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize your site's color scheme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Primary Color</Label>
              <Input 
                type="color"
                value={siteSettings.theme.primaryColor}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  theme: { ...siteSettings.theme, primaryColor: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Secondary Color</Label>
              <Input 
                type="color"
                value={siteSettings.theme.secondaryColor}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  theme: { ...siteSettings.theme, secondaryColor: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Background Color</Label>
              <Input 
                type="color"
                value={siteSettings.theme.backgroundColor}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  theme: { ...siteSettings.theme, backgroundColor: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Text Color</Label>
              <Input 
                type="color"
                value={siteSettings.theme.textColor}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  theme: { ...siteSettings.theme, textColor: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">SEO Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Optimize your site for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Meta Title</Label>
            <Input 
              value={siteSettings.seo.metaTitle}
              onChange={(e) => setSiteSettings({
                ...siteSettings,
                seo: { ...siteSettings.seo, metaTitle: e.target.value }
              })}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Meta Description</Label>
            <Textarea 
              value={siteSettings.seo.metaDescription}
              onChange={(e) => setSiteSettings({
                ...siteSettings,
                seo: { ...siteSettings.seo, metaDescription: e.target.value }
              })}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Keywords (comma separated)</Label>
            <Input 
              value={siteSettings.seo.keywords}
              onChange={(e) => setSiteSettings({
                ...siteSettings,
                seo: { ...siteSettings.seo, keywords: e.target.value }
              })}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
        
        <Button onClick={openPreview} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview Site
        </Button>
      </div>
    </div>
  );
};

export default SiteCustomization;
