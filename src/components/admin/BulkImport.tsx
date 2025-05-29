
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkImportProps {
  onImportComplete: () => void;
}

const BulkImport = ({ onImportComplete }: BulkImportProps) => {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkImport = async () => {
    try {
      setLoading(true);
      const rows = csvData.split('\n').slice(1); // Skip header
      
      for (const row of rows) {
        const [title, description, posterUrl, trailerUrl, videoUrl, genre, category] = row.split(',');
        
        if (title && posterUrl && videoUrl) {
          await supabase
            .from('movies')
            .insert([{
              title: title.trim(),
              description: description?.trim() || '',
              poster_url: posterUrl.trim(),
              video_url: videoUrl.trim(),
              genre: genre?.trim() || 'Action',
              category: category?.trim() || 'movies',
              duration: '2h 30m',
              rating: 8.0,
              release_year: 2024
            }]);
        }
      }
      
      toast({
        title: 'Bulk Import Complete',
        description: 'Movies imported successfully',
      });
      
      setCsvData('');
      onImportComplete();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Error importing movies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Bulk Import via CSV</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload multiple movies at once using CSV format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">CSV Format</Label>
            <div className="bg-gray-800 p-4 rounded border border-gray-600">
              <p className="text-xs text-gray-300 font-mono">
                title,description,poster_url,trailer_url,video_url,genre,category<br/>
                Movie Title,Description here,https://poster.jpg,https://trailer.com,https://drive.google.com/file/d/ID/view,Action,movies
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">CSV Data</Label>
            <Textarea 
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <Button 
          onClick={handleBulkImport}
          disabled={!csvData || loading}
          className="bg-red-600 hover:bg-red-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          {loading ? 'Importing...' : 'Import Movies'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkImport;
