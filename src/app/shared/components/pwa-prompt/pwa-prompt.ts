import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa';

@Component({
  selector: 'app-pwa-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Prompt d'installation -->
    @if (pwaService.canInstall()) {
      <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
        <div class="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-1">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm">Installer l'application</h4>
              <p class="text-blue-100 text-xs mt-1">
                Accédez rapidement à TodoList depuis votre écran d'accueil
              </p>
              <div class="flex gap-2 mt-3">
                <button
                  (click)="installApp()"
                  class="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                >
                  Installer
                </button>
                <button
                  (click)="dismissPrompt()"
                  class="text-blue-100 px-3 py-1 rounded text-xs hover:text-white transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button (click)="dismissPrompt()" class="flex-shrink-0 text-blue-100 hover:text-white">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Notification de mise à jour -->
    @if (pwaService.hasUpdate()) {
      <div class="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
        <div class="bg-green-600 text-white p-4 rounded-lg shadow-lg border border-green-500">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-1">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm">Mise à jour disponible</h4>
              <p class="text-green-100 text-xs mt-1">
                Une nouvelle version de l'application est prête
              </p>
              <div class="flex gap-2 mt-3">
                <button
                  (click)="updateApp()"
                  class="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-green-50 transition-colors"
                >
                  Mettre à jour
                </button>
                <button
                  (click)="dismissUpdate()"
                  class="text-green-100 px-3 py-1 rounded text-xs hover:text-white transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Indicateur hors ligne -->
    @if (!pwaService.online()) {
      <div class="fixed top-0 left-0 right-0 z-40">
        <div class="bg-amber-500 text-white text-center py-2 px-4">
          <div class="flex items-center justify-center gap-2 text-sm">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.5v19M12 2.5a9.5 9.5 0 110 19M12 2.5a9.5 9.5 0 010 19"
              />
            </svg>
            <span>Mode hors ligne - Vos données sont synchronisées localement</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class PwaPromptComponent {
  pwaService = inject(PwaService);

  async installApp(): Promise<void> {
    await this.pwaService.installApp();
  }

  async updateApp(): Promise<void> {
    await this.pwaService.activateUpdate();
  }

  dismissPrompt(): void {
    console.warn('[PWA] Install prompt dismissed');
  }

  dismissUpdate(): void {
    console.warn('[PWA] Update prompt dismissed');
  }
}
