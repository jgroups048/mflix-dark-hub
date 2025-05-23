
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MovieGrid from '@/components/MovieGrid';
import Footer from '@/components/Footer';
import { movies } from '@/data/movies';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredMovie = movies[0];

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const moviesByCategory = useMemo(() => {
    return {
      latest: filteredMovies.filter(movie => movie.category === 'latest'),
      trending: filteredMovies.filter(movie => movie.category === 'trending'),
      webseries: filteredMovies.filter(movie => movie.category === 'webseries'),
      movies: filteredMovies.filter(movie => movie.category === 'movies'),
      livetv: filteredMovies.filter(movie => movie.category === 'livetv'),
    };
  }, [filteredMovies]);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      
      {!searchQuery && <HeroSection featuredMovie={featuredMovie} />}
      
      <main className="pb-8">
        {searchQuery ? (
          <MovieGrid
            title={`Search Results for "${searchQuery}"`}
            movies={filteredMovies}
          />
        ) : (
          <>
            <MovieGrid
              title="Latest Releases"
              movies={moviesByCategory.latest}
              id="latest"
            />
            <MovieGrid
              title="Trending Now"
              movies={moviesByCategory.trending}
              id="trending"
            />
            <MovieGrid
              title="Web Series"
              movies={moviesByCategory.webseries}
              id="webseries"
            />
            <MovieGrid
              title="Movies"
              movies={moviesByCategory.movies}
              id="movies"
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
