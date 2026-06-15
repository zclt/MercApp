---
name: project-overview
description: MercApp tech stack, architecture, and key patterns
metadata:
  type: project
---

Angular 20 PWA shopping cart app. Standalone components, signal-based state (no RxJS for core logic), localStorage persistence via `effect()`, Material Design UI.

**Why:** No backend — fully offline-first, deployed to GitHub Pages.
**How to apply:** All new features should follow signal/computed/effect pattern. No NgModules. Use `ChangeDetectionStrategy.OnPush` on all components.

Key storage keys: `CartItems`, `TodoItems`, `PurchaseHistory`.
Key services: `CartService`, `ShoppingListService`, `HistoryService`, `VoiceService`.
Accent color: `#E06010` (orange).
