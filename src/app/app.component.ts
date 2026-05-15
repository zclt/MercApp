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
import { VoiceService } from './voice.service';
import { PwaUpdateService } from './pwa-update.service';
import { HistoryService } from './history.service';
import { BarcodeService } from './barcode.service';
import { TouchGestureDirective } from './touch-gesture.directive';
import { AddItemComponent } from './add-item/add-item.component';
import { PhotoDialogComponent } from './photo-dialog/photo-dialog.component';
import { HistoryDialogComponent } from './history-dialog/history-dialog.component';
import { BarcodeScannerComponent } from './barcode-scanner/barcode-scanner.component';
import { ItemTodo } from './model/item-todo';
import { ItemInfo } from './model/item-info';

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
    TouchGestureDirective,
  ],
})
export class AppComponent {
  protected readonly cart = inject(CartService);
  protected readonly list = inject(ShoppingListService);
  protected readonly voice = inject(VoiceService);
  protected readonly history = inject(HistoryService);
  private readonly barcodeService = inject(BarcodeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly pwaUpdate = inject(PwaUpdateService);

  constructor() {
    this.pwaUpdate.init();
  }

  nome = '';
  valor = '0';
  valorReal = 0;
  multi = false;
  itemAdded = false;
  private selectedItem: ItemTodo | null = null;
  protected currentBarcode: string | null = null;
  private pendingPhoto: string | null = null;

  setCheckoutItem(): void {
    if (!(this.valorReal > 0)) return;
    const photo = this.pendingPhoto ?? undefined;
    this.cart.addOrIncrement(this.valorReal, this.nome, this.multi, photo);
    if (this.currentBarcode && this.nome.trim() && !this.multi) {
      this.barcodeService.register(this.currentBarcode, this.nome.trim(), photo);
    }
    if (this.selectedItem) {
      this.list.check(this.selectedItem);
      this.selectedItem = null;
    }
    this.multi = true;
    this.itemAdded = true;
    this.currentBarcode = null;
    this.pendingPhoto = null;
    setTimeout(() => { this.itemAdded = false; this.cdr.markForCheck(); }, 400);
  }

  removeCheckoutItem(index: number): void {
    this.cart.remove(index);
    this.concatValor('');
  }

  resetAll(): void {
    const backup = [...this.cart.items()];
    const total = this.cart.sum();
    this.history.save(backup, total);
    this.cart.reset();
    this.list.uncheckAll();
    this.concatValor('');

    this.snackBar.open('Carrinho esvaziado', 'Desfazer', { duration: 4000 })
      .onAction()
      .subscribe(() => {
        this.history.removeLastSession();
        this.cart.restore(backup);
        this.cdr.markForCheck();
      });
  }

  priceIndicator(item: ItemInfo): 'up' | 'down' | null {
    const last = this.history.lastPrices().get(item.nome.toLowerCase());
    if (last === undefined || last === item.valor) return null;
    return item.valor > last ? 'up' : 'down';
  }

  openHistoryDialog(): void {
    this.dialog.open(HistoryDialogComponent, {
      width: '100%',
      maxWidth: '560px',
      maxHeight: '90vh',
    });
  }

  concatValor(v: string): void {
    if (this.multi || v.length === 0) {
      this.valor = '0';
      this.nome = '';
      if (v.length === 0) {
        this.selectedItem = null;
        this.currentBarcode = null;
        this.pendingPhoto = null;
      }
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

  startVoiceCalculator(): void {
    if (this.voice.isListening()) {
      this.voice.stop();
      return;
    }
    this.voice.listen().subscribe(text => {
      const parsed = this.parsePriceFromSpeech(text);
      if (parsed) {
        this.multi = false;
        this.valor = parsed;
        this.valorReal = parseFloat(parsed) / 100;
        this.cdr.markForCheck();
      }
    });
  }

  private parsePriceFromSpeech(text: string): string | null {
    const clean = text.toLowerCase()
      .replace(/reais?/g, '')
      .replace(/centavos?/g, '')
      .replace(/\be\b/g, ',')
      .replace(/\s+/g, '');

    const decMatch = clean.match(/(\d+)[,.](\d{1,2})/);
    if (decMatch) {
      return `${decMatch[1]}${decMatch[2].padEnd(2, '0')}`;
    }

    const intMatch = clean.match(/^(\d+)$/);
    if (intMatch) {
      return `${intMatch[1]}00`;
    }

    return null;
  }

  scanBarcodeForCart(): void {
    const ref = this.dialog.open(BarcodeScannerComponent, {
      width: '100%',
      maxWidth: '400px',
    });
    ref.afterClosed().subscribe((code: string | null) => {
      if (!code) return;
      const entry = this.barcodeService.lookup(code);
      this.currentBarcode = code;
      if (entry) {
        this.nome = entry.nome;
        this.pendingPhoto = entry.photo ?? null;
        this.snackBar.open(`Produto identificado: ${entry.nome}`, '', { duration: 2500 });
      } else {
        this.snackBar.open('Código escaneado — digite o nome do produto', '', { duration: 3000 });
      }
      this.cdr.markForCheck();
    });
  }

  openPhotoDialog(item: ItemInfo): void {
    const dialogRef = this.dialog.open(PhotoDialogComponent, {
      data: { photo: item.photo },
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe((photo: string | undefined) => {
      if (photo !== undefined) {
        this.cart.setPhoto(item, photo);
        this.cdr.markForCheck();
      }
    });
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
