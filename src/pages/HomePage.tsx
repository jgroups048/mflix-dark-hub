import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MovieGrid from '@/components/MovieGrid';
import DownloadSection from '@/components/DownloadSection';
import Footer from '@/components/Footer';
import SocialMediaButtons from '@/components/SocialMediaButtons';
import { getAllVideos, Movie } from '@/lib/firebaseServices/videoService';
import { useToast } from '@/hooks/use-toast';
import HeroTrailer from '@/components/HeroTrailer';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Track page visit
  useEffect(() => {
    console.log('Entertainment Hub - Your Ultimate Entertainment Destination');
  }, []);

  // Fetch movies from Firebase
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const fetchedMovies = await getAllVideos();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast({
          title: 'Error Loading Content',
          description: 'Could not load movie data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    return movies.filter(movie =>
      (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, movies]);

  const moviesByCategory = useMemo(() => {
    return {
      latest: filteredMovies.filter(movie => movie.category === 'latest' || movie.category === 'movies').slice(0, 12),
      webseries: filteredMovies.filter(movie => movie.category === 'webseries').slice(0, 12),
      trending: filteredMovies.slice(0, 12),
      topPicks: filteredMovies.filter(movie => movie.rating && movie.rating >= 8).slice(0, 10),
    };
  }, [filteredMovies]);

  return (
    <div className="bg-black min-h-screen">
      <Header onSearch={setSearchQuery} />
      {/* <HeroTrailer /> */}
      
      {!searchQuery && <HeroSection />}
      
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
            <MovieGrid
              title="🎬 Latest Movies"
              movies={moviesByCategory.latest}
              id="latest"
            />
            <MovieGrid
              title="📺 Web Series Collection"
              movies={moviesByCategory.webseries}
              id="webseries"
            />
            <MovieGrid
              title="🔥 Trending Now"
              movies={moviesByCategory.trending}
              id="trending"
              className="mt-8"
            />
            <MovieGrid
              title="⭐ Top 10 Picks"
              movies={moviesByCategory.topPicks}
              id="top10"
            />
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
      <SocialMediaButtons />
    </div>
  );
};

export default HomePage;
