
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, TrendingUp, Users } from 'lucide-react';

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
    // Temporarily disabled until Supabase types are updated
    // fetchAnalytics();
    
    // Mock data for now
    setAnalytics({
      totalVisits: 1234,
      totalDownloads: 567,
      popularMovies: [
        { id: '1', title: 'Popular Movie 1', visits: 45 },
        { id: '2', title: 'Popular Movie 2', visits: 38 },
        { id: '3', title: 'Popular Movie 3', visits: 32 }
      ],
      recentActivity: 23
    });
    setLoading(false);
  }, []);

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
