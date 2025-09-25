import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HighlightDirective],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.user$;
  showMobileMenu = false;

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserFirstNameInitials(firstName: string): string {
    return firstName?.charAt(0)?.toUpperCase() || '';
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
