# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                  # Dev server at http://localhost:4200
npm run build              # Production build → docs/ (sets --base-href for GitHub Pages)
npm test                   # Unit tests via Karma/Jasmine (opens browser)
npm run test:e2e           # E2E tests headless (requires dev server running)
npm run test:e2e:headed    # E2E tests with visible browser + slowMo 1.5s
npm run test:e2e:ui        # Playwright interactive UI mode
npx playwright show-report # Open last E2E HTML report
```

E2E tests use `reuseExistingServer: true`, so run `npm start` in a separate terminal before `npm run test:e2e`, or the config will start one automatically. Videos of each test are saved to `test-results/` and the HTML report to `playwright-report/`.

Build output goes to `docs/` (not `dist/`) — this folder is what GitHub Pages serves directly from the `master` branch.

## Architecture

**Angular 20 single-page PWA** with no client-side routing. The entire app lives in `AppComponent` as one screen: a toolbar, a scrollable cart list, a numeric keypad, and a side drawer for the shopping list.

### State management pattern

All state is held in **Angular signals** inside `providedIn: 'root'` services. Each service auto-persists to `localStorage` via `effect()` and rehydrates in its constructor. There are four independent stores:

| Service | `localStorage` key | Contents |
|---|---|---|
| `CartService` | `CartItems` | Active cart items (`ItemInfo[]`) |
| `ShoppingListService` | `TodoItems` | Pre-shop list (`ItemTodo[]`) |
| `HistoryService` | `PurchaseHistory` | Past sessions (`PurchaseSession[]`) |
| `BarcodeService` | `BarcodeDB` | Barcode → product name/photo map |

`CartService.sum` and `CartService.count` are `computed()` signals derived from `items`. `HistoryService.lastPrices` is a `computed()` map used by `AppComponent.priceIndicator()` to show ↑/↓ price trend indicators on cart items. `HistoryService.getWeeklyTotals()` / `getMonthlyTotals()` feed the history chart.

### Firebase sync (optional)

`AuthService` (Google login), `SyncService` (signals ↔ Firestore) and `ShareService` (shared lists via `?join=ID` link) only activate when `environment.firebaseConfig.apiKey` is set — `main.ts` registers the Firebase providers conditionally and the services inject them with `{ optional: true }`. Without config the app is localStorage-only.

- Personal data syncs to `users/{uid}`; shared lists to `sharedLists/{id}` (with `ownerUid`). Each store is a field in that single document, written whole with `setDoc(..., { merge: true })` (last write wins).
- Photos are **never** stored in the main document (1 MB limit): `SyncService` replaces `photo` with a content-hash `photoId` and stores the base64 in the `photos/{photoId}` subcollection, re-hydrating `photo` from cache or a fetch on snapshot.
- Security rules live in `firestore.rules` (deploy with `firebase deploy --only firestore:rules`). Shared lists require a signed-in user.

### Price input

The numeric keypad appends raw digits to a string (`valor`), divided by 100 to get the real value (`valorReal`). For example, pressing 5-9-0 builds `"0590"` → `R$ 5,90`. The `multi` flag tracks whether the next keypress should clear the current value (set to `true` after each "Adicionar").

Voice input (`VoiceService`) uses the Web Speech API (`lang: 'pt-BR'`) and parses Portuguese price phrases ("cinco reais e noventa") into the same digit string format.

### Dialogs

Six dialogs launched from `AppComponent` via `MatDialog`:
- `AddItemComponent` — add item to shopping list (re-opens itself on confirm to allow batch entry)
- `PhotoDialogComponent` — capture/view photo for a cart item (base64, stored in `ItemInfo.photo`)
- `HistoryDialogComponent` — past purchase sessions with a weekly/monthly totals chart
- `BarcodeScannerComponent` — uses `html5-qrcode` library for camera-based barcode scanning
- `AuthDialogComponent` — Google sign-in / sign-out
- `ShareDialogComponent` — create, join or leave a shared list

### Gesture handling

`TouchGestureDirective` (`[appTouchGesture]`) handles touch and mouse events on cart item cards:
- Swipe right → `addCount` (increment quantity)
- Swipe left → `reduceCount` (decrement or remove)
- Long press (2s) → remove item
- Double tap / dblclick → open photo dialog

The directive uses `passive: false` on `touchmove` to call `preventDefault()` and block vertical scroll during horizontal swipes. It runs gesture detection outside Angular zone and re-enters with `ngZone.run()` only when emitting outputs.

### Models

- `ItemInfo` — cart item: `valor` (unit price), `count`, `nome`, optional `photo` (base64) and `photoId` (Firestore photo reference)
- `ItemTodo` — shopping list entry: `nome`, `checked`
- `PurchaseSession` — history record: `date` (ISO string), `total`, `items[]`

### PWA

`PwaUpdateService` initializes on app start to detect service worker updates. `ngsw-config.json` configures the Angular service worker. The app uses `ChangeDetectionStrategy.OnPush` throughout and manually calls `cdr.markForCheck()` after async operations (dialog close, voice result, snackbar undo).
