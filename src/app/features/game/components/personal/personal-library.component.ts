import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game, UpdateUserGameData } from '../../model/game.model';
import { AuthService } from '../../../auth/services/auth.service';
import { TimeSincePipe } from '../../../../shared/pipes/time-since.pipe';
import { GameStatusPipe } from '../../../../shared/pipes/game-status.pipe';

@Component({
  selector: 'app-personal-library',
  standalone: true,
  imports: [CommonModule, TimeSincePipe, GameStatusPipe],
  templateUrl: './personal-library.html',
})
export class PersonalLibraryComponent implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  personalGames = signal<Game[]>([]);
  filteredGames = signal<Game[]>([]);
  selectedFilter = signal<string>('all');
  loading = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  expandedDescriptions = signal<Set<number>>(new Set());
  tempRatings = signal<Map<number, number>>(new Map());

  // Computed signals pour les statistiques
  public completedGames = computed(() =>
    this.personalGames().filter((game) => game.status === 'completed'),
  );

  public playingGames = computed(() =>
    this.personalGames().filter((game) => game.status === 'playing'),
  );

  public wishlistGames = computed(() =>
    this.personalGames().filter((game) => game.status === 'wishlist'),
  );

  public abandonedGames = computed(() =>
    this.personalGames().filter((game) => game.status === 'abandoned'),
  );

  public ratedGames = computed(() => this.personalGames().filter((game) => game.rating > 0));

  public stats = computed(() => ({
    total: this.personalGames().length,
    completed: this.completedGames().length,
    playing: this.playingGames().length,
    wishlist: this.wishlistGames().length,
    abandoned: this.abandonedGames().length,
    rated: this.ratedGames().length,
    averageRating:
      this.ratedGames().length > 0
        ? this.ratedGames().reduce((sum, game) => sum + game.rating, 0) / this.ratedGames().length
        : 0,
  }));

  ngOnInit() {
    if (!this.isUserLoggedIn()) {
      this.error.set('You must be logged in to view your personal library. Please log in first.');
      this.loading.set(false);
      return;
    }
    this.loadPersonalLibrary();
  }

  isUserLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  getDisplayRating(gameId: number): number {
    const tempRating = this.tempRatings().get(gameId);
    if (tempRating !== undefined) {
      return tempRating;
    }
    const game = this.personalGames().find((g) => g.id === gameId);
    return game ? game.rating : 0;
  }

  onRatingSliderMove(gameId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const rating = parseFloat(input.value);

    // Update the temporary rating
    this.tempRatings.update((map) => {
      const newMap = new Map(map);
      newMap.set(gameId, rating);
      return newMap;
    });
  }

  loadPersonalLibrary() {
    this.loading.set(true);
    this.error.set('');

    this.gameService.getAllPersonalGames().subscribe({
      next: (games) => {
        // Filter to keep only games the user has interacted with
        const interactedGames = games.filter((game) => game.status !== 'none' || game.rating > 0);
        this.personalGames.set(interactedGames);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error while loading personal library');
        this.loading.set(false);
      },
    });
  }

  filterByStatus(status: string) {
    this.selectedFilter.set(status);
    this.applyFilter();
  }

  applyFilter() {
    const filter = this.selectedFilter();
    const games = this.personalGames();

    if (filter === 'all') {
      this.filteredGames.set(games);
    } else {
      this.filteredGames.set(games.filter((game) => game.status === filter));
    }
  }

  updateGameStatus(gameId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const status = select.value as 'none' | 'wishlist' | 'playing' | 'completed';

    const currentGame = this.personalGames().find((g) => g.id === gameId);
    if (!currentGame) return;

    const updateData: UpdateUserGameData = {
      status,
      rating: currentGame.rating,
    };

    this.gameService.updateUserGameData(updateData, gameId).subscribe({
      next: () => {
        if (status === 'none') {
          // Remove from personal library
          this.personalGames.update((games) => games.filter((g) => g.id !== gameId));
          this.showSuccessMessage('Game removed from your library');
        } else {
          // Update status
          this.personalGames.update((games) =>
            games.map((game) => (game.id === gameId ? { ...game, status } : game)),
          );
          this.showSuccessMessage('Status updated successfully!');
        }
        this.applyFilter();
      },
      error: (error) => {
        this.error.set(error.message || 'Error while updating status');
      },
    });
  }

  updateGameRating(gameId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const rating = parseFloat(input.value);

    const currentGame = this.personalGames().find((g) => g.id === gameId);
    if (!currentGame) return;

    const updateData: UpdateUserGameData = {
      rating,
      status: currentGame.status,
    };

    this.gameService.updateUserGameData(updateData, gameId).subscribe({
      next: () => {
        // Update locally
        this.personalGames.update((games) =>
          games.map((game) => (game.id === gameId ? { ...game, rating } : game)),
        );
        // Clear temporary rating
        this.tempRatings.update((map) => {
          const newMap = new Map(map);
          newMap.delete(gameId);
          return newMap;
        });
        this.showSuccessMessage(`Note mise à jour: ${rating}/10`);
      },
      error: (error) => {
        this.error.set(error.message || 'Erreur lors de la mise à jour de la note');
        this.tempRatings.update((map) => {
          const newMap = new Map(map);
          newMap.delete(gameId);
          return newMap;
        });
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      wishlist: 'Wishlist',
      playing: 'Playing',
      completed: 'Completed',
      none: 'Not added',
      all: 'All',
    };
    return labels[status] || status;
  }

  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      wishlist: 'bg-purple-100 text-purple-800',
      playing: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      none: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusBorderColor(status: string): string {
    const colors: Record<string, string> = {
      wishlist: 'border-l-purple-500',
      playing: 'border-l-orange-500',
      completed: 'border-l-green-500',
      none: 'border-l-gray-300',
    };
    return colors[status] || 'border-l-gray-300';
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

  goToMainLibrary() {
    this.router.navigate(['/games']);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image';
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
