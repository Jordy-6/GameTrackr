export interface Game {
  id: number;
  title: string;
  genre: string;
  desription: string;
  platform: string;
  releaseDate: Date;
  rating: number; // Note sur 10
  coverImageUrl: string;
  status: 'completed' | 'playing' | 'wishlist' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}
