
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedMovie, AdminSettings as AdminSettingsType, Analytics, UserRole } from '@/types/admin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import MovieManager from '@/components/admin/MovieManager';
import AnalyticsSection from '@/components/admin/AnalyticsSection';
import NotificationManager from '@/components/admin/NotificationManager';
import BulkImport from '@/components/admin/BulkImport';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam']);
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
    database: 'supabase',
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
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setMovies(data.map(movie => ({
          id: movie.id,
          title: movie.title,
          description: movie.description || '',
          posterUrl: movie.poster_url,
          videoUrl: movie.video_url,
          genre: movie.genre,
          category: movie.category as any,
          rating: movie.rating,
          duration: movie.duration,
          releaseYear: movie.release_year,
          language: 'English',
          tags: '',
          telegramChannel: 'https://t.me/+nRJaGvh8DMNlMzNl',
          viewCount: Math.floor(Math.random() * 10000),
          downloadCount: Math.floor(Math.random() * 5000)
        })));
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load movies',
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
    setAnalytics({
      totalViews: movies.reduce((sum, movie) => sum + (movie.viewCount || 0), 0),
      totalDownloads: movies.reduce((sum, movie) => sum + (movie.downloadCount || 0), 0),
      adClicks: Math.floor(Math.random() * 1000),
      topMovies: movies.slice(0, 5),
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-gray-900 text-xs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">Dashboard</TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-red-600">Movies</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">Analytics</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-red-600">Notify</TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-red-600">Bulk</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">Settings</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-red-600">Ads</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard 
              movies={movies}
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
              movies={movies}
            />
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
