import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // withFetch(): uses fetch(), which works on both the server and the browser
    provideHttpClient(withFetch()),
    // Hydration: reuse the server HTML instead of rebuilding it.
    // It also caches HTTP responses made on the server, so the browser
    // does not call the same API again. withEventReplay() keeps early clicks.
    provideClientHydration(withEventReplay()),
  ],
};
