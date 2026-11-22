# Angular SSR demo (Angular 22)

A small example that shows **how server-side rendering works** in Angular, using all
three render modes side by side:

| Page | Route | Render mode | HTML is created... |
|---|---|---|---|
| Home | `/` | `RenderMode.Prerender` (SSG) | once, at **build time**, and saved as a file |
| Products | `/products`, `/products/:id` | `RenderMode.Server` (SSR) | on the server, **for every request** |
| Dashboard | `/dashboard` | `RenderMode.Client` (CSR) | only in the **browser** |

Every page shows a dashed info box:
- **HTML created on:** `Server` or `Browser`, and the time it happened
- **Render mode:** the mode set in `app.routes.server.ts`
- **Browser JavaScript:** `Not running yet` → `Active` once Angular starts in the browser

## Run it

**Production-like (recommended to see the real flow):**
```bash
npm run build      # builds browser + server code and prerenders "/"
npm run serve:ssr  # starts the Node/Express SSR server
```
Open <http://localhost:4000>. The terminal logs every page and API request.

**Development (auto-reload):**
```bash
npm start
```
Open <http://localhost:4200>. SSR also works here, but prerendered pages are rendered on
each request in development, so the Home time changes on refresh.

## The flow

### 1. First visit to `/products` (SSR)
```
Browser ──GET /products──▶ Express (src/server.ts)
                               │
                               ▼
                   Angular runs ON THE SERVER
                   ProductService calls GET /api/products  (waits ~400 ms)
                               │
                               ▼
              Complete HTML + data (TransferState JSON) sent back
                               │
Browser shows the products immediately ◀──┘
                               │
              main.js loads → Angular starts in the browser
              Hydration: reuses the existing HTML (no rebuild)
              HTTP transfer cache: uses the data from the HTML,
              so NO second /api/products call
```
Terminal output:
```
[API]  GET /api/products → 200 (403 ms)
[SERVER] product list ready
[PAGE] GET /products → 200 (470 ms)
```
Only **one** API call: the browser reused the server's data.

### 2. Clicking a product (client-side navigation)
Angular is already running, so the **browser** builds the next page itself and calls
`/api/products/2` directly. The info box shows **HTML created on: Browser**.
Refresh the page and it shows **Server** again.

### 3. `/` (SSG)
The HTML was created during `npm run build`. Refresh many times: the time does not change
until you build again. No server work happens per request.

### 4. `/dashboard` (CSR)
The server sends an empty shell (`index.csr.html`). The browser builds the page, so it
can use `localStorage` directly.

## Things to try
1. **View page source** (`Ctrl+U`) on each page:
   - `/products`: product names are in the HTML, plus `ng-server-context="ssr"`
   - `/`: full content, plus `ng-server-context="ssg"`
   - `/dashboard`: just `<app-root></app-root>`, no content
2. **DevTools → Network**, filter `api`, reload `/products`: **no** API request from the
   browser (the transfer cache). Then click a product: now there is one.
3. **DevTools → Settings → Disable JavaScript**, reload `/products`: the page still shows all
   products (the server made it), but "Browser JavaScript" stays `Not running yet` and the
   buttons do nothing.
4. **Event replay:** on a slow connection (Network → "Slow 4G"), reload `/` and click the
   button before the page finishes loading. The clicks are counted once Angular starts.

## Key files
| File | What it does |
|---|---|
| `src/server.ts` | Express server: request logging, demo `/api/products` API, Angular rendering |
| `src/app/app.routes.ts` | Normal Angular routes (shared by server and browser) |
| `src/app/app.routes.server.ts` | **Render mode for each route** |
| `src/app/app.config.ts` | `provideClientHydration(withEventReplay())`, `provideHttpClient(withFetch())` |
| `src/app/app.config.server.ts` | Server-only providers (`provideServerRendering`) |
| `src/main.server.ts` | Entry point used on the server |
| `src/app/render-info/render-info.ts` | Uses `isPlatformServer`, `TransferState` and `afterNextRender` |
| `src/app/pages/home/home.ts` | Safe use of `window` with `afterNextRender` |
| `src/app/pages/dashboard/dashboard.ts` | Uses `localStorage` (only safe because the route is CSR) |

## Rules for SSR-safe code
- Never touch `window`, `document` or `localStorage` directly in components that run on the
  server. Use `afterNextRender()` or check `isPlatformBrowser(inject(PLATFORM_ID))` first.
- The server must know which host names it may serve: see `security.allowedHosts` in
  `angular.json`. Add your real domain there before deploying (for example
  `"my-app.onrender.com"`).
