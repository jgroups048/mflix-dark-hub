
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
import { ArrowLeft, Plus, Edit, Trash2, Eye, Save, Database, Settings, Video, Image } from 'lucide-react';
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
}

interface AdminSettings {
  adsEnabled: boolean;
  adInterval: number;
  database: 'supabase' | 'firebase';
  homePageBanner: string;
  videoBanner: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ExtendedMovie | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  
  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adsEnabled: true,
    adInterval: 10,
    database: 'supabase',
    homePageBanner: '',
    videoBanner: ''
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
    trailerUrl: ''
  });

  useEffect(() => {
    fetchMovies();
    loadAdminSettings();
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
          telegramChannel: 'https://t.me/+nRJaGvh8DMNlMzNl'
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
    const savedSettings = localStorage.getItem('mflix-admin-settings');
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }
  };

  const saveAdminSettings = () => {
    localStorage.setItem('mflix-admin-settings', JSON.stringify(adminSettings));
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
      trailerUrl: ''
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
        description: editingMovie ? 'Movie updated successfully' : 'Movie uploaded successfully',
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

  const handleEdit = (movie: ExtendedMovie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      category: movie.category,
      genre: movie.genre,
      releaseYear: movie.releaseYear.toString(),
      duration: movie.duration,
      rating: movie.rating.toString(),
      posterUrl: movie.posterUrl,
      videoUrl: movie.videoUrl,
      description: movie.description,
      language: movie.language || 'English',
      tags: movie.tags || '',
      telegramChannel: movie.telegramChannel || 'https://t.me/+nRJaGvh8DMNlMzNl',
      downloadUrl: '',
      trailerUrl: ''
    });
  };

  const confirmDelete = (id: string) => {
    setMovieToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!movieToDelete) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieToDelete);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Movie has been deleted successfully',
      });

      fetchMovies();
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      toast({
        title: 'Deletion failed',
        description: `Error: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
    }
  };

  const totalMovies = movies.length;
  const latestMovie = movies[0];

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
                <img 
                  src="/lovable-uploads/8f44525e-2d28-4adb-adc9-c47803919a9f.png" 
                  alt="MFLIX" 
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-2xl font-bold text-red-500">MFLIX Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">Dashboard</TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-red-600">Add Movie</TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-red-600">Manage Movies</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-red-600">Ad Management</TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-red-600">Database</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Movies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{totalMovies}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Latest Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-white">{latestMovie?.title || 'No movies'}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {new Set(movies.map(m => m.category)).size}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {movies.length > 0 ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1) : '0.0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {movies.slice(0, 5).map((movie) => (
                    <div key={movie.id} className="flex items-center space-x-4 p-2 border border-gray-700 rounded">
                      <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{movie.title}</h4>
                        <p className="text-sm text-gray-400">{movie.genre} • {movie.releaseYear}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(`/download/${movie.id}`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
                <CardDescription className="text-gray-400">
                  {editingMovie ? 'Update movie details' : 'Add a new movie, web series, or content to MFLIX'}
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
                      <Input 
                        id="genre" 
                        placeholder="e.g., Action, Comedy, Drama" 
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
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
                      <Label htmlFor="language" className="text-white">Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleSelectChange(value, 'language')}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                          <SelectItem value="Telugu">Telugu</SelectItem>
                          <SelectItem value="Malayalam">Malayalam</SelectItem>
                          <SelectItem value="Bengali">Bengali</SelectItem>
                          <SelectItem value="Marathi">Marathi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-white">Tags</Label>
                      <Input 
                        id="tags" 
                        placeholder="action, thriller, superhero" 
                        value={formData.tags}
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
                      <Label htmlFor="videoUrl" className="text-white">Video URL (YouTube/Drive) *</Label>
                      <Input 
                        id="videoUrl" 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=xyz" 
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required 
                      />
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
                      <Label htmlFor="trailerUrl" className="text-white">Trailer URL</Label>
                      <Input 
                        id="trailerUrl" 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=trailer" 
                        value={formData.trailerUrl}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter movie description..." 
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? (editingMovie ? 'Updating...' : 'Adding...') : (editingMovie ? 'Update Movie' : 'Add Movie')}
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

          {/* Manage Tab */}
          <TabsContent value="manage" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Manage Movies</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit or delete existing movies from MFLIX
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-10 text-white">Loading movies...</div>
                ) : movies.length === 0 ? (
                  <div className="flex justify-center p-10 text-gray-400">
                    No movies found. Add some movies first.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Poster</TableHead>
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Year</TableHead>
                          <TableHead className="text-gray-300">Genre</TableHead>
                          <TableHead className="text-gray-300">Rating</TableHead>
                          <TableHead className="text-gray-300">Category</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movies.map((movie) => (
                          <TableRow key={movie.id} className="border-gray-700">
                            <TableCell>
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-white">{movie.title}</TableCell>
                            <TableCell className="text-gray-300">{movie.releaseYear}</TableCell>
                            <TableCell className="text-gray-300">{movie.genre}</TableCell>
                            <TableCell className="text-gray-300">{movie.rating}/10</TableCell>
                            <TableCell className="capitalize text-gray-300">{movie.category}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => window.open(`/download/${movie.id}`, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEdit(movie)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => confirmDelete(movie.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Management Tab */}
          <TabsContent value="ads" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Video className="w-5 h-5" />
                    <span>Video Ad Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="ads-enabled"
                      checked={adminSettings.adsEnabled}
                      onCheckedChange={(checked) => 
                        setAdminSettings({...adminSettings, adsEnabled: checked})
                      }
                    />
                    <Label htmlFor="ads-enabled" className="text-white">Enable Video Ads</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ad-interval" className="text-white">Ad Interval (minutes)</Label>
                    <Input 
                      id="ad-interval"
                      type="number"
                      min="1"
                      max="60"
                      value={adminSettings.adInterval}
                      onChange={(e) => 
                        setAdminSettings({...adminSettings, adInterval: parseInt(e.target.value) || 10})
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-banner" className="text-white">Video Ad Banner HTML</Label>
                    <Textarea 
                      id="video-banner"
                      placeholder="Enter HTML code for video ads..."
                      rows={4}
                      value={adminSettings.videoBanner}
                      onChange={(e) => 
                        setAdminSettings({...adminSettings, videoBanner: e.target.value})
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Homepage Banner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="home-banner" className="text-white">Homepage Banner HTML</Label>
                    <Textarea 
                      id="home-banner"
                      placeholder="Enter HTML code for homepage banner..."
                      rows={6}
                      value={adminSettings.homePageBanner}
                      onChange={(e) => 
                        setAdminSettings({...adminSettings, homePageBanner: e.target.value})
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded border border-gray-600">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
                    <div 
                      className="text-xs text-gray-400"
                      dangerouslySetInnerHTML={{ __html: adminSettings.homePageBanner || 'No banner content' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={saveAdminSettings} className="bg-red-600 hover:bg-red-700">
                <Save className="w-4 h-4 mr-2" />
                Save Ad Settings
              </Button>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Database Configuration</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Switch between Supabase and Firebase as your backend database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-white">Select Database Provider</Label>
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
                      <SelectItem value="supabase">Supabase (Currently Active)</SelectItem>
                      <SelectItem value="firebase">Firebase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gray-800 rounded border border-gray-600">
                  <h4 className="font-medium text-white mb-2">Current Status:</h4>
                  <p className="text-sm text-gray-300">
                    Using <span className="text-red-500 font-semibold">{adminSettings.database}</span> as the primary database.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {adminSettings.database === 'supabase' 
                      ? 'Connected to Supabase for real-time data and authentication'
                      : 'Firebase configuration needed for full functionality'
                    }
                  </p>
                </div>

                <Button onClick={saveAdminSettings} className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Database Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure general MFLIX Entertainment HUB settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Default Telegram Channel</Label>
                    <Input 
                      placeholder="https://t.me/+nRJaGvh8DMNlMzNl" 
                      defaultValue="https://t.me/+nRJaGvh8DMNlMzNl"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Social Media Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">App Configuration</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Splash Screen Duration (seconds)</Label>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          defaultValue="5"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Player Splash Duration (seconds)</Label>
                        <Input 
                          type="number" 
                          placeholder="3" 
                          defaultValue="3"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={saveAdminSettings} className="bg-red-600 hover:bg-red-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this movie? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
