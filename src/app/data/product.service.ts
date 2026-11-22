import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { tap } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private where = isPlatformServer(inject(PLATFORM_ID)) ? 'SERVER' : 'BROWSER';

  // Relative URLs work on the server too: Angular resolves them against the
  // URL of the page being rendered (e.g. http://localhost:4000/api/products).
  //
  // After a server render, the browser gets this data from the HTTP transfer
  // cache (stored inside the HTML), so it does NOT call the API again.
  // Check the Network tab: no /api/ request on the first page load.
  getProducts() {
    return this.http.get<Product[]>('/api/products').pipe(
      tap(() => console.log(`[${this.where}] product list ready`)),
    );
  }

  getProduct(id: number) {
    return this.http.get<Product>(`/api/products/${id}`).pipe(
      tap(() => console.log(`[${this.where}] product ${id} ready`)),
    );
  }
}
