
import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MovieGrid from '@/components/MovieGrid';
import DownloadSection from '@/components/DownloadSection';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Track page visit
  useEffect(() => {
    console.log('MFLIX Homepage visited - Entertainment Hub');
  }, []);

  // Fetch movies from database
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setMovies(data.map(movie => ({
            id: movie.id,
            title: movie.title,
            description: movie.description || '',
            posterUrl: movie.poster_url,
            videoUrl: movie.video_url,
            genre: movie.genre,
            category: movie.category as any,
            rating: movie.rating,
            duration: movie.duration,
            releaseYear: movie.release_year
          })));
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content from MFLIX database',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  const featuredMovie = useMemo(() => movies[0], [movies]);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, movies]);

  const moviesByCategory = useMemo(() => {
    return {
      latest: filteredMovies.filter(movie => movie.category === 'latest'),
      movies: filteredMovies.filter(movie => movie.category === 'movies'),
      webseries: filteredMovies.filter(movie => movie.category === 'webseries'),
      livetv: filteredMovies.filter(movie => movie.category === 'livetv'),
    };
  }, [filteredMovies]);

  return (
    <div className="min-h-screen bg-black">
      <Header onSearch={setSearchQuery} />
      
      {!searchQuery && <HeroSection featuredMovie={featuredMovie} />}
      
      <main className="pb-8">
        {loading ? (
          <div className="container mx-auto px-4 py-20 text-center text-gray-400">
            <div className="animate-pulse">
              <div className="text-xl mb-4">Loading MFLIX Entertainment...</div>
              <div className="text-sm">Powered by J GROUPS</div>
            </div>
          </div>
        ) : searchQuery ? (
          <MovieGrid
            title={`Search Results for "${searchQuery}"`}
            movies={filteredMovies}
          />
        ) : (
          <>
            {/* Download Sections */}
            <DownloadSection 
              title="🎬 Latest Movie Downloads"
              contentType="movies"
              limit={8}
            />
            <DownloadSection 
              title="📺 Web Series Downloads"
              contentType="webseries"
              limit={8}
            />
            <DownloadSection 
              title="⭐ Premium Collection"
              contentType="movies"
              limit={8}
            />

            {/* Regular Movie Grids */}
            <MovieGrid
              title="Latest Releases"
              movies={moviesByCategory.latest}
              id="latest"
            />
            <MovieGrid
              title="Movies"
              movies={moviesByCategory.movies}
              id="movies"
            />
            <MovieGrid
              title="Web Series"
              movies={moviesByCategory.webseries}
              id="webseries"
            />
            <MovieGrid
              title="Live TV"
              movies={moviesByCategory.livetv}
              id="livetv"
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
