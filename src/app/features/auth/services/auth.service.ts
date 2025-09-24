import { Injectable, signal, effect } from '@angular/core';
import { LoginRequest, RegisterRequest } from '../model/auth.model';
import { UpdateUserProfileRequest, User } from '../../user/model/user.model';
import { delay, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  public user$ = this.currentUser.asReadonly();

  constructor() {
    // Initialiser le signal avec les données du localStorage si elles existent
    if (localStorage.getItem('currentUser')) {
      this.currentUser.set(JSON.parse(localStorage.getItem('currentUser')!));
    }
    this.loadUsersFromLocalStorage();

    // Effect pour synchroniser automatiquement currentUser avec localStorage
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    });
  }

  private users: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Normal User',
      email: 'user@example.com',
      role: 'user',
      createdAt: new Date(),
    },
  ];

  private passwords: Record<string, string> = {
    'admin@example.com': 'admin123',
    'user@example.com': 'user123',
  };

  public login(credentials: LoginRequest): Observable<User> {
    const user = this.users.find((u) => u.email === credentials.email);
    const password = this.passwords[credentials.email];

    if (user && password === credentials.password) {
      this.currentUser.set(user);
      return of(user).pipe(delay(500));
    } else {
      return throwError(() => new Error('Invalid email or password'));
    }
  }

  public register(userData: RegisterRequest): Observable<User> {
    const existingUser = this.users.find((u) => u.email === userData.email);
    if (existingUser) {
      return throwError(() => new Error('Email already in use'));
    }

    if (userData.password !== userData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    const newUser: User = {
      id: this.users.length + 1,
      name: userData.name,
      email: userData.email,
      role: 'user',
      createdAt: new Date(),
    };

    this.users.push(newUser);
    this.passwords[userData.email] = userData.password;
    this.currentUser.set(newUser);
    this.saveUsersToLocalStorage();
    return of(newUser).pipe(delay(500));
  }

  public getCurrentUser(): User | null {
    return this.currentUser();
  }

  // Nouvelle méthode pour accéder au signal directement
  public getCurrentUserSignal() {
    return this.currentUser;
  }

  public getAllUsers(): Observable<User[]> {
    if (this.currentUser()?.role === 'admin') {
      localStorage.setItem('all_users', JSON.stringify(this.users));
      return of(this.users).pipe(delay(300));
    }
    return throwError(() => new Error('Unauthorized'));
  }

  public getUserById(userId: number): Observable<User> {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      return of(user).pipe(delay(300));
    }
    return throwError(() => new Error('User not found'));
  }

  public deleteUserAccount(userId: number): Observable<void> {
    if (this.currentUser()?.role !== 'admin') {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    const email = this.users[userIndex].email;
    this.users.splice(userIndex, 1);
    delete this.passwords[email];

    this.saveUsersToLocalStorage();
    return of(void 0).pipe(delay(300));
  }

  public updateUserProfile(
    userId: number,
    updatedData: UpdateUserProfileRequest,
  ): Observable<User> {
    if (this.currentUser()?.id === userId || this.currentUser()?.role === 'admin') {
      const userIndex = this.users.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        this.currentUser.set(this.users[userIndex]);
        this.saveUsersToLocalStorage();
        return of(this.users[userIndex]).pipe(delay(300));
      }
    }

    return throwError(() => new Error('Unauthorized'));
  }

  /**
   * Mettre à jour un utilisateur en tant qu'admin (permet de modifier le rôle)
   */
  public updateUserAsAdmin(userId: number, updatedData: Partial<User>): Observable<User> {
    if (this.currentUser()?.role !== 'admin') {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    const currentUser = this.users[userIndex];
    const updatedUser = { ...currentUser, ...updatedData };

    // Si l'email a changé, mettre à jour les mots de passe
    if (updatedData.email && updatedData.email !== currentUser.email) {
      const password = this.passwords[currentUser.email];
      delete this.passwords[currentUser.email];
      this.passwords[updatedData.email] = password;
    }

    this.users[userIndex] = updatedUser;

    // Si on modifie l'utilisateur actuel, mettre à jour le signal
    if (this.currentUser()?.id === userId) {
      this.currentUser.set(updatedUser);
    }

    this.saveUsersToLocalStorage();
    return of(updatedUser).pipe(delay(300));
  }

  private saveUsersToLocalStorage(): void {
    localStorage.setItem('all_users', JSON.stringify(this.users));
    localStorage.setItem('all_passwords', JSON.stringify(this.passwords));
  }

  private loadUsersFromLocalStorage(): void {
    const users = localStorage.getItem('all_users');
    const passwords = localStorage.getItem('all_passwords');
    if (users && passwords) {
      this.users = JSON.parse(users);
      this.passwords = JSON.parse(passwords);
    }
  }

  public logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    const user = this.currentUser();
    return user ? `mock-token-${user.id}` : null;
  }
}
