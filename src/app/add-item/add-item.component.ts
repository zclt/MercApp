import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VoiceService } from '../voice.service';
import { BarcodeService } from '../barcode.service';
import { BarcodeScannerComponent } from '../barcode-scanner/barcode-scanner.component';

export interface DialogData {
  nome: string;
  barcode?: string;
}

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.css',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule],
})
export class AddItemComponent {
  protected readonly voice = inject(VoiceService);
  private readonly barcodeService = inject(BarcodeService);
  private readonly dialog = inject(MatDialog);

  constructor(
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  confirmar(): void {
    if (this.data.barcode && this.data.nome.trim()) {
      this.barcodeService.register(this.data.barcode, this.data.nome.trim());
    }
    this.dialogRef.close(this.data.nome);
  }

  startVoice(): void {
    if (this.voice.isListening()) {
      this.voice.stop();
      return;
    }
    this.voice.listen().subscribe(text => {
      this.data.nome = text;
    });
  }

  scanBarcode(): void {
    const ref = this.dialog.open(BarcodeScannerComponent, {
      width: '100%',
      maxWidth: '400px',
    });
    ref.afterClosed().subscribe((code: string | null) => {
      if (!code) return;
      const entry = this.barcodeService.lookup(code);
      if (entry) {
        this.data.nome = entry.nome;
      }
      this.data.barcode = code;
    });
  }
}
