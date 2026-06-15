import { Injectable, signal, effect } from '@angular/core';

export interface BarcodeEntry {
  nome: string;
  photo?: string;
}

@Injectable({ providedIn: 'root' })
export class BarcodeService {
  private readonly _db = signal<Record<string, BarcodeEntry>>({});
  readonly db = this._db.asReadonly();

  constructor() {
    this.load();
    effect(() => localStorage.setItem('BarcodeDB', JSON.stringify(this._db())));
  }

  private load(): void {
    try {
      const saved = localStorage.getItem('BarcodeDB');
      if (saved) this._db.set(JSON.parse(saved));
    } catch {}
  }

  loadFromRemote(db: Record<string, BarcodeEntry>): void {
    this._db.set(db);
  }

  lookup(code: string): BarcodeEntry | null {
    return this._db()[code] ?? null;
  }

  register(code: string, nome: string, photo?: string): void {
    this._db.update(db => ({ ...db, [code]: { nome, photo } }));
  }

  updatePhoto(code: string, photo: string): void {
    const entry = this._db()[code];
    if (entry) this._db.update(db => ({ ...db, [code]: { ...entry, photo } }));
  }
}
