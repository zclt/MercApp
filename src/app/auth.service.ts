import { Injectable, signal, computed, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from '@angular/fire/auth';
import type { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth, { optional: true });

  readonly user = signal<User | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());

  constructor() {
    if (!this.auth) return;
    onAuthStateChanged(this.auth, user => this.user.set(user));
  }

  async signInWithGoogle(): Promise<void> {
    if (!this.auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async signOut(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
  }
}
