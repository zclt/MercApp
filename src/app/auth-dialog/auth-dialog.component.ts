import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule],
})
export class AuthDialogComponent {
  protected readonly auth = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<AuthDialogComponent>);

  loading = false;

  async signIn(): Promise<void> {
    this.loading = true;
    try {
      await this.auth.signInWithGoogle();
      this.dialogRef.close(true);
    } catch {
      this.loading = false;
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.dialogRef.close(false);
  }
}
