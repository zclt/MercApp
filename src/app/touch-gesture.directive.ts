import {
  Directive, ElementRef, EventEmitter, HostListener,
  NgZone, OnDestroy, OnInit, Output,
} from '@angular/core';

@Directive({ selector: '[appTouchGesture]', standalone: true })
export class TouchGestureDirective implements OnInit, OnDestroy {
  @Output() swipeRight = new EventEmitter<void>();
  @Output() swipeLeft = new EventEmitter<void>();
  @Output() longPress = new EventEmitter<void>();

  private startX = 0;
  private startY = 0;
  private active = false;
  private horizontal = false;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly SWIPE_THRESHOLD = 50;
  private readonly LOCK_DISTANCE = 8;
  private readonly LONG_PRESS_MS = 2000;

  private readonly boundTouchMove: (e: TouchEvent) => void;
  private readonly boundMouseMove: (e: MouseEvent) => void;
  private readonly boundMouseUp: (e: MouseEvent) => void;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
  ) {
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  ngOnInit(): void {
    // passive: false permite chamar preventDefault() e bloquear scroll horizontal
    this.ngZone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    });
  }

  // ── Touch ──────────────────────────────────────────────────────────────

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    const t = e.touches[0];
    this.begin(t.clientX, t.clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    const t = e.touches[0];
    this.move(t.clientX, t.clientY, e);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent): void {
    this.end(e.changedTouches[0].clientX);
  }

  @HostListener('touchcancel')
  onTouchCancel(): void { this.cancel(); }

  // ── Mouse (para testes no desktop) ────────────────────────────────────

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    this.begin(e.clientX, e.clientY);
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    this.move(e.clientX, e.clientY);
  }

  private handleMouseUp(e: MouseEvent): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.ngZone.run(() => this.end(e.clientX));
  }

  // ── Lógica central ────────────────────────────────────────────────────

  private begin(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.active = true;
    this.horizontal = false;

    const el = this.el.nativeElement;
    el.classList.add('gesture-active');
    el.classList.add('long-pressing');

    this.ngZone.runOutsideAngular(() => {
      this.longPressTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.resetEl();
          this.active = false;
          this.longPress.emit();
        });
      }, this.LONG_PRESS_MS);
    });
  }

  private move(x: number, y: number, e?: TouchEvent): void {
    if (!this.active) return;

    const dx = x - this.startX;
    const dy = y - this.startY;

    if (Math.abs(dx) > this.LOCK_DISTANCE || Math.abs(dy) > this.LOCK_DISTANCE) {
      this.cancelLongPress();

      if (!this.horizontal) {
        if (Math.abs(dy) > Math.abs(dx)) { this.cancel(); return; }
        this.horizontal = true;
      }
    }

    if (this.horizontal) {
      e?.preventDefault();
      const el = this.el.nativeElement;
      el.style.transform = `translateX(${dx}px)`;
      el.classList.toggle('swipe-right-hint', dx > this.SWIPE_THRESHOLD);
      el.classList.toggle('swipe-left-hint', dx < -this.SWIPE_THRESHOLD);
    }
  }

  private end(endX: number): void {
    if (!this.active) return;
    this.cancelLongPress();

    const dx = endX - this.startX;
    this.resetEl();
    this.active = false;
    this.horizontal = false;

    if (Math.abs(dx) > this.SWIPE_THRESHOLD) {
      if (dx > 0) this.swipeRight.emit();
      else this.swipeLeft.emit();
    }
  }

  private cancel(): void {
    this.cancelLongPress();
    this.resetEl();
    this.active = false;
    this.horizontal = false;
  }

  private resetEl(): void {
    const el = this.el.nativeElement;
    el.style.transition = 'transform 0.25s ease-out';
    el.style.transform = 'translateX(0)';
    el.classList.remove('swipe-right-hint', 'swipe-left-hint', 'gesture-active', 'long-pressing');
    setTimeout(() => { el.style.transition = ''; }, 250);
  }

  private cancelLongPress(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.el.nativeElement.classList.remove('long-pressing');
  }

  ngOnDestroy(): void {
    this.cancelLongPress();
    this.el.nativeElement.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }
}
