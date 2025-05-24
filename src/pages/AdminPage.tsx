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
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';
import AnalyticsCard from '@/components/AnalyticsCard';

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

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ExtendedMovie | null>(null);
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
    telegramChannel: 'https://t.me/mflixhub',
    download480p: '',
    download720p: '',
    download1080p: '',
    size480p: '',
    size720p: '',
    size1080p: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('=== ADMIN AUTH CHECK ===');
        console.log('Session:', !!sessionData?.session);
        console.log('User:', sessionData?.session?.user?.email);
        console.log('=======================');
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    checkAuth();
    fetchMovies();
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
          // Extended fields would be stored in description or separate fields
          language: 'English', // Default
          tags: '',
          telegramChannel: 'https://t.me/mflixhub'
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
      telegramChannel: 'https://t.me/mflixhub',
      download480p: '',
      download720p: '',
      download1080p: '',
      size480p: '',
      size720p: '',
      size1080p: ''
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

  const validateImageUrl = (url: string): string => {
    if (url.includes('[img]')) {
      return url.replace(/\[img\](.*?)\[\/img\]/g, '$1');
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      console.log('=== MOVIE UPLOAD/UPDATE START ===');
      
      const { data: authData } = await supabase.auth.getSession();
      console.log('Auth status:', {
        hasSession: !!authData?.session,
        userId: authData?.session?.user?.id
      });
      
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
      const processedPosterUrl = validateImageUrl(formData.posterUrl);
      
      const movieData = {
        title: formData.title,
        description: formData.description,
        poster_url: processedPosterUrl,
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
        
        console.log('Update result:', result);
      } else {
        result = await supabase
          .from('movies')
          .insert([movieData])
          .select();
        
        console.log('Insert result:', result);
      }

      if (result.error) {
        console.error('Database operation error:', result.error);
        throw result.error;
      }

      toast({
        title: 'Success!',
        description: editingMovie ? 'Movie updated successfully' : 'Movie uploaded successfully',
      });

      resetForm();
      fetchMovies();
      
      console.log('=== MOVIE UPLOAD/UPDATE SUCCESS ===');
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
      telegramChannel: movie.telegramChannel || 'https://t.me/mflixhub',
      download480p: '',
      download720p: '',
      download1080p: '',
      size480p: '',
      size720p: '',
      size1080p: ''
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload Movie</TabsTrigger>
            <TabsTrigger value="manage">Manage Movies</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMovies}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Latest Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{latestMovie?.title || 'No movies'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(movies.map(m => m.category)).size}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {movies.length > 0 ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1) : '0.0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {movies.slice(0, 5).map((movie) => (
                    <div key={movie.id} className="flex items-center space-x-4 p-2 border border-border rounded">
                      <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{movie.title}</h4>
                        <p className="text-sm text-muted-foreground">{movie.genre} • {movie.releaseYear}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>{editingMovie ? 'Edit Movie' : 'Upload New Movie'}</CardTitle>
                <CardDescription>
                  {editingMovie ? 'Update movie details' : 'Add a new movie, web series, or live TV content to the platform'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter movie title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange(value, 'category')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                          <SelectItem value="webseries">Web Series</SelectItem>
                          <SelectItem value="movies">Movies</SelectItem>
                          <SelectItem value="livetv">Live TV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre *</Label>
                      <Input 
                        id="genre" 
                        placeholder="e.g., Action, Comedy, Drama" 
                        value={formData.genre}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="releaseYear">Release Year *</Label>
                      <Input 
                        id="releaseYear" 
                        type="number" 
                        placeholder="2024" 
                        value={formData.releaseYear}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration *</Label>
                      <Input 
                        id="duration" 
                        placeholder="e.g., 2h 30m" 
                        value={formData.duration}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating *</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        step="0.1" 
                        max="10" 
                        placeholder="8.5" 
                        value={formData.rating}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleSelectChange(value, 'language')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="tags">Tags</Label>
                      <Input 
                        id="tags" 
                        placeholder="action, thriller, superhero" 
                        value={formData.tags}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="posterUrl">Poster URL *</Label>
                      <Input 
                        id="posterUrl" 
                        type="url" 
                        placeholder="https://example.com/poster.jpg" 
                        value={formData.posterUrl}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="videoUrl">Video URL (YouTube/Drive) *</Label>
                      <Input 
                        id="videoUrl" 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=xyz" 
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="telegramChannel">Telegram Channel</Label>
                      <Input 
                        id="telegramChannel" 
                        type="url" 
                        placeholder="https://t.me/mflixhub" 
                        value={formData.telegramChannel}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Download Links Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Download Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="download480p">480p Download Link</Label>
                        <Input 
                          id="download480p" 
                          type="url" 
                          placeholder="https://drive.google.com/..." 
                          value={formData.download480p}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size480p">480p File Size</Label>
                        <Input 
                          id="size480p" 
                          placeholder="450 MB" 
                          value={formData.size480p}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="download720p">720p Download Link</Label>
                        <Input 
                          id="download720p" 
                          type="url" 
                          placeholder="https://drive.google.com/..." 
                          value={formData.download720p}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size720p">720p File Size</Label>
                        <Input 
                          id="size720p" 
                          placeholder="850 MB" 
                          value={formData.size720p}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="download1080p">1080p Download Link</Label>
                        <Input 
                          id="download1080p" 
                          type="url" 
                          placeholder="https://drive.google.com/..." 
                          value={formData.download1080p}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size1080p">1080p File Size</Label>
                        <Input 
                          id="size1080p" 
                          placeholder="1.5 GB" 
                          value={formData.size1080p}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter movie description..." 
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? (editingMovie ? 'Updating...' : 'Uploading...') : (editingMovie ? 'Update Movie' : 'Upload Movie')}
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
            <Card>
              <CardHeader>
                <CardTitle>Manage Movies</CardTitle>
                <CardDescription>
                  Edit or delete existing movies from the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-10">Loading movies...</div>
                ) : movies.length === 0 ? (
                  <div className="flex justify-center p-10 text-muted-foreground">
                    No movies found. Upload some movies first.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Poster</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movies.map((movie) => (
                          <TableRow key={movie.id}>
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
                            <TableCell className="font-medium">{movie.title}</TableCell>
                            <TableCell>{movie.releaseYear}</TableCell>
                            <TableCell>{movie.genre}</TableCell>
                            <TableCell>{movie.rating}/10</TableCell>
                            <TableCell className="capitalize">{movie.category}</TableCell>
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure admin panel settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Telegram Channel</Label>
                    <Input 
                      placeholder="https://t.me/mflixhub" 
                      defaultValue="https://t.me/mflixhub"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Download Countdown (seconds)</Label>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      defaultValue="10"
                    />
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
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
