
import { useState, useEffect } from 'react';
import { Download, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from '@/types/movie';

interface DownloadSectionProps {
  title: string;
  contentType?: 'movies' | 'webseries' | 'others' | 'all';
  limit?: number;
}

const DownloadSection = ({ title, contentType = 'all', limit = 8 }: DownloadSectionProps) => {
  const [downloads, setDownloads] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, [contentType]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentType !== 'all') {
        query = query.eq('category', contentType);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setDownloads(data.map(movie => ({
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
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (id: string) => {
    // Track homepage click
    trackPageVisit('homepage_download_click', { movie_id: id });
    window.location.href = `/download/${id}`;
  };

  const trackPageVisit = async (event_type: string, metadata: any = {}) => {
    try {
      await supabase
        .from('analytics')
        .insert([{
          event_type,
          metadata,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
              <div className="bg-muted h-4 rounded mb-1"></div>
              <div className="bg-muted h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          {downloads.length} Available
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {downloads.map((download) => (
          <Card
            key={download.id}
            className="movie-card group cursor-pointer border-0 bg-card/50 hover:bg-card"
            onClick={() => handleDownloadClick(download.id)}
          >
            <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
              <img
                src={download.posterUrl}
                alt={download.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Download Badge */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  HD
                </Badge>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-center text-white">
                  <Download className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Download Now</p>
                </div>
              </div>
            </div>

            <CardContent className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {download.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{download.releaseYear}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{download.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {download.category.replace('webseries', 'Web Series')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {downloads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No downloads available in this category yet.</p>
        </div>
      )}
    </section>
  );
};

export default DownloadSection;
