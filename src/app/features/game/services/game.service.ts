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

  // Bibliothèque de jeux fixe (ne change jamais)
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
  ];

  // Données personnalisées par utilisateur (stockées par userId puis gameId)
  private userGameData = signal<UserGameData[]>([]);

  constructor() {
    this.loadUserGameDataFromStorage();
  }

  /**
   * Charger les données utilisateur depuis localStorage
   */
  private loadUserGameDataFromStorage(): void {
    try {
      const savedData = localStorage.getItem('userGameData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convertir les dates string en objets Date
        const dataWithDates = parsedData.map((item: UserGameData) => ({
          ...item,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        }));
        this.userGameData.set(dataWithDates);
      } else {
        // Données d'exemple si aucune donnée sauvegardée
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
      console.error('Erreur lors du chargement des données depuis localStorage:', error);
    }
  }

  /**
   * Sauvegarder les données utilisateur dans localStorage
   */
  private saveUserGameDataToStorage(): void {
    try {
      localStorage.setItem('userGameData', JSON.stringify(this.userGameData()));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }

  getAllPersonalGames(): Observable<Game[]> {
    const currentUser = this.authService.getCurrentUser();

    // Si l'utilisateur n'est pas connecté, retourner les jeux sans données personnalisées
    if (!currentUser) {
      const gamesWithoutUserData = this.gameLibrary.map((game) => ({
        ...game,
        rating: 0,
        status: 'none' as const,
        updatedAt: undefined,
      }));
      return of(gamesWithoutUserData).pipe(delay(300));
    }

    const userGames = this.userGameData().filter((data) => data.userId === currentUser.id);
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

    // Si le statut est "none", supprimer le jeu de la bibliothèque
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
        // Mettre à jour les données existantes
        this.userGameData.update((current) =>
          current.map((data: UserGameData) =>
            data.userId === currentUser.id && data.gameId === gameId
              ? { ...data, ...updatedData, updatedAt: new Date() }
              : data,
          ),
        );
      } else {
        // Ajouter de nouvelles données
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

    // Sauvegarder dans localStorage
    this.saveUserGameDataToStorage();

    return of(void 0).pipe(delay(200));
  }
}
