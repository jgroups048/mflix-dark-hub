import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Eye, Upload, Palette, Film, Link2, Tv2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    HeaderTrailer,
    getHeaderTrailer,
    updateHeaderTrailer 
} from '@/lib/firebaseServices/trailerService';
import { 
    SiteSettings, 
    getSiteSettings, 
    updateSiteSettings 
} from '@/lib/firebaseServices/siteSettingsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SplashScreen from '@/components/SplashScreen';
import { Toaster } from 'sonner';

const initialHeaderTrailerData: Omit<HeaderTrailer, 'id' | 'updatedAt'> & { manualOverride?: boolean } = {
    youtubeUrl: '',
    movieTitle: '',
    description: '',
    watchNowUrl: '',
    moreInfoUrl: '',
    manualOverride: false,
};

const initialSiteSettingsData: SiteSettings = {
    siteName: 'Entertainment Hub',
    siteTagline: 'Your Ultimate Entertainment Destination',
    logoUrl: '',
    faviconUrl: '',
    heroLogoUrl: '',
    videoOverlayLogoUrl: '',
    videoOverlayPosition: 'bottom-right',
    splashScreen: {
      enabled: true,
      mode: 'image',
      videoUrl: '',
      imageUrl: '',
      logoUrl: '',
      soundUrl: '',
      duration: 5000
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
        telegram: 'https://t.me/+nRJaGvh8DMNlMzNl',
        twitter: ''
      }
    },
    seo: {
      metaTitle: 'Entertainment Hub - Movies, Web Series & Live TV',
      metaDescription: 'Watch latest movies, web series, and live TV shows online. Download high-quality content for free.',
      keywords: 'movies, web series, live tv, entertainment, streaming, download'
    }
};

