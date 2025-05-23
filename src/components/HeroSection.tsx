
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  featuredMovie: Movie;
}

const HeroSection = ({ featuredMovie }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${featuredMovie.posterUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {featuredMovie.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
          {featuredMovie.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate(`/watch/${featuredMovie.id}`)}
          >
            <Play className="w-5 h-5 mr-2" />
            Watch Now
          </Button>
          <Button size="lg" variant="outline">
            More Info
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
