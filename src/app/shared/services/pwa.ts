import { Injectable, signal, computed, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private swUpdate = inject(SwUpdate);

  // Signals pour l'état PWA
  private deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  private isInstalled = signal<boolean>(false);
  private isOnline = signal<boolean>(navigator.onLine);
  private updateAvailable = signal<boolean>(false);

  // Computed pour l'état d'installation
  canInstall = computed(() => !!this.deferredPrompt() && !this.isInstalled());

  // État public readonly
  readonly installPrompt = this.deferredPrompt.asReadonly();
  readonly installed = this.isInstalled.asReadonly();
  readonly online = this.isOnline.asReadonly();
  readonly hasUpdate = this.updateAvailable.asReadonly();

  constructor() {
    this.initializePwa();
    this.setupNetworkListener();
    this.setupUpdateListener();
  }

  /**
   * Initialise les événements PWA
   */
  private initializePwa(): void {
    // Détection de l'événement d'installation
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      console.warn('[PWA] Installation prompt available');
      event.preventDefault();
      this.deferredPrompt.set(event as BeforeInstallPromptEvent);
    });

    // Détection si l'app est déjà installée
    window.addEventListener('appinstalled', () => {
      console.warn('[PWA] App installed successfully');
      this.isInstalled.set(true);
      this.deferredPrompt.set(null);
    });

    // Vérification initiale si l'app est en mode standalone
    this.checkIfInstalled();
  }

  /**
   * Vérifie si l'app est en mode standalone (installée)
   */
  private checkIfInstalled(): void {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      this.isInstalled.set(true);
      console.warn('[PWA] App is running in standalone mode');
    }
  }

  /**
   * Configure l'écoute du statut réseau
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      console.warn('[PWA] Network: Online');
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      console.warn('[PWA] Network: Offline');
    });
  }

  /**
   * Configure l'écoute des mises à jour du service worker
   */
  private setupUpdateListener(): void {
    if (this.swUpdate.isEnabled) {
      // Vérification des mises à jour
      this.swUpdate.versionUpdates
        .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
        .subscribe(() => {
          console.warn('[PWA] New version available');
          this.updateAvailable.set(true);
        });

      // Vérification périodique (toutes les 6 heures)
      setInterval(
        () => {
          this.swUpdate
            .checkForUpdate()
            .then((hasUpdate) => {
              if (hasUpdate) {
                console.warn('[PWA] Update check: New version found');
              }
            })
            .catch((error) => {
              console.error('[PWA] Update check failed:', error);
            });
        },
        6 * 60 * 60 * 1000,
      ); // 6 heures
    }
  }

  /**
   * Propose l'installation de l'app
   */
  async installApp(): Promise<boolean> {
    const prompt = this.deferredPrompt();
    if (!prompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      console.warn(`[PWA] Install prompt result: ${outcome}`);

      if (outcome === 'accepted') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install error:', error);
      return false;
    }
  }

  /**
   * Active la mise à jour du service worker
   */
  async activateUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || !this.updateAvailable()) {
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      this.updateAvailable.set(false);

      // Rechargement après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[PWA] Update activation failed:', error);
    }
  }

  /**
   * Partage du contenu via l'API Web Share
   */
  async shareContent(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!navigator.share) {
      console.warn('[PWA] Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      console.warn('[PWA] Content shared successfully');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[PWA] Share failed:', error);
      }
      return false;
    }
  }

  /**
   * Obtient des statistiques PWA
   */
  getStats() {
    return {
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      isOnline: this.isOnline(),
      hasUpdate: this.updateAvailable(),
      swEnabled: this.swUpdate.isEnabled,
      shareSupported: !!navigator.share,
    };
  }
}
