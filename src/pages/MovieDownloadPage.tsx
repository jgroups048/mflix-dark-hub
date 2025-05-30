import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Download, Play, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchVideoById, getRelatedMovies, Movie as ServiceMovie } from '@/lib/firebaseServices/videoService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DownloadLink {
  quality: string;
  url: string;
  size: string;
}

interface MovieDownload extends ServiceMovie {
  downloadLinks: DownloadLink[];
  watchOnlineUrl?: string;
}

interface RelatedMovieDisplay {
  id: string;
  title: string;
  posterUrl?: string;
  releaseYear?: number;
}

const MovieDownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDownload | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<RelatedMovieDisplay[]>([]);
  const [countdown, setCountdown] = useState<{ [key: string]: number }>({});
  const [showLinks, setShowLinks] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);
  const telegramChannelLink = "https://t.me/mflixhub";

  useEffect(() => {
    if (id) {
      console.log('Movie page visited:', id);
      setVisitCount(Math.floor(Math.random() * 1000) + 100);
    }
  }, [id]);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setLoading(false);
        toast({ title: "Error", description: "Movie ID is missing.", variant: "destructive" });
        return;
      }
      try {
        setLoading(true);
        const fetchedMovie = await fetchVideoById(id);
        
        if (fetchedMovie) {
          const staticDownloadLinks: DownloadLink[] = [
            { quality: '480p', url: fetchedMovie.downloadUrl || '#', size: '450 MB' },
            { quality: '720p', url: fetchedMovie.downloadUrl || '#', size: '850 MB' },
            { quality: '1080p', url: fetchedMovie.downloadUrl || '#', size: '1.5 GB' }
          ];

          const movieData: MovieDownload = {
            ...fetchedMovie,
            downloadLinks: staticDownloadLinks,
            watchOnlineUrl: fetchedMovie.videoUrl,
          };
          setMovie(movieData);
          
          if (id) {
            const fetchedRelated = await getRelatedMovies(fetchedMovie.category, id, 6);
            setRelatedMovies(fetchedRelated.map(m => ({
              id: m.id,
              title: m.title,
              posterUrl: m.posterUrl,
              releaseYear: m.releaseYear
            })));
          }
        } else {
          toast({ title: "Movie Not Found", description: "The requested movie does not exist or could not be loaded.", variant: "destructive" });
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast({ title: "Error Loading Movie", description: "There was a problem fetching the movie details. Please try again later.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieData();
  }, [id, toast]);

  const handleDownloadClick = (quality: string, url: string) => {
    console.log(`Download clicked: ${quality}`);
    window.gtag?.('event', 'download_click', { movie_title: movie?.title, quality: quality });
    console.log('Download tracking:', { movie_id: id, quality: quality, movie_title: movie?.title });
    
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
    window.gtag?.('event', 'watch_online', { movie_title: movie?.title });
    console.log('Watch online tracking:', { movie_id: id, movie_title: movie?.title });
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-foreground">Loading Movie Details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Movie Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find the movie you were looking for.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <head>
        <title>{movie.title} ({movie.releaseYear}) - Download HD | Mflix Entertainment HUB</title>
        <meta name="description" content={`Download ${movie.title} (${movie.releaseYear}) in HD quality. Watch online or download in 480p, 720p, 1080p. ${movie.description || ''}`} />
        <meta name="keywords" content={`${movie.title}, download, HD, ${movie.genre || ''}, ${movie.releaseYear}, movies`} />
        <meta property="og:title" content={`${movie.title} (${movie.releaseYear}) - Download HD`} />
        <meta property="og:description" content={movie.description || ''} />
        <meta property="og:image" content={movie.posterUrl || '/placeholder.svg'} />
        <meta property="og:type" content="video.movie" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "description": movie.description || '',
            "image": movie.posterUrl || '/placeholder.svg',
            "datePublished": movie.releaseYear?.toString(),
            "genre": movie.genre?.split(', ').map(g => g.trim()) || [],
            "duration": movie.duration,
          })}
        </script>
      </head>

      <Header onSearch={() => {}} /> 
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-900/10 to-background text-foreground">
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0">
              <div className="md:col-span-1 p-0">
                <img 
                  src={movie.posterUrl || '/placeholder.svg'}
                  alt={movie.title} 
                  className="w-full h-auto md:h-[600px] object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none shadow-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
              <div className="md:col-span-2 p-6 md:p-8">
                <CardHeader className="p-0 mb-6">
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400 mb-2">
                    {movie.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <span>{movie.releaseYear}</span>
                    <span>&bull;</span>
                    <span>{movie.duration}</span>
                    <span>&bull;</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{movie.genre}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {movie.description}
                  </p>
                  <div className="flex items-center space-x-4 py-2 bg-secondary/30 px-4 rounded-lg">
                    <div className="flex items-center text-yellow-400">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Rating:</span> 
                      <span className="ml-1">{movie.rating ? `${movie.rating}/10` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-blue-400">
                      <Eye className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Visits:</span>
                      <span className="ml-1">{visitCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-border/20">
                    <h3 className="text-xl font-semibold text-foreground">Download Links</h3>
                    {movie.downloadLinks.map((link) => (
                      <div key={link.quality} className="p-4 bg-secondary/30 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-medium text-foreground">{link.quality}</span>
                            <span className="text-sm text-muted-foreground ml-2">({link.size})</span>
                          </div>
                          {countdown[link.quality] > 0 ? (
                            <Button variant="secondary" disabled className="w-32">
                              {countdown[link.quality]}s
                            </Button>
                          ) : showLinks[link.quality] ? (
                            <Button 
                              variant="default"
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md w-32"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                          ) : (
                            <Button 
                              variant="default"
                              className="bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white shadow-md w-32"
                              onClick={() => handleDownloadClick(link.quality, link.url)}
                            >
                              <Download className="w-4 h-4 mr-2" /> Get Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/20">
                    {movie.watchOnlineUrl && (
                      <Button 
                        size="lg" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                        onClick={() => handleWatchOnline(movie.watchOnlineUrl!)}
                      >
                        <Play className="w-5 h-5 mr-2" /> Watch Online
                      </Button>
                    )}
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="flex-1 border-teal-500 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300 shadow-lg"
                      onClick={() => window.open(telegramChannelLink, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.58c-.21.96-.76 1.21-1.52.75l-4.9-3.61l-2.31 2.23c-.25.26-.47.47-.97.47z"></path></svg>
                      Join Telegram
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
          {relatedMovies.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedMovies.map((related) => (
                  <Card 
                    key={related.id} 
                    className="bg-card/70 backdrop-blur-sm border-border/10 shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-primary/30"
                    onClick={() => navigate(`/download/${related.id}`)}
                  >
                    <img 
                      src={related.posterUrl || '/placeholder.svg'} 
                      alt={related.title} 
                      className="w-full h-auto object-cover aspect-[2/3]"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground truncate" title={related.title}>{related.title}</h3>
                      <p className="text-xs text-muted-foreground">{related.releaseYear}</p>
                    </div>
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
