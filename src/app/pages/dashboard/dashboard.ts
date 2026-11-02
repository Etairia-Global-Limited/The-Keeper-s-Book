import { Component, DestroyRef, computed, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { catchError, finalize, of } from "rxjs";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { PageLoader } from "../../shared/page-loader";
import { AuditTrailService } from "../../services/audit-trail/audit-trail-service";
import { AuditActivity, SignInDay } from "../../constants/model";

@Component({
  selector: "app-dashboard",
  imports: [RouterLink, PageHeader, StatusBadge, PageLoader],
  templateUrl: "./dashboard.html",
})
export class Dashboard implements OnInit {
  private readonly service = inject(AuditTrailService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly numberFmt = new Intl.NumberFormat("en-US");

  // State
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly applications = signal(0);
  readonly activeUsers = signal(0);
  readonly clients = signal(0);
  readonly failedSignIns24h = signal(0);
  readonly signInChart = signal<SignInDay[]>([]);
  readonly recentActivities = signal<AuditActivity[]>([]);

  // Derived view models (the template reads these)
  protected readonly kpis = computed(() => [
    { label: "Applications", value: this.numberFmt.format(this.applications()) },
    { label: "Active users", value: this.numberFmt.format(this.activeUsers()) },
    { label: "Clients", value: this.numberFmt.format(this.clients()) },
    { label: "Failed sign-ins (24h)", value: this.numberFmt.format(this.failedSignIns24h()) },
  ]);

  /** Heights in % of the busiest day; `dim` marks weekends. */
  protected readonly bars = computed(() => {
    const days = this.signInChart();
    const max = Math.max(...days.map((d) => d.total), 0);
    return days.map((d) => {
      const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay(); // 0 = Sun, 6 = Sat
      return {
        h: max === 0 ? 0 : Math.max(4, Math.round((d.total / max) * 100)), // 4% floor so a quiet day stays visible
        dim: dow === 0 || dow === 6,
        label: d.date,
        total: d.total,
        failed: d.failed,
      };
    });
  });

  protected readonly events = computed(() =>
    this.recentActivities().map((a) => ({
      actor: a.actor || "Unknown",
      action: a.action,
      result: this.toResult(a.actionStatus),
    })),
  );

  ngOnInit(): void {
    this.getDashboardData();
  }

  getDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getDashboardData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          console.error("Error fetching dashboard data:", err);
          this.error.set("Could not load dashboard data.");
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (!response || !("data" in response) || !response.data) {
          if (response) this.error.set("Unexpected response from the server.");
          return;
        }
        const d = response.data;
        this.applications.set(d.application ?? 0);
        this.activeUsers.set(d.user ?? 0);
        this.clients.set(d.owner ?? 0);
        this.failedSignIns24h.set(d.failedLogin24h ?? 0);
        this.signInChart.set(d.signInChart ?? []);
        this.recentActivities.set(d.recentActivities ?? []);
      });
  }

  /** Map your ActionStatus enum to the labels StatusBadge already expects. */
  private toResult(status: string): "Success" | "Failed" {
    return status?.toLowerCase() === "success" ? "Success" : "Failed";
  }
}