import { Injectable, inject, isDevMode } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly snackBar = inject(MatSnackBar);

  init(): void {
    if (isDevMode() || !this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        const ref = this.snackBar.open(
          'Nova versão disponível!',
          'Atualizar',
          { duration: 10000 },
        );
        ref.onAction().subscribe(() => window.location.reload());
      });

    // Check for updates every 6 hours
    setInterval(() => this.swUpdate.checkForUpdate(), 6 * 60 * 60 * 1000);
  }
}
