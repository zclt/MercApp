import { Injectable, signal, effect } from '@angular/core';
import { ItemTodo } from './model/item-todo';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  readonly items = signal<ItemTodo[]>([]);

  constructor() {
    this.load();
    effect(() => localStorage.setItem('TodoItems', JSON.stringify(this.items())));
  }

  private load(): void {
    try {
      const saved = localStorage.getItem('TodoItems');
      if (saved) this.items.set(JSON.parse(saved));
    } catch {}
  }

  add(nome: string): void {
    this.items.update(items => [new ItemTodo(nome, false), ...items]);
  }

  check(item: ItemTodo): void {
    this.items.update(items => { item.checked = true; return [...items]; });
  }

  remove(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  reset(): void {
    this.items.set([]);
  }

  uncheckAll(): void {
    this.items.update(items => { items.forEach(i => i.checked = false); return [...items]; });
  }
}
