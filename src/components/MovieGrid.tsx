import { Movie } from '@/lib/firebaseServices/videoService';
import MovieCard from './MovieCard';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  id?: string;
}

const MovieGrid = ({ title, movies, id }: MovieGridProps) => {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section id={id} className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
          {title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieGrid;
