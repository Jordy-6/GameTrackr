import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Game, UpdateUserGameData, UserGameData } from '../model/game.model';
import { AuthService } from '../../auth/services/auth.service';

// Interface pour les données personnalisées de l'utilisateur

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private authService = inject(AuthService);

  private readonly gameLibrary: Game[] = [
    {
      id: 1,
      title: 'The Legend of Zelda: Breath of the Wild',
      genre: 'Action-Adventure',
      description: "Un jeu d'aventure en monde ouvert avec Link qui explore Hyrule.",
      platform: 'Nintendo Switch',
      releaseDate: new Date('2017-03-03'),
      coverImageUrl: 'https://placehold.co/600x400/1e40af/ffffff?text=Zelda+BOTW',
      createdAt: new Date('2017-03-03'),
      rating: 0,
      status: 'none',
    },
    {
      id: 2,
      title: 'Cyberpunk 2077',
      genre: 'RPG',
      description: 'Un RPG futuriste dans une ville cyberpunk.',
      platform: 'PC',
      releaseDate: new Date('2020-12-10'),
      coverImageUrl: 'https://placehold.co/600x400/dc2626/ffffff?text=Cyberpunk+2077',
      createdAt: new Date('2020-12-10'),
      rating: 0,
      status: 'none',
    },
    {
      id: 3,
      title: 'Red Dead Redemption 2',
      genre: 'Action-Adventure',
      description: 'Western en monde ouvert avec Arthur Morgan.',
      platform: 'PlayStation 4',
      releaseDate: new Date('2018-10-26'),
      coverImageUrl: 'https://placehold.co/600x400/b45309/ffffff?text=Red+Dead+2',
      createdAt: new Date('2018-10-26'),
      rating: 0,
      status: 'none',
    },
    {
      id: 4,
      title: 'Hollow Knight',
      genre: 'Metroidvania',
      description: 'Jeu de plateforme 2D avec exploration et combat.',
      platform: 'PC',
      releaseDate: new Date('2017-02-24'),
      coverImageUrl: 'https://placehold.co/600x400/374151/ffffff?text=Hollow+Knight',
      createdAt: new Date('2017-02-24'),
      rating: 0,
      status: 'none',
    },
    {
      id: 5,
      title: 'Elden Ring',
      genre: 'Action RPG',
      description: 'Souls-like en monde ouvert développé par FromSoftware.',
      platform: 'PC',
      releaseDate: new Date('2022-02-25'),
      coverImageUrl: 'https://placehold.co/600x400/059669/ffffff?text=Elden+Ring',
      createdAt: new Date('2022-02-25'),
      rating: 0,
      status: 'none',
    },
    {
      id: 6,
      title: 'God of War',
      genre: 'Action-Adventure',
      description: 'Kratos et son fils Atreus explorent la mythologie nordique.',
      platform: 'PlayStation 4',
      releaseDate: new Date('2018-04-20'),
      coverImageUrl: 'https://placehold.co/600x400/7c2d12/ffffff?text=God+of+War',
      createdAt: new Date('2018-04-20'),
      rating: 0,
      status: 'none',
    },
    {
      id: 7,
      title: 'The Witcher 3: Wild Hunt',
      genre: 'RPG',
      description: 'Geralt de Riv dans sa dernière aventure épique.',
      platform: 'PC',
      releaseDate: new Date('2015-05-19'),
      coverImageUrl: 'https://placehold.co/600x400/991b1b/ffffff?text=Witcher+3',
      createdAt: new Date('2015-05-19'),
      rating: 0,
      status: 'none',
    },
    {
      id: 8,
      title: 'Super Mario Odyssey',
      genre: 'Platformer',
      description: 'Mario voyage à travers différents royaumes avec Cappy.',
      platform: 'Nintendo Switch',
      releaseDate: new Date('2017-10-27'),
      coverImageUrl: 'https://placehold.co/600x400/dc2626/ffffff?text=Mario+Odyssey',
      createdAt: new Date('2017-10-27'),
      rating: 0,
      status: 'none',
    },
    {
      id: 9,
      title: 'Hades',
      genre: 'Roguelike',
      description: "Zagreus tente de s'échapper des Enfers dans ce roguelike narratif.",
      platform: 'PC',
      releaseDate: new Date('2020-09-17'),
      coverImageUrl: 'https://placehold.co/600x400/7c3aed/ffffff?text=Hades',
      createdAt: new Date('2020-09-17'),
      rating: 0,
      status: 'none',
    },
    {
      id: 10,
      title: 'Ghost of Tsushima',
      genre: 'Action-Adventure',
      description: "Jin Sakai défend l'île de Tsushima contre l'invasion mongole.",
      platform: 'PlayStation 4',
      releaseDate: new Date('2020-07-17'),
      coverImageUrl: 'https://placehold.co/600x400/059669/ffffff?text=Ghost+Tsushima',
      createdAt: new Date('2020-07-17'),
      rating: 0,
      status: 'none',
    },
  ];

  // Personalized data per user (we store userId and gameId)
  private userGameData = signal<UserGameData[]>([]);

  constructor() {
    this.loadUserGameDataFromStorage();
  }

  private loadUserGameDataFromStorage(): void {
    try {
      const savedData = localStorage.getItem('userGameData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert dates string in objects Date
        const dataWithDates = parsedData.map((item: UserGameData) => ({
          ...item,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        }));
        this.userGameData.set(dataWithDates);
      } else {
        // Initial mock data if none in localStorage
        this.userGameData.set([
          {
            userId: 1,
            gameId: 1,
            rating: 9.5,
            status: 'completed',
            updatedAt: new Date('2023-01-15'),
          },
          {
            userId: 1,
            gameId: 2,
            rating: 7.0,
            status: 'playing',
            updatedAt: new Date('2023-02-01'),
          },
          {
            userId: 2,
            gameId: 1,
            rating: 8.0,
            status: 'wishlist',
            updatedAt: new Date('2023-01-20'),
          },
          {
            userId: 2,
            gameId: 3,
            rating: 9.0,
            status: 'completed',
            updatedAt: new Date('2023-03-01'),
          },
        ]);
        this.saveUserGameDataToStorage();
      }
    } catch (error) {
      console.error('Error loading user game data from storage:', error);
    }
  }

  private saveUserGameDataToStorage(): void {
    try {
      localStorage.setItem('userGameData', JSON.stringify(this.userGameData()));
    } catch (error) {
      console.error('Error saving user game data to storage:', error);
    }
  }

  getAllPersonalGames(): Observable<Game[]> {
    const currentUser = this.authService.getCurrentUser();

    // If no user is logged in, return games without user-specific data
    if (!currentUser) {
      const gamesWithoutUserData = this.gameLibrary.map((game) => ({
        ...game,
        rating: 0,
        status: 'none' as const,
        updatedAt: undefined,
      }));
      return of(gamesWithoutUserData).pipe(delay(300));
    }

    // get all user game data for the current user
    const userGames = this.userGameData().filter((data) => data.userId === currentUser.id);

    // Merge game library with user-specific data
    const gamesWithUserData = this.gameLibrary.map((game) => {
      const userGame = userGames.find((ug) => ug.gameId === game.id);
      return {
        ...game,
        rating: userGame ? userGame.rating : 0,
        status: userGame ? userGame.status : 'none',
        updatedAt: userGame ? userGame.updatedAt : undefined,
      };
    });

    return of(gamesWithUserData).pipe(delay(300));
  }

  updateUserGameData(updatedData: UpdateUserGameData, gameId: number): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User must be logged in'));
    }

    // If status is 'none', we remove the entry
    if (updatedData.status === 'none') {
      this.userGameData.update((current) =>
        current.filter(
          (data: UserGameData) => !(data.userId === currentUser.id && data.gameId === gameId),
        ),
      );
    } else {
      const existingData = this.userGameData().find(
        (data: UserGameData) => data.userId === currentUser.id && data.gameId === gameId,
      );

      if (existingData) {
        // Update existing data
        this.userGameData.update((current) =>
          current.map((data: UserGameData) =>
            data.userId === currentUser.id && data.gameId === gameId
              ? { ...data, ...updatedData, updatedAt: new Date() }
              : data,
          ),
        );
      } else {
        // Add new entry
        this.userGameData.update((current) => [
          ...current,
          {
            userId: currentUser.id,
            gameId: gameId,
            rating: updatedData.rating ?? 0,
            status: updatedData.status ?? 'none',
            updatedAt: new Date(),
          },
        ]);
      }
    }

    this.saveUserGameDataToStorage();

    return of(void 0).pipe(delay(200));
  }
}
