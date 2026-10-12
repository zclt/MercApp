import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SyncService } from './sync.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly sync = inject(SyncService);
  private readonly auth = inject(AuthService);

  readonly currentShareId = signal<string | null>(null);
  readonly shareLink = computed(() => {
    const id = this.currentShareId();
    if (!id) return null;
    const base = window.location.origin + window.location.pathname;
    return `${base}?join=${id}`;
  });

  private _pendingJoinId: string | null = null;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) this._pendingJoinId = joinId;

    effect(() => {
      const user = this.auth.user();
      if (user && this._pendingJoinId) {
        const id = this._pendingJoinId;
        this._pendingJoinId = null;
        this.joinSharedList(id);
      }
    });
  }

  async createSharedList(): Promise<string | null> {
    if (!this.sync.isFirebaseAvailable) return null;
    const shareId = this._generateId();
    await this.sync.createSharedList(shareId);
    this.currentShareId.set(shareId);
    return shareId;
  }

  async joinSharedList(shareIdOrUrl: string): Promise<boolean> {
    if (!this.sync.isFirebaseAvailable) return false;
    const shareId = this._extractId(shareIdOrUrl);
    const joined = await this.sync.switchToSharedList(shareId);
    if (joined) {
      this.currentShareId.set(shareId);
      window.history.replaceState({}, '', window.location.pathname);
    }
    return joined;
  }

  leaveSharedList(): void {
    this.sync.leaveSharedList();
    this.currentShareId.set(null);
  }

  private _extractId(value: string): string {
    try {
      const url = new URL(value);
      return url.searchParams.get('join') ?? value.trim();
    } catch {
      return value.trim();
    }
  }

  private _generateId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
  }
}
