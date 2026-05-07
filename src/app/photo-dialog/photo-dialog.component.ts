import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef, Inject, OnDestroy, ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PhotoDialogData {
  photo?: string;
}

@Component({
  selector: 'app-photo-dialog',
  templateUrl: './photo-dialog.component.html',
  styleUrl: './photo-dialog.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
})
export class PhotoDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') private videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  capturedPhoto: string | null = null;
  streaming = false;
  cameraError = false;

  private stream: MediaStream | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhotoDialogData,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.startCamera();
  }

  private async startCamera(): Promise<void> {
    this.cameraError = false;
    this.streaming = false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      video.onloadedmetadata = () => {
        this.streaming = true;
        this.cdr.markForCheck();
      };
    } catch {
      this.cameraError = true;
      this.cdr.markForCheck();
    }
  }

  capture(): void {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    const MAX = 320;
    const ratio = Math.min(MAX / video.videoWidth, MAX / video.videoHeight);
    canvas.width  = Math.round(video.videoWidth  * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.7);
    this.stopStream();
    this.cdr.markForCheck();
  }

  retake(): void {
    this.capturedPhoto = null;
    this.cdr.markForCheck();
    this.startCamera();
  }

  save(): void {
    this.dialogRef.close(this.capturedPhoto);
  }

  dismiss(): void {
    this.dialogRef.close(undefined);
  }

  ngOnDestroy(): void {
    this.stopStream();
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.streaming = false;
  }
}
