import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedMovie, AdminSettings } from '@/types/admin';

interface MovieManagerProps {
  movies: ExtendedMovie[];
  adminSettings: AdminSettings;
  genres: string[];
  languages: string[];
  onMoviesUpdate: () => void;
}

const MovieManager = ({ movies, adminSettings, genres, languages, onMoviesUpdate }: MovieManagerProps) => {
  const { toast } = useToast();
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
    telegramChannel: 'https://t.me/+nRJaGvh8DMNlMzNl',
    downloadUrl: '',
    trailerUrl: '',
    isFeatured: false,
    releaseDate: '',
    isScheduled: false,
    commentsEnabled: true,
    ratingsEnabled: true
  });

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

  const convertVideoUrl = (url: string): string => {
    // YouTube URLs
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    // Google Drive URLs
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    // Dailymotion URLs
    if (url.includes('dailymotion.com/video/')) {
      const videoId = url.match(/dailymotion\.com\/video\/([^_]+)/)?.[1];
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : url;
    }
    
    return url;
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
      downloadUrl: movie.downloadLinks?.[0]?.url || '',
      trailerUrl: movie.trailerUrl || '',
      isFeatured: movie.isFeatured || false,
      releaseDate: movie.releaseDate || '',
      isScheduled: movie.isScheduled || false,
      commentsEnabled: movie.commentsEnabled !== false,
      ratingsEnabled: movie.ratingsEnabled !== false
    });
  };

  const handleDelete = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Movie deleted successfully',
      });

      onMoviesUpdate();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: `Error: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (movieId: string, currentFeatured: boolean) => {
    try {
      // First, remove featured status from all movies
      await supabase
        .from('movies')
        .update({ is_featured: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then set the selected movie as featured if it wasn't already
      if (!currentFeatured) {
        const { error } = await supabase
          .from('movies')
          .update({ is_featured: true })
          .eq('id', movieId);

        if (error) throw error;
      }

      toast({
        title: 'Success!',
        description: currentFeatured ? 'Removed from featured' : 'Set as featured movie',
      });

      onMoviesUpdate();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: `Error: ${error.message}`,
        variant: 'destructive'
      });
    }
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
      
      const processedVideoUrl = convertVideoUrl(formData.videoUrl);
      
      const movieData = {
        title: formData.title,
        description: formData.description,
        poster_url: formData.posterUrl,
        video_url: processedVideoUrl,
        genre: formData.genre,
        category: formData.category,
        duration: formData.duration,
        rating: parseFloat(formData.rating),
        release_year: parseInt(formData.releaseYear),
        trailer_url: formData.trailerUrl,
        download_url: formData.downloadUrl,
        is_featured: formData.isFeatured,
        language: formData.language,
        tags: formData.tags
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
        description: editingMovie ? 'Movie updated successfully' : 'Movie added successfully',
      });

      resetForm();
      onMoviesUpdate();
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

  return (
    <div className="space-y-6">
      {/* Add/Edit Movie Form */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Add movies with automatic URL conversion and featured movie selection
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

      {/* Movies List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Manage Movies</CardTitle>
          <CardDescription className="text-gray-400">
            Edit, delete, or set movies as featured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold line-clamp-2">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">{movie.genre} • {movie.releaseYear}</p>
                    <p className="text-gray-400 text-sm capitalize">{movie.category}</p>
                    {movie.isFeatured && (
                      <div className="flex items-center text-yellow-500 text-sm mt-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(movie)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={movie.isFeatured ? "default" : "outline"}
                    onClick={() => toggleFeatured(movie.id, movie.isFeatured || false)}
                    className={movie.isFeatured ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    <Star className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(movie.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieManager;
