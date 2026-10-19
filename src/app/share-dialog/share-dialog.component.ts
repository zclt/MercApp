import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ShareService } from '../share.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.css',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class ShareDialogComponent {
  protected readonly share = inject(ShareService);
  private readonly auth = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ShareDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  joinInput = '';
  loading = signal(false);
  error = signal('');

  async createList(): Promise<void> {
    if (!this.requireLogin()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const id = await this.share.createSharedList();
      if (!id) this.error.set('Firebase não configurado.');
    } catch {
      this.error.set('Não foi possível criar a lista. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  async joinList(): Promise<void> {
    if (!this.joinInput.trim() || !this.requireLogin()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const ok = await this.share.joinSharedList(this.joinInput.trim());
      if (ok) {
        this.dialogRef.close(true);
      } else {
        this.error.set('Lista não encontrada. Verifique o link e tente novamente.');
      }
    } catch {
      this.error.set('Não foi possível entrar na lista. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  // Firestore rules only allow signed-in users to read/write shared lists
  private requireLogin(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.error.set('Entre com sua conta Google para usar listas compartilhadas.');
    return false;
  }

  copyLink(): void {
    const link = this.share.shareLink();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open('Link copiado!', '', { duration: 2000 });
    });
  }

  leaveList(): void {
    this.share.leaveSharedList();
    this.dialogRef.close(false);
  }
}
