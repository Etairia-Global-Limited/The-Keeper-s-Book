import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form, required } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

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

  // TODO: replace with the user + documents from your API
  protected readonly user = { name: "Amara Okafor", email: "amara@alpha.com", client: "Alpha Holdings" };

  protected readonly docs = signal<KycDocument[]>([
    {
      title: "National ID card",
      category: "Identity",
      submitted: "14 Oct 2026",
      file: "national-id-front.jpg",
      status: "Approved",
      details: [
        { label: "Country", value: "Nigeria" },
        { label: "Document no.", value: "•••• 4821" },
        { label: "Expires", value: "12 Aug 2029" },
        { label: "Date of birth", value: "04 May 1990" },
      ],
    },
    {
      title: "Proof of address",
      category: "Address",
      submitted: "14 Oct 2026",
      file: "utility-bill-sep-2026.pdf",
      status: "Pending",
      details: [
        { label: "Country", value: "Nigeria" },
        { label: "Document type", value: "Utility bill" },
        { label: "Issued", value: "Sep 2026" },
        { label: "Address", value: "Lagos" },
      ],
    },
    {
      title: "Selfie with ID",
      category: "Identity",
      submitted: "15 Oct 2026",
      file: "selfie-with-id.jpg",
      status: "Pending",
      details: [
        { label: "Country", value: "Nigeria" },
        { label: "Captured", value: "15 Oct 2026" },
        { label: "Device", value: "Mobile" },
        { label: "Face match", value: "Pending review" },
      ],
    },
  ]);

  protected readonly selected = signal(0);
  protected readonly current = computed(() => this.docs()[this.selected()]);

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
