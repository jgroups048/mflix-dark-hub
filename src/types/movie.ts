
export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl: string;
  genre: string;
  category: 'latest' | 'trending' | 'webseries' | 'movies' | 'livetv';
  rating: number;
  duration: string;
  releaseYear: number;
}

export interface ExtendedMovie extends Movie {
  language?: string;
  tags?: string;
  telegramChannel?: string;
  downloadLinks?: DownloadLink[];
}

export interface DownloadLink {
  quality: string;
  url: string;
  size: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}
