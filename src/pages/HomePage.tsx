
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
    console.log('Entertainment Hub - Your Ultimate Entertainment Destination');
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
          title: 'Welcome to Entertainment Hub',
          description: 'Loading your favorite content...',
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
      latest: filteredMovies.filter(movie => movie.category === 'latest' || movie.category === 'movies').slice(0, 12),
      webseries: filteredMovies.filter(movie => movie.category === 'webseries').slice(0, 12),
      trending: filteredMovies.slice(0, 12),
      topPicks: filteredMovies.filter(movie => movie.rating >= 8).slice(0, 10),
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
              <div className="text-xl mb-4">Loading Entertainment Hub...</div>
              <div className="text-sm">Your Ultimate Entertainment Destination</div>
            </div>
          </div>
        ) : searchQuery ? (
          <MovieGrid
            title={`Search Results for "${searchQuery}"`}
            movies={filteredMovies}
          />
        ) : (
          <>
            {/* Netflix-style Horizontal Carousels */}
            <MovieGrid
              title="🎬 Latest Releases"
              movies={moviesByCategory.latest}
              id="latest"
            />
            <MovieGrid
              title="📺 Web Series Collection"
              movies={moviesByCategory.webseries}
              id="webseries"
            />
            <MovieGrid
              title="🔥 Popular Right Now"
              movies={moviesByCategory.trending}
              id="trending"
            />
            <MovieGrid
              title="⭐ Top 10 Picks"
              movies={moviesByCategory.topPicks}
              id="top10"
            />

            {/* Download Sections */}
            <DownloadSection 
              title="💾 Download Latest Movies"
              contentType="movies"
              limit={8}
            />
            <DownloadSection 
              title="📱 Download Web Series"
              contentType="webseries"
              limit={8}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
