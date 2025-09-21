import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { HighlightDirective } from '../directives/highlight.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HighlightDirective],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.getCurrentUserSignal();
  showMobileMenu = false;

  /**
   * Déconnecter l'utilisateur
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/games']);
  }

  /**
   * Obtenir les initiales de l'utilisateur
   */
  getInitials(firstName: string): string {
    return firstName?.charAt(0)?.toUpperCase() || '';
  }

  /**
   * Vérifier si l'utilisateur actuel est un administrateur
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  /**
   * Basculer l'affichage du menu mobile
   */
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  /**
   * Fermer le menu mobile
   */
  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
