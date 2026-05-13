import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
  styleUrl: './history-dialog.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule],
})
export class HistoryDialogComponent {
  protected readonly history = inject(HistoryService);
  protected readonly dialogRef = inject(MatDialogRef<HistoryDialogComponent>);

  protected readonly weeklyData = computed(() => this.history.getWeeklyTotals(8));
  protected readonly maxWeekly = computed(() => Math.max(...this.weeklyData().map(w => w.total), 1));
  protected readonly sessions = computed(() => [...this.history.sessions()].reverse());

  protected barHeight(total: number): number {
    const max = this.maxWeekly();
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }
}
