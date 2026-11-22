import { Component, inject, input, numberAttribute } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { RenderInfo } from '../../render-info/render-info';
import { ProductService } from '../../data/product.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe, RenderInfo],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private service = inject(ProductService);

  // Filled from the :id route parameter (withComponentInputBinding)
  id = input.required({ transform: numberAttribute });

  product = toSignal(toObservable(this.id).pipe(switchMap(id => this.service.getProduct(id))));
}
