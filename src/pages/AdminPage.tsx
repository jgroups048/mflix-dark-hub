import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Save, Database, Settings, Video, Image, Star, Upload, Calendar, Users, BarChart3, Bell, Shield, Palette, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';

interface ExtendedMovie extends Movie {
  downloadLinks?: {
    quality: string;
    url: string;
    size: string;
  }[];
  language?: string;
  tags?: string;
  telegramChannel?: string;
  isFeatured?: boolean;
  releaseDate?: string;
  isScheduled?: boolean;
  commentsEnabled?: boolean;
  ratingsEnabled?: boolean;
  viewCount?: number;
  downloadCount?: number;
}

interface AdminSettings {
  adsEnabled: boolean;
  adInterval: number;
  database: 'supabase' | 'firebase';
  homePageBanner: string;
  videoBanner: string;
  midRollAd: string;
  darkMode: boolean;
  notifications: boolean;
  contentProtection: boolean;
  watchHistory: boolean;
  autoFetchTrailers: boolean;
}

interface Analytics {
  totalViews: number;
  totalDownloads: number;
  adClicks: number;
  topMovies: ExtendedMovie[];
  recentActivity: any[];
}

interface UserRole {
  id: string;
  email: string;
  role: 'super_admin' | 'editor' | 'ad_manager';
  createdAt: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ExtendedMovie | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
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
  
  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
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

