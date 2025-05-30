import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllVideos, Movie } from '@/lib/firebaseServices/videoService';
import { AdminSettings as AdminSettingsType, Analytics, ExtendedMovie, UserRole } from '@/types/admin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import MovieManager from '@/components/admin/MovieManager';
import AnalyticsSection from '@/components/admin/AnalyticsSection';
import NotificationManager from '@/components/admin/NotificationManager';
import BulkImport from '@/components/admin/BulkImport';
import AdminSettings from '@/components/admin/AdminSettings';
import AdManager from '@/components/admin/AdManager';
import SiteCustomization from '@/components/admin/SiteCustomization';
import SplashScreenAdmin from '@/components/admin/SplashScreenAdmin';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Animation', 'Crime', 'Documentary', 'Fantasy', 'Mystery']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Gujarati', 'Marathi', 'Punjabi']);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalDownloads: 0,
    adClicks: 0,
    topMovies: [],
    recentActivity: []
  });
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  
  const [adminSettings, setAdminSettings] = useState<AdminSettingsType>({
    adsEnabled: true,
    adInterval: 10,
    database: 'firebase',
    homePageBanner: '',
    videoBanner: '',
    midRollAd: '',
    darkMode: false,
    notifications: true,
    contentProtection: false,
    watchHistory: true,
    autoFetchTrailers: false
  });

  useEffect(() => {
    fetchMovies();
    loadAdminSettings();
    loadAnalytics();
    loadUserRoles();
    
    // Set up real-time analytics updates
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const firestoreMovies = await getAllVideos();
      setMovies(firestoreMovies);
    } catch (error) {
      console.error('Error fetching movies from Firestore:', error);
      toast({
        title: 'Error',
        description: 'Failed to load movies from Firestore',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSettings = () => {
    const savedSettings = localStorage.getItem('entertainment-hub-admin-settings');
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }
  };

  const loadAnalytics = () => {
    // Simulate real-time analytics with random fluctuations
    const baseViews = movies.reduce((sum, movie) => sum + (movie.viewCount || 0), 0);
    const baseDownloads = movies.reduce((sum, movie) => sum + (movie.downloadCount || 0), 0);
    
    setAnalytics({
      totalViews: baseViews + Math.floor(Math.random() * 100),
      totalDownloads: baseDownloads + Math.floor(Math.random() * 50),
      adClicks: Math.floor(Math.random() * 1000) + 500,
      topMovies: movies.slice(0, 5) as any,
      recentActivity: []
    });
  };

  const loadUserRoles = () => {
    setUserRoles([
      { id: '1', email: 'admin@entertainmenthub.com', role: 'super_admin', createdAt: '2024-01-01' },
      { id: '2', email: 'editor@entertainmenthub.com', role: 'editor', createdAt: '2024-01-15' }
    ]);
  };

  const saveAdminSettings = () => {
    localStorage.setItem('entertainment-hub-admin-settings', JSON.stringify(adminSettings));
    toast({
      title: 'Settings Saved',
      description: 'Admin settings have been saved successfully',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-red-900/30 bg-black/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-white hover:text-red-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-red-500">Entertainment Hub Admin Panel</h1>
            </div>
            <div className="text-sm text-gray-400">
              Real-time Updates: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-10 bg-gray-900 text-xs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">Dashboard</TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-red-600">Movies</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">Analytics</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-red-600">Ads</TabsTrigger>
            <TabsTrigger value="site" className="data-[state=active]:bg-red-600">Site</TabsTrigger>
            <TabsTrigger value="splashAdmin" className="data-[state=active]:bg-red-600">Splash (New)</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-red-600">Notify</TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-red-600">Bulk</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">Settings</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard 
              movies={movies as ExtendedMovie[]}
              analytics={analytics}
              onAddContent={() => {}}
              onBulkImport={() => {}}
              onSendNotification={() => {}}
            />
          </TabsContent>

          <TabsContent value="movies" className="mt-6">
            <MovieManager 
              movies={movies}
              adminSettings={adminSettings}
              genres={genres}
              languages={languages}
              onMoviesUpdate={fetchMovies}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsSection 
              analytics={analytics}
              movies={movies as ExtendedMovie[]}
            />
          </TabsContent>

          <TabsContent value="ads" className="mt-6">
            <AdManager />
          </TabsContent>

          <TabsContent value="site" className="mt-6">
            <SiteCustomization />
          </TabsContent>

          <TabsContent value="splashAdmin" className="mt-6">
            <SplashScreenAdmin />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationManager />
          </TabsContent>

          <TabsContent value="bulk" className="mt-6">
            <BulkImport onImportComplete={fetchMovies} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings 
              adminSettings={adminSettings}
              setAdminSettings={setAdminSettings}
              onSave={saveAdminSettings}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-4">User Management</h3>
              <p className="text-gray-400">User management features coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
