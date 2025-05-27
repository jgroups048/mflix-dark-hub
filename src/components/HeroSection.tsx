
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  featuredMovie?: Movie;
}

const HeroSection = ({ featuredMovie }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-r from-black via-red-900/20 to-black">
      {/* Background Image */}
      {featuredMovie && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url(${featuredMovie.posterUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <div className="mb-8">
          <img 
            src="/lovable-uploads/d893c6d0-27f6-4587-b460-81767b56a0d4.png" 
            alt="Mflix Logo" 
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
          />
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in">
            <span className="text-red-500 tracking-wider">MFLIX</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 animate-fade-in">
            ENTERTAINMENT HUB
          </h2>
        </div>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Mflix is your one-stop entertainment hub bringing you the best of movies and web series across genres. 
          Powered by J GROUPS, crafted for your binge-worthy moments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          {featuredMovie && (
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3"
              onClick={() => navigate(`/watch/${featuredMovie.id}`)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Now
            </Button>
          )}
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-3"
          >
            <Info className="w-5 h-5 mr-2" />
            More Info
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
