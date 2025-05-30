import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addVideo, Movie } from '@/lib/firebaseServices/videoService';

interface BulkImportProps {
  onImportComplete: () => void;
}

// Define the expected structure of a CSV row after parsing
interface CsvMovieData {
  title: string;
  description?: string;
  posterUrl?: string;
  trailerUrl?: string;
  videoUrl?: string;
  genre?: string;
  category?: string;
  // Add other fields from CSV if necessary, e.g., rating, releaseYear
  rating?: number;
  releaseYear?: number;
  duration?: string;
  language?: string;
  tags?: string;
  isFeatured?: boolean;
  downloadUrl?: string;
}

const BulkImport = ({ onImportComplete }: BulkImportProps) => {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkImport = async () => {
    try {
      setLoading(true);
      const rows = csvData.split('\n').filter(row => row.trim() !== ''); // Filter out empty rows
      const header = rows.shift()?.toLowerCase().split(',').map(h => h.trim()); // Get header, convert to lower, trim
      
      if (!header) {
        toast({ title: 'Import Error', description: 'CSV header is missing.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      let moviesImportedCount = 0;

      for (const row of rows) {
        const values = row.split(',').map(v => v.trim());
        const movieCsv: Partial<CsvMovieData> = {};
        
        header.forEach((colName, index) => {
          // Map CSV header to CsvMovieData properties
          // This allows flexible CSV column names as long as they match expected keys after normalization
          // e.g., poster_url in CSV becomes posterUrl here
          const key = colName.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof CsvMovieData;
          movieCsv[key] = values[index];
        });

        if (movieCsv.title && (movieCsv.videoUrl || movieCsv.trailerUrl)) { // Basic validation
          const movieDataForFirebase: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'> = {
            title: movieCsv.title,
            description: movieCsv.description || '',
            posterUrl: movieCsv.posterUrl,
            trailerUrl: movieCsv.trailerUrl,
            videoUrl: movieCsv.videoUrl,
            downloadUrl: movieCsv.downloadUrl, // Ensure Movie interface has this
            genre: movieCsv.genre || 'General', // Default genre
            category: movieCsv.category || 'movies', // Default category
            rating: movieCsv.rating ? parseFloat(movieCsv.rating as unknown as string) : undefined, // Parse rating
            releaseYear: movieCsv.releaseYear ? parseInt(movieCsv.releaseYear as unknown as string, 10) : undefined, // Parse year
            duration: movieCsv.duration, 
            language: movieCsv.language,
            tags: movieCsv.tags,
            isFeatured: movieCsv.isFeatured ? (movieCsv.isFeatured as unknown as string).toLowerCase() === 'true' : false,
            // viewCount and downloadCount are usually managed server-side or via analytics
          };
          await addVideo(movieDataForFirebase);
          moviesImportedCount++;
        }
      }
      
      if (moviesImportedCount > 0) {
        toast({
          title: 'Bulk Import Complete',
          description: `${moviesImportedCount} movie(s) imported successfully`,
        });
      } else {
        toast({
          title: 'Import Note',
          description: 'No valid movie data found to import. Please check CSV format and content.',
          variant: 'default' // Changed from destructive for this case
        });
      }
      
      setCsvData('');
      if (moviesImportedCount > 0) onImportComplete();
    } catch (error: any) {
      console.error("Bulk import error:", error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Error importing movies. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Bulk Import via CSV</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload multiple movies at once. Ensure CSV columns match expected fields like: <br />
          `title,description,posterUrl,trailerUrl,videoUrl,downloadUrl,genre,category,rating,releaseYear,duration,language,tags,isFeatured`
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV Format Example (Header followed by data)</Label>
            <div className="bg-gray-800 p-4 rounded border border-gray-600 text-xs font-mono overflow-x-auto">
              title,description,posterUrl,trailerUrl,videoUrl,downloadUrl,genre,category,rating,releaseYear,duration,language,tags,isFeatured<br/>
              Awesome Movie,"Epic description",https://example.com/poster.jpg,https://youtube.com/trailer,https://example.com/movie.mp4,https://example.com/download.mp4,Action,movies,8.5,2023,"2h 15m",English,"epic,action",true
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="csvDataTextarea">CSV Data</Label>
            <Textarea 
              id="csvDataTextarea"
              placeholder="Paste your CSV data here, starting with the header row..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10} // Increased rows
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <Button 
          onClick={handleBulkImport}
          disabled={!csvData.trim() || loading} // check csvData.trim()
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          {loading ? 'Importing...' : 'Import Movies'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkImport;
