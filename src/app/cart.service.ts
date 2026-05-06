import { Injectable, signal, computed, effect } from '@angular/core';
import { ItemInfo } from './model/item-info';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<ItemInfo[]>([]);
  readonly sum = computed(() => this.items().reduce((s, i) => s + i.valor * i.count, 0));
  readonly count = computed(() => this.items().reduce((c, i) => c + i.count, 0));

  constructor() {
    this.load();
    effect(() => localStorage.setItem('CartItems', JSON.stringify(this.items())));
  }

  private load(): void {
    try {
      const saved = localStorage.getItem('CartItems');
      if (saved) this.items.set(JSON.parse(saved));
    } catch {}
  }

  addOrIncrement(valor: number, nome: string, multi: boolean): void {
    if (multi && this.items().length > 0) {
      this.items.update(([first, ...rest]) => {
        first.count++;
        return [first, ...rest];
      });
    } else {
      this.items.update(items => [new ItemInfo(valor, 1, nome), ...items]);
    }
  }

  addCount(item: ItemInfo): void {
    this.items.update(items => { item.count++; return [...items]; });
  }

  reduceCount(item: ItemInfo, index: number): void {
    item.count--;
    if (item.count > 0) {
      this.items.update(items => [...items]);
    } else {
      this.remove(index);
    }
  }

  setPhoto(item: ItemInfo, photo: string): void {
    this.items.update(items => { item.photo = photo; return [...items]; });
  }

  remove(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  reset(): void {
    this.items.set([]);
  }

  restore(backup: ItemInfo[]): void {
    this.items.set(backup);
  }
}
