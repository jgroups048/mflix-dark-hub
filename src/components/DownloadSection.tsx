import { useState, useEffect } from 'react';
import { Download, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVideosByContentType, Movie } from '@/lib/firebaseServices/videoService';
import { useNavigate } from 'react-router-dom';

interface DownloadSectionProps {
  title: string;
  contentType?: 'movies' | 'webseries' | 'latest' | 'trending' | 'livetv' | 'all';
  limit?: number;
}

const DownloadSection = ({ title, contentType = 'all', limit = 8 }: DownloadSectionProps) => {
  const [downloads, setDownloads] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDownloadsData = async () => {
      try {
        setLoading(true);
        const fetchedDownloads = await getVideosByContentType(contentType, limit);
        setDownloads(fetchedDownloads);
      } catch (error) {
        console.error(`Error fetching downloads for ${contentType}:`, error);
        setDownloads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloadsData();
  }, [contentType, limit]);

  const handleDownloadClick = (id: string) => {
    console.log('Download card clicked for movie:', id);
    navigate(`/download/${id}`);
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 gradient-text">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
              <div className="bg-muted h-4 rounded mb-1 w-full"></div>
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
        {downloads.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {downloads.length} Available
          </Badge>
        )}
      </div>

      {downloads.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {downloads.map((download) => (
            <Card
              key={download.id}
              className="movie-card group cursor-pointer border-0 bg-card/50 hover:bg-card transition-all duration-200 ease-in-out transform hover:-translate-y-1"
              onClick={() => handleDownloadClick(download.id)}
            >
              <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                <img
                  src={download.posterUrl || '/placeholder.svg'}
                  alt={download.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground text-xs shadow">
                    <Download className="w-3 h-3 mr-1" />
                    HD
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                  <div className="text-center text-white p-2">
                    <Download className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs font-semibold">View Details</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors" title={download.title}>
                  {download.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{download.releaseYear || 'N/A'}</span>
                  {download.rating && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{download.rating}</span>
                    </div>
                  )}
                </div>
                {download.category && (
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {download.category.replace('webseries', 'Web Series')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No downloads available in this category yet.</p>
          <p className="text-sm mt-1">Check back later or explore other categories!</p>
        </div>
      )}
    </section>
  );
};

export default DownloadSection;