  // Form Data State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    genre: '',
    releaseYear: '',
    duration: '',
    rating: '',
    posterUrl: '',
    videoUrl: '',
    description: '',
    language: 'English',
    tags: '',
    telegramChannel: 'https://t.me/+nRJaGvh8DMNlMzNl',
    downloadUrl: '',
    trailerUrl: '',
    isFeatured: false,
    releaseDate: '',
    isScheduled: false,
    commentsEnabled: true,
    ratingsEnabled: true
  });

  const [csvData, setCsvData] = useState('');
  const [notificationText, setNotificationText] = useState('');

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
    // Mock analytics data - in real app, fetch from database
    setAnalytics({
      totalViews: movies.reduce((sum, movie) => sum + (movie.viewCount || 0), 0),
      totalDownloads: movies.reduce((sum, movie) => sum + (movie.downloadCount || 0), 0),
      adClicks: Math.floor(Math.random() * 1000),
      topMovies: movies.slice(0, 5),
      recentActivity: []
    });
  };

  const loadUserRoles = () => {
    // Mock user roles - in real app, fetch from database
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      genre: '',
      releaseYear: '',
      duration: '',
      rating: '',
      posterUrl: '',
      videoUrl: '',
      description: '',
      language: 'English',
      tags: '',
      telegramChannel: 'https://t.me/+nRJaGvh8DMNlMzNl',
      downloadUrl: '',
      trailerUrl: '',
      isFeatured: false,
      releaseDate: '',
      isScheduled: false,
      commentsEnabled: true,
      ratingsEnabled: true
    });
    setEditingMovie(null);
  };

  const validateYoutubeUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const autoFetchTrailer = async (movieTitle: string) => {
    if (!adminSettings.autoFetchTrailers) return '';
    
    // Mock auto-fetch - in real app, use YouTube API
    return `https://www.youtube.com/embed/sample_${movieTitle.toLowerCase().replace(/\s+/g, '_')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!formData.title || !formData.category || !formData.genre ||
          !formData.releaseYear || !formData.duration || !formData.rating ||
          !formData.posterUrl || !formData.videoUrl) {
        toast({
          title: 'Missing fields',
          description: 'Please fill all required fields',
          variant: 'destructive'
        });
        return;
      }
      
      const processedVideoUrl = validateYoutubeUrl(formData.videoUrl);
      const autoTrailerUrl = await autoFetchTrailer(formData.title);
      
      const movieData = {
        title: formData.title,
        description: formData.description,
        poster_url: formData.posterUrl,
        video_url: processedVideoUrl,
        genre: formData.genre,
        category: formData.category,
        duration: formData.duration,
        rating: parseFloat(formData.rating),
        release_year: parseInt(formData.releaseYear)
      };

      let result;
      if (editingMovie) {
        result = await supabase
          .from('movies')
          .update(movieData)
          .eq('id', editingMovie.id)
          .select();
      } else {
        result = await supabase
          .from('movies')
          .insert([movieData])
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success!',
        description: editingMovie ? 'Content updated successfully' : 'Content uploaded successfully',
      });

      resetForm();
      fetchMovies();
    } catch (error: any) {
      console.error('Operation error:', error);
      toast({
        title: editingMovie ? 'Update failed' : 'Upload failed',
        description: `Error: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setLoading(true);
      const rows = csvData.split('\n').slice(1); // Skip header
      
      for (const row of rows) {
        const [title, description, posterUrl, trailerUrl, videoUrl, genre, category] = row.split(',');
        
        if (title && posterUrl && videoUrl) {
          await supabase
            .from('movies')
            .insert([{
              title: title.trim(),
              description: description?.trim() || '',
              poster_url: posterUrl.trim(),
              video_url: videoUrl.trim(),
              genre: genre?.trim() || 'Action',
              category: category?.trim() || 'movies',
              duration: '2h 30m',
              rating: 8.0,
              release_year: 2024
            }]);
        }
      }
      
      toast({
        title: 'Bulk Import Complete',
        description: 'Movies imported successfully',
      });
      
      setCsvData('');
      fetchMovies();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Error importing movies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    // Mock notification - in real app, use Firebase/OneSignal
    toast({
      title: 'Notification Sent',
      description: `Sent: "${notificationText}" to all users`,
    });
    setNotificationText('');
  };

  const totalMovies = movies.length;
  const featuredMovies = movies.filter(m => m.isFeatured).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-red-500">Entertainment Hub Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-12 bg-gray-900 text-xs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">Dashboard</TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-red-600">Movies</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-red-600">Featured</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">Analytics</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-red-600">Ads</TabsTrigger>
            <TabsTrigger value="genres" className="data-[state=active]:bg-red-600">Genres</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-red-600">Notify</TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-red-600">Bulk</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">Users</TabsTrigger>
            <TabsTrigger value="protection" className="data-[state=active]:bg-red-600">Security</TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:bg-red-600">Theme</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{totalMovies}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Featured</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{featuredMovies}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{analytics.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{analytics.totalDownloads.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Ad Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{analytics.adClicks}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setFormData({...formData})}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Content
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import CSV
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movies.slice(0, 5).map((movie) => (
                      <div key={movie.id} className="flex items-center space-x-4 p-2 border border-gray-700 rounded">
                        <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{movie.title}</h4>
                          <p className="text-sm text-gray-400">{movie.viewCount} views • {movie.downloadCount} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Movies Management Tab */}
          <TabsContent value="movies" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Smart Movie Manager</CardTitle>
                <CardDescription className="text-gray-400">
                  Add movies with AI-powered genre detection and automatic page generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter movie title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange(value, 'category')}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                          <SelectItem value="webseries">Web Series</SelectItem>
                          <SelectItem value="movies">Movies</SelectItem>
                          <SelectItem value="livetv">Live TV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-white">Genre *</Label>
                      <Select 
                        value={formData.genre} 
                        onValueChange={(value) => handleSelectChange(value, 'genre')}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {genres.map(genre => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-white">Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleSelectChange(value, 'language')}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {languages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="releaseYear" className="text-white">Release Year *</Label>
                      <Input 
                        id="releaseYear" 
                        type="number" 
                        placeholder="2024" 
                        value={formData.releaseYear}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white">Duration *</Label>
                      <Input 
                        id="duration" 
                        placeholder="e.g., 2h 30m" 
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-white">Rating *</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        step="0.1" 
                        max="10" 
                        placeholder="8.5" 
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="releaseDate" className="text-white">Release Date (Optional)</Label>
                      <Input 
                        id="releaseDate" 
                        type="date"
                        value={formData.releaseDate}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="posterUrl" className="text-white">Poster URL *</Label>
                      <Input 
                        id="posterUrl" 
                        type="url" 
                        placeholder="https://example.com/poster.jpg" 
                        value={formData.posterUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="trailerUrl" className="text-white">Trailer URL (YouTube)</Label>
                      <Input 
                        id="trailerUrl" 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={formData.trailerUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      {adminSettings.autoFetchTrailers && (
                        <p className="text-xs text-blue-400">Auto-fetch enabled: Will fetch trailer automatically based on title</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="videoUrl" className="text-white">Google Drive Video URL *</Label>
                      <Input 
                        id="videoUrl" 
                        type="url" 
                        placeholder="https://drive.google.com/file/d/FILE_ID/view" 
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
                      <p className="text-xs text-gray-400">Will be converted to preview link automatically</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="downloadUrl" className="text-white">Download URL</Label>
                      <Input 
                        id="downloadUrl" 
                        type="url" 
                        placeholder="https://drive.google.com/file/..." 
                        value={formData.downloadUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="tags" className="text-white">Tags (SEO)</Label>
                      <Input 
                        id="tags" 
                        placeholder="action, thriller, superhero" 
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter detailed description..." 
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="featured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, isFeatured: checked})
                        }
                      />
                      <Label htmlFor="featured" className="text-white">Featured</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="scheduled"
                        checked={formData.isScheduled}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, isScheduled: checked})
                        }
                      />
                      <Label htmlFor="scheduled" className="text-white">Scheduled</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="comments"
                        checked={formData.commentsEnabled}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, commentsEnabled: checked})
                        }
                      />
                      <Label htmlFor="comments" className="text-white">Comments</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="ratings"
                        checked={formData.ratingsEnabled}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, ratingsEnabled: checked})
                        }
                      />
                      <Label htmlFor="ratings" className="text-white">Ratings</Label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? (editingMovie ? 'Updating...' : 'Adding...') : (editingMovie ? 'Update Content' : 'Add Content')}
                    </Button>
                    {editingMovie && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Content Tab */}
          <TabsContent value="featured" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Homepage Trailer Control</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Control which movie appears as featured trailer on homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Select Featured Movie</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Choose which movie to feature" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {movies.map(movie => (
                          <SelectItem key={movie.id} value={movie.id}>
                            {movie.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Featured Description Override</Label>
                    <Textarea 
                      placeholder="Custom description for homepage hero section..."
                      rows={3}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">"Watch Now" Button Link</Label>
                      <Input 
                        placeholder="/watch/movie-id" 
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">"More Info" Button Link</Label>
                      <Input 
                        placeholder="/watch/movie-id" 
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <Button className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  Update Featured Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Real-Time Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Views</span>
                      <span className="text-red-500 font-bold">{analytics.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Downloads</span>
                      <span className="text-red-500 font-bold">{analytics.totalDownloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ad Clicks</span>
                      <span className="text-red-500 font-bold">{analytics.adClicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Users (24h)</span>
                      <span className="text-red-500 font-bold">{Math.floor(Math.random() * 1000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {movies.slice(0, 5).map((movie, index) => (
                      <div key={movie.id} className="flex items-center space-x-3">
                        <span className="text-red-500 font-bold">#{index + 1}</span>
                        <img src={movie.posterUrl} alt={movie.title} className="w-8 h-10 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-white text-sm">{movie.title}</p>
                          <p className="text-xs text-gray-400">{movie.viewCount} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Push Notifications</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Send notifications to all users via Firebase/OneSignal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Notification Message</Label>
                    <Textarea 
                      placeholder="Enter notification message..."
                      value={notificationText}
                      onChange={(e) => setNotificationText(e.target.value)}
                      rows={3}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Notification Type</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="new_content">New Content</SelectItem>
                        <SelectItem value="update">App Update</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={sendNotification}
                  disabled={!notificationText}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Bulk Import via CSV</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload multiple movies at once using CSV format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">CSV Format</Label>
                    <div className="bg-gray-800 p-4 rounded border border-gray-600">
                      <p className="text-xs text-gray-300 font-mono">
                        title,description,poster_url,trailer_url,video_url,genre,category<br/>
                        Movie Title,Description here,https://poster.jpg,https://trailer.com,https://drive.google.com/file/d/ID/view,Action,movies
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">CSV Data</Label>
                    <Textarea 
                      placeholder="Paste your CSV data here..."
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      rows={8}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBulkImport}
                  disabled={!csvData || loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'Importing...' : 'Import Movies'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>General Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notifications"
                      checked={adminSettings.notifications}
                      onCheckedChange={(checked) => 
                        setAdminSettings({...adminSettings, notifications: checked})
                      }
                    />
                    <Label htmlFor="notifications" className="text-white">Enable Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="watchHistory"
                      checked={adminSettings.watchHistory}
                      onCheckedChange={(checked) => 
                        setAdminSettings({...adminSettings, watchHistory: checked})
                      }
                    />
                    <Label htmlFor="watchHistory" className="text-white">Watch History</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoFetch"
                      checked={adminSettings.autoFetchTrailers}
                      onCheckedChange={(checked) => 
                        setAdminSettings({...adminSettings, autoFetchTrailers: checked})
                      }
                    />
                    <Label htmlFor="autoFetch" className="text-white">Auto-Fetch Trailers</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Database Provider</Label>
                    <Select 
                      value={adminSettings.database} 
                      onValueChange={(value: 'supabase' | 'firebase') => 
                        setAdminSettings({...adminSettings, database: value})
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="supabase">Supabase</SelectItem>
                        <SelectItem value="firebase">Firebase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Social Media Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Input 
                      placeholder="YouTube Channel" 
                      defaultValue="https://www.youtube.com/@Jgroupsentertainmenthub048"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input 
                      placeholder="Facebook Page" 
                      defaultValue="https://www.facebook.com/profile.php?id=61573079981019"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input 
                      placeholder="Instagram Profile" 
                      defaultValue="https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input 
                      placeholder="Telegram Group" 
                      defaultValue="https://t.me/+nRJaGvh8DMNlMzNl"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={saveAdminSettings} className="bg-red-600 hover:bg-red-700">
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {}}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
