import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { throwError } from 'rxjs';
import { UpdateUserProfileRequest } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

  public getUserProfile() {
    return this.authService.getCurrentUser();
  }
  public updateUserProfile(data: UpdateUserProfileRequest) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return this.authService.updateUserProfile(currentUser.id, data);
    }
    return throwError(() => new Error('User not found'));
  }

  public deleteUserAccount() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return this.authService.deleteUserAccount(currentUser.id);
    }
    return throwError(() => new Error('User not found'));
  }

  public logout(): void {
    this.authService.logout();
  }
}
