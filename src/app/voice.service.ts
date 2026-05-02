import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private readonly ngZone = inject(NgZone);

  readonly isListening = signal(false);
  readonly supported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  private recognition: any = null;

  listen(lang = 'pt-BR'): Observable<string> {
    const subject = new Subject<string>();

    if (!this.supported) {
      subject.error('not-supported');
      return subject.asObservable();
    }

    if (this.recognition) {
      this.recognition.abort();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const text: string = event.results[0][0].transcript;
      this.ngZone.run(() => {
        this.isListening.set(false);
        subject.next(text);
        subject.complete();
      });
    };

    this.recognition.onerror = () => {
      this.ngZone.run(() => {
        this.isListening.set(false);
        subject.complete();
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => this.isListening.set(false));
    };

    this.recognition.start();
    this.isListening.set(true);

    return subject.asObservable();
  }

  stop(): void {
    this.recognition?.abort();
    this.isListening.set(false);
  }
}
