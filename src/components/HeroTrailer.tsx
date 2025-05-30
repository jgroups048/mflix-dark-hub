import React, { useState, useEffect } from 'react';
import { getHeaderTrailer, HeaderTrailer } from '@/lib/firebaseServices/trailerService';
import { getSiteSettings } from '@/lib/firebaseServices/siteSettingsService';

const HeroTrailer: React.FC = () => {
  const [trailer, setTrailer] = useState<HeaderTrailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedHeroLogoUrl, setFetchedHeroLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        setError(null);

        const trailerData = await getHeaderTrailer();
        setTrailer(trailerData);

        try {
          const settings = await getSiteSettings();
          if (settings && settings.heroLogoUrl && settings.heroLogoUrl.trim() !== '') {
            setFetchedHeroLogoUrl(settings.heroLogoUrl);
            console.log("HeroTrailer: Fetched heroLogoUrl:", settings.heroLogoUrl);
          } else {
            setFetchedHeroLogoUrl(null);
            console.log("HeroTrailer: No valid heroLogoUrl found in site settings.");
          }
        } catch (settingsError) {
          console.error("HeroTrailer: Error fetching site settings for hero logo:", settingsError);
          setFetchedHeroLogoUrl(null);
        }

      } catch (err: any) {
        console.error("HeroTrailer: Error fetching trailer:", err);
        setError(err.message || 'Failed to load trailer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return <div className="relative w-full h-[350px] md:h-[500px] bg-black flex items-center justify-center text-white">Loading Hero...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  if (!trailer) {
    return <div className="container mx-auto p-4 text-center">No trailer data available.</div>;
  }

  const videoId = getYouTubeVideoId(trailer.youtubeUrl);

  if (!videoId) {
    return <div className="container mx-auto p-4 text-center">Invalid YouTube URL.</div>;
  }

  return (
    <div className="relative w-full min-h-[400px] h-[70vh] md:h-[75vh] lg:h-[80vh] max-h-[800px] bg-black overflow-hidden">
      {/* Logo positioned on the video, top-1/4, and consistently near the right edge */}
      {fetchedHeroLogoUrl && (
        <div className="absolute top-1/4 right-8 z-50"> {/* Consistent right-8 offset */}
          <img
            src={fetchedHeroLogoUrl}
            alt="Hero Logo"
            className="h-20 sm:h-28 md:h-36 lg:h-40 object-contain opacity-90 drop-shadow-xl" /* Maintained previous large sizes */
          />
        </div>
      )}

      {/* Video container div - added for clarity, though iframe is positioned relative to the main div */}
      <div className="absolute inset-0 z-0 overflow-hidden"> {/* Ensures iframe cropping if necessary */}
        <iframe
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto" // Cover styling
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
          title={trailer.movieTitle}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: 'none' }} // Added pointerEvents: none
        ></iframe>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-1"></div> {/* Ensure gradient is above video, z-1 as video container is z-0 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white z-10">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{trailer.movieTitle}</h1>
          <p className="text-sm md:text-base mb-4 md:mb-6 line-clamp-2 md:line-clamp-3">{trailer.description}</p>
          <div className="flex space-x-3">
            <a
              href={trailer.watchNowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm md:text-base"
            >
              Watch Now
            </a>
            <a
              href={trailer.moreInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm md:text-base"
            >
              More Info
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroTrailer; 