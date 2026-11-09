import { Component, computed, inject, signal } from '@angular/core';
import { PageHeader } from '../../shared/page-header';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, of } from 'rxjs';
import { SearchPayload } from '../../constants/model';
import { PaginatedResponse, ErrorResponse } from '../../constants/response.model';
import { ApplicationClientService } from '../../services/application-client/application-client-service';
import { RouterLink } from '@angular/router';

interface ApplicationClientItem {
  id: string;
  clientId: string;
  secret: string;
  description: string | null;
  applicationId: string;
  application?: { name: string } | null;
  createdAt: string;
}

interface ClientRow {
  id: string;
  clientId: string;
  secret: string;
  application: string;
  description: string;
  created: string;
}
const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});

function isPaginated(res: unknown): res is PaginatedResponse<any> {
  return !!res && typeof res === 'object' && 'meta' in res && Array.isArray((res as any).data);
}

@Component({
  selector: 'app-application-client-list',
  imports: [PageHeader, FormField, RouterLink],
  templateUrl: './application-client-list.html',
  styleUrl: './application-client-list.css',
})
export class ApplicationClientList {
  private readonly service = inject(ApplicationClientService);

  /** `value` is the field the keyword is searched in; "" searches all text fields. */
  protected readonly filterOptions = [
    { label: 'All fields', value: '' },
    { label: 'Client ID', value: 'clientId' },
    { label: 'Description', value: 'description' },
  ];
  protected readonly pageSizes = [10, 25, 50, 100];

  private readonly filterModel = signal({ search: '', filter: '' });
  protected readonly filters = form(this.filterModel);

  private readonly applied = signal({ keyword: '', filter: '' });
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  private readonly reloadTick = signal(0);

  protected readonly rows = signal<ClientRow[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  protected readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
  protected readonly canPrev = computed(() => this.page() > 1 && !this.loading());
  protected readonly canNext = computed(() => this.page() < this.totalPages() && !this.loading());
  protected readonly isFiltered = computed(() => !!this.applied().keyword);

  constructor() {
    // Debounce the search box and field selector; go back to page 1 when they change
    toObservable(
      computed(() => {
        const f = this.filterModel();
        return { keyword: f.search.trim(), filter: f.filter };
      }),
    )
      .pipe(
        debounceTime(350),
        distinctUntilChanged((a, b) => a.keyword === b.keyword && a.filter === b.filter),
        takeUntilDestroyed(),
      )
      .subscribe((f) => {
        const cur = this.applied();
        if (f.keyword === cur.keyword && f.filter === cur.filter) return;
        this.applied.set(f);
        this.page.set(1);
      });

    // One request pipeline: any change to filters, page, page size or reload re-runs it
    const request = computed(() => ({
      ...this.applied(),
      page: this.page(),
      pageSize: this.pageSize(),
      tick: this.reloadTick(),
    }));

    toObservable(request)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((q) => {
          const payload: SearchPayload = {
            page: q.page,
            pageSize: q.pageSize,
            keyword: q.keyword,
            filter: q.filter,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          };
          return this.service.search(payload).pipe(
            catchError((err) => {
              console.error('Error fetching application clients:', err);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.handleSearchResult(res));
  }

  private handleSearchResult(res: PaginatedResponse<any> | ErrorResponse | null): void {
    this.loading.set(false);

    if (!isPaginated(res)) {
      this.rows.set([]);
      this.total.set(0);
      this.error.set(
        (res as { message?: string } | null)?.message ?? 'Could not load application clients.',
      );
      return;
    }

    const items = (res.data ?? []) as ApplicationClientItem[];
    const total = res.meta?.total ?? items.length;
    this.total.set(total);

    // Records were removed while the user was on a later page: jump to the last valid page
    if (items.length === 0 && total > 0 && this.page() > 1) {
      this.page.set(Math.max(1, Math.ceil(total / this.pageSize())));
      return;
    }

    this.rows.set(
      items.map((c) => ({
        id: c.id,
        clientId: c.clientId,
        secret: c.secret,
        application: c.application?.name ?? c.applicationId,
        description: c.description || '—',
        created: c.createdAt ? dateFmt.format(new Date(c.createdAt)) : '—',
      })),
    );
  }

  protected prev(): void {
    if (this.canPrev()) this.page.update((p) => p - 1);
  }
  protected next(): void {
    if (this.canNext()) this.page.update((p) => p + 1);
  }
  protected setPageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }
  protected reload(): void {
    this.reloadTick.update((t) => t + 1);
  }
  protected clearSearch(): void {
    this.filterModel.set({ search: '', filter: '' });
  }
}
