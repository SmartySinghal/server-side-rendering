import {
  Component, OnInit, PLATFORM_ID, TransferState,
  afterNextRender, inject, input, makeStateKey, signal,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

interface RenderStamp {
  where: 'server' | 'browser';
  at: string;
}

/**
 * Shows WHERE the HTML of the current page was created and WHETHER the
 * browser JavaScript has taken over (hydration).
 *
 *  - On the server, it records "server + time" and passes it to the browser
 *    with TransferState (embedded in the HTML as JSON).
 *  - In the browser, it reads that value instead of creating a new one, so
 *    the text stays the same during hydration.
 *  - afterNextRender() only runs in the browser, so "JavaScript active"
 *    only turns green once Angular is running in the browser.
 */
@Component({
  selector: 'app-render-info',
  template: `
    <div class="render-info">
      <div class="render-info__item">
        <span class="label">HTML created on</span>
        @if (stamp(); as s) {
          <span class="badge" [class.badge--server]="s.where === 'server'" [class.badge--browser]="s.where === 'browser'">
            {{ s.where === 'server' ? 'Server' : 'Browser' }}
          </span>
          <span class="muted">at {{ s.at }}</span>
        }
      </div>
      <div class="render-info__item">
        <span class="label">Render mode</span>
        <span class="badge badge--mode">{{ mode() }}</span>
      </div>
      <div class="render-info__item">
        <span class="label">Browser JavaScript</span>
        @if (jsActive()) {
          <span class="badge badge--ok">Active</span>
        } @else {
          <span class="badge badge--wait">Not running yet</span>
        }
      </div>
    </div>
  `,
})
export class RenderInfo implements OnInit {
  /** Unique name of the page, used as the TransferState key */
  page = input.required<string>();
  /** Render mode configured for this route in app.routes.server.ts */
  mode = input.required<string>();

  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  stamp = signal<RenderStamp | null>(null);
  jsActive = signal(false);

  constructor() {
    // Runs ONLY in the browser, after the first render (never on the server)
    afterNextRender(() => this.jsActive.set(true));
  }

  ngOnInit() {
    const key = makeStateKey<RenderStamp>(`render-stamp-${this.page()}`);
    const now = new Date().toLocaleTimeString();

    if (isPlatformServer(this.platformId)) {
      const value: RenderStamp = { where: 'server', at: now };
      this.transferState.set(key, value);   // sent to the browser inside the HTML
      this.stamp.set(value);
    } else {
      // First load: the value created on the server. Later client-side
      // navigation: no value exists, so the page was created in the browser.
      this.stamp.set(this.transferState.get(key, { where: 'browser', at: now }));
      this.transferState.remove(key);       // use it only once
    }
  }
}
