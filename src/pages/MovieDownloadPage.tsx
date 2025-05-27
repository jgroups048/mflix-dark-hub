
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Download, Play, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DownloadLink {
  quality: string;
  url: string;
  size: string;
}

interface MovieDownload {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  language: string;
  description: string;
  posterUrl: string;
  rating: number;
  duration: string;
  downloadLinks: DownloadLink[];
  watchOnlineUrl: string;
  telegramChannel: string;
}

interface RelatedMovie {
  id: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
}

const MovieDownloadPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDownload | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<RelatedMovie[]>([]);
  const [countdown, setCountdown] = useState<{ [key: string]: number }>({});
  const [showLinks, setShowLinks] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);

  // Track page visit on load
  useEffect(() => {
    if (id) {
      // Temporarily disabled analytics tracking until types are updated
      console.log('Movie page visited:', id);
      // Mock visit count for now
      setVisitCount(Math.floor(Math.random() * 1000) + 100);
    }
  }, [id]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching movie:', error);
          // Fall back to mock data if database fails
          loadMockData();
          return;
        }
        
        if (data) {
          const movieData: MovieDownload = {
            id: data.id,
            title: data.title,
            releaseYear: data.release_year,
            genre: data.genre,
            language: 'English', // Default language
            description: data.description || '',
            posterUrl: data.poster_url,
            rating: data.rating,
            duration: data.duration,
            downloadLinks: [
              { quality: '480p', url: 'https://drive.google.com/file/d/example480p', size: '450 MB' },
              { quality: '720p', url: 'https://drive.google.com/file/d/example720p', size: '850 MB' },
              { quality: '1080p', url: 'https://drive.google.com/file/d/example1080p', size: '1.5 GB' }
            ],
            watchOnlineUrl: data.video_url,
            telegramChannel: 'https://t.me/mflixhub'
          };
          
          setMovie(movieData);
          
          // Fetch related movies
          const { data: relatedData } = await supabase
            .from('movies')
            .select('id, title, poster_url, release_year')
            .neq('id', id)
            .eq('category', data.category)
            .limit(6);
            
          if (relatedData) {
            setRelatedMovies(relatedData.map(m => ({
              id: m.id,
              title: m.title,
              posterUrl: m.poster_url,
              releaseYear: m.release_year
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        loadMockData();
      } finally {
        setLoading(false);
      }
    };
    
    const loadMockData = () => {
      // Fallback mock data
      const mockMovie: MovieDownload = {
        id: id || '1',
        title: 'The Dark Knight',
        releaseYear: 2008,
        genre: 'Action, Crime, Drama',
        language: 'English',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterUrl: 'https://images.unsplash.com/photo-1489599904472-06651c42716e?w=400&h=600&fit=crop',
        rating: 9.0,
        duration: '152 min',
        downloadLinks: [
          { quality: '480p', url: 'https://drive.google.com/file/d/example480p', size: '450 MB' },
          { quality: '720p', url: 'https://drive.google.com/file/d/example720p', size: '850 MB' },
          { quality: '1080p', url: 'https://drive.google.com/file/d/example1080p', size: '1.5 GB' }
        ],
        watchOnlineUrl: 'https://drive.google.com/file/d/examplewatch',
        telegramChannel: 'https://t.me/mflixhub'
      };

      const mockRelatedMovies: RelatedMovie[] = [
        { id: '2', title: 'Batman Begins', posterUrl: 'https://images.unsplash.com/photo-1489599904472-06651c42716e?w=200&h=300&fit=crop', releaseYear: 2005 },
        { id: '3', title: 'The Dark Knight Rises', posterUrl: 'https://images.unsplash.com/photo-1489599904472-06651c42716e?w=200&h=300&fit=crop', releaseYear: 2012 },
      ];

      setMovie(mockMovie);
      setRelatedMovies(mockRelatedMovies);
    };
    
    fetchMovie();
  }, [id]);

  const handleDownloadClick = (quality: string, url: string) => {
    console.log(`Download clicked: ${quality}`);
    
    // Track click event
    window.gtag?.('event', 'download_click', {
      movie_title: movie?.title,
      quality: quality
    });

    // Temporarily disabled analytics tracking until types are updated
    console.log('Download tracking:', { 
      movie_id: id,
      quality: quality,
      movie_title: movie?.title 
    });
    
    const countdownTime = 10;
    setCountdown(prev => ({ ...prev, [quality]: countdownTime }));
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCount = (prev[quality] || 0) - 1;
        if (newCount <= 0) {
          clearInterval(timer);
          setShowLinks(prevLinks => ({ ...prevLinks, [quality]: true }));
          window.open(url, '_blank');
          return { ...prev, [quality]: 0 };
        }
        return { ...prev, [quality]: newCount };
      });
    }, 1000);
  };

  const handleWatchOnline = (url: string) => {
    console.log('Watch online clicked');
    
    // Track watch event
    window.gtag?.('event', 'watch_online', {
      movie_title: movie?.title
    });

    // Temporarily disabled analytics tracking until types are updated
    console.log('Watch online tracking:', { 
      movie_id: id,
      movie_title: movie?.title 
    });
    
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <Button onClick={() => window.location.href = '/'}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Head Tags */}
      <head>
        <title>{movie.title} ({movie.releaseYear}) - Download HD | Mflix Entertainment HUB</title>
        <meta name="description" content={`Download ${movie.title} (${movie.releaseYear}) in HD quality. Watch online or download in 480p, 720p, 1080p. ${movie.description}`} />
        <meta name="keywords" content={`${movie.title}, download, HD, ${movie.genre}, ${movie.releaseYear}, movies`} />
        <meta property="og:title" content={`${movie.title} (${movie.releaseYear}) - Download HD`} />
        <meta property="og:description" content={movie.description} />
        <meta property="og:image" content={movie.posterUrl} />
        <meta property="og:type" content="video.movie" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "description": movie.description,
            "image": movie.posterUrl,
            "datePublished": movie.releaseYear.toString(),
            "genre": movie.genre.split(', '),
            "duration": movie.duration,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": movie.rating,
              "bestRating": "10"
            }
          })}
        </script>
      </head>

      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Movie Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Poster */}
            <div className="lg:col-span-1">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {movie.title} ({movie.releaseYear})
                </h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <span>Genre: {movie.genre}</span>
                  <span>Duration: {movie.duration}</span>
                  <span>Language: {movie.language}</span>
                  <span>Rating: {movie.rating}/10</span>
                  {visitCount > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <Eye className="w-4 h-4" />
                      {visitCount.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
              </div>

              {/* Download Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {movie.downloadLinks.map((link) => (
                      <div key={link.quality} className="space-y-2">
                        <Button
                          onClick={() => handleDownloadClick(link.quality, link.url)}
                          className="w-full"
                          disabled={countdown[link.quality] > 0}
                        >
                          {countdown[link.quality] > 0 ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {countdown[link.quality]}s
                            </div>
                          ) : (
                            <>Download {link.quality}</>
                          )}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                          Size: {link.size}
                        </div>
                        {showLinks[link.quality] && (
                          <div className="text-center">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Click here if download doesn't start
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => handleWatchOnline(movie.watchOnlineUrl)}
                      variant="secondary"
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Online
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Telegram Join Prompt */}
          <Card className="mb-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Join Our Telegram Channel</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Get instant notifications for latest movies, web series, and exclusive content!
              </p>
              <Button
                onClick={() => window.open(movie.telegramChannel, '_blank')}
                className="bg-[#0088cc] hover:bg-[#0077bb] text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Telegram Channel
              </Button>
            </CardContent>
          </Card>

          {/* Related Movies */}
          {relatedMovies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedMovies.map((relatedMovie) => (
                  <Card
                    key={relatedMovie.id}
                    className="cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => window.location.href = `/download/${relatedMovie.id}`}
                  >
                    <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                      <img
                        src={relatedMovie.posterUrl}
                        alt={relatedMovie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {relatedMovie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {relatedMovie.releaseYear}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MovieDownloadPage;
