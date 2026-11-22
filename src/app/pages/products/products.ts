import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RenderInfo } from '../../render-info/render-info';
import { ProductService } from '../../data/product.service';

@Component({
  selector: 'app-products',
  imports: [RouterLink, CurrencyPipe, RenderInfo],
  templateUrl: './products.html',
})
export class Products {
  // The server waits for this request to finish before sending the HTML,
  // so the product list is already inside the page source.
  products = toSignal(inject(ProductService).getProducts());
}
