import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

@Component({
  selector: "app-dashboard",
  imports: [RouterLink, PageHeader, StatusBadge],
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  // TODO: replace the sample data below with your API data
  protected readonly kpis = [
    { label: "Applications", value: "12" },
    { label: "Active users", value: "3,482" },
    { label: "Clients", value: "28" },
    { label: "Failed sign-ins (24h)", value: "17" },
  ];

  /** Heights in %, `dim` for the weekend bars. */
  protected readonly bars = [55, 70, 62, 88, 76, 40, 34].map((h, i) => ({ h, dim: i > 4 }));

  protected readonly events = [
    { actor: "Daniel Adeyemi", action: "signed in", result: "Success" },
    { actor: "Chioma Nwosu", action: "changed a role", result: "Success" },
    { actor: "Unknown", action: "sign-in attempt", result: "Failed" },
    { actor: "Chioma Nwosu", action: "revoked access", result: "Success" },
    { actor: "Tunde Bello", action: "created a user", result: "Success" },
  ];
}
