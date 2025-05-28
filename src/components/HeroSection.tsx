
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  featuredMovie?: Movie;
}

const HeroSection = ({ featuredMovie }: HeroSectionProps) => {
  const navigate = useNavigate();

  // Extract YouTube video ID and convert to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1` : url;
  };

  if (!featuredMovie) return null;

  const embedUrl = featuredMovie.videoUrl.includes('youtube') 
    ? getYouTubeEmbedUrl(featuredMovie.videoUrl)
    : featuredMovie.videoUrl;

  return (
    <section className="relative min-h-[80vh] flex items-end justify-start overflow-hidden bg-gradient-to-br from-black via-red-900/10 to-black">
      {/* Background Video/Trailer */}
      <div className="absolute inset-0">
        <iframe
          src={embedUrl}
          title="Featured Trailer"
          className="w-full h-full object-cover"
          allow="autoplay; muted; loop"
          style={{ 
            pointerEvents: 'none',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-2xl">
          {/* Entertainment Hub Branding */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              <span className="text-red-500 tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                Entertainment
              </span>
              <br />
              <span className="text-red-500 tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] ml-8">
                Hub
              </span>
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            {featuredMovie.title}
          </h2>
          
          <p className="text-lg text-gray-200 mb-8 animate-fade-in leading-relaxed">
            {featuredMovie.description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(`/watch/${featuredMovie.id}`)}
            >
              <Play className="w-6 h-6 mr-3" />
              Watch Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(`/watch/${featuredMovie.id}`)}
            >
              <Info className="w-6 h-6 mr-3" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
