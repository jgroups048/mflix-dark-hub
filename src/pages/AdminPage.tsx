
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    genre: '',
    releaseYear: '',
    duration: '',
    rating: '',
    posterUrl: '',
    videoUrl: '',
    description: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  
  // Log the current authenticated state to debug
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('Auth session:', data, error);
    };
    
    checkAuth();
  }, []);

  // Fetch movies from database
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

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
          releaseYear: movie.release_year
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
      description: ''
    });
  };

  const validateYoutubeUrl = (url: string): string => {
    // Convert standard YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If already an embed URL or another format, return as is
    return url;
  };

  const validateImageUrl = (url: string): string => {
    // Remove any [img] tags or other wrappers if present
    if (url.includes('[img]')) {
      return url.replace(/\[img\](.*?)\[\/img\]/g, '$1');
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
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
      
      // Validate and convert YouTube URL if needed
      const processedVideoUrl = validateYoutubeUrl(formData.videoUrl);
      const processedPosterUrl = validateImageUrl(formData.posterUrl);
      
      // Log the data we're about to submit
      console.log('Submitting movie data:', {
        ...formData,
        videoUrl: processedVideoUrl,
        posterUrl: processedPosterUrl
      });

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

      const { data, error } = await supabase
        .from('movies')
        .insert([movieData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'Movie uploaded successfully',
      });

      resetForm();
      fetchMovies();
    } catch (error: any) {
      console.error('Error uploading movie:', error);
      toast({
        title: 'Upload failed',
        description: `There was an error uploading your movie: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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

      if (error) {
        throw error;
      }

      toast({
        title: 'Deleted',
        description: 'Movie has been deleted successfully',
      });

      fetchMovies();
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      toast({
        title: 'Deletion failed',
        description: `Error: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
    }
  };

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
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Movie</TabsTrigger>
            <TabsTrigger value="manage">Manage Movies</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Movie</CardTitle>
                <CardDescription>
                  Add a new movie, web series, or live TV content to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter movie title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
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
                      <Label htmlFor="genre">Genre</Label>
                      <Input 
                        id="genre" 
                        placeholder="e.g., Action, Comedy, Drama" 
                        value={formData.genre}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="releaseYear">Release Year</Label>
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
                      <Label htmlFor="duration">Duration</Label>
                      <Input 
                        id="duration" 
                        placeholder="e.g., 2h 30m" 
                        value={formData.duration}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
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

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="posterUrl">Poster URL</Label>
                      <Input 
                        id="posterUrl" 
                        type="url" 
                        placeholder="https://example.com/poster.jpg" 
                        value={formData.posterUrl}
                        onChange={handleInputChange}
                        required 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Direct image URL ending with .jpg, .png, etc.
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="videoUrl">Video URL (YouTube/Google Drive)</Label>
                      <Input 
                        id="videoUrl" 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=xyz or https://youtube.com/embed/..."
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        required 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        YouTube watch URLs will be converted to embed format automatically
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter movie description..." 
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? 'Uploading...' : 'Upload Movie'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="space-y-4">
                    {movies.map((movie) => (
                      <div key={movie.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <h3 className="font-semibold">{movie.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {movie.genre} • {movie.releaseYear} • {movie.rating}/10
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {movie.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => confirmDelete(movie.id)}>
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
