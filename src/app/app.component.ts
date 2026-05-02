import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from './cart.service';
import { ShoppingListService } from './shopping-list.service';
import { AddItemComponent } from './add-item/add-item.component';
import { ItemTodo } from './model/item-todo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatBadgeModule,
    MatSidenavModule,
    MatExpansionModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class AppComponent {
  protected readonly cart = inject(CartService);
  protected readonly list = inject(ShoppingListService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  nome = '';
  valor = '0';
  valorReal = 0;
  multi = false;
  itemAdded = false;
  private selectedItem: ItemTodo | null = null;

  setCheckoutItem(): void {
    if (!(this.valorReal > 0)) return;
    this.cart.addOrIncrement(this.valorReal, this.nome, this.multi);
    if (this.selectedItem) {
      this.list.check(this.selectedItem);
      this.selectedItem = null;
    }
    this.multi = true;
    this.itemAdded = true;
    setTimeout(() => { this.itemAdded = false; this.cdr.markForCheck(); }, 400);
  }

  removeCheckoutItem(index: number): void {
    this.cart.remove(index);
    this.concatValor('');
  }

  resetAll(): void {
    const backup = [...this.cart.items()];
    this.cart.reset();
    this.list.uncheckAll();
    this.concatValor('');

    this.snackBar.open('Carrinho esvaziado', 'Desfazer', { duration: 4000 })
      .onAction()
      .subscribe(() => {
        this.cart.restore(backup);
        this.cdr.markForCheck();
      });
  }

  concatValor(v: string): void {
    if (this.multi || v.length === 0) {
      this.valor = '0';
      this.nome = '';
      if (v.length === 0) this.selectedItem = null;
    }
    this.multi = false;
    this.valor += v;
    this.valorReal = parseFloat(this.valor) / 100;
  }

  backspaceValor(): void {
    this.multi = false;
    this.valor = this.valor.slice(0, -1);
    if (this.valor.length === 0) this.valor = '0';
    this.valorReal = parseFloat(this.valor) / 100;
  }

  checkItem(item: ItemTodo): void {
    this.concatValor('');
    this.selectedItem = item;
    this.nome = item.nome;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddItemComponent, {
      data: { nome: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.list.add(result);
        this.openDialog();
      }
    });
  }
}
