# Wordfolio

Aplikacja PWA do nauki języków z książek: wgrywasz PDF, czytasz go w oryginale, stukasz nieznane słowo i dostajesz tłumaczenie razem ze zdaniem z książki. Słówka trafiają do słownika i fiszek z powtórkami, a dane synchronizują się między urządzeniami przez Firebase. Pliki PDF zostają lokalnie na urządzeniu.

## Uruchomienie

```bash
npm install
cp .env.example .env   # uzupełnij dane projektu Firebase
npm run dev
```

Bez kluczy Firebase można pracować lokalnie z `VITE_MEMORY_BACKEND=true` w `.env.local` (tylko `npm run dev`).

## Build i testy

```bash
npm run lint && npm test && npm run build
```

Wynik trafia do `dist/`. Wdrożenie na GitHub Pages uruchamia się automatycznie po wypchnięciu na `main`.
