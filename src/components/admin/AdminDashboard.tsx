
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Bell } from 'lucide-react';
import { ExtendedMovie, Analytics } from '@/types/admin';

interface AdminDashboardProps {
  movies: ExtendedMovie[];
  analytics: Analytics;
  onAddContent: () => void;
  onBulkImport: () => void;
  onSendNotification: () => void;
}

const AdminDashboard = ({ 
  movies, 
  analytics, 
  onAddContent, 
  onBulkImport, 
  onSendNotification 
}: AdminDashboardProps) => {
  const totalMovies = movies.length;
  const featuredMovies = movies.filter(m => m.isFeatured).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalMovies}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{featuredMovies}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.totalDownloads.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ad Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.adClicks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={onAddContent}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Content
            </Button>
            <Button className="w-full" variant="outline" onClick={onBulkImport}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import CSV
            </Button>
            <Button className="w-full" variant="outline" onClick={onSendNotification}>
              <Bell className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movies.slice(0, 5).map((movie) => (
                <div key={movie.id} className="flex items-center space-x-4 p-2 border border-gray-700 rounded">
                  <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{movie.title}</h4>
                    <p className="text-sm text-gray-400">{movie.viewCount} views • {movie.downloadCount} downloads</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
