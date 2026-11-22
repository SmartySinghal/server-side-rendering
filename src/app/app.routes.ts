import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Dashboard } from './pages/dashboard/dashboard';

// Browser + server share these routes.
// HOW each one is rendered is decided in app.routes.server.ts.
export const routes: Routes = [
  { path: '', component: Home, title: 'Home – SSR demo' },
  { path: 'products', component: Products, title: 'Products – SSR demo' },
  { path: 'products/:id', component: ProductDetail, title: 'Product – SSR demo' },
  { path: 'dashboard', component: Dashboard, title: 'Dashboard – SSR demo' },
  { path: '**', redirectTo: '' },
];
