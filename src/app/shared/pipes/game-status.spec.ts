import { GameStatusPipe, GameStatusType } from './game-status.pipe';

describe('GameStatusPipe', () => {
  let pipe: GameStatusPipe;

  beforeEach(() => {
    pipe = new GameStatusPipe();
  });

  describe('transform method', () => {
    it('should return empty string for invalid status', () => {
      expect(pipe.transform('invalid' as GameStatusType)).toBe('');
    });

    it('should return full format by default', () => {
      expect(pipe.transform('playing')).toBe('🎮 Currently Playing');
      expect(pipe.transform('completed')).toBe('✅ Completed');
      expect(pipe.transform('wishlist')).toBe('❤️ Wishlist');
      expect(pipe.transform('abandoned')).toBe('❌ Abandoned');
      expect(pipe.transform('none')).toBe('➖ Not in library');
    });

    it('should return text format when specified', () => {
      expect(pipe.transform('playing', 'text')).toBe('Currently Playing');
      expect(pipe.transform('completed', 'text')).toBe('Completed');
      expect(pipe.transform('wishlist', 'text')).toBe('Wishlist');
      expect(pipe.transform('abandoned', 'text')).toBe('Abandoned');
      expect(pipe.transform('none', 'text')).toBe('Not in library');
    });

    it('should return emoji format when specified', () => {
      expect(pipe.transform('playing', 'emoji')).toBe('🎮');
      expect(pipe.transform('completed', 'emoji')).toBe('✅');
      expect(pipe.transform('wishlist', 'emoji')).toBe('❤️');
      expect(pipe.transform('abandoned', 'emoji')).toBe('❌');
      expect(pipe.transform('none', 'emoji')).toBe('➖');
    });

    it('should return class format when specified', () => {
      expect(pipe.transform('playing', 'class')).toBe('text-blue-600');
      expect(pipe.transform('completed', 'class')).toBe('text-green-600');
      expect(pipe.transform('wishlist', 'class')).toBe('text-pink-600');
      expect(pipe.transform('abandoned', 'class')).toBe('text-red-600');
      expect(pipe.transform('none', 'class')).toBe('text-gray-500');
    });
  });

  describe('getAllStatuses static method', () => {
    it('should return array of all status options', () => {
      const statuses = GameStatusPipe.getAllStatuses();

      expect(statuses).toBeInstanceOf(Array);
      expect(statuses.length).toBe(5);

      const statusValues = statuses.map((s) => s.value);
      expect(statusValues).toContain('wishlist');
      expect(statusValues).toContain('playing');
      expect(statusValues).toContain('completed');
      expect(statusValues).toContain('abandoned');
      expect(statusValues).toContain('none');
    });

    it('should return correct labels for each status', () => {
      const statuses = GameStatusPipe.getAllStatuses();
      const statusMap = statuses.reduce(
        (map, status) => {
          map[status.value] = status;
          return map;
        },
        {} as Record<GameStatusType, { value: GameStatusType; label: string; emoji: string }>,
      );

      expect(statusMap['wishlist'].label).toBe('Wishlist');
      expect(statusMap['playing'].label).toBe('Currently Playing');
      expect(statusMap['completed'].label).toBe('Completed');
      expect(statusMap['abandoned'].label).toBe('Abandoned');
      expect(statusMap['none'].label).toBe('Remove from library');
    });

    it('should return correct emojis for each status', () => {
      const statuses = GameStatusPipe.getAllStatuses();
      const statusMap = statuses.reduce(
        (map, status) => {
          map[status.value] = status;
          return map;
        },
        {} as Record<GameStatusType, { value: GameStatusType; label: string; emoji: string }>,
      );

      expect(statusMap['wishlist'].emoji).toBe('❤️');
      expect(statusMap['playing'].emoji).toBe('🎮');
      expect(statusMap['completed'].emoji).toBe('✅');
      expect(statusMap['abandoned'].emoji).toBe('❌');
      expect(statusMap['none'].emoji).toBe('➖');
    });
  });
});
