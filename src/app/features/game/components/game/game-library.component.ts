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

  games = signal<Game[]>([]);
  loading = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  expandedDescriptions = signal<Set<number>>(new Set());

  ngOnInit() {
    this.loadGames();
  }

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

  isUserLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  updateGameStatus(gameId: number, event: Event) {
    // Vérifier si l'utilisateur est connecté
    if (!this.isUserLoggedIn()) {
      this.error.set('You must be logged in to update game status. Please log in first.');
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
        this.games.update((games) =>
          // We update locally the game status
          games.map((game) => (game.id === gameId ? { ...game, status } : game)),
        );
        this.showSuccessMessage('Status updated successfully!');
      },
      error: (error) => {
        this.error.set(error.message || 'Error while updating status');
      },
    });
  }

  updateGameRating(gameId: number, event: Event) {
    if (!this.isUserLoggedIn()) {
      this.error.set('You must be logged in to rate games. Please log in first.');
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
        // Update locally the game rating
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x400/e5e7eb/9ca3af?text=No+Image';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 6000);
  }
}
