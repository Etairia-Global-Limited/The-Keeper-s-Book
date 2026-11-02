import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.html',
})
export class TableSkeleton {
  /** Column headings, shown for real so the layout doesn't jump when data arrives. */
  readonly columns = input.required<string[]>();
  readonly rows = input(5);
  /** Keep the last column narrow (status badges, row actions). */
  readonly narrowLast = input(true);

  protected readonly grid = computed(() => {
    const cols = this.columns().length;
    return Array.from({ length: this.rows() }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        this.narrowLast() && c === cols - 1 ? 0 : 40 + ((r * 17 + c * 29) % 45),
      ),
    );
  });
}