
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  
  // Show splash screen for 3 seconds when navigating to watch page
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(splashTimer);
  }, []);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setMovie({
            id: data.id,
            title: data.title,
            description: data.description || '',
            posterUrl: data.poster_url,
            videoUrl: data.video_url,
            genre: data.genre,
            category: data.category as any,
            rating: data.rating,
            duration: data.duration,
            releaseYear: data.release_year
          });
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        toast({
          title: 'Error',
          description: 'Failed to load movie details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!showSplash) {
      fetchMovie();
    }
  }, [id, toast, showSplash]);

  // Convert Google Drive share link to preview link
  const getGoogleDrivePreviewUrl = (url: string) => {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return url;
  };

  // Splash screen while loading
  if (showSplash) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/a177babb-70b0-43a3-9539-f3964d37f08a.png" 
            alt="Entertainment Hub" 
            className="w-48 h-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-red-500 text-xl font-bold">Loading your entertainment...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Loading movie...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const handleWatchNow = () => {
    setIsWatching(true);
  };

  const handleDownload = () => {
    navigate(`/download/${movie.id}`);
  };

  const videoUrl = movie.videoUrl.includes('drive.google.com') 
    ? getGoogleDrivePreviewUrl(movie.videoUrl)
    : movie.videoUrl;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-red-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:text-red-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-xl font-semibold text-white">{movie.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!isWatching ? (
          // Movie Details Page
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4 text-white">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-300">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                  ⭐ {movie.rating}/10
                </span>
                <span>{movie.releaseYear}</span>
                <span>{movie.duration}</span>
                <span className="bg-gray-700 px-3 py-1 rounded-full">{movie.genre}</span>
              </div>

              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                {movie.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleWatchNow}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
                <Button 
                  onClick={handleDownload}
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-4 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Now
                </Button>
              </div>
            </div>

            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          // Video Player
          <div className="space-y-6">
            {/* Video Player */}
            <div className="relative">
              <div className="aspect-video w-full">
                <iframe
                  src={videoUrl}
                  title={movie.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>

            {/* Video Info Below Player */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                  ⭐ {movie.rating}/10
                </span>
                <span>{movie.releaseYear}</span>
                <span>{movie.duration}</span>
                <span className="bg-gray-700 px-3 py-1 rounded-full">{movie.genre}</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                {movie.description}
              </p>
              <Button 
                onClick={handleDownload}
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
