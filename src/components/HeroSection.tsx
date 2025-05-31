import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Movie } from '@/types/movie'; // Using Movie from videoService now
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getHeaderTrailer, HeaderTrailer } from '@/lib/firebaseServices/trailerService';
// import { supabase } from '@/integrations/supabase/client'; // REMOVED Supabase import
import { getFeaturedMovie, Movie } from '@/lib/firebaseServices/videoService'; // Added getFeaturedMovie
import { db } from '@/lib/firebase'; // Added for collection, query, where, limit, getDocs if direct firestore needed, though getFeaturedMovie encapsulates it
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore'; // Keep for direct queries if necessary, or ensure services cover all cases
import { getSiteSettings } from '@/lib/firebaseServices/siteSettingsService'; // Added

// Helper function to extract YouTube video ID (assuming this is generic enough)
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface HeroTrailerData {
  youtubeUrl: string;
  movieTitle: string;
  description: string;
  watchNowUrl: string;
  moreInfoUrl?: string;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [trailerData, setTrailerData] = useState<HeroTrailerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedHeroLogoUrl, setFetchedHeroLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch site settings for hero logo first
        try {
          const settings = await getSiteSettings();
          if (settings && settings.heroLogoUrl && settings.heroLogoUrl.trim() !== '') {
            setFetchedHeroLogoUrl(settings.heroLogoUrl);
            console.log("Hero Section Logo URL (from effect):", settings.heroLogoUrl);
          } else {
            setFetchedHeroLogoUrl(null);
            console.log("No valid heroLogoUrl found in site settings.");
          }
        } catch (settingsError) {
          console.error("Error fetching site settings for hero logo:", settingsError);
          setFetchedHeroLogoUrl(null);
        }

        const firestoreTrailer = await getHeaderTrailer();
        
        // @ts-ignore // Kept ts-ignore for manualOverride if HeaderTrailer interface not updated yet by user
        if (firestoreTrailer && firestoreTrailer.manualOverride === true && firestoreTrailer.youtubeUrl) {
          setTrailerData({
            youtubeUrl: firestoreTrailer.youtubeUrl,
            movieTitle: firestoreTrailer.movieTitle,
            description: firestoreTrailer.description,
            watchNowUrl: firestoreTrailer.watchNowUrl,
            moreInfoUrl: firestoreTrailer.moreInfoUrl,
          });
        } else {
          // Fetch featured movie from Firebase
          const featuredMovie = await getFeaturedMovie();

          if (featuredMovie && featuredMovie.trailerUrl) { // Check for trailerUrl specifically
            setTrailerData({
              youtubeUrl: featuredMovie.trailerUrl, // Use trailerUrl from Movie interface
              movieTitle: featuredMovie.title,
              description: featuredMovie.description || '',
              watchNowUrl: `/watch/${featuredMovie.id}`,
              moreInfoUrl: `/watch/${featuredMovie.id}`, 
            });
          } else if (featuredMovie && featuredMovie.videoUrl) { // Fallback to videoUrl if trailerUrl is not present
             setTrailerData({
              youtubeUrl: featuredMovie.videoUrl, 
              movieTitle: featuredMovie.title,
              description: featuredMovie.description || '',
              watchNowUrl: `/watch/${featuredMovie.id}`,
              moreInfoUrl: `/watch/${featuredMovie.id}`, 
            });
          }else {
            setError('No featured movie with a trailer found.');
          }
        }
      } catch (err: any) {
        console.error("Error fetching hero data:", err);
        setError(err.message || 'Failed to load hero data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  if (loading) {
    return <div className="h-[500px] bg-black flex items-center justify-center text-white">Loading Hero...</div>;
  }

  if (error) {
    return (
      <div className="h-[300px] sm:h-[500px] bg-black text-red-400 flex flex-col items-center justify-center text-center p-4">
        <p className="text-lg sm:text-xl font-semibold mb-2">Hero Section Error</p>
        <p className="text-sm sm:text-md mb-1">An error occurred while trying to load data for the hero section:</p>
        <p className="text-xs sm:text-sm text-red-500 bg-red-900_bg-opacity-50 p-2 rounded">{error}</p>
        <p className="mt-3 text-xs text-gray-500">As a result, the hero section cannot be displayed.</p>
      </div>
    );
  }
  if (!trailerData) {
    return (
      <div className="h-[300px] sm:h-[500px] bg-black text-yellow-400 flex flex-col items-center justify-center text-center p-4">
        <p className="text-lg sm:text-xl font-semibold mb-2">Hero Section Data Missing</p>
        <p className="text-sm sm:text-md mb-1">No suitable content (featured movie or header trailer with video) was found to display in the hero section.</p>
        <p className="mt-3 text-xs text-gray-500">Please check the Firebase database for a 'featured' movie with a 'trailerUrl' or 'videoUrl', or a 'headerTrailer' with a 'youtubeUrl'.</p>
      </div>
    );
  }

  const videoId = extractYouTubeId(trailerData.youtubeUrl);

  if (!videoId) {
    return <div className="h-[300px] sm:h-[500px] bg-black flex items-center justify-center text-red-500 p-4 text-center">Invalid Trailer URL.</div>; // Provide feedback
  }
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

  return (
    <section className="w-full bg-black"> {/* Added bg-black here for mobile layout continuity */}
      {/* Mobile Layout: Video on top, content below */}
      <div className="sm:hidden">
        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={trailerData.movieTitle}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; muted; loop"
            allowFullScreen
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Content Container (Below Video) */}
        <div className="px-4 py-6 text-white">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {trailerData.movieTitle}
            </h2>
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">
              {trailerData.description}
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 text-sm rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs"
                onClick={() => navigate(trailerData.watchNowUrl)}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Now
              </Button>
              {trailerData.moreInfoUrl && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-400 text-gray-200 hover:bg-gray-200 hover:text-black font-semibold px-4 py-2 text-sm rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs"
                  onClick={() => navigate(trailerData.moreInfoUrl!)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  More Info
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Overlay (existing structure) */}
      <div className="hidden sm:block relative w-full overflow-hidden aspect-video bg-black">
        {/* 2. Video iframe wrapper */}
        <div className="absolute inset-0 z-0">
          <iframe
            src={embedUrl}
            title={trailerData.movieTitle}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; muted; loop"
            allowFullScreen
            style={{ 
              pointerEvents: 'none',
              filter: 'brightness(0.7)'
            }}
          />
        </div>

        {/* 3. Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black from-25% via-black/90 via-60% to-transparent" />

        {/* 4. Caption + CTA - Centered and at the bottom */}
        <div className="relative z-20 flex flex-col items-center justify-end h-full text-center px-4 pt-40 pb-28 sm:pt-20 sm:pb-12 md:pb-20 w-full text-white">
          <div className="max-w-md sm:max-w-xl md:max-w-2xl">
            <h2 className="text-xl xxs:text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 animate-fade-in line-clamp-2">
              {trailerData.movieTitle}
            </h2>
            <p className="text-xs xxs:text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6 md:mb-8 animate-fade-in leading-relaxed line-clamp-2 sm:line-clamp-3">
              {trailerData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 animate-fade-in justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 md:px-8 md:py-4 text-sm sm:text-base md:text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate(trailerData.watchNowUrl)}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 md:mr-3" />
                Watch Now
              </Button>
              {trailerData.moreInfoUrl && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-400 text-gray-200 hover:bg-gray-200 hover:text-black font-semibold px-4 py-2 md:px-8 md:py-4 text-sm sm:text-base md:text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                  onClick={() => navigate(trailerData.moreInfoUrl!)}
                >
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 md:mr-3" />
                  More Info
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 5. Hero Logo in top-left for mobile, bottom-right for larger screens */}
        {fetchedHeroLogoUrl && (
          <img 
            src={fetchedHeroLogoUrl}
            alt="Hero Logo"
            className="absolute top-4 left-4 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto z-30 h-10 sm:h-12 md:h-16 lg:h-20 object-contain drop-shadow-lg"
          />
        )}

        {/* 6. Social media buttons placeholder */}
        <div className="hidden md:flex flex-col gap-2 sm:gap-3 absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30">
          {/* Placeholder for SocialButton components */}
          {/* Example: <SocialButton platform="youtube" /> */}
          {/* Example: <SocialButton platform="facebook" /> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
