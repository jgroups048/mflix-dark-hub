import React, { useState, useEffect } from 'react';
import { Movie, addVideo, updateVideo, deleteVideo } from '@/lib/firebaseServices/videoService';
import { AdminSettings as AdminSettingsType } from '@/types/admin'; // Assuming this type is still relevant for context
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface MovieManagerProps {
  movies: Movie[];
  adminSettings: AdminSettingsType; // Kept for context, use if needed for specific settings
  genres: string[];
  languages: string[];
  onMoviesUpdate: () => void;
}

const initialMovieFormData: Partial<Movie> = {
  title: '',
  description: '',
  posterUrl: '',
  videoUrl: '',
  downloadUrl: '',
  genre: '',
  category: '',
  rating: 0,
  duration: '',
  releaseYear: new Date().getFullYear(),
  language: '',
  tags: '',
  trailerUrl: '',
  isFeatured: false,
};

// Utility to convert YouTube/Google Drive URLs to embeddable/direct format
const convertVideoUrl = (url: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = urlObj.searchParams.get('v');
      if (!videoId && urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (urlObj.hostname.includes('drive.google.com')) {
      // If the URL already ends with /preview, return it as is.
      if (url.endsWith('/preview')) {
        return url;
      }
      // Otherwise, attempt to convert to direct link format for embedding (uc?export=view)
      const match = url.match(/file\/d\/([^\/]+)/) || url.match(/uc\?id=([^\/&]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
  } catch (e) {
    // Invalid URL or other error, return original
    console.warn("Invalid URL or error in convertVideoUrl:", e, "Returning original URL:", url);
    return url;
  }
  // If no conversion rules matched, return the original URL.
  return url;
};

const MovieManager: React.FC<MovieManagerProps> = ({ movies, genres, languages, onMoviesUpdate }) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Partial<Movie>>(initialMovieFormData);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (editingMovie) {
      // Convert Timestamp to Date string for datetime-local input if needed, or handle in input component
      // For simplicity, assuming text inputs for dates or separate date pickers
      const formDataFromEditingMovie: Partial<Movie> = {
        ...editingMovie,
        // Ensure Timestamps are not directly put into form state if they cause issues
        // For this setup, we assume MovieManager receives data ready for display/editing
        // And videoService handles Timestamp conversions for Firestore
      };
      setCurrentFormData(formDataFromEditingMovie);
    } else {
      setCurrentFormData(initialMovieFormData);
    }
  }, [editingMovie, isFormOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value;
    setCurrentFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSelectChange = (name: keyof Movie, value: string) => {
    setCurrentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoUrlBlur = () => {
    if (currentFormData.videoUrl) {
      setCurrentFormData(prev => ({ ...prev, videoUrl: convertVideoUrl(prev.videoUrl!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentFormData.title) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }

    const movieDataForSubmit = { ...currentFormData };
    // Remove id if it's a new movie, as Firestore generates it
    if (!editingMovie?.id) {
      delete movieDataForSubmit.id;
    }

    // Ensure all necessary fields for Movie (excluding id, Timestamps for add)
    // are present or have defaults
    const dataToSave: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'> = {
        title: movieDataForSubmit.title!,
        description: movieDataForSubmit.description || '',
        posterUrl: movieDataForSubmit.posterUrl || '',
        videoUrl: movieDataForSubmit.videoUrl || '',
        downloadUrl: movieDataForSubmit.downloadUrl || '',
        genre: movieDataForSubmit.genre || '',
        category: movieDataForSubmit.category || '',
        rating: Number(movieDataForSubmit.rating) || 0,
        duration: movieDataForSubmit.duration || '',
        releaseYear: Number(movieDataForSubmit.releaseYear) || new Date().getFullYear(),
        language: movieDataForSubmit.language || '',
        tags: movieDataForSubmit.tags || '',
        trailerUrl: movieDataForSubmit.trailerUrl || '',
        isFeatured: movieDataForSubmit.isFeatured || false,
        // viewCount & downloadCount are typically managed by backend triggers or separate updates
    };

    try {
      if (editingMovie?.id) {
        // Update existing movie
        await updateVideo(editingMovie.id, dataToSave);
        toast({ title: "Movie Updated", description: "Movie details saved successfully." });
      } else {
        // Add new movie
        await addVideo(dataToSave);
        toast({ title: "Movie Added", description: "New movie created successfully." });
      }
      onMoviesUpdate();
      setIsFormOpen(false);
      setEditingMovie(null);
    } catch (error) {
      console.error("Error saving movie:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to save movie.", variant: "destructive" });
    }
  };

  const openEditForm = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingMovie(null);
    setCurrentFormData(initialMovieFormData); // Reset form for new movie
    setIsFormOpen(true);
  };

  const confirmDeleteMovie = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMovie = async () => {
    if (movieToDelete?.id) {
      try {
        await deleteVideo(movieToDelete.id);
        toast({ title: "Movie Deleted", description: `\"${movieToDelete.title}\" has been deleted.` });
        onMoviesUpdate();
        setIsDeleteDialogOpen(false);
        setMovieToDelete(null);
      } catch (error) {
        console.error("Error deleting movie:", error);
        toast({ title: "Error", description: (error as Error).message || "Failed to delete movie.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900/50 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Manage Movies</h2>
        <Button onClick={openAddForm} className="bg-red-600 hover:bg-red-700 text-white">
          <PlusCircle className="w-4 h-4 mr-2" /> Add New Movie
        </Button>
      </div>

      {/* Movie Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Input name="title" placeholder="Title" value={currentFormData.title || ''} onChange={handleInputChange} required className="bg-gray-800 border-gray-700" />
            <Textarea name="description" placeholder="Description" value={currentFormData.description || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            <Input name="posterUrl" placeholder="Poster URL" value={currentFormData.posterUrl || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            <Input name="videoUrl" placeholder="Video URL (YouTube/Google Drive)" value={currentFormData.videoUrl || ''} onChange={handleInputChange} onBlur={handleVideoUrlBlur} className="bg-gray-800 border-gray-700" />
            <Input name="downloadUrl" placeholder="Download URL" value={currentFormData.downloadUrl || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            <Input name="trailerUrl" placeholder="Trailer URL" value={currentFormData.trailerUrl || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            
            <div className="grid grid-cols-2 gap-4">
                <Select name="genre" value={currentFormData.genre || ''} onValueChange={(value) => handleSelectChange('genre', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select Genre" /></SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select name="language" value={currentFormData.language || ''} onValueChange={(value) => handleSelectChange('language', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select Language" /></SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <Input name="category" placeholder="Category (e.g., Movie, Series)" value={currentFormData.category || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            <Input name="tags" placeholder="Tags (comma-separated)" value={currentFormData.tags || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />

            <div className="grid grid-cols-3 gap-4">
                <Input name="rating" type="number" placeholder="Rating (0-10)" value={currentFormData.rating || 0} onChange={handleInputChange} step="0.1" min="0" max="10" className="bg-gray-800 border-gray-700" />
                <Input name="duration" placeholder="Duration (e.g., 2h 15m)" value={currentFormData.duration || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
                <Input name="releaseYear" type="number" placeholder="Release Year" value={currentFormData.releaseYear || new Date().getFullYear()} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isFeatured" name="isFeatured" checked={currentFormData.isFeatured || false} onCheckedChange={(checked) => setCurrentFormData(prev => ({ ...prev, isFeatured: !!checked }))} />
              <label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Featured Movie</label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="hover:border-red-500 hover:text-red-500">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">{editingMovie ? 'Save Changes' : 'Add Movie'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-yellow-400"/>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the movie "<strong>{movieToDelete?.title}</strong>"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="hover:border-gray-500">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDeleteMovie} className="bg-yellow-600 hover:bg-yellow-700 text-white">Delete Movie</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movies Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-700">
          <TableHeader>
            <TableRow className="hover:bg-gray-800/0">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Genre</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Language</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Year</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Featured</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-700">
            {movies.length > 0 ? movies.map((movie) => (
              <TableRow key={movie.id} className="hover:bg-gray-800/50">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{movie.title}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.genre}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.language}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.releaseYear}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <Checkbox checked={movie.isFeatured} disabled className="data-[state=checked]:bg-red-500" />
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditForm(movie)} className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => confirmDeleteMovie(movie)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  No movies found. Add a new movie to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MovieManager;