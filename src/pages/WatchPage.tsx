import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchVideoById, Movie } from '@/lib/firebaseServices/videoService';
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, SiteSettings } from '@/lib/firebaseServices/siteSettingsService';
import ReactPlayer from 'react-player/lazy';

const FALLBACK_WATCH_LOGO_URL = '/defaults/default-mflix-logo.png';

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false);
  
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching site settings for WatchPage splash:', error);
      } finally {
        setSiteSettingsLoaded(true);
      }
    };
    loadSiteSettings();
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(splashTimer);
  }, []);
  
  useEffect(() => {
    const loadMovieData = async () => {
      if (!id) {
        setLoading(false);
        toast({ title: "Error", description: "Movie ID is missing.", variant: "destructive" });
        return;
      }
      try {
        setLoading(true);
        const fetchedMovie = await fetchVideoById(id);
        if (fetchedMovie) {
          setMovie(fetchedMovie);
        } else {
          toast({ title: 'Movie Not Found', description: 'Could not load the movie.', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        toast({
          title: 'Error Loading Movie Data',
          description: 'Failed to load movie details. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!showSplash) {
      loadMovieData();
    }
  }, [id, toast, showSplash]);

  const getGoogleDrivePreviewUrl = (url: string): string => {
    if (!url) return '#';

    // Regex to extract File ID from various Google Drive URL formats
    const fileIdMatch = url.match(
      /\/d\/([a-zA-Z0-9-_]+)/
    ) || url.match(
      /[?&]id=([a-zA-Z0-9-_]+)/
    );

    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Attempt to use a more direct link format that might be playable
      // export=view is sometimes better for direct embedding than export=download
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // If it looks like a direct video file URL (e.g., .mp4, .m3u8), return it as is.
    // This is a simple check and might need refinement.
    if (/\.(mp4|m3u8|webm|ogv)$/i.test(url) || url.includes('googlevideo.com')) {
      console.log('getGoogleDrivePreviewUrl: Detected as a direct video link or Google Video URL, returning as is:', url);
      return url;
    }
    
    // If it's already a /preview link, let it pass (though our goal is to avoid it)
    // Or if it's an unknown GDrive link not matching the ID patterns.
    if (url.includes('/preview') || url.includes('drive.google.com')) {
        console.warn('getGoogleDrivePreviewUrl: URL is a Google Drive link but File ID not extracted or already a preview. Original URL returned:', url);
        // Fallback for GDrive links where ID extraction failed, but still try to use it directly.
        // If this is a /preview URL, ReactPlayer will likely fail.
        // We could force it to an iframe structure here if needed later.
        return url;
    }

    // Fallback for non-Google Drive URLs or unhandled formats
    console.warn('getGoogleDrivePreviewUrl: URL is not a recognized Google Drive link format or direct video. Returning original URL:', url);
    return url;
  };

  if (showSplash) {
    if (!siteSettingsLoaded) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
            role="status"
          >
            <span className="sr-only">Loading settings...</span>
          </div>
        </div>
      );
    }

    const logoToDisplay = siteSettings?.watchPageSplashLogoUrl || siteSettings?.logoUrl || FALLBACK_WATCH_LOGO_URL;
    console.log('WatchPage Splash: Attempting to load logo (after settings attempt):', logoToDisplay);

    let logoSizeClasses = "w-40 sm:w-48 md:w-56 max-h-40 sm:max-h-48 md:max-h-56"; // Default to medium
    if (siteSettings?.watchPageSplashLogoSize === 'small') {
      logoSizeClasses = "w-32 sm:w-36 md:w-40 max-h-32 sm:max-h-36 md:max-h-40";
    } else if (siteSettings?.watchPageSplashLogoSize === 'large') {
      logoSizeClasses = "w-48 sm:w-56 md:w-64 max-h-48 sm:max-h-56 md:max-h-64";
    }

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        {logoToDisplay ? (
            <img 
              src={logoToDisplay} 
              alt="Loading Logo" 
              className={`${logoSizeClasses} object-contain mx-auto mb-4 animate-pulse`}
              onError={(e) => { 
                console.error('Error loading splash logo:', logoToDisplay, e);
                (e.target as HTMLImageElement).style.display = 'none'; 
              }}
            />
          ) : (
            <div className="h-20 mb-4"></div>
        )}
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
          role="status"
        >
          <span className="sr-only">Loading...</span>
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

  const videoEmbedUrl = movie.videoUrl 
    ? (movie.videoUrl.includes('drive.google.com') 
        ? getGoogleDrivePreviewUrl(movie.videoUrl) 
        : movie.videoUrl)
    : '#';

  // Early return if siteSettings are not loaded yet when isWatching is true
  if (isWatching && !siteSettingsLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        <p className="text-white mt-2">Loading player settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
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

      <div className="container mx-auto px-4 py-8">
        {!isWatching ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  disabled={!movie.videoUrl}
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
          <div className="space-y-6">
            <div className="relative isolate">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl player-wrapper">
                {(() => { console.log("Video URL for ReactPlayer (or iframe src):", videoEmbedUrl); return null; })()}
                {videoEmbedUrl && videoEmbedUrl.includes('drive.google.com') ? (
                  <iframe
                    src={videoEmbedUrl.replace(/uc\?export=view&id=/, 'file/d/') + '/preview'} // Convert to /preview for iframe
                    width="100%"
                    height="100%"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={`Movie Player - ${movie.title}`}
                    className="react-player" // Keep same class for sizing if needed
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  ></iframe>
                ) : (
                  <ReactPlayer
                    className="react-player"
                    url={videoEmbedUrl}
                    width="100%"
                    height="100%"
                    playing={true}
                    controls={true}
                    config={{
                      file: {
                        attributes: {
                          // If you need specific attributes for <video> element
                        }
                      },
                      youtube: {
                        playerVars: { 
                          showinfo: 0, 
                          modestbranding: 1, 
                          rel: 0, 
                          iv_load_policy: 3,
                          fs: 1
                        }
                      }
                    }}
                    onError={(e) => console.error('ReactPlayer Error:', e)}
                  />
                )}
              </div>
              {/* Video Overlay Logo - WatchPage */}
              {siteSettings?.videoOverlayLogoUrl && (
                <img 
                  src={siteSettings.videoOverlayLogoUrl}
                  alt="Site Watermark"
                  className={[
                    "absolute object-contain opacity-75 pointer-events-none z-30",
                    "h-8 sm:h-10 md:h-12",
                    (siteSettings.videoOverlayPosition === 'top-left') && 'top-2 left-2 sm:top-4 sm:left-4',
                    (!siteSettings.videoOverlayPosition || siteSettings.videoOverlayPosition === 'top-right') && 'top-2 right-2 sm:top-4 sm:right-4',
                    (siteSettings.videoOverlayPosition === 'bottom-left') && 'bottom-2 left-2 sm:bottom-4 sm:left-4',
                    (siteSettings.videoOverlayPosition === 'bottom-right') && 'bottom-2 right-2 sm:bottom-4 sm:right-4',
                  ].filter(Boolean).join(' ')}
                />
              )}
            </div>

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
