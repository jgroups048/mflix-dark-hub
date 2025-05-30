import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchVideoById, Movie } from '@/lib/firebaseServices/videoService';
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, SiteSettings } from '@/lib/firebaseServices/siteSettingsService';

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  
  // Show splash screen for 3 seconds when navigating to watch page
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(splashTimer);
  }, []);
  
  useEffect(() => {
    const loadMovieAndSettings = async () => {
      if (!id && showSplash === false) {
        setLoading(false);
        toast({ title: "Error", description: "Movie ID is missing.", variant: "destructive" });
        return;
      }
      try {
        setLoading(true);
        if (id) {
          const fetchedMovie = await fetchVideoById(id);
          if (fetchedMovie) {
            setMovie(fetchedMovie);
          } else {
            toast({ title: 'Movie Not Found', description: 'Could not load the movie.', variant: 'destructive' });
          }
        }
        const settings = await getSiteSettings();
        setSiteSettings(settings);

      } catch (error) {
        console.error('Error fetching movie or settings:', error);
        toast({
          title: 'Error Loading Page Data',
          description: 'Failed to load movie details or site settings. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!showSplash) {
      loadMovieAndSettings();
    }
  }, [id, toast, showSplash]);

  // Convert Google Drive share link to preview link
  const getGoogleDrivePreviewUrl = (url: string): string => {
    if (!url) return '#'; // Return a placeholder or handle error appropriately
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    // If it's not a recognizable Google Drive share link, return the original URL
    // Or, if it's a direct video link (e.g., .mp4), it might work directly in iframe
    // Consider additional checks or URL type detection if needed
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
    if (movie && movie.id) {
        navigate(`/download/${movie.id}`);
    } else {
        toast({title: "Error", description: "Cannot find movie ID for download.", variant: "destructive"});
    }
  };

  // Use movie.videoUrl directly if it's already an embeddable link or if getGoogleDrivePreviewUrl handles other types.
  // The Movie interface from videoService has videoUrl, ensure it holds the correct type of URL.
  const videoEmbedUrl = movie.videoUrl 
    ? (movie.videoUrl.includes('drive.google.com') 
        ? getGoogleDrivePreviewUrl(movie.videoUrl) 
        : movie.videoUrl)
    : '#'; // Fallback if videoUrl is undefined

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-red-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:text-red-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-xl font-semibold text-white truncate" title={movie.title}>{movie.title}</h1>
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
                {movie.rating && <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">⭐ {movie.rating}/10</span>}
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {movie.duration && <span>{movie.duration}</span>}
                {movie.genre && <span className="bg-gray-700 px-3 py-1 rounded-full">{movie.genre}</span>}
              </div>

              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                {movie.description || 'No description available.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleWatchNow}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                  disabled={!movie.videoUrl} // Disable if no videoUrl
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
                  Download Movie
                </Button>
              </div>
            </div>

            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <img
                  src={movie.posterUrl || '/placeholder.svg'}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl aspect-[2/3] object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
            </div>
          </div>
        ) : (
          // Video Player
          <div className="space-y-6">
            {/* Video Player with Overlay Capability */}
            <div className="relative">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  src={videoEmbedUrl} // Use the processed videoEmbedUrl
                  title={movie.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {/* Video Overlay Logo */}
              {siteSettings?.videoOverlayLogoUrl && (
                <img
                  src={siteSettings.videoOverlayLogoUrl}
                  alt="Video Overlay Logo"
                  className={[
                    'absolute object-contain opacity-75 z-30',
                    'h-8 sm:h-10 md:h-12 lg:h-14', // Responsive height
                    siteSettings.videoOverlayPosition === 'top-left' && 'top-2 left-2 sm:top-4 sm:left-4',
                    siteSettings.videoOverlayPosition === 'top-right' && 'top-2 right-2 sm:top-4 sm:right-4',
                    siteSettings.videoOverlayPosition === 'bottom-left' && 'bottom-2 left-2 sm:bottom-4 sm:left-4',
                    siteSettings.videoOverlayPosition === 'bottom-right' && 'bottom-2 right-2 sm:bottom-4 sm:right-4',
                  ].filter(Boolean).join(' ')}
                />
              )}
            </div>

            {/* Video Info Below Player */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
                {movie.rating && <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">⭐ {movie.rating}/10</span>}
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {movie.duration && <span>{movie.duration}</span>}
                {movie.genre && <span className="bg-gray-700 px-3 py-1 rounded-full">{movie.genre}</span>}
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                {movie.description || 'No description available.'}
              </p>
              <Button 
                onClick={handleDownload}
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Movie
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
