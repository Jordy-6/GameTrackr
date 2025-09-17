export interface Game {
  id: number;
  title: string;
  genre: string;
  description: string;
  platform: string;
  releaseDate: Date;
  rating: number; // Note sur 10
  coverImageUrl: string;
  status: 'completed' | 'playing' | 'wishlist' | 'abandoned' | 'none';
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserGameData {
  userId: number;
  gameId: number;
  rating: number;
  status: 'completed' | 'playing' | 'wishlist' | 'abandoned' | 'none';
  updatedAt: Date;
}

export interface UpdateUserGameData {
  rating?: number;
  status?: 'completed' | 'playing' | 'wishlist' | 'abandoned' | 'none';
}
