import { Play } from 'lucide-react';
import { Movie } from '@/lib/firebaseServices/videoService';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${movie.id}`);
  };

  return (
    <div className="movie-card group cursor-pointer" onClick={handleClick}>
      <div className="aspect-[2/3] relative">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover rounded-lg"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-primary rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{movie.title}</h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{movie.releaseYear}</span>
            <span className="bg-primary px-2 py-1 rounded text-xs">
              {movie.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
