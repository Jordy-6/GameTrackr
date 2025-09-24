import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  editingUser = signal<User | null>(null);
  showDeleteConfirm = signal<User | null>(null);

  editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set('');

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error loading users');
        this.loading.set(false);
      },
    });
  }

  startEditing(user: User) {
    this.editingUser.set(user);
    this.editForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    this.clearMessages();
  }

  cancelEditing() {
    this.editingUser.set(null);
    this.editForm.reset();
    this.clearMessages();
  }

  saveUser() {
    if (!this.editForm.valid) {
      return;
    }

    const editingUser = this.editingUser();
    if (!editingUser) return;

    this.loading.set(true);
    this.clearMessages();

    const formData = this.editForm.value;
    this.authService.updateUserAsAdmin(editingUser.id, formData).subscribe({
      next: (updatedUser) => {
        this.users.update((users) =>
          users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
        );
        this.editingUser.set(null);
        this.editForm.reset();
        this.showSuccessMessage('User updated successfully!');
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error updating user');
        this.loading.set(false);
      },
    });
  }

  /**
   * Demander confirmation de suppression
   */
  confirmDelete(user: User) {
    this.showDeleteConfirm.set(user);
    this.clearMessages();
  }

  /**
   * Annuler la suppression
   */
  cancelDelete() {
    this.showDeleteConfirm.set(null);
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser() {
    const userToDelete = this.showDeleteConfirm();
    if (!userToDelete) return;

    // Empêcher la suppression de son propre compte
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && userToDelete.id === currentUser.id) {
      this.error.set('You cannot delete your own account');
      this.showDeleteConfirm.set(null);
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.authService.deleteUserAccount(userToDelete.id).subscribe({
      next: () => {
        // Retirer l'utilisateur de la liste
        this.users.update((users) => users.filter((user) => user.id !== userToDelete.id));
        this.showDeleteConfirm.set(null);
        this.showSuccessMessage('User deleted successfully!');
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error deleting user');
        this.loading.set(false);
        this.showDeleteConfirm.set(null);
      },
    });
  }

  /**
   * Obtenir la classe CSS pour le badge de rôle
   */
  getRoleBadgeClass(role: string): string {
    return role === 'admin'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  }

  /**
   * Formater la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Vérifier si un champ du formulaire est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtenir l'erreur d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  /**
   * Effacer les messages
   */
  private clearMessages() {
    this.error.set('');
    this.successMessage.set('');
  }

  /**
   * Afficher un message de succès temporaire
   */
  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 5000);
  }
}
