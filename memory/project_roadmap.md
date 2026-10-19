---
name: project-roadmap
description: ROADMAP.md implementation status — which etapas are done and what's next
metadata:
  type: project
---

Etapa 1 (PWA/Offline): complete — service worker, localStorage sync, installable.
Etapa 2 (Histórico e Gastos): complete — HistoryService, price indicators (↑/↓), chart dialog with Semanal (8 semanas) / Mensal (6 meses) toggle.
Etapa 3 (Sync + Auth): code complete (Firebase Auth + Firestore via AuthService/SyncService/ShareService), inactive until the user creates the Firebase project and fills `firebaseConfig`. Checkboxes intentionally left unchecked in ROADMAP.md until that happens. Security rules in `firestore.rules`.
Etapa 4 (Barcode): complete — html5-qrcode + BarcodeService auto-fill.
Etapa 5 (Categories): pending — tags, smart ordering.
Etapa 6 (Dark mode): pending — CSS variables theme system.

**Why:** ROADMAP.md is the source of truth for planned features.
**How to apply:** When the user says "implementar etapa N", check ROADMAP.md for that section's checklist.
