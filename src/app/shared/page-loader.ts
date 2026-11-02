import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.html',
})
export class PageLoader {
  /** Show or hide. Hiding fades the loader out; it stays in the DOM but is inert. */
  readonly visible = input(true);
  /** `true` covers the whole viewport; `false` covers the nearest `relative` parent. */
  readonly fullscreen = input(true);
  /** `dark` for navy screens such as sign-in. */
  readonly tone = input<'light' | 'dark'>('light');
  readonly label = input('Loading');

  protected readonly overlayClass = computed(() =>
    [
      this.fullscreen() ? 'fixed inset-0' : 'absolute inset-0',
      this.tone() === 'dark' ? 'bg-[#0A0A3C]/95 text-white' : 'bg-white/90 text-[#0A0A3C]',
      this.visible() ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
    ].join(' '),
  );
}