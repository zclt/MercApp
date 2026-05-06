import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VoiceService } from '../voice.service';

export interface DialogData {
  nome: string;
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

  constructor(
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  confirmar() {
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
}
