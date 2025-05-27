
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-red-900/10 to-black">
      {/* Background Image */}
      {featuredMovie && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url(${featuredMovie.posterUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-6xl">
        {/* MFLIX Logo and Branding */}
        <div className="mb-12">
          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-bold mb-6 animate-fade-in">
              <span className="text-red-500 tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                MFLIX
              </span>
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in tracking-wide">
            ENTERTAINMENT HUB
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 animate-fade-in italic">
            Powered by J GROUPS
          </p>
        </div>
        
        {/* About Description */}
        <div className="mb-12 max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-gray-200 leading-relaxed animate-fade-in">
            Mflix is your one-stop entertainment hub for movies and web series. 
            Crafted by J GROUPS to give you the best binge-worthy experience, 
            with stunning visuals and modern UI.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
          {featuredMovie && (
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(`/watch/${featuredMovie.id}`)}
            >
              <Play className="w-6 h-6 mr-3" />
              Watch Now
            </Button>
          )}
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-10 py-4 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Info className="w-6 h-6 mr-3" />
            More Info
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
