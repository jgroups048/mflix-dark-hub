
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

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}
