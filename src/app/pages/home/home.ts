import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RenderInfo } from '../../render-info/render-info';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RenderInfo],
  templateUrl: './home.html',
})
export class Home {
  clicks = signal(0);
  screenWidth = signal<number | null>(null);

  constructor() {
    // ✅ Safe way to use browser-only APIs (window, document, localStorage).
    // ❌ Reading window.innerWidth directly in the constructor would crash
    //    on the server with "window is not defined".
    afterNextRender(() => this.screenWidth.set(window.innerWidth));
  }

  addClick() {
    this.clicks.update(c => c + 1);
  }
}
