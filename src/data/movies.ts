
import { Movie } from '@/types/movie';

export const movies: Movie[] = [
  {
    id: '1',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    genre: 'Action',
    category: 'trending',
    rating: 9.0,
    duration: '2h 32m',
    releaseYear: 2008
  },
  {
    id: '2',
    title: 'Stranger Things',
    description: 'A group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.',
    posterUrl: 'https://images.unsplash.com/photo-1489599211-3c681f1a3134?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU',
    genre: 'Sci-Fi',
    category: 'webseries',
    rating: 8.7,
    duration: '45m',
    releaseYear: 2016
  },
  {
    id: '3',
    title: 'Avengers: Endgame',
    description: 'After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
    genre: 'Action',
    category: 'movies',
    rating: 8.4,
    duration: '3h 1m',
    releaseYear: 2019
  },
  {
    id: '4',
    title: 'Money Heist',
    description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/p_PJbmrX4uk',
    genre: 'Crime',
    category: 'webseries',
    rating: 8.2,
    duration: '1h 10m',
    releaseYear: 2017
  },
  {
    id: '5',
    title: 'Live Sports Channel',
    description: 'Watch live sports events, breaking news, and exclusive coverage of your favorite teams and athletes.',
    posterUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=SPORTS',
    genre: 'Sports',
    category: 'livetv',
    rating: 7.5,
    duration: 'Live',
    releaseYear: 2024
  },
  {
    id: '6',
    title: 'Inception',
    description: 'A skilled thief is given a chance at redemption if he can accomplish the impossible task of inception: planting an idea in someone\'s mind.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Sci-Fi',
    category: 'latest',
    rating: 8.8,
    duration: '2h 28m',
    releaseYear: 2010
  }
];
