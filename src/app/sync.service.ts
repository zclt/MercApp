import { Injectable, inject, effect } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { CartService } from './cart.service';
import { ShoppingListService } from './shopping-list.service';
import { HistoryService } from './history.service';
import { BarcodeService, BarcodeEntry } from './barcode.service';
import { AuthService } from './auth.service';
import { ItemInfo } from './model/item-info';

type WithPhoto = { photo?: string; photoId?: string };

// cyrb53: fast 53-bit string hash, used to give each photo a stable content-based id
function photoHash(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * Photos (base64) are never written to the main sync document — it would quickly hit
 * Firestore's 1 MB per-document limit. Each photo lives in `<syncDoc>/photos/<photoId>`
 * and items only carry the `photoId` reference.
 */
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

  private readonly _photoCache = new Map<string, string>();
  private _uploadedPhotos = new Set<string>();
  private readonly _fetchingPhotos = new Set<string>();

  constructor() {
    effect(() => {
      const data = this.cart.items();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data.map(i => this._toRemote(i)));
      if (json === this._lastSynced.cart) return;
      this._lastSynced.cart = json;
      this._writeField('cart', json);
    });

    effect(() => {
      const data = this.list.items();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.shoppingList) return;
      this._lastSynced.shoppingList = json;
      this._writeField('shoppingList', json);
    });

    effect(() => {
      const data = this.history.sessions();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(data);
      if (json === this._lastSynced.history) return;
      this._lastSynced.history = json;
      this._writeField('history', json);
    });

    effect(() => {
      const data = this.barcodes.db();
      if (!this.firestore || !this._syncDocPath) return;
      const json = JSON.stringify(this._barcodesToRemote(data));
      if (json === this._lastSynced.barcodes) return;
      this._lastSynced.barcodes = json;
      this._writeField('barcodes', json);
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
    this._stopSync();
    const path = `sharedLists/${shareId}`;
    const docRef = doc(this.firestore, path);
    // _syncDocPath is still null here, so _toRemote doesn't upload yet: the photos
    // subcollection can only be written once the parent document exists.
    await setDoc(docRef, {
      ownerUid: this.auth.user()?.uid ?? '',
      cart: JSON.parse(JSON.stringify(this.cart.items().map(i => this._toRemote(i)))),
      shoppingList: JSON.parse(JSON.stringify(this.list.items())),
      history: JSON.parse(JSON.stringify(this.history.sessions())),
      barcodes: JSON.parse(JSON.stringify(this._barcodesToRemote(this.barcodes.db()))),
      createdAt: serverTimestamp(),
    });
    this._syncDocPath = path;
    this._inSharedList = true;
    this.cart.items().forEach(i => this._toRemote(i));
    this._barcodesToRemote(this.barcodes.db());
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
    this._uploadedPhotos = new Set();
  }

  private _writeField(field: string, json: string): void {
    if (!this.firestore || !this._syncDocPath) return;
    setDoc(doc(this.firestore, this._syncDocPath), { [field]: JSON.parse(json) }, { merge: true })
      .catch(err => console.error(`[SyncService] falha ao gravar "${field}"`, err));
  }

  /** Replaces the inline photo by a `photoId` reference, uploading the photo if needed. */
  private _toRemote<T extends WithPhoto>(entry: T): Omit<T, 'photo'> {
    const { photo, ...rest } = entry;
    if (!photo) return rest;
    const photoId = photoHash(photo);
    this._photoCache.set(photoId, photo);
    this._uploadPhoto(photoId, photo);
    return { ...rest, photoId };
  }

  private _barcodesToRemote(db: Record<string, BarcodeEntry>): Record<string, Omit<BarcodeEntry, 'photo'>> {
    return Object.fromEntries(Object.entries(db).map(([code, entry]) => [code, this._toRemote(entry)]));
  }

  /** Restores the inline photo from cache; on a miss keeps `photoId` and fetches it in background. */
  private _fromRemote<T extends WithPhoto>(entry: T): T {
    if (!entry.photoId) return entry;
    const photo = this._photoCache.get(entry.photoId);
    if (photo) return { ...entry, photo };
    this._fetchPhoto(entry.photoId);
    return entry;
  }

  private _uploadPhoto(photoId: string, data: string): void {
    if (!this.firestore || !this._syncDocPath || this._uploadedPhotos.has(photoId)) return;
    this._uploadedPhotos.add(photoId);
    setDoc(doc(this.firestore, `${this._syncDocPath}/photos/${photoId}`), { data }).catch(err => {
      this._uploadedPhotos.delete(photoId);
      console.error('[SyncService] falha ao enviar foto', err);
    });
  }

  private async _fetchPhoto(photoId: string): Promise<void> {
    if (!this.firestore || !this._syncDocPath || this._fetchingPhotos.has(photoId)) return;
    this._fetchingPhotos.add(photoId);
    try {
      const snap = await getDoc(doc(this.firestore, `${this._syncDocPath}/photos/${photoId}`));
      const photo = snap.exists() ? snap.data()['data'] as string : undefined;
      if (!photo) return;
      this._photoCache.set(photoId, photo);
      this._uploadedPhotos.add(photoId);
      this.cart.items.set(this.cart.items().map(i => i.photoId === photoId ? { ...i, photo } : i));
      const db = this.barcodes.db();
      if (Object.values(db).some(e => e.photoId === photoId)) {
        this.barcodes.loadFromRemote(Object.fromEntries(
          Object.entries(db).map(([code, e]) => [code, e.photoId === photoId ? { ...e, photo } : e]),
        ));
      }
    } catch (err) {
      console.error('[SyncService] falha ao baixar foto', err);
    } finally {
      this._fetchingPhotos.delete(photoId);
    }
  }

  private _subscribeToDoc(docRef: ReturnType<typeof doc>): void {
    this._unsubscribe = onSnapshot(docRef, snap => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data['cart']) {
        const items = (data['cart'] as ItemInfo[]).map(i => this._fromRemote(i));
        this._lastSynced.cart = JSON.stringify(items.map(i => this._toRemote(i)));
        this.cart.items.set(items);
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
        const db = Object.fromEntries(
          Object.entries(data['barcodes'] as Record<string, BarcodeEntry>)
            .map(([code, e]) => [code, this._fromRemote(e)]),
        );
        this._lastSynced.barcodes = JSON.stringify(this._barcodesToRemote(db));
        this.barcodes.loadFromRemote(db);
      }
    }, err => console.error('[SyncService] erro na escuta do documento', err));
  }
}
