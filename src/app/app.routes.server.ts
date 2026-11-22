import { RenderMode, ServerRoute } from '@angular/ssr';

// Choose HOW each route is rendered.
export const serverRoutes: ServerRoute[] = [
  // SSG: HTML created once at build time ("npm run build") and saved as a file
  { path: '', renderMode: RenderMode.Prerender },

  // SSR: HTML created on the server for every request (always fresh data)
  { path: 'products', renderMode: RenderMode.Server },
  { path: 'products/:id', renderMode: RenderMode.Server },

  // CSR: server sends an empty shell, the browser builds the page
  { path: 'dashboard', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Server },
];
