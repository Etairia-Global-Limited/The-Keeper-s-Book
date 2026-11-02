import { Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormField, form } from "@angular/forms/signals";
import { catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from "rxjs";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { AuditTrailService } from "../../services/audit-trail/audit-trail-service";
// adjust these import paths to where your models live
import { DownloadedFile, ErrorResponse, PaginatedResponse } from "../../constants/response.model";
import { DownloadPayload, SearchPayload } from "../../constants/model";

type ExportFormat = "csv" | "xlsx" | "pdf" | "docx";

interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  target: string | null;
  actionStatus: string;
  actionDate: string;
}

interface AuditRow {
  id: string;
  time: string;
  actor: string;
  action: string;
  entity: string;
  result: "Success" | "Failed";
}

const MIME: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Lagos",
}); // 16 Oct, 10:05

function isPaginated(res: unknown): res is PaginatedResponse<any> {
  return !!res && typeof res === "object" && "meta" in res && Array.isArray((res as any).data);
}

@Component({
  selector: "app-audit-log",
  imports: [FormField, PageHeader, StatusBadge],
  templateUrl: "./audit-log.html",
})
export class AuditLog {
  private readonly service = inject(AuditTrailService);
  private readonly destroyRef = inject(DestroyRef);

  /** `value` is the AuditLog field the keyword is searched in; "" searches all text fields. */
  protected readonly filterOptions = [
    { label: "All fields", value: "" },
    { label: "Action", value: "action" },
    { label: "Actor", value: "actor" },
    { label: "Target", value: "target" },
    { label: "Status", value: "actionStatus" },
  ];
  protected readonly pageSizes = [10, 25, 50, 100];

  // Form (bound to the inputs)
  private readonly filterModel = signal({ search: "", filter: "" });
  protected readonly filters = form(this.filterModel);

  // Query state
  private readonly applied = signal({ keyword: "", filter: "" }); // debounced copy of the form
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  private readonly reloadTick = signal(0);

  // Result state
  protected readonly rows = signal<AuditRow[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly exporting = signal(false);
  protected readonly exportError = signal<string | null>(null);

  // Derived
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
  protected readonly canPrev = computed(() => this.page() > 1 && !this.loading());
  protected readonly canNext = computed(() => this.page() < this.totalPages() && !this.loading());
  protected readonly isFiltered = computed(() => !!this.applied().keyword);

  constructor() {
    // 1) Debounce the search box / field selector, and go back to page 1 when they change
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
        if (f.keyword === cur.keyword && f.filter === cur.filter) return; // skips the initial emission
        this.applied.set(f);
        this.page.set(1);
      });

    // 2) One request pipeline: any change to filters, page, page size or reload re-runs it
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
            sortBy: "actionDate",
            sortOrder: "desc",
          };
          return this.service.search(payload).pipe(
            catchError((err) => {
              console.error("Error fetching audit log:", err);
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
      this.error.set((res as { message?: string } | null)?.message ?? "Could not load the audit log.");
      return;
    }

    const items = (res.data ?? []) as AuditLogItem[];
    const total = res.meta?.total ?? items.length;
    this.total.set(total);

    // Records were removed while the user was on a later page: jump to the last valid page
    if (items.length === 0 && total > 0 && this.page() > 1) {
      this.page.set(Math.max(1, Math.ceil(total / this.pageSize())));
      return;
    }

    this.rows.set(
      items.map((a) => ({
        id: a.id,
        time: timeFmt.format(new Date(a.actionDate)),
        actor: a.actor || "Unknown",
        action: a.action,
        entity: a.target || "—",
        result: a.actionStatus?.toLowerCase() === "success" ? "Success" : "Failed",
      })),
    );
  }

  // Navigation
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
    this.filterModel.set({ search: "", filter: "" });
  }

  // Export (uses the filters currently applied to the table; ignores paging)
  protected onExportSelect(event: Event): void {
    const el = event.target as HTMLSelectElement;
    const format = el.value as ExportFormat;
    el.value = ""; // reset so the same format can be chosen again
    if (format) this.download(format);
  }

protected download(format: ExportFormat = "csv"): void {
  if (this.exporting()) return;
  this.exporting.set(true);
  this.exportError.set(null);

  const { keyword, filter } = this.applied();
  const payload: DownloadPayload = {
    keyword,
    filter,
    sortBy: "actionDate",
    sortOrder: "desc",
    format,
    page: 1,
    pageSize: Number(this.pageSize()),
  };

  this.service
    .export(payload)
    .pipe(
      finalize(() => this.exporting.set(false)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (file) => {
        if (!file?.__file || !file.data) {
          this.exportError.set("Export failed.");
          return;
        }
        this.saveFile(file, format);
      },
      error: (err) => {
        console.error("Error exporting audit log:", err);
        // The proxy forwards the backend's error body unencrypted
        this.exportError.set(err?.error?.message ?? "Export failed. Please try again.");
      },
    });
}

private saveFile(file: DownloadedFile, format: ExportFormat): void {
  const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: file.type || MIME[format] }));
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || `audit-log-${new Date().toISOString().slice(0, 10)}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
}