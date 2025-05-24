
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalVisits: number;
  totalDownloads: number;
  popularMovies: Array<{
    id: string;
    title: string;
    visits: number;
  }>;
  recentActivity: number;
}

const AnalyticsCard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    totalDownloads: 0,
    popularMovies: [],
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get total visits
      const { data: visits, error: visitsError } = await supabase
        .from('analytics')
        .select('*');

      if (visitsError) throw visitsError;

      const totalVisits = visits?.length || 0;
      const downloadClicks = visits?.filter(v => 
        v.event_type === 'download_click' || v.event_type === 'homepage_download_click'
      ).length || 0;

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentActivity = visits?.filter(v => 
        new Date(v.timestamp) > yesterday
      ).length || 0;

      // Get popular movies (most visited)
      const movieVisits = visits?.filter(v => 
        v.event_type === 'page_view' && v.metadata?.movie_id
      ) || [];

      const movieStats = movieVisits.reduce((acc: any, visit) => {
        const movieId = visit.metadata?.movie_id;
        if (movieId) {
          acc[movieId] = (acc[movieId] || 0) + 1;
        }
        return acc;
      }, {});

      // Get movie titles for popular movies
      const popularMovieIds = Object.entries(movieStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([id]) => id);

      let popularMovies: any[] = [];
      if (popularMovieIds.length > 0) {
        const { data: movies } = await supabase
          .from('movies')
          .select('id, title')
          .in('id', popularMovieIds);

        popularMovies = movies?.map(movie => ({
          id: movie.id,
          title: movie.title,
          visits: movieStats[movie.id] || 0
        })) || [];
      }

      setAnalytics({
        totalVisits,
        totalDownloads: downloadClicks,
        popularMovies,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Clicks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{analytics.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Avg. per Movie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {analytics.popularMovies.length > 0 
                ? Math.round(analytics.totalVisits / analytics.popularMovies.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.popularMovies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Popular Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularMovies.slice(0, 5).map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{movie.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{movie.visits}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsCard;
