import { Pipe, PipeTransform } from '@angular/core';

export type GameStatusType = 'none' | 'wishlist' | 'playing' | 'completed' | 'abandoned';

@Pipe({
  name: 'gameStatus',
  standalone: true,
})
export class GameStatusPipe implements PipeTransform {
  private statusMap: Record<GameStatusType, { text: string; emoji: string; class: string }> = {
    none: {
      text: 'Not in library',
      emoji: '➖',
      class: 'text-gray-500',
    },
    wishlist: {
      text: 'Wishlist',
      emoji: '❤️',
      class: 'text-pink-600',
    },
    playing: {
      text: 'Currently Playing',
      emoji: '🎮',
      class: 'text-blue-600',
    },
    completed: {
      text: 'Completed',
      emoji: '✅',
      class: 'text-green-600',
    },
    abandoned: {
      text: 'Abandoned',
      emoji: '❌',
      class: 'text-red-600',
    },
  };

  transform(value: GameStatusType, format: 'text' | 'emoji' | 'full' | 'class' = 'full'): string {
    if (!value || !this.statusMap[value]) {
      return '';
    }

    const status = this.statusMap[value];

    switch (format) {
      case 'text':
        return status.text;
      case 'emoji':
        return status.emoji;
      case 'class':
        return status.class;
      case 'full':
      default:
        return `${status.emoji} ${status.text}`;
    }
  }

  /**
   * Méthode utilitaire pour obtenir tous les statuts disponibles
   */
  static getAllStatuses(): { value: GameStatusType; label: string; emoji: string }[] {
    return [
      { value: 'wishlist', label: 'Wishlist', emoji: '❤️' },
      { value: 'playing', label: 'Currently Playing', emoji: '🎮' },
      { value: 'completed', label: 'Completed', emoji: '✅' },
      { value: 'abandoned', label: 'Abandoned', emoji: '❌' },
      { value: 'none', label: 'Remove from library', emoji: '➖' },
    ];
  }
}
