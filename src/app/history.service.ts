import { Injectable, signal, computed, effect } from '@angular/core';
import { ItemInfo } from './model/item-info';
import { PurchaseSession } from './model/price-history';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly _sessions = signal<PurchaseSession[]>([]);
  readonly sessions = this._sessions.asReadonly();

  readonly lastPrices = computed(() => {
    const map = new Map<string, number>();
    for (const session of this._sessions()) {
      for (const item of session.items) {
        map.set(item.nome.toLowerCase(), item.valor);
      }
    }
    return map;
  });

  constructor() {
    this.load();
    effect(() => localStorage.setItem('PurchaseHistory', JSON.stringify(this._sessions())));
  }

  private load(): void {
    try {
      const saved = localStorage.getItem('PurchaseHistory');
      if (saved) this._sessions.set(JSON.parse(saved));
    } catch {}
  }

  save(items: ItemInfo[], total: number): void {
    if (items.length === 0) return;
    const session: PurchaseSession = {
      date: new Date().toISOString(),
      total,
      items: items.map(i => ({ nome: i.nome, valor: i.valor, count: i.count })),
    };
    this._sessions.update(s => [...s, session]);
  }

  loadFromRemote(sessions: PurchaseSession[]): void {
    this._sessions.set(sessions);
  }

  removeLastSession(): void {
    this._sessions.update(s => s.slice(0, -1));
  }

  getWeeklyTotals(weeks: number): { label: string; total: number }[] {
    const now = Date.now();
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Array.from({ length: weeks }, (_, w) => {
      const endMs = now - (weeks - 1 - w) * MS_PER_WEEK;
      const startMs = endMs - MS_PER_WEEK;
      const total = this._sessions()
        .filter(s => { const d = new Date(s.date).getTime(); return d >= startMs && d < endMs; })
        .reduce((sum, s) => sum + s.total, 0);
      const start = new Date(startMs);
      const label = `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`;
      return { label, total };
    });
  }
}
