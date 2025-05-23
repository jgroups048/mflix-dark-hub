
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { movies } from '@/data/movies';

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Movie uploaded/updated');
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
                      <Input id="title" placeholder="Enter movie title" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
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
                      <Input id="genre" placeholder="e.g., Action, Comedy, Drama" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Release Year</Label>
                      <Input id="year" type="number" placeholder="2024" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g., 2h 30m" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input id="rating" type="number" step="0.1" max="10" placeholder="8.5" required />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="poster">Poster URL</Label>
                      <Input id="poster" type="url" placeholder="https://example.com/poster.jpg" required />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="video">Video URL (YouTube/Google Drive)</Label>
                      <Input id="video" type="url" placeholder="https://youtube.com/embed/..." required />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter movie description..." 
                        rows={4}
                        required 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Movie
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
                <div className="space-y-4">
                  {movies.map((movie) => (
                    <div key={movie.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded"
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
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
