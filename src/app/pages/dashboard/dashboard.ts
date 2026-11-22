import { Component, signal } from '@angular/core';
import { RenderInfo } from '../../render-info/render-info';

@Component({
  selector: 'app-dashboard',
  imports: [RenderInfo],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // This route uses RenderMode.Client, so this code ONLY ever runs in the
  // browser and can use localStorage directly.
  visits = signal(this.countVisit());

  private countVisit() {
    const next = Number(localStorage.getItem('dashboard-visits') ?? 0) + 1;
    localStorage.setItem('dashboard-visits', String(next));
    return next;
  }

  reset() {
    localStorage.removeItem('dashboard-visits');
    this.visits.set(0);
  }
}
