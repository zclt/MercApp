import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:6px">qr_code_scanner</mat-icon>
      Escanear Código
    </h2>
    <div mat-dialog-content class="scanner-content">
      <div id="barcode-reader"></div>
      <p class="scan-hint">Aponte a câmera para o código de barras do produto</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">Cancelar</button>
    </div>
  `,
  styles: [`
    .scanner-content { padding: 0 8px; }
    #barcode-reader { width: 100%; }
    .scan-hint {
      text-align: center;
      color: #888;
      font-size: 0.82rem;
      margin: 8px 0 0;
    }
  `],
})
export class BarcodeScannerComponent implements AfterViewInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<BarcodeScannerComponent>);
  private scanner?: Html5Qrcode;
  private done = false;

  async ngAfterViewInit(): Promise<void> {
    this.scanner = new Html5Qrcode('barcode-reader');
    try {
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 100 } },
        (code) => this.onScanned(code),
        () => {},
      );
    } catch {
      this.dialogRef.close(null);
    }
  }

  private async onScanned(code: string): Promise<void> {
    if (this.done) return;
    this.done = true;
    await this.scanner?.stop().catch(() => {});
    this.dialogRef.close(code);
  }

  async close(): Promise<void> {
    if (this.done) return;
    this.done = true;
    await this.scanner?.stop().catch(() => {});
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    if (!this.done) this.scanner?.stop().catch(() => {});
  }
}
