import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class UserProfileComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  public router = inject(Router);

  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string>('');
  success = signal<string>('');

  editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });

    const user = this.userService.getUserProfile();
    if (user) {
      this.editForm.patchValue({
        name: user.name,
        email: user.email,
        password: '',
      });
    }
  }

  toggleEditMode() {
    this.isEditMode.update((mode) => !mode);
    this.clearMessages();

    if (this.isEditMode()) {
      const user = this.userService.getUserProfile();
      if (user) {
        this.editForm.patchValue({
          name: user.name,
          email: user.email,
          password: '',
        });
      }
    }
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.loading.set(true);
      this.clearMessages();

      const formData = this.editForm.value;

      this.userService.updateUserProfile(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Profile updated successfully!');
          this.isEditMode.set(false);

          setTimeout(() => this.success.set(''), 3000);
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set(error.message || 'Failed to update profile');
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.clearMessages();

    const user = this.userService.getUserProfile();
    if (user) {
      this.editForm.patchValue({
        name: user.name,
        email: user.email,
        password: '',
      });
    }
  }

  deleteAccount() {
    const confirmMessage =
      'Are you sure you want to delete your account? This action cannot be undone.';

    if (confirm(confirmMessage)) {
      this.loading.set(true);
      this.clearMessages();

      this.userService.deleteUserAccount().subscribe({
        next: () => {
          this.loading.set(false);
          alert('Account deleted successfully. You will be redirected to the home page.');
          this.router.navigate(['/auth/register']);
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set(error.message || 'Failed to delete account');
        },
      });
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/auth/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength'])
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['password']) return 'Password must be at least 6 characters long';
    }
    return '';
  }

  // Force all form fields to be touched to show validation errors
  private markFormGroupTouched() {
    Object.keys(this.editForm.controls).forEach((key) => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  private clearMessages() {
    this.error.set('');
    this.success.set('');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
