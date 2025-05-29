
export interface ExtendedMovie {
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
  downloadLinks?: {
    quality: string;
    url: string;
    size: string;
  }[];
  language?: string;
  tags?: string;
  telegramChannel?: string;
  trailerUrl?: string;
  isFeatured?: boolean;
  releaseDate?: string;
  isScheduled?: boolean;
  commentsEnabled?: boolean;
  ratingsEnabled?: boolean;
  viewCount?: number;
  downloadCount?: number;
}

export interface AdminSettings {
  adsEnabled: boolean;
  adInterval: number;
  database: 'supabase' | 'firebase';
  homePageBanner: string;
  videoBanner: string;
  midRollAd: string;
  darkMode: boolean;
  notifications: boolean;
  contentProtection: boolean;
  watchHistory: boolean;
  autoFetchTrailers: boolean;
}

export interface Analytics {
  totalViews: number;
  totalDownloads: number;
  adClicks: number;
  topMovies: ExtendedMovie[];
  recentActivity: any[];
}

export interface UserRole {
  id: string;
  email: string;
  role: 'super_admin' | 'editor' | 'ad_manager';
  createdAt: string;
}
