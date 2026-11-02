import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Spinner } from './spinner';

@Component({
  selector: 'app-loading-button',
  imports: [Spinner, NgTemplateOutlet],
  templateUrl: './loading-button.html',
})
export class LoadingButton {
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly variant = input<'primary' | 'ghost'>('primary');
  readonly type = input<'button' | 'submit'>('button');
  /** Text shown while loading, e.g. "Saving…". Falls back to the normal label. */
  readonly loadingLabel = input('');
  /** Stretch to the full width of the parent (handy on mobile). */
  readonly block = input(false);

  protected readonly buttonClass = computed(() =>
    [
      this.variant() === 'primary'
        ? 'bg-[#F28C1B] text-[#0A0A3C] hover:shadow-[0_8px_20px_rgba(242,140,27,.45)] hover:-translate-y-px'
        : 'border border-[#D9D9E8] bg-white text-[#0A0A3C] hover:bg-[#F6F6FA]',
      this.block() ? 'w-full' : 'w-full sm:w-auto',
    ].join(' '),
  );
}