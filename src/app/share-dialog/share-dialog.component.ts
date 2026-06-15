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
  private readonly dialogRef = inject(MatDialogRef<ShareDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  joinInput = '';
  loading = signal(false);
  error = signal('');

  async createList(): Promise<void> {
    this.loading.set(true);
    const id = await this.share.createSharedList();
    this.loading.set(false);
    if (!id) this.error.set('Firebase não configurado.');
  }

  async joinList(): Promise<void> {
    if (!this.joinInput.trim()) return;
    this.loading.set(true);
    this.error.set('');
    const ok = await this.share.joinSharedList(this.joinInput.trim());
    this.loading.set(false);
    if (ok) {
      this.dialogRef.close(true);
    } else {
      this.error.set('Lista não encontrada. Verifique o link e tente novamente.');
    }
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
