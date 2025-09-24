import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game, UpdateUserGameData } from '../../model/game.model';
import { AuthService } from '../../../auth/services/auth.service';
import { TimeSincePipe } from '../../../../shared/pipes/time-since.pipe';
import { GameStatusPipe } from '../../../../shared/pipes/game-status.pipe';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-game-library',
  standalone: true,
  imports: [CommonModule, TimeSincePipe, GameStatusPipe, HighlightDirective],
  templateUrl: './game-library.html',
})
export class GameLibraryComponent implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);

  // Signals
  games = signal<Game[]>([]);
  loading = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  expandedDescriptions = signal<Set<number>>(new Set());

  ngOnInit() {
    this.loadGames();
  }

  /**
   * Charger tous les jeux avec les données personnalisées
   */
  loadGames() {
    this.loading.set(true);
    this.error.set('');

    this.gameService.getAllPersonalGames().subscribe({
      next: (games) => {
        this.games.set(games);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Erreur lors du chargement des jeux');
        this.loading.set(false);
      },
    });
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isUserLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  /**
   * Mettre à jour le statut d'un jeu
   */
  updateGameStatus(gameId: number, event: Event) {
    // Vérifier si l'utilisateur est connecté
    if (!this.isUserLoggedIn()) {
      this.error.set('You must be logged in to update game status. Please log in first.');
      // Remettre la valeur par défaut
      const select = event.target as HTMLSelectElement;
      select.value = 'none';
      return;
    }

    const select = event.target as HTMLSelectElement;
    const status = select.value as 'none' | 'wishlist' | 'playing' | 'completed';

    const currentGame = this.games().find((g) => g.id === gameId);
    if (!currentGame) return;

    const updateData: UpdateUserGameData = {
      status,
      rating: currentGame.rating,
    };

    this.gameService.updateUserGameData(updateData, gameId).subscribe({
      next: () => {
        // Mettre à jour localement
        this.games.update((games) =>
          games.map((game) => (game.id === gameId ? { ...game, status } : game)),
        );
        this.showSuccessMessage('Status updated successfully!');
      },
      error: (error) => {
        this.error.set(error.message || 'Error while updating status');
      },
    });
  }

  /**
   * Mettre à jour la note d'un jeu
   */
  updateGameRating(gameId: number, event: Event) {
    // Vérifier si l'utilisateur est connecté
    if (!this.isUserLoggedIn()) {
      this.error.set('You must be logged in to rate games. Please log in first.');
      // Remettre la valeur par défaut
      const input = event.target as HTMLInputElement;
      input.value = '0';
      return;
    }

    const input = event.target as HTMLInputElement;
    const rating = parseFloat(input.value);

    const currentGame = this.games().find((g) => g.id === gameId);
    if (!currentGame) return;

    const updateData: UpdateUserGameData = {
      rating,
      status: currentGame.status,
    };

    this.gameService.updateUserGameData(updateData, gameId).subscribe({
      next: () => {
        // Mettre à jour localement
        this.games.update((games) =>
          games.map((game) => (game.id === gameId ? { ...game, rating } : game)),
        );
        this.showSuccessMessage(`Rating updated: ${rating}/10`);
      },
      error: (error) => {
        this.error.set(error.message || 'Error while updating rating');
      },
    });
  }

  /**
   * Afficher/masquer la description d'un jeu
   */
  toggleDescription(gameId: number) {
    this.expandedDescriptions.update((expanded) => {
      const newSet = new Set(expanded);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  }

  /**
   * Gérer l'erreur de chargement d'image
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x400/e5e7eb/9ca3af?text=No+Image';
  }

  /**
   * Formater la date de sortie
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  /**
   * Afficher un message de succès temporaire
   */
  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 6000);
  }
}
