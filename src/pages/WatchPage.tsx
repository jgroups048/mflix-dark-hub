
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { movies } from '@/data/movies';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const movie = movies.find(m => m.id === id);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">{movie.title}</h1>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <div className="aspect-video w-full">
          <iframe
            src={movie.videoUrl}
            title={movie.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
                {movie.rating}/10
              </span>
              <span>{movie.releaseYear}</span>
              <span>{movie.duration}</span>
              <span className="bg-secondary px-2 py-1 rounded">{movie.genre}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-primary hover:bg-primary/90">
                <Play className="w-4 h-4 mr-2" />
                Watch Now
              </Button>
              <Button variant="outline">Add to Watchlist</Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>

          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
