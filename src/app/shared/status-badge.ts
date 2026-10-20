import { Component, computed, input } from "@angular/core";

type Tone = "ok" | "er" | "wa" | "nu";

const TONES: Record<string, Tone> = {
  Active: "ok",
  Success: "ok",
  Approved: "ok",
  Verified: "ok",
  Failed: "er",
  Suspended: "er",
  Rejected: "er",
  "Action needed": "er",
  Pending: "wa",
  Resubmit: "wa",
  "In review": "wa",
};

@Component({
  selector: "app-status-badge",
  templateUrl: "./status-badge.html",
})
export class StatusBadge {
  readonly status = input.required<string>();
  protected readonly tone = computed<Tone>(() => TONES[this.status()] ?? "nu");
}