const SiteCustomization = () => {
  const { toast } = useToast();
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [trailerLoading, setTrailerLoading] = useState(true);
  const [logoSaving, setLogoSaving] = useState(false);
  const [splashLogoSaving, setSplashLogoSaving] = useState(false);
  const [heroLogoSaving, setHeroLogoSaving] = useState(false);
  const [videoOverlayLogoSaving, setVideoOverlayLogoSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [allSettingsSaving, setAllSettingsSaving] = useState(false);
  const [showTestSplash, setShowTestSplash] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettingsData);
  const [headerTrailerData, setHeaderTrailerData] = useState<Omit<HeaderTrailer, 'id' | 'updatedAt'> & { manualOverride?: boolean }>(initialHeaderTrailerData);

  useEffect(() => {
    const loadSiteSettings = async () => {
        setSiteSettingsLoading(true);
        try {
            const settingsFromDb = await getSiteSettings();
            if (settingsFromDb) {
                setSiteSettings(prev => ({ 
                    ...initialSiteSettingsData,
                    ...settingsFromDb,
                    splashScreen: { 
                        ...initialSiteSettingsData.splashScreen, 
                        ...settingsFromDb.splashScreen 
                    },
                    theme: { 
                        ...initialSiteSettingsData.theme, 
                        ...settingsFromDb.theme 
                    },
                    footer: {
                         ...initialSiteSettingsData.footer,
                         ...settingsFromDb.footer,
                         socialLinks: { 
                            ...initialSiteSettingsData.footer?.socialLinks, 
                            ...settingsFromDb.footer?.socialLinks 
                        }
                    },
                    seo: { 
                        ...initialSiteSettingsData.seo, 
                        ...settingsFromDb.seo 
                    },
                })); 
            } else {
                console.log("No site settings found in Firestore, using initial defaults.");
                setSiteSettings(initialSiteSettingsData);
            }
        } catch (error) {
            console.error("Error fetching site settings:", error);
            toast({ title: 'Error Loading Site Settings', description: (error as Error).message || 'Could not load site settings.', variant: 'destructive' });
        }
        setSiteSettingsLoading(false);
    };

    const fetchTrailer = async () => {
        setTrailerLoading(true);
        try {
            const trailerConfig = await getHeaderTrailer();
            if (trailerConfig) {
                const { id, updatedAt, ...dataToSet } = trailerConfig;
                setHeaderTrailerData(prev => ({...prev, ...dataToSet}));
            }
        } catch (error) {
            console.error("Error fetching header trailer:", error);
            toast({ title: 'Error Loading Header Trailer', description: (error as Error).message || 'Could not load header trailer data.', variant: 'destructive' });
        }
        setTrailerLoading(false);
    };

    loadSiteSettings();
    fetchTrailer();
  }, [toast]);

  const handleSiteSettingChange = <K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedSiteSettingChange = <K extends keyof SiteSettings, NK extends keyof NonNullable<SiteSettings[K]>>(
    section: K,
    field: NK,
    value: NonNullable<SiteSettings[K]>[NK]
  ) => {
    setSiteSettings(prev => ({
        ...prev,
        [section]: {
        ...(prev[section] as object),
            [field]: value,
      },
    }));
  };

  const handleSocialLinkChange = (platform: keyof NonNullable<NonNullable<SiteSettings['footer']>['socialLinks']>, value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      footer: {
        ...(prev.footer || initialSiteSettingsData.footer!),
        socialLinks: {
          ...(prev.footer?.socialLinks || initialSiteSettingsData.footer?.socialLinks!),
          [platform]: value,
        },
      },
    }));
  };

  const handleTrailerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHeaderTrailerData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrailerSwitchChange = (checked: boolean) => {
    setHeaderTrailerData(prev => ({ ...prev, manualOverride: checked }));
  };

  const handleSaveTrailer = async () => {
    setTrailerLoading(true);
    try {
      const dataToSave = { ...headerTrailerData };
      await updateHeaderTrailer(dataToSave);
      toast({ title: 'Success!', description: 'Homepage header trailer updated successfully.' });
    } catch (error) {
        console.error("Error saving header trailer:", error);
      toast({ title: 'Error Saving Trailer', description: (error as Error).message || 'Could not save homepage trailer data.', variant: 'destructive' });
    }
    setTrailerLoading(false);
  };

  const handleSaveSiteSettings = async () => {
    setSiteSettingsLoading(true);
    try {
      await updateSiteSettings(siteSettings);
      toast({ title: 'Success!', description: 'Site settings saved successfully' });
    } catch (error) {
      console.error("Error saving site settings:", error);
      toast({ title: 'Error Saving Settings', description: (error as Error).message || 'Could not save site settings.', variant: 'destructive' });
    }
    setSiteSettingsLoading(false);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'faviconUrl'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (field === 'faviconUrl') {
          handleSiteSettingChange('faviconUrl', imageUrl);
        } 
        toast({ title: 'Image Ready', description: 'Image loaded for Favicon. Save settings to apply.'});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    setLogoSaving(true);
    try {
      await updateSiteSettings({ logoUrl: siteSettings.logoUrl || '' });
      toast({ title: 'Logo Updated', description: 'Site logo updated successfully.' });
    } catch (error) {
      console.error("Error saving logo:", error);
      toast({ title: 'Logo Save Failed', description: (error as Error).message || 'Could not save logo.', variant: 'destructive' });
    }
    setLogoSaving(false);
  };

  const handleSaveSplashLogo = async () => {
    setSplashLogoSaving(true);
    try {
      const currentSplashScreenSettings = siteSettings.splashScreen || initialSiteSettingsData.splashScreen;
      await updateSiteSettings({ 
        splashScreen: { 
          ...currentSplashScreenSettings,
          logoUrl: siteSettings.splashScreen?.logoUrl || '' 
        }
      });
      toast({ title: 'Splash Screen Logo Updated', description: 'Splash screen logo updated successfully.' });
    } catch (error) {
      console.error("Error saving splash screen logo:", error);
      toast({ title: 'Splash Screen Logo Save Failed', description: (error as Error).message || 'Could not save splash screen logo.', variant: 'destructive' });
    }
    setSplashLogoSaving(false);
  };

  const handleSaveHeroLogo = async () => {
    setHeroLogoSaving(true);
    try {
      await updateSiteSettings({ heroLogoUrl: siteSettings.heroLogoUrl || '' });
      toast({ title: 'Hero Logo Updated', description: 'Hero section logo updated successfully.' });
    } catch (error) {
      console.error("Error saving hero logo:", error);
      toast({ title: 'Hero Logo Save Failed', description: (error as Error).message || 'Could not save hero logo.', variant: 'destructive' });
    }
    setHeroLogoSaving(false);
  };

  const anySavingInProgress = siteSettingsLoading || logoSaving || splashLogoSaving || heroLogoSaving || videoOverlayLogoSaving || themeSaving || allSettingsSaving || trailerLoading;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Site Identity & Branding Card */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-red-500" /> Site Identity & Branding</CardTitle>
          <CardDescription className="text-gray-400">Customize your site's name, logo, and overall appearance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Site Name and Tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input 
                id="siteName" 
                value={siteSettings.siteName || ''} 
                onChange={(e) => handleSiteSettingChange('siteName', e.target.value)} 
                className="bg-gray-800 border-gray-600"
                disabled={anySavingInProgress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteTagline">Site Tagline</Label>
              <Input 
                id="siteTagline" 
                value={siteSettings.siteTagline || ''} 
                onChange={(e) => handleSiteSettingChange('siteTagline', e.target.value)} 
                className="bg-gray-800 border-gray-600"
                disabled={anySavingInProgress}
              />
            </div>
          </div>

          {/* Main Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Main Site Logo URL</Label>
            <div className="flex gap-2">
              <Input 
                id="logoUrl" 
                value={siteSettings.logoUrl || ''} 
                onChange={(e) => handleSiteSettingChange('logoUrl', e.target.value)} 
                placeholder="https://example.com/logo.png"
                className="bg-gray-800 border-gray-600 flex-grow"
                disabled={logoSaving || anySavingInProgress}
              />
              <Button onClick={handleSaveLogo} disabled={logoSaving || anySavingInProgress} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                {logoSaving ? 'Saving Logo...' : <><Save className="w-4 h-4 mr-2"/> Save Logo</>}
              </Button>
            </div>
          </div>
          
          {/* Hero Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="heroLogoUrl">Hero Section Logo URL</Label>
            <div className="flex gap-2">
              <Input 
                id="heroLogoUrl" 
                value={siteSettings.heroLogoUrl || ''} 
                onChange={(e) => handleSiteSettingChange('heroLogoUrl', e.target.value)} 
                placeholder="https://example.com/hero-logo.png"
                className="bg-gray-800 border-gray-600 flex-grow"
                disabled={heroLogoSaving || anySavingInProgress}
              />
              <Button onClick={handleSaveHeroLogo} disabled={heroLogoSaving || anySavingInProgress} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                {heroLogoSaving ? 'Saving Hero Logo...' : <><Save className="w-4 h-4 mr-2"/> Save Hero Logo</>}
              </Button>
            </div>
          </div>

          {/* Favicon URL (removed direct upload, assuming URL input for now) */}
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon URL</Label>
            <Input 
              id="faviconUrl" 
              value={siteSettings.faviconUrl || ''} 
              onChange={(e) => handleSiteSettingChange('faviconUrl', e.target.value)} 
              placeholder="https://example.com/favicon.ico"
              className="bg-gray-800 border-gray-600"
              disabled={anySavingInProgress}
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Player Settings Card - NEW */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Tv2 className="mr-2 h-5 w-5 text-red-500" /> Video Player Settings</CardTitle>
          <CardDescription className="text-gray-400">Customize video player overlays and behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="videoOverlayLogoUrl">Video Overlay Logo URL</Label>
            <Input 
              id="videoOverlayLogoUrl" 
              value={siteSettings.videoOverlayLogoUrl || ''} 
              onChange={(e) => handleSiteSettingChange('videoOverlayLogoUrl', e.target.value)} 
              placeholder="https://example.com/overlay-logo.png"
              className="bg-gray-800 border-gray-600"
              disabled={anySavingInProgress}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoOverlayPosition">Video Overlay Position</Label>
            <Select 
              value={siteSettings.videoOverlayPosition || 'bottom-right'}
              onValueChange={(value: SiteSettings['videoOverlayPosition']) => handleSiteSettingChange('videoOverlayPosition', value)}
              disabled={anySavingInProgress}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Theme Customization Card */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-red-500" /> Theme Customization</CardTitle>
          <CardDescription className="text-gray-400">Adjust your site's color scheme.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {(Object.keys(siteSettings.theme || initialSiteSettingsData.theme!) as Array<keyof NonNullable<SiteSettings['theme']>>).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`theme-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
              <div className="flex items-center gap-2">
                <Input id={`theme-${key}`} type="color" value={siteSettings.theme?.[key] || ''} onChange={(e) => handleNestedSiteSettingChange('theme', key, e.target.value)} className="bg-gray-800 border-gray-600 p-1 h-10 w-16" disabled={anySavingInProgress}/>
                <Input type="text" value={siteSettings.theme?.[key] || ''} onChange={(e) => handleNestedSiteSettingChange('theme', key, e.target.value)} className="bg-gray-800 border-gray-600" placeholder="#RRGGBB" disabled={anySavingInProgress}/>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Customization Card */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Link2 className="mr-2 h-5 w-5 text-red-500" /> Footer Settings</CardTitle>
          <CardDescription className="text-gray-400">Manage footer content and social media links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <Label htmlFor="copyrightText">Copyright Text</Label>
                <Input id="copyrightText" value={siteSettings.footer?.copyrightText || ''} onChange={(e) => handleNestedSiteSettingChange('footer', 'copyrightText', e.target.value)} className="bg-gray-800 border-gray-600" disabled={anySavingInProgress}/>
            </div>
            <h4 className="text-lg font-semibold text-gray-300 pt-2">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {(Object.keys(siteSettings.footer?.socialLinks || initialSiteSettingsData.footer?.socialLinks!) as Array<keyof NonNullable<SiteSettings['footer']>['socialLinks']>).map(platform => (
                    <div key={platform} className="space-y-1">
                        <Label htmlFor={`social-${platform}`} className="capitalize">{platform}</Label>
                        <Input id={`social-${platform}`} placeholder={`https://www.${platform}.com/yourpage`} value={siteSettings.footer?.socialLinks?.[platform] || ''} onChange={(e) => handleSocialLinkChange(platform, e.target.value)} className="bg-gray-800 border-gray-600" disabled={anySavingInProgress}/>
          </div>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings Card */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-red-500" /> SEO Settings</CardTitle>
          <CardDescription className="text-gray-400">Optimize your site for search engines.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input id="metaTitle" value={siteSettings.seo?.metaTitle || ''} onChange={(e) => handleNestedSiteSettingChange('seo', 'metaTitle', e.target.value)} className="bg-gray-800 border-gray-600" disabled={anySavingInProgress}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea id="metaDescription" value={siteSettings.seo?.metaDescription || ''} onChange={(e) => handleNestedSiteSettingChange('seo', 'metaDescription', e.target.value)} className="bg-gray-800 border-gray-600" rows={3} disabled={anySavingInProgress}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input id="keywords" value={siteSettings.seo?.keywords || ''} onChange={(e) => handleNestedSiteSettingChange('seo', 'keywords', e.target.value)} className="bg-gray-800 border-gray-600" disabled={anySavingInProgress}/>
          </div>
        </CardContent>
      </Card>
      
      {/* Homepage Header Trailer Card */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center"><Film className="mr-2 h-5 w-5 text-red-500" /> Homepage Header Trailer</CardTitle>
          <CardDescription className="text-gray-400">
            Configure the main video trailer shown on the homepage. This overrides the featured movie trailer if manual override is active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-2">
             <Switch id="manualOverrideTrailer" checked={headerTrailerData.manualOverride || false} onCheckedChange={handleTrailerSwitchChange} disabled={anySavingInProgress}/>
             <Label htmlFor="manualOverrideTrailer">Manual Override Featured Movie Trailer</Label>
          </div>
          {headerTrailerData.manualOverride && (
            <>
              <div className="space-y-2">
                <Label htmlFor="trailerYouTubeUrl">YouTube Video URL</Label>
                <Input id="trailerYouTubeUrl" name="youtubeUrl" value={headerTrailerData.youtubeUrl} onChange={handleTrailerInputChange} className="bg-gray-800 border-gray-600" placeholder="https://www.youtube.com/watch?v=..." disabled={anySavingInProgress}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerMovieTitle">Movie Title</Label>
                <Input id="trailerMovieTitle" name="movieTitle" value={headerTrailerData.movieTitle} onChange={handleTrailerInputChange} className="bg-gray-800 border-gray-600" disabled={anySavingInProgress}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerDescription">Description</Label>
                <Textarea id="trailerDescription" name="description" value={headerTrailerData.description} onChange={handleTrailerInputChange} className="bg-gray-800 border-gray-600" rows={3} disabled={anySavingInProgress}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
                  <Label htmlFor="trailerWatchNowUrl">"Watch Now" URL</Label>
                  <Input id="trailerWatchNowUrl" name="watchNowUrl" value={headerTrailerData.watchNowUrl} onChange={handleTrailerInputChange} className="bg-gray-800 border-gray-600" placeholder="/watch/movie-id" disabled={anySavingInProgress}/>
          </div>
          <div className="space-y-2">
                  <Label htmlFor="trailerMoreInfoUrl">"More Info" URL (Optional)</Label>
                  <Input id="trailerMoreInfoUrl" name="moreInfoUrl" value={headerTrailerData.moreInfoUrl || ''} onChange={handleTrailerInputChange} className="bg-gray-800 border-gray-600" placeholder="/details/movie-id" disabled={anySavingInProgress}/>
                </div>
          </div>
            </>
          )}
          <Button onClick={handleSaveTrailer} disabled={anySavingInProgress} className="w-full md:w-auto bg-red-600 hover:bg-red-700">
            {trailerLoading ? 'Saving Trailer...' : 'Save Homepage Trailer'}
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons: Save All Site Settings and Preview */}
      <div className="mt-8 flex justify-end">
        <Button 
            onClick={handleSaveSiteSettings} 
            disabled={anySavingInProgress}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
        >
          <Save className="w-5 h-5 mr-2" />
          Save All Site Settings
        </Button>
      </div>

      <Toaster richColors />
      {showTestSplash && siteSettings.splashScreen?.enabled && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center">
            {/* Wrapper to control test splash visibility without relying on sessionStorage */}
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <SplashScreen onComplete={() => setShowTestSplash(false)} ignoreSessionStorage={true} />
            </div>
        </div>
      )}
    </div>
  );
};

export default SiteCustomization;
