import { Component, computed, DestroyRef, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form, required } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { KycService } from "../../services/kyc/kyc-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError } from "rxjs";
import { isApiResponse, toErrorResponse } from "../../constants/schema";

type KycStatus = "Approved" | "Pending" | "Rejected" | "Resubmit";

interface KycDocument {
  title: string;
  category: string;
  submitted: string;
  file: string;
  status: KycStatus;
  details: { label: string; value: string }[];
}

@Component({
  selector: "app-user-kyc",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./user-kyc.html",
})
export class UserKyc {
  /** The :id route param (needs withComponentInputBinding()). */
  readonly id = input<string>();
  private service = inject(KycService);
  private destroyRef = inject(DestroyRef)

  // TODO: replace with the user + documents from your API
  protected readonly user = { name: "Amara Okafor", email: "amara@alpha.com", client: "Alpha Holdings" };

  protected readonly docs = signal<KycDocument[]>([]);

  protected readonly selected = signal(0);
  protected readonly current = computed(() => this.docs()[this.selected()]);

        ngOnInit(): void {
  const id = this.id();
  if ( id) {
    this.loadOwner(id);
  }
}

  private loadOwner(id: string) {
    this.service.getUserReview(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(toErrorResponse),
      )
      .subscribe((response) => {
        if (isApiResponse(response)) {
          // adjust to your response shape
          const app = (response as any).data;
          console.log('App: ', app)
    //       this.model.set({
    //         applicationId: app.applicationId,
    // userId: app.userId,
    // roleId: app.roleId,
    // countryCode: app.countryCode,
    //       });
          
        }
      });
  }

  protected readonly overall = computed(() => {
    const s = this.docs().map((d) => d.status);
    if (s.every((x) => x === "Approved")) return "Verified";
    if (s.some((x) => x === "Rejected" || x === "Resubmit")) return "Action needed";
    return "In review";
  });

  private readonly rejecting = signal(false);

  private readonly reviewModel = signal({ imageClear: false, nameMatches: false, notExpired: false, note: "" });

  protected readonly review = form(this.reviewModel, (p) => {
    required(p.note, { message: "A reason is required when rejecting.", when: () => this.rejecting() });
  });

  protected pick(index: number) {
    this.selected.set(index);
    this.rejecting.set(false);
    this.reviewModel.set({ imageClear: false, nameMatches: false, notExpired: false, note: "" });
  }

  protected approve() {
    this.setStatus("Approved");
  }
  protected requestReupload() {
    this.setStatus("Resubmit");
  }

  protected reject() {
    this.rejecting.set(true);
    this.review.note().markAsTouched();
    if (this.review.note().invalid()) return;
    this.setStatus("Rejected");
  }

  private setStatus(status: KycStatus) {
    this.docs.update((list) => list.map((d, i) => (i === this.selected() ? { ...d, status } : d)));
    // TODO: persist with your service (status + this.reviewModel())
  }
}
