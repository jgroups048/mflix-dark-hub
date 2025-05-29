
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Analytics, ExtendedMovie } from '@/types/admin';

interface AnalyticsSectionProps {
  analytics: Analytics;
  movies: ExtendedMovie[];
}

const AnalyticsSection = ({ analytics, movies }: AnalyticsSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Real-Time Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Views</span>
              <span className="text-red-500 font-bold">{analytics.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Downloads</span>
              <span className="text-red-500 font-bold">{analytics.totalDownloads.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Ad Clicks</span>
              <span className="text-red-500 font-bold">{analytics.adClicks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Active Users (24h)</span>
              <span className="text-red-500 font-bold">{Math.floor(Math.random() * 1000)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movies.slice(0, 5).map((movie, index) => (
              <div key={movie.id} className="flex items-center space-x-3">
                <span className="text-red-500 font-bold">#{index + 1}</span>
                <img src={movie.posterUrl} alt={movie.title} className="w-8 h-10 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-white text-sm">{movie.title}</p>
                  <p className="text-xs text-gray-400">{movie.viewCount} views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
