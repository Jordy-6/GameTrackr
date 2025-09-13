import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game, UpdateUserGameData } from '../../model/game.model';

interface UserStats {
  total: number;
  completed: number;
  playing: number;
  wishlist: number;
  rated: number;
  averageRating: number;
}

@Component({
  selector: 'app-personal-library',
  standalone: true,
  imports: [CommonModule],
  template: './personal-library.html',
})
export class PersonalLibraryComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  // Signals
  personalGames = signal<Game[]>([]);
  filteredGames = signal<Game[]>([]);
  selectedFilter = signal<string>('all');
  stats = signal<UserStats | null>(null);
  loading = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  expandedDescriptions = signal<Set<number>>(new Set());

  ngOnInit() {
    this.loadPersonalLibrary();
    this.loadStats();
  }

  /**
   * Charger la bibliothèque personnelle (jeux avec interaction utilisateur)
   */
  loadPersonalLibrary() {
    this.loading.set(true);
    this.error.set('');

    this.gameService.getAllPersonalGames().subscribe({
      next: (games) => {
        // Filtrer pour ne garder que les jeux avec lesquels l'utilisateur a interagi
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

  /**
   * Charger les statistiques
   */
  loadStats() {
    this.gameService.getUserStats().subscribe({
      next: () => {
        // Recalculer les stats basées sur les jeux avec interaction
        const interactedGames = this.personalGames();
        const customStats = {
          total: interactedGames.length,
          completed: interactedGames.filter((g) => g.status === 'completed').length,
          playing: interactedGames.filter((g) => g.status === 'playing').length,
          wishlist: interactedGames.filter((g) => g.status === 'wishlist').length,
          rated: interactedGames.filter((g) => g.rating > 0).length,
          averageRating:
            interactedGames.filter((g) => g.rating > 0).length > 0
              ? interactedGames
                  .filter((g) => g.rating > 0)
                  .reduce((sum, game) => sum + game.rating, 0) /
                interactedGames.filter((g) => g.rating > 0).length
              : 0,
        };
        this.stats.set(customStats);
      },
      error: (error) => {
        console.error('Error while loading stats:', error);
      },
    });
  }

  /**
   * Filtrer par statut
   */
  filterByStatus(status: string) {
    this.selectedFilter.set(status);
    this.applyFilter();
  }

  /**
   * Appliquer le filtre sélectionné
   */
  applyFilter() {
    const filter = this.selectedFilter();
    const games = this.personalGames();

    if (filter === 'all') {
      this.filteredGames.set(games);
    } else {
      this.filteredGames.set(games.filter((game) => game.status === filter));
    }
  }

  /**
   * Obtenir les jeux par statut (pour compter)
   */
  getGamesByStatus(status: string): Game[] {
    return this.personalGames().filter((game) => game.status === status);
  }

  /**
   * Mettre à jour le statut d'un jeu
   */
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
          // Retirer de la bibliothèque personnelle
          this.personalGames.update((games) => games.filter((g) => g.id !== gameId));
          this.showSuccessMessage('Game removed from your library');
        } else {
          // Mettre à jour le statut
          this.personalGames.update((games) =>
            games.map((game) => (game.id === gameId ? { ...game, status } : game)),
          );
          this.showSuccessMessage('Status updated successfully!');
        }
        this.applyFilter();
        this.loadStats();
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
        this.personalGames.update((games) =>
          games.map((game) => (game.id === gameId ? { ...game, rating } : game)),
        );
        this.showSuccessMessage(`Rating updated: ${rating}/10`);
        this.loadStats();
      },
      error: (error) => {
        this.error.set(error.message || 'Error while updating rating');
      },
    });
  }

  /**
   * Obtenir le label du statut
   */
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

  /**
   * Obtenir la couleur du badge de statut
   */
  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      wishlist: 'bg-purple-100 text-purple-800',
      playing: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      none: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtenir la couleur de la bordure selon le statut
   */
  getStatusBorderColor(status: string): string {
    const colors: Record<string, string> = {
      wishlist: 'border-l-purple-500',
      playing: 'border-l-orange-500',
      completed: 'border-l-green-500',
      none: 'border-l-gray-300',
    };
    return colors[status] || 'border-l-gray-300';
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
   * Aller à la bibliothèque principale
   */
  goToMainLibrary() {
    this.router.navigate(['/games']);
  }

  /**
   * Gérer l'erreur de chargement d'image
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image';
  }

  /**
   * Afficher un message de succès temporaire
   */
  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
