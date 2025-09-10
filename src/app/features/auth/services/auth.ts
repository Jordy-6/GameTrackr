import { Injectable, signal } from '@angular/core';
import { LoginRequest, RegisterRequest, User } from '../model/user.model';
import { delay, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  public user$ = this.currentUser.asReadonly();

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
    return of(newUser).pipe(delay(500));
  }

  public logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }
}
