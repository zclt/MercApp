import { Injectable, inject, effect } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { CartService } from './cart.service';
import { ShoppingListService } from './shopping-list.service';
import { HistoryService } from './history.service';
import { BarcodeService } from './barcode.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly firestore = inject(Firestore, { optional: true });
  private readonly cart = inject(CartService);
  private readonly list = inject(ShoppingListService);
  private readonly history = inject(HistoryService);
  private readonly barcodes = inject(BarcodeService);
  private readonly auth = inject(AuthService);

  private _syncDocPath: string | null = null;
  private _inSharedList = false;
  private _unsubscribe: (() => void) | null = null;

  private _lastSynced = { cart: '', shoppingList: '', history: '', barcodes: '' };

  constructor() {
    effect(() => {
      const data = this.cart.items();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.cart) return;
      this._lastSynced.cart = json;
      setDoc(doc(this.firestore, this._syncDocPath), { cart: JSON.parse(json) }, { merge: true }).catch(() => {});
    });

    effect(() => {
      const data = this.list.items();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.shoppingList) return;
      this._lastSynced.shoppingList = json;
      setDoc(doc(this.firestore, this._syncDocPath), { shoppingList: JSON.parse(json) }, { merge: true }).catch(() => {});
    });

    effect(() => {
      const data = this.history.sessions();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.history) return;
      this._lastSynced.history = json;
      setDoc(doc(this.firestore, this._syncDocPath), { history: JSON.parse(json) }, { merge: true }).catch(() => {});
    });

    effect(() => {
      const data = this.barcodes.db();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.barcodes) return;
      this._lastSynced.barcodes = json;
      setDoc(doc(this.firestore, this._syncDocPath), { barcodes: JSON.parse(json) }, { merge: true }).catch(() => {});
    });

    effect(() => {
      const user = this.auth.user();
      if (user && !this._inSharedList) {
        this._startPersonalSync(user.uid);
      } else if (!user) {
        this._stopSync();
        this._inSharedList = false;
      }
    });
  }

  async switchToSharedList(shareId: string): Promise<boolean> {
    if (!this.firestore) return false;
    const docRef = doc(this.firestore, `sharedLists/${shareId}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    this._stopSync();
    this._inSharedList = true;
    this._syncDocPath = `sharedLists/${shareId}`;
    this._subscribeToDoc(docRef);
    return true;
  }

  async createSharedList(shareId: string): Promise<void> {
    if (!this.firestore) return;
    const docRef = doc(this.firestore, `sharedLists/${shareId}`);
    await setDoc(docRef, {
      ownerUid: this.auth.user()?.uid ?? '',
      cart: JSON.parse(JSON.stringify(this.cart.items())),
      shoppingList: JSON.parse(JSON.stringify(this.list.items())),
      history: JSON.parse(JSON.stringify(this.history.sessions())),
      barcodes: JSON.parse(JSON.stringify(this.barcodes.db())),
      createdAt: serverTimestamp(),
    });
    this._stopSync();
    this._inSharedList = true;
    this._syncDocPath = `sharedLists/${shareId}`;
    this._subscribeToDoc(docRef);
  }

  leaveSharedList(): void {
    this._inSharedList = false;
    const uid = this.auth.user()?.uid;
    if (uid) {
      this._startPersonalSync(uid);
    } else {
      this._stopSync();
    }
  }

  get isFirebaseAvailable(): boolean {
    return !!this.firestore;
  }

  private _startPersonalSync(uid: string): void {
    if (!this.firestore) return;
    this._stopSync();
    this._syncDocPath = `users/${uid}`;
    this._subscribeToDoc(doc(this.firestore, `users/${uid}`));
  }

  private _stopSync(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._syncDocPath = null;
    this._lastSynced = { cart: '', shoppingList: '', history: '', barcodes: '' };
  }

  private _subscribeToDoc(docRef: ReturnType<typeof doc>): void {
    this._unsubscribe = onSnapshot(docRef, snap => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data['cart']) {
        const json = JSON.stringify(data['cart']);
        this._lastSynced.cart = json;
        this.cart.items.set(data['cart']);
      }
      if (data['shoppingList']) {
        const json = JSON.stringify(data['shoppingList']);
        this._lastSynced.shoppingList = json;
        this.list.items.set(data['shoppingList']);
      }
      if (data['history']) {
        const json = JSON.stringify(data['history']);
        this._lastSynced.history = json;
        this.history.loadFromRemote(data['history']);
      }
      if (data['barcodes']) {
        const json = JSON.stringify(data['barcodes']);
        this._lastSynced.barcodes = json;
        this.barcodes.loadFromRemote(data['barcodes']);
      }
    });
  }
}
