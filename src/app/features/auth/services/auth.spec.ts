import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { LoginRequest, RegisterRequest } from '../model/user.model';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.logout(); // Reset user state after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login with valid admin credentials', async () => {
      const credentials: LoginRequest = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const user = await firstValueFrom(service.login(credentials));

      expect(user).toBeDefined();
      expect(user.email).toBe('admin@example.com');
      expect(user.name).toBe('Admin User');
      expect(user.role).toBe('admin');
      expect(service.user$()).toBe(user);
    });

    it('should login with valid user credentials', async () => {
      const credentials: LoginRequest = {
        email: 'user@example.com',
        password: 'user123',
      };

      const user = await firstValueFrom(service.login(credentials));

      expect(user).toBeDefined();
      expect(user.email).toBe('user@example.com');
      expect(user.name).toBe('Normal User');
      expect(user.role).toBe('user');
      expect(service.user$()).toBe(user);
    });

    it('should fail with invalid email', async () => {
      const credentials: LoginRequest = {
        email: 'invalid@example.com',
        password: 'admin123',
      };

      try {
        await firstValueFrom(service.login(credentials));
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Invalid email or password');
        expect(service.user$()).toBeNull();
      }
    });

    it('should fail with invalid password', async () => {
      const credentials: LoginRequest = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      try {
        await firstValueFrom(service.login(credentials));
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Invalid email or password');
        expect(service.user$()).toBeNull();
      }
    });

    it('should fail with empty credentials', async () => {
      const credentials: LoginRequest = {
        email: '',
        password: '',
      };

      try {
        await firstValueFrom(service.login(credentials));
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Invalid email or password');
        expect(service.user$()).toBeNull();
      }
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user = await firstValueFrom(service.register(userData));

      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
      expect(user.id).toBe(3); // Should be the 3rd user
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should fail when email already exists', async () => {
      const userData: RegisterRequest = {
        name: 'Test User',
        email: 'admin@example.com', // Already exists
        password: 'password123',
        confirmPassword: 'password123',
      };

      try {
        await firstValueFrom(service.register(userData));
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Email already in use');
      }
    });

    it('should fail when passwords do not match', async () => {
      const userData: RegisterRequest = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      try {
        await firstValueFrom(service.register(userData));
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Passwords do not match');
      }
    });

    it('should assign correct ID to new user', async () => {
      const userData1: RegisterRequest = {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const userData2: RegisterRequest = {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const user1 = await firstValueFrom(service.register(userData1));
      const user2 = await firstValueFrom(service.register(userData2));

      expect(user1.id).toBe(3);
      expect(user2.id).toBe(4);
    });
  });

  describe('logout', () => {
    it('should clear current user', async () => {
      // First login
      const credentials: LoginRequest = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      await firstValueFrom(service.login(credentials));
      expect(service.user$()).not.toBeNull();

      // Then logout
      service.logout();
      expect(service.user$()).toBeNull();
    });

    it('should remove user from localStorage', () => {
      spyOn(localStorage, 'removeItem');

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('should work when no user is logged in', () => {
      expect(service.user$()).toBeNull();

      expect(() => service.logout()).not.toThrow();
      expect(service.user$()).toBeNull();
    });
  });
});
